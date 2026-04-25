import { randomUUID } from 'crypto'
import { mkdir, readdir, readFile } from 'fs/promises'
import { existsSync } from 'fs'
import { isAbsolute, join, relative, resolve } from 'path'

import { projectSchema } from '../../shared/schemas/project'
import { workspaceSchema } from '../../shared/schemas/workspace'
import type { FolderKey, ProjectSummary } from '../../shared/types/ipc'
import type { Project } from '../../shared/types/project'
import type { Workspace } from '../../shared/types/workspace'
import type { WorkspaceState } from '../../shared/types/workspace-state'
import { writeJsonFile } from './jsonStore'
import { appSettingsService } from './appSettingsService'

const workspaceFolders = ['projects', 'mockup-templates', 'assets', 'exports'] as const
const projectFolders = [
  '01-source-artworks',
  '02-upscaled',
  '03-printable-ratios',
  '04-mockups',
  '05-pdf',
  '06-export-package'
] as const

const projectFolderMap: Record<FolderKey, { path: string; label: string; description: string }> = {
  sourceArtworks: {
    path: '01-source-artworks',
    label: 'Source Artworks',
    description: 'Imported original artwork files.'
  },
  upscaled: {
    path: '02-upscaled',
    label: 'Upscaled Images',
    description: 'Future upscaled artwork outputs.'
  },
  printableRatios: {
    path: '03-printable-ratios',
    label: 'Printable Ratios',
    description: 'Prepared print-ready ratio exports.'
  },
  mockups: {
    path: '04-mockups',
    label: 'Mockups',
    description: 'Listing mockups and template previews.'
  },
  pdf: {
    path: '05-pdf',
    label: 'Buyer PDF',
    description: 'Buyer instruction document outputs.'
  },
  exportPackage: {
    path: '06-export-package',
    label: 'Export Package',
    description: 'Final delivery package files.'
  }
}

let currentWorkspaceRecord: WorkspaceState | null = null

function assertPathInside(parentPath: string, childPath: string): void {
  const resolvedParent = resolve(parentPath)
  const resolvedChild = resolve(childPath)
  const relation = relative(resolvedParent, resolvedChild)

  if (relation === '' || (!relation.startsWith('..') && !isAbsolute(relation))) return

  throw new Error('Resolved folder is outside the workspace')
}

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

  await writeJsonFile(configPath, workspaceSchema.parse(record.workspace))
  await writeJsonFile(legacyMetaPath, workspaceSchema.parse(record.workspace))
  await appSettingsService.writeSettings({ lastWorkspacePath: resolvedPath })
  currentWorkspaceRecord = record
  return record
}

export async function getCurrentWorkspace(): Promise<WorkspaceState | null> {
  if (currentWorkspaceRecord) {
    return currentWorkspaceRecord
  }

  const { settings } = await appSettingsService.readSettings()
  if (!settings.lastWorkspacePath) return null
  const workspace = await readWorkspace(settings.lastWorkspacePath)
  if (!workspace) return null

  currentWorkspaceRecord = {
    path: resolve(settings.lastWorkspacePath),
    workspace
  }
  return currentWorkspaceRecord
}

export async function getCurrentWorkspacePath(): Promise<string | null> {
  if (currentWorkspaceRecord) return currentWorkspaceRecord.path

  const { settings } = await appSettingsService.readSettings()
  return settings.lastWorkspacePath ? resolve(settings.lastWorkspacePath) : null
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
  for (const folder of projectFolders) {
    await mkdir(join(projectDir, folder), { recursive: true })
  }
}

export async function listProjectsInWorkspace(workspacePath: string): Promise<Project[]> {
  const projectsDir = join(workspacePath, 'projects')

  try {
    const entries = await readdir(projectsDir, { withFileTypes: true })
    const projects: Project[] = []

    for (const entry of entries) {
      if (!entry.isDirectory()) continue

      const projectJsonPath = join(projectsDir, entry.name, 'project.json')
      try {
        const parsed = projectSchema.parse(JSON.parse(await readFile(projectJsonPath, 'utf-8')))
        projects.push(parsed)
      } catch {
        continue
      }
    }

    return projects.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
  } catch {
    return []
  }
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
      sourceArtworks: '01-source-artworks',
      upscaled: '02-upscaled',
      printableRatios: '03-printable-ratios',
      mockups: '04-mockups',
      pdf: '05-pdf',
      exportPackage: '06-export-package'
    }
  }

  await writeJsonFile(join(projectDir, 'project.json'), projectSchema.parse(project))
  return project
}

export async function openProjectFolderInSystem(
  workspacePath: string,
  projectId: string
): Promise<void> {
  const projects = await listProjectsInWorkspace(workspacePath)
  const project = projects.find((entry) => entry.id === projectId)
  if (!project) throw new Error('Project not found')

  const projectPath = join(workspacePath, 'projects', project.slug)
  assertPathInside(join(workspacePath, 'projects'), projectPath)

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

  const projectPath = join(workspacePath, 'projects', project.slug)
  assertPathInside(join(workspacePath, 'projects'), projectPath)
  const folders = await Promise.all(
    (
      Object.entries(projectFolderMap) as Array<[FolderKey, (typeof projectFolderMap)[FolderKey]]>
    ).map(async ([key, folder]) => {
      const folderPath = join(projectPath, folder.path)
      assertPathInside(projectPath, folderPath)

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

  const folderPath = join(summary.fullPath, folder.path)
  assertPathInside(summary.fullPath, folderPath)

  const { shell } = await import('electron')
  const errorMessage = await shell.openPath(folderPath)
  if (errorMessage) throw new Error(errorMessage)
}
