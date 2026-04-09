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
  DenverBuildingData,
  DenverParcelValuationData,
  DouglasParcelData,
  ArapahoeParcelData,
  JeffersonParcelData,
} from '../data/parcelTypes';

export type { DenverBuildingData, DenverParcelValuationData, DouglasParcelData, ArapahoeParcelData, JeffersonParcelData };

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

// ── Aurora official zoning lookup ─────────────────────────────────────────────

const AURORA_ZONING_API = '/api/aurora-zoning/20/query';

export interface AuroraZoningRaw {
  districtId: string | null;
  distName: string | null;
  subzone: string | null;
  ordinance: string | null;
  density: string | null;
  far: string | null;
}

/**
 * Query Aurora's OpenData MapServer for the zoning district at a lat/lng.
 * Returns null if outside Aurora city limits or service is unavailable.
 *
 * Source: ags.auroragov.org/aurora/rest/services/OpenData/MapServer/20
 * Key field: DISTRICT_ID — e.g. "R-1", "MU-C", "I-2"
 */
export async function queryAuroraZoning(lat: number, lng: number): Promise<AuroraZoningRaw | null> {
  const params = new URLSearchParams({
    geometry: JSON.stringify({ x: lng, y: lat }),
    geometryType: 'esriGeometryPoint',
    inSR: '4326',
    spatialRel: 'esriSpatialRelIntersects',
    outFields: 'DISTRICT_ID,Dist_Name,SUBZONE,ORDINANCE,DENSITY,FAR',
    returnGeometry: 'false',
    f: 'json',
  });

  try {
    const res = await fetch(`${AURORA_ZONING_API}?${params}`);
    if (!res.ok) return null;
    const data = await res.json() as { features?: { attributes: Record<string, unknown> }[]; error?: { message: string } };
    if (data.error || !data.features?.length) return null;
    const a = data.features[0]!.attributes;
    const s = (k: string) => { const v = a[k]; return (v === null || v === undefined || String(v).trim() === '') ? null : String(v).trim() || null; };
    return {
      districtId: s('DISTRICT_ID'),
      distName:   s('Dist_Name'),
      subzone:    s('SUBZONE'),
      ordinance:  s('ORDINANCE'),
      density:    s('DENSITY'),
      far:        s('FAR'),
    };
  } catch {
    return null;
  }
}

// ── Centennial official land use lookup ───────────────────────────────────────

const CENTENNIAL_ZONING_API = '/api/centennial-zoning/FeatureServer/0/query';

export interface CentennialZoningRaw {
  landUse: string | null;
  landUseType: string | null;
  levelI: string | null;
  levelII: string | null;
  levelIII: string | null;
}

/**
 * Query Centennial's Current Land Use FeatureServer for the land use at a lat/lng.
 * Returns null if outside Centennial city limits or service unavailable.
 *
 * Source: maps.centennialco.gov/arcgis/rest/services/Current_Land_Use/FeatureServer/0
 * Key field: Land_Use — e.g. "RES_SFD", "COM_RETAIL", "IND_LIGHT"
 */
export async function queryCentennialZoning(lat: number, lng: number): Promise<CentennialZoningRaw | null> {
  const params = new URLSearchParams({
    geometry: JSON.stringify({ x: lng, y: lat }),
    geometryType: 'esriGeometryPoint',
    inSR: '4326',
    spatialRel: 'esriSpatialRelIntersects',
    outFields: 'Land_Use,Land_Use_T,Level_I,Level_II,Level_III',
    returnGeometry: 'false',
    f: 'json',
  });

  try {
    const res = await fetch(`${CENTENNIAL_ZONING_API}?${params}`);
    if (!res.ok) return null;
    const data = await res.json() as { features?: { attributes: Record<string, unknown> }[]; error?: { message: string } };
    if (data.error || !data.features?.length) return null;
    const a = data.features[0]!.attributes;
    const s = (k: string) => { const v = a[k]; return (v === null || v === undefined || String(v).trim() === '') ? null : String(v).trim() || null; };
    return {
      landUse:     s('Land_Use'),
      landUseType: s('Land_Use_T'),
      levelI:      s('Level_I'),
      levelII:     s('Level_II'),
      levelIII:    s('Level_III'),
    };
  } catch {
    return null;
  }
}

