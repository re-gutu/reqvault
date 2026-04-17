// apps/backend/src/routes/requests.ts
import { Elysia, t } from "elysia";
import { getDb } from "@/src/db";
import type { ReqVaultRequest } from "@/types/index";

// Helper function to map SQLite rows to frontend-friendly interfaces
function mapDbRequest(dbRow: any): ReqVaultRequest {
  return {
    id: dbRow.id,
    name: dbRow.name,
    method: dbRow.method,
    url: dbRow.url,
    // Parse the JSON strings back into objects
    headers: dbRow.headers ? JSON.parse(dbRow.headers) : null,
    queryParams: dbRow.query_params ? JSON.parse(dbRow.query_params) : null,
    body: dbRow.body,
    // Map snake_case columns back to camelCase
    authType: dbRow.auth_type,
    authValue: dbRow.auth_value,
    tags: dbRow.tags ? JSON.parse(dbRow.tags) : null,
    collection: dbRow.collection,
    createdAt: dbRow.created_at,
    updatedAt: dbRow.updated_at,
  };
}

export const requestsRoute = new Elysia({ prefix: "/requests" })

  // GET /requests - List all requests
  .get("/", async () => {
    const db = getDb();
    const stmt = db.prepare(`
      SELECT * FROM requests 
      ORDER BY updated_at DESC
    `);
    const requests = stmt.all() as any[];

    // Map the array before returning
    return requests.map(mapDbRequest);
  })

  // GET /requests/:id - Get single request
  .get("/:id", async ({ params }) => {
    const db = getDb();
    const stmt = db.prepare(`
      SELECT * FROM requests WHERE id = ?
    `);
    const request = stmt.get(params.id) as any | undefined;

    if (!request) {
      return { error: "Request not found" };
    }

    // Map the single object
    return mapDbRequest(request);
  })

  // POST /requests - Create new request
  .post(
    "/",
    async ({ body }) => {
      const db = getDb();
      const now = new Date().toISOString();

      const stmt = db.prepare(`
      INSERT INTO requests (
        name, method, url, headers, query_params, body, 
        auth_type, auth_value, tags, collection, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

      const result = stmt.run(
        body.name,
        body.method || "GET",
        body.url,
        body.headers ? JSON.stringify(body.headers) : null,
        body.queryParams ? JSON.stringify(body.queryParams) : null,
        body.body || null,
        body.authType || "none",
        body.authValue || null,
        body.tags ? JSON.stringify(body.tags) : null,
        body.collection || null,
        now,
        now,
      );

      // Return the newly created request
      const newRequest = db
        .prepare("SELECT * FROM requests WHERE id = ?")
        .get(result.lastInsertRowid) as any;

      return mapDbRequest(newRequest);
    },
    {
      body: t.Object({
        name: t.String(),
        method: t.Optional(t.String()),
        url: t.String(),
        // FIX: Allow null here as well
        headers: t.Optional(
          t.Union([t.Record(t.String(), t.String()), t.Null()]),
        ),
        queryParams: t.Optional(
          t.Union([t.Record(t.String(), t.String()), t.Null()]),
        ),
        body: t.Optional(t.Union([t.String(), t.Null()])),
        authType: t.Optional(
          t.Union([
            t.Literal("none"),
            t.Literal("bearer"),
            t.Literal("basic"),
            t.Literal("apikey"),
          ]),
        ),
        authValue: t.Optional(t.Union([t.String(), t.Null()])),
        tags: t.Optional(t.Union([t.Array(t.String()), t.Null()])),
        collection: t.Optional(t.Union([t.String(), t.Null()])),
      }),
    },
  )

  // PUT /requests/:id - Update request
  .put(
    "/:id",
    async ({ params, body }) => {
      const db = getDb();
      const now = new Date().toISOString();

      const stmt = db.prepare(`
      UPDATE requests 
      SET name = ?, method = ?, url = ?, headers = ?, query_params = ?, 
          body = ?, auth_type = ?, auth_value = ?, tags = ?, 
          collection = ?, updated_at = ?
      WHERE id = ?
    `);

      const result = stmt.run(
        body.name,
        body.method || "GET",
        body.url,
        body.headers ? JSON.stringify(body.headers) : null,
        body.queryParams ? JSON.stringify(body.queryParams) : null,
        body.body !== undefined ? body.body : null,
        body.authType || null,
        body.authValue || null,
        body.tags ? JSON.stringify(body.tags) : null,
        body.collection || null,
        now,
        params.id,
      );

      if (result.changes === 0) {
        return { error: "Request not found" };
      }

      const updated = db
        .prepare("SELECT * FROM requests WHERE id = ?")
        .get(params.id) as any | undefined;

      // Map the single object
      return mapDbRequest(updated);
    },
    {
      body: t.Object(
        {
          name: t.String(),
          method: t.Optional(t.String()),
          url: t.String(),
          headers: t.Optional(
            t.Union([t.Record(t.String(), t.String()), t.Null()]),
          ),
          queryParams: t.Optional(
            t.Union([t.Record(t.String(), t.String()), t.Null()]),
          ),
          body: t.Optional(t.Union([t.String(), t.Null()])), // Allow null
          authType: t.Optional(
            t.Union([
              t.Literal("none"),
              t.Literal("bearer"),
              t.Literal("basic"),
              t.Literal("apikey"),
            ]),
          ),
          authValue: t.Optional(t.Union([t.String(), t.Null()])),
          tags: t.Optional(t.Union([t.Array(t.String()), t.Null()])),
          collection: t.Optional(t.Union([t.String(), t.Null()])),
        },
        { additionalProperties: true },
      ),
    },
  )

  // DELETE /requests/:id
  .delete("/:id", async ({ params }) => {
    const db = getDb();
    const stmt = db.prepare("DELETE FROM requests WHERE id = ?");
    const result = stmt.run(params.id);

    if (result.changes === 0) {
      return { error: "Request not found" };
    }

    return { success: true, message: "Request deleted" };
  });
