/**
 * url-metadata-api — Local development server
 * Hono on port 5500 for local testing
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
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
    // Basic URL validation
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

// Start server with @hono/node-server (Node.js adapter)
import { serve } from '@hono/node-server';

const PORT = process.env.PORT || 5500;

serve({
  fetch: app.fetch,
  port: PORT,
}, (info) => {
  console.log(`\n  🚀  url-metadata-api running on http://localhost:${info.port}`);
  console.log(`  📡  Try: curl http://localhost:${info.port}/metadata?url=https://example.com\n`);
});