// ── Douglas County zoning lookup ─────────────────────────────────────────────

const DOUGLAS_ZONING_API = '/api/douglas-zoning/1/query';

export interface DouglasZoningRaw {
  zoneType: string | null;
  zoneName: string | null;
}

/**
 * Query Douglas County's Landuse MapServer for the zone district at a lat/lng.
 * Returns null if outside unincorporated Douglas County or service unavailable.
 *
 * Source: apps.douglas.co.us/gisod/rest/services/Landuse/MapServer/1
 * Key field: ZONE_TYPE — e.g. "R-1", "B-2", "A-1"
 */
export async function queryDouglasZoning(lat: number, lng: number): Promise<DouglasZoningRaw | null> {
  const params = new URLSearchParams({
    geometry: `${lng},${lat}`,
    geometryType: 'esriGeometryPoint',
    inSR: '4326',
    spatialRel: 'esriSpatialRelIntersects',
    outFields: 'ZONE_TYPE,FIRST_DESC',
    returnGeometry: 'false',
    f: 'json',
  });

  try {
    const res = await fetch(`${DOUGLAS_ZONING_API}?${params}`);
    if (!res.ok) return null;
    const data = await res.json() as { features?: { attributes: Record<string, unknown> }[]; error?: { message: string } };
    if (data.error || !data.features?.length) return null;
    const a = data.features[0]!.attributes;
    const s = (k: string) => { const v = a[k]; return (v === null || v === undefined || String(v).trim() === '') ? null : String(v).trim() || null; };
    return {
      zoneType: s('ZONE_TYPE'),
      zoneName: s('FIRST_DESC'),
    };
  } catch {
    return null;
  }
}

// ── Jefferson County zoning lookup ────────────────────────────────────────────

const JEFFERSON_ZONING_API = '/api/jefferson-zoning/36/query';

export interface JeffersonZoningRaw {
  zoneCode: string | null;
  zoneName: string | null;
}

/**
 * Query Jefferson County's Zoning MapServer for the zone district at a lat/lng.
 * Returns null if outside unincorporated Jefferson County or service unavailable.
 *
 * Source: gisportal.jeffco.us/server2/rest/services/Zoning/MapServer/36
 */
export async function queryJeffersonZoning(lat: number, lng: number): Promise<JeffersonZoningRaw | null> {
  const params = new URLSearchParams({
    geometry: `${lng},${lat}`,
    geometryType: 'esriGeometryPoint',
    inSR: '4326',
    spatialRel: 'esriSpatialRelIntersects',
    outFields: '*',
    returnGeometry: 'false',
    f: 'json',
  });

  try {
    const res = await fetch(`${JEFFERSON_ZONING_API}?${params}`);
    if (!res.ok) return null;
    const data = await res.json() as { features?: { attributes: Record<string, unknown> }[]; error?: { message: string } };
    if (data.error || !data.features?.length) return null;
    const a = data.features[0]!.attributes;
    const s = (k: string) => { const v = a[k]; return (v === null || v === undefined || String(v).trim() === '') ? null : String(v).trim() || null; };
    // Field names may vary — try common variations
    return {
      zoneCode: s('ZONING') ?? s('ZONE_CODE') ?? s('ZONE') ?? s('ZoningCode') ?? null,
      zoneName: s('ZONE_NAME') ?? s('ZoningName') ?? s('DESCRIPTION') ?? null,
    };
  } catch {
    return null;
  }
}

// ── Larimer County zoning lookup ──────────────────────────────────────────────

const LARIMER_ZONING_API = '/api/larimer-zoning/0/query';

