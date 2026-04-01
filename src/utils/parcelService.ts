/**
 * parcelService.ts
 *
 * All external data fetching for the map:
 *  - Address geocoding via US Census Geocoder (free, no API key)
 *  - Parcel lookup via Colorado GIS ESRI REST service
 *
 * To swap in a real backend, update PARCEL_API and normalizeParcelFeature().
 * All UI components are insulated from these implementation details.
 */

import type {
  GeocodeResult,
  ParcelFeature,
  EsriParcelAttributes,
  GeoJSONGeometry,
} from '../data/parcelTypes';

// ── Config ────────────────────────────────────────────────────────────────────

/**
 * Colorado Statewide Parcels — ESRI FeatureServer REST service.
 * Routed through Vite proxy:
 *   /api/esri-co/... → gis.colorado.gov/public/rest/services/...
 *
 * To switch to your own backend, replace this constant and update
 * queryParcelByPoint() below to match your API's request/response format.
 */
const PARCEL_API = '/api/esri-co/Address_and_Parcel/Colorado_Public_Parcels/FeatureServer/0/query';

/**
 * Nominatim (OpenStreetMap) geocoder — free, no API key.
 * Routed through Vite proxy (/api/nominatim → nominatim.openstreetmap.org).
 */
const NOMINATIM_BASE = '/api/nominatim';

// ── Geocoding ─────────────────────────────────────────────────────────────────

/**
 * Geocode a free-form address using Nominatim (OpenStreetMap).
 * Proxied through /api/nominatim to avoid browser CORS restrictions.
 * Filters to US results only; strongly prefers Colorado matches.
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult> {
  // Append ", CO" if no state hint is present, to bias toward Colorado results
  const query = /\b(CO|Colorado)\b/i.test(address) ? address : `${address}, CO`;

  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit: '5',
    countrycodes: 'us',
    addressdetails: '1',
  });

  const res = await fetch(`${NOMINATIM_BASE}/search?${params}`);
  if (!res.ok) throw new Error(`Geocoder returned ${res.status}`);

  const results = await res.json() as NominatimResult[];

  if (!results || results.length === 0) {
    throw new Error('Address not found. Try including city and state (e.g. "123 Main St, Denver, CO").');
  }

  // Prefer Colorado results; fall back to first result
  const coResult = results.find(r => r.address?.state === 'Colorado') ?? results[0]!;

  return {
    lat: parseFloat(coResult.lat),
    lng: parseFloat(coResult.lon),
    formattedAddress: coResult.display_name,
    state: coResult.address?.state,
    county: coResult.address?.county,
  };
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    state?: string;
    county?: string;
    city?: string;
    town?: string;
    postcode?: string;
  };
}

/**
 * Reverse geocode a lat/lng to get the neighborhood name.
 * Returns the most specific place name Nominatim knows at that point:
 *  address.neighbourhood → address.suburb → null
 *
 * Used to identify sub-city neighborhoods (e.g. "City Park West" within Denver).
 */
export async function reverseGeocodeNeighborhood(lat: number, lng: number): Promise<string | null> {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    format: 'json',
    addressdetails: '1',
    zoom: '16', // neighborhood-level zoom
  });

  try {
    const res = await fetch(`${NOMINATIM_BASE}/reverse?${params}`);
    if (!res.ok) return null;
    const data = await res.json() as NominatimReverseResult;
    return data.address?.neighbourhood ?? data.address?.suburb ?? null;
  } catch {
    return null;
  }
}

interface NominatimReverseResult {
  address?: {
    neighbourhood?: string;
    suburb?: string;
    city?: string;
    county?: string;
  };
}

// ── Denver official zoning lookup ─────────────────────────────────────────────

const DENVER_ZONING_API = '/api/denver-zoning/1/query';

export interface DenverZoningRaw {
  zoneDistrict: string | null;
  zoneDescription: string | null;
  zoneDistType: string | null;
  nbhdContext: string | null;
  overlayDistrict: string | null;
  aduAllowed: string | null;
  heightStories: number | null;
  pudNum: string | null;
  pudDocument: string | null;
  ordNum: number | null;
  ordYear: number | null;
}

