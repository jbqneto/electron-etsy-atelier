# Image Pipeline

## Goal

Automate image processing for Etsy digital wall art listings.

The pipeline must support:

1. importing generated source artwork;
2. upscaling source artwork;
3. generating printable ratio variants;
4. generating listing mockups;
5. exporting final package files.

## Pipeline overview

```txt
Generated source artwork
  -> import into project
  -> optional quick mockup generation using source image
  -> upscale in background
  -> generate printable ratios from upscaled artwork
  -> optionally regenerate high-quality mockups
  -> generate buyer PDF
  -> build final export package
```

## Source artwork

Imported images go to:

```txt
source-artwork/
```

The app must detect:

- width;
- height;
- orientation;
- file format;
- size;
- thumbnail.

## Upscaling

Upscaling should be job-based.

MVP strategy:

- use external upscaler adapter;
- allow user to configure executable path;
- validate executable path;
- run with controlled arguments;
- capture stdout/stderr;
- update job status.

Do not block the UI.

Output goes to:

```txt
upscaled-artwork/
```

## Printable ratios

Printable variants should be generated from upscaled artwork whenever available.

If no upscaled artwork exists, allow generation from source image but warn the user.

## Default ratio presets

These presets should be configurable.

### Vertical artwork

```json
[
  {
    "key": "2x3",
    "ratioWidth": 2,
    "ratioHeight": 3,
    "targetWidthPx": 6000,
    "targetHeightPx": 9000,
    "dpi": 300
  },
  {
    "key": "3x4",
    "ratioWidth": 3,
    "ratioHeight": 4,
    "targetWidthPx": 5400,
    "targetHeightPx": 7200,
    "dpi": 300
  },
  {
    "key": "4x5",
    "ratioWidth": 4,
    "ratioHeight": 5,
    "targetWidthPx": 4800,
    "targetHeightPx": 6000,
    "dpi": 300
  },
  {
    "key": "5x7",
    "ratioWidth": 5,
    "ratioHeight": 7,
    "targetWidthPx": 4500,
    "targetHeightPx": 6300,
    "dpi": 300
  },
  {
    "key": "11x14",
    "ratioWidth": 11,
    "ratioHeight": 14,
    "targetWidthPx": 3300,
    "targetHeightPx": 4200,
    "dpi": 300
  }
]
```

### Horizontal artwork

Horizontal presets are usually the swapped versions:

```json
[
  { "key": "3x2", "ratioWidth": 3, "ratioHeight": 2 },
  { "key": "4x3", "ratioWidth": 4, "ratioHeight": 3 },
  { "key": "5x4", "ratioWidth": 5, "ratioHeight": 4 },
  { "key": "7x5", "ratioWidth": 7, "ratioHeight": 5 },
  { "key": "14x11", "ratioWidth": 14, "ratioHeight": 11 }
]
```

Target dimensions should be configurable per preset.

## Crop strategy

Use center crop by default.

Future improvement:

- manual crop editor;
- per-ratio crop memory;
- face/object-aware crop is out of scope for now.

## Sharp operations

Use Sharp for:

- metadata reading;
- resize;
- crop/extract;
- format conversion;
- compositing;
- thumbnail generation.

Recommended output defaults:

- JPEG quality: 92;
- PNG for transparent assets only;
- preserve or set metadata where useful;
- avoid huge intermediate files when not needed.

## Mockup images

Mockup generation can use:

- source artwork for fast listing previews;
- upscaled artwork for final higher-quality mockups.

This should be a project-level or composition-level option.

## Output naming

Printable variant:

```txt
{artworkNumber}-{artworkSlug}-{ratioKey}-{width}x{height}.jpg
```

Example:

```txt
001-vintage-landscape-2x3-6000x9000.jpg
```

Mockup:

```txt
{order}-{templateSlug}-{projectSlug}.jpg
```

Example:

```txt
01-gallery-wall-8-frames-vintage-landscape-bundle.jpg
```

## Job input examples

### Generate ratios

```json
{
  "projectId": "project-001",
  "sourceAssetId": "asset-upscaled-001",
  "presets": ["2x3", "3x4", "4x5", "5x7", "11x14"],
  "format": "jpg",
  "quality": 92
}
```

### Render mockup

```json
{
  "projectId": "project-001",
  "templateId": "template-001",
  "compositionId": "composition-001",
  "outputFormat": "jpg",
  "quality": 92
}
```

## UX requirements

The UI must show:

- pending jobs;
- running jobs;
- completed jobs;
- failed jobs;
- progress if available;
- logs/details on demand.

The user must be able to continue working on mockups while upscaling jobs run.
