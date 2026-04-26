import type { Database as BetterSqliteDatabase } from 'better-sqlite3'

import type { GeneratedPipelineOutput } from '../../../shared/image-pipeline'

export function replaceRatioOutputs(
  db: BetterSqliteDatabase,
  projectId: string,
  imageCardId: string,
  artworkId: string,
  outputs: GeneratedPipelineOutput[]
): void {
  const deleteExisting = db.prepare(
    'DELETE FROM ratio_outputs WHERE project_id = ? AND image_card_id = ?'
  )
  const insert = db.prepare(
    `INSERT INTO ratio_outputs (
      id, project_id, image_card_id, artwork_id, ratio_group_key, ratio_group_label,
      size_label, width, height, dpi, file_name, folder_name, relative_path, generated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )

  const transaction = db.transaction(() => {
    deleteExisting.run(projectId, imageCardId)
    for (const output of outputs) {
      insert.run(
        output.id,
        projectId,
        imageCardId,
        artworkId,
        output.ratioGroupKey,
        output.ratioGroupLabel,
        output.sizeLabel,
        output.width,
        output.height,
        300,
        output.filename,
        output.folderName,
        output.relativePath,
        output.generatedAt
      )
    }
  })

  transaction()
}
