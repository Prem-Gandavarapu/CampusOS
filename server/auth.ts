import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { IncomingMessage, ServerResponse } from 'node:http'
import pg from 'pg'

const { Pool } = pg
export type Role = 'admin' | 'student'
export type AuthUser = { id: string; email: string; fullName: string; role: Role }
type TokenPayload = { sub: string; role: Role; email: string; fullName: string }
let pool: pg.Pool | null = null

function getPool() {
  if (pool) return pool
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL is not configured')
  pool = new Pool({ connectionString, ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined })
  return pool
}

function jwtSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret || secret.length < 32) throw new Error('JWT_SECRET must be configured with at least 32 characters')
  return secret
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

async function readJson(req: IncomingMessage) {
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    size += buffer.length
    if (size > 1_000_000) throw new Error('Request body is too large')
    chunks.push(buffer)
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}') as Record<string, unknown>
}

function cookies(req: IncomingMessage) {
  return Object.fromEntries((req.headers.cookie || '').split(';').filter(Boolean).map((part) => {
    const index = part.indexOf('=')
    return [part.slice(0, index).trim(), decodeURIComponent(part.slice(index + 1).trim())]
  }))
}

function sessionCookie(token: string) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  return 'campusos_session=' + encodeURIComponent(token) + '; HttpOnly; Path=/; SameSite=Lax; Max-Age=604800' + secure
}

function clearSessionCookie() {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  return 'campusos_session=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0' + secure
}

function publicUser(row: { id: string; email: string; full_name: string; role: Role }): AuthUser {
  return { id: row.id, email: row.email, fullName: row.full_name, role: row.role }
}

async function currentUser(req: IncomingMessage): Promise<AuthUser | null> {
  const token = cookies(req).campusos_session
  if (!token) return null
  try {
    const payload = jwt.verify(token, jwtSecret()) as TokenPayload
    const result = await getPool().query<{ id: string; email: string; full_name: string; role: Role }>('select id, email, full_name, role from users where id = $1', [payload.sub])
    return result.rows[0] ? publicUser(result.rows[0]) : null
  } catch {
    return null
  }
}

async function requireAdmin(req: IncomingMessage) {
  const user = await currentUser(req)
  return user?.role === 'admin' ? user : null
}

export async function handleAuthRequest(req: IncomingMessage, res: ServerResponse) {
  const pathname = new URL(req.url || '/', 'http://localhost').pathname
  try {
    if (pathname === '/api/auth/login' && req.method === 'POST') {
      const body = await readJson(req)
      const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
      const password = typeof body.password === 'string' ? body.password : ''
      if (!email || !password) return sendJson(res, 400, { error: 'Email and password are required.' })
      const result = await getPool().query<{ id: string; email: string; full_name: string; role: Role; password_hash: string }>('select id, email, full_name, role, password_hash from users where email = $1', [email])
      const row = result.rows[0]
      if (!row || !(await bcrypt.compare(password, row.password_hash))) return sendJson(res, 401, { error: 'Invalid email or password.' })
      const user = publicUser(row)
      const token = jwt.sign({ sub: user.id, role: user.role, email: user.email, fullName: user.fullName } satisfies TokenPayload, jwtSecret(), { expiresIn: '7d' })
      res.setHeader('Set-Cookie', sessionCookie(token))
      return sendJson(res, 200, { user })
    }

    if (pathname === '/api/auth/logout' && req.method === 'POST') {
      res.setHeader('Set-Cookie', clearSessionCookie())
      return sendJson(res, 200, { ok: true })
    }

    if (pathname === '/api/auth/me' && req.method === 'GET') {
      const user = await currentUser(req)
      return user ? sendJson(res, 200, { user }) : sendJson(res, 401, { error: 'Not authenticated.' })
    }

    if (pathname === '/api/admin/students' && req.method === 'GET') {
      if (!await requireAdmin(req)) return sendJson(res, 403, { error: 'Administrator access required.' })
      const result = await getPool().query('select u.id, u.email, u.full_name as "fullName", s.roll_number as "rollNumber", s.department, s.year_of_study as "yearOfStudy", u.created_at as "createdAt" from users u join students s on s.user_id = u.id where u.role = $1 order by u.created_at desc', ['student'])
      return sendJson(res, 200, { students: result.rows })
    }

    if (pathname === '/api/admin/students' && req.method === 'POST') {
      if (!await requireAdmin(req)) return sendJson(res, 403, { error: 'Administrator access required.' })
      const body = await readJson(req)
      const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : ''
      const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
      const password = typeof body.password === 'string' ? body.password : ''
      const rollNumber = typeof body.rollNumber === 'string' ? body.rollNumber.trim() : ''
      const department = typeof body.department === 'string' && body.department.trim() ? body.department.trim() : 'Computer Science and Engineering'
      const yearOfStudy = Number(body.yearOfStudy || 1)
      if (!fullName || !email || !rollNumber || password.length < 8 || !Number.isInteger(yearOfStudy) || yearOfStudy < 1 || yearOfStudy > 6) return sendJson(res, 400, { error: 'Name, email, roll number, valid year, and an 8+ character password are required.' })
      const client = await getPool().connect()
      try {
        await client.query('begin')
        const passwordHash = await bcrypt.hash(password, 12)
        const userResult = await client.query<{ id: string; email: string; full_name: string; role: Role }>('insert into users (email, password_hash, full_name, role) values ($1, $2, $3, $4) returning id, email, full_name, role', [email, passwordHash, fullName, 'student'])
        const user = userResult.rows[0]
        await client.query('insert into students (user_id, roll_number, department, year_of_study) values ($1, $2, $3, $4)', [user.id, rollNumber, department, yearOfStudy])
        await client.query('commit')
        return sendJson(res, 201, { student: { ...publicUser(user), rollNumber, department, yearOfStudy } })
      } catch (error) {
        await client.query('rollback')
        const message = error instanceof Error && 'code' in error && (error as { code?: string }).code === '23505' ? 'Email or roll number already exists.' : 'Could not create student.'
        return sendJson(res, 400, { error: message })
      } finally {
        client.release()
      }
    }

    const studentMatch = pathname.match(/^\/api\/admin\/students\/([0-9a-f-]+)$/i)
    if (studentMatch && req.method === 'DELETE') {
      if (!await requireAdmin(req)) return sendJson(res, 403, { error: 'Administrator access required.' })
      const result = await getPool().query('delete from users where id = $1 and role = $2 returning id', [studentMatch[1], 'student'])
      return result.rowCount ? sendJson(res, 200, { ok: true }) : sendJson(res, 404, { error: 'Student not found.' })
    }

    return false
  } catch (error) {
    return sendJson(res, 503, { error: error instanceof Error ? error.message : 'Database service unavailable.' })
  }
}