export interface LarimerZoningRaw {
  zoneCode: string | null;
  zoneName: string | null;
}

/**
 * Query Larimer County's LC_Zoning MapServer for the zone district at a lat/lng.
 * Returns null if outside unincorporated Larimer County or service unavailable.
 *
 * Source: maps1.larimer.org/arcgis/rest/services/MapServices/LC_Zoning/MapServer/0
 */
export async function queryLarimerZoning(lat: number, lng: number): Promise<LarimerZoningRaw | null> {
  const params = new URLSearchParams({
    geometry: `${lng},${lat}`,
    geometryType: 'esriGeometryPoint',
    inSR: '4326',
    spatialRel: 'esriSpatialRelIntersects',
    outFields: '*',
    returnGeometry: 'false',
    f: 'json',
  });

  try {
    const res = await fetch(`${LARIMER_ZONING_API}?${params}`);
    if (!res.ok) return null;
    const data = await res.json() as { features?: { attributes: Record<string, unknown> }[]; error?: { message: string } };
    if (data.error || !data.features?.length) return null;
    const a = data.features[0]!.attributes;
    const s = (k: string) => { const v = a[k]; return (v === null || v === undefined || String(v).trim() === '') ? null : String(v).trim() || null; };
    return {
      zoneCode: s('ZONE') ?? s('ZONE_CODE') ?? s('ZONING') ?? s('ZoneCode') ?? null,
      zoneName: s('ZONE_NAME') ?? s('ZoneName') ?? s('DESCRIPTION') ?? null,
    };
  } catch {
    return null;
  }
}

// ── El Paso County zoning lookup ──────────────────────────────────────────────

const ELPASO_ZONING_API = '/api/elpaso-zoning/1/query';

export interface ElPasoZoningRaw {
  zoneCode: string | null;
  zoneName: string | null;
}

/**
 * Query El Paso County's ZoningAreas MapServer for the zone district at a lat/lng.
 * Returns null if outside unincorporated El Paso County or service unavailable.
 *
 * Source: gisservices.elpasoco.com/arcgis2/rest/services/HubPublic/ZoningAreas/MapServer/1
 */
export async function queryElPasoZoning(lat: number, lng: number): Promise<ElPasoZoningRaw | null> {
  const params = new URLSearchParams({
    geometry: `${lng},${lat}`,
    geometryType: 'esriGeometryPoint',
    inSR: '4326',
    spatialRel: 'esriSpatialRelIntersects',
    outFields: '*',
    returnGeometry: 'false',
    f: 'json',
  });

  try {
    const res = await fetch(`${ELPASO_ZONING_API}?${params}`);
    if (!res.ok) return null;
    const data = await res.json() as { features?: { attributes: Record<string, unknown> }[]; error?: { message: string } };
    if (data.error || !data.features?.length) return null;
    const a = data.features[0]!.attributes;
    const s = (k: string) => { const v = a[k]; return (v === null || v === undefined || String(v).trim() === '') ? null : String(v).trim() || null; };
    return {
      zoneCode: s('ZONE_TYPE') ?? s('ZONING') ?? s('ZONE_CODE') ?? s('ZONE') ?? null,
      zoneName: s('ZONE_NAME') ?? s('DESCRIPTION') ?? s('ZoneName') ?? null,
    };
  } catch {
    return null;
  }
}

// ── Clear Creek County zoning lookup ──────────────────────────────────────────

const CLEARCREEK_ZONING_API = '/api/clearcreek-zoning/18/query';

export interface ClearCreekZoningRaw {
  currZone: string | null;
  zoneName: string | null;
}

/**
 * Query Clear Creek County's Cadastral MapServer for the zone district at a lat/lng.
 * Returns null if outside Clear Creek County or service unavailable.
 *
 * Source: gis.clearcreekcounty.us/arcgis2/rest/services/ClearCreek/Cadastral/MapServer/18
 * Key field: CURR_ZONE — e.g. "R-1", "B-1", "A-1"
 */
