# Security

## Core principle

Even though this is a desktop app, treat the renderer as untrusted.

The renderer must never receive broad system access.

## Electron settings

Use:

```ts
webPreferences: {
  contextIsolation: true,
  nodeIntegration: false,
  sandbox: true,
  preload: preloadPath
}
```

Do not disable these settings to make implementation easier.

## Preload API policy

Expose a narrow API only:

```ts
window.atelier = {
  workspace: {...},
  projects: {...},
  assets: {...},
  mockupTemplates: {...},
  mockupCompositions: {...},
  imageJobs: {...},
  exports: {...},
  pdf: {...},
  settings: {...}
}
```

Do not expose:

- `ipcRenderer`;
- `fs`;
- `path`;
- `shell`;
- `child_process`;
- SQLite connection;
- Sharp instance.

## IPC validation

Every IPC input must be validated.

Use Zod schemas for:

- project creation;
- template slot creation/update;
- asset import;
- image processing job creation;
- PDF data;
- settings updates.

## Filesystem safety

The app must guard all paths.

Rules:

1. All writes happen under the selected workspace by default.
2. Imports can read from external paths only through user-selected native file dialogs or drag-and-drop.
3. Exports outside the workspace require explicit user selection.
4. Normalize paths before checking them.
5. Reject `..` traversal and symlink escapes when possible.
6. Keep relative paths in database for project assets.

## External process safety

Upscaling may require an external executable.

Rules:

1. User configures executable path manually.
2. App validates the path exists.
3. App only calls known adapter commands.
4. App passes arguments as an array to `spawn`, not concatenated shell strings.
5. Do not use `exec` with user-controlled input.
6. Capture stdout/stderr to job logs.
7. Show clear errors if tool fails.

## Secrets

MVP should not store cloud credentials.

Future Google Drive and Etsy integrations must store tokens using OS-level secure storage when possible.

Potential library:

- keytar, if maintained/compatible;
- Electron safeStorage;
- OS credential store alternatives.

## Data privacy

All project files are local in MVP.

Do not send images, prompts or project data to external services unless the user explicitly enables an integration.

## Dangerous operations

Before deleting files, show confirmation.

Before overwriting exports, either:

- ask confirmation;
- or create a versioned file/folder name.

## Logging

Do not log secrets.

Future cloud tokens must never appear in logs.
