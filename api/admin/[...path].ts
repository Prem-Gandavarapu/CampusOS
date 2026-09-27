import type { IncomingMessage, ServerResponse } from 'node:http'
import { handleAuthRequest } from '../../server/auth.js'

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const handled = await handleAuthRequest(req, res)
    if (handled !== false) return
    res.statusCode = 404
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'API route not found.' }))
  } catch (error) {
    res.statusCode = 503
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'CampusOS service unavailable.' }))
  }
}
