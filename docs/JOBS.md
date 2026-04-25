# Jobs

## Scope

The job system is currently in-memory and is meant to prepare the UI and IPC model for future background work.

## Job model

- id
- type
- title
- status
- progress
- message
- createdAt
- updatedAt

## Current behavior

- jobs are created in main process memory
- demo jobs simulate progress
- completed jobs can be cleared
- no persistence yet
- the renderer polls `jobs.listJobs()` and renders status, message and progress
- the demo job button is available only during development builds

## IPC API

```ts
window.atelier.jobs.listJobs()
window.atelier.jobs.clearCompletedJobs()
window.atelier.jobs.createDemoJob()
```

## Pipeline role

This model is intentionally small. It gives future upscaling, printable ratio generation, mockup rendering and PDF generation a shared UI surface before the app introduces real processing adapters or a persistent queue.

## Next step

Persist job records and convert demo jobs into real processing jobs for image import, ratio generation, mockups and PDF export.
