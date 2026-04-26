# Implementation Status

Last reviewed: 26/04/2026

## Current implemented features

- Secure Electron shell with `contextIsolation: true` and `nodeIntegration: false`.
- Typed preload bridge exposed through `window.atelier`.
- Static workspace initialization from `src/config/config.json`.
- Workspace persistence in Electron `userData`.
- Project creation, listing, folder opening, and project summaries.
- Project folder migration from numbered legacy folders to the current unnumbered structure.
- Source artwork import into `source-artworks/`.
- Artwork metadata stored in `.atelier-artworks.json`.
- Safe local previews returned as `data:` URLs from the main process.
- In-memory jobs panel with demo progress jobs.
- Sharp validation through the main process.
- Pure image-pipeline domain logic in `src/shared/image-pipeline/`.
- Persistent image cards in `.atelier/image-cards.json`.
- Ratio selection per card.
- Printable ratio generation with Sharp.
- Main-process JSON persistence helpers with atomic writes and corruption backups.
- SQLite main-process foundation in the workspace `.atelier/atelier.db`.
- Database status exposed through IPC and visible in the UI.
- Write-through SQLite storage for projects, source artworks, image cards, and ratio outputs.

## Current partially implemented features

- JSON remains the durable snapshot format for projects, artworks, and image pipeline metadata.
- SQLite migration preview and execution are exposed, but repository coverage still needs hardening before JSON can be reduced.
- Database-backed listings are wired, but the sync layer still needs more repository coverage.

## Missing features

- Mockup Template Builder.
- Mockup Composer.
- Persistent job queue.
- Upcaler adapter integration.
- Buyer PDF generation.
- Export package builder.
- Google Drive integration.
- Etsy API integration.

## Current persistence approach

- Workspace metadata is stored as JSON in the workspace root and in Electron `userData`.
- Core project metadata remains on disk as `project.json`.
- Source artworks remain in `source-artworks/.atelier-artworks.json`.
- Image cards remain in `.atelier/image-cards.json`.
- SQLite lives per workspace at `.atelier/atelier.db` and currently acts as the query/index layer plus write-through store.
- The renderer does not read or write the filesystem directly.

## Current known risks

- Old JSON snapshots and new SQLite rows can drift if a write-through step fails.
- The current jobs system is still in-memory only.
- Native SQLite dependencies need rebuild support in Electron packaging.
- Preview rendering still reads full image bytes and is not optimized for large batches.
- The database sync layer still needs migration tooling and broader repository coverage.

## Recommended next implementation order

1. Finish JSON-to-SQLite migration tooling and preview.
2. Expand repository coverage so SQLite becomes the primary query path for current features.
3. Stabilize the image pipeline on top of the new database layer.
4. Add the Mockup Template Builder foundation.
5. Add the Mockup Composer.
6. Add persistent jobs and long-running processing adapters.
7. Add buyer PDF generation and export packaging.
