#!/usr/bin/env node
/**
 * updateRecentSales.cjs
 *
 * Queries the Colorado Public Parcels ESRI FeatureServer for property sales
 * recorded in the last 90 days and writes a GeoJSON file consumed by the map.
 *
 * Run: node scripts/updateRecentSales.cjs
 * Scheduled: weekly via .github/workflows/update-sales.yml (every Monday 8 AM MT)
 *
 * Output:
 *   public/data/recent-sales.json       — GeoJSON FeatureCollection of sale points
 *   public/data/recent-sales-meta.json  — metadata (count, updated timestamp, cadence)
 *
 * Data source: Colorado GIS ESRI FeatureServer — publicly available, no API key required.
 * URL: gis.colorado.gov/public/rest/services/Address_and_Parcel/Colorado_Public_Parcels/FeatureServer/0
 *
 * Why weekly?
 * Colorado county assessors process recorded deeds on a weekly cycle. The statewide
 * GIS layer is aggregated from county submissions that update on a similar cadence.
 * Daily would fetch near-identical data; monthly would miss 3-4 weeks of sales.
 */

'use strict';

const { writeFileSync, mkdirSync } = require('fs');
const { join } = require('path');

// ── Config ─────────────────────────────────────────────────────────────────────

const ESRI_BASE =
  'https://gis.colorado.gov/public/rest/services/Address_and_Parcel/Colorado_Public_Parcels/FeatureServer/0';

const OUT_DIR  = join(__dirname, '..', 'public', 'data');
const OUT_FILE = join(OUT_DIR, 'recent-sales.json');
const META_FILE = join(OUT_DIR, 'recent-sales-meta.json');

const DAYS_LOOKBACK   = 90;    // rolling window shown on the map
const MIN_SALE_PRICE  = 10_000; // filter out $0 / nominal family transfers
const MAX_RECORDS     = 8_000; // cap to keep the static file small (~1 MB)
const PAGE_SIZE       = 1_000; // ESRI default page limit

// Colorado bounding box (loose) — drop any features that land outside
const CO_BOUNDS = { minLng: -109.1, maxLng: -102.0, minLat: 36.9, maxLat: 41.1 };

// ── Helpers ────────────────────────────────────────────────────────────────────

function toEpochMs(daysAgo) {
  return Date.now() - daysAgo * 24 * 60 * 60 * 1000;
}

function isoDateStr(epochMs) {
  return new Date(epochMs).toISOString().split('T')[0];
}

/** Parse any money-ish value to a float or null. */
function parseMoney(v) {
  if (v === null || v === undefined) return null;
  const n = parseFloat(String(v).replace(/[$,\s]/g, ''));
  return Number.isFinite(n) ? n : null;
}

/**
 * Parse the saleDate field which can arrive as:
 *   • epoch milliseconds (number or numeric string) — standard ESRI date field
 *   • "MM/DD/YYYY" string — some ESRI services format dates as strings
 * Returns a Date, or null on failure.
 */
function parseSaleDate(v) {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  if (!s || s.startsWith('12/30/1899')) return null; // ESRI null-sentinel

  // Try epoch milliseconds
  const n = Number(s);
  if (Number.isFinite(n) && n > 0) {
    const d = new Date(n);
    // Sanity-check: 2000-01-01 to today
    if (d.getFullYear() >= 2000 && d <= new Date()) return d;
  }

  // Try MM/DD/YYYY
  const parts = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (parts) {
    const d = new Date(`${parts[3]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`);
    if (!isNaN(d.getTime())) return d;
  }

  // Try ISO yyyy-mm-dd
  const iso = s.match(/^\d{4}-\d{2}-\d{2}/);
  if (iso) {
    const d = new Date(s);
    if (!isNaN(d.getTime())) return d;
  }

  return null;
}

/** Compute the centroid of the first (outer) ring of an ESRI polygon. */
function centroidFromRings(rings) {
  if (!Array.isArray(rings) || rings.length === 0) return null;
  const ring = rings[0];
  if (!Array.isArray(ring) || ring.length === 0) return null;
  let sumX = 0, sumY = 0;
  for (const pt of ring) {
    sumX += pt[0];
    sumY += pt[1];
  }
  return [sumX / ring.length, sumY / ring.length];
}

function inColoradoBounds(lng, lat) {
  return (
    lng >= CO_BOUNDS.minLng && lng <= CO_BOUNDS.maxLng &&
    lat >= CO_BOUNDS.minLat && lat <= CO_BOUNDS.maxLat
  );
}

// ── ESRI query ─────────────────────────────────────────────────────────────────

