# URL Metadata API

Extract page title, Open Graph tags, favicon, and metadata from any URL — in a clean JSON response.

**Zero external API costs.** No database. Just reads public HTML.

```
GET https://cwuievigjw7pbixvhoe4nyxcku0hnfku.lambda-url.us-east-1.on.aws/metadata?url=https://example.com
```

**[View on GitHub](https://github.com/ahmed-zhran/url-metadata-api)**

---

## Usage

### Get metadata from any URL

```
GET /metadata?url=<url>
```

```bash
curl "https://cwuievigjw7pbixvhoe4nyxcku0hnfku.lambda-url.us-east-1.on.aws/metadata?url=https://github.com"
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

```bash
curl https://cwuievigjw7pbixvhoe4nyxcku0hnfku.lambda-url.us-east-1.on.aws/
```

```json
{
  "service": "url-metadata-api",
  "version": "1.0.0",
  "status": "running"
}
```

## Response Fields

| Field | Type | Always | Description |
|-------|------|:------:|-------------|
| `url` | string | ✓ | The URL you requested |
| `resolved_url` | string | ✓ | Final URL after redirects |
| `title` | string \| null | ✓ | Page `<title>` tag content |
| `description` | string \| null | ✓ | Meta description or OG description |
| `image` | string \| null | ✓ | OG image URL (social preview thumbnail) |
| `favicon` | string | ✓ | Favicon URL (always resolved) |
| `site_name` | string \| null | ✓ | OG site name (e.g. "YouTube", "GitHub") |
| `type` | string \| null | ✓ | OG type ("website", "article", etc.) |
| `keywords` | string \| null | ✓ | Meta keywords, comma-separated |
| `status` | integer | ✓ | HTTP status code of the fetched page |
| `cached` | boolean | ✓ | Whether result came from cache |
| `timestamp` | string | ✓ | ISO 8601 timestamp |

Fields that don't exist on the page return `null`.

## Errors

| Status | Meaning |
|--------|---------|
| 400 | Missing or invalid `url` parameter |
| 502 | Failed to fetch the URL (timeout, DNS failure, etc.) |

## Pricing

| Tier | Requests | Price |
|------|----------|-------|
| Free | 100 / day | $0 |
| Basic | 10,000 / month | $5 |
| Pro | 100,000 / month | $20 |
| Ultra | 1,000,000 / month | $100 |

## License

MIT