export async function queryClearCreekZoning(lat: number, lng: number): Promise<ClearCreekZoningRaw | null> {
  const params = new URLSearchParams({
    geometry: `${lng},${lat}`,
    geometryType: 'esriGeometryPoint',
    inSR: '4326',
    spatialRel: 'esriSpatialRelIntersects',
    outFields: 'CURR_ZONE,ORIG_ZONE',
    returnGeometry: 'false',
    f: 'json',
  });

  try {
    const res = await fetch(`${CLEARCREEK_ZONING_API}?${params}`);
    if (!res.ok) return null;
    const data = await res.json() as { features?: { attributes: Record<string, unknown> }[]; error?: { message: string } };
    if (data.error || !data.features?.length) return null;
    const a = data.features[0]!.attributes;
    const s = (k: string) => { const v = a[k]; return (v === null || v === undefined || String(v).trim() === '') ? null : String(v).trim() || null; };
    return {
      currZone: s('CURR_ZONE') ?? s('ZONE') ?? s('ZONING') ?? null,
      zoneName: s('ZONE_NAME') ?? s('DESCRIPTION') ?? null,
    };
  } catch {
    return null;
  }
}

// ── Lakewood zoning lookup ────────────────────────────────────────────────────

const LAKEWOOD_ZONING_API = '/api/lakewood-zoning/0/query';

export interface LakewoodZoningRaw {
  zoneCode: string | null;
  zoneName: string | null;
}

export async function queryLakewoodZoning(lat: number, lng: number): Promise<LakewoodZoningRaw | null> {
  const params = new URLSearchParams({
    geometry: `${lng},${lat}`,
    geometryType: 'esriGeometryPoint',
    inSR: '4326',
    spatialRel: 'esriSpatialRelIntersects',
    outFields: '*',
    returnGeometry: 'false',
    f: 'json',
  });
  try {
    const res = await fetch(`${LAKEWOOD_ZONING_API}?${params}`);
    if (!res.ok) return null;
    const data = await res.json() as { features?: { attributes: Record<string, unknown> }[]; error?: unknown };
    if ((data as { error?: unknown }).error || !data.features?.length) return null;
    const a = data.features[0]!.attributes;
    const s = (k: string) => { const v = a[k]; return (v === null || v === undefined || String(v).trim() === '') ? null : String(v).trim(); };
    return { zoneCode: s('ZONE') ?? s('ZONE_CODE') ?? s('ZONING') ?? s('ZoneCode') ?? null, zoneName: s('ZONE_NAME') ?? s('ZoneName') ?? s('DESCRIPTION') ?? null };
  } catch { return null; }
}

// ── Arvada zoning lookup ──────────────────────────────────────────────────────

const ARVADA_ZONING_API = '/api/arvada-zoning/0/query';

export interface ArvadaZoningRaw {
  zoneCode: string | null;
  zoneName: string | null;
}

export async function queryArvadaZoning(lat: number, lng: number): Promise<ArvadaZoningRaw | null> {
  const params = new URLSearchParams({
    geometry: `${lng},${lat}`,
    geometryType: 'esriGeometryPoint',
    inSR: '4326',
    spatialRel: 'esriSpatialRelIntersects',
    outFields: '*',
    returnGeometry: 'false',
    f: 'json',
  });
  try {
    const res = await fetch(`${ARVADA_ZONING_API}?${params}`);
    if (!res.ok) return null;
    const data = await res.json() as { features?: { attributes: Record<string, unknown> }[]; error?: unknown };
    if ((data as { error?: unknown }).error || !data.features?.length) return null;
    const a = data.features[0]!.attributes;
    const s = (k: string) => { const v = a[k]; return (v === null || v === undefined || String(v).trim() === '') ? null : String(v).trim(); };
    return { zoneCode: s('ZONE') ?? s('ZONE_CODE') ?? s('ZONING') ?? s('ZoneCode') ?? null, zoneName: s('ZONE_NAME') ?? s('ZoneName') ?? s('DESCRIPTION') ?? null };
  } catch { return null; }
}

