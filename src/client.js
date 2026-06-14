/**
 * Client-side Script Indexer
 *
 * Runs in the browser to:
 * 1. Index all <script> elements on the page
 * 2. Store them as a comma-separated, URI-encoded string
 * 3. Record the timecode of when code was last run as the final encoded value
 * 4. Send the encoded JSON to the API with value:, url:, and timecode:
 */
(function () {
  'use strict';

  /**
   * Collects all script src attributes from the page.
   * @returns {string[]} Array of script src URLs
   */
  function collectScripts() {
    var scriptElements = document.querySelectorAll('script[src]');
    var scripts = [];
    for (var i = 0; i < scriptElements.length; i++) {
      scripts.push(scriptElements[i].getAttribute('src'));
    }
    return scripts;
  }

  /**
   * Creates a comma-separated encoded string of scripts with timecode as final value.
   * @param {string[]} scripts
   * @returns {string}
   */
  function indexScripts(scripts, timecode) {
    timecode = timecode || Date.now().toString();
    var encoded = scripts.map(function (s) {
      return encodeURIComponent(s);
    });
    encoded.push(encodeURIComponent(timecode));
    return { indexString: encoded.join(','), timecode: timecode };
  }

  /**
   * Creates the JSON payload and sends it to the API.
   * Encodes values under value:, url under url:, timecode under timecode:
   * @param {string[]} scripts
   * @param {string} pageUrl
   */
  function createAndSendJson(scripts, pageUrl) {
    var timecode = Date.now().toString();
    var result = indexScripts(scripts, timecode);

    var payload = {
      value: encodeURIComponent(result.indexString),
      url: encodeURIComponent(pageUrl),
      timecode: encodeURIComponent(timecode)
    };

    // Send to API
    var apiUrl = '/api/index-scripts';
    var xhr = new XMLHttpRequest();
    xhr.open('POST', apiUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          console.log('[ScriptIndexer] Successfully sent script index to API');
        } else {
          console.error('[ScriptIndexer] Error sending script index:', xhr.status, xhr.responseText);
        }
      }
    };
    xhr.send(JSON.stringify({ scripts: scripts, url: pageUrl }));

    return payload;
  }

  // Execute on page load
  function run() {
    var scripts = collectScripts();
    var pageUrl = window.location.href;
    var result = createAndSendJson(scripts, pageUrl);
    console.log('[ScriptIndexer] Indexed', scripts.length, 'scripts');
    console.log('[ScriptIndexer] Payload:', JSON.stringify(result));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
