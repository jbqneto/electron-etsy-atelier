import type { Database as BetterSqliteDatabase } from 'better-sqlite3'

type AssetInput = {
  id: string
  projectId: string | null
  scope: string
  type: string
  fileName: string
  baseName: string | null
  extension: string | null
  relativePath: string
  sizeBytes: number | null
  width: number | null
  height: number | null
  format: string | null
  createdAt: string
  updatedAt: string
}

export function upsertAsset(db: BetterSqliteDatabase, input: AssetInput): void {
  db.prepare(
    `INSERT INTO assets (
      id, project_id, scope, type, file_name, base_name, extension, relative_path,
      size_bytes, width, height, format, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      project_id = excluded.project_id,
      scope = excluded.scope,
      type = excluded.type,
      file_name = excluded.file_name,
      base_name = excluded.base_name,
      extension = excluded.extension,
      relative_path = excluded.relative_path,
      size_bytes = excluded.size_bytes,
      width = excluded.width,
      height = excluded.height,
      format = excluded.format,
      updated_at = excluded.updated_at`
  ).run(
    input.id,
    input.projectId,
    input.scope,
    input.type,
    input.fileName,
    input.baseName,
    input.extension,
    input.relativePath,
    input.sizeBytes,
    input.width,
    input.height,
    input.format,
    input.createdAt,
    input.updatedAt
  )
}

