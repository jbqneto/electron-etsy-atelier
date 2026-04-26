import { randomUUID } from 'crypto'
import { mkdir, readdir, readFile, rename } from 'fs/promises'
import { existsSync } from 'fs'
import { join, resolve } from 'path'

import { configureDatabaseForWorkspace, tryGetDatabaseConnection } from '../database/DatabaseService'
import { listProjects as listProjectsFromDatabase, upsertProject } from '../database/repositories/ProjectRepository'
import { projectFolderPaths, legacyProjectFolderPaths } from '../constants/projectFolders'
import { projectSchema } from '../../shared/schemas/project'
import { workspaceSchema } from '../../shared/schemas/workspace'
import type { FolderKey, ProjectSummary } from '../../shared/types/ipc'
import type { Project } from '../../shared/types/project'
import type { Workspace } from '../../shared/types/workspace'
import type { WorkspaceState } from '../../shared/types/workspace-state'
import { getConfiguredWorkspacePath } from './appConfigService'
import { safeJoinWorkspacePath, writeJsonFileAtomic } from './jsonStore'
import { appSettingsService } from './appSettingsService'

const workspaceFolders = ['projects', 'mockup-templates', 'assets', 'exports'] as const

const projectFolderMap: Record<FolderKey, { path: string; label: string; description: string }> = {
  sourceArtworks: {
    path: projectFolderPaths.sourceArtworks,
    label: 'Source Artworks',
    description: 'Imported original artwork files.'
  },
  upscaled: {
    path: projectFolderPaths.upscaled,
    label: 'Upscaled Images',
    description: 'Future upscaled artwork outputs.'
  },
  printableRatios: {
    path: projectFolderPaths.printableRatios,
    label: 'Printable Ratios',
    description: 'Prepared print-ready ratio exports.'
  },
  mockups: {
    path: projectFolderPaths.mockups,
    label: 'Mockups',
    description: 'Listing mockups and template previews.'
  },
  pdf: {
    path: projectFolderPaths.pdf,
    label: 'Buyer PDF',
    description: 'Buyer instruction document outputs.'
  },
  exportPackage: {
    path: projectFolderPaths.exportPackage,
    label: 'Export Package',
    description: 'Final delivery package files.'
  }
}

let currentWorkspaceRecord: WorkspaceState | null = null

function workspaceFilePath(workspacePath: string): string {
  return join(workspacePath, '.atelier', 'workspace.json')
}

function workspaceConfigFilePath(workspacePath: string): string {
  return join(workspacePath, 'atelier.config.json')
}

async function ensureWorkspaceStructure(workspacePath: string): Promise<void> {
  await mkdir(join(workspacePath, '.atelier'), { recursive: true })
  for (const folder of workspaceFolders) {
    await mkdir(join(workspacePath, folder), { recursive: true })
  }
}

function createWorkspaceRecord(workspacePath: string, existing?: Workspace): WorkspaceState {
  const now = new Date().toISOString()
  const workspace = existing
    ? { ...existing, updatedAt: now }
    : {
        id: randomUUID(),
        name: 'Atelier Workspace',
        version: 1 as const,
        createdAt: now,
        updatedAt: now
      }

  return {
    path: resolve(workspacePath),
    workspace
  }
}

export async function initializeWorkspaceAtPath(workspacePath: string): Promise<WorkspaceState> {
  const resolvedPath = resolve(workspacePath)
  await ensureWorkspaceStructure(resolvedPath)

  const configPath = workspaceConfigFilePath(resolvedPath)
  const legacyMetaPath = workspaceFilePath(resolvedPath)
  let record: WorkspaceState

  if (existsSync(configPath)) {
    try {
      const parsed = workspaceSchema.parse(JSON.parse(await readFile(configPath, 'utf-8')))
      record = createWorkspaceRecord(resolvedPath, parsed)
    } catch {
      record = createWorkspaceRecord(resolvedPath)
    }
  } else if (existsSync(legacyMetaPath)) {
    try {
      const parsed = workspaceSchema.parse(JSON.parse(await readFile(legacyMetaPath, 'utf-8')))
      record = createWorkspaceRecord(resolvedPath, parsed)
    } catch {
      record = createWorkspaceRecord(resolvedPath)
    }
  } else {
    record = createWorkspaceRecord(resolvedPath)
  }

  await writeJsonFileAtomic(configPath, workspaceSchema.parse(record.workspace))
  await writeJsonFileAtomic(legacyMetaPath, workspaceSchema.parse(record.workspace))
  await appSettingsService.writeSettings({ lastWorkspacePath: resolvedPath })
  configureDatabaseForWorkspace(resolvedPath)
  currentWorkspaceRecord = record
  return record
}

