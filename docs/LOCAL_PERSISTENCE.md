# Local Persistence

## Purpose

The Atelier Desktop stores local metadata in JSON files and SQLite, both managed by the Electron main process only. The renderer never reads or writes the filesystem directly.

The default workspace path is defined in `src/config/config.json` and is resolved by the main process at startup.

## Current metadata files

- Workspace:
  - `<workspace>/.atelier/workspace.json`
  - `<workspace>/atelier.config.json`
- Project:
  - `<workspace>/projects/<project-slug>/project.json`
- Source artworks:
  - `<workspace>/projects/<project-slug>/source-artworks/.atelier-artworks.json`
- Image pipeline:
  - `<workspace>/projects/<project-slug>/.atelier/image-cards.json`

## Current SQLite database

- Workspace database:
  - `<workspace>/.atelier/atelier.db`

SQLite currently acts as the query/index layer and write-through store for:

- projects
- source artworks
- image cards
- ratio outputs

Planned files for upcoming modules (not fully implemented yet):

- `<workspace>/.atelier/assets.json`
- `<workspace>/projects/<project-slug>/.atelier/assets.json`
- `<workspace>/mockup-templates/<template-slug>/template.json`
- `<workspace>/projects/<project-slug>/mockups/compositions/<composition-id>.json`
- `<workspace>/projects/<project-slug>/.atelier/listing-metadata.json`
- `<workspace>/projects/<project-slug>/pdf/.atelier-pdfs.json`
- `<workspace>/projects/<project-slug>/export-package/metadata/package-manifest.json`

## Persistence helpers

Shared helpers live in `src/main/services/jsonStore.ts`:

- `readJsonFile<T>()`
- `writeJsonFileAtomic<T>()`
- `ensureDirectory()`
- `backupCorruptedJson()`
- `safeJoinWorkspacePath()`
- `validateInsideWorkspace()`

These helpers are used by main-process services and should be reused by new modules.

## Atomic write strategy

`writeJsonFileAtomic()` uses a safe two-step write:

1. Create parent directory if needed.
2. Write JSON content to a temp file in the same directory.
3. Rename temp file to the destination path.

This avoids partially written JSON files after crashes or interruptions.

## Corrupted JSON backup strategy

`readJsonFile()` now detects parse failures. On corruption:

1. Save a timestamped backup file (`*.bak`) next to the original JSON.
2. Return fallback data or throw a readable error, depending on call options.

Services that require strict integrity (for example artwork/pipeline metadata) use `onCorrupted: 'throw'` so IPC can return a clear `Result` error instead of silently overwriting bad data.

## Path safety rules

All path joins for workspace/project files should use `safeJoinWorkspacePath()`.

- It resolves the target path.
- It validates the target stays inside the expected root.
- It blocks path traversal attempts.

`validateInsideWorkspace()` can be used directly when a path is already resolved.

## Error handling and Result pattern

Persistence errors must be surfaced by IPC handlers as:

- `{ ok: true, data: T }`
- `{ ok: false, error: string }`

Do not throw raw filesystem errors into renderer code.

## Future persistence note

JSON snapshots are still required for portability and human-readable project folders. New persistence code should keep JSON output deterministic even when SQLite is the primary query path.
