# URL Metadata API

Extract page title, Open Graph tags, favicon, and metadata from any URL — in a clean JSON response.

**Available on [RapidAPI](https://rapidapi.com).** Subscribe to get your API key and endpoint.

---

## Usage

### Get metadata from any URL

```
GET /metadata?url=<url>
```

**Headers:**

| Header | Value |
|--------|-------|
| `X-RapidAPI-Key` | *(your RapidAPI key)* |
| `X-RapidAPI-Host` | `url-metadata-api.p.rapidapi.com` |

**Example:**

```bash
curl --request GET \
  --url 'https://url-metadata-api.p.rapidapi.com/metadata?url=https://github.com' \
  --header 'X-RapidAPI-Key: YOUR_KEY' \
  --header 'X-RapidAPI-Host: url-metadata-api.p.rapidapi.com'
```

**Response:**

```json
{
  "url": "https://github.com",
  "resolved_url": "https://github.com",
  "title": "GitHub · Change is constant. GitHub keeps you ahead.",
  "description": "Join the world's most widely adopted, AI-powered developer platform where millions of developers, businesses, and the largest open source community build software that advances humanity.",
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

## Response Fields

| Field | Type | Always | Description |
|-------|------|:------:|-------------|
| `url` | string | ✓ | The URL you requested |
| `resolved_url` | string | ✓ | Final URL after redirects |
| `title` | string \| null | ✓ | Page `<title>` tag content |
| `description` | string \| null | ✓ | Meta description or OG description |
| `image` | string \| null | ✓ | OG image URL (social preview thumbnail) |
| `favicon` | string | ✓ | Favicon URL |
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

Available on RapidAPI:

| Tier | Requests | Price |
|------|----------|-------|
| Free | 100 / day | $0 |
| Basic | 10,000 / month | $5 |
| Pro | 100,000 / month | $20 |
| Ultra | 1,000,000 / month | $100 |

## License

MIT
