import { readFile } from 'node:fs/promises'
import pg from 'pg'

const { Pool } = pg
const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('DATABASE_URL is required')
const pool = new Pool({ connectionString, ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined })
try {
  await pool.query(await readFile(new URL('../server/schema.sql', import.meta.url), 'utf8'))
  console.log('CampusOS database migrated.')
} finally {
  await pool.end()
}