const FETCH_FIELDS = [
  'parcel_id', 'account',
  'situsAdd', 'sitAddCty',
  'countyName',
  'saleDate', 'salePrice',
  'landUseDsc', 'landAcres',
].join(',');

async function queryEsriPage(where, offset) {
  const params = new URLSearchParams({
    where,
    outFields: FETCH_FIELDS,
    returnGeometry: 'true',
    outSR: '4326',
    resultOffset: String(offset),
    resultRecordCount: String(PAGE_SIZE),
    orderByFields: 'saleDate DESC',
    f: 'json',
  });

  const url = `${ESRI_BASE}/query?${params}`;
  console.log(`  GET ${url.slice(0, 120)}...`);

  const res = await fetch(url, {
    headers: { 'User-Agent': 'ColoradoAtlas/1.0 (contact@coloradoatlas.local)' },
  });

  if (!res.ok) throw new Error(`ESRI returned HTTP ${res.status}`);

  const json = await res.json();
  if (json.error) throw new Error(`ESRI error: ${json.error.message ?? JSON.stringify(json.error)}`);
  return json;
}

/**
 * Try multiple WHERE clause strategies because the saleDate field type varies
 * across ESRI service versions (epoch ms vs. formatted string vs. SQL DATE).
 */
async function fetchAllSales(cutoffEpochMs, cutoffDateStr) {
  const strategies = [
    // Strategy 1: epoch milliseconds (standard ESRI date field type)
    {
      desc: 'epoch-ms',
      where: `saleDate >= ${cutoffEpochMs} AND salePrice >= ${MIN_SALE_PRICE}`,
    },
    // Strategy 2: SQL DATE literal
    {
      desc: 'date-literal',
      where: `saleDate >= DATE '${cutoffDateStr}' AND salePrice >= ${MIN_SALE_PRICE}`,
    },
    // Strategy 3: timestamp literal
    {
      desc: 'timestamp-literal',
      where: `saleDate >= TIMESTAMP '${cutoffDateStr} 00:00:00' AND salePrice >= ${MIN_SALE_PRICE}`,
    },
    // Strategy 4: broad filter — let date filtering happen in JS after fetch
    {
      desc: 'broad-filter',
      where: `salePrice >= ${MIN_SALE_PRICE} AND saleDate IS NOT NULL AND saleDate <> '12/30/1899'`,
      requiresLocalDateFilter: true,
    },
  ];

  for (const strategy of strategies) {
    console.log(`\nTrying WHERE strategy: ${strategy.desc}`);
    console.log(`  WHERE: ${strategy.where}`);

    let allFeatures = [];

    try {
      // First page
      const firstPage = await queryEsriPage(strategy.where, 0);
      const firstFeatures = firstPage.features ?? [];

      if (firstFeatures.length === 0) {
        console.log('  → 0 results, trying next strategy');
        continue;
      }

      console.log(`  → ${firstFeatures.length} records on first page`);
      allFeatures = firstFeatures;

      // Paginate
      if (firstFeatures.length === PAGE_SIZE && !strategy.requiresLocalDateFilter) {
        let offset = PAGE_SIZE;
        while (allFeatures.length < MAX_RECORDS) {
          console.log(`  Fetching offset ${offset}...`);
          await new Promise(r => setTimeout(r, 400)); // polite rate limit
          const page = await queryEsriPage(strategy.where, offset);
          const pageFeatures = page.features ?? [];
          allFeatures.push(...pageFeatures);
          offset += PAGE_SIZE;
          console.log(`  → ${allFeatures.length} total so far`);
          if (pageFeatures.length < PAGE_SIZE) break;
        }
      } else if (strategy.requiresLocalDateFilter) {
        // For the broad filter, only fetch first few pages then filter locally
        let offset = PAGE_SIZE;
        const MAX_BROAD_PAGES = 6; // limit broad queries to avoid huge datasets
        let page = 1;
        while (page < MAX_BROAD_PAGES && allFeatures.length < MAX_RECORDS) {
          await new Promise(r => setTimeout(r, 400));
          const pageData = await queryEsriPage(strategy.where, offset);
          const pageFeatures = pageData.features ?? [];
          allFeatures.push(...pageFeatures);
          offset += PAGE_SIZE;
          page++;
          if (pageFeatures.length < PAGE_SIZE) break;
        }
      }

      return { features: allFeatures, strategy };
    } catch (err) {
      console.warn(`  → Strategy ${strategy.desc} failed: ${err.message}`);
    }
  }

  throw new Error('All ESRI WHERE strategies failed. The service may be unavailable.');
}

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  const cutoffEpochMs = toEpochMs(DAYS_LOOKBACK);
  const cutoffDateStr = isoDateStr(cutoffEpochMs);
  const cutoffDate    = new Date(cutoffEpochMs);

  console.log('=== Colorado Atlas — Recent Sales Updater ===');
  console.log(`Date: ${new Date().toISOString()}`);
  console.log(`Lookback window: ${DAYS_LOOKBACK} days (since ${cutoffDateStr})`);
  console.log(`Min sale price: $${MIN_SALE_PRICE.toLocaleString()}`);
  console.log(`Max records: ${MAX_RECORDS}`);

  const { features: rawFeatures, strategy } = await fetchAllSales(cutoffEpochMs, cutoffDateStr);
  console.log(`\nRaw features from ESRI: ${rawFeatures.length}`);
  console.log(`Successful strategy: ${strategy.desc}`);

  // ── Convert to GeoJSON ─────────────────────────────────────────────────────

  const geojsonFeatures = [];
  let skippedNoPrice = 0, skippedNoDate = 0, skippedOldDate = 0, skippedNoCentroid = 0, skippedOutOfBounds = 0;

  for (const f of rawFeatures) {
    const a = f.attributes ?? {};

    const price = parseMoney(a.salePrice);
    if (!price || price < MIN_SALE_PRICE) { skippedNoPrice++; continue; }

    const saleDateObj = parseSaleDate(a.saleDate);
    if (!saleDateObj) { skippedNoDate++; continue; }

    // For broad-filter strategy: enforce the date cutoff in JS
    if (strategy.requiresLocalDateFilter && saleDateObj < cutoffDate) {
      skippedOldDate++;
      continue;
    }

    const rings = f.geometry?.rings;
    const centroid = centroidFromRings(rings);
    if (!centroid) { skippedNoCentroid++; continue; }

    const [lng, lat] = centroid;
    if (!inColoradoBounds(lng, lat)) { skippedOutOfBounds++; continue; }

    geojsonFeatures.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [lng, lat] },
      properties: {
        apn:       String(a.parcel_id ?? a.account ?? ''),
        address:   [a.situsAdd, a.sitAddCty].filter(Boolean).join(', ') || null,
        county:    String(a.countyName ?? ''),
        salePrice: price,
        saleDate:  saleDateObj.toISOString().split('T')[0],
        landUse:   a.landUseDsc ? String(a.landUseDsc) : null,
        acres:     typeof a.landAcres === 'number' ? Math.round(a.landAcres * 100) / 100 : null,
      },
    });
  }

  // Sort newest first
  geojsonFeatures.sort((a, b) => b.properties.saleDate.localeCompare(a.properties.saleDate));

  console.log('\n=== Filter summary ===');
  console.log(`  Valid sale features:   ${geojsonFeatures.length}`);
  console.log(`  Skipped (no price):   ${skippedNoPrice}`);
  console.log(`  Skipped (no date):    ${skippedNoDate}`);
  console.log(`  Skipped (old date):   ${skippedOldDate}`);
  console.log(`  Skipped (no center):  ${skippedNoCentroid}`);
  console.log(`  Skipped (out bounds): ${skippedOutOfBounds}`);

  if (geojsonFeatures.length === 0) {
    console.error('\nNo valid sales found. Aborting write to avoid overwriting good data.');
    process.exit(1);
  }

  // ── Write output ───────────────────────────────────────────────────────────

  mkdirSync(OUT_DIR, { recursive: true });

  const geojson = { type: 'FeatureCollection', features: geojsonFeatures };
  writeFileSync(OUT_FILE, JSON.stringify(geojson));

  const meta = {
    updatedAt:    new Date().toISOString(),
    count:        geojsonFeatures.length,
    lookbackDays: DAYS_LOOKBACK,
    cutoffDate:   cutoffDateStr,
    minSalePrice: MIN_SALE_PRICE,
    strategy:     strategy.desc,
    source:       'Colorado Public Parcels ESRI FeatureServer — gis.colorado.gov',
    cadence:      'Weekly (every Monday 8 AM MT)',
    note:         'County assessors process recorded deeds weekly; statewide GIS layer updated on the same cadence. Daily updates would return near-identical data. Monthly misses 3-4 weeks of sales.',
  };
  writeFileSync(META_FILE, JSON.stringify(meta, null, 2));

  const fileSizeKb = Math.round(Buffer.byteLength(JSON.stringify(geojson)) / 1024);
  console.log(`\nWrote ${OUT_FILE} (${fileSizeKb} KB, ${geojsonFeatures.length} features)`);
  console.log(`Wrote ${META_FILE}`);
  console.log('\nDone.');
}

main().catch(err => {
  console.error('\nFatal error:', err.message ?? err);
  process.exit(1);
});
