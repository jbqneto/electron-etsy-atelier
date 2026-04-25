# The Atelier Desktop

The Atelier Desktop is a local-first Electron app for Etsy digital wall art production. Sprint 1 covers the secure desktop shell, workspace/project management, source artwork import/gallery, and a basic in-memory jobs panel.

## Stack

- Electron
- electron-vite
- React
- TypeScript
- Tailwind CSS v4
- Zod
- Zustand
- Lucide React

## Run

```bash
npm install
npm run dev
```

Validation:

```bash
npm run lint
npm run typecheck
npm run build
```

## Workspace concept

A workspace is a local folder chosen by the user. The app initializes it with:

```txt
atelier-workspace/
  atelier.config.json
  .atelier/
    workspace.json
  projects/
  mockup-templates/
  assets/
  exports/
```

The selected workspace path is persisted in Electron `userData` as a JSON settings file so the app can restore the last workspace on startup. The workspace itself stores metadata in `atelier.config.json`.

## Project concept

Projects live inside the active workspace:

```txt
projects/
  project-slug/
    project.json
    01-source-artworks/
    02-upscaled/
    03-printable-ratios/
    04-mockups/
    05-pdf/
    06-export-package/
```

Project slugs are generated from the project name and made unique automatically.

## Current scope

- Secure Electron architecture with `contextIsolation: true` and `nodeIntegration: false`
- Typed IPC bridge exposed through `window.atelier`
- Workspace selection and initialization
- Workspace persistence in Electron userData JSON
- Project creation, listing and folder opening
- Project dashboard with workflow sections and source artwork gallery
- Source artwork import into `01-source-artworks`
- Artwork metadata stored in `.atelier-artworks.json`
- Safe local previews served through main-process IPC as data URLs
- In-memory jobs panel with demo progress jobs
- VS Code-like dark shell with workspace and project explorer

## Not implemented yet

- SQLite
- image upscaling
- ratio generation
- mockup templates
- mockup composer
- buyer PDF generation
- Google Drive integration
- Etsy API integration

## Next steps

1. Add preview optimization and thumbnail generation.
2. Add project rename/status editing.
3. Add project asset filtering and richer previews.
4. Add a persistent job queue and real processing pipeline.

## Development rules

- Keep `contextIsolation` enabled and `nodeIntegration` disabled.
- Renderer code must use `window.atelier`; it must not import Electron, `fs`, `path`, or Node modules.
- Main process owns filesystem access, OS dialogs, file reveal actions, and future image processing.
- Validate IPC inputs and return `Result<T>` from domain handlers.
- Do not add Google Drive or Etsy API work to the MVP unless explicitly requested.

## Sprint 1 Status

### Done

- Workspace and project management.
- Secure IPC split by domain.
- Project dashboard and source artwork gallery.
- Artwork import and metadata storage.
- Live in-memory jobs panel.

### Known limitations

- Settings are JSON-only.
- Jobs are in-memory only.
- Previews use data URLs and are not optimized for large batches.
- No SQLite, Sharp, Fabric.js, PDF, Drive, or Etsy integration yet.

### Next sprint proposal

- Build the image pipeline foundation, starting with ratio generation and preview optimization.
