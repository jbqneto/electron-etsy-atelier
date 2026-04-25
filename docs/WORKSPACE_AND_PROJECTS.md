# Workspace And Projects

## Workspace structure

A workspace is a user-selected local folder. When initialized, it is expanded into:

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

The workspace metadata is stored in `atelier.config.json` at the workspace root. `.atelier/workspace.json` is still written as a legacy compatibility copy. App settings are stored separately in Electron `userData` as JSON and currently keep `lastWorkspacePath`.

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
    01-source-artworks/
    02-upscaled/
    03-printable-ratios/
    04-mockups/
    05-pdf/
    06-export-package/
```

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
    "sourceArtworks": "01-source-artworks",
    "upscaled": "02-upscaled",
    "printableRatios": "03-printable-ratios",
    "mockups": "04-mockups",
    "pdf": "05-pdf",
    "exportPackage": "06-export-package"
  }
}
```

## IPC API

Renderer access goes through `window.atelier` only.

```ts
window.atelier.workspace.selectWorkspace()
window.atelier.workspace.getCurrentWorkspace()
window.atelier.workspace.initializeWorkspace(path)
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

## Next planned module

The next planned module is the image pipeline layer, starting with preview optimization, thumbnail generation and ratio generation jobs.
