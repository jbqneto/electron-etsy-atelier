# Next Steps

## Immediate focus

1. Optimize artwork preview handling for larger image batches.
2. Add thumbnail generation for source artworks.
3. Add a persistent job queue.
4. Add unit tests for workspace guard, filename conflict handling and project folder summaries.

## Next sprint proposal

- Image pipeline foundation:
  - ratio generation
  - preview optimization
  - job persistence
  - project asset filtering

## Sprint 2 readiness

Sprint 1 now has enough structure to start image processing:

- project folders are deterministic
- source artwork metadata is persisted
- renderer does not access the filesystem directly
- jobs have a shared UI and IPC surface
- main process owns the places where Sharp, upscayl and export builders should be added later
