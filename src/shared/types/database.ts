export interface DatabaseStatus {
  path: string | null
  connected: boolean
  migrationCount: number
  currentVersion: number
  lastError: string | null
}

export interface DatabaseMigrationPreview {
  projects: number
  sourceArtworks: number
  imageCards: number
  ratioOutputs: number
  skipped: number
  errors: string[]
}

export interface DatabaseMigrationResult {
  projectsImported: number
  sourceArtworksImported: number
  imageCardsImported: number
  ratioOutputsImported: number
  skipped: number
  errors: string[]
}
