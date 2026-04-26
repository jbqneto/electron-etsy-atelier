import Database from 'better-sqlite3'
import type { Database as BetterSqliteDatabase } from 'better-sqlite3'
import { mkdirSync } from 'fs'
import { dirname, resolve } from 'path'

import { safeJoinWorkspacePath } from '../services/jsonStore'
import type { DatabaseStatus } from '../../shared/types/database'
import { runMigrations } from './MigrationRunner'

type RuntimeState = {
  workspacePath: string | null
  databasePath: string | null
  connected: boolean
  migrationCount: number
  currentVersion: number
  lastError: string | null
}

const runtimeState: RuntimeState = {
  workspacePath: null,
  databasePath: null,
  connected: false,
  migrationCount: 0,
  currentVersion: 0,
  lastError: null
}

let database: BetterSqliteDatabase | null = null

function createDatabasePath(workspacePath: string): string {
  return safeJoinWorkspacePath(workspacePath, '.atelier', 'atelier.db')
}

function setDisconnected(error: string | null): void {
  runtimeState.connected = false
  runtimeState.migrationCount = 0
  runtimeState.currentVersion = 0
  runtimeState.lastError = error
}

function applyDatabasePragmas(db: BetterSqliteDatabase): void {
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  db.pragma('busy_timeout = 5000')
}

function openDatabase(workspacePath: string): BetterSqliteDatabase {
  const databasePath = createDatabasePath(workspacePath)
  mkdirSync(dirname(databasePath), { recursive: true })

  const nextDatabase = new Database(databasePath)
  applyDatabasePragmas(nextDatabase)
  const migrationResult = runMigrations(nextDatabase)

  runtimeState.workspacePath = resolve(workspacePath)
  runtimeState.databasePath = databasePath
  runtimeState.connected = true
  runtimeState.migrationCount = migrationResult.currentVersion
  runtimeState.currentVersion = migrationResult.currentVersion
  runtimeState.lastError = null

  return nextDatabase
}

function ensureDatabase(): BetterSqliteDatabase | null {
  if (!runtimeState.workspacePath) return null

  if (database && runtimeState.connected) {
    return database
  }

  if (database) {
    database.close()
    database = null
  }

  database = openDatabase(runtimeState.workspacePath)
  return database
}

export function configureDatabaseForWorkspace(workspacePath: string): DatabaseStatus {
  runtimeState.workspacePath = resolve(workspacePath)
  runtimeState.databasePath = createDatabasePath(workspacePath)

  try {
    if (database) {
      database.close()
      database = null
    }
    database = openDatabase(workspacePath)
  } catch (error) {
    setDisconnected(error instanceof Error ? error.message : 'Failed to open database')
  }

  return getDatabaseStatus()
}

export function getDatabaseConnection(): BetterSqliteDatabase {
  const connection = ensureDatabase()
  if (!connection) {
    throw new Error('Database workspace is not configured')
  }
  return connection
}

export function tryGetDatabaseConnection(): BetterSqliteDatabase | null {
  try {
    return getDatabaseConnection()
  } catch {
    return null
  }
}

export function getDatabasePath(): string | null {
  return runtimeState.databasePath
}

export function getDatabaseStatus(): DatabaseStatus {
  return {
    path: runtimeState.databasePath,
    connected: runtimeState.connected,
    migrationCount: runtimeState.migrationCount,
    currentVersion: runtimeState.currentVersion,
    lastError: runtimeState.lastError
  }
}
