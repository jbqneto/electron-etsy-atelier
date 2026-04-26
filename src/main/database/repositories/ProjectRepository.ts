import { randomUUID } from 'crypto'

import type { Database as BetterSqliteDatabase } from 'better-sqlite3'

import { projectFolderPaths } from '../../constants/projectFolders'
import type { Project } from '../../../shared/types/project'

type ProjectRow = {
  id: string
  name: string
  slug: string
  description: string | null
  product_type: string | null
  status: string
  marketplace: string
  language: string | null
  root_relative_path: string
  created_at: string
  updated_at: string
}

const emptyPaths: Project['paths'] = {
  sourceArtworks: projectFolderPaths.sourceArtworks,
  upscaled: projectFolderPaths.upscaled,
  printableRatios: projectFolderPaths.printableRatios,
  mockups: projectFolderPaths.mockups,
  pdf: projectFolderPaths.pdf,
  exportPackage: projectFolderPaths.exportPackage
}

function toProject(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    status: row.status as Project['status'],
    description: row.description ?? '',
    marketplace: 'etsy',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    paths: emptyPaths
  }
}

export function listProjects(db: BetterSqliteDatabase): Project[] {
  const rows = db
    .prepare(
      `SELECT id, name, slug, description, product_type, status, marketplace, language,
              root_relative_path, created_at, updated_at
       FROM projects
       ORDER BY updated_at DESC`
    )
    .all() as ProjectRow[]

  return rows.map(toProject)
}

export function upsertProject(db: BetterSqliteDatabase, project: Project): void {
  const now = new Date().toISOString()
  db.prepare(
    `INSERT INTO projects (
      id, name, slug, description, product_type, status, marketplace, language,
      root_relative_path, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      slug = excluded.slug,
      description = excluded.description,
      product_type = excluded.product_type,
      status = excluded.status,
      marketplace = excluded.marketplace,
      language = excluded.language,
      root_relative_path = excluded.root_relative_path,
      updated_at = excluded.updated_at`
  ).run(
    project.id,
    project.name,
    project.slug,
    project.description || null,
    null,
    project.status,
    project.marketplace,
    null,
    `projects/${project.slug}`,
    project.createdAt,
    project.updatedAt || now
  )
}

export function createProjectRecordInput(input: {
  name: string
  slug: string
  description?: string
}): Project {
  const now = new Date().toISOString()
  return {
    id: randomUUID(),
    name: input.name,
    slug: input.slug,
    status: 'draft',
    description: input.description ?? '',
    marketplace: 'etsy',
    createdAt: now,
    updatedAt: now,
    paths: emptyPaths
  }
}
