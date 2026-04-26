# Workspace and File Structure

## Workspace root

The user selects a local workspace folder.

Example:

```txt
TheAtelierWorkspace/
  .atelier/
    atelier.sqlite
    settings.json
    logs/
    temp/
  projects/
  mockup-templates/
  shared-assets/
  exports/
```

## Project folder

Each Etsy project gets one folder under `projects/`.

```txt
projects/
  english-botanical-garden-collection/
    project.json
    research/
      market-research.md
      competitors.json
    prompts/
      prompts.json
      prompt-notes.md
    source-artworks/
      001-original.png
      002-original.png
    upscaled/
      001-upscaled.png
      002-upscaled.png
    printable-variants/
      001/
        2x3/
        3x4/
        4x5/
        5x7/
        11x14/
      002/
        2x3/
        3x4/
        4x5/
        5x7/
        11x14/
    mockups/
      listing-images/
        01-main.jpg
        02-living-room.jpg
        03-gallery-wall.jpg
    buyer-pdf/
      buyer-instructions.pdf
    listing/
      listing-metadata.json
      title.txt
      description.md
      tags.json
    exports/
      final-package/
      final-package.zip
    thumbnails/
```

## Mockup template folder

Mockup templates are reusable across projects.

```txt
mockup-templates/
  living-room-8-vertical-frames/
    template.json
    background.jpg
    thumbnail.jpg
  cozy-reading-nook-single-frame/
    template.json
    background.jpg
    thumbnail.jpg
```

## Shared assets

For future reusable decorative assets:

```txt
shared-assets/
  frames/
  plants/
  candles/
  books/
  textures/
  logos/
```

## Export package structure

Final customer-facing package can be built as:

```txt
exports/
  english-botanical-garden-collection-final/
    Buyer Instructions.pdf
    Printable Files/
      2x3 Ratio/
      3x4 Ratio/
      4x5 Ratio/
      5x7 Ratio/
      11x14 Ratio/
    Listing Preview Images/
      01-main.jpg
      02-room.jpg
      03-gallery-wall.jpg
    listing-metadata.json
```

If using Google Drive later, the uploaded customer folder may contain only:

```txt
Google Drive Customer Folder/
  2x3 Ratio/
  3x4 Ratio/
  4x5 Ratio/
  5x7 Ratio/
  11x14 Ratio/
  README.pdf
```

The Etsy listing may receive a small buyer PDF containing the Drive link.

## Naming rules

Use predictable names:

```txt
{artworkNumber}-{slug}-{ratioKey}-{width}x{height}.{ext}
```

Examples:

```txt
001-botanical-fern-2x3-6000x9000.jpg
001-botanical-fern-3x4-5400x7200.jpg
001-botanical-fern-4x5-4800x6000.jpg
```

For mockups:

```txt
{order}-{templateSlug}-{projectSlug}.jpg
```

Example:

```txt
01-living-room-8-vertical-frames-english-botanical-garden.jpg
```

## Path handling rules

- Store workspace root as absolute path.
- Store project and asset paths as workspace-relative paths.
- Normalize paths using Node `path` utilities.
- Prevent path traversal.
- Never write outside the workspace unless using explicit export dialog.
