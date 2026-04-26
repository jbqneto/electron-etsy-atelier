import { ipcMain } from 'electron'

import type { Result } from '../../shared/types/ipc'
import type {
  DatabaseMigrationPreview,
  DatabaseMigrationResult,
  DatabaseStatus
} from '../../shared/types/database'
import { getDatabaseStatus } from '../database/DatabaseService'
import {
  getJsonToSqliteMigrationPreview,
  migrateJsonToSqlite
} from '../database/JsonToSqliteMigrationService'
import { getCurrentWorkspacePath } from '../services/workspaceService'

function ok<T>(data: T): Result<T> {
  return { ok: true, data }
}

function fail<T>(error: string): Result<T> {
  return { ok: false, error }
}

export function registerDatabaseIpc(): void {
  ipcMain.handle('database:getStatus', async () => {
    try {
      return ok<DatabaseStatus>(getDatabaseStatus())
    } catch (error) {
      return fail<DatabaseStatus>(
        error instanceof Error ? error.message : 'Failed to read database status'
      )
    }
  })

  ipcMain.handle('database:getMigrationPreview', async () => {
    const workspacePath = await getCurrentWorkspacePath()
    if (!workspacePath) return fail<DatabaseMigrationPreview>('No workspace selected')

    try {
      return ok(await getJsonToSqliteMigrationPreview(workspacePath))
    } catch (error) {
      return fail<DatabaseMigrationPreview>(
        error instanceof Error ? error.message : 'Failed to preview JSON migration'
      )
    }
  })

  ipcMain.handle('database:migrateJsonToSqlite', async () => {
    const workspacePath = await getCurrentWorkspacePath()
    if (!workspacePath) return fail<DatabaseMigrationResult>('No workspace selected')

    try {
      return ok(await migrateJsonToSqlite(workspacePath))
    } catch (error) {
      return fail<DatabaseMigrationResult>(
        error instanceof Error ? error.message : 'Failed to migrate JSON data to SQLite'
      )
    }
  })
}
