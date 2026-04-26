import type { Database as BetterSqliteDatabase } from 'better-sqlite3'

import type { ArtworkItem } from '../../../shared/types/ipc'

type SourceArtworkRow = {
  id: string
  project_id: string
  original_name: string | null
  file_name: string
  relative_path: string
  extension: string | null
  size_bytes: number | null
  width: number | null
  height: number | null
  format: string | null
  orientation: string | null
  imported_at: string
  metadata_scanned_at: string | null
}

function toArtworkItem(row: SourceArtworkRow): ArtworkItem {
  return {
    id: row.id,
    originalName: row.original_name ?? row.file_name,
    filename: row.file_name,
    relativePath: row.relative_path,
    extension: row.extension ?? '',
    sizeBytes: row.size_bytes ?? 0,
    importedAt: row.imported_at
  }
}

export function listSourceArtworks(db: BetterSqliteDatabase, projectId: string): ArtworkItem[] {
  const rows = db
    .prepare(
      `SELECT id, project_id, original_name, file_name, relative_path, extension, size_bytes,
              width, height, format, orientation, imported_at, metadata_scanned_at
       FROM source_artworks
       WHERE project_id = ?
       ORDER BY imported_at DESC`
    )
    .all(projectId) as SourceArtworkRow[]

  return rows.map(toArtworkItem)
}

export function upsertSourceArtwork(
  db: BetterSqliteDatabase,
  projectId: string,
  artwork: ArtworkItem,
  metadata?: {
    width?: number | null
    height?: number | null
    format?: string | null
    orientation?: string | null
    metadataScannedAt?: string | null
  }
): void {
  db.prepare(
    `INSERT INTO source_artworks (
      id, project_id, original_name, file_name, relative_path, extension, size_bytes,
      width, height, format, orientation, imported_at, metadata_scanned_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      project_id = excluded.project_id,
      original_name = excluded.original_name,
      file_name = excluded.file_name,
      relative_path = excluded.relative_path,
      extension = excluded.extension,
      size_bytes = excluded.size_bytes,
      width = excluded.width,
      height = excluded.height,
      format = excluded.format,
      orientation = excluded.orientation,
      imported_at = excluded.imported_at,
      metadata_scanned_at = excluded.metadata_scanned_at`
  ).run(
    artwork.id,
    projectId,
    artwork.originalName,
    artwork.filename,
    artwork.relativePath,
    artwork.extension,
    artwork.sizeBytes,
    metadata?.width ?? null,
    metadata?.height ?? null,
    metadata?.format ?? null,
    metadata?.orientation ?? null,
    artwork.importedAt,
    metadata?.metadataScannedAt ?? null
  )
}
