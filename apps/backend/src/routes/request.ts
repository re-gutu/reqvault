// apps/backend/src/routes/requests.ts
import { Elysia, t } from 'elysia';
import { getDb } from '@/src/db';
import type { ReqVaultRequest } from '@/types/index';

export const requestsRoute = new Elysia({ prefix: '/requests' })

  // GET /requests - List all requests
  .get('/', async () => {
    const db = getDb();
    const stmt = db.prepare(`
      SELECT * FROM requests 
      ORDER BY updated_at DESC
    `);
    const requests = stmt.all() as ReqVaultRequest[];
    return requests;
  })

  // GET /requests/:id - Get single request
  .get('/:id', async ({ params }) => {
    const db = getDb();
    const stmt = db.prepare(`
      SELECT * FROM requests WHERE id = ?
    `);
    const request = stmt.get(params.id) as ReqVaultRequest | undefined;
    
    if (!request) {
      return { error: 'Request not found' };
    }
    return request;
  })

  // POST /requests - Create new request
  .post('/', async ({ body }) => {
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
      body.method || 'GET',
      body.url,
      body.headers ? JSON.stringify(body.headers) : null,
      body.queryParams ? JSON.stringify(body.queryParams) : null,
      body.body || null,
      body.authType || 'none',
      body.authValue || null,
      body.tags ? JSON.stringify(body.tags) : null,
      body.collection || null,
      now,
      now
    );

    // Return the newly created request
    const newRequest = db.prepare('SELECT * FROM requests WHERE id = ?').get(result.lastInsertRowid) as ReqVaultRequest;
    return newRequest;
  }, {
    body: t.Object({
      name: t.String(),
      method: t.Optional(t.String()),
      url: t.String(),
      headers: t.Optional(t.Record(t.String(), t.String())),
      queryParams: t.Optional(t.Record(t.String(), t.String())),
      body: t.Optional(t.String()),
      authType: t.Optional(t.Union([t.Literal('none'), t.Literal('bearer'), t.Literal('basic'), t.Literal('apikey')])),
      authValue: t.Optional(t.String()),
      tags: t.Optional(t.Array(t.String())),
      collection: t.Optional(t.String()),
    })
  })

  // PUT /requests/:id - Update request 
  .put('/:id', async ({ params, body }) => {
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

    const updated = db.prepare('SELECT * FROM requests WHERE id = ?').get(params.id) as ReqVaultRequest | undefined;
    return updated
 }, {
  body: t.Object({
    name: t.String(),
    method: t.Optional(t.String()),
    url: t.String(),
    headers: t.Optional(t.Union([t.Record(t.String(), t.String()), t.Null()])),
    queryParams: t.Optional(t.Union([t.Record(t.String(), t.String()), t.Null()])),
    body: t.Optional(t.Union([t.String(), t.Null()])),           // Allow null
    authType: t.Optional(t.Union([t.Literal('none'), t.Literal('bearer'), t.Literal('basic'), t.Literal('apikey')])),
    authValue: t.Optional(t.Union([t.String(), t.Null()])),
    tags: t.Optional(t.Union([t.Array(t.String()), t.Null()])),
    collection: t.Optional(t.Union([t.String(), t.Null()])),
  }, { additionalProperties: true })
})

  // DELETE /requests/:id
  .delete('/:id', async ({ params }) => {
    const db = getDb();
    const stmt = db.prepare('DELETE FROM requests WHERE id = ?');
    const result = stmt.run(params.id);

    if (result.changes === 0) {
      return { error: 'Request not found' };
    }

    return { success: true, message: 'Request deleted' };
  });