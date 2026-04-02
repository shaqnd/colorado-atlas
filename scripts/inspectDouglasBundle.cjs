#!/usr/bin/env node

const fs = require('fs');

const file = process.argv[2];
if (!file) {
  console.error('Usage: node scripts/inspectDouglasBundle.cjs <bundle-file>');
  process.exit(1);
}

const source = fs.readFileSync(file, 'utf8');

const interestingPatterns = [
  /https?:\/\/[^\s"'`]+/g,
  /\/[A-Za-z0-9_\-./;:?=&{}]+/g,
];

const keywords = [
  'simple-search',
  'property-details',
  'estimatedtaxes',
  'parcels_a_view',
  'api/public',
  'querymapserver',
  'polypolyresults',
  'accountno',
  'propertytype',
  'associatedreal',
  'owner',
  'year built',
  'neighborhood',
];

const matches = new Set();
for (const pattern of interestingPatterns) {
  for (const match of source.matchAll(pattern)) {
    const value = match[0];
    const lower = value.toLowerCase();
    if (keywords.some((keyword) => lower.includes(keyword))) {
      matches.add(value);
    }
  }
}

for (const value of [...matches].sort()) {
  console.log(value);
}

if (process.argv[3]) {
  const needle = process.argv[3];
  const index = source.toLowerCase().indexOf(needle.toLowerCase());
  if (index >= 0) {
    const start = Math.max(0, index - 1500);
    const end = Math.min(source.length, index + 2500);
    console.log('\n--- CONTEXT ---\n');
    console.log(source.slice(start, end));
  }
}
