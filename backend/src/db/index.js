import initSqlJs from 'sql.js/dist/sql-asm.js'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dir = dirname(fileURLToPath(import.meta.url))
const DB_PATH = join(__dir, '../../flowlane.db')

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS boards (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    description TEXT,
    color       TEXT NOT NULL DEFAULT '#6366f1',
    created_at  DATETIME DEFAULT (datetime('now')),
    updated_at  DATETIME DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS columns (
    id         TEXT PRIMARY KEY,
    board_id   TEXT NOT NULL,
    name       TEXT NOT NULL,
    position   INTEGER NOT NULL DEFAULT 0,
    color      TEXT NOT NULL DEFAULT '#64748b',
    created_at DATETIME DEFAULT (datetime('now')),
    FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS team_members (
    id           TEXT PRIMARY KEY,
    name         TEXT NOT NULL,
    email        TEXT UNIQUE NOT NULL,
    avatar_color TEXT NOT NULL DEFAULT '#6366f1',
    role         TEXT NOT NULL DEFAULT 'Member',
    created_at   DATETIME DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id          TEXT PRIMARY KEY,
    board_id    TEXT NOT NULL,
    column_id   TEXT NOT NULL,
    title       TEXT NOT NULL,
    description TEXT,
    due_date    TEXT,
    priority    TEXT NOT NULL DEFAULT 'medium' CHECK(priority IN ('low','medium','high')),
    assignee_id TEXT,
    position    INTEGER NOT NULL DEFAULT 0,
    tags        TEXT NOT NULL DEFAULT '[]',
    created_at  DATETIME DEFAULT (datetime('now')),
    updated_at  DATETIME DEFAULT (datetime('now')),
    FOREIGN KEY (board_id)    REFERENCES boards(id)       ON DELETE CASCADE,
    FOREIGN KEY (column_id)   REFERENCES columns(id)      ON DELETE CASCADE,
    FOREIGN KEY (assignee_id) REFERENCES team_members(id) ON DELETE SET NULL
  );
`

let SQL, db

function save() {
  const data = db.export()
  writeFileSync(DB_PATH, Buffer.from(data))
}

export async function initDb() {
  SQL = await initSqlJs()

  if (existsSync(DB_PATH)) {
    const fileBuffer = readFileSync(DB_PATH)
    db = new SQL.Database(fileBuffer)
  } else {
    db = new SQL.Database()
  }

  db.run(SCHEMA)
  save()
  return db
}

export function run(sql, params = []) {
  db.run(sql, params)
  save()
}

export function all(sql, params = []) {
  const stmt = db.prepare(sql)
  stmt.bind(params)
  const rows = []
  while (stmt.step()) rows.push(stmt.getAsObject())
  stmt.free()
  return rows
}

export function get(sql, params = []) {
  const rows = all(sql, params)
  return rows[0] ?? null
}

export function scalar(sql, params = []) {
  const stmt = db.prepare(sql)
  stmt.bind(params)
  if (stmt.step()) {
    const row = stmt.get()
    stmt.free()
    return row[0]
  }
  stmt.free()
  return null
}