// ── Greenwood Village zoning lookup ──────────────────────────────────────────

const GREENWOODVILLAGE_ZONING_API = '/api/greenwoodvillage-zoning/1/query';

export interface GreenwoodVillageZoningRaw {
  zoneCode: string | null;
  zoneName: string | null;
}

export async function queryGreenwoodVillageZoning(lat: number, lng: number): Promise<GreenwoodVillageZoningRaw | null> {
  const params = new URLSearchParams({
    geometry: `${lng},${lat}`,
    geometryType: 'esriGeometryPoint',
    inSR: '4326',
    spatialRel: 'esriSpatialRelIntersects',
    outFields: '*',
    returnGeometry: 'false',
    f: 'json',
  });
  try {
    const res = await fetch(`${GREENWOODVILLAGE_ZONING_API}?${params}`);
    if (!res.ok) return null;
    const data = await res.json() as { features?: { attributes: Record<string, unknown> }[]; error?: unknown };
    if ((data as { error?: unknown }).error || !data.features?.length) return null;
    const a = data.features[0]!.attributes;
    const s = (k: string) => { const v = a[k]; return (v === null || v === undefined || String(v).trim() === '') ? null : String(v).trim(); };
    return { zoneCode: s('ZONE') ?? s('ZONE_CODE') ?? s('ZONING') ?? s('ZoneCode') ?? null, zoneName: s('ZONE_NAME') ?? s('ZoneName') ?? s('DESCRIPTION') ?? null };
  } catch { return null; }
}

// ── Littleton zoning lookup ───────────────────────────────────────────────────

const LITTLETON_ZONING_API = '/api/littleton-zoning/2/query';

export interface LittletonZoningRaw {
  zoneCode: string | null;
  zoneName: string | null;
}

export async function queryLittletonZoning(lat: number, lng: number): Promise<LittletonZoningRaw | null> {
  const params = new URLSearchParams({
    geometry: `${lng},${lat}`,
    geometryType: 'esriGeometryPoint',
    inSR: '4326',
    spatialRel: 'esriSpatialRelIntersects',
    outFields: '*',
    returnGeometry: 'false',
    f: 'json',
  });
  try {
    const res = await fetch(`${LITTLETON_ZONING_API}?${params}`);
    if (!res.ok) return null;
    const data = await res.json() as { features?: { attributes: Record<string, unknown> }[]; error?: unknown };
    if ((data as { error?: unknown }).error || !data.features?.length) return null;
    const a = data.features[0]!.attributes;
    const s = (k: string) => { const v = a[k]; return (v === null || v === undefined || String(v).trim() === '') ? null : String(v).trim(); };
    return { zoneCode: s('ZONE') ?? s('ZONE_CODE') ?? s('ZONING') ?? s('ZoneCode') ?? null, zoneName: s('ZONE_NAME') ?? s('ZoneName') ?? s('DESCRIPTION') ?? null };
  } catch { return null; }
}

// ── Thornton zoning lookup ────────────────────────────────────────────────────

const THORNTON_ZONING_API = '/api/thornton-zoning/0/query';

export interface ThorntonZoningRaw {
  zoneCode: string | null;
  zoneName: string | null;
}

