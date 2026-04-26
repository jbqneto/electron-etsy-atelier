import { FolderOpen, Plus } from 'lucide-react'
import type {
  DatabaseMigrationPreview,
  DatabaseMigrationResult,
  DatabaseStatus
} from '../../../../shared/types/database'
import type { Project } from '../../../../shared/types/project'
import type { WorkspaceState } from '../../../../shared/types/workspace-state'

type Props = {
  workspaceState: WorkspaceState | null
  configuredWorkspacePath: string | null
  projects: Project[]
  selectedProjectId: string | null
  isLoading: boolean
  error: string | null
  onReloadWorkspace: () => void
  onCreateProject: () => void
  onSelectProject: (projectId: string) => void
  databaseStatus: DatabaseStatus | null
  databaseMigrationPreview: DatabaseMigrationPreview | null
  databaseMigrationResult: DatabaseMigrationResult | null
  onPreviewJsonMigration: () => void
  onMigrateJsonToSqlite: () => void
}

export function ProjectWorkspacePanel({
  workspaceState,
  configuredWorkspacePath,
  projects,
  selectedProjectId,
  isLoading,
  error,
  onReloadWorkspace,
  onCreateProject,
  onSelectProject,
  databaseStatus,
  databaseMigrationPreview,
  databaseMigrationResult,
  onPreviewJsonMigration,
  onMigrateJsonToSqlite
}: Props): React.JSX.Element {
  const workspaceName = workspaceState?.workspace.name ?? 'Configured workspace'
  const workspacePath = workspaceState?.path ?? configuredWorkspacePath
  const canCreateProject = Boolean(workspacePath)

  return (
    <aside className="flex w-96 min-h-0 flex-col border-r border-white/5 bg-[#13161b]/92 backdrop-blur-xl">
      <div className="border-b border-white/5 px-5 py-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
          Workspace
        </p>
        <div className="mt-1 flex items-end justify-between gap-3">
          <h2 className="text-base font-semibold tracking-[-0.02em] text-zinc-50">Projects</h2>
          <span className="rounded-full border border-white/5 bg-white/[0.03] px-2 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-500">
            {projects.length} total
          </span>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 text-sm">
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/5 bg-[#0f1115]/90 p-4 shadow-[0_16px_36px_rgba(0,0,0,0.16)]">
            <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              Current workspace
            </p>
            <p className="mt-2 break-all text-sm font-medium text-zinc-100">{workspaceName}</p>
            <p className="mt-2 break-all text-xs leading-5 text-zinc-500">
              {workspacePath ?? 'No workspace configured'}
            </p>
            {workspaceState ? (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <StatTile label="Workspace ID" value={workspaceState.workspace.id.slice(0, 8)} />
                <StatTile label="Version" value={`v${workspaceState.workspace.version}`} />
              </div>
            ) : null}
            <p className="mt-3 text-[10px] uppercase tracking-[0.18em] text-zinc-600">
              Defined in <span className="text-zinc-400">src/config/config.json</span>
            </p>
          </div>
          <button
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2.5 text-xs font-semibold text-zinc-100 transition duration-200 hover:border-amber-300/40 hover:bg-white/[0.05] hover:text-amber-100"
            onClick={onReloadWorkspace}
            type="button"
          >
            <FolderOpen size={14} />
            Reload Workspace
          </button>
          <button
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-300 px-3 py-2.5 text-xs font-semibold text-zinc-950 transition duration-200 hover:bg-amber-200 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!canCreateProject}
            onClick={onCreateProject}
            type="button"
          >
            <Plus size={14} />
            Create Project
          </button>
          <div className="rounded-2xl border border-white/5 bg-[#0f1115]/90 p-4 shadow-[0_16px_36px_rgba(0,0,0,0.16)]">
            <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">System</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <StatTile
                label="Database"
                value={databaseStatus?.connected ? 'Connected' : 'Offline'}
              />
              <StatTile
                label="Migrations"
                value={
                  databaseStatus
                    ? `${databaseStatus.currentVersion}/${databaseStatus.migrationCount}`
                    : '0/0'
                }
              />
            </div>
            <p className="mt-3 break-all text-xs leading-5 text-zinc-500">
              {databaseStatus?.path ?? 'Database path unavailable'}
            </p>
            <div className="mt-3 flex gap-2">
              <button
                className="flex-1 rounded-xl border border-white/8 px-3 py-2 text-[11px] font-semibold text-zinc-100 transition duration-200 hover:border-amber-300/40 hover:text-amber-100"
                onClick={onPreviewJsonMigration}
                type="button"
              >
                Preview JSON Migration
              </button>
              <button
                className="flex-1 rounded-xl bg-amber-300 px-3 py-2 text-[11px] font-semibold text-zinc-950 transition duration-200 hover:bg-amber-200"
                onClick={onMigrateJsonToSqlite}
                type="button"
              >
                Migrate JSON to SQLite
              </button>
            </div>
            {databaseMigrationPreview ? (
              <div className="mt-3 rounded-xl border border-white/5 bg-white/[0.025] px-3 py-2 text-xs leading-5 text-zinc-400">
                Preview: {databaseMigrationPreview.projects} projects,{' '}
                {databaseMigrationPreview.sourceArtworks} artworks,{' '}
                {databaseMigrationPreview.imageCards} cards, {databaseMigrationPreview.ratioOutputs}{' '}
                outputs.
              </div>
            ) : null}
            {databaseMigrationResult ? (
              <div className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs leading-5 text-emerald-100">
                Migrated {databaseMigrationResult.projectsImported} projects,{' '}
                {databaseMigrationResult.sourceArtworksImported} artworks,{' '}
                {databaseMigrationResult.imageCardsImported} cards,{' '}
                {databaseMigrationResult.ratioOutputsImported} outputs.
              </div>
            ) : null}
            {databaseStatus && !databaseStatus.connected ? (
              <p className="mt-2 rounded-xl border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-xs leading-5 text-amber-100">
                SQLite backend offline. JSON fallback remains active.
              </p>
            ) : null}
          </div>
          <div>
            <div className="mb-3 flex items-center justify-between px-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
              <span>Project List</span>
              <span>{isLoading ? 'Loading...' : `${projects.length} items`}</span>
            </div>
            {error ? (
              <div className="mb-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-xs text-red-200">
                {error}
              </div>
            ) : null}
            <div className="space-y-3">
              {projects.map((project) => {
                const active = project.id === selectedProjectId
                return (
                  <button
                    key={project.id}
                    className={`group w-full rounded-2xl border px-3 py-3 text-left transition duration-200 ${
                      active
                        ? 'border-amber-300/25 bg-amber-300/10 shadow-[0_12px_30px_rgba(214,174,78,0.08)]'
                        : 'border-white/5 bg-white/[0.025] hover:border-white/10 hover:bg-white/[0.045]'
                    }`}
                    onClick={() => onSelectProject(project.id)}
                    type="button"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`grid size-11 shrink-0 place-items-center rounded-xl border ${
                          active
                            ? 'border-amber-300/25 bg-amber-300/15 text-amber-200'
                            : 'border-white/6 bg-white/[0.04] text-zinc-400 group-hover:text-zinc-200'
                        }`}
                      >
                        <FolderOpen size={16} strokeWidth={1.8} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-medium text-zinc-50">{project.name}</p>
                            <p className="mt-1 truncate text-xs text-zinc-500">{project.slug}</p>
                          </div>
                          <span className="rounded-full border border-white/8 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-zinc-400">
                            {project.status}
                          </span>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-zinc-500">
                          <p className="rounded-xl border border-white/5 bg-white/[0.025] px-2 py-1.5">
                            Created {project.createdAt.slice(0, 10)}
                          </p>
                          <p className="rounded-xl border border-white/5 bg-white/[0.025] px-2 py-1.5">
                            Updated {project.updatedAt.slice(0, 10)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
              {!isLoading && projects.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/8 bg-white/[0.02] px-3 py-8 text-center text-sm text-zinc-500">
                  No projects yet
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

function StatTile({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.025] px-2.5 py-2">
      <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">{label}</p>
      <p className="mt-1 truncate text-xs font-medium text-zinc-100">{value}</p>
    </div>
  )
}
