import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv, type Plugin } from 'vite'

function groqChat(): Plugin {
  return {
    name: 'campusos-groq-chat',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url !== '/api/chat' || req.method !== 'POST') return next()
        const chunks: Uint8Array[] = []
        for await (const chunk of req) chunks.push(typeof chunk === 'string' ? new TextEncoder().encode(chunk) : chunk)
        const body = JSON.parse(new TextDecoder().decode(Buffer.concat(chunks))) as { message?: string; question?: string; retrievedContext?: string; history?: unknown[] }
        const message = body.message || body.question || ''
        const apiKey = process.env.GROQ_API_KEY
        if (!apiKey) { res.statusCode = 503; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ error: 'GROQ_API_KEY is not configured' })); return }
        const system = 'You are CampusOS, the AI assistant for Geethanjali Institute of Science and Technology. Answer institution-specific questions using ONLY the supplied retrieved context. Never invent official information. If the context does not contain the answer, clearly say the available campus knowledge does not contain that information. Be concise and useful.'
        try {
          const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'openai/gpt-oss-20b', temperature: .2, messages: [{ role: 'system', content: system }, ...(body.history || []).slice(-6), { role: 'user', content: `Retrieved campus context:\n${body.retrievedContext || 'No matching context found.'}\n\nQuestion: ${message}` }] }) })
          if (!groqResponse.ok) throw new Error(`Groq ${groqResponse.status}`)
          const data = await groqResponse.json() as { choices?: Array<{ message?: { content?: string } }> }
          res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ answer: data.choices?.[0]?.message?.content || 'Campus knowledge unavailable.' }))
        } catch { res.statusCode = 502; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ error: 'Campus AI is temporarily unavailable.' })) }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  Object.assign(process.env, env)
  return { plugins: [react(), tailwindcss(), groqChat()] }
})
