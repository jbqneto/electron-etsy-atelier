import type Database from 'better-sqlite3'

import { migrations } from './migrations/001_initial'

function ensureMigrationsTable(db: Database.Database): void {
  db.exec(`CREATE TABLE IF NOT EXISTS migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    applied_at TEXT NOT NULL
  )`)
}

export function runMigrations(db: Database.Database): { applied: number; currentVersion: number } {
  ensureMigrationsTable(db)

  const appliedRows = db
    .prepare('SELECT name FROM migrations ORDER BY id ASC')
    .all() as Array<{ name: string }>
  const appliedNames = new Set(appliedRows.map((row) => row.name))

  let appliedCount = 0
  const insertMigration = db.prepare(
    'INSERT INTO migrations (name, applied_at) VALUES (?, ?)'
  )

  const transaction = db.transaction((migrationsToRun: typeof migrations) => {
    for (const migration of migrationsToRun) {
      if (appliedNames.has(migration.name)) continue

      for (const statement of migration.statements) {
        db.exec(statement)
      }
      insertMigration.run(migration.name, new Date().toISOString())
      appliedCount += 1
      appliedNames.add(migration.name)
    }
  })

  transaction(migrations)

  const currentVersion = db.prepare('SELECT COALESCE(MAX(id), 0) AS version FROM migrations').get() as {
    version: number
  }

  return {
    applied: appliedCount,
    currentVersion: currentVersion.version ?? 0
  }
}

