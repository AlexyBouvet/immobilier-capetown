#!/usr/bin/env node

/**
 * Link Validator for Cape Town Property Investment Site
 *
 * Tests all listing URLs and searchUrls in listings.json
 * Run: node scripts/test-links.js
 *
 * Exit codes:
 *   0 = All links valid
 *   1 = Some links broken (listed in output)
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const TIMEOUT = 10000; // 10 seconds
const CONCURRENCY = 5; // Test 5 URLs at a time

// Load listings
const listingsPath = path.join(__dirname, '..', 'data', 'listings.json');
const listings = JSON.parse(fs.readFileSync(listingsPath, 'utf8'));

// Extract all URLs
const urls = [];

// Listing URLs
listings.listings.forEach(listing => {
  urls.push({
    id: listing.id,
    type: 'listing',
    title: listing.title,
    url: listing.url
  });
});

// Search URLs
Object.entries(listings.searchUrls || {}).forEach(([key, url]) => {
  urls.push({
    id: key,
    type: 'searchUrl',
    title: key,
    url: url
  });
});

console.log(`\nTesting ${urls.length} URLs...\n`);

// Test a single URL
function testUrl(urlInfo) {
  return new Promise((resolve) => {
    const { url, id, title } = urlInfo;
    const protocol = url.startsWith('https') ? https : http;

    const req = protocol.get(url, { timeout: TIMEOUT }, (res) => {
      const status = res.statusCode;

      // Follow redirects
      if (status >= 300 && status < 400 && res.headers.location) {
        // Redirect is OK for property sites
        resolve({ ...urlInfo, status: 'OK', code: status, redirect: res.headers.location });
      } else if (status >= 200 && status < 300) {
        resolve({ ...urlInfo, status: 'OK', code: status });
      } else {
        resolve({ ...urlInfo, status: 'BROKEN', code: status });
      }
    });

    req.on('error', (err) => {
      resolve({ ...urlInfo, status: 'ERROR', error: err.message });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ ...urlInfo, status: 'TIMEOUT' });
    });
  });
}

// Run tests in batches
async function runTests() {
  const results = [];
  const broken = [];

  for (let i = 0; i < urls.length; i += CONCURRENCY) {
    const batch = urls.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(batch.map(testUrl));

    batchResults.forEach(result => {
      results.push(result);

      if (result.status === 'OK') {
        console.log(`✓ ${result.type.padEnd(10)} ${result.id.padEnd(12)} ${result.title.substring(0, 30)}`);
      } else {
        console.log(`✗ ${result.type.padEnd(10)} ${result.id.padEnd(12)} ${result.title.substring(0, 30)} → ${result.status} ${result.code || result.error || ''}`);
        broken.push(result);
      }
    });
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log(`SUMMARY: ${results.length - broken.length}/${results.length} links OK`);

  if (broken.length > 0) {
    console.log('\nBROKEN LINKS:');
    broken.forEach(b => {
      console.log(`  - ${b.id}: ${b.url}`);
    });
    console.log('\nAction: Remove broken listings from data/listings.json');
    process.exit(1);
  } else {
    console.log('\nAll links are valid!');
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});
