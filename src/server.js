const http = require('http');
const { log } = require('./logger');
const { indexScripts, createScriptJson } = require('./scriptIndexer');

const PORT = process.env.PORT || 3000;

/**
 * Parses the request body as JSON.
 * @param {http.IncomingMessage} req
 * @returns {Promise<object>}
 */
const MAX_BODY_SIZE = 1024 * 1024; // 1MB limit

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    let size = 0;
    req.on('data', chunk => {
      size += chunk.length;
      if (size > MAX_BODY_SIZE) {
        reject(new Error('Request body too large'));
        return;
      }
      body += chunk;
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

/**
 * Sends a JSON response.
 */
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

/**
 * Main request handler.
 */
async function handleRequest(req, res) {
  const { method, url } = req;

  log('REQUEST', `${method} ${url}`, { method, url });

  try {
    // POST /api/index-scripts
    // Accepts { scripts: string[], url: string }
    // Returns encoded JSON with value, url, timecode
    if (method === 'POST' && url === '/api/index-scripts') {
      const body = await parseBody(req);

      if (!body.scripts || !Array.isArray(body.scripts)) {
        log('ERROR', 'Missing or invalid "scripts" array in request body');
        sendJson(res, 400, { error: 'Missing or invalid "scripts" array in request body' });
        return;
      }

      if (!body.url || typeof body.url !== 'string') {
        log('ERROR', 'Missing or invalid "url" in request body');
        sendJson(res, 400, { error: 'Missing or invalid "url" in request body' });
        return;
      }

      const result = createScriptJson(body.scripts, body.url);
      log('RESPONSE', 'Script index created successfully', result);
      sendJson(res, 200, result);
      return;
    }

    // GET /api/index-scripts
    // Returns usage information
    if (method === 'GET' && url === '/api/index-scripts') {
      const info = {
        endpoint: '/api/index-scripts',
        method: 'POST',
        description: 'Index page scripts and return encoded JSON',
        body: {
          scripts: 'string[] - Array of script src URLs from the page',
          url: 'string - The page URL'
        },
        response: {
          value: 'Encoded comma-separated script index with timecode',
          url: 'Encoded page URL',
          timecode: 'Encoded timecode of last run'
        }
      };
      log('RESPONSE', 'Returned API info');
      sendJson(res, 200, info);
      return;
    }

    // Health check
    if (method === 'GET' && url === '/api/health') {
      log('RESPONSE', 'Health check OK');
      sendJson(res, 200, { status: 'ok' });
      return;
    }

    // 404 for unmatched routes
    log('ERROR', `Route not found: ${method} ${url}`);
    sendJson(res, 404, { error: `Route not found: ${method} ${url}` });

  } catch (err) {
    log('ERROR', `Internal server error: ${err.message}`, { stack: err.stack });
    sendJson(res, 500, { error: 'Internal server error' });
  }
}

const server = http.createServer(handleRequest);

server.listen(PORT, () => {
  log('INFO', `API server started on port ${PORT}`);
});

module.exports = { server, handleRequest };
