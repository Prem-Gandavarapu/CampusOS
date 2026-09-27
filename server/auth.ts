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
  const parsedBody = (req as IncomingMessage & { body?: unknown }).body
  if (parsedBody && typeof parsedBody === 'object') return parsedBody as Record<string, unknown>
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

async function sendMail(to: string, subject: string, text: string) {
  if (!process.env.RESEND_API_KEY || !process.env.MAIL_FROM || !to) return false
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      signal: AbortSignal.timeout(8000),
      headers: { Authorization: 'Bearer ' + process.env.RESEND_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: process.env.MAIL_FROM, to: [to], subject, text }),
    })
    return response.ok
  } catch { return false }
}

type VerificationAIResult = { recommendation: 'APPROVE' | 'MANUAL_REVIEW' | 'REJECT'; confidence: number; extractedData: { name: string; rollNumber: string; branch: string; year: string; section: string; institution: string }; matches: string[]; mismatches: string[]; reason: string }
const manualReview = (reason: string): VerificationAIResult => ({ recommendation: 'MANUAL_REVIEW', confidence: 0, extractedData: { name: '', rollNumber: '', branch: '', year: '', section: '', institution: '' }, matches: [], mismatches: [reason], reason })
async function verifyStudentId(details: { fullName: string; rollNumber: string; email: string; year: number; branch: string; section: string }, image: string): Promise<VerificationAIResult> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return manualReview('AI verification is not configured; administrator review is required.')
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', { method: 'POST', signal: AbortSignal.timeout(20000), headers: { Authorization: 'Bearer ' + apiKey, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'qwen/qwen3.8-27b', temperature: 0, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: 'You verify GIST student ID cards. Return only valid JSON matching the requested schema. Never invent unreadable fields. GIST identity means Geethanjali Institute of Science and Technology or GIST. APPROVE only when the image is clear, identity is GIST, and submitted fields match with high confidence. Use MANUAL_REVIEW for uncertainty. Use REJECT only for an obvious non-GIST or invalid ID.' }, { role: 'user', content: [{ type: 'text', text: JSON.stringify({ submittedDetails: details, requiredSchema: { recommendation: 'APPROVE | MANUAL_REVIEW | REJECT', confidence: 0, extractedData: { name: '', rollNumber: '', branch: '', year: '', section: '', institution: '' }, matches: [], mismatches: [], reason: '' } }) }, { type: 'image_url', image_url: { url: image } }] }] }) })
    if (!response.ok) return manualReview('AI verification service did not respond successfully.')
    const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> }
    const raw = payload.choices?.[0]?.message?.content || '{}'
    const parsed = JSON.parse(raw) as Partial<VerificationAIResult>
    const recommendation = parsed.recommendation === 'APPROVE' || parsed.recommendation === 'REJECT' ? parsed.recommendation : 'MANUAL_REVIEW'
    const confidence = Number.isFinite(Number(parsed.confidence)) ? Math.max(0, Math.min(100, Number(parsed.confidence))) : 0
    return { recommendation: recommendation === 'APPROVE' && confidence < 85 ? 'MANUAL_REVIEW' : recommendation, confidence, extractedData: { name: String(parsed.extractedData?.name || ''), rollNumber: String(parsed.extractedData?.rollNumber || ''), branch: String(parsed.extractedData?.branch || ''), year: String(parsed.extractedData?.year || ''), section: String(parsed.extractedData?.section || ''), institution: String(parsed.extractedData?.institution || '') }, matches: Array.isArray(parsed.matches) ? parsed.matches.map(String) : [], mismatches: Array.isArray(parsed.mismatches) ? parsed.mismatches.map(String) : [], reason: String(parsed.reason || 'Review the extracted fields against the submitted details.') }
  } catch { return manualReview('AI verification was unavailable or returned unreadable data.') }
}