export async function queryThorntonZoning(lat: number, lng: number): Promise<ThorntonZoningRaw | null> {
  const params = new URLSearchParams({
    geometry: `${lng},${lat}`,
    geometryType: 'esriGeometryPoint',
    inSR: '4326',
    spatialRel: 'esriSpatialRelIntersects',
    outFields: '*',
    returnGeometry: 'false',
    f: 'json',
  });
  try {
    const res = await fetch(`${THORNTON_ZONING_API}?${params}`);
    if (!res.ok) return null;
    const data = await res.json() as { features?: { attributes: Record<string, unknown> }[]; error?: unknown };
    if ((data as { error?: unknown }).error || !data.features?.length) return null;
    const a = data.features[0]!.attributes;
    const s = (k: string) => { const v = a[k]; return (v === null || v === undefined || String(v).trim() === '') ? null : String(v).trim(); };
    return { zoneCode: s('ZONE') ?? s('ZONE_CODE') ?? s('ZONING') ?? s('ZoneCode') ?? null, zoneName: s('ZONE_NAME') ?? s('ZoneName') ?? s('DESCRIPTION') ?? null };
  } catch { return null; }
}

// ── Arapahoe County zoning lookup ────────────────────────────────────────────

const ARAPAHOE_ZONING_API = '/api/arapahoe-zoning/352/query';

export interface ArapahoeZoningRaw {
  zoneCode: string | null;
}

export async function queryArapahoeZoning(lat: number, lng: number): Promise<ArapahoeZoningRaw | null> {
  const params = new URLSearchParams({
    geometry: `${lng},${lat}`,
    geometryType: 'esriGeometryPoint',
    inSR: '4326',
    spatialRel: 'esriSpatialRelIntersects',
    outFields: 'ZONING',
    returnGeometry: 'false',
    f: 'json',
  });
  try {
    const res = await fetch(`${ARAPAHOE_ZONING_API}?${params}`);
    if (!res.ok) return null;
    const data = await res.json() as { features?: { attributes: Record<string, unknown> }[]; error?: unknown };
    if ((data as { error?: unknown }).error || !data.features?.length) return null;
    const a = data.features[0]!.attributes;
    const s = (k: string) => { const v = a[k]; return (v === null || v === undefined || String(v).trim() === '') ? null : String(v).trim(); };
    return { zoneCode: s('ZONING') ?? null };
  } catch { return null; }
}

// ── Broomfield zoning lookup ──────────────────────────────────────────────────

const BROOMFIELD_ZONING_API = '/api/broomfield-zoning/0/query';

export interface BroomfieldZoningRaw {
  zoneCode: string | null;
}

export async function queryBroomfieldZoning(lat: number, lng: number): Promise<BroomfieldZoningRaw | null> {
  const params = new URLSearchParams({
    geometry: `${lng},${lat}`,
    geometryType: 'esriGeometryPoint',
    inSR: '4326',
    spatialRel: 'esriSpatialRelIntersects',
    outFields: 'ZONING,GIS_ID',
    returnGeometry: 'false',
    f: 'json',
  });
  try {
    const res = await fetch(`${BROOMFIELD_ZONING_API}?${params}`);
    if (!res.ok) return null;
    const data = await res.json() as { features?: { attributes: Record<string, unknown> }[]; error?: unknown };
    if ((data as { error?: unknown }).error || !data.features?.length) return null;
    const a = data.features[0]!.attributes;
    const s = (k: string) => { const v = a[k]; return (v === null || v === undefined || String(v).trim() === '') ? null : String(v).trim(); };
    return { zoneCode: s('ZONING') ?? s('GIS_ID') ?? null };
  } catch { return null; }
}

// ── Boulder County zoning lookup ──────────────────────────────────────────────

const BOULDER_COUNTY_ZONING_API = '/api/boulder-county-zoning/0/query';

export interface BoulderCountyZoningRaw {
  zoneCode: string | null;
}

export async function queryBoulderCountyZoning(lat: number, lng: number): Promise<BoulderCountyZoningRaw | null> {
  const params = new URLSearchParams({
    geometry: `${lng},${lat}`,
    geometryType: 'esriGeometryPoint',
    inSR: '4326',
    spatialRel: 'esriSpatialRelIntersects',
    outFields: '*',
    returnGeometry: 'false',
    f: 'json',
  });
  try {
    const res = await fetch(`${BOULDER_COUNTY_ZONING_API}?${params}`);
    if (!res.ok) return null;
    const data = await res.json() as { features?: { attributes: Record<string, unknown> }[]; error?: unknown };
    if ((data as { error?: unknown }).error || !data.features?.length) return null;
    const a = data.features[0]!.attributes;
    const s = (k: string) => { const v = a[k]; return (v === null || v === undefined || String(v).trim() === '') ? null : String(v).trim(); };
    return { zoneCode: s('ZONE_DIST') ?? s('ZONE_CODE') ?? s('ZONING') ?? s('ZoneDist') ?? null };
  } catch { return null; }
}

