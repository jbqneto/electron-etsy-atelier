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

type DetailSection = 'overview' | 'artworks' | 'pipeline'

const detailSections: Array<{ key: DetailSection; label: string }> = [
  { key: 'overview', label: 'Overview' },
  { key: 'artworks', label: 'Artworks Library' },
  { key: 'pipeline', label: 'Image Pipeline' }
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
  const [activeSection, setActiveSection] = useState<DetailSection>('overview')

  if (!project || !summary) {
    return (
      <section className="flex min-h-0 flex-1 flex-col bg-[#111317]">
        <div className="grid flex-1 place-items-center px-8 py-10">
          <div className="w-full max-w-2xl rounded-[28px] border border-white/6 bg-white/[0.03] p-8 text-zinc-400 shadow-[0_24px_60px_rgba(0,0,0,0.24)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
              Project workspace
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-zinc-50">
              {isLoading ? 'Loading project' : 'Select a project to view its dashboard'}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400">
              The center panel will show the project overview, source artworks, and image pipeline
              when a project is selected.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col bg-[#111317]">
      <div className="border-b border-white/5 bg-[#12151a]/90 px-6 py-5 backdrop-blur-xl">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
              Project
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-[-0.04em] text-zinc-50">
                {summary.name}
              </h1>
              <span className="rounded-full border border-white/5 bg-white/[0.03] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500">
                {summary.marketplace}
              </span>
              <span className="rounded-full border border-amber-300/15 bg-amber-300/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-amber-200">
                {summary.status}
              </span>
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
              {summary.description || 'No description yet.'}
            </p>
            <p className="mt-3 break-all text-xs text-zinc-500">{summary.fullPath}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              className="inline-flex items-center gap-2 rounded-xl border border-white/8 px-3 py-2 text-xs font-semibold text-zinc-100 transition duration-200 hover:border-amber-300/40 hover:text-amber-100 active:translate-y-px"
              onClick={onOpenFolder}
              type="button"
            >
              <FolderOpen size={14} />
              Open Folder
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-xl bg-amber-300 px-3 py-2 text-xs font-semibold text-zinc-950 transition duration-200 hover:bg-amber-200 active:translate-y-px"
              onClick={onImportArtworks}
              type="button"
            >
              <Import size={14} />
              Import Artworks
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {detailSections.map((section) => {
            const active = section.key === activeSection
            return (
              <button
                key={section.key}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition duration-200 ${
                  active
                    ? 'border-amber-300/25 bg-amber-300/10 text-amber-100'
                    : 'border-white/6 bg-white/[0.02] text-zinc-500 hover:border-white/10 hover:bg-white/[0.05] hover:text-zinc-100'
                }`}
                onClick={() => setActiveSection(section.key)}
                type="button"
              >
                {section.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto px-6 py-6">
        <div className="grid min-h-0 gap-6 2xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 space-y-6">
            <section className="rounded-[28px] border border-white/5 bg-white/[0.025] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.18)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
                    Project status
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <ProjectStat label="Status" value={summary.status} />
                    <ProjectStat label="Slug" value={summary.slug} />
                    <ProjectStat label="Created" value={summary.createdAt.slice(0, 10)} />
                    <ProjectStat label="Updated" value={summary.updatedAt.slice(0, 10)} />
                  </div>
                </div>
              </div>
            </section>

            {activeSection === 'overview' ? (
              <section className="space-y-4">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
                      Workflow
                    </p>
                    <h2 className="mt-1 text-lg font-semibold tracking-[-0.02em] text-zinc-50">
                      Project sections
                    </h2>
                  </div>
                </div>

                <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
                  {workflowCards.map((card) => {
                    const folder = summary.folders.find((item) => item.key === card.key)
                    const Icon = card.icon

                    return (
                      <article
                        key={card.key}
                        className="rounded-[24px] border border-white/5 bg-white/[0.025] p-4 transition duration-200 hover:border-white/10 hover:bg-white/[0.04]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="grid size-10 place-items-center rounded-2xl border border-amber-300/15 bg-amber-300/10 text-amber-200">
                            <Icon size={18} strokeWidth={1.8} />
                          </div>
                          <span className="rounded-full border border-white/6 bg-white/[0.03] px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-zinc-400">
                            {folder?.fileCount ?? 0} files
                          </span>
                        </div>
                        <h3 className="mt-3 text-sm font-semibold text-zinc-50">{card.title}</h3>
                        <p className="mt-2 text-xs leading-5 text-zinc-400">
                          {folder?.description ?? 'No description available.'}
                        </p>
                        <button
                          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/8 px-3 py-2 text-xs font-semibold text-zinc-100 transition duration-200 hover:border-amber-300/40 hover:text-amber-100"
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
              </section>
            ) : null}

            {activeSection === 'artworks' ? (
              <section className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
                      Source artworks
                    </p>
                    <h2 className="mt-1 text-lg font-semibold tracking-[-0.02em] text-zinc-50">
                      Imported source images
                    </h2>
                  </div>
                  <span className="rounded-full border border-white/6 bg-white/[0.03] px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-zinc-400">
                    {artworks.length} items
                  </span>
                </div>

                {error ? (
                  <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-200">
                    {error}
                  </div>
                ) : null}

                {isLoading ? (
                  <div className="rounded-[24px] border border-white/5 bg-white/[0.025] px-3 py-10 text-center text-sm text-zinc-500">
                    Loading source artworks...
                  </div>
                ) : artworks.length === 0 ? (
                  <div className="grid place-items-center rounded-[24px] border border-dashed border-white/8 bg-white/[0.02] px-3 py-12 text-center">
                    <SearchX size={24} className="text-zinc-600" />
                    <p className="mt-3 text-sm text-zinc-500">No source artworks imported yet</p>
                    <button
                      className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-300 px-3 py-2 text-xs font-semibold text-zinc-950 transition duration-200 hover:bg-amber-200"
                      onClick={onImportArtworks}
                      type="button"
                    >
                      <Import size={14} />
                      Import Artworks
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
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
            ) : null}

            {activeSection === 'pipeline' ? (
              <section className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
                      Image pipeline
                    </p>
                    <h2 className="mt-1 text-lg font-semibold tracking-[-0.02em] text-zinc-50">
                      Persistent image cards
                    </h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-white/6 bg-white/[0.03] px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-zinc-400">
                      {imageCards.length} cards
                    </span>
                    <button
                      className="inline-flex items-center gap-2 rounded-xl border border-white/8 px-3 py-2 text-xs font-semibold text-zinc-100 transition duration-200 hover:border-amber-300/40 hover:text-amber-100"
                      onClick={() => onOpenSubfolder('printableRatios')}
                      type="button"
                    >
                      <ExternalLink size={14} />
                      Open Ratios Folder
                    </button>
                    <button
                      className="inline-flex items-center gap-2 rounded-xl border border-amber-300/25 bg-amber-300/10 px-3 py-2 text-xs font-semibold text-amber-100 transition duration-200 hover:bg-amber-300 hover:text-zinc-950"
                      onClick={onScanSourceArtworks}
                      type="button"
                    >
                      <ImageDown size={14} />
                      Scan Source Artworks
                    </button>
                    <button
                      className="inline-flex items-center gap-2 rounded-xl bg-amber-300 px-3 py-2 text-xs font-semibold text-zinc-950 transition duration-200 hover:bg-amber-200"
                      onClick={onGeneratePrintableRatios}
                      type="button"
                    >
                      <PackagePlus size={14} />
                      Generate Printable Ratios
                    </button>
                  </div>
                </div>

                {isLoading ? (
                  <div className="rounded-[24px] border border-white/5 bg-white/[0.025] px-3 py-10 text-center text-sm text-zinc-500">
                    Loading image cards...
                  </div>
                ) : imageCards.length === 0 ? (
                  <div className="rounded-[24px] border border-dashed border-white/8 bg-white/[0.02] px-3 py-10 text-center text-sm text-zinc-500">
                    No image cards yet. Scan source artworks after importing images.
                  </div>
                ) : (
                  <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
                    {imageCards.map((card) => (
                      <ImageCardPanel key={card.id} card={card} onUpdate={onUpdateImageCard} />
                    ))}
                  </div>
                )}
              </section>
            ) : null}
          </div>

          <aside className="space-y-4 2xl:sticky 2xl:top-6 2xl:h-fit">
            <div className="rounded-[28px] border border-white/5 bg-white/[0.03] p-4 shadow-[0_24px_60px_rgba(0,0,0,0.18)]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
                Selected project
              </p>
              <div className="mt-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-zinc-50">{summary.name}</p>
                  <p className="mt-1 truncate text-xs text-zinc-500">{summary.slug}</p>
                </div>
                <span className="rounded-full border border-white/6 bg-white/[0.03] px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-zinc-400">
                  {summary.status}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <ProjectStat label="Created" value={summary.createdAt.slice(0, 10)} />
                <ProjectStat label="Updated" value={summary.updatedAt.slice(0, 10)} />
              </div>

              <div className="mt-4 rounded-2xl border border-white/5 bg-white/[0.025] p-3">
                <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                  Description
                </p>
                <p className="mt-2 text-sm leading-6 text-zinc-300">
                  {summary.description || 'No description yet.'}
                </p>
              </div>

              <div className="mt-4 space-y-2">
                <button
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-300 px-3 py-2.5 text-xs font-semibold text-zinc-950 transition duration-200 hover:bg-amber-200"
                  onClick={onImportArtworks}
                  type="button"
                >
                  <Import size={14} />
                  Import Artworks
                </button>
                <button
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/8 px-3 py-2.5 text-xs font-semibold text-zinc-100 transition duration-200 hover:border-amber-300/40 hover:text-amber-100"
                  onClick={onOpenFolder}
                  type="button"
                >
                  <FolderOpen size={14} />
                  Open Project Folder
                </button>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/5 bg-white/[0.025] p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
                Project sections
              </p>
              <div className="mt-3 space-y-2">
                {summary.folders.map((folder) => (
                  <button
                    key={folder.key}
                    className="flex w-full items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] px-3 py-2.5 text-left transition duration-200 hover:border-amber-300/30 hover:bg-white/[0.04]"
                    onClick={() => onOpenSubfolder(folder.key)}
                    type="button"
                  >
                    <div>
                      <p className="text-sm font-medium text-zinc-50">{folder.label}</p>
                      <p className="mt-1 text-xs text-zinc-500">{folder.path}</p>
                    </div>
                    <span className="rounded-full border border-white/6 bg-white/[0.03] px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-zinc-400">
                      {folder.fileCount}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

function ProjectStat({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.025] px-3 py-2.5">
      <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">{label}</p>
      <p className="mt-1 truncate text-xs font-medium text-zinc-100">{value}</p>
    </div>
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
    <article className="rounded-[24px] border border-white/5 bg-white/[0.025] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-zinc-50" title={card.fileName}>
            {card.fileName}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            {card.width}x{card.height}px · {card.format}
            {card.density ? ` · ${card.density} DPI` : ''}
          </p>
        </div>
        <span className="rounded-full border border-white/6 bg-white/[0.03] px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-zinc-400">
          {selectedRatioCount} selected · {card.outputs.length} outputs
        </span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <PipelineStat label="Source" value={card.sourceOrientation} />
        <PipelineStat label="Output" value={card.outputOrientation} />
      </div>
      <div className="mt-3 flex rounded-2xl border border-white/5 bg-white/[0.02] p-1">
        {(['portrait', 'landscape'] as ArtworkOrientation[]).map((orientation) => {
          const isActive = card.outputOrientation === orientation

          return (
            <button
              key={orientation}
              className={`flex-1 rounded-xl px-2 py-1.5 text-xs font-semibold capitalize transition duration-200 ${
                isActive
                  ? 'bg-amber-300 text-zinc-950'
                  : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-100'
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
              className={`rounded-2xl border px-3 py-2.5 ${
                selected
                  ? 'border-amber-300/25 bg-amber-300/10'
                  : 'border-white/5 bg-white/[0.02]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-semibold text-zinc-50">{ratioGroup.label}</p>
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
                  className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition duration-200 ${
                    selected
                      ? 'border-amber-300 bg-amber-300 text-zinc-950'
                      : 'border-white/8 text-zinc-300 hover:border-amber-300/50 hover:text-amber-100'
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
      className={`rounded-full border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] ${classes[value]}`}
    >
      {label}
    </span>
  )
}

function PipelineStat({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] px-2.5 py-2">
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
    <article className="overflow-hidden rounded-[24px] border border-white/5 bg-white/[0.025]">
      <div className="aspect-[4/3] bg-zinc-950">
        {previewUrl ? (
          <img alt={artwork.originalName} className="h-full w-full object-cover" src={previewUrl} />
        ) : (
          <div className="grid h-full place-items-center px-3 text-center text-xs text-zinc-500">
            {isLoadingPreview ? 'Loading preview...' : 'Preview unavailable'}
          </div>
        )}
      </div>
      <div className="space-y-3 p-3.5">
        <div>
          <p className="truncate text-sm font-medium text-zinc-50" title={artwork.filename}>
            {artwork.filename}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            {artwork.extension} · {formatBytes(artwork.sizeBytes)}
          </p>
        </div>
        <p className="text-xs text-zinc-500">{artwork.importedAt}</p>
        <button
          className="inline-flex items-center gap-2 rounded-xl border border-white/8 px-3 py-2 text-xs font-semibold text-zinc-100 transition duration-200 hover:border-amber-300/40 hover:text-amber-100"
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
