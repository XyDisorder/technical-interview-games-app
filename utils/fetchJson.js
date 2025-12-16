const https = require('https');

/**
 * Fetches JSON data from a URL
 * @param {string} url - The URL to fetch JSON from
 * @returns {Promise<Object>} - The parsed JSON data
 */
const fetchJson = (url) => new Promise((resolve, reject) => {
  https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        resolve(json);
      } catch (err) {
        reject(new Error(`Failed to parse JSON from ${url}: ${err.message}`));
      }
    });
  }).on('error', (err) => {
    reject(new Error(`Failed to fetch ${url}: ${err.message}`));
  });
});

module.exports = fetchJson;
