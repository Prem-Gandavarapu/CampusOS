import type { IncomingMessage, ServerResponse } from 'node:http'
import { runCampusRag } from '../server/campus-rag.js'
import { handleAuthRequest } from '../server/auth.js'

type VercelRequest = IncomingMessage & { body?: unknown }

type ChatBody = {
  message?: string
  question?: string
  history?: Array<{ role: 'user' | 'assistant'; content: string }>
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

async function readBody(req: VercelRequest) {
  if (req.body && typeof req.body === 'object') return req.body as ChatBody
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}') as ChatBody
}

export default async function handler(req: VercelRequest, res: ServerResponse) {
  try {
    const pathname = new URL(req.url || '/', 'http://localhost').pathname
    if (pathname.startsWith('/api/auth/') || pathname.startsWith('/api/admin/')) {
      const handled = await handleAuthRequest(req, res)
      if (handled !== false) return
    }

    if (pathname === '/api/chat' && req.method === 'POST') {
      const body = await readBody(req)
      const question = body.message || body.question || ''
      const result = await runCampusRag({ question, history: body.history, apiKey: process.env.GROQ_API_KEY })
      return sendJson(res, 200, result)
    }

    return sendJson(res, 404, { error: 'API route not found.' })
  } catch (error) {
    return sendJson(res, 503, { error: error instanceof Error ? error.message : 'CampusOS service unavailable.' })
  }
}