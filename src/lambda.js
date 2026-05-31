/**
 * url-metadata-api — AWS Lambda handler
 *
 * Deploy: compress src/ + node_modules/ into a zip, upload to Lambda
 * Lambda URL: https://<id>.lambda-url.<region>.on.aws/
 *
 * Environment variables:
 *   LOG_LEVEL — 'debug' | 'info' | 'error' (default: 'error')
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { handle } from 'hono/aws-lambda';
import { extractMetadata } from './metadata.js';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger());

// Health check
app.get('/', (c) => {
  return c.json({
    service: 'url-metadata-api',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      metadata: 'GET /metadata?url=<encoded-url>',
      health: 'GET /',
    },
  });
});

// Metadata endpoint
app.get('/metadata', async (c) => {
  const url = c.req.query('url');

  if (!url) {
    return c.json({ error: 'Missing required query parameter: url' }, 400);
  }

  try {
    new URL(url.startsWith('http') ? url : `https://${url}`);
  } catch {
    return c.json({ error: 'Invalid URL provided' }, 400);
  }

  try {
    const result = await extractMetadata(url);
    return c.json(result);
  } catch (err) {
    return c.json({
      error: err.message || 'Failed to fetch URL metadata',
      url,
    }, 502);
  }
});

// Lambda entry point
export const handler = handle(app);