async function loadConfiguredWorkspace(): Promise<WorkspaceState | null> {
  const configuredWorkspacePath = getConfiguredWorkspacePath()
  if (!configuredWorkspacePath) return null

  const workspace = await readWorkspace(configuredWorkspacePath)
  if (workspace) {
    currentWorkspaceRecord = {
      path: resolve(configuredWorkspacePath),
      workspace
    }
    configureDatabaseForWorkspace(configuredWorkspacePath)
    return currentWorkspaceRecord
  }

  return initializeWorkspaceAtPath(configuredWorkspacePath)
}

export async function getCurrentWorkspace(): Promise<WorkspaceState | null> {
  if (currentWorkspaceRecord) {
    return currentWorkspaceRecord
  }

  const { settings } = await appSettingsService.readSettings()
  if (settings.lastWorkspacePath) {
    const workspace = await readWorkspace(settings.lastWorkspacePath)
    if (workspace) {
      currentWorkspaceRecord = {
        path: resolve(settings.lastWorkspacePath),
        workspace
      }
      configureDatabaseForWorkspace(settings.lastWorkspacePath)
      return currentWorkspaceRecord
    }
  }

  return loadConfiguredWorkspace()
}

export async function getCurrentWorkspacePath(): Promise<string | null> {
  if (currentWorkspaceRecord) return currentWorkspaceRecord.path

  const { settings } = await appSettingsService.readSettings()
  if (settings.lastWorkspacePath) return resolve(settings.lastWorkspacePath)

  return getConfiguredWorkspacePath()
}

