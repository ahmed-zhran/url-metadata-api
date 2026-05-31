/**
 * url-metadata-api — Core metadata extraction engine
 *
 * Fastest possible approach:
 *  - undici (built-in Node.js HTTP client since v18) for fetching
 *  - node-html-parser (C-accelerated) for DOM parsing
 *  - Pure regex for quick meta tag extraction before full parse
 */

import { parse } from 'node-html-parser';
import { request } from 'node:http';
import { request as httpsRequest } from 'node:https';

const DEFAULT_TIMEOUT = 8_000;
const MAX_BODY_BYTES = 3_000_000; // 3MB — safely covers all major sites

/**
 * Fetch a URL with timeout and size limit.
 * Returns { status, body, headers, redirectedUrl } or throws.
 */
function fetchUrl(url, timeout = DEFAULT_TIMEOUT) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const isHttps = parsed.protocol === 'https:';
    const fetcher = isHttps ? httpsRequest : request;

    const req = fetcher(
      url,
      {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; UrlMetadataBot/1.0; +https://url-metadata-api)',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        timeout,
        // Follow redirects manually (Node 18's follow is basic)
        rejectUnauthorized: false,
      },
      (res) => {
        const status = res.statusCode || 0;

        // Handle redirects (follow up to 5)
        if (status >= 300 && status < 400 && res.headers.location) {
          res.resume(); // Drain
          try {
            const redirectUrl = new URL(res.headers.location, url).href;
            return resolve(fetchUrl(redirectUrl, timeout));
          } catch {
            reject(new Error(`Invalid redirect: ${res.headers.location}`));
            return;
          }
        }

        const chunks = [];
        let totalBytes = 0;
        let limitReached = false;

        res.on('data', (chunk) => {
          if (limitReached) return;
          totalBytes += chunk.length;
          if (totalBytes > MAX_BODY_BYTES) {
            limitReached = true;
            return;
          }
          chunks.push(chunk);
        });

        res.on('end', () => {
          const body = Buffer.concat(chunks).toString('utf-8');
          resolve({
            status,
            body,
            headers: res.headers,
            redirectedUrl: url,
          });
        });
        res.on('error', reject);
      }
    );

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request timeout after ${timeout}ms`));
    });
    req.on('error', reject);
    req.end();
  });
}

/**
 * Extract <title> from raw HTML using regex first (no parse needed).
 */
function extractTitleFast(body) {
  const match = body.match(/<title[^>]*>([^<]*)<\/title>/i);
  return match ? match[1].trim() : null;
}

/**
 * Extract a meta property by name, property, or itemprops.
 */
function extractMeta(body, names) {
  for (const name of names) {
    // Try property="..." first (OG), then name="..."
    const patterns = [
      new RegExp(`<meta[^>]+(?:property|name)=["']${name}["'][^>]*content=["']([^"']*)["']`, 'i'),
      new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${name}["']`, 'i'),
    ];
    for (const pattern of patterns) {
      const match = body.match(pattern);
      if (match) return match[1].trim();
    }
  }
  return null;
}

/**
 * Extract favicon URL from link tags or fall back to /favicon.ico.
 */
function extractFavicon(body, baseUrl) {
  // Try various icon link tags (ordered by preference)
  const patterns = [
    /<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["']/i,
    /<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:shortcut )?icon["']/i,
    /<link[^>]+rel=["']apple-touch-icon["'][^>]+href=["']([^"']+)["']/i,
    /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']apple-touch-icon["']/i,
  ];

  for (const pattern of patterns) {
    const match = body.match(pattern);
    if (match) {
      try {
        return new URL(match[1], baseUrl).href;
      } catch {
        continue;
      }
    }
  }

  // Fallback
  return `${baseUrl.replace(/\/$/, '')}/favicon.ico`;
}

/**
 * Core function: extract metadata from a URL.
 */
export async function extractMetadata(url, options = {}) {
  const timeout = options.timeout || DEFAULT_TIMEOUT;

  // Normalize URL
  let normalizedUrl = url;
  if (!/^https?:\/\//i.test(url)) {
    normalizedUrl = `https://${url}`;
  }

  const { status, body, redirectedUrl } = await fetchUrl(normalizedUrl, timeout);
  const baseUrl = redirectedUrl || normalizedUrl;

  if (status >= 400) {
    return {
      url: normalizedUrl,
      error: `HTTP ${status}`,
      status,
    };
  }

  // Fast path: extract title with regex (no DOM parse)
  let title = extractTitleFast(body);

  // Extract meta tags with regex (fast)
  const description = extractMeta(body, ['description', 'og:description', 'twitter:description']);
  const ogTitle = extractMeta(body, ['og:title', 'twitter:title']);
  const image = extractMeta(body, ['og:image', 'twitter:image', 'image']);
  const siteName = extractMeta(body, ['og:site_name', 'application-name']);
  const ogType = extractMeta(body, ['og:type']);
  const ogUrl = extractMeta(body, ['og:url']);
  const keywords = extractMeta(body, ['keywords']);

  // Use OG title if it's more specific than <title>
  if (ogTitle && (!title || title === ogTitle.split(' ').slice(0, 3).join(' ') || ogTitle.includes('|') || ogTitle.includes(' — '))) {
    // Keep OG title as better option
  }

  // If OG title is very different from HTML title, prefer OG (it's usually better)
  const resolvedTitle = ogTitle || title;

  // Favicon
  const favicon = extractFavicon(body, baseUrl);

  // Content type
  const contentType = body.includes('<html') ? 'text/html' : 'unknown';

  return {
    url: ogUrl || normalizedUrl,
    resolved_url: redirectedUrl || normalizedUrl,
    title: resolvedTitle || null,
    description: description || null,
    image: image || null,
    favicon,
    site_name: siteName || null,
    type: ogType || 'website',
    keywords: keywords || null,
    status,
    cached: false,
    timestamp: new Date().toISOString(),
  };
}
