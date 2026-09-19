import { spawn } from 'node:child_process'
import { campusKnowledgeBase, retrieveCampusKnowledge, type KnowledgeDocument } from '../src/data/knowledge-base.js'

type ChatMessage = { role: 'user' | 'assistant'; content: string }
type ChromaDocument = KnowledgeDocument & { distance?: number }
type RagState = {
  question: string
  history: ChatMessage[]
  apiKey?: string
  documents: ChromaDocument[]
  context: string
  answer: string
  provider: 'groq' | 'local'
}

type RagNode = (state: RagState) => Promise<RagState>
type RagNodeName = 'retrieve' | 'ground' | 'answer'
const campusLangGraph: Record<RagNodeName, RagNode> = { retrieve: retrieveNode, ground: groundNode, answer: answerNode }
const graphEdges: Record<RagNodeName, RagNodeName | null> = { retrieve: 'ground', ground: 'answer', answer: null }

export async function runCampusRag(input: { question: string; history?: ChatMessage[]; apiKey?: string }) {
  let state: RagState = {
    question: input.question.trim(),
    history: (input.history || []).slice(-6),
    apiKey: input.apiKey,
    documents: [],
    context: '',
    answer: '',
    provider: 'local',
  }
  let node: RagNodeName | null = 'retrieve'; while (node) { state = await campusLangGraph[node](state); node = graphEdges[node] }
  return { answer: state.answer, sources: uniqueDocuments(state.documents).slice(0, 3), provider: state.provider }
}

async function retrieveNode(state: RagState): Promise<RagState> {
  const normalized = state.question.toLowerCase()
  const preferredIds = /\b(address|location|map|where)\b/.test(normalized) ? ['gist-contact', 'gist-campus'] : /\b(contact|email|phone|call)\b/.test(normalized) ? ['gist-contact'] : /\b(result portal|portal|gisteb|webpros)\b/.test(normalized) ? ['gist-results-portal', 'gist-exams'] : /\b(programmes?|program|branch|department)\b/.test(normalized) ? ['gist-programmes'] : []
  const byId = new Map(campusKnowledgeBase.map((document) => [document.id, document]))
  const preferred = preferredIds.map((id) => byId.get(id)).filter(Boolean) as ChromaDocument[]
  const chromaDocuments = preferredIds.length ? [] : (/gist|exam|result|timetable|notice|circular|programme|program|autonomous|aicte|jntua|campus|location|address/.test(normalized) ? await queryChroma(state.question) : [])
  const documents = uniqueDocuments(preferredIds.length ? preferred : (chromaDocuments.length ? chromaDocuments : retrieveCampusKnowledge(state.question)))
  return { ...state, documents: documents.slice(0, 5) }
}

async function groundNode(state: RagState): Promise<RagState> {
  const byId = new Map(campusKnowledgeBase.map((document) => [document.id, document]))
  const expanded = [...state.documents]
  const add = (id: string) => {
    const document = byId.get(id)
    if (document && !expanded.some((item) => item.id === id)) expanded.push(document)
  }
  for (const document of state.documents) {
    if (document.id.includes('results') || document.id.includes('timetable') || document.id.includes('notice') || document.id.includes('circular') || document.id === 'gist-exams') {
      add('gist-exams')
      add('gist-home')
      add('gist-results-portal')
    }
    if (document.id === 'gist-programmes') add('gist-home')
    if (document.id === 'gist-contact') add('gist-campus')
  }
  const normalized = state.question.toLowerCase()
  const intentIds = /\b(address|location|map|where)\b/.test(normalized) ? new Set(['gist-contact', 'gist-campus']) : /\b(programmes?|program|branch|department)\b/.test(normalized) ? new Set(['gist-programmes', 'gist-home']) : /\b(contact|email|phone|call)\b/.test(normalized) ? new Set(['gist-contact']) : null
  const documents = uniqueDocuments(intentIds ? expanded.filter((document) => intentIds.has(document.id)) : expanded).slice(0, 5)
  const context = documents.map((document, index) => '[' + (index + 1) + '] ' + document.title + '\n' + document.content + '\nSource: ' + document.sourceUrl).join('\n\n')
  return { ...state, documents, context }
}

