// apps/backend/src/schema.ts
import { getDb } from "./db";

export function initializeTables() {
  const db = getDb();

  db.run(`
    CREATE TABLE IF NOT EXISTS requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      method TEXT NOT NULL DEFAULT 'GET',
      url TEXT NOT NULL,
      headers TEXT,
      query_params TEXT,
      body TEXT,
      auth_type TEXT DEFAULT 'none',
      auth_value TEXT,
      tags TEXT,
      collection TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS response_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id INTEGER NOT NULL,
      status INTEGER NOT NULL,
      status_text TEXT,
      headers TEXT,
      body TEXT,
      duration_ms REAL NOT NULL,
      size_bytes INTEGER,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      error TEXT,
      FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE
    );
  `);

  db.run(`CREATE INDEX IF NOT EXISTS idx_response_request_id ON response_history(request_id);`);

  console.log("✅ Database tables initialized");
}