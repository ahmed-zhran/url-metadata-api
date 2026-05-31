# URL Metadata API

Extract page title, Open Graph tags, favicon, and metadata from any URL — in a clean JSON response.

---



## Usage

### Get metadata from any URL

```
GET /metadata?url=http://example.com
```


**Response:**

```json
{
  "url": "https://github.com",
  "resolved_url": "https://github.com",
  "title": "GitHub · Change is constant.",
  "description": "Join the world's most widely adopted, AI-powered developer platform...",
  "image": "https://images.ctfassets.net/.../GH-Homepage-Universe-img.png",
  "favicon": "https://github.githubassets.com/favicons/favicon",
  "site_name": "GitHub",
  "type": "object",
  "keywords": null,
  "status": 200,
  "cached": false,
  "timestamp": "2026-05-31T14:52:01.406Z"
}
```

### Health check

```
GET /
```

```json
{
  "service": "url-metadata-api",
  "version": "1.0.0",
  "status": "running"
}
```

## Response Fields

| Field | Type | Always present | Description |
|-------|------|:---:|-------------|
| `url` | string | ✓ | The URL you requested |
| `resolved_url` | string | ✓ | Final URL after redirects |
| `title` | string \| null | ✓ | Page `&lt;title&gt;` tag content |
| `description` | string \| null | ✓ | Meta description or OG description |
| `image` | string \| null | ✓ | OG image URL (social preview thumbnail) |
| `favicon` | string | ✓ | Favicon URL (always resolved, falls back to /favicon.ico) |
| `site_name` | string \| null | ✓ | OG site name (e.g. "YouTube", "GitHub") |
| `type` | string \| null | ✓ | OG type ("website", "article", "video.other", etc.) |
| `keywords` | string \| null | ✓ | Meta keywords, comma-separated |
| `status` | integer | ✓ | HTTP status code of the fetched page |
| `cached` | boolean | ✓ | Whether this result came from cache |
| `timestamp` | string | ✓ | ISO 8601 timestamp of when metadata was fetched |

Fields that don't exist on the page return `null` — no placeholder defaults.

## Error Responses

| Status | Meaning |
|--------|---------|
| 400 | Missing or invalid `url` parameter |
| 502 | Failed to fetch the URL (timeout, DNS failure, invalid page) |
| 504 | Upstream server timed out |

## Pricing

Available on RapidAPI:

| Tier | Requests | Price |
|------|----------|-------|
| Basic | 1000/month | $0 |
| Pro | 10,000/month | $5 |
| Ultra | 100,000/month | $20 |
| Mega | 1,000,000/month | $100 |

## Tech Stack

- **Node.js 18** — Native ESM, built-in HTTP client
- **Hono** — Ultra-fast web framework (~14KB), Lambda-native
- **node-html-parser** — C-accelerated DOM parsing
- **AWS Lambda** — Free tier: 1M requests/month

## License

MIT
