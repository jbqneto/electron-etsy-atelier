import type { SqlMigration } from '../schema'

export const initialMigration: SqlMigration = {
  name: '001_initial_schema',
  statements: [
    `CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS app_metadata (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      product_type TEXT,
      status TEXT NOT NULL,
      marketplace TEXT NOT NULL,
      language TEXT,
      root_relative_path TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS assets (
      id TEXT PRIMARY KEY,
      project_id TEXT,
      scope TEXT NOT NULL,
      type TEXT NOT NULL,
      file_name TEXT NOT NULL,
      base_name TEXT,
      extension TEXT,
      relative_path TEXT NOT NULL,
      size_bytes INTEGER,
      width INTEGER,
      height INTEGER,
      format TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    )`,
    `CREATE TABLE IF NOT EXISTS source_artworks (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      original_name TEXT,
      file_name TEXT NOT NULL,
      relative_path TEXT NOT NULL,
      extension TEXT,
      size_bytes INTEGER,
      width INTEGER,
      height INTEGER,
      format TEXT,
      orientation TEXT,
      imported_at TEXT NOT NULL,
      metadata_scanned_at TEXT,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    )`,
    `CREATE TABLE IF NOT EXISTS image_cards (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      artwork_id TEXT NOT NULL,
      file_name TEXT NOT NULL,
      base_name TEXT NOT NULL,
      relative_path TEXT NOT NULL,
      width INTEGER NOT NULL,
      height INTEGER NOT NULL,
      source_orientation TEXT NOT NULL,
      output_orientation TEXT NOT NULL,
      ratio_selections_json TEXT NOT NULL,
      manual_crops_json TEXT NOT NULL,
      outputs_json TEXT NOT NULL,
      active_ratio_group_key TEXT,
      manual_mode INTEGER NOT NULL DEFAULT 0,
      metadata_scanned_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id),
      FOREIGN KEY (artwork_id) REFERENCES source_artworks(id)
    )`,
    `CREATE TABLE IF NOT EXISTS ratio_outputs (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      image_card_id TEXT NOT NULL,
      artwork_id TEXT NOT NULL,
      ratio_group_key TEXT NOT NULL,
      ratio_group_label TEXT,
      size_label TEXT,
      width INTEGER NOT NULL,
      height INTEGER NOT NULL,
      dpi INTEGER,
      file_name TEXT NOT NULL,
      folder_name TEXT,
      relative_path TEXT NOT NULL,
      generated_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id),
      FOREIGN KEY (image_card_id) REFERENCES image_cards(id),
      FOREIGN KEY (artwork_id) REFERENCES source_artworks(id)
    )`,
    `CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      status TEXT NOT NULL,
      progress INTEGER NOT NULL DEFAULT 0,
      message TEXT,
      error TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      completed_at TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS mockup_templates (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      width INTEGER NOT NULL,
      height INTEGER NOT NULL,
      background_relative_path TEXT NOT NULL,
      thumbnail_relative_path TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS mockup_template_slots (
      id TEXT PRIMARY KEY,
      template_id TEXT NOT NULL,
      label TEXT NOT NULL,
      slot_order INTEGER NOT NULL,
      x REAL NOT NULL,
      y REAL NOT NULL,
      width REAL NOT NULL,
      height REAL NOT NULL,
      rotation REAL NOT NULL DEFAULT 0,
      FOREIGN KEY (template_id) REFERENCES mockup_templates(id)
    )`,
    `CREATE INDEX IF NOT EXISTS idx_assets_project_id ON assets(project_id)`,
    `CREATE INDEX IF NOT EXISTS idx_source_artworks_project_id ON source_artworks(project_id)`,
    `CREATE INDEX IF NOT EXISTS idx_image_cards_project_id ON image_cards(project_id)`,
    `CREATE INDEX IF NOT EXISTS idx_ratio_outputs_project_id ON ratio_outputs(project_id)`,
    `CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status)`,
    `CREATE INDEX IF NOT EXISTS idx_mockup_template_slots_template_id ON mockup_template_slots(template_id)`
  ]
}

export const migrations = [initialMigration]

