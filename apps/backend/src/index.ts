// apps/backend/src/index.ts
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { initializeTables } from "./schema";

const app = new Elysia()
  .use(cors({
    origin: ["http://localhost:3000"],   // Allow frontend
  }))
  .get("/", () => ({ message: "ReqVault Backend is running!" }))
  .get("/health", () => ({ status: "ok", db: "connected" }));

// Initialize DB on startup
initializeTables();

console.log("🚀 ReqVault Backend running on http://localhost:3001");

app.listen(3001);