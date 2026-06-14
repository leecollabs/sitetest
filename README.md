# sitetest

API that indexes page scripts, logs all activity, and produces encoded JSON output.

## Overview

- **API Server** (`src/server.js`) — HTTP API that responds to requests and errors, with all activity logged
- **Script Indexer** (`src/scriptIndexer.js`) — Indexes scripts into a comma-separated encoded string with timecode
- **Client JS** (`src/client.js`) — Browser script that collects all `<script>` elements, encodes them, and sends to the API
- **Logger** (`src/logger.js`) — Logs all activity to `logs/activity.log`

## API Endpoints

### `POST /api/index-scripts`

Accepts a list of scripts and page URL, returns encoded JSON.

**Request body:**
```json
{
  "scripts": ["https://cdn.example.com/lib.js", "/assets/app.js"],
  "url": "https://example.com/page"
}
```

**Response:**
```json
{
  "value": "<encoded comma-separated script index with timecode as final value>",
  "url": "<encoded page URL>",
  "timecode": "<encoded timecode of last run>"
}
```

### `GET /api/index-scripts`

Returns API usage information.

### `GET /api/health`

Health check endpoint.

## How It Works

1. **JS file** collects all `<script src="...">` on the page
2. Stores them as a comma-separated, URI-encoded string
3. Appends the timecode (when code was last run) as the final encoded value
4. Creates JSON with:
   - `value:` — the encoded script index string
   - `url:` — the encoded page URL
   - `timecode:` — the encoded timecode

## Usage

```bash
npm start        # Start the API server on port 3000
npm test         # Run tests
```

## Client Usage

Include `src/client.js` in your HTML page. It will automatically index all scripts and send the data to the API.