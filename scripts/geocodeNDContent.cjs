#!/usr/bin/env node
/**
 * geocodeNDContent.cjs
 *
 * Enriches Naked Denver articles with geocoordinates and business links.
 * Also bootstraps nd-properties.json from known property URLs in businessDirectory.json.
 *
 * Run: node scripts/geocodeNDContent.cjs
 *
 * Outputs:
 *   public/data/nd-articles.json   — enriched article array with lat/lng + linkedBizIds
 *   public/data/nd-properties.json — property array with lat/lng + linkedBizIds
 *
 * Geocoding: Nominatim (OpenStreetMap) — free, no API key, 1 req/sec rate limit.
 */

'use strict';

const { writeFileSync, readFileSync, mkdirSync, existsSync } = require('fs');
const { join } = require('path');

const ROOT      = join(__dirname, '..');
const OUT_DIR   = join(ROOT, 'public', 'data');
const ART_SRC   = join(ROOT, 'src', 'data', 'nakedDenverArticles.json');
const BIZ_SRC   = join(ROOT, 'src', 'data', 'businessDirectory.json');
const ART_OUT   = join(OUT_DIR, 'nd-articles.json');
const PROP_OUT  = join(OUT_DIR, 'nd-properties.json');

const NOMINATIM = 'https://nominatim.openstreetmap.org/search';
const UA        = 'ColoradoAtlas/1.0 (contact@coloradoatlas.local)';
const RATE_MS   = 1100; // Nominatim requires ≤1 request/sec

// Colorado bounding box (loose)
const CO = { minLng: -109.1, maxLng: -102.0, minLat: 36.9, maxLat: 41.1 };

// ── Address extraction ─────────────────────────────────────────────────────────

const STREET_TYPES = 'Street|Avenue|Blvd|Boulevard|Drive|Road|Lane|Way|Court|Place|Parkway|Circle|Trail|' +
  'St|Ave|Dr|Rd|Ln|Ct|Pl|Pkwy';

const ADDR_PATTERNS = [
  // "at 1425 Kalamath Street"  /  "at 2777 Zuni"
  new RegExp(`\\bat\\s+(\\d{2,5}\\s+(?:[NSEW]\\.?\\s+)?[A-Z][\\w']+(?:\\s+[A-Z][\\w']+)?(?:\\s+(?:${STREET_TYPES}))?)`, 'i'),
  // Leading address in summary: "1245 E Colfax Avenue …"
  new RegExp(`^(\\d{2,5}\\s+(?:[NSEW]\\.?\\s+)?[A-Z][\\w']+(?:\\s+[A-Z][\\w']+)?(?:\\s+(?:${STREET_TYPES}))?)`, 'i'),
  // Generic street address anywhere in text
  new RegExp(`(\\d{2,5}\\s+(?:[NSEW]\\.?\\s+)?[A-Z][\\w']+(?:\\s+[A-Z][\\w']+){0,2}\\s+(?:${STREET_TYPES}))`, 'i'),
];

function extractAddress(text) {
  const clean = text.replace(/\n/g, ' ').trim();
  for (const pat of ADDR_PATTERNS) {
    const m = clean.match(pat);
    if (m) {
      const addr = m[1].trim();
      // Sanity: must start with a number, be reasonably short
      if (/^\d/.test(addr) && addr.length < 60) return addr;
    }
  }
  return null;
}

function bestAddress(article) {
  const existing = article.address;
  // Reject garbage addresses (those that contain long sentences)
  if (existing && /^\d/.test(existing) && existing.length < 60) {
    const streetMatch = existing.match(new RegExp(`\\d{2,5}\\s+(?:[NSEW]\\.?\\s+)?[\\w]+(?:\\s+(?:${STREET_TYPES}))`, 'i'));
    if (streetMatch) return existing;
  }
  // Try to extract from summary and title
  const combined = [article.title, article.summary].filter(Boolean).join(' ');
  return extractAddress(combined);
}

// ── Business name matching ─────────────────────────────────────────────────────

function buildMatchTerms(businesses) {
  return businesses.map(biz => {
    // Strip parenthetical suffixes like "(Denver)", "(Colorado)"
    let core = biz.name.replace(/\s*\(.*?\)\s*/g, '').trim();
    // Further strip common suffixes for short matches
    const terms = [core];
    // Also try without trailing role words
    const shorter = core.replace(/\s+(Construction|Architects?|Architecture|Engineering|Group|Partners|Properties|Capital|Development|Real Estate|Residential|Design|Company|Solutions|Services|Corporation|Contracting|Collective|Management)\s*$/i, '').trim();
    if (shorter && shorter !== core && shorter.length > 3) terms.push(shorter);
    return { id: biz.id, name: biz.name, terms };
  });
}