/**
 * Query Denver's official zoning MapServer for the zone district at a lat/lng.
 * Returns null if outside Denver or if the service is unavailable.
 *
 * Source: denvergov.org/maps/data/Zoning/MapServer/1
 * Key field: ZONE_DISTRICT — e.g. "U-SU-B", "C-MX-5", "I-MX-3"
 */
export async function queryDenverZoning(lat: number, lng: number): Promise<DenverZoningRaw | null> {
  const params = new URLSearchParams({
    geometry: JSON.stringify({ x: lng, y: lat }),
    geometryType: 'esriGeometryPoint',
    inSR: '4326',
    spatialRel: 'esriSpatialRelIntersects',
    outFields: 'ZONE_DISTRICT,ZONE_DESCRIPTION,ZONE_DIST_TYPE,NBHD_CONTEXT,OVERLAY_DISTRICT,ADU,HEIGHT_STORIES,PUD_NUM,PUD_DOCUMENT,ORD_NUM,ORD_YEAR',
    returnGeometry: 'false',
    f: 'json',
  });

  try {
    const res = await fetch(`${DENVER_ZONING_API}?${params}`);
    if (!res.ok) return null;
    const data = await res.json() as { features?: { attributes: Record<string, unknown> }[]; error?: { message: string } };
    if (data.error || !data.features?.length) return null;
    const a = data.features[0]!.attributes;
    const s = (k: string) => { const v = a[k]; return (v === null || v === undefined || v === '') ? null : String(v).trim() || null; };
    const n = (k: string) => { const v = Number(a[k]); return isNaN(v) ? null : v; };
    return {
      zoneDistrict:   s('ZONE_DISTRICT'),
      zoneDescription: s('ZONE_DESCRIPTION'),
      zoneDistType:   s('ZONE_DIST_TYPE'),
      nbhdContext:    s('NBHD_CONTEXT'),
      overlayDistrict: s('OVERLAY_DISTRICT'),
      aduAllowed:     s('ADU'),
      heightStories:  n('HEIGHT_STORIES'),
      pudNum:         s('PUD_NUM'),
      pudDocument:    s('PUD_DOCUMENT'),
      ordNum:         n('ORD_NUM'),
      ordYear:        n('ORD_YEAR'),
    };
  } catch {
    return null;
  }
}

// ── Parcel lookup ─────────────────────────────────────────────────────────────

/**
 * Real field names returned by Colorado_Public_Parcels FeatureServer layer 0.
 * Confirmed against live service response 2026-03.
 */
const PARCEL_FIELDS = [
  'parcel_id', 'owner', 'owner2',
  'situsAdd', 'sitAddCty', 'sitAddZip',
  'countyName', 'countyFips',
  'landAcres', 'landSqft',
  'zoningCode', 'zoningDesc',
  'landUseCde', 'landUseDsc',
  'apprValTot', 'asedValTot',
  'saleDate', 'salePrice',
  'legalDesc', 'subName',
  'block', 'lot', 'account',
].join(',');

/**
 * Query the Colorado statewide parcel layer for the parcel at a given point.
 * Returns null when no parcel is found (water, parks, federal land, etc.)
 *
 * SWAP POINT: replace PARCEL_API constant at the top of this file to point
 * at your own backend endpoint when parcel data is uploaded.
 */
export async function queryParcelByPoint(
  lng: number,
  lat: number
): Promise<ParcelFeature | null> {
  const params = new URLSearchParams({
    geometry: JSON.stringify({ x: lng, y: lat }),
    geometryType: 'esriGeometryPoint',
    inSR: '4326',
    spatialRel: 'esriSpatialRelIntersects',
    outFields: PARCEL_FIELDS,
    returnGeometry: 'true',
    outSR: '4326',
    f: 'json',  // use standard JSON (not geojson) for reliable ESRI response
  });

  const res = await fetch(`${PARCEL_API}?${params}`);
  if (!res.ok) throw new Error(`Parcel service returned ${res.status}`);

  const data = await res.json() as EsriJsonResponse;

  if (data.error) throw new Error(data.error.message);

  const features = data.features ?? [];
  if (features.length === 0) return null;

  return normalizeParcelFeature(features[0]!, lat, lng);
}

/** ESRI standard JSON response (f=json) */
type EsriJsonFeature = {
  geometry?: {
    rings?: number[][][];   // Polygon rings in [x, y] pairs
    x?: number; y?: number; // Point
  };
  attributes: EsriParcelAttributes;
};

