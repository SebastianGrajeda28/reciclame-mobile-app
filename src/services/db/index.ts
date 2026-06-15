import * as SQLite from 'expo-sqlite';

console.log('[DB] Abriendo base de datos local reciclame.db...');
const db = SQLite.openDatabaseSync('reciclame.db');

db.execSync('PRAGMA journal_mode = WAL;');
console.log('[DB] Modo WAL activado');

db.execSync(`
  CREATE TABLE IF NOT EXISTS recycling_records (
    id                    TEXT PRIMARY KEY,
    user_id               TEXT NOT NULL,
    waste_type_id         TEXT,
    waste_type_name       TEXT,
    bin_type_id           TEXT,
    recycling_point_id    TEXT,
    recycling_point_name  TEXT,
    detection_type        TEXT,
    confidence_score      REAL,
    status                TEXT NOT NULL DEFAULT 'confirmed',
    created_at            TEXT NOT NULL,
    synced                INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS recycling_points (
    id                    TEXT PRIMARY KEY,
    name                  TEXT NOT NULL,
    latitude              REAL NOT NULL,
    longitude             REAL NOT NULL,
    available_bin_type_ids TEXT NOT NULL DEFAULT '[]',
    cached_at             TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS fun_facts (
    id           TEXT PRIMARY KEY,
    text         TEXT NOT NULL,
    waste_type_id TEXT,
    is_active    INTEGER NOT NULL DEFAULT 1,
    created_at   TEXT NOT NULL,
    cached_at    TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS instructions (
    id            TEXT PRIMARY KEY,
    title         TEXT NOT NULL,
    body          TEXT,
    image_url     TEXT,
    waste_type_id TEXT,
    is_active     INTEGER NOT NULL DEFAULT 1,
    created_at    TEXT NOT NULL,
    updated_at    TEXT,
    steps_json    TEXT NOT NULL DEFAULT '[]',
    cached_at     TEXT NOT NULL
  );
`);

const tableCount = db.getFirstSync<{ count: number }>(
  `SELECT count(*) as count FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`
);
console.log(`[DB] Tablas locales creadas: ${tableCount?.count ?? 0}`);

export { db };
