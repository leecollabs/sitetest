/**
 * Basic tests for the script indexer and API.
 */
const { indexScripts, createScriptJson } = require('./scriptIndexer');
const { log } = require('./logger');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ ${message}`);
    failed++;
  }
}

// Test indexScripts
console.log('Testing indexScripts:');
{
  const scripts = ['https://cdn.example.com/lib.js', '/assets/app.js'];
  const result = indexScripts(scripts);
  const parts = result.split(',');

  assert(parts.length === 3, 'Should have 3 parts (2 scripts + 1 timecode)');
  assert(decodeURIComponent(parts[0]) === scripts[0], 'First script should decode correctly');
  assert(decodeURIComponent(parts[1]) === scripts[1], 'Second script should decode correctly');
  assert(!isNaN(Number(decodeURIComponent(parts[2]))), 'Timecode should be a number');
}

// Test createScriptJson
console.log('\nTesting createScriptJson:');
{
  const scripts = ['https://cdn.example.com/lib.js'];
  const pageUrl = 'https://example.com/page?q=test';
  const result = createScriptJson(scripts, pageUrl);

  assert(typeof result.value === 'string', 'value should be a string');
  assert(typeof result.url === 'string', 'url should be a string');
  assert(typeof result.timecode === 'string', 'timecode should be a string');
  assert(decodeURIComponent(result.url) === pageUrl, 'url should decode to original page URL');
  assert(!isNaN(Number(decodeURIComponent(result.timecode))), 'timecode should decode to a number');

  // Decode value and verify it contains the script
  const decodedValue = decodeURIComponent(result.value);
  const valueParts = decodedValue.split(',');
  assert(valueParts.length >= 2, 'Decoded value should have at least 2 parts');
  assert(decodeURIComponent(valueParts[0]) === scripts[0], 'First part should be the script URL');
}

// Test logger
console.log('\nTesting logger:');
{
  log('INFO', 'Test log message', { test: true });
  assert(true, 'Logger should not throw');
}

// Summary
console.log(`\n${passed + failed} tests, ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
