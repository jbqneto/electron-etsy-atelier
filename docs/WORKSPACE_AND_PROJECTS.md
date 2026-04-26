# Workspace And Projects

## Workspace structure

A workspace is a local folder defined by the app configuration at `src/config/config.json`.
When initialized, it is expanded into:

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

The workspace metadata is stored in `atelier.config.json` at the workspace root. `.atelier/workspace.json` is still written as a legacy compatibility copy. App settings are stored separately in Electron `userData` as JSON and currently keep `lastWorkspacePath` as a cache, but the configured workspace path is the source of truth.

## Workspace metadata

```json
{
  "id": "uuid",
  "name": "Atelier Workspace",
  "version": 1,
  "createdAt": "ISO_DATE",
  "updatedAt": "ISO_DATE"
}
```

## Project structure

Each project lives under `projects/<project-slug>/`:

```txt
projects/
  english-botanical-garden-collection/
    project.json
    source-artworks/
    upscaled/
    printable-ratios/
    mockups/
    pdf/
    export-package/
```

Legacy projects created before the folder rename are auto-migrated to these folder names when they are loaded.

## Project metadata

```json
{
  "id": "uuid",
  "name": "English Botanical Garden Collection",
  "slug": "english-botanical-garden-collection",
  "status": "draft",
  "description": "",
  "marketplace": "etsy",
  "createdAt": "ISO_DATE",
  "updatedAt": "ISO_DATE",
  "paths": {
    "sourceArtworks": "source-artworks",
    "upscaled": "upscaled",
    "printableRatios": "printable-ratios",
    "mockups": "mockups",
    "pdf": "pdf",
    "exportPackage": "export-package"
  }
}
```

## IPC API

Renderer access goes through `window.atelier` only.

```ts
window.atelier.workspace.getConfiguredWorkspacePath()
window.atelier.workspace.getCurrentWorkspace()
window.atelier.projects.createProject(input)
window.atelier.projects.listProjects()
window.atelier.projects.openProjectFolder(projectId)
window.atelier.projects.openProjectSubfolder(projectId, folderKey)
window.atelier.projects.getProjectSummary(projectId)
```

All methods return the `Result<T>` shape:

```ts
type Result<T> = { ok: true; data: T } | { ok: false; error: string }
```

## Current limitations

- Metadata is persisted as JSON files only.
- There is no SQLite index yet.
- Project editing, rename and delete actions are not implemented.
- Image processing and mockup tools are still placeholders.
- Workspace selection is not interactive in the UI. Update `src/config/config.json` to change the default workspace.

## Next planned module

The next planned module is the image pipeline layer, starting with preview optimization, thumbnail generation and ratio generation jobs.
