#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const inputPath = process.argv[2];
const outputPath = process.argv[3] || path.resolve(process.cwd(), 'src/data/nakedDenverArticles.json');

if (!inputPath) {
  console.error('Usage: node scripts/importNakedDenverRss.cjs <rss-xml-file> [output-json-file]');
  process.exit(1);
}

const xml = fs.readFileSync(path.resolve(process.cwd(), inputPath), 'utf8');

const itemMatches = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];
const neighborhoodPatterns = [
  'RiNo',
  'Five Points',
  'Cherry Creek North',
  'Cherry Creek',
  'City Park West',
  'City Park',
  'Cole',
  'Globeville',
  'Highland',
  'Virginia Village',
  'Belleview Station',
  'Golden Triangle',
  'Central Park',
  'Downtown',
  'Berkeley',
  'Capitol Hill',
  'Civic Center',
  'LoDo',
];

function decodeXml(value) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

function extract(tag, block) {
  const match = block.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
  return match ? decodeXml(match[1]) : null;
}

function slugFromUrl(url) {
  return url.split('/').filter(Boolean).pop() || `nd-${Math.random().toString(36).slice(2, 8)}`;
}

function inferAddress(text) {
  if (!text) return null;
  const match = text.match(/\b\d{3,6}\s+[A-Z0-9.\- ]+(Street|St\.?|Avenue|Ave\.?|Boulevard|Blvd\.?|Road|Rd\.?|Drive|Dr\.?|Lane|Ln\.?|Way|Court|Ct\.?|Place|Pl\.?)\b/i);
  return match ? match[0].replace(/\s+/g, ' ').trim() : null;
}

function inferNeighborhood(text) {
  if (!text) return null;
  return neighborhoodPatterns.find((pattern) => new RegExp(`\\b${pattern.replace(/ /g, '\\s+')}\\b`, 'i').test(text)) || null;
}

function inferDevelopmentType(title, description) {
  const haystack = `${title} ${description}`.toLowerCase();
  if (/apartment|multifamily|residential|housing|loft|student housing|duplex/.test(haystack)) return 'Residential';
  if (/office/.test(haystack)) return 'Office';
  if (/retail|restaurant|shopping center|store/.test(haystack)) return 'Retail';
  if (/hotel/.test(haystack)) return 'Hotel';
  if (/industrial|data center|warehouse/.test(haystack)) return 'Industrial';
  if (/stadium|sports complex|arena/.test(haystack)) return 'Sports / Entertainment';
  if (/library|civic|public/.test(haystack)) return 'Civic / Institutional';
  return null;
}

function inferTags(title, description) {
  const haystack = `${title} ${description}`.toLowerCase();
  const tags = [];
  const candidates = [
    ['multifamily', /apartment|multifamily|housing|residential|loft|duplex/],
    ['mixed-use', /mixed use|mixed-use/],
    ['office', /office/],
    ['retail', /retail|store|shopping center/],
    ['hotel', /hotel/],
    ['industrial', /industrial|warehouse|data center/],
    ['adaptive reuse', /adaptive reuse|office-to-residential|conversion/],
    ['entitled site', /entitled|site development plan|rezoning|proposed/],
  ];

  for (const [tag, pattern] of candidates) {
    if (pattern.test(haystack)) tags.push(tag);
  }

  return tags;
}

const articles = itemMatches.map(([, block]) => {
  const title = extract('title', block) || 'Untitled';
  const url = extract('link', block) || '';
  const description = extract('description', block) || null;
  const pubDate = extract('pubDate', block);
  const combinedText = `${title} ${description || ''}`;

  return {
    id: slugFromUrl(url),
    title,
    url,
    publishedAt: pubDate ? new Date(pubDate).toISOString().slice(0, 10) : null,
    address: inferAddress(combinedText),
    neighborhood: inferNeighborhood(combinedText),
    lat: null,
    lng: null,
    summary: description,
    developmentType: inferDevelopmentType(title, description || ''),
    tags: inferTags(title, description || ''),
  };
});

fs.writeFileSync(outputPath, `${JSON.stringify(articles, null, 2)}\n`, 'utf8');
console.log(`Imported ${articles.length} RSS items into ${outputPath}`);