function findLinkedBizIds(text, matchTerms) {
  const lower = text.toLowerCase();
  const ids = new Set();
  for (const { id, terms } of matchTerms) {
    for (const term of terms) {
      if (term.length < 4) continue;
      const idx = lower.indexOf(term.toLowerCase());
      if (idx >= 0) {
        // Verify it's a word boundary (not mid-word)
        const before = idx > 0 ? lower[idx - 1] : ' ';
        const after  = lower[idx + term.length] ?? ' ';
        if (/\W/.test(before) && /\W/.test(after)) {
          ids.add(id);
          break;
        }
      }
    }
  }
  return Array.from(ids);
}

// ── Nominatim geocoder ─────────────────────────────────────────────────────────

let lastFetchTime = 0;

async function geocode(query) {
  // Rate limit: Nominatim requires ≤1 req/sec
  const now = Date.now();
  const wait = RATE_MS - (now - lastFetchTime);
  if (wait > 0) await new Promise(r => setTimeout(r, wait));
  lastFetchTime = Date.now();

  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit: '3',
    countrycodes: 'us',
    addressdetails: '1',
    viewbox: `${CO.minLng},${CO.minLat},${CO.maxLng},${CO.maxLat}`,
    bounded: '1',
  });

  try {
    const res = await fetch(`${NOMINATIM}?${params}`, {
      headers: { 'User-Agent': UA, 'Accept-Language': 'en' },
    });
    if (!res.ok) throw new Error(`Nominatim ${res.status}`);
    const results = await res.json();
    if (!results.length) return null;

    // Prefer Colorado results
    const co = results.find(r => r.address?.state === 'Colorado') ?? results[0];
    const lat = parseFloat(co.lat);
    const lng = parseFloat(co.lon);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    if (lat < CO.minLat || lat > CO.maxLat || lng < CO.minLng || lng > CO.maxLng) return null;

    return { lat: Math.round(lat * 1e6) / 1e6, lng: Math.round(lng * 1e6) / 1e6 };
  } catch (err) {
    console.warn(`  Geocode error for "${query}": ${err.message}`);
    return null;
  }
}

// ── Property slug parser ───────────────────────────────────────────────────────

