import type { ArtworkItem, Job, ProjectSummary, Result, FolderKey } from './ipc'
import type { AppSettings } from './settings'
import type { Project } from './project'
import type { WorkspaceState } from './workspace-state'

export type AppPingResponse = {
  ok: true
  message: 'The Atelier Desktop is running'
}

export type CreateProjectInput = {
  name: string
  description?: string
}

export type AtelierApi = {
  app: {
    ping: () => Promise<AppPingResponse>
  }
  workspace: {
    selectWorkspace: () => Promise<Result<WorkspaceState>>
    getCurrentWorkspace: () => Promise<Result<WorkspaceState | null>>
    initializeWorkspace: (workspacePath: string) => Promise<Result<WorkspaceState>>
  }
  projects: {
    createProject: (input: CreateProjectInput) => Promise<Result<Project>>
    listProjects: () => Promise<Result<Project[]>>
    openProjectFolder: (projectId: string) => Promise<Result<null>>
    openProjectSubfolder: (projectId: string, folderKey: FolderKey) => Promise<Result<null>>
    getProjectSummary: (projectId: string) => Promise<Result<ProjectSummary>>
  }
  artworks: {
    selectArtworkFiles: (projectId: string) => Promise<Result<string[]>>
    importArtworkFiles: (projectId: string, filePaths: string[]) => Promise<Result<ArtworkItem[]>>
    listSourceArtworks: (projectId: string) => Promise<Result<ArtworkItem[]>>
    getArtworkPreviewUrl: (projectId: string, artworkId: string) => Promise<Result<string>>
    revealArtworkInFolder: (projectId: string, artworkId: string) => Promise<Result<null>>
  }
  jobs: {
    listJobs: () => Promise<Result<Job[]>>
    clearCompletedJobs: () => Promise<Result<null>>
    createDemoJob: () => Promise<Result<Job>>
  }
}

export type { AppSettings, Project }
