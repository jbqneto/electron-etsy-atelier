import { FolderOpen, Plus } from 'lucide-react'
import type { Project } from '../../../../shared/types/project'
import type { WorkspaceState } from '../../../../shared/types/workspace-state'

type Props = {
  workspaceState: WorkspaceState | null
  projects: Project[]
  selectedProjectId: string | null
  isLoading: boolean
  error: string | null
  onSelectWorkspace: () => void
  onCreateProject: () => void
  onSelectProject: (projectId: string) => void
}

export function ProjectWorkspacePanel({
  workspaceState,
  projects,
  selectedProjectId,
  isLoading,
  error,
  onSelectWorkspace,
  onCreateProject,
  onSelectProject
}: Props): React.JSX.Element {
  return (
    <aside className="flex w-96 flex-col border-r border-zinc-800 bg-[#1f1f23]">
      <div className="border-b border-zinc-800 px-4 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
          Workspace
        </p>
        <h2 className="mt-1 text-sm font-semibold text-zinc-100">Projects</h2>
      </div>

      <div className="space-y-3 border-b border-zinc-800 px-4 py-4 text-sm">
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3">
          <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Current workspace</p>
          <p className="mt-2 break-all text-sm text-zinc-200">
            {workspaceState ? workspaceState.workspace.name : 'No workspace selected'}
          </p>
          {workspaceState ? (
            <>
              <p className="mt-1 break-all text-xs text-zinc-500">{workspaceState.path}</p>
              <p className="mt-1 break-all text-xs text-zinc-600">
                Workspace ID: {workspaceState.workspace.id}
              </p>
            </>
          ) : null}
        </div>
        <button
          className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-100 transition hover:border-amber-300/40 hover:text-amber-100"
          onClick={onSelectWorkspace}
          type="button"
        >
          <FolderOpen size={14} />
          Select Workspace
        </button>
        <button
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-amber-300 px-3 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!workspaceState}
          onClick={onCreateProject}
          type="button"
        >
          <Plus size={14} />
          Create Project
        </button>
      </div>

      <div className="flex-1 overflow-auto px-3 py-3">
        <div className="mb-2 flex items-center justify-between px-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
          <span>Project List</span>
          <span>{isLoading ? 'Loading...' : `${projects.length} items`}</span>
        </div>
        {error ? (
          <div className="mb-3 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
            {error}
          </div>
        ) : null}
        <div className="space-y-2">
          {projects.map((project) => {
            const active = project.id === selectedProjectId
            return (
              <button
                key={project.id}
                className={`w-full rounded-lg border px-3 py-3 text-left transition ${
                  active
                    ? 'border-amber-300/30 bg-amber-300/10'
                    : 'border-zinc-800 bg-zinc-950/55 hover:border-zinc-700 hover:bg-zinc-900/80'
                }`}
                onClick={() => onSelectProject(project.id)}
                type="button"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-zinc-100">{project.name}</p>
                    <p className="mt-1 text-xs text-zinc-500">{project.slug}</p>
                  </div>
                  <span className="rounded border border-zinc-700 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.14em] text-zinc-400">
                    {project.status}
                  </span>
                </div>
                <div className="mt-3 grid gap-1 text-[11px] text-zinc-500">
                  <p>Created: {project.createdAt}</p>
                  <p>Updated: {project.updatedAt}</p>
                </div>
              </button>
            )
          })}
          {!isLoading && projects.length === 0 ? (
            <div className="rounded-lg border border-dashed border-zinc-800 bg-zinc-950/40 px-3 py-6 text-center text-sm text-zinc-500">
              No projects yet
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  )
}
