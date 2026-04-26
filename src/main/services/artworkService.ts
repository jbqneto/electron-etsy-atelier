import { randomUUID } from 'crypto'
import { copyFile, mkdir, readFile, stat } from 'fs/promises'
import { existsSync } from 'fs'
import { basename, extname, join } from 'path'
import { shell } from 'electron'

import type { ArtworkItem } from '../../shared/types/ipc'
import { projectFolderPaths } from '../constants/projectFolders'
import { tryGetDatabaseConnection } from '../database/DatabaseService'
import { upsertAsset } from '../database/repositories/AssetRepository'
import { upsertSourceArtwork } from '../database/repositories/SourceArtworkRepository'
import { readJsonFile, safeJoinWorkspacePath, writeJsonFileAtomic } from './jsonStore'
import { listProjectsInWorkspace } from './workspaceService'

const allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp'])

type SourceArtworkRow = {
  id: string
  original_name: string | null
  file_name: string
  relative_path: string
  extension: string | null
  size_bytes: number | null
  imported_at: string
}

type ArtworkMetadata = {
  items: ArtworkItem[]
}

function artworkMetadataPath(projectPath: string): string {
  return join(projectPath, projectFolderPaths.sourceArtworks, '.atelier-artworks.json')
}

async function loadArtworkMetadata(projectPath: string): Promise<ArtworkMetadata> {
  const fallback: ArtworkMetadata = { items: [] }
  return (await readJsonFile(artworkMetadataPath(projectPath), fallback, {
    onCorrupted: 'throw'
  })) as ArtworkMetadata
}

async function saveArtworkMetadata(projectPath: string, metadata: ArtworkMetadata): Promise<void> {
  await writeJsonFileAtomic(artworkMetadataPath(projectPath), metadata)
}

async function uniqueFilename(directoryPath: string, fileName: string): Promise<string> {
  const extension = extname(fileName)
  const baseName = basename(fileName, extension)
  let candidate = fileName
  let counter = 2

  while (existsSync(join(directoryPath, candidate))) {
    candidate = `${baseName}-${counter}${extension}`
    counter += 1
  }

  return candidate
}

export async function importArtworkFilesToProject(
  workspacePath: string,
  projectId: string,
  filePaths: string[]
): Promise<ArtworkItem[]> {
  const project = (await listProjectsInWorkspace(workspacePath)).find(
    (entry) => entry.id === projectId
  )
  if (!project) throw new Error('Project not found')

  const projectPath = safeJoinWorkspacePath(workspacePath, 'projects', project.slug)
  const sourceDir = safeJoinWorkspacePath(projectPath, projectFolderPaths.sourceArtworks)
  await mkdir(sourceDir, { recursive: true })

  const metadata = await loadArtworkMetadata(projectPath)
  const imported: ArtworkItem[] = []

  for (const filePath of filePaths) {
    const extension = extname(filePath).toLowerCase()
    if (!allowedExtensions.has(extension)) continue

    const stats = await stat(filePath)
    const originalName = basename(filePath)
    const filename = await uniqueFilename(sourceDir, originalName)
    const destinationPath = join(sourceDir, filename)
    await copyFile(filePath, destinationPath)

    const item: ArtworkItem = {
      id: randomUUID(),
      originalName,
      filename,
      relativePath: join(projectFolderPaths.sourceArtworks, filename),
      extension,
      sizeBytes: stats.size,
      importedAt: new Date().toISOString()
    }

    metadata.items.push(item)
    imported.push(item)

    const database = tryGetDatabaseConnection()
    if (database) {
      const now = item.importedAt
      upsertSourceArtwork(database, project.id, item, {
        width: null,
        height: null,
        format: extension.replace('.', ''),
        orientation: null,
        metadataScannedAt: null
      })
      upsertAsset(database, {
        id: item.id,
        projectId: project.id,
        scope: 'project',
        type: 'source-artwork',
        fileName: filename,
        baseName: basename(filename, extension),
        extension,
        relativePath: item.relativePath,
        sizeBytes: stats.size,
        width: null,
        height: null,
        format: extension.replace('.', ''),
        createdAt: now,
        updatedAt: now
      })
    }
  }

  await saveArtworkMetadata(projectPath, metadata)
  return imported
}

export async function listArtworkFilesInProject(
  workspacePath: string,
  projectId: string
): Promise<ArtworkItem[]> {
  const project = (await listProjectsInWorkspace(workspacePath)).find(
    (entry) => entry.id === projectId
  )
  if (!project) throw new Error('Project not found')
  const projectPath = safeJoinWorkspacePath(workspacePath, 'projects', project.slug)
  const metadata = await loadArtworkMetadata(projectPath)
  const merged = new Map<string, ArtworkItem>()

  const database = tryGetDatabaseConnection()
  if (database) {
    try {
      const rows = database
        .prepare(
          `SELECT id, original_name, file_name, relative_path, extension, size_bytes, imported_at
           FROM source_artworks
           WHERE project_id = ?
           ORDER BY imported_at DESC`
        )
        .all(projectId) as SourceArtworkRow[]
      for (const row of rows) {
        merged.set(row.id, {
          id: row.id,
          originalName: row.original_name ?? row.file_name,
          filename: row.file_name,
          relativePath: row.relative_path,
          extension: row.extension ?? '',
          sizeBytes: row.size_bytes ?? 0,
          importedAt: row.imported_at
        })
      }
    } catch {
      // Fall back to JSON snapshots below.
    }
  }

  for (const artwork of metadata.items) {
    merged.set(artwork.id, artwork)
  }

  return Array.from(merged.values()).sort((left, right) =>
    right.importedAt.localeCompare(left.importedAt)
  )
}

export async function getArtworkPreviewUrlInProject(
  workspacePath: string,
  projectId: string,
  artworkId: string
): Promise<string> {
  const project = (await listProjectsInWorkspace(workspacePath)).find(
    (entry) => entry.id === projectId
  )
  if (!project) throw new Error('Project not found')

  const projectPath = safeJoinWorkspacePath(workspacePath, 'projects', project.slug)
  const metadata = await loadArtworkMetadata(projectPath)
  const artwork = metadata.items.find((item) => item.id === artworkId)
  if (!artwork) throw new Error('Artwork not found')

  const filePath = safeJoinWorkspacePath(projectPath, artwork.relativePath)
  const content = await readFile(filePath)
  const mimeType =
    artwork.extension === '.png'
      ? 'image/png'
      : artwork.extension === '.webp'
        ? 'image/webp'
        : 'image/jpeg'
  return `data:${mimeType};base64,${content.toString('base64')}`
}

export async function revealArtworkInFolderInProject(
  workspacePath: string,
  projectId: string,
  artworkId: string
): Promise<void> {
  const project = (await listProjectsInWorkspace(workspacePath)).find(
    (entry) => entry.id === projectId
  )
  if (!project) throw new Error('Project not found')

  const projectPath = safeJoinWorkspacePath(workspacePath, 'projects', project.slug)
  const metadata = await loadArtworkMetadata(projectPath)
  const artwork = metadata.items.find((item) => item.id === artworkId)
  if (!artwork) throw new Error('Artwork not found')

  const filePath = safeJoinWorkspacePath(projectPath, artwork.relativePath)

  await shell.showItemInFolder(filePath)
}
