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
- opens native dialogs for workspace and artwork file selection

## Current module layout

```txt
src/
  main/
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

- workspace selection and restoration
- project creation/listing/detail/folder opening
- source artwork selection/import/listing/preview/reveal
- in-memory jobs listing/demo/clear-completed

## Sprint 1 status

### Done

- Secure Electron shell
- Workspace selection and persistence
- Project creation and listing
- Project dashboard
- Artwork import and source gallery
- In-memory jobs panel
- Documentation cleanup

### Known limitations

- Settings and workspace state are JSON-based only
- Jobs are not persisted
- Previews use data URLs
- No image processing or database layer yet

### Next sprint proposal

- Add the image processing pipeline with ratio generation and preview optimization
