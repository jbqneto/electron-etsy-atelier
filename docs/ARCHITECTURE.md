# Architecture

## Overview

The Atelier Desktop is a local-first Electron app built around a strict renderer-preload-main boundary.

## Current stack

- Electron
- electron-vite
- React
- TypeScript
- Tailwind CSS v4
- Zod
- Lucide React

## Process boundaries

```txt
Renderer -> Preload bridge -> IPC -> Main process services -> Filesystem / OS
```

## Responsibilities

### Renderer

- UI rendering
- local UI state
- calling `window.atelier`
- showing project, artwork, and job state
- never importing Electron, filesystem, path, or Node modules

### Preload

- exposes a narrow typed API
- validates IPC payloads on the way back into the renderer
- never exposes raw Node or Electron modules

### Main process

- owns filesystem access
- owns OS file manager actions
- owns app settings JSON
- owns workspace/project/artwork/job services
- owns SQLite database access and migrations
- opens native dialogs for workspace and artwork file selection

## Current module layout

```txt
src/
  main/
    database/
    ipc/
    services/
  preload/
  renderer/
    src/
      components/
      features/
      types/
  shared/
    schemas/
    types/
```

## IPC design

IPC is split by domain:

- `appIpc`
- `workspaceIpc`
- `projectsIpc`
- `artworksIpc`
- `jobsIpc`

Handlers return `Result<T>` and validate incoming payloads with Zod or equivalent checks.

Current exposed domains:

- workspace initialization and restoration from the configured path
- project creation/listing/detail/folder opening
- source artwork selection/import/listing/preview/reveal
- in-memory jobs listing/demo/clear-completed
- database status

## Current storage split

- JSON snapshots still exist for workspace metadata, project snapshots, source artworks and image cards.
- SQLite now lives in the workspace `.atelier/atelier.db` and acts as the query/index layer for current features.
- The current jobs system remains in-memory.

## Sprint 1 status

### Done

- Secure Electron shell
- Workspace initialization and persistence
- Project creation and listing
- Project dashboard
- Artwork import and source gallery
- In-memory jobs panel
- SQLite foundation and database status
- Documentation cleanup

### Known limitations

- Settings and workspace state are JSON-based only
- Jobs are not persisted
- Previews use data URLs
- Database sync and migration tooling still need hardening
- Mockup, PDF and export modules are not implemented yet

### Next sprint proposal

- Add the image processing pipeline with ratio generation and preview optimization
