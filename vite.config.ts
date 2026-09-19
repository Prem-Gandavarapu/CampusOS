import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import { runCampusRag } from './server/campus-rag.js'
import { handleAuthRequest } from './server/auth.js'

function campusRagChat(): Plugin {
  return {
    name: 'campusos-rag-chat',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.startsWith('/api/auth/') || req.url?.startsWith('/api/admin/')) {
          const handled = await handleAuthRequest(req, res)
          if (handled !== false) return
        }
        if (req.url !== '/api/chat' || req.method !== 'POST') return next()
        const chunks: Uint8Array[] = []
        for await (const chunk of req) chunks.push(typeof chunk === 'string' ? new TextEncoder().encode(chunk) : chunk)
        try {
          const body = JSON.parse(new TextDecoder().decode(Buffer.concat(chunks))) as { message?: string; question?: string; history?: Array<{ role: 'user' | 'assistant'; content: string }> }
          const question = body.message || body.question || ''
          const result = await runCampusRag({ question, history: body.history, apiKey: process.env.GROQ_API_KEY })
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(result))
        } catch (error) {
          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Campus AI request failed.' }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  Object.assign(process.env, env)
  return { plugins: [react(), tailwindcss(), campusRagChat()] }
})