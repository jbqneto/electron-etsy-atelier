import type { Database as BetterSqliteDatabase } from 'better-sqlite3'

import type {
  GeneratedPipelineOutput,
  ImageCard,
  ImageCardsMetadata
} from '../../../shared/image-pipeline'

type ImageCardRow = {
  id: string
  project_id: string
  artwork_id: string
  file_name: string
  base_name: string
  relative_path: string
  width: number
  height: number
  source_orientation: string
  output_orientation: string
  ratio_selections_json: string
  manual_crops_json: string
  outputs_json: string
  active_ratio_group_key: string | null
  manual_mode: number
  metadata_scanned_at: string | null
  created_at: string
  updated_at: string
  source_artwork_size_bytes: number | null
  source_artwork_format: string | null
}

function parseRecord<T>(value: string): T {
  return JSON.parse(value) as T
}

function toImageCard(row: ImageCardRow): ImageCard {
  return {
    id: row.id,
    artworkId: row.artwork_id,
    fileName: row.file_name,
    baseName: row.base_name,
    relativePath: row.relative_path,
    width: row.width,
    height: row.height,
    format: row.source_artwork_format ?? 'jpg',
    density: null,
    sizeBytes: row.source_artwork_size_bytes ?? 0,
    sourceOrientation: row.source_orientation as ImageCard['sourceOrientation'],
    outputOrientation: row.output_orientation as ImageCard['outputOrientation'],
    ratioSelections: parseRecord<ImageCard['ratioSelections']>(row.ratio_selections_json),
    manualMode: row.manual_mode === 1,
    activeRatioGroupKey: row.active_ratio_group_key ?? '',
    manualCrops: parseRecord<ImageCard['manualCrops']>(row.manual_crops_json),
    upscaledAsset: null,
    outputs: parseRecord<GeneratedPipelineOutput[]>(row.outputs_json),
    metadataScannedAt: row.metadata_scanned_at ?? row.created_at
  }
}

export function listImageCards(
  db: BetterSqliteDatabase,
  projectId: string
): ImageCard[] {
  const rows = db
    .prepare(
      `SELECT id, project_id, artwork_id, file_name, base_name, relative_path, width, height,
              source_orientation, output_orientation, ratio_selections_json, manual_crops_json,
              outputs_json, active_ratio_group_key, manual_mode, metadata_scanned_at,
              created_at, updated_at,
              (SELECT size_bytes FROM source_artworks WHERE source_artworks.id = image_cards.artwork_id) AS source_artwork_size_bytes,
              (SELECT format FROM source_artworks WHERE source_artworks.id = image_cards.artwork_id) AS source_artwork_format
       FROM image_cards
       WHERE project_id = ?
       ORDER BY updated_at DESC`
    )
    .all(projectId) as ImageCardRow[]

  return rows.map(toImageCard)
}

export function replaceImageCards(
  db: BetterSqliteDatabase,
  projectId: string,
  metadata: ImageCardsMetadata
): void {
  const insert = db.prepare(
    `INSERT INTO image_cards (
      id, project_id, artwork_id, file_name, base_name, relative_path, width, height,
      source_orientation, output_orientation, ratio_selections_json, manual_crops_json,
      outputs_json, active_ratio_group_key, manual_mode, metadata_scanned_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      project_id = excluded.project_id,
      artwork_id = excluded.artwork_id,
      file_name = excluded.file_name,
      base_name = excluded.base_name,
      relative_path = excluded.relative_path,
      width = excluded.width,
      height = excluded.height,
      source_orientation = excluded.source_orientation,
      output_orientation = excluded.output_orientation,
      ratio_selections_json = excluded.ratio_selections_json,
      manual_crops_json = excluded.manual_crops_json,
      outputs_json = excluded.outputs_json,
      active_ratio_group_key = excluded.active_ratio_group_key,
      manual_mode = excluded.manual_mode,
      metadata_scanned_at = excluded.metadata_scanned_at,
      updated_at = excluded.updated_at`
  )

  const now = new Date().toISOString()
  const transaction = db.transaction((items: ImageCard[]) => {
    for (const card of items) {
      insert.run(
        card.id,
        projectId,
        card.artworkId,
        card.fileName,
        card.baseName,
        card.relativePath,
        card.width,
        card.height,
        card.sourceOrientation,
        card.outputOrientation,
        JSON.stringify(card.ratioSelections),
        JSON.stringify(card.manualCrops),
        JSON.stringify(card.outputs),
        card.activeRatioGroupKey || null,
        card.manualMode ? 1 : 0,
        card.metadataScannedAt,
        now,
        now
      )
    }
  })

  transaction(metadata.items)
}
