import { useEffect, useMemo, useState } from 'react'
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
  const [pingResult, setPingResult] = useState<string | null>(null)
  const [pingError, setPingError] = useState<string | null>(null)
  const [isPinging, setIsPinging] = useState(false)
  const [sharpValidationMessage, setSharpValidationMessage] = useState(
    'Sharp has not been validated yet.'
  )
  const [sharpValidationStatus, setSharpValidationStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')
  const [workspaceState, setWorkspaceState] = useState<WorkspaceState | null>(null)
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

  const loadProjectDetail = async (projectId: string | null): Promise<void> => {
    if (!projectId) {
      setProjectSummary(null)
      setArtworks([])
      setImageCards([])
      return
    }

    setIsLoadingProjectDetail(true)
    setProjectDetailError(null)

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

    setIsLoadingProjectDetail(false)
  }

  const refreshWorkspace = async (): Promise<void> => {
    setIsLoadingProjects(true)
    setStatusError(null)
    const workspaceResult = await window.atelier.workspace.getCurrentWorkspace()
    if (workspaceResult.ok) {
      setWorkspaceState(workspaceResult.data)
    } else {
      setWorkspaceState(null)
      setStatusError(workspaceResult.error)
    }

    const projectsResult = await window.atelier.projects.listProjects()
    if (projectsResult.ok) {
      setProjects(projectsResult.data)
      setSelectedProjectId((current) =>
        current && projectsResult.data.some((project) => project.id === current)
          ? current
          : (projectsResult.data[0]?.id ?? null)
      )
    } else {
      setProjects([])
      setStatusError(projectsResult.error)
    }
    setIsLoadingProjects(false)
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

  const handlePing = async (): Promise<void> => {
    setIsPinging(true)
    setPingError(null)

    try {
      const result = await window.atelier.app.ping()
      setPingResult(result.message)
    } catch (error) {
      setPingResult(null)
      setPingError(error instanceof Error ? error.message : 'Unable to reach the main process')
    } finally {
      setIsPinging(false)
    }
  }

  const handleValidateSharp = async (): Promise<void> => {
    setSharpValidationStatus('loading')
    setSharpValidationMessage('Running Sharp validation in the main process...')

    const result = await window.atelier.imagePipeline.validateSharp()
    if (result.ok) {
      setSharpValidationStatus('success')
      setSharpValidationMessage(
        `Sharp ${result.data.sharpVersion}, libvips ${result.data.libvipsVersion}; generated ${result.data.width}x${result.data.height} ${result.data.outputFormat} (${result.data.sizeBytes} bytes).`
      )
      return
    }

    setSharpValidationStatus('error')
    setSharpValidationMessage(result.error)
  }

  const handleSelectWorkspace = async (): Promise<void> => {
    setStatusError(null)
    const result = await window.atelier.workspace.selectWorkspace()
    if (!result.ok) {
      setStatusError(result.error)
      return
    }

    setWorkspaceState(result.data)
    setSelectedProjectId(null)
    setProjects([])
    await refreshWorkspace()
  }

  const handleCreateProject = async (): Promise<void> => {
    setCreateError(null)
    const input: CreateProjectInput = {
      name: createName,
      description: createDescription
    }

    const result = await window.atelier.projects.createProject(input)
    if (!result.ok) {
      setCreateError(result.error)
      return
    }

    setIsCreateOpen(false)
    setCreateName('')
    setCreateDescription('')
    await refreshWorkspace()
    setSelectedProjectId(result.data.id)
  }

  const handleOpenProjectFolder = async (): Promise<void> => {
    if (!selectedProject) return
    const result = await window.atelier.projects.openProjectFolder(selectedProject.id)
    if (!result.ok) setStatusError(result.error)
  }

  const handleOpenProjectFolderFromDetail = async (): Promise<void> => {
    await handleOpenProjectFolder()
  }

  const handleOpenProjectSubfolder = async (folderKey: FolderKey): Promise<void> => {
    if (!selectedProject) return
    const result = await window.atelier.projects.openProjectSubfolder(selectedProject.id, folderKey)
    if (!result.ok) setStatusError(result.error)
  }

  const handleImportArtworks = async (): Promise<void> => {
    if (!selectedProject) return

    setStatusError(null)
    setProjectDetailError(null)

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
  }

  const handleRequestArtworkPreview = async (artworkId: string): Promise<string | null> => {
    if (!selectedProject) return null
    const result = await window.atelier.artworks.getArtworkPreviewUrl(selectedProject.id, artworkId)
    if (!result.ok) {
      setProjectDetailError(result.error)
      return null
    }
    return result.data
  }

  const handleRevealArtwork = async (artworkId: string): Promise<void> => {
    if (!selectedProject) return
    const result = await window.atelier.artworks.revealArtworkInFolder(
      selectedProject.id,
      artworkId
    )
    if (!result.ok) {
      setStatusError(result.error)
      setProjectDetailError(result.error)
    }
  }

  const handleScanSourceArtworks = async (): Promise<void> => {
    if (!selectedProject) return

    setStatusError(null)
    setProjectDetailError(null)

    const result = await window.atelier.imagePipeline.scanSourceArtworks(selectedProject.id)
    if (!result.ok) {
      setStatusError(result.error)
      setProjectDetailError(result.error)
      return
    }

    setImageCards(result.data)
    await loadProjectDetail(selectedProject.id)
  }

  const handleUpdateImageCard = async (
    cardId: string,
    input: UpdateImageCardInput
  ): Promise<void> => {
    if (!selectedProject) return

    setStatusError(null)
    setProjectDetailError(null)

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
  }

  const handleGeneratePrintableRatios = async (): Promise<void> => {
    if (!selectedProject) return

    setStatusError(null)
    setProjectDetailError(null)

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
  }

  const refreshJobs = async (): Promise<void> => {
    const result = await window.atelier.jobs.listJobs()
    if (result.ok) setJobs(result.data)
  }

  useEffect(() => {
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
    const result = await window.atelier.jobs.createDemoJob()
    if (result.ok) {
      await refreshJobs()
    } else {
      setStatusError(result.error)
    }
  }

  const handleClearCompletedJobs = async (): Promise<void> => {
    const result = await window.atelier.jobs.clearCompletedJobs()
    if (result.ok) {
      await refreshJobs()
    } else {
      setStatusError(result.error)
    }
  }

  return (
    <AppShell
      navigationItems={navigationItems}
      onValidateSharp={handleValidateSharp}
      onPing={handlePing}
      pingMessage={pingError ?? pingResult ?? 'No IPC response yet.'}
      pingStatus={isPinging ? 'loading' : pingError ? 'error' : pingResult ? 'success' : 'idle'}
      sharpValidationMessage={sharpValidationMessage}
      sharpValidationStatus={sharpValidationStatus}
    >
      <header className="flex h-11 items-center justify-between border-b border-zinc-800 bg-[#202024] px-4">
        <div className="flex items-center gap-2 text-sm text-zinc-300">
          <Boxes size={16} className="text-amber-300" />
          <span className="font-medium">The Atelier Desktop</span>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-500">Projects</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span className="size-2 rounded-full bg-amber-300" />
          Local workspace management
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <ProjectWorkspacePanel
          error={statusError}
          isLoading={isLoadingProjects}
          onCreateProject={() => setIsCreateOpen(true)}
          onSelectProject={setSelectedProjectId}
          onSelectWorkspace={handleSelectWorkspace}
          projects={projects}
          selectedProjectId={selectedProjectId}
          workspaceState={workspaceState}
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
