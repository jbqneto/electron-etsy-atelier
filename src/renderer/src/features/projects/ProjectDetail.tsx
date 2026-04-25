import {
  ExternalLink,
  FileText,
  FolderOpen,
  ImageDown,
  Import,
  Layers3,
  NotebookTabs,
  PackagePlus,
  SearchX,
  type LucideIcon
} from 'lucide-react'
import { useEffect, useEffectEvent, useState } from 'react'

import {
  formatCoverage,
  getPrintableRatioPresets,
  getRatioSuitabilityForPreset,
  type ArtworkOrientation,
  type CropSuitability,
  type ImageCard,
  type UpdateImageCardInput
} from '../../../../shared/image-pipeline'
import type { ArtworkItem, FolderKey, ProjectSummary } from '../../../../shared/types/ipc'
import type { Project } from '../../../../shared/types/project'

type Props = {
  project: Project | null
  summary: ProjectSummary | null
  artworks: ArtworkItem[]
  imageCards: ImageCard[]
  error: string | null
  isLoading: boolean
  onImportArtworks: () => void
  onGeneratePrintableRatios: () => void
  onScanSourceArtworks: () => void
  onUpdateImageCard: (cardId: string, input: UpdateImageCardInput) => void
  onOpenFolder: () => void
  onOpenSubfolder: (folderKey: FolderKey) => void
  onRequestArtworkPreview: (artworkId: string) => Promise<string | null>
  onRevealArtwork: (artworkId: string) => void
}

const workflowCards: Array<{
  key: FolderKey
  title: string
  icon: LucideIcon
}> = [
  { key: 'sourceArtworks', title: 'Source Artworks', icon: ImageDown },
  { key: 'upscaled', title: 'Upscaled Images', icon: Layers3 },
  { key: 'printableRatios', title: 'Printable Ratios', icon: NotebookTabs },
  { key: 'mockups', title: 'Mockups', icon: PackagePlus },
  { key: 'pdf', title: 'Buyer PDF', icon: FileText },
  { key: 'exportPackage', title: 'Export Package', icon: PackagePlus }
]

