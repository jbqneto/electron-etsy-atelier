# AGENTS.md

This file contains mandatory instructions for Codex and any AI coding agent working on The Atelier Desktop.

## Project identity

The Atelier Desktop is a local-first Electron application for Etsy digital wall art production.

The goal is not to create a generic image editor. The goal is to automate a very specific production pipeline:

1. research an Etsy product idea;
2. define concept, style, palette and listing strategy;
3. create prompts for image generation;
4. import generated images into a local project;
5. upscale source images;
6. generate printable ratios;
7. create listing mockups from reusable mockup templates;
8. generate buyer instruction PDF;
9. build a final export package;
10. later upload to Google Drive;
11. later publish or draft on Etsy.

## Working language

- Code, comments, filenames, DTOs, types, database columns and APIs must be written in English.
- UI copy may be English by default because Etsy listings are mostly targeted internationally.

## Non-negotiable technical rules

1. Do not enable `nodeIntegration` in the renderer.
2. Keep `contextIsolation` enabled.
3. Do not expose raw `ipcRenderer`, `fs`, `path`, `child_process`, `shell`, `sqlite` or `sharp` to the renderer.
4. Use preload APIs as narrow typed contracts.
5. Main process owns filesystem, SQLite, Sharp and external process execution.
6. Renderer owns UI and user interaction only.
7. Validate all IPC inputs with Zod or equivalent runtime validation.
8. Never execute arbitrary shell commands from user input.
9. External tools such as upscalers must be configured through whitelisted executable paths.
10. All file operations must stay inside the configured workspace unless the user explicitly imports/exports via a native file dialog.

## Implementation approach

Work in small vertical slices.

Each slice should include:

- domain type/schema;
- main process service;
- IPC handler;
- preload bridge method;
- renderer hook/store;
- UI screen/component;
- basic tests where practical;
- documentation update when behavior changes.

Do not implement large speculative features.

There is another project with some implementation already done, check there for example or even copying the existing funcionalities

Project folder: /home/jbqneto/Documentos/development/projects/tool-belt

## Architecture style

Use a modular structure:

```txt
src/
  main/
    ipc/
    services/
    repositories/
    jobs/
    db/
    external-tools/
  preload/
  renderer/
    app/
    components/
    features/
    stores/
  shared/
    contracts/
    schemas/
    types/
```

Prefer dependency direction:

```txt
renderer -> preload contracts -> IPC -> main services -> repositories/filesystem/external tools
```

Shared code must contain only pure types, schemas and helpers. Shared code must not import Electron, Node filesystem APIs, SQLite, Sharp or browser-only APIs.

## UI guidance

Use the existing tool screenshots as visual reference:

- dark IDE-like UI;
- left navigation with grouped categories;
- large editorial page titles;
- gold/accent action buttons;
- tabbed tool interface;
- template builder and mockup composer as two modes of the same feature;
- cards for templates, frames, metadata and preview;
- job logs in a lower or side panel.

Avoid clutter. This is a production tool, not a marketing landing page.

## Domain vocabulary

Use these names consistently:

- Workspace
- EtsyProject
- ProjectAsset
- Artwork
- UpscaledArtwork
- PrintableVariant
- MockupTemplate
- MockupSlot
- MockupComposition
- SlotAssignment
- VisualCrop
- ProcessingJob
- ExportPackage
- BuyerInstructionsPdf
- ListingMetadata
- MarketResearchNote
- PromptSet

## MVP priorities

Build in this order:

1. Electron base with React, TypeScript and secure preload.
2. Workspace selection and persistence.
3. SQLite setup and migrations.
4. Project creation with folder structure.
5. Project explorer and asset import.
6. Mockup template builder.
7. Mockup composer.
8. Image ratio generator with Sharp.
9. Processing job queue.
10. Buyer PDF generator.
11. Export package builder.

Google Drive and Etsy API must not be implemented in MVP unless explicitly requested.

## History

Create and maintain a LOG file with your code activies under docs/WORK_LOGS.md, always add new lines with a brief summary of what you did in this format: "DD/MM/YYYY HH:mm - $briefSummary"

## Database policy

Use SQLite for structured metadata.

Keep assets as files in the workspace. Do not store image binaries inside SQLite.

Use JSON snapshots inside project folders for portability, but SQLite is the primary local index.

## Filesystem policy

A project must be portable. Generated artifacts must be deterministic and stored in predictable folders.

A project folder should be understandable even without opening the app.

## Image processing policy

- Use Sharp for crop, resize, format conversion and compositing.
- Upscaling will be done using upscayl, just as is done in "/home/jbqneto/Documentos/development/projects/tool-belt/scripts/run-image-upscale.mjs" (copy if necessary)
- Heavy image processing must run through the main process job system, never directly inside renderer UI code.
- The UI must remain responsive while jobs are running and always updating the user on whats happening

## Mockup policy

The MVP supports rectangular frame slots:

- x;
- y;
- width;
- height;
- rotation;
- optional ratio;
- optional label.

Perspective/four-corner warping is out of scope for MVP unless explicitly requested.

## Testing policy

At minimum:

- unit test pure domain functions;
- test path normalization and workspace guard;
- test mockup slot serialization;
- test printable ratio calculation;
- test image job input validation;
- test project folder creation.

Do not block progress by over-engineering tests before the architecture stabilizes.

## Documentation policy

When adding or changing a feature, update the relevant file in `docs/`.

Do not let docs drift from implementation.

## What not to do

- Do not turn this into a generic Canva clone.
- Do not introduce cloud accounts in MVP.
- Do not implement Etsy scraping.
- Do not put business logic inside React components.
- Do not store absolute paths everywhere without also storing workspace-relative paths.
- Do not silently overwrite generated files. Use versioned or deterministic names.
- Do not make large unrelated refactors without an explicit request.
