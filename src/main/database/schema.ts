export type SqlMigration = {
  name: string
  statements: string[]
}

export type DatabaseStatusRow = {
  path: string | null
  connected: boolean
  migrationCount: number
  currentVersion: number
  lastError: string | null
}

