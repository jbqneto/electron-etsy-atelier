24/04/2026 22:09 - Added secure Electron shell, Tailwind v4 renderer styling, typed IPC ping test and updated project documentation
24/04/2026 22:21 - Implemented JSON-backed workspace and project management with secure IPC, project folder opening and workspace/project UI
24/04/2026 22:51 - Split IPC into domain handlers, added app settings service, project summaries and artwork import flow with metadata storage
25/04/2026 07:18 - Implemented scoped project detail dashboard workflow cards and hardened project folder opening validation
25/04/2026 07:29 - Task 4: Implemented artwork source image import with safe main-process file picker, conflict handling and metadata persistence
25/04/2026 07:29 - Task 5: Implemented source artwork gallery with safe IPC data URL previews, empty/loading/error states and reveal action
25/04/2026 07:29 - Task 6: Implemented basic in-memory jobs and logs panel with development demo job, progress updates and clear completed action
25/04/2026 07:29 - Task 7: Completed Sprint 1 cleanup and documentation updates before image processing work
25/04/2026 07:41 - Fixed workspace root config creation and added collapsible left module sidebar
25/04/2026 07:45 - Sprint 2 Task 1: Installed Sharp and added main-process image pipeline validation through IPC and preload
25/04/2026 08:19 - Sprint 2: Ported Wall Art Cropper image pipeline domain presets, crop suitability and naming helpers into shared pure modules
25/04/2026 08:23 - Sprint 2 Task 2.1: Completed pure image pipeline domain port with settings, Zod schemas and domain documentation
25/04/2026 08:29 - Sprint 2 Task 2.2: Added Sharp-based source artwork scanning and persistent project image cards
25/04/2026 08:37 - Sprint 2 Task 2.3: Added persistent ratio selection and output orientation controls for image cards
25/04/2026 08:44 - Sprint 2 Task 2.4: Added Sharp-based printable ratio generation with job progress and output metadata
25/04/2026 20:14 - Standardized local JSON persistence with atomic writes, corruption backups, and workspace-safe path helpers.
26/04/2026 07:33 - Hardened workspace selection dialog handling and silenced unhandled job polling errors in the renderer
26/04/2026 07:47 - Temporarily disabled automatic job polling and added preload/main IPC logs for workspace and jobs calls
26/04/2026 08:04 - Redesigned the app shell, project workspace panel, and project detail layout to better match the provided design references
26/04/2026 08:20 - Switched workspace initialization to the static app config and removed the need for manual workspace selection
26/04/2026 08:24 - Removed the legacy workspace selection API and UI path, leaving only the configured workspace reload flow
26/04/2026 08:46 - Migrated projects to unnumbered folder names, added legacy folder migration, and made the home screen optimistically show newly created projects
26/04/2026 09:13 - Added SQLite main-process foundation, database status IPC/UI, and initial write-through repositories for projects, source artworks, image cards, and ratio outputs
26/04/2026 09:32 - Removed the project shell debug controls, hardened async IPC error handling, and fixed the project workspace panel scrolling layout for smaller windows
26/04/2026 09:45 - Relaxed the renderer CSP to allow unsafe-eval so Electron/Vite dev code generation errors stop blocking project creation
26/04/2026 09:58 - Tightened project detail breakpoints, replaced the SQLite red error with a neutral fallback notice, and added a portable native rebuild wrapper for better-sqlite3