// ── Weld County zoning lookup ─────────────────────────────────────────────────

const WELD_ZONING_API = '/api/weld-zoning/38/query';

export interface WeldZoningRaw {
  zoneCode: string | null;
  zoneName: string | null;
}

export async function queryWeldZoning(lat: number, lng: number): Promise<WeldZoningRaw | null> {
  const params = new URLSearchParams({
    geometry: `${lng},${lat}`,
    geometryType: 'esriGeometryPoint',
    inSR: '4326',
    spatialRel: 'esriSpatialRelIntersects',
    outFields: 'ZONE_SYMB,ZONING',
    returnGeometry: 'false',
    f: 'json',
  });
  try {
    const res = await fetch(`${WELD_ZONING_API}?${params}`);
    if (!res.ok) return null;
    const data = await res.json() as { features?: { attributes: Record<string, unknown> }[]; error?: unknown };
    if ((data as { error?: unknown }).error || !data.features?.length) return null;
    const a = data.features[0]!.attributes;
    const s = (k: string) => { const v = a[k]; return (v === null || v === undefined || String(v).trim() === '') ? null : String(v).trim(); };
    return { zoneCode: s('ZONE_SYMB') ?? null, zoneName: s('ZONING') ?? null };
  } catch { return null; }
}

// ── Pueblo County zoning lookup ───────────────────────────────────────────────

const PUEBLO_COUNTY_ZONING_API = '/api/pueblo-county-zoning/0/query';

export interface PuebloCountyZoningRaw {
  zoneCode: string | null;
}

export async function queryPuebloCountyZoning(lat: number, lng: number): Promise<PuebloCountyZoningRaw | null> {
  const params = new URLSearchParams({
    geometry: `${lng},${lat}`,
    geometryType: 'esriGeometryPoint',
    inSR: '4326',
    spatialRel: 'esriSpatialRelIntersects',
    outFields: 'ZoneDist',
    returnGeometry: 'false',
    f: 'json',
  });
  try {
    const res = await fetch(`${PUEBLO_COUNTY_ZONING_API}?${params}`);
    if (!res.ok) return null;
    const data = await res.json() as { features?: { attributes: Record<string, unknown> }[]; error?: unknown };
    if ((data as { error?: unknown }).error || !data.features?.length) return null;
    const a = data.features[0]!.attributes;
    const s = (k: string) => { const v = a[k]; return (v === null || v === undefined || String(v).trim() === '') ? null : String(v).trim(); };
    return { zoneCode: s('ZoneDist') ?? s('ZONE_DIST') ?? s('ZONING') ?? null };
  } catch { return null; }
}

// ── Adams County zoning lookup ────────────────────────────────────────────────

const ADAMS_ZONING_API = '/api/adams-zoning/0/query';

export interface AdamsZoningRaw {
  zoneCode: string | null;
  cityName: string | null;
}

/**
 * Query Adams County's Zoning FeatureServer for the zone district at a lat/lng.
 * Returns null if outside unincorporated Adams County or service unavailable.
 *
 * Source: services3.arcgis.com/4PNQOtAivErR7nbT — Zoning FeatureServer layer 0
 * Key field: ZONE_ — e.g. "A-1", "R-1-A", "C-1"
 * CITY_NAME: "Unincorporated" for county-zoned land; city name for incorporated areas.
 */
