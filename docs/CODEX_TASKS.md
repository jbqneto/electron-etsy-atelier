# Codex Task Plan

Use this file as the initial implementation sequence.

## Task 1 - Bootstrap Electron app

Create an Electron + React + TypeScript + Vite project.

Requirements:

- Electron Forge Vite + TypeScript template;
- React installed and configured;
- Tailwind installed and configured;
- secure BrowserWindow settings;
- preload script exposing a small typed API;
- app layout with activity bar, sidebar, editor area and bottom panel.

Do not implement business logic yet.

## Task 2 - Create shared contracts

Create shared types and schemas for:

- Workspace;
- EtsyProject;
- ProjectAsset;
- MockupTemplate;
- MockupSlot;
- ProcessingJob.

Use Zod for runtime validation.

## Task 3 - Workspace selection

Now the workspace is pre-defined on the config file

## Task 4 - SQLite migrations

Implement initial schema from `docs/DATABASE_SCHEMA.md`.

Use Drizzle or Kysely if chosen. Otherwise use a small migration runner.

## Task 5 - Project creation

Implement:

- create project form;
- slug generation;
- folder structure creation;
- database insert;
- `project.json` snapshot;
- project list in sidebar;
- project dashboard.

## Task 6 - Asset import

Implement:

- import source artwork from native dialog;
- copy files into `source-artworks/`;
- read image metadata with Sharp;
- generate thumbnail;
- create `project_assets` row;
- show asset grid.

## Task 7 - Mockup Template Builder

Implement:

- import mockup background;
- canvas view;
- draw rectangle frame slots;
- edit slot position/size/rotation;
- save template;
- store template and slots in SQLite;
- generate template thumbnail;
- list templates.

## Task 8 - Mockup Composer

Implement:

- select template;
- list slots;
- assign artwork to slots;
- crop controls per slot;
- preview;
- export final mockup image using main process renderer.

## Task 9 - Ratio generator

Implement:

- ratio preset config;
- enqueue ratio generation job;
- Sharp crop/resize/export;
- save generated variants;
- show generated files in project.

## Task 10 - Job queue

Implement:

- persistent job table;
- in-process runner;
- status UI;
- retry failed job;
- logs.

## Task 11 - Upscaler adapter

Implement:

- setting for external upscaler executable;
- adapter interface;
- CLI execution through `spawn`;
- job integration.

Keep it optional. The app must still work without upscaler configured.

## Task 12 - Buyer PDF generator

Implement:

- PDF data form;
- HTML preview;
- PDF generation via Electron `printToPDF`;
- save PDF to `buyer-pdf/`;
- register PDF asset.

## Task 13 - Export package builder

Implement:

- export checklist;
- copy selected final files into export folder;
- optional ZIP;
- export summary screen.

## Task 14 - Polish and stabilization

Implement:

- empty states;
- loading states;
- error messages;
- confirmation dialogs;
- basic tests;
- package build command.
