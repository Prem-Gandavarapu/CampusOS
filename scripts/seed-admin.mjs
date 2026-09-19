import bcrypt from 'bcryptjs'
import pg from 'pg'

const { Pool } = pg
const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME = 'CampusOS Administrator' } = process.env
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required')
if (ADMIN_PASSWORD.length < 8) throw new Error('ADMIN_PASSWORD must be at least 8 characters')
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined })
const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12)
await pool.query(
  'insert into users (email, password_hash, full_name, role) values ($1, $2, $3, $4) on conflict (email) do update set password_hash = excluded.password_hash, full_name = excluded.full_name, role = excluded.role',
  [ADMIN_EMAIL.toLowerCase().trim(), passwordHash, ADMIN_NAME.trim(), 'admin'],
)
await pool.end()
console.log('Admin account ready: ' + ADMIN_EMAIL.toLowerCase().trim())