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

## Next step

Persist job records and convert demo jobs into real processing jobs for image import, ratio generation, mockups and PDF export.
