# Domain Model

## Main aggregate: Workspace

A workspace is the root local folder containing projects, mockup templates, shared assets, exports, logs and the SQLite database.

```ts
type Workspace = {
  id: string
  name: string
  rootPath: string
  databasePath: string
  createdAt: string
  updatedAt: string
}
```

## EtsyProject

A project represents one Etsy listing or collection.

```ts
type EtsyProject = {
  id: string
  workspaceId: string
  name: string
  slug: string
  status: ProjectStatus
  rootPath: string
  concept?: string
  style?: string
  colorPalette?: string[]
  targetCustomer?: string
  artworkCountTarget?: number
  createdAt: string
  updatedAt: string
}

type ProjectStatus =
  | 'idea'
  | 'research'
  | 'prompting'
  | 'generating_artwork'
  | 'processing_images'
  | 'creating_mockups'
  | 'pdf_ready'
  | 'export_ready'
  | 'archived'
```

## MarketResearchNote

Stores manual research collected from Etsy or other sources.

```ts
type MarketResearchNote = {
  id: string
  projectId: string
  title: string
  sourceUrl?: string
  searchTerm?: string
  notes: string
  estimatedPrice?: number
  observedBundleSize?: number
  observedStyle?: string
  createdAt: string
  updatedAt: string
}
```

## PromptSet and PromptItem

```ts
type PromptSet = {
  id: string
  projectId: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
}

type PromptItem = {
  id: string
  promptSetId: string
  artworkIndex: number
  title?: string
  prompt: string
  negativePrompt?: string
  orientation: ArtworkOrientation
  generationTool?: 'chatgpt_image' | 'leonardo_ai' | 'midjourney' | 'other'
  status: 'draft' | 'generated' | 'imported' | 'rejected'
  linkedAssetId?: string
  createdAt: string
  updatedAt: string
}
```

## ProjectAsset

Represents a source image or generated file imported into a project.

```ts
type ProjectAsset = {
  id: string
  projectId: string
  kind: AssetKind
  originalFileName: string
  relativePath: string
  thumbnailRelativePath?: string
  width?: number
  height?: number
  orientation?: ArtworkOrientation
  sizeBytes?: number
  createdAt: string
  updatedAt: string
}

type AssetKind =
  | 'source_artwork'
  | 'upscaled_artwork'
  | 'printable_variant'
  | 'mockup_image'
  | 'buyer_pdf'
  | 'export_zip'
  | 'reference_image'

type ArtworkOrientation = 'vertical' | 'horizontal' | 'square'
```

## PrintableVariant

Represents a generated print-ready ratio file.

```ts
type PrintableVariant = {
  id: string
  projectId: string
  sourceAssetId: string
  outputAssetId: string
  ratioKey: string
  ratioWidth: number
  ratioHeight: number
  targetWidthPx: number
  targetHeightPx: number
  dpi: number
  format: 'jpg' | 'png'
  createdAt: string
}
```

## MockupTemplate

Reusable base mockup with one or more frame slots.

```ts
type MockupTemplate = {
  id: string
  workspaceId: string
  title: string
  slug: string
  backgroundAssetId: string
  backgroundRelativePath: string
  thumbnailRelativePath?: string
  width: number
  height: number
  category?: string
  tags?: string[]
  createdAt: string
  updatedAt: string
}
```

## MockupSlot

A frame area in a mockup template.

```ts
type MockupSlot = {
  id: string
  templateId: string
  label: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  ratioKey?: string
  orderIndex: number
  createdAt: string
  updatedAt: string
}
```

## MockupComposition

A saved composition of a template with project artwork assigned to slots.

```ts
type MockupComposition = {
  id: string
  projectId: string
  templateId: string
  title: string
  outputAssetId?: string
  createdAt: string
  updatedAt: string
}
```

## SlotAssignment

```ts
type SlotAssignment = {
  id: string
  compositionId: string
  slotId: string
  assetId: string
  crop: VisualCrop
  createdAt: string
  updatedAt: string
}

type VisualCrop = {
  scale: number
  offsetXPercent: number
  offsetYPercent: number
}
```

## ProcessingJob

```ts
type ProcessingJob = {
  id: string
  projectId?: string
  type: ProcessingJobType
  status: ProcessingJobStatus
  input: unknown
  output?: unknown
  errorMessage?: string
  logPath?: string
  createdAt: string
  startedAt?: string
  finishedAt?: string
}

type ProcessingJobType =
  | 'UPSCALE_IMAGE'
  | 'GENERATE_PRINTABLE_RATIOS'
  | 'RENDER_MOCKUP'
  | 'GENERATE_BUYER_PDF'
  | 'BUILD_EXPORT_PACKAGE'
  | 'UPLOAD_TO_GOOGLE_DRIVE'
  | 'PUBLISH_TO_ETSY'

type ProcessingJobStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'CANCELLED'
```

## ListingMetadata

```ts
type ListingMetadata = {
  id: string
  projectId: string
  title?: string
  description?: string
  tags: string[]
  price?: number
  quantity?: number
  section?: string
  materials?: string[]
  occasion?: string[]
  style?: string[]
  googleDriveUrl?: string
  etsyListingId?: string
  createdAt: string
  updatedAt: string
}
```

## ExportPackage

```ts
type ExportPackage = {
  id: string
  projectId: string
  name: string
  relativePath: string
  zipAssetId?: string
  includesPrintables: boolean
  includesMockups: boolean
  includesBuyerPdf: boolean
  includesListingMetadata: boolean
  createdAt: string
}
```
