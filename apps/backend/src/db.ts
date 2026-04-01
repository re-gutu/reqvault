// apps/backend/src/db.ts
import { Database } from "bun:sqlite";

let dbInstance: Database | null = null;

export function getDb(): Database {
  if (!dbInstance) {
    dbInstance = new Database("./reqvault.db", { create: true });

    dbInstance.run("PRAGMA journal_mode = WAL;");
    dbInstance.run("PRAGMA foreign_keys = ON;");
    dbInstance.run("PRAGMA synchronous = NORMAL;");

    console.log("✅ ReqVault backend DB connected with pure bun:sqlite");
  }
  return dbInstance;
}

export function closeDb() {
  if (dbInstance) dbInstance.close();
}

process.on("exit", closeDb);