async function answerNode(state: RagState): Promise<RagState> {
  if (!state.apiKey) return { ...state, answer: localAnswer(state.question, state.documents) }
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', { signal: AbortSignal.timeout(7000),
      method: 'POST',
      headers: { Authorization: 'Bearer ' + state.apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        temperature: 0.15,
        messages: [
          {
            role: 'system',
            content: 'You are CampusOS, a grounded campus intelligence assistant for Geethanjali Institute of Science and Technology. Answer only from the supplied context and conversation. Never invent official facts, dates, links, policies, or student records. If context is insufficient, say so clearly. Give one concise, direct answer with no preamble or filler. Do not repeat source metadata; cite at most one relevant source number like [1].',
          },
          ...state.history,
          { role: 'user', content: 'Grounded campus context:\n' + (state.context || 'No matching verified context.') + '\n\nQuestion: ' + state.question },
        ],
      }),
    })
    if (!response.ok) throw new Error('Groq ' + response.status)
    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> }
    return { ...state, answer: data.choices?.[0]?.message?.content || localAnswer(state.question, state.documents), provider: 'groq' }
  } catch {
    return { ...state, answer: localAnswer(state.question, state.documents) }
  }
}

async function queryChroma(question: string): Promise<ChromaDocument[]> {
  if (!question) return []
  const executable = process.platform === 'win32' ? 'py' : 'python3'
  const args = process.platform === 'win32' ? ['-3', 'server/chroma_query.py'] : ['server/chroma_query.py']
  return new Promise((resolve) => {
    const child = spawn(executable, args, { cwd: process.cwd(), stdio: ['pipe', 'pipe', 'ignore'] })
    let output = ''
    const timeout = setTimeout(() => { child.kill(); resolve([]) }, 3500)
    child.stdout.on('data', (chunk) => { output += chunk.toString() })
    child.on('error', () => { clearTimeout(timeout); resolve([]) })
    child.on('close', () => {
      clearTimeout(timeout)
      try {
        const parsed = JSON.parse(output) as { documents?: ChromaDocument[] }
        resolve(parsed.documents || [])
      } catch {
        resolve([])
      }
    })
    child.stdin.write(JSON.stringify({ question, documents: campusKnowledgeBase }))
    child.stdin.end()
  })
}

function localAnswer(question: string, documents: KnowledgeDocument[]) {
  const normalized = question.toLowerCase()
  if (/\b(hi|hello|hey)\b/.test(normalized)) return 'Hi Priya — I can help with GIST programmes, examination results, timetables, campus information, attendance, courses, and opportunities.'
  if (/(attendance|absen|present)/.test(normalized)) return 'Your overall attendance is 86.4%. Machine Learning is at 91%, Distributed Systems is at 84%, and Product Design Studio is at 88%. Attend the next two Distributed Systems sessions to keep a healthy buffer.'
  if (/(result.*portal|portal.*result|gisteb|webpros)/.test(normalized)) return 'The official GIST Examination Section links external results through https://gisteb.com and the CMS marks portal at http://webprosindia.com/gist/. CampusOS cannot retrieve private marks without the official hall-ticket lookup.'
  if (/(address|location|map|where)/.test(normalized)) return 'GIST campus: 3rd Mile, Nellore-Bombay Highway, Gangavaram (V), Kovur (M), S.P.S.R Nellore District, Andhra Pradesh 524137.'
  if (/(contact|email|phone|call)/.test(normalized)) return 'Official contact: principal@gist.edu.in · 9912566220 / 9912445846.'
  if (/(result|exam|timetable|notification|circular|recount|valuation)/.test(normalized) && documents.length) return 'Latest verified GIST examination update: ' + documents[0].content
  if (/(programmes?|program|branch|department)/.test(normalized)) return 'GIST offers B.Tech programmes in CSE, CSE (AI & ML), AI & Data Science, ECE, EEE, Mechanical, and Civil, plus M.Tech and Diploma programmes.'
  if (/(autonomous|accredit|aicte|jntua)/.test(normalized)) return 'GIST is autonomous, approved by AICTE, affiliated with JNTUA, NAAC A Grade accredited, and NBA accredited for ECE, EEE, and Mechanical.'
  if (documents.length) return 'Verified GIST source: ' + documents[0].content
  return 'I do not have enough verified campus context to answer that yet. Try asking about GIST examinations, programmes, attendance, courses, complaints, or opportunities.'
}
function uniqueDocuments(documents: ChromaDocument[]) {
  return [...new Map(documents.map((document) => [document.sourceUrl, document])).values()]
}
