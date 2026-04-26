import type {
  ArtworkItem,
  Job,
  ProjectSummary,
  Result,
  FolderKey,
  SharpValidationResult
} from './ipc'
import type {
  GeneratePrintableRatiosResult,
  ImageCard,
  UpdateImageCardInput
} from '../image-pipeline'
import type { AppSettings } from './settings'
import type { Project } from './project'
import type { WorkspaceState } from './workspace-state'
import type { DatabaseMigrationPreview, DatabaseMigrationResult, DatabaseStatus } from './database'

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
    getCurrentWorkspace: () => Promise<Result<WorkspaceState | null>>
    getConfiguredWorkspacePath: () => Promise<Result<string>>
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
  database: {
    getStatus: () => Promise<Result<DatabaseStatus>>
    getMigrationPreview: () => Promise<Result<DatabaseMigrationPreview>>
    migrateJsonToSqlite: () => Promise<Result<DatabaseMigrationResult>>
  }
  imagePipeline: {
    validateSharp: () => Promise<Result<SharpValidationResult>>
    scanSourceArtworks: (projectId: string) => Promise<Result<ImageCard[]>>
    listImageCards: (projectId: string) => Promise<Result<ImageCard[]>>
    updateImageCard: (
      projectId: string,
      cardId: string,
      input: UpdateImageCardInput
    ) => Promise<Result<ImageCard>>
    generatePrintableRatios: (projectId: string) => Promise<Result<GeneratePrintableRatiosResult>>
  }
}

export type { AppSettings, Project }
