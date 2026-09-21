import path from 'node:path'
import fs from 'node:fs'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'
import { ensureTables } from './tables'
import { ensureSeed, ensureStaffing, ensureEisIdentity, ensureTermReports, ensureWeekTimetable, ensureBehaviour } from './seed'

const defaultPath = path.join(process.cwd(), 'data', 'eis.db')
const dbPath = process.env.DATABASE_URL?.replace(/^file:/, '') || defaultPath

fs.mkdirSync(path.dirname(dbPath), { recursive: true })

export const sqlite = new Database(dbPath)
sqlite.pragma('journal_mode = WAL')
sqlite.pragma('foreign_keys = ON')
ensureTables(sqlite)

export const db = drizzle(sqlite, { schema })

void ensureSeed()
  .then(() => ensureStaffing())
  .then(() => ensureEisIdentity())
  .then(() => ensureTermReports())
  .then(() => ensureWeekTimetable())
  .then(() => ensureBehaviour())

export type Db = typeof db