export async function queryAdamsZoning(lat: number, lng: number): Promise<AdamsZoningRaw | null> {
  const params = new URLSearchParams({
    geometry: `${lng},${lat}`,
    geometryType: 'esriGeometryPoint',
    inSR: '4326',
    spatialRel: 'esriSpatialRelIntersects',
    outFields: 'ZONE_,CITY_NAME',
    returnGeometry: 'false',
    f: 'json',
  });
  try {
    const res = await fetch(`${ADAMS_ZONING_API}?${params}`);
    if (!res.ok) return null;
    const data = await res.json() as { features?: { attributes: Record<string, unknown> }[]; error?: unknown };
    if ((data as { error?: unknown }).error || !data.features?.length) return null;
    const a = data.features[0]!.attributes;
    const s = (k: string) => { const v = a[k]; return (v === null || v === undefined || String(v).trim() === '') ? null : String(v).trim() || null; };
    const zoneCode = s('ZONE_');
    const cityName = s('CITY_NAME');
    // Only return a result for unincorporated Adams County — cities have their own zoning layers
    if (!zoneCode || (cityName && cityName.toLowerCase() !== 'unincorporated')) return null;
    return { zoneCode, cityName };
  } catch { return null; }
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

// ── County assessor detail fetches ───────────────────────────────────────────

/**
 * Fetch Denver building characteristics from the server proxy.
 * parid — the Denver schedule number (parcel_id from ESRI layer).
 */
export async function fetchDenverBuilding(parid: string): Promise<DenverBuildingData | null> {
  try {
    const res = await fetch(`/api/denver-building?parid=${encodeURIComponent(parid)}`);
    if (!res.ok) return null;
    const json = await res.json() as { data: DenverBuildingData | null };
    return json.data ?? null;
  } catch {
    return null;
  }
}

/**
 * Fetch Denver parcel valuation (land/improvement split) from the server proxy.
 * parid — the Denver schedule number.
 */
export async function fetchDenverValuation(parid: string): Promise<DenverParcelValuationData | null> {
  try {
    const res = await fetch(`/api/denver-valuation?parid=${encodeURIComponent(parid)}`);
    if (!res.ok) return null;
    const json = await res.json() as { data: DenverParcelValuationData | null };
    return json.data ?? null;
  } catch {
    return null;
  }
}

/**
 * Fetch Douglas County assessor detail from the server proxy.
 * accountNo — the Douglas account number (account field from ESRI layer).
 */
export async function fetchDouglasDetail(accountNo: string): Promise<DouglasParcelData | null> {
  try {
    const res = await fetch(`/api/douglas-detail?accountNo=${encodeURIComponent(accountNo)}`);
    if (!res.ok) return null;
    const json = await res.json() as { data: DouglasParcelData | null };
    return json.data ?? null;
  } catch {
    return null;
  }
}

/**
 * Fetch Arapahoe County assessor detail from the server proxy.
 * ain — the Arapahoe parcel_id / AIN from the ESRI layer.
 */
export async function fetchArapahoeDetail(ain: string): Promise<ArapahoeParcelData | null> {
  try {
    const res = await fetch(`/api/arapahoe-detail?ain=${encodeURIComponent(ain)}`);
    if (!res.ok) return null;
    const json = await res.json() as { data: ArapahoeParcelData | null };
    return json.data ?? null;
  } catch {
    return null;
  }
}

/**
 * Fetch Jefferson County assessor detail from the server proxy.
 * pin — the Jefferson County parcel PIN from the ESRI layer (parcel_id field).
 * Format: "XX-XXX-XX-XXX" (e.g., "39-133-00-024")
 */
export async function fetchJeffersonDetail(pin: string): Promise<JeffersonParcelData | null> {
  try {
    const res = await fetch(`/api/jefferson-detail?pin=${encodeURIComponent(pin)}`);
    if (!res.ok) return null;
    const json = await res.json() as { data: JeffersonParcelData | null };
    return json.data ?? null;
  } catch {
    return null;
  }
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
