# url-metadata-api

Extract rich metadata from any URL — title, description, OG image, favicon, site name.

**Zero external API costs.** Reads public HTML only.

## Quick Start

```bash
npm install
npm run dev     # Starts on http://localhost:5500
```

## Usage

```bash
# Metadata
curl "http://localhost:5500/metadata?url=https://example.com"

# Health
curl http://localhost:5500/
```

## Response

```json
{
  "url": "https://example.com",
  "resolved_url": "https://example.com",
  "title": "Example Domain",
  "description": "This domain is for use in illustrative examples...",
  "image": null,
  "favicon": "https://example.com/favicon.ico",
  "site_name": null,
  "type": "website",
  "keywords": null,
  "status": 200,
  "cached": false,
  "timestamp": "2026-05-31T..."
}
```

## Deploy to Lambda

```bash
# Create deployment package
mkdir -p dist
cp -r src node_modules package.json dist/
cd dist && zip -r ../lambda.zip . && cd ..

# Create Lambda function
aws lambda create-function \
  --function-name url-metadata-api \
  --runtime nodejs18.x \
  --handler src/lambda.handler \
  --role arn:aws:iam::ACCOUNT:role/lambda-execution \
  --zip-file fileb://lambda.zip

# Enable public URL
aws lambda add-permission \
  --function-name url-metadata-api \
  --action lambda:InvokeFunctionUrl \
  --principal "*" \
  --function-url-auth-type NONE

# Get your URL
aws lambda get-function-url-config --function-name url-metadata-api
```

## Tech Stack

- **Node.js 18** — Built-in undici HTTP client (fastest in Node)
- **Hono** — Ultra-fast web framework (~14KB), Lambda-native
- **node-html-parser** — C-accelerated HTML parsing (3x faster than cheerio)
- **AWS Lambda** — Free tier: 1M requests/month

## License

MIT
