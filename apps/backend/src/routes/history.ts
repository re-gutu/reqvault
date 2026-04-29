// apps/backend/src/routes/history.ts
import { Elysia } from 'elysia';
import { getDb } from '../db';

export const historyRoute = new Elysia({ prefix: '/history' })

  // GET /history/:requestId - Get history for a specific request
  .get('/:requestId', async ({ params }) => {
    const db = getDb();
    const stmt = db.prepare(`
      SELECT * FROM response_history 
      WHERE request_id = ? 
      ORDER BY timestamp DESC
    `);
    const history = stmt.all(params.requestId);
    return history;
  });