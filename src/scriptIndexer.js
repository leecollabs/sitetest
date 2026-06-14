/**
 * Script Indexer
 *
 * Creates an index of all scripts on a page:
 * - Stores them as a comma-separated, URI-encoded string
 * - Records the timecode of when the code was last run as the final encoded value
 *
 * Then produces a JSON object with:
 * - value: the encoded script index string
 * - url: the encoded page URL
 * - timecode: the encoded timecode
 */

/**
 * Indexes all script sources from an HTML page.
 * Returns a comma-separated, encoded string of script src values
 * with the timecode appended as the final value.
 *
 * @param {string[]} scripts - Array of script src URLs found on the page
 * @param {string} [timecode] - Optional timecode; defaults to Date.now()
 * @returns {{ indexString: string, timecode: string }}
 */
function indexScripts(scripts, timecode) {
  timecode = timecode || Date.now().toString();
  const encodedScripts = scripts.map(script => encodeURIComponent(script));
  const encodedTimecode = encodeURIComponent(timecode);

  const indexString = [...encodedScripts, encodedTimecode].join(',');
  return { indexString, timecode };
}

/**
 * Creates the JSON output from the indexed scripts.
 * Encodes the values under value:, the url under url:, and timecode under timecode:
 *
 * @param {string[]} scripts - Array of script src URLs found on the page
 * @param {string} pageUrl - The URL of the page being indexed
 * @returns {object} JSON object with encoded value, url, and timecode
 */
function createScriptJson(scripts, pageUrl) {
  const timecode = Date.now().toString();
  const { indexString } = indexScripts(scripts, timecode);

  return {
    value: encodeURIComponent(indexString),
    url: encodeURIComponent(pageUrl),
    timecode: encodeURIComponent(timecode)
  };
}

module.exports = { indexScripts, createScriptJson };