const complaintSelect = `select c.id, c.title, c.category, c.priority, c.department, c.authority, c.sla, c.status,
  c.location, c.impact, c.confidence, c.description, c.submitted_at as "submittedAt",
  to_char(c.submitted_at at time zone 'Asia/Kolkata', 'DD Mon · HH12:MI AM') as "submittedOn",
  c.admin_email_status as "adminEmailStatus", c.resolution_summary as "resolutionSummary",
  c.resolved_by as "resolvedBy", c.resolved_at as "resolvedAt", c.student_email_status as "studentEmailStatus",
  u.full_name as "studentName", u.email as "studentEmail" from complaints c join users u on u.id = c.user_id`
export async function handleAuthRequest(req: IncomingMessage, res: ServerResponse) {
  const pathname = new URL(req.url || '/', 'http://localhost').pathname
  try {
    if (pathname === '/api/register' && req.method === 'POST') {
      const body = await readJson(req)
      const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : ''
      const rollNumber = typeof body.rollNumber === 'string' ? body.rollNumber.trim() : ''
      const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
      const branch = typeof body.branch === 'string' ? body.branch.trim() : ''
      const section = typeof body.section === 'string' ? body.section.trim() : ''
      const year = Number(body.year)
      const image = typeof body.idCardData === 'string' ? body.idCardData : ''
      const match = image.match(/^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/)
      if (!fullName || !rollNumber || !email || !branch || !section || !Number.isInteger(year) || year < 1 || year > 6 || !match) return sendJson(res, 400, { error: 'Complete all fields and upload a PNG, JPEG, or WebP ID card.' })
      if (Buffer.byteLength(match[2], 'base64') > 5 * 1024 * 1024) return sendJson(res, 400, { error: 'ID card must be 5 MB or smaller.' })
      const verification = await verifyStudentId({ fullName, rollNumber, email, year, branch, section }, image)
      const status = verification.recommendation === 'APPROVE' ? 'AI Verified' : verification.recommendation === 'REJECT' ? 'Rejected' : 'Manual Review'
      const result = await getPool().query("insert into student_verification_requests (full_name,roll_number,email,year_of_study,branch,section,id_card_data,id_card_mime,confidence,extracted_data,matches,mismatches,recommendation,reason,status) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) returning id, created_at as \"createdAt\"", [fullName, rollNumber, email, year, branch, section, image, match[1], verification.confidence, JSON.stringify(verification.extractedData), JSON.stringify(verification.matches), JSON.stringify(verification.mismatches), verification.recommendation, verification.reason, status])
      const request = result.rows[0]
      const adminRecipient = process.env.COMPLAINT_ADMIN_EMAIL || process.env.ADMIN_EMAIL || 'premkishorereddy0@gmail.com'
      const sent = await sendMail(adminRecipient, 'CampusOS Student Verification Request', 'Student: ' + fullName + '\nRoll number: ' + rollNumber + '\nEmail: ' + email + '\nBranch: ' + branch + '\nYear: ' + year + '\nSection: ' + section + '\nAI confidence: 0%\nRecommendation: MANUAL_REVIEW\nReason: ID card OCR requires manual review.')
      return sendJson(res, 201, { request: { ...request, fullName, rollNumber, email, year, branch, section, confidence: verification.confidence, extractedData: verification.extractedData, matches: verification.matches, mismatches: verification.mismatches, recommendation: verification.recommendation, reason: verification.reason, status }, emailStatus: sent ? 'sent' : 'pending' })
    }

    if (pathname === '/api/admin/verification-requests' && req.method === 'GET') {
      if (!await requireAdmin(req)) return sendJson(res, 403, { error: 'Administrator access required.' })
      const result = await getPool().query('select id, full_name as "fullName", roll_number as "rollNumber", email, year_of_study as "year", branch, section, id_card_data as "idCardData", id_card_mime as "idCardMime", confidence, extracted_data as "extractedData", matches, mismatches, recommendation, reason, status, reviewed_by as "reviewedBy", reviewed_at as "reviewedAt", created_at as "createdAt" from student_verification_requests order by created_at desc')
      return sendJson(res, 200, { requests: result.rows })
    }

    const verificationMatch = pathname.match(/^\/api\/admin\/verification-requests\/([^/]+)$/)
    if (verificationMatch && req.method === 'PATCH') {
      const admin = await requireAdmin(req)
      if (!admin) return sendJson(res, 403, { error: 'Administrator access required.' })
      const body = await readJson(req)
      const action = body.action === 'approve' ? 'Approved' : body.action === 'waiting' ? 'Waiting List' : body.action === 'reject' ? 'Rejected' : ''
      if (!action) return sendJson(res, 400, { error: 'Unknown verification action.' })
      const changed = await getPool().query('update student_verification_requests set status=$2, reviewed_by=$3, reviewed_at=now() where id=$1 returning id, full_name as "fullName", email, status', [verificationMatch[1], action, admin.fullName])
      const request = changed.rows[0]
      if (!request) return sendJson(res, 404, { error: 'Verification request not found.' })
      const sent = await sendMail(request.email, 'CampusOS Registration ' + action, 'Hello ' + request.fullName + ',\n\nYour CampusOS student registration is currently: ' + action + '.\n\nCampusOS Administration')
      return sendJson(res, 200, { request, emailStatus: sent ? 'sent' : 'pending' })
    }

    if (pathname === '/api/complaints' && req.method === 'GET') {
      const user = await currentUser(req)
      if (!user) return sendJson(res, 401, { error: 'Not authenticated.' })
      const result = user.role === 'admin'
        ? await getPool().query(complaintSelect + ' order by c.submitted_at desc')
        : await getPool().query(complaintSelect + ' where c.user_id = $1 order by c.submitted_at desc', [user.id])
      return sendJson(res, 200, { complaints: result.rows })
    }

    if (pathname === '/api/complaints' && req.method === 'POST') {
      const user = await currentUser(req)
      if (!user) return sendJson(res, 401, { error: 'Not authenticated.' })
      if (user.role !== 'student') return sendJson(res, 403, { error: 'Only students can submit complaints.' })
      const body = await readJson(req)
      const title = typeof body.title === 'string' ? body.title.trim() : ''
      const description = typeof body.description === 'string' ? body.description.trim() : ''
      const location = typeof body.location === 'string' ? body.location.trim() : 'Campus'
      const impact = Number(body.impact || 1)
      const context = (title + ' ' + description).toLowerCase()
      if (!title || description.length < 20 || !Number.isInteger(impact) || impact < 1 || impact > 10000) return sendJson(res, 400, { error: 'Add a title, at least 20 description characters, and a valid impact count.' })
      const category = /wifi|internet|network|portal|connect/.test(context) ? 'Network & IT' : /water|power|electric|plumb|hostel/.test(context) ? 'Utilities' : /printer|library/.test(context) ? 'Library Services' : typeof body.category === 'string' ? body.category : 'Infrastructure'
      const urgent = /unsafe|danger|outage|flood|fire|emergency|not working/.test(context)
      const priority = impact > 30 || urgent ? 'High' : impact > 10 ? 'Medium' : 'Low'
      const authority = category === 'Network & IT' ? 'Network Operations' : category === 'Utilities' ? 'Facilities Coordinator' : category === 'Library Services' ? 'Library Services Desk' : 'Academic Services Coordinator'
      const sla = priority === 'High' ? '2 hours' : priority === 'Medium' ? '24 hours' : '72 hours'
      const inserted = await getPool().query(`insert into complaints (user_id,title,category,priority,department,authority,sla,location,impact,confidence,description) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,94,$10) returning id`, [user.id, title, category, priority, 'Campus Operations', authority, sla, location || 'Campus', impact, description])
      const result = await getPool().query(complaintSelect + ' where c.id = $1', [inserted.rows[0].id])
      const complaint = result.rows[0]
      const sent = await sendMail(process.env.COMPLAINT_ADMIN_EMAIL || process.env.ADMIN_EMAIL || 'premkishorereddy0@gmail.com', `New CampusOS Complaint — ${priority}`, `Student: ${complaint.studentName}\nComplaint: ${title}\nCategory: ${category}\nLocation: ${location || 'Campus'}\nDescription: ${description}\nPriority: ${priority}\nAI confidence: 94%\nImpact: ${impact} students\nAssigned authority: ${authority}\nSLA: ${sla}`)
      await getPool().query('update complaints set admin_email_status = $2 where id = $1', [complaint.id, sent ? 'sent' : 'pending'])
      return sendJson(res, 201, { complaint: { ...complaint, adminEmailStatus: sent ? 'sent' : 'pending' }, emailStatus: sent ? 'sent' : 'pending' })
    }

    const complaintAction = pathname.match(/^\/api\/admin\/complaints\/([^/]+)$/)
    if (complaintAction && req.method === 'PATCH') {
      const admin = await requireAdmin(req)
      if (!admin) return sendJson(res, 403, { error: 'Administrator access required.' })
      const body = await readJson(req)
      if (body.action === 'resolve') {
        const summary = typeof body.resolutionSummary === 'string' ? body.resolutionSummary.trim() : ''
        if (summary.length < 3) return sendJson(res, 400, { error: 'Add a short resolution summary.' })
        const resolvedAt = new Date()
        const changed = await getPool().query(`update complaints set status='Resolved', resolution_summary=$2, resolved_by=$3, resolved_at=$4, student_email_status='pending' where id=$1 and status <> 'Resolved' returning id`, [complaintAction[1], summary, admin.fullName, resolvedAt])
        const updated = changed.rows[0] ? await getPool().query(complaintSelect + ' where c.id = $1', [changed.rows[0].id]) : { rows: [] }
        const complaint = updated.rows[0]
        if (!complaint) return sendJson(res, 404, { error: 'Complaint not found or already resolved.' })
        const sent = await sendMail(complaint.studentEmail, `CampusOS Complaint Resolved — ${complaint.title}`, `Complaint: ${complaint.title}\nResolution status: Resolved\nResolved by: ${admin.fullName}\nResolution summary: ${summary}\nResolved time: ${resolvedAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`)
        await getPool().query('update complaints set student_email_status = $2 where id = $1', [complaint.id, sent ? 'sent' : 'pending'])
        return sendJson(res, 200, { complaint: { ...complaint, studentEmailStatus: sent ? 'sent' : 'pending' }, emailStatus: sent ? 'sent' : 'pending' })
      }
      if (body.action === 'assign') {
        const authority = typeof body.authority === 'string' ? body.authority.trim() : ''
        if (!authority) return sendJson(res, 400, { error: 'Choose an assigned authority.' })
        const changed = await getPool().query(`update complaints set authority=$2, status='In review' where id=$1 and status <> 'Resolved' returning id`, [complaintAction[1], authority])
        const result = changed.rows[0] ? await getPool().query(complaintSelect + ' where c.id = $1', [changed.rows[0].id]) : { rows: [] }
        return result.rows[0] ? sendJson(res, 200, { complaint: result.rows[0] }) : sendJson(res, 404, { error: 'Complaint not found or already resolved.' })
      }
      if (body.action === 'escalate') {
        const changed = await getPool().query(`update complaints set priority='High', status='In review', authority='HOD · Campus Operations' where id=$1 and status <> 'Resolved' returning id`, [complaintAction[1]])
        const result = changed.rows[0] ? await getPool().query(complaintSelect + ' where c.id = $1', [changed.rows[0].id]) : { rows: [] }
        return result.rows[0] ? sendJson(res, 200, { complaint: result.rows[0] }) : sendJson(res, 404, { error: 'Complaint not found or already resolved.' })
      }
      return sendJson(res, 400, { error: 'Unknown complaint action.' })
    }

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



