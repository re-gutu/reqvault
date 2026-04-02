// apps/backend/src/index.ts
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { initializeTables } from "./schema";
import { executeRoute } from './routes/execute';
import { requestsRoute } from './routes/request';
import { historyRoute } from "./routes/history";

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
app.use(requestsRoute);
app.use(executeRoute);
app.use(historyRoute);
