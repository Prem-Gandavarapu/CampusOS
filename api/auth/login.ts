import type { IncomingMessage, ServerResponse } from 'node:http'
import { handleAuthRequest } from '../../server/auth.js'
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const handled = await handleAuthRequest(req, res)
  if (handled === false) { res.statusCode = 404; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ error: 'API route not found.' })) }
}
