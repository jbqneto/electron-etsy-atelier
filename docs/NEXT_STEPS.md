# Next Steps

## Immediate focus

1. Harden the JSON-to-SQLite migration workflow and expand repository coverage.
2. Add unit tests for workspace guard, database status, filename conflict handling and project folder summaries.
3. Add a persistent job queue.

## Next sprint proposal

- SQLite stabilization and image pipeline hardening:
  - migration tooling
  - repository coverage
  - preview optimization
  - thumbnail generation
  - job persistence

## Sprint 2 readiness

Sprint 1 now has enough structure to start image processing:

- project folders are deterministic
- source artwork metadata is persisted
- renderer does not access the filesystem directly
- jobs have a shared UI and IPC surface
- main process owns the places where Sharp, upscayl and export builders should be added later