export function ProjectDetail({
  project,
  summary,
  artworks,
  imageCards,
  error,
  isLoading,
  onImportArtworks,
  onGeneratePrintableRatios,
  onScanSourceArtworks,
  onUpdateImageCard,
  onOpenFolder,
  onOpenSubfolder,
  onRequestArtworkPreview,
  onRevealArtwork
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

      <div className="overflow-auto px-6 py-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Workflow
              </p>
              <h2 className="mt-1 text-lg font-semibold text-zinc-100">Project sections</h2>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {workflowCards.map((card) => {
              const folder = summary.folders.find((item) => item.key === card.key)
              const Icon = card.icon

              return (
                <article
                  key={card.key}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-4 text-left text-zinc-500"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-amber-300">
                      <Icon size={18} />
                    </div>
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
                    <ExternalLink size={14} />
                    Open Folder
                  </button>
                </article>
              )
            })}
          </div>

          <section className="border-t border-zinc-800 pt-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Source Artworks
                </p>
                <h2 className="mt-1 text-lg font-semibold text-zinc-100">Imported source images</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded border border-zinc-700 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-zinc-400">
                  {artworks.length} items
                </span>
                <button
                  className="inline-flex items-center gap-2 rounded-md bg-amber-300 px-3 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-amber-200"
                  onClick={onImportArtworks}
                  type="button"
                >
                  <Import size={14} />
                  Import Artworks
                </button>
              </div>
            </div>

            {error ? (
              <div className="mt-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            {isLoading ? (
              <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-8 text-center text-sm text-zinc-500">
                Loading source artworks...
              </div>
            ) : artworks.length === 0 ? (
              <div className="mt-4 grid place-items-center rounded-lg border border-dashed border-zinc-800 bg-zinc-950/40 px-3 py-10 text-center">
                <SearchX size={24} className="text-zinc-600" />
                <p className="mt-3 text-sm text-zinc-500">No source artworks imported yet</p>
              </div>
            ) : (
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {artworks.map((artwork) => (
                  <ArtworkCard
                    key={artwork.id}
                    artwork={artwork}
                    onPreview={() => onRequestArtworkPreview(artwork.id)}
                    onReveal={() => onRevealArtwork(artwork.id)}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="border-t border-zinc-800 pt-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Image Pipeline
                </p>
                <h2 className="mt-1 text-lg font-semibold text-zinc-100">Persistent image cards</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded border border-zinc-700 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-zinc-400">
                  {imageCards.length} cards
                </span>
                <button
                  className="inline-flex items-center gap-2 rounded-md border border-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-100 transition hover:border-amber-300/40 hover:text-amber-100"
                  onClick={() => onOpenSubfolder('printableRatios')}
                  type="button"
                >
                  <ExternalLink size={14} />
                  Open Ratios Folder
                </button>
                <button
                  className="inline-flex items-center gap-2 rounded-md border border-amber-300/40 bg-amber-300/10 px-3 py-2 text-xs font-semibold text-amber-100 transition hover:bg-amber-300 hover:text-zinc-950"
                  onClick={onScanSourceArtworks}
                  type="button"
                >
                  <ImageDown size={14} />
                  Scan Source Artworks
                </button>
                <button
                  className="inline-flex items-center gap-2 rounded-md bg-amber-300 px-3 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-amber-200"
                  onClick={onGeneratePrintableRatios}
                  type="button"
                >
                  <PackagePlus size={14} />
                  Generate Printable Ratios
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-8 text-center text-sm text-zinc-500">
                Loading image cards...
              </div>
            ) : imageCards.length === 0 ? (
              <div className="mt-4 rounded-lg border border-dashed border-zinc-800 bg-zinc-950/40 px-3 py-8 text-center text-sm text-zinc-500">
                No image cards yet. Scan source artworks after importing images.
              </div>
            ) : (
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {imageCards.map((card) => (
                  <ImageCardPanel key={card.id} card={card} onUpdate={onUpdateImageCard} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </section>
  )
}

function ImageCardPanel({
  card,
  onUpdate
}: {
  card: ImageCard
  onUpdate: (cardId: string, input: UpdateImageCardInput) => void
}): React.JSX.Element {
  const selectedRatioCount = Object.values(card.ratioSelections).filter(
    (selection) => selection.selected
  ).length
  const ratioGroups = getPrintableRatioPresets(card.outputOrientation, {
    includeBonusGroups: true
  })

  return (
    <article className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-zinc-100" title={card.fileName}>
            {card.fileName}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            {card.width}x{card.height}px · {card.format}
            {card.density ? ` · ${card.density} DPI` : ''}
          </p>
        </div>
        <span className="rounded border border-zinc-700 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.14em] text-zinc-400">
          {selectedRatioCount} selected · {card.outputs.length} outputs
        </span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <PipelineStat label="Source" value={card.sourceOrientation} />
        <PipelineStat label="Output" value={card.outputOrientation} />
      </div>
      <div className="mt-3 flex rounded-md border border-zinc-800 bg-zinc-950/60 p-1">
        {(['portrait', 'landscape'] as ArtworkOrientation[]).map((orientation) => {
          const isActive = card.outputOrientation === orientation

          return (
            <button
              key={orientation}
              className={`flex-1 rounded px-2 py-1.5 text-xs font-semibold capitalize transition ${
                isActive
                  ? 'bg-amber-300 text-zinc-950'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
              }`}
              onClick={() => {
                if (!isActive) onUpdate(card.id, { outputOrientation: orientation })
              }}
              type="button"
            >
              {orientation}
            </button>
          )
        })}
      </div>
      <div className="mt-4 space-y-2">
        {ratioGroups.map((ratioGroup) => {
          const selection =
            card.ratioSelections[ratioGroup.key] ??
            getRatioSuitabilityForPreset(card.width, card.height, ratioGroup)
          const selected = selection.selected

          return (
            <div
              key={ratioGroup.key}
              className={`rounded-md border px-2.5 py-2 ${
                selected ? 'border-amber-300/30 bg-amber-300/10' : 'border-zinc-800 bg-zinc-950/45'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-semibold text-zinc-100">{ratioGroup.label}</p>
                    <SuitabilityBadge value={selection.suitability} />
                  </div>
                  <p
                    className="mt-1 truncate text-[11px] text-zinc-500"
                    title={ratioGroup.folderName}
                  >
                    {ratioGroup.folderName}
                  </p>
                </div>
                <button
                  className={`shrink-0 rounded border px-2 py-1 text-[11px] font-semibold transition ${
                    selected
                      ? 'border-amber-300 bg-amber-300 text-zinc-950'
                      : 'border-zinc-700 text-zinc-300 hover:border-amber-300/50 hover:text-amber-100'
                  }`}
                  onClick={() =>
                    onUpdate(card.id, {
                      ratioSelections: { [ratioGroup.key]: { selected: !selected } }
                    })
                  }
                  type="button"
                >
                  {selected ? 'Enabled' : 'Disabled'}
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between gap-3 text-[11px] text-zinc-500">
                <span>{formatCoverage(selection.coverage)}</span>
                <span>{ratioGroup.exports.length} sizes</span>
              </div>
            </div>
          )
        })}
      </div>
      <p className="mt-3 text-xs text-zinc-500">Scanned: {card.metadataScannedAt}</p>
    </article>
  )
}

function SuitabilityBadge({ value }: { value: CropSuitability }): React.JSX.Element {
  const label = value.replace('_', ' ')
  const classes: Record<CropSuitability, string> = {
    excellent: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
    good: 'border-lime-400/30 bg-lime-400/10 text-lime-200',
    acceptable: 'border-amber-300/30 bg-amber-300/10 text-amber-100',
    aggressive: 'border-orange-400/30 bg-orange-400/10 text-orange-200',
    not_recommended: 'border-red-400/30 bg-red-400/10 text-red-200'
  }

  return (
    <span
      className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] ${classes[value]}`}
    >
      {label}
    </span>
  )
}

function PipelineStat({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <div className="rounded border border-zinc-800 bg-zinc-950/55 px-2 py-2">
      <p className="text-[10px] uppercase tracking-[0.14em] text-zinc-600">{label}</p>
      <p className="mt-1 text-zinc-200">{value}</p>
    </div>
  )
}

function ArtworkCard({
  artwork,
  onPreview,
  onReveal
}: {
  artwork: ArtworkItem
  onPreview: () => Promise<string | null>
  onReveal: () => void
}): React.JSX.Element {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLoadingPreview, setIsLoadingPreview] = useState(true)

  const loadPreview = useEffectEvent(async () => {
    const url = await onPreview()
    setPreviewUrl(url)
    setIsLoadingPreview(false)
  })

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadPreview()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [artwork.id])

  return (
    <article className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/80">
      <div className="aspect-[4/3] bg-zinc-950">
        {previewUrl ? (
          <img alt={artwork.originalName} className="h-full w-full object-cover" src={previewUrl} />
        ) : (
          <div className="grid h-full place-items-center px-3 text-center text-xs text-zinc-500">
            {isLoadingPreview ? 'Loading preview...' : 'Preview unavailable'}
          </div>
        )}
      </div>
      <div className="space-y-3 p-3">
        <div>
          <p className="truncate text-sm font-medium text-zinc-100" title={artwork.filename}>
            {artwork.filename}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            {artwork.extension} · {formatBytes(artwork.sizeBytes)}
          </p>
        </div>
        <p className="text-xs text-zinc-500">{artwork.importedAt}</p>
        <button
          className="inline-flex items-center gap-2 rounded-md border border-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-100 transition hover:border-amber-300/40 hover:text-amber-100"
          onClick={onReveal}
          type="button"
        >
          <ExternalLink size={14} />
          Reveal
        </button>
      </div>
    </article>
  )
}

function formatBytes(value: number): string {
  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`
  return `${(value / 1024 / 1024).toFixed(1)} MB`
}

function MetaStat({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-3">
      <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">{label}</p>
      <p className="mt-1 break-all text-sm text-zinc-100">{value}</p>
    </div>
  )
}
