# Development Notes

## Architecture summary

The Atelier Desktop uses a local-first Electron architecture. The renderer is a React UI that only talks to the preload bridge. The main process owns privileged work such as filesystem access, database access, Sharp jobs and external tool execution when those features are added.

Current source layout:

```txt
src/
  main/
    ipc/
    services/
    database/
    jobs/
  preload/
  shared/
    schemas/
    types/
  renderer/
    src/
      components/
      layouts/
      features/
      stores/
      types/
```

## Electron process separation

- Main process: owns privileged APIs and application lifecycle.
- Preload: exposes a narrow, typed bridge through `contextBridge`.
- Renderer: owns UI and user interaction only.

## IPC rule

Every renderer feature must use a typed preload method instead of calling `ipcRenderer` directly. Runtime validation belongs in the main process or in shared schemas.

The first channel is `app:ping`, exposed to the renderer as `window.atelier.app.ping()`.

## Renderer filesystem rule

The renderer must not access the filesystem directly. File reads, writes, listing, deletion and path manipulation must go through validated main-process services.
