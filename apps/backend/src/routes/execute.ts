// apps/backend/src/routes/execute.ts
import { Elysia, t } from 'elysia';
import { getDb } from '../db';
import type { ExecuteRequest, ExecuteResponse } from '@/types/index';

export const executeRoute = new Elysia({ prefix: '/execute' })
  .post('/', async ({ body, set }) => {
    const { requestId, ...requestData } = body as ExecuteRequest & { requestId?: number };
    
    const startTime = Date.now();
    
    try {
      let fullUrl = requestData.url;
      if (requestData.queryParams && Object.keys(requestData.queryParams).length > 0) {
        const params = new URLSearchParams(requestData.queryParams);
        fullUrl += (fullUrl.includes('?') ? '&' : '?') + params.toString();
      }

      const headers = { ...requestData.headers };

      // Handle authentication
      if (requestData.authType && requestData.authValue) {
        if (requestData.authType === 'bearer') {
          headers['Authorization'] = `Bearer ${requestData.authValue}`;
        } else if (requestData.authType === 'basic') {
          headers['Authorization'] = `Basic ${btoa(requestData.authValue)}`;
        } else if (requestData.authType === 'apikey') {
          headers['X-API-Key'] = requestData.authValue;
        }
      }

      const fetchOptions: RequestInit = {
        method: requestData.method.toUpperCase(),
        headers,
        body: requestData.body && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(requestData.method.toUpperCase()) 
          ? requestData.body 
          : undefined,
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(fullUrl, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const durationMs = Date.now() - startTime;

      let responseBody: string | null = null;
      const contentType = response.headers.get('content-type') || '';

      try {
        if (contentType.includes('application/json')) {
          responseBody = JSON.stringify(await response.json());
        } else {
          responseBody = await response.text();
        }
      } catch {
        responseBody = null;
      }

      const sizeBytes = responseBody ? new Blob([responseBody]).size : 0;

      const result: ExecuteResponse = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseBody,
        durationMs,
        sizeBytes,
        timestamp: new Date().toISOString(),
      };

      // === SAVE TO HISTORY IF requestId IS PROVIDED ===
      if (requestId) {
        const db = getDb();
        const historyStmt = db.prepare(`
          INSERT INTO response_history 
            (request_id, status, status_text, headers, body, duration_ms, size_bytes, timestamp)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        historyStmt.run(
          requestId,
          result.status,
          result.statusText,
          JSON.stringify(result.headers),
          result.body,
          result.durationMs,
          result.sizeBytes,
          result.timestamp
        );

        console.log(`✅ Response history saved for request ID: ${requestId}`);
      }

      return result;

    } catch (error: any) {
      const durationMs = Date.now() - startTime;
      const errorMsg = error.name === 'AbortError' ? 'Request timeout (30s)' : error.message;

      const errorResponse: ExecuteResponse = {
        status: 0,
        statusText: 'Request Failed',
        headers: {},
        body: null,
        durationMs,
        sizeBytes: 0,
        timestamp: new Date().toISOString(),
        error: errorMsg,
      };

      set.status = 400;
      return errorResponse;
    }
  }, {
    body: t.Object({
      method: t.String(),
      url: t.String(),
      headers: t.Optional(t.Record(t.String(), t.String())),
      queryParams: t.Optional(t.Record(t.String(), t.String())),
      body: t.Optional(t.String()),
      authType: t.Optional(t.Union([t.Literal('none'), t.Literal('bearer'), t.Literal('basic'), t.Literal('apikey')])),
      authValue: t.Optional(t.String()),
      requestId: t.Optional(t.Number()),   // <-- New: optional request ID to save history
    })
  });