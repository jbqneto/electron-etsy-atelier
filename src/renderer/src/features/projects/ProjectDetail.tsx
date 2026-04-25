import { FolderOpen, ImageDown, Layers3, NotebookTabs, PackagePlus, FilePlus2 } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'

import type { ArtworkItem, FolderKey, ProjectSummary } from '../../../../shared/types/ipc'
import type { Project } from '../../../../shared/types/project'

type Props = {
  project: Project | null
  summary: ProjectSummary | null
  artworks: ArtworkItem[]
  isLoading: boolean
  onOpenFolder: () => void
  onOpenSubfolder: (folderKey: FolderKey) => void
  onImportArtworks: () => void
  onRevealArtwork: (artworkId: string) => void
  onRequestArtworkPreview: (artworkId: string) => Promise<string | null>
}

const workflowCards: Array<{
  key: FolderKey
  title: string
  icon: ReactNode
}> = [
  { key: 'sourceArtworks', title: 'Source Artworks', icon: <ImageDown size={18} /> },
  { key: 'upscaled', title: 'Upscaled Images', icon: <Layers3 size={18} /> },
  { key: 'printableRatios', title: 'Printable Ratios', icon: <NotebookTabs size={18} /> },
  { key: 'mockups', title: 'Mockups', icon: <FilePlus2 size={18} /> },
  { key: 'pdf', title: 'Buyer PDF', icon: <FilePlus2 size={18} /> },
  { key: 'exportPackage', title: 'Export Package', icon: <PackagePlus size={18} /> }
]

export function ProjectDetail({
  project,
  summary,
  artworks,
  isLoading,
  onOpenFolder,
  onOpenSubfolder,
  onImportArtworks,
  onRevealArtwork,
  onRequestArtworkPreview
}: Props): React.JSX.Element {
  if (!project || !summary) {
    return (
      <section className="flex min-h-0 flex-1 flex-col bg-[#18181b]">
        <div className="mx-auto flex max-w-5xl flex-1 items-center px-8 py-10 text-zinc-400">
          {isLoading ? 'Loading project...' : 'Select a project to view its dashboard.'}
        </div>
      </section>
    )
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col bg-[#18181b]">
      <div className="border-b border-zinc-800 bg-[#202024] px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Project</p>
            <h1 className="mt-1 text-2xl font-semibold text-zinc-50">{summary.name}</h1>
            <p className="mt-2 text-sm text-zinc-400">
              {summary.slug} · {summary.status} · {summary.marketplace}
            </p>
          </div>
          <button
            className="inline-flex items-center gap-2 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-100 transition hover:border-amber-300/40 hover:text-amber-100"
            onClick={onOpenFolder}
            type="button"
          >
            <FolderOpen size={14} />
            Open Folder
          </button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <MetaStat label="Status" value={summary.status} />
          <MetaStat label="Slug" value={summary.slug} />
          <MetaStat label="Created" value={summary.createdAt} />
          <MetaStat label="Updated" value={summary.updatedAt} />
        </div>

        <p className="mt-4 max-w-4xl text-sm leading-6 text-zinc-400">
          {summary.description || 'No description yet.'}
        </p>
        <p className="mt-3 break-all text-xs text-zinc-500">{summary.fullPath}</p>
      </div>

      <div className="grid gap-6 overflow-auto px-6 py-6 xl:grid-cols-[1.3fr_0.9fr]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Workflow
              </p>
              <h2 className="mt-1 text-lg font-semibold text-zinc-100">Project sections</h2>
            </div>
            <button
              className="inline-flex items-center gap-2 rounded-md bg-amber-300 px-3 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-amber-200"
              onClick={onImportArtworks}
              type="button"
            >
              Import Artworks
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {workflowCards.map((card) => {
              const folder = summary.folders.find((item) => item.key === card.key)

              return (
                <article
                  key={card.key}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-4 text-left text-zinc-500"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-amber-300">{card.icon}</div>
                    <span className="rounded border border-zinc-700 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.14em] text-zinc-400">
                      {folder?.fileCount ?? 0} files
                    </span>
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-zinc-100">{card.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-zinc-400">
                    {folder?.description ?? 'No description available.'}
                  </p>
                  <p className="mt-3 text-xs text-zinc-500">{folder?.path ?? ''}</p>
                  <button
                    className="mt-4 inline-flex items-center gap-2 rounded-md border border-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-100 transition hover:border-amber-300/40 hover:text-amber-100"
                    onClick={() => onOpenSubfolder(card.key)}
                    type="button"
                  >
                    Open Folder
                  </button>
                </article>
              )
            })}
          </div>
        </div>

        <aside className="rounded-xl border border-zinc-800 bg-[#202024] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Artworks
              </p>
              <h2 className="mt-1 text-sm font-semibold text-zinc-100">Source imports</h2>
            </div>
            <span className="rounded border border-zinc-700 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-zinc-400">
              {artworks.length} items
            </span>
          </div>

          <div className="mt-4 grid gap-3">
            {artworks.map((artwork) => (
              <ArtworkCard
                key={artwork.id}
                artwork={artwork}
                onOpenFolder={() => onRevealArtwork(artwork.id)}
                onPreview={async () => onRequestArtworkPreview(artwork.id)}
              />
            ))}
            {artworks.length === 0 ? (
              <div className="rounded-lg border border-dashed border-zinc-800 bg-zinc-950/40 px-3 py-6 text-center text-sm text-zinc-500">
                No source artworks imported yet
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </section>
  )
}

function ArtworkCard({
  artwork,
  onOpenFolder,
  onPreview
}: {
  artwork: ArtworkItem
  onOpenFolder: () => void
  onPreview: () => Promise<string | null>
}): React.JSX.Element {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    void onPreview().then((url) => {
      if (active) setPreviewUrl(url)
    })

    return () => {
      active = false
    }
  }, [onPreview])

  return (
    <article className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <div className="aspect-[4/3] bg-zinc-900">
        {previewUrl ? (
          <img alt={artwork.originalName} className="h-full w-full object-cover" src={previewUrl} />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-zinc-500">
            Preview unavailable
          </div>
        )}
      </div>
      <div className="space-y-2 p-3">
        <p className="text-sm text-zinc-100">{artwork.filename}</p>
        <div className="grid gap-1 text-xs text-zinc-500">
          <p>{artwork.extension}</p>
          <p>{artwork.sizeBytes} bytes</p>
          <p>{artwork.importedAt}</p>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-md border border-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-100 transition hover:border-amber-300/40 hover:text-amber-100"
          onClick={onOpenFolder}
          type="button"
        >
          Open in Folder
        </button>
      </div>
    </article>
  )
}

function MetaStat({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-3">
      <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">{label}</p>
      <p className="mt-1 break-all text-sm text-zinc-100">{value}</p>
    </div>
  )
}
