# Roadmap

## Version 0.1 - Project foundation

Goal: create a secure Electron shell with a VS Code-like layout.

Deliverables:

- Electron + React + TypeScript + Vite setup;
- Tailwind configured;
- secure BrowserWindow settings;
- preload API skeleton;
- IPC registration structure;
- base app layout:
  - activity bar;
  - sidebar;
  - main editor;
  - bottom panel placeholder;
- app settings storage;
- placeholder pages for all major modules.

Acceptance criteria:

- app starts locally;
- renderer cannot access Node APIs directly;
- preload exposes a minimal health check API;
- UI resembles a dark creative IDE.

## Version 0.2 - Workspace and project manager

Goal: create and open local Etsy projects.

Deliverables:

- workspace selection dialog;
- current workspace persistence;
- SQLite setup;
- initial migrations;
- create project;
- list projects;
- project folder structure generation;
- project dashboard;
- project JSON snapshot.

Acceptance criteria:

- user can create a project;
- project folder is created with expected subfolders;
- project appears in sidebar;
- project metadata survives app restart.

## Version 0.3 - Asset import and project explorer

Goal: import generated artwork into projects.

Deliverables:

- import images from file dialog;
- drag-and-drop import if simple;
- copy image files into `source-artwork/`;
- create project asset records;
- generate thumbnails;
- asset grid;
- asset detail panel;
- orientation detection.

Acceptance criteria:

- user can import images;
- images are copied into the project;
- thumbnails appear in the UI;
- assets are persisted in SQLite.

## Version 0.4 - Mockup Template Builder

Goal: reproduce the existing online template builder locally.

Deliverables:

- import background image;
- display background in canvas;
- draw rectangular frame slots;
- select/move/resize/rotate slots;
- edit slot label;
- save template;
- store template and slot metadata in SQLite;
- generate template thumbnail;
- list saved templates.

Acceptance criteria:

- user can import a background;
- user can draw frame slots;
- x, y, width, height and rotation are stored;
- template is selectable later in composer.

## Version 0.5 - Mockup Composer

Goal: assign artwork to mockup slots and export listing mockups.

Deliverables:

- template selector;
- slot list;
- artwork assignment per slot;
- visual crop controls per slot;
- preview render;
- export final mockup image;
- save composition metadata.

Acceptance criteria:

- user can select a template;
- user can assign artwork to each frame;
- user can adjust crop;
- user can export one final mockup image.

## Version 0.6 - Image ratio generator

Goal: generate printable ratio variants from upscaled or source artwork.

Deliverables:

- ratio preset configuration;
- orientation-aware ratio selection;
- Sharp-based crop/resize/export;
- batch processing;
- generated file metadata;
- output naming conventions.

Acceptance criteria:

- user can select artwork and generate ratio variants;
- generated files are saved in predictable folders;
- variants are visible in the project.

## Version 0.7 - Upscaler integration

Goal: add long-running upscaling jobs without blocking the UI.

Deliverables:

- external upscaler path setting;
- safe CLI adapter;
- job queue;
- job status UI;
- job logs;
- retry failed job.

Acceptance criteria:

- user can enqueue upscale jobs;
- UI remains responsive;
- success/failure is visible;
- output is registered as upscaled artwork.

## Version 0.8 - Buyer PDF generator

Goal: generate Etsy buyer instruction PDFs.

Deliverables:

- PDF template data form;
- manual Google Drive link field;
- HTML preview;
- PDF generation via Electron/Chromium;
- generated PDF stored in project exports;
- PDF metadata saved.

Acceptance criteria:

- user can generate a PDF similar in purpose to the reference PDF;
- PDF includes download link, thank-you message, support message and usage notice;
- generated file appears in export package.

## Version 0.9 - Export package builder

Goal: build the final project package.

Deliverables:

- export checklist;
- include printable variants;
- include listing mockups;
- include buyer PDF;
- include listing metadata;
- generate final folder;
- optional ZIP.

Acceptance criteria:

- user can click one action to build a final export package;
- output folder follows the documented structure.

## Version 1.0 - Stable local MVP

Goal: use the app for a real Etsy listing production cycle.

Deliverables:

- bug fixes;
- improved UX;
- validation;
- stable job queue;
- complete docs;
- build/package scripts.

Acceptance criteria:

- the app can replace the current online workflow for local mockup and export production.

## Version 2.0 - Google Drive integration

Goal: upload final customer package to Google Drive.

Deliverables:

- OAuth setup;
- Drive folder creation;
- file/folder upload;
- stored Drive folder URL;
- buyer PDF auto-populated from Drive URL.

## Version 3.0 - Etsy integration

Goal: create or update Etsy draft listings.

Deliverables:

- Etsy OAuth setup;
- shop selection;
- draft listing creation;
- listing image upload;
- listing metadata sync;
- digital file or PDF upload strategy;
- status sync.
