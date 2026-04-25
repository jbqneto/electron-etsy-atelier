import { randomUUID } from 'crypto'
import { copyFile, mkdir, readFile, stat } from 'fs/promises'
import { existsSync } from 'fs'
import { basename, extname, isAbsolute, join, relative, resolve } from 'path'
import { shell } from 'electron'

import type { ArtworkItem } from '../../shared/types/ipc'
import { readJsonFile, writeJsonFile } from './jsonStore'
import { listProjectsInWorkspace } from './workspaceService'

const allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp'])

type ArtworkMetadata = {
  items: ArtworkItem[]
}

function assertPathInside(parentPath: string, childPath: string): void {
  const resolvedParent = resolve(parentPath)
  const resolvedChild = resolve(childPath)
  const relation = relative(resolvedParent, resolvedChild)

  if (relation === '' || (!relation.startsWith('..') && !isAbsolute(relation))) return

  throw new Error('Resolved artwork path is outside the project')
}

function artworkMetadataPath(projectPath: string): string {
  return join(projectPath, '01-source-artworks', '.atelier-artworks.json')
}

async function loadArtworkMetadata(projectPath: string): Promise<ArtworkMetadata> {
  const fallback: ArtworkMetadata = { items: [] }
  return (await readJsonFile(artworkMetadataPath(projectPath), fallback)) as ArtworkMetadata
}

async function saveArtworkMetadata(projectPath: string, metadata: ArtworkMetadata): Promise<void> {
  await writeJsonFile(artworkMetadataPath(projectPath), metadata)
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

  const projectPath = join(workspacePath, 'projects', project.slug)
  assertPathInside(join(workspacePath, 'projects'), projectPath)
  const sourceDir = join(projectPath, '01-source-artworks')
  assertPathInside(projectPath, sourceDir)
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
      relativePath: join('01-source-artworks', filename),
      extension,
      sizeBytes: stats.size,
      importedAt: new Date().toISOString()
    }

    metadata.items.push(item)
    imported.push(item)
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
  const projectPath = join(workspacePath, 'projects', project.slug)
  assertPathInside(join(workspacePath, 'projects'), projectPath)
  const metadata = await loadArtworkMetadata(projectPath)
  return metadata.items
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

  const metadata = await loadArtworkMetadata(join(workspacePath, 'projects', project.slug))
  const artwork = metadata.items.find((item) => item.id === artworkId)
  if (!artwork) throw new Error('Artwork not found')

  const projectPath = join(workspacePath, 'projects', project.slug)
  assertPathInside(join(workspacePath, 'projects'), projectPath)
  const filePath = join(projectPath, artwork.relativePath)
  assertPathInside(projectPath, filePath)
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

  const metadata = await loadArtworkMetadata(join(workspacePath, 'projects', project.slug))
  const artwork = metadata.items.find((item) => item.id === artworkId)
  if (!artwork) throw new Error('Artwork not found')

  const projectPath = join(workspacePath, 'projects', project.slug)
  assertPathInside(join(workspacePath, 'projects'), projectPath)
  const filePath = join(projectPath, artwork.relativePath)
  assertPathInside(projectPath, filePath)

  await shell.showItemInFolder(filePath)
}
