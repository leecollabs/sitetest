const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '..', 'logs');
const LOG_FILE = path.join(LOG_DIR, 'activity.log');

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

/**
 * Logs all API activity with timestamp, level, and message.
 * @param {'INFO'|'ERROR'|'REQUEST'|'RESPONSE'} level
 * @param {string} message
 * @param {object} [data]
 */
function log(level, message, data) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(data ? { data } : {})
  };
  const line = JSON.stringify(entry) + '\n';
  fs.appendFileSync(LOG_FILE, line);
  if (level === 'ERROR') {
    console.error(`[${entry.timestamp}] ${level}: ${message}`);
  } else {
    console.log(`[${entry.timestamp}] ${level}: ${message}`);
  }
}

module.exports = { log };
