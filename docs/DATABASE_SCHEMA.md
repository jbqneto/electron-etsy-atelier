# Database Schema Draft

The app uses SQLite for structured metadata.

Images and PDFs are stored as files. SQLite stores paths and metadata only.

## Conventions

- Primary keys are text UUIDs.
- Store both absolute workspace root in `workspaces` and relative paths elsewhere.
- Use ISO 8601 strings for timestamps.
- Use JSON text for flexible configuration fields where appropriate.

## Tables

```sql
CREATE TABLE workspaces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  root_path TEXT NOT NULL UNIQUE,
  database_path TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  status TEXT NOT NULL,
  root_relative_path TEXT NOT NULL,
  concept TEXT,
  style TEXT,
  color_palette_json TEXT,
  target_customer TEXT,
  artwork_count_target INTEGER,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id),
  UNIQUE (workspace_id, slug)
);

CREATE TABLE market_research_notes (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  title TEXT NOT NULL,
  source_url TEXT,
  search_term TEXT,
  notes TEXT NOT NULL,
  estimated_price REAL,
  observed_bundle_size INTEGER,
  observed_style TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE TABLE prompt_sets (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE TABLE prompt_items (
  id TEXT PRIMARY KEY,
  prompt_set_id TEXT NOT NULL,
  artwork_index INTEGER NOT NULL,
  title TEXT,
  prompt TEXT NOT NULL,
  negative_prompt TEXT,
  orientation TEXT NOT NULL,
  generation_tool TEXT,
  status TEXT NOT NULL,
  linked_asset_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (prompt_set_id) REFERENCES prompt_sets(id),
  FOREIGN KEY (linked_asset_id) REFERENCES project_assets(id)
);

CREATE TABLE project_assets (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  original_file_name TEXT NOT NULL,
  relative_path TEXT NOT NULL,
  thumbnail_relative_path TEXT,
  width INTEGER,
  height INTEGER,
  orientation TEXT,
  size_bytes INTEGER,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE TABLE printable_variants (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  source_asset_id TEXT NOT NULL,
  output_asset_id TEXT NOT NULL,
  ratio_key TEXT NOT NULL,
  ratio_width INTEGER NOT NULL,
  ratio_height INTEGER NOT NULL,
  target_width_px INTEGER NOT NULL,
  target_height_px INTEGER NOT NULL,
  dpi INTEGER NOT NULL,
  format TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (source_asset_id) REFERENCES project_assets(id),
  FOREIGN KEY (output_asset_id) REFERENCES project_assets(id)
);

CREATE TABLE mockup_templates (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  background_relative_path TEXT NOT NULL,
  thumbnail_relative_path TEXT,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  category TEXT,
  tags_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id),
  UNIQUE (workspace_id, slug)
);

CREATE TABLE mockup_slots (
  id TEXT PRIMARY KEY,
  template_id TEXT NOT NULL,
  label TEXT NOT NULL,
  x REAL NOT NULL,
  y REAL NOT NULL,
  width REAL NOT NULL,
  height REAL NOT NULL,
  rotation REAL NOT NULL DEFAULT 0,
  ratio_key TEXT,
  order_index INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (template_id) REFERENCES mockup_templates(id)
);

CREATE TABLE mockup_compositions (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  template_id TEXT NOT NULL,
  title TEXT NOT NULL,
  output_asset_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (template_id) REFERENCES mockup_templates(id),
  FOREIGN KEY (output_asset_id) REFERENCES project_assets(id)
);

CREATE TABLE slot_assignments (
  id TEXT PRIMARY KEY,
  composition_id TEXT NOT NULL,
  slot_id TEXT NOT NULL,
  asset_id TEXT NOT NULL,
  scale REAL NOT NULL DEFAULT 1,
  offset_x_percent REAL NOT NULL DEFAULT 0,
  offset_y_percent REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (composition_id) REFERENCES mockup_compositions(id),
  FOREIGN KEY (slot_id) REFERENCES mockup_slots(id),
  FOREIGN KEY (asset_id) REFERENCES project_assets(id),
  UNIQUE (composition_id, slot_id)
);

CREATE TABLE processing_jobs (
  id TEXT PRIMARY KEY,
  project_id TEXT,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  input_json TEXT NOT NULL,
  output_json TEXT,
  error_message TEXT,
  log_relative_path TEXT,
  created_at TEXT NOT NULL,
  started_at TEXT,
  finished_at TEXT,
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE TABLE listing_metadata (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL UNIQUE,
  title TEXT,
  description TEXT,
  tags_json TEXT NOT NULL DEFAULT '[]',
  price REAL,
  quantity INTEGER,
  section TEXT,
  materials_json TEXT,
  occasion_json TEXT,
  style_json TEXT,
  google_drive_url TEXT,
  etsy_listing_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE TABLE export_packages (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  name TEXT NOT NULL,
  relative_path TEXT NOT NULL,
  zip_asset_id TEXT,
  includes_printables INTEGER NOT NULL DEFAULT 1,
  includes_mockups INTEGER NOT NULL DEFAULT 1,
  includes_buyer_pdf INTEGER NOT NULL DEFAULT 1,
  includes_listing_metadata INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (zip_asset_id) REFERENCES project_assets(id)
);

CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

## Recommended indexes

```sql
CREATE INDEX idx_projects_workspace_id ON projects(workspace_id);
CREATE INDEX idx_assets_project_id ON project_assets(project_id);
CREATE INDEX idx_assets_kind ON project_assets(kind);
CREATE INDEX idx_mockup_slots_template_id ON mockup_slots(template_id);
CREATE INDEX idx_jobs_status ON processing_jobs(status);
CREATE INDEX idx_jobs_project_id ON processing_jobs(project_id);
```

## Migration policy

Use explicit migrations. Do not rely on auto-sync in production builds.

Recommended options:

- Drizzle ORM migrations;
- Kysely migrations;
- or a small custom migration runner if simplicity is preferred.