function parsePropertySlug(url) {
  if (!url) return null;
  const slug = url.split('/properties/')[1];
  if (!slug) return null;
  // Reverse-engineer the address from slug
  // e.g. "milwaukee-place-242-milwaukee-street-denver"
  // Heuristic: find "NNN-word-street/ave/etc" pattern
  const m = slug.match(/(?:^|-)(\d{2,5}(?:-[a-z]+)+)(-denver|-aurora|-boulder|-lakewood|-centennial|-englewood|-littleton|-arvada|-thornton|-westminster|-brighton|-castle-rock|-castle-pines)?$/i);
  let address = null;
  if (m) {
    // Convert hyphens to spaces in the address portion
    address = m[1].replace(/-/g, ' ');
    // Capitalise words
    address = address.replace(/\b\w/g, c => c.toUpperCase());
    address += ', Denver, CO';
  }
  // Extract property name: everything before the first digit group
  const parts = slug.split('-');
  const firstNum = parts.findIndex(p => /^\d+$/.test(p));
  const nameParts = firstNum > 0 ? parts.slice(0, firstNum) : parts.slice(0, 3);
  const title = nameParts.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return { slug, title, url, address };
}

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== Colorado Atlas — ND Content Geocoder ===');
  console.log(`Date: ${new Date().toISOString()}\n`);

  mkdirSync(OUT_DIR, { recursive: true });

  const articles   = JSON.parse(readFileSync(ART_SRC, 'utf8'));
  const businesses = JSON.parse(readFileSync(BIZ_SRC, 'utf8'));

  const matchTerms = buildMatchTerms(businesses);
  console.log(`Loaded ${articles.length} articles, ${businesses.length} businesses`);

  // ── Enrich articles ──────────────────────────────────────────────────────────

  console.log('\n── Geocoding articles ──');
  const existingOut = existsSync(ART_OUT) ? JSON.parse(readFileSync(ART_OUT, 'utf8')) : null;
  const existingMap = {};
  if (existingOut?.articles) {
    for (const a of existingOut.articles) {
      if (a.lat) existingMap[a.id] = { lat: a.lat, lng: a.lng };
    }
  }

  const enrichedArticles = [];
  let geocoded = 0, cached = 0;

  for (const article of articles) {
    const text = [article.title, article.summary].filter(Boolean).join(' ');
    const linkedBizIds = findLinkedBizIds(text, matchTerms);

    // Try to find a geocodeable address
    let lat = null, lng = null;
    const addrStr = bestAddress(article);

    if (existingMap[article.id]) {
      ({ lat, lng } = existingMap[article.id]);
      cached++;
    } else if (addrStr) {
      const query = addrStr.includes('CO') || addrStr.includes('Denver') || addrStr.includes('Colorado')
        ? addrStr
        : `${addrStr}, Denver, CO`;
      console.log(`  Geocoding: "${query}"`);
      const result = await geocode(query);
      if (result) {
        ({ lat, lng } = result);
        geocoded++;
        console.log(`    → ${lat}, ${lng}`);
      } else {
        console.log(`    → not found`);
      }
    }

    enrichedArticles.push({
      id:              article.id,
      title:           article.title,
      url:             article.url,
      publishedAt:     article.publishedAt,
      summary:         article.summary || null,
      address:         addrStr || null,
      lat,
      lng,
      neighborhood:    article.neighborhood || null,
      developmentType: article.developmentType || null,
      tags:            article.tags || [],
      linkedBizIds,
    });
  }

  const artOut = {
    updatedAt: new Date().toISOString(),
    count: enrichedArticles.length,
    geocodedCount: enrichedArticles.filter(a => a.lat).length,
    articles: enrichedArticles,
  };
  writeFileSync(ART_OUT, JSON.stringify(artOut, null, 2));
  console.log(`\nSaved ${ART_OUT}`);
  console.log(`  Total: ${enrichedArticles.length}, geocoded: ${artOut.geocodedCount} (${geocoded} new, ${cached} cached)`);
  console.log(`  Articles with business links: ${enrichedArticles.filter(a => a.linkedBizIds.length).length}`);

  // ── Bootstrap properties ─────────────────────────────────────────────────────

  console.log('\n── Processing properties ──');

  // Collect all known property URLs from businessDirectory
  const existingPropOut = existsSync(PROP_OUT) ? JSON.parse(readFileSync(PROP_OUT, 'utf8')) : null;
  const existingPropMap = {};
  if (existingPropOut?.properties) {
    for (const p of existingPropOut.properties) {
      existingPropMap[p.id] = p;
    }
  }

  const propsBySlug = { ...existingPropMap };

  for (const biz of businesses) {
    if (!biz.nakedProperty) continue;
    const parsed = parsePropertySlug(biz.nakedProperty);
    if (!parsed) continue;
    const { slug, title, url, address } = parsed;
    if (propsBySlug[slug]) {
      // Already exists — just add this biz to linked IDs
      const existing = propsBySlug[slug];
      if (!existing.linkedBizIds.includes(biz.id)) existing.linkedBizIds.push(biz.id);
    } else {
      propsBySlug[slug] = { id: slug, title, url, address, lat: null, lng: null,
        type: null, status: null, description: null, imageUrl: null,
        linkedBizIds: [biz.id], linkedArticleIds: [] };
    }
  }

  // Geocode properties that don't have coordinates
  const properties = Object.values(propsBySlug);
  for (const prop of properties) {
    if (prop.lat) continue;
    if (!prop.address) continue;
    console.log(`  Geocoding property: "${prop.address}"`);
    const result = await geocode(prop.address);
    if (result) {
      prop.lat = result.lat;
      prop.lng = result.lng;
      console.log(`    → ${prop.lat}, ${prop.lng}`);
    } else {
      console.log(`    → not found`);
    }
  }

  // Link articles to properties by checking if the property address is in the article
  for (const prop of properties) {
    if (!prop.address) continue;
    const addrCore = prop.address.split(',')[0].toLowerCase();
    for (const art of enrichedArticles) {
      const text = [art.title, art.summary].filter(Boolean).join(' ').toLowerCase();
      if (text.includes(addrCore) && !prop.linkedArticleIds.includes(art.id)) {
        prop.linkedArticleIds.push(art.id);
      }
    }
  }

  const propOut = {
    updatedAt: new Date().toISOString(),
    count: properties.length,
    geocodedCount: properties.filter(p => p.lat).length,
    properties,
  };
  writeFileSync(PROP_OUT, JSON.stringify(propOut, null, 2));
  console.log(`\nSaved ${PROP_OUT}`);
  console.log(`  Total: ${properties.length}, geocoded: ${propOut.geocodedCount}`);

  console.log('\nDone.');
}

main().catch(err => {
  console.error('Fatal:', err.message ?? err);
  process.exit(1);
});