export async function readWorkspace(workspacePath: string): Promise<Workspace | null> {
  try {
    const parsed = workspaceSchema.safeParse(
      JSON.parse(await readFile(workspaceConfigFilePath(workspacePath), 'utf-8'))
    )
    if (parsed.success) return parsed.data
  } catch {
    // Fall back to the legacy metadata location below.
  }

  try {
    const parsed = workspaceSchema.safeParse(
      JSON.parse(await readFile(workspaceFilePath(workspacePath), 'utf-8'))
    )
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
}

async function ensureUniqueSlug(projectsDir: string, baseSlug: string): Promise<string> {
  let candidate = baseSlug
  let suffix = 2

  while (existsSync(join(projectsDir, candidate))) {
    candidate = `${baseSlug}-${suffix}`
    suffix += 1
  }

  return candidate
}

async function ensureProjectStructure(projectDir: string): Promise<void> {
  for (const folder of Object.values(projectFolderPaths)) {
    await mkdir(join(projectDir, folder), { recursive: true })
  }
}

async function migrateProjectFolders(projectDir: string, project: Project): Promise<Project> {
  const nextPaths: Project['paths'] = { ...project.paths }
  let changed = false

  for (const [key, folderPath] of Object.entries(projectFolderPaths) as Array<
    [FolderKey, (typeof projectFolderPaths)[FolderKey]]
  >) {
    const desiredFolderPath = join(projectDir, folderPath)
    const legacyFolderPath = join(projectDir, legacyProjectFolderPaths[key])

    if (!existsSync(desiredFolderPath) && existsSync(legacyFolderPath)) {
      await rename(legacyFolderPath, desiredFolderPath)
    }

    if (!existsSync(desiredFolderPath)) {
      await mkdir(desiredFolderPath, { recursive: true })
    }

    if (nextPaths[key] !== folderPath) {
      switch (key) {
        case 'sourceArtworks':
          nextPaths.sourceArtworks = projectFolderPaths.sourceArtworks
          break
        case 'upscaled':
          nextPaths.upscaled = projectFolderPaths.upscaled
          break
        case 'printableRatios':
          nextPaths.printableRatios = projectFolderPaths.printableRatios
          break
        case 'mockups':
          nextPaths.mockups = projectFolderPaths.mockups
          break
        case 'pdf':
          nextPaths.pdf = projectFolderPaths.pdf
          break
        case 'exportPackage':
          nextPaths.exportPackage = projectFolderPaths.exportPackage
          break
      }
      changed = true
    }
  }

  if (changed) {
    const updatedProject: Project = {
      ...project,
      updatedAt: new Date().toISOString(),
      paths: nextPaths
    }
    await writeJsonFileAtomic(join(projectDir, 'project.json'), projectSchema.parse(updatedProject))
    return updatedProject
  }

  return project
}

export async function listProjectsInWorkspace(workspacePath: string): Promise<Project[]> {
  const projectsDir = join(workspacePath, 'projects')
  let jsonProjects: Project[] = []

  try {
    const entries = await readdir(projectsDir, { withFileTypes: true })

    for (const entry of entries) {
      if (!entry.isDirectory()) continue

      const projectJsonPath = join(projectsDir, entry.name, 'project.json')
      try {
        const parsed = projectSchema.parse(JSON.parse(await readFile(projectJsonPath, 'utf-8')))
        jsonProjects.push(await migrateProjectFolders(join(projectsDir, entry.name), parsed))
      } catch {
        continue
      }
    }

  } catch {
    jsonProjects = []
  }

  const database = tryGetDatabaseConnection()
  if (database) {
    try {
      const dbProjects = listProjectsFromDatabase(database)
      if (dbProjects.length > 0) {
        const merged = new Map<string, Project>()
        for (const project of jsonProjects) {
          merged.set(project.id, project)
        }
        for (const project of dbProjects) {
          merged.set(project.id, {
            ...merged.get(project.id),
            ...project
          })
        }
        return Array.from(merged.values()).sort((left, right) =>
          right.updatedAt.localeCompare(left.updatedAt)
        )
      }
    } catch {
      // Fall back to the JSON snapshot below.
    }
  }

  return jsonProjects.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
}

export async function createProjectInWorkspace(
  workspacePath: string,
  input: { name: string; description?: string }
): Promise<Project> {
  const trimmedName = input.name.trim()
  if (!trimmedName) throw new Error('Project name is required')

  const baseSlug = slugify(trimmedName)
  if (!baseSlug) throw new Error('Project name must include at least one letter or number')

  const projectsDir = join(workspacePath, 'projects')
  await mkdir(projectsDir, { recursive: true })

  const slug = await ensureUniqueSlug(projectsDir, baseSlug)
  const projectDir = join(projectsDir, slug)
  await mkdir(projectDir, { recursive: true })
  await ensureProjectStructure(projectDir)

  const now = new Date().toISOString()
  const project: Project = {
    id: randomUUID(),
    name: trimmedName,
    slug,
    status: 'draft',
    description: input.description?.trim() ?? '',
    marketplace: 'etsy',
    createdAt: now,
    updatedAt: now,
    paths: {
      sourceArtworks: projectFolderPaths.sourceArtworks,
      upscaled: projectFolderPaths.upscaled,
      printableRatios: projectFolderPaths.printableRatios,
      mockups: projectFolderPaths.mockups,
      pdf: projectFolderPaths.pdf,
      exportPackage: projectFolderPaths.exportPackage
    }
  }

  await writeJsonFileAtomic(join(projectDir, 'project.json'), projectSchema.parse(project))
  const database = tryGetDatabaseConnection()
  if (database) {
    try {
      upsertProject(database, project)
    } catch {
      // Keep the JSON snapshot as the durable fallback if SQLite is temporarily unavailable.
    }
  }
  return project
}

export async function openProjectFolderInSystem(
  workspacePath: string,
  projectId: string
): Promise<void> {
  const projects = await listProjectsInWorkspace(workspacePath)
  const project = projects.find((entry) => entry.id === projectId)
  if (!project) throw new Error('Project not found')

  const projectPath = safeJoinWorkspacePath(workspacePath, 'projects', project.slug)

  const { shell } = await import('electron')
  const errorMessage = await shell.openPath(projectPath)
  if (errorMessage) throw new Error(errorMessage)
}

async function countFilesInDirectory(directoryPath: string): Promise<number> {
  try {
    const entries = await readdir(directoryPath, { withFileTypes: true })
    return entries.filter((entry) => entry.isFile()).length
  } catch {
    return 0
  }
}

export async function getProjectSummaryInWorkspace(
  workspacePath: string,
  projectId: string
): Promise<ProjectSummary> {
  const projects = await listProjectsInWorkspace(workspacePath)
  const project = projects.find((entry) => entry.id === projectId)
  if (!project) throw new Error('Project not found')

  const projectPath = safeJoinWorkspacePath(workspacePath, 'projects', project.slug)
  const folders = await Promise.all(
    (
      Object.entries(projectFolderMap) as Array<[FolderKey, (typeof projectFolderMap)[FolderKey]]>
    ).map(async ([key, folder]) => {
      const folderPath = safeJoinWorkspacePath(projectPath, folder.path)

      return {
        key,
        label: folder.label,
        path: folder.path,
        description: folder.description,
        fileCount: await countFilesInDirectory(folderPath)
      }
    })
  )

  return {
    ...project,
    fullPath: projectPath,
    folders
  }
}

export async function openProjectSubfolderInSystem(
  workspacePath: string,
  projectId: string,
  folderKey: FolderKey
): Promise<void> {
  const summary = await getProjectSummaryInWorkspace(workspacePath, projectId)
  const folder = summary.folders.find((entry) => entry.key === folderKey)
  if (!folder) throw new Error('Folder not found')

  const folderPath = safeJoinWorkspacePath(summary.fullPath, folder.path)

  const { shell } = await import('electron')
  const errorMessage = await shell.openPath(folderPath)
  if (errorMessage) throw new Error(errorMessage)
}