interface EsriJsonResponse {
  features?: EsriJsonFeature[];
  error?: { code: number; message: string };
  geometryType?: string;
  spatialReference?: { wkid: number };
}

// ── Normalization ─────────────────────────────────────────────────────────────

/**
 * Convert ESRI standard-JSON feature into the normalized ParcelFeature model.
 * Field names match the Colorado_Public_Parcels FeatureServer schema exactly.
 */
function normalizeParcelFeature(
  raw: EsriJsonFeature,
  lat: number,
  lng: number
): ParcelFeature {
  const a = raw.attributes;

  const apn = str(a.parcel_id ?? a.account) ?? 'Unknown';
  const ownerName = str(a.owner) ?? 'Unknown Owner';
  const situsAddr = str(a.situsAdd) ?? '';
  const city      = str(a.sitAddCty) ?? '';
  const county    = str(a.countyName) ?? '';

  const sqft    = num(a.landSqft);
  const acreage = num(a.landAcres) ?? (sqft ? round2(sqft / 43560) : null);

  const apprVal  = parseMoney(a.apprValTot);
  const asedVal  = parseMoney(a.asedValTot);
  const saleAmt  = parseMoney(a.salePrice);
  const saleDateRaw = str(a.saleDate);
  // ESRI sends "12/30/1899" as a null-sentinel for no sale date
  const saleDate = saleDateRaw && !saleDateRaw.startsWith('12/30/1899') ? saleDateRaw : null;

  // Convert ESRI ring geometry → GeoJSON Polygon/MultiPolygon
  const geometry = esriRingsToGeoJSON(raw.geometry?.rings);

  return {
    id: `${apn}-${lng.toFixed(5)}-${lat.toFixed(5)}`,
    identity: {
      apn,
      legalDescription: str(a.legalDesc),
      subdivision: str(a.subName),
      acreage,
      sqft,
    },
    owner: {
      name: ownerName,
      mailingAddress: null,
    },
    location: {
      situsAddress: situsAddr,
      city,
      county,
      countyFIPS: str(a.countyFips),
      lat,
      lng,
    },
    zoning: {
      code: str(a.zoningCode),
      description: str(a.zoningDesc),
      landUseCode: str(a.landUseCde),
      landUseDescription: str(a.landUseDsc),
    },
    valuation: {
      taxYear: null,
      assessedValue: asedVal,   // asedValTot — county taxable assessed value
      marketValue: apprVal,     // apprValTot — total appraised/market value
      landValue: null,          // not available in statewide ESRI layer
      improvementValue: null,   // not available in statewide ESRI layer
      annualTax: null,          // not returned by ESRI; calculated in UI
      lastSaleDate: saleDate,
      lastSalePrice: saleAmt && saleAmt > 0 ? saleAmt : null,
    },
    geometry,
    _raw: a,
    _source: 'esri',
  };
}

// ── Geometry conversion ───────────────────────────────────────────────────────

/**
 * Convert ESRI ring array to GeoJSON Polygon or MultiPolygon.
 * Falls back to a Point if no rings are present.
 */
function esriRingsToGeoJSON(rings?: number[][][]): GeoJSONGeometry {
  if (!rings || rings.length === 0) {
    return { type: 'Point', coordinates: [0, 0] };
  }
  // Cast through unknown to satisfy strict tuple types — runtime shape is correct
  if (rings.length === 1) {
    return { type: 'Polygon', coordinates: rings as unknown as [number, number][][] };
  }
  return {
    type: 'MultiPolygon',
    coordinates: rings.map(r => [r]) as unknown as [number, number][][][],
  };
}

// ── Small helpers ─────────────────────────────────────────────────────────────

function str(v: unknown): string | null {
  if (v === null || v === undefined || v === '') return null;
  return String(v).trim() || null;
}

function num(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
}

function parseMoney(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  const n = typeof v === 'string' ? parseFloat(v.replace(/[^0-9.-]/g, '')) : Number(v);
  return isNaN(n) || n <= 0 ? null : n;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ── Formatting helpers ────────────────────────────────────────────────────────

export function formatCurrency(value: number | null): string {
  if (value === null) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number | null): string {
  if (value === null) return '—';
  return new Intl.NumberFormat('en-US').format(value);
}

export function formatDate(value: string | null): string {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  } catch {
    return value;
  }
}
