import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Boxes,
  Brush,
  FileText,
  FolderKanban,
  ImageUp,
  LayoutTemplate,
  Settings
} from 'lucide-react'

import { AppShell } from './components/AppShell'
import { ProjectDetail } from './features/projects/ProjectDetail'
import { ProjectWorkspacePanel } from './features/projects/ProjectWorkspacePanel'
import type { CreateProjectInput } from '../../shared/types/app'
import type {
  DatabaseMigrationPreview,
  DatabaseMigrationResult,
  DatabaseStatus
} from '../../shared/types/database'
import type { ImageCard, UpdateImageCardInput } from '../../shared/image-pipeline'
import type { ArtworkItem, FolderKey, Job, ProjectSummary } from '../../shared/types/ipc'
import type { Project } from '../../shared/types/project'
import type { WorkspaceState } from '../../shared/types/workspace-state'

const navigationItems = [
  { label: 'Projects', icon: FolderKanban, active: true },
  { label: 'Mockup Templates', icon: LayoutTemplate },
  { label: 'Mockup Composer', icon: Brush },
  { label: 'Image Pipeline', icon: ImageUp },
  { label: 'PDF Export', icon: FileText },
  { label: 'Settings', icon: Settings }
]

function App(): React.JSX.Element {
  const refreshWorkspaceRequestId = useRef(0)
  const enableJobsPolling = false
  const [workspaceState, setWorkspaceState] = useState<WorkspaceState | null>(null)
  const [configuredWorkspacePath, setConfiguredWorkspacePath] = useState<string | null>(null)
  const [databaseStatus, setDatabaseStatus] = useState<DatabaseStatus | null>(null)
  const [databaseMigrationPreview, setDatabaseMigrationPreview] =
    useState<DatabaseMigrationPreview | null>(null)
  const [databaseMigrationResult, setDatabaseMigrationResult] =
    useState<DatabaseMigrationResult | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [projectSummary, setProjectSummary] = useState<ProjectSummary | null>(null)
  const [artworks, setArtworks] = useState<ArtworkItem[]>([])
  const [imageCards, setImageCards] = useState<ImageCard[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [statusError, setStatusError] = useState<string | null>(null)
  const [projectDetailError, setProjectDetailError] = useState<string | null>(null)
  const [isLoadingProjects, setIsLoadingProjects] = useState(false)
  const [isLoadingProjectDetail, setIsLoadingProjectDetail] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createDescription, setCreateDescription] = useState('')
  const [createError, setCreateError] = useState<string | null>(null)

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId]
  )

  const sortProjects = (items: Project[]): Project[] =>
    [...items].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))

  const loadProjectDetail = async (projectId: string | null): Promise<void> => {
    if (!projectId) {
      setProjectSummary(null)
      setArtworks([])
      setImageCards([])
      return
    }

    setIsLoadingProjectDetail(true)
    setProjectDetailError(null)

    try {
      const [summaryResult, artworksResult, imageCardsResult] = await Promise.all([
        window.atelier.projects.getProjectSummary(projectId),
        window.atelier.artworks.listSourceArtworks(projectId),
        window.atelier.imagePipeline.listImageCards(projectId)
      ])

      if (summaryResult.ok) {
        setProjectSummary(summaryResult.data)
      } else {
        setProjectSummary(null)
        setStatusError(summaryResult.error)
        setProjectDetailError(summaryResult.error)
      }

      if (artworksResult.ok) {
        setArtworks(artworksResult.data)
      } else {
        setArtworks([])
        setStatusError(artworksResult.error)
        setProjectDetailError(artworksResult.error)
      }

      if (imageCardsResult.ok) {
        setImageCards(imageCardsResult.data)
      } else {
        setImageCards([])
        setStatusError(imageCardsResult.error)
        setProjectDetailError(imageCardsResult.error)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load project detail'
      setProjectSummary(null)
      setArtworks([])
      setImageCards([])
      setStatusError(message)
      setProjectDetailError(message)
    } finally {
      setIsLoadingProjectDetail(false)
    }
  }

  const refreshWorkspace = async (): Promise<void> => {
    const requestId = ++refreshWorkspaceRequestId.current
    setIsLoadingProjects(true)
    setStatusError(null)
    try {
      const workspaceResult = await window.atelier.workspace.getCurrentWorkspace()
      if (requestId !== refreshWorkspaceRequestId.current) return

      if (workspaceResult.ok) {
        setWorkspaceState(workspaceResult.data)
      } else {
        setStatusError(workspaceResult.error)
      }

      const configuredWorkspacePathResult =
        await window.atelier.workspace.getConfiguredWorkspacePath()
      if (requestId !== refreshWorkspaceRequestId.current) return

      if (configuredWorkspacePathResult.ok) {
        setConfiguredWorkspacePath(configuredWorkspacePathResult.data)
      } else {
        setStatusError(configuredWorkspacePathResult.error)
      }

      const projectsResult = await window.atelier.projects.listProjects()
      if (requestId !== refreshWorkspaceRequestId.current) return

      if (projectsResult.ok) {
        setProjects(sortProjects(projectsResult.data))
        setSelectedProjectId((current) =>
          current && projectsResult.data.some((project) => project.id === current)
            ? current
            : (projectsResult.data[0]?.id ?? null)
        )
      } else {
        setStatusError(projectsResult.error)
      }

      const databaseResult = await window.atelier.database.getStatus()
      if (requestId !== refreshWorkspaceRequestId.current) return

      if (databaseResult.ok) {
        setDatabaseStatus(databaseResult.data)
      } else {
        setDatabaseStatus(null)
        setStatusError(databaseResult.error)
      }
    } catch (error) {
      if (requestId !== refreshWorkspaceRequestId.current) return
      setStatusError(error instanceof Error ? error.message : 'Failed to refresh workspace')
    } finally {
      if (requestId === refreshWorkspaceRequestId.current) {
        setIsLoadingProjects(false)
      }
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refreshWorkspace()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadProjectDetail(selectedProjectId)
    }, 0)

    return () => window.clearTimeout(timer)
  }, [selectedProjectId])

  const handleReloadWorkspace = async (): Promise<void> => {
    await refreshWorkspace()
  }

  const handlePreviewJsonMigration = async (): Promise<void> => {
    setStatusError(null)
    try {
      const result = await window.atelier.database.getMigrationPreview()
      if (result.ok) {
        setDatabaseMigrationPreview(result.data)
        setDatabaseMigrationResult(null)
        return
      }

      setStatusError(result.error)
    } catch (error) {
      setStatusError(error instanceof Error ? error.message : 'Failed to preview JSON migration')
    }
  }

  const handleMigrateJsonToSqlite = async (): Promise<void> => {
    setStatusError(null)
    try {
      const result = await window.atelier.database.migrateJsonToSqlite()
      if (result.ok) {
        setDatabaseMigrationResult(result.data)
        setDatabaseMigrationPreview(null)
        await refreshWorkspace()
        return
      }

      setStatusError(result.error)
    } catch (error) {
      setStatusError(error instanceof Error ? error.message : 'Failed to migrate JSON to SQLite')
    }
  }

  const handleCreateProject = async (): Promise<void> => {
    setCreateError(null)
    const input: CreateProjectInput = {
      name: createName,
      description: createDescription
    }

    try {
      const result = await window.atelier.projects.createProject(input)

      console.log('Create project result', result)

      if (!result.ok) {
        setCreateError(result.error)
        return
      }

      setProjects((current) =>
        sortProjects([result.data, ...current.filter((project) => project.id !== result.data.id)])
      )
      setSelectedProjectId(result.data.id)
      setIsCreateOpen(false)
      setCreateName('')
      setCreateDescription('')
      await refreshWorkspace()
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'Failed to create project')
    }
  }

  const handleOpenProjectFolder = async (): Promise<void> => {
    if (!selectedProject) return
    try {
      const result = await window.atelier.projects.openProjectFolder(selectedProject.id)
      if (!result.ok) setStatusError(result.error)
    } catch (error) {
      setStatusError(error instanceof Error ? error.message : 'Failed to open project folder')
    }
  }

  const handleOpenProjectFolderFromDetail = async (): Promise<void> => {
    await handleOpenProjectFolder()
  }

  const handleOpenProjectSubfolder = async (folderKey: FolderKey): Promise<void> => {
    if (!selectedProject) return
    try {
      const result = await window.atelier.projects.openProjectSubfolder(
        selectedProject.id,
        folderKey
      )
      if (!result.ok) setStatusError(result.error)
    } catch (error) {
      setStatusError(error instanceof Error ? error.message : 'Failed to open project subfolder')
    }
  }

  const handleImportArtworks = async (): Promise<void> => {
    if (!selectedProject) return

    setStatusError(null)
    setProjectDetailError(null)

    try {
      const pickResult = await window.atelier.artworks.selectArtworkFiles(selectedProject.id)
      if (!pickResult.ok) {
        setStatusError(pickResult.error)
        setProjectDetailError(pickResult.error)
        return
      }
      if (pickResult.data.length === 0) return

      const importResult = await window.atelier.artworks.importArtworkFiles(
        selectedProject.id,
        pickResult.data
      )
      if (!importResult.ok) {
        setStatusError(importResult.error)
        setProjectDetailError(importResult.error)
        return
      }

      await loadProjectDetail(selectedProject.id)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to import artworks'
      setStatusError(message)
      setProjectDetailError(message)
    }
  }

  const handleRequestArtworkPreview = async (artworkId: string): Promise<string | null> => {
    if (!selectedProject) return null
    try {
      const result = await window.atelier.artworks.getArtworkPreviewUrl(
        selectedProject.id,
        artworkId
      )
      if (!result.ok) {
        setProjectDetailError(result.error)
        return null
      }
      return result.data
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load artwork preview'
      setProjectDetailError(message)
      return null
    }
  }

  const handleRevealArtwork = async (artworkId: string): Promise<void> => {
    if (!selectedProject) return
    try {
      const result = await window.atelier.artworks.revealArtworkInFolder(
        selectedProject.id,
        artworkId
      )
      if (!result.ok) {
        setStatusError(result.error)
        setProjectDetailError(result.error)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to reveal artwork'
      setStatusError(message)
      setProjectDetailError(message)
    }
  }

  const handleScanSourceArtworks = async (): Promise<void> => {
    if (!selectedProject) return

    setStatusError(null)
    setProjectDetailError(null)

    try {
      const result = await window.atelier.imagePipeline.scanSourceArtworks(selectedProject.id)
      if (!result.ok) {
        setStatusError(result.error)
        setProjectDetailError(result.error)
        return
      }

      setImageCards(result.data)
      await loadProjectDetail(selectedProject.id)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to scan source artworks'
      setStatusError(message)
      setProjectDetailError(message)
    }
  }

  const handleUpdateImageCard = async (
    cardId: string,
    input: UpdateImageCardInput
  ): Promise<void> => {
    if (!selectedProject) return

    setStatusError(null)
    setProjectDetailError(null)

    try {
      const result = await window.atelier.imagePipeline.updateImageCard(
        selectedProject.id,
        cardId,
        input
      )
      if (!result.ok) {
        setStatusError(result.error)
        setProjectDetailError(result.error)
        return
      }

      setImageCards((current) =>
        current.map((card) => (card.id === result.data.id ? result.data : card))
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update image card'
      setStatusError(message)
      setProjectDetailError(message)
    }
  }

  const handleGeneratePrintableRatios = async (): Promise<void> => {
    if (!selectedProject) return

    setStatusError(null)
    setProjectDetailError(null)

    try {
      const result = await window.atelier.imagePipeline.generatePrintableRatios(selectedProject.id)
      if (!result.ok) {
        setStatusError(result.error)
        setProjectDetailError(result.error)
        await refreshJobs()
        return
      }

      setImageCards(result.data.cards)
      await refreshJobs()
      if (result.data.failedCount > 0) {
        const message = `Generated ${result.data.generatedCount} printable files, ${result.data.failedCount} failed.`
        setStatusError(message)
        setProjectDetailError(message)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate printable ratios'
      setStatusError(message)
      setProjectDetailError(message)
      await refreshJobs()
    }
  }

  const refreshJobs = async (): Promise<void> => {
    try {
      const result = await window.atelier.jobs.listJobs()
      if (result.ok) {
        setJobs(result.data)
      }
    } catch (error) {
      console.error('Failed to refresh jobs', error)
    }
  }

  useEffect(() => {
    if (!enableJobsPolling) {
      return
    }

    const timer = window.setInterval(() => {
      void refreshJobs()
    }, 1000)
    const initialTimer = window.setTimeout(() => {
      void refreshJobs()
    }, 0)

    return () => {
      window.clearInterval(timer)
      window.clearTimeout(initialTimer)
    }
  }, [])

  const handleCreateDemoJob = async (): Promise<void> => {
    try {
      const result = await window.atelier.jobs.createDemoJob()
      if (result.ok) {
        await refreshJobs()
      } else {
        setStatusError(result.error)
      }
    } catch (error) {
      setStatusError(error instanceof Error ? error.message : 'Failed to create demo job')
    }
  }

  const handleClearCompletedJobs = async (): Promise<void> => {
    try {
      const result = await window.atelier.jobs.clearCompletedJobs()
      if (result.ok) {
        await refreshJobs()
      } else {
        setStatusError(result.error)
      }
    } catch (error) {
      setStatusError(error instanceof Error ? error.message : 'Failed to clear completed jobs')
    }
  }

  return (
    <AppShell navigationItems={navigationItems}>
      <header className="border-b border-white/5 bg-[#111419]/85 px-6 py-4 backdrop-blur-xl">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-2xl border border-amber-300/15 bg-amber-300/10 text-amber-300 shadow-[0_10px_30px_rgba(214,174,78,0.08)]">
              <Boxes size={18} strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-300">
                <span className="font-semibold tracking-[-0.01em] text-zinc-50">
                  The Atelier Desktop
                </span>
                <span className="text-zinc-600">/</span>
                <span className="text-zinc-400">Projects</span>
                {selectedProject ? (
                  <>
                    <span className="text-zinc-600">/</span>
                    <span className="truncate text-zinc-200">{selectedProject.name}</span>
                  </>
                ) : null}
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                Local-first workspace management for the Etsy production pipeline
              </p>
            </div>
          </div>

          <div className="flex min-w-0 flex-1 items-center gap-3 xl:max-w-[540px] xl:justify-center">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">Search</span>
              <input
                aria-label="Search projects, artworks, templates"
                className="h-10 w-full rounded-2xl border border-white/6 bg-white/[0.03] px-4 pl-10 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-amber-300/40 focus:bg-white/[0.05]"
                placeholder="Search projects, artworks, templates..."
                readOnly
                type="search"
              />
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600">
                <Boxes size={15} strokeWidth={1.7} />
              </span>
            </label>
            <span className="hidden rounded-full border border-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500 xl:inline-flex">
              DEV
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              className="inline-flex items-center gap-2 rounded-xl border border-white/8 px-3 py-2 text-xs font-semibold text-zinc-100 transition duration-200 hover:border-amber-300/40 hover:text-amber-100 active:translate-y-px"
              onClick={() => setIsCreateOpen(true)}
              type="button"
            >
              <span className="text-amber-300">+</span>
              New Project
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-xl border border-white/8 px-3 py-2 text-xs font-semibold text-zinc-100 transition duration-200 hover:border-amber-300/40 hover:text-amber-100 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!selectedProject}
              onClick={() => void handleImportArtworks()}
              type="button"
            >
              <ImageUp size={14} strokeWidth={1.8} />
              Import Artworks
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-xl bg-amber-300 px-3 py-2 text-xs font-semibold text-zinc-950 transition duration-200 hover:bg-amber-200 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!selectedProject}
              onClick={() => void handleGeneratePrintableRatios()}
              type="button"
            >
              <Settings size={14} strokeWidth={1.8} />
              Generate
            </button>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <ProjectWorkspacePanel
          error={statusError}
          isLoading={isLoadingProjects}
          onCreateProject={() => setIsCreateOpen(true)}
          onSelectProject={setSelectedProjectId}
          onReloadWorkspace={handleReloadWorkspace}
          projects={projects}
          selectedProjectId={selectedProjectId}
          workspaceState={workspaceState}
          configuredWorkspacePath={configuredWorkspacePath}
          databaseStatus={databaseStatus}
          databaseMigrationPreview={databaseMigrationPreview}
          databaseMigrationResult={databaseMigrationResult}
          onPreviewJsonMigration={() => void handlePreviewJsonMigration()}
          onMigrateJsonToSqlite={() => void handleMigrateJsonToSqlite()}
        />
        <ProjectDetail
          artworks={artworks}
          error={projectDetailError}
          imageCards={imageCards}
          isLoading={isLoadingProjectDetail}
          onGeneratePrintableRatios={() => void handleGeneratePrintableRatios()}
          onImportArtworks={handleImportArtworks}
          onOpenFolder={handleOpenProjectFolderFromDetail}
          onOpenSubfolder={handleOpenProjectSubfolder}
          onRequestArtworkPreview={handleRequestArtworkPreview}
          onRevealArtwork={handleRevealArtwork}
          onScanSourceArtworks={handleScanSourceArtworks}
          onUpdateImageCard={(cardId, input) => void handleUpdateImageCard(cardId, input)}
          project={selectedProject}
          summary={projectSummary}
        />
      </div>

      <footer className="flex h-48 flex-col border-t border-zinc-800 bg-[#1f1f23]">
        <div className="flex h-9 items-center justify-between border-b border-zinc-800 px-4 text-xs font-medium text-zinc-400">
          <span>Jobs and Logs</span>
          <div className="flex gap-2">
            {import.meta.env.DEV ? (
              <button
                className="rounded border border-zinc-700 px-2 py-1 text-zinc-300"
                onClick={() => void handleCreateDemoJob()}
                type="button"
              >
                Demo Job
              </button>
            ) : null}
            <button
              className="rounded border border-zinc-700 px-2 py-1 text-zinc-300"
              onClick={() => void handleClearCompletedJobs()}
              type="button"
            >
              Clear Completed
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-auto px-4 py-3 text-xs">
          {jobs.length === 0 ? (
            <div className="text-zinc-500">No jobs in queue.</div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="rounded-lg border border-zinc-800 bg-zinc-950/50 px-3 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-zinc-100">{job.title}</p>
                      <p className="text-zinc-500">{job.message}</p>
                    </div>
                    <span className="rounded border border-zinc-700 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-amber-200">
                      {job.status}
                    </span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-900">
                    <div
                      className="h-full rounded-full bg-amber-300 transition-all"
                      style={{ width: `${job.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </footer>

      {isCreateOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-4">
          <div className="w-full max-w-lg rounded-xl border border-zinc-800 bg-[#202024] p-5 shadow-2xl shadow-black/40">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">New Project</p>
                <h2 className="mt-1 text-lg font-semibold text-zinc-100">Create project</h2>
              </div>
              <button
                className="text-sm text-zinc-400 hover:text-zinc-100"
                onClick={() => setIsCreateOpen(false)}
                type="button"
              >
                Close
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <label className="block">
                <span className="text-xs uppercase tracking-[0.14em] text-zinc-500">
                  Project name
                </span>
                <input
                  className="mt-2 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-300/60"
                  value={createName}
                  onChange={(event) => setCreateName(event.target.value)}
                />
              </label>
              <label className="block">
                <span className="text-xs uppercase tracking-[0.14em] text-zinc-500">
                  Description
                </span>
                <textarea
                  className="mt-2 min-h-24 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-300/60"
                  value={createDescription}
                  onChange={(event) => setCreateDescription(event.target.value)}
                />
              </label>

              {createError ? (
                <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                  {createError}
                </div>
              ) : null}

              <div className="flex items-center justify-end gap-3">
                <button
                  className="rounded-md border border-zinc-700 px-4 py-2 text-sm text-zinc-200"
                  onClick={() => setIsCreateOpen(false)}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="rounded-md bg-amber-300 px-4 py-2 text-sm font-semibold text-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!createName.trim()}
                  onClick={() => void handleCreateProject()}
                  type="button"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  )
}

export default App
