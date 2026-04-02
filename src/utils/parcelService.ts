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
  DenverBuildingData,
  DouglasParcelData,
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
const DENVER_ZONING_POINT_API = '/api/denver-zoning-point';
const DENVER_BUILDING_API = '/api/denver-building';
const DOUGLAS_PARCELS_API = '/api/douglas-parcels/query';
const DOUGLAS_DETAIL_API = '/api/douglas-detail';
const COUNTY_BOUNDARIES_API = '/api/esri-co/OIT/Colorado_State_Basemap/MapServer/52/query';
const MUNICIPAL_BOUNDARIES_API = '/api/esri-co/OIT/Colorado_State_Basemap/MapServer/34/query';
const DENVER_NEIGHBORHOODS_API = '/api/denver-neighborhoods';

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

function buildDenverParidCandidates(parid: string): string[] {
  const trimmed = parid.trim();
  const digitsOnly = trimmed.replace(/\D/g, '');
  const candidates = new Set<string>();

  if (trimmed) candidates.add(trimmed);
  if (digitsOnly) {
    candidates.add(digitsOnly);
    if (digitsOnly.length === 12) candidates.add(`${digitsOnly}0`);
    if (digitsOnly.length === 13 && digitsOnly.endsWith('0')) candidates.add(digitsOnly.slice(0, -1));
  }

  return Array.from(candidates);
}

interface DenverBuildingApiResponse {
  data: DenverBuildingData | null;
}

interface DouglasDetailApiResponse {
  data: DouglasParcelData | null;
}

interface ArcGisQueryResponse<T> {
  features?: Array<{ attributes?: T }>;
  error?: { message?: string };
}

export async function queryCountyBoundaries(): Promise<GeoJSON.FeatureCollection> {
  const params = new URLSearchParams({
    where: '1=1',
    outFields: '*',
    returnGeometry: 'true',
    f: 'geojson',
  });

  const res = await fetch(`${COUNTY_BOUNDARIES_API}?${params}`);
  if (!res.ok) throw new Error(`County boundaries returned ${res.status}`);
  return await res.json() as GeoJSON.FeatureCollection;
}

export async function queryMunicipalBoundaries(): Promise<GeoJSON.FeatureCollection> {
  const params = new URLSearchParams({
    where: '1=1',
    outFields: '*',
    returnGeometry: 'true',
    f: 'geojson',
  });

  const res = await fetch(`${MUNICIPAL_BOUNDARIES_API}?${params}`);
  if (!res.ok) throw new Error(`Municipal boundaries returned ${res.status}`);
  return await res.json() as GeoJSON.FeatureCollection;
}

export async function queryDenverNeighborhoodBoundaries(): Promise<GeoJSON.FeatureCollection> {
  const res = await fetch(DENVER_NEIGHBORHOODS_API);
  if (!res.ok) throw new Error(`Denver neighborhoods returned ${res.status}`);
  return await res.json() as GeoJSON.FeatureCollection;
}

export async function queryParcelsInBounds(
  west: number,
  south: number,
  east: number,
  north: number,
  resultRecordCount = 700,
): Promise<GeoJSON.FeatureCollection> {
  const params = new URLSearchParams({
    geometry: JSON.stringify({
      xmin: west,
      ymin: south,
      xmax: east,
      ymax: north,
      spatialReference: { wkid: 4326 },
    }),
    geometryType: 'esriGeometryEnvelope',
    inSR: '4326',
    spatialRel: 'esriSpatialRelIntersects',
    where: '1=1',
    outFields: 'parcel_id,situsAdd,sitAddCty,countyName,landSqft,landAcres',
    returnGeometry: 'true',
    resultRecordCount: String(resultRecordCount),
    f: 'geojson',
  });

  const res = await fetch(`${PARCEL_API}?${params}`);
  if (!res.ok) throw new Error(`Visible parcels query returned ${res.status}`);
  return await res.json() as GeoJSON.FeatureCollection;
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
    const pointParams = new URLSearchParams({
      lat: String(lat),
      lng: String(lng),
    });

    try {
      const pointRes = await fetch(`${DENVER_ZONING_POINT_API}?${pointParams}`);
      if (pointRes.ok) {
        const pointJson = await pointRes.json() as { data?: DenverZoningRaw | null };
        if (pointJson.data?.zoneDistrict) return pointJson.data;
      }
    } catch {
      // no-op
    }

    return null;
  }
}

export async function queryDenverBuilding(parid: string): Promise<DenverBuildingData | null> {
  if (!parid) return null;
  const publicTableResult = await queryDenverBuildingFromPublicTables(parid);
  if (publicTableResult) return publicTableResult;

  const params = new URLSearchParams({ parid });

  try {
    const res = await fetch(`${DENVER_BUILDING_API}?${params}`);
    if (res.ok) {
      const data = await res.json() as DenverBuildingApiResponse;
      return data.data ?? null;
    }
  } catch {
    // no-op
  }

  return null;
}

export async function queryDouglasParcelData(
  lng: number,
  lat: number
): Promise<DouglasParcelData | null> {
  const parcelParams = new URLSearchParams({
    geometry: JSON.stringify({ x: lng, y: lat }),
    geometryType: 'esriGeometryPoint',
    inSR: '4326',
    spatialRel: 'esriSpatialRelIntersects',
    outFields: [
      'ACCOUNT_NO',
      'STATE_PARCEL_NO',
      'PARCEL_TYPE',
      'ACCOUNT_SUBTYPE_CODE',
      'LOCATION_ADDRESS',
      'CITY_NAME',
      'OWNER_NAME',
      'MAILING_ADDRESS_LINE_1',
      'MAILING_ADDRESS_LINE_2',
      'MAILING_ADDRESS_LINE_3',
      'MAILING_CITY_NAME',
      'MAILING_STATE',
      'MAILING_ZIP_CODE',
      'GIS_LEGAL_DESC',
      'CAMA_LEGAL_DESC',
      'DEDICATED_SUB_FILING_NAME',
      'FILING_DESCR',
      'TOTAL_ACTUAL_VALUE',
      'TOTAL_ASSESSED_VALUE',
      'REDUCED_MILL_LEVY',
    ].join(','),
    returnGeometry: 'false',
    f: 'json',
  });

  const parcelRes = await fetch(`${DOUGLAS_PARCELS_API}?${parcelParams}`);
  if (!parcelRes.ok) {
    throw new Error(`Douglas parcel service returned ${parcelRes.status}`);
  }

  const parcelJson = await parcelRes.json() as ArcGisQueryResponse<Record<string, unknown>>;
  if (parcelJson.error) {
    throw new Error(parcelJson.error.message ?? 'Douglas parcel query failed');
  }

  const parcelAttributes = parcelJson.features?.[0]?.attributes;
  const accountNumber = toNullableString(parcelAttributes?.ACCOUNT_NO);
  if (!accountNumber) return null;

  const detailParams = new URLSearchParams({ accountNo: accountNumber });
  const detailRes = await fetch(`${DOUGLAS_DETAIL_API}?${detailParams}`);
  if (!detailRes.ok) {
    throw new Error(`Douglas detail service returned ${detailRes.status}`);
  }

  const detailJson = await detailRes.json() as DouglasDetailApiResponse;
  const detail = detailJson.data;
  if (!detail) return null;

  const mailingAddress = [
    toNullableString(parcelAttributes?.MAILING_ADDRESS_LINE_1),
    toNullableString(parcelAttributes?.MAILING_ADDRESS_LINE_2),
    toNullableString(parcelAttributes?.MAILING_ADDRESS_LINE_3),
    [
      toNullableString(parcelAttributes?.MAILING_CITY_NAME),
      toNullableString(parcelAttributes?.MAILING_STATE),
      toNullableString(parcelAttributes?.MAILING_ZIP_CODE),
    ].filter(Boolean).join(' '),
  ]
    .filter((value): value is string => !!value)
    .join(', ');

  return {
    ...detail,
    stateParcelNumber: toNullableString(parcelAttributes?.STATE_PARCEL_NO) ?? detail.stateParcelNumber,
    parcelType: toNullableString(parcelAttributes?.PARCEL_TYPE) ?? detail.parcelType,
    accountSubtypeCode: toNullableString(parcelAttributes?.ACCOUNT_SUBTYPE_CODE) ?? detail.accountSubtypeCode,
    locationAddress: toNullableString(parcelAttributes?.LOCATION_ADDRESS) ?? detail.locationAddress,
    cityName: toNullableString(parcelAttributes?.CITY_NAME) ?? detail.cityName,
    ownerName: toNullableString(parcelAttributes?.OWNER_NAME) ?? detail.ownerName,
    mailingAddress: mailingAddress || detail.mailingAddress,
    legalDescription:
      toNullableString(parcelAttributes?.CAMA_LEGAL_DESC) ??
      toNullableString(parcelAttributes?.GIS_LEGAL_DESC) ??
      detail.legalDescription,
    subdivision:
      toNullableString(parcelAttributes?.DEDICATED_SUB_FILING_NAME) ??
      toNullableString(parcelAttributes?.FILING_DESCR) ??
      detail.subdivision,
    totalActualValue: toNullableNumber(parcelAttributes?.TOTAL_ACTUAL_VALUE) ?? detail.totalActualValue,
    totalAssessedValue: toNullableNumber(parcelAttributes?.TOTAL_ASSESSED_VALUE) ?? detail.totalAssessedValue,
    reducedMillLevy: toNullableNumber(parcelAttributes?.REDUCED_MILL_LEVY) ?? detail.reducedMillLevy,
    fullMillLevy: detail.fullMillLevy,
    estimatedAnnualTax:
      detail.latestTaxReport?.estimatedTaxes ??
      ((detail.latestTaxReport?.taxableAssessedValue ??
        toNullableNumber(parcelAttributes?.TOTAL_ASSESSED_VALUE) ??
        detail.totalAssessedValue) !== null &&
      (detail.fullMillLevy ??
        toNullableNumber(parcelAttributes?.REDUCED_MILL_LEVY) ??
        detail.reducedMillLevy) !== null
        ? Math.round(
            (((detail.latestTaxReport?.taxableAssessedValue ??
              toNullableNumber(parcelAttributes?.TOTAL_ASSESSED_VALUE) ??
              detail.totalAssessedValue) ?? 0) *
              ((detail.fullMillLevy ??
                toNullableNumber(parcelAttributes?.REDUCED_MILL_LEVY) ??
                detail.reducedMillLevy) ?? 0)) /
              1000
          )
        : detail.estimatedAnnualTax),
  };
}

export async function queryDenverBuildings(parids: string[]): Promise<Map<string, DenverBuildingData>> {
  const normalizedParids = Array.from(
    new Set(
      parids
        .map((parid) => buildDenverParidCandidates(parid))
        .flat()
        .filter(Boolean)
    )
  );

  const results = new Map<string, DenverBuildingData>();
  if (normalizedParids.length === 0) return results;

  const clause = normalizedParids
    .map((parid) => `PARID = '${parid.replace(/'/g, "''")}'`)
    .join(' OR ');

  try {
    const [residentialRes, commercialRes] = await Promise.all([
      fetch(`/api/denver-residential/query?${new URLSearchParams({
        where: clause,
        outFields: 'PARID,NBHD_1_CN,PROP_CLASS,AREA_ABG,BSMT_AREA,FBSMT_SQFT,GRD_AREA,STORY,UNITS,CCYRBLT,CCAGE_RM,STYLE_CN',
        returnGeometry: 'false',
        f: 'json',
      })}`),
      fetch(`/api/denver-commercial/query?${new URLSearchParams({
        where: clause,
        outFields: 'PARID,NBHD_1_CN,PROPERTY_CLASS_DESC,BLD_NAME,GROSS_AREA,NET_AREA,BSMT_AREA,FBSMT_SQFT,NO_FLOORS,TOTL_SQFT,ORIG_YOC,REMODEL,TOT_UNITS,D_CLASS_CN',
        returnGeometry: 'false',
        f: 'json',
      })}`),
    ]);

    const residentialJson = residentialRes.ok
      ? await residentialRes.json() as ArcGisQueryResponse<Record<string, unknown>>
      : null;
    const commercialJson = commercialRes.ok
      ? await commercialRes.json() as ArcGisQueryResponse<Record<string, unknown>>
      : null;

    for (const feature of residentialJson?.features ?? []) {
      const residential = feature.attributes;
      if (!residential) continue;
      const aboveGradeSqft = toNullableNumber(residential.AREA_ABG);
      const basementSqft = toNullableNumber(residential.BSMT_AREA);
      const data: DenverBuildingData = {
        source: 'residential',
        parid: toNullableString(residential.PARID) ?? '',
        neighborhoodName: toNullableString(residential.NBHD_1_CN),
        propertyClass: toNullableString(residential.PROP_CLASS),
        totalBuildingSqft:
          aboveGradeSqft !== null || basementSqft !== null
            ? (aboveGradeSqft ?? 0) + (basementSqft ?? 0)
            : null,
        aboveGradeSqft,
        basementSqft,
        finishedBasementSqft: toNullableNumber(residential.FBSMT_SQFT),
        grossAreaSqft: null,
        netAreaSqft: null,
        groundFloorSqft: toNullableNumber(residential.GRD_AREA),
        floors: toNullableNumber(residential.STORY),
        units: toNullableNumber(residential.UNITS),
        yearBuilt: toNullableNumber(residential.CCYRBLT),
        remodelYear: toNullableNumber(residential.CCAGE_RM),
        style: toNullableString(residential.STYLE_CN),
        buildingName: null,
      };
      if (data.parid) results.set(data.parid, data);
    }

    for (const feature of commercialJson?.features ?? []) {
      const commercial = feature.attributes;
      if (!commercial) continue;
      const data: DenverBuildingData = {
        source: 'commercial',
        parid: toNullableString(commercial.PARID) ?? '',
        neighborhoodName: toNullableString(commercial.NBHD_1_CN),
        propertyClass: toNullableString(commercial.PROPERTY_CLASS_DESC),
        totalBuildingSqft: toNullableNumber(commercial.TOTL_SQFT),
        aboveGradeSqft: null,
        basementSqft: toNullableNumber(commercial.BSMT_AREA),
        finishedBasementSqft: toNullableNumber(commercial.FBSMT_SQFT),
        grossAreaSqft: toNullableNumber(commercial.GROSS_AREA),
        netAreaSqft: toNullableNumber(commercial.NET_AREA),
        groundFloorSqft: null,
        floors: toNullableNumber(commercial.NO_FLOORS),
        units: toNullableNumber(commercial.TOT_UNITS),
        yearBuilt: toNullableNumber(commercial.ORIG_YOC),
        remodelYear: toNullableNumber(commercial.REMODEL),
        style: toNullableString(commercial.D_CLASS_CN),
        buildingName: toNullableString(commercial.BLD_NAME),
      };
      if (data.parid) results.set(data.parid, data);
    }
  } catch {
    return results;
  }

  return results;
}

async function queryDenverBuildingFromPublicTables(parid: string): Promise<DenverBuildingData | null> {
  const candidates = buildDenverParidCandidates(parid);

  if (candidates.length === 0) return null;

  const where = candidates
    .map((candidate) => `PARID = '${candidate.replace(/'/g, "''")}'`)
    .join(' OR ');

  try {
    const [residentialRes, commercialRes] = await Promise.all([
      fetch(`/api/denver-residential/query?${new URLSearchParams({
        where,
        outFields: 'PARID,NBHD_1_CN,PROP_CLASS,AREA_ABG,BSMT_AREA,FBSMT_SQFT,GRD_AREA,STORY,UNITS,CCYRBLT,CCAGE_RM,STYLE_CN',
        returnGeometry: 'false',
        f: 'json',
      })}`),
      fetch(`/api/denver-commercial/query?${new URLSearchParams({
        where,
        outFields: 'PARID,NBHD_1_CN,PROPERTY_CLASS_DESC,BLD_NAME,GROSS_AREA,NET_AREA,BSMT_AREA,FBSMT_SQFT,NO_FLOORS,TOTL_SQFT,ORIG_YOC,REMODEL,TOT_UNITS,D_CLASS_CN',
        returnGeometry: 'false',
        f: 'json',
      })}`),
    ]);

    const residentialJson = residentialRes.ok
      ? await residentialRes.json() as ArcGisQueryResponse<Record<string, unknown>>
      : null;
    const commercialJson = commercialRes.ok
      ? await commercialRes.json() as ArcGisQueryResponse<Record<string, unknown>>
      : null;

    const residential = residentialJson?.features?.[0]?.attributes;
    if (residential) {
      const aboveGradeSqft = toNullableNumber(residential.AREA_ABG);
      const basementSqft = toNullableNumber(residential.BSMT_AREA);
      return {
        source: 'residential',
        parid: toNullableString(residential.PARID) ?? parid,
        neighborhoodName: toNullableString(residential.NBHD_1_CN),
        propertyClass: toNullableString(residential.PROP_CLASS),
        totalBuildingSqft:
          aboveGradeSqft !== null || basementSqft !== null
            ? (aboveGradeSqft ?? 0) + (basementSqft ?? 0)
            : null,
        aboveGradeSqft,
        basementSqft,
        finishedBasementSqft: toNullableNumber(residential.FBSMT_SQFT),
        grossAreaSqft: null,
        netAreaSqft: null,
        groundFloorSqft: toNullableNumber(residential.GRD_AREA),
        floors: toNullableNumber(residential.STORY),
        units: toNullableNumber(residential.UNITS),
        yearBuilt: toNullableNumber(residential.CCYRBLT),
        remodelYear: toNullableNumber(residential.CCAGE_RM),
        style: toNullableString(residential.STYLE_CN),
        buildingName: null,
      };
    }

    const commercial = commercialJson?.features?.[0]?.attributes;
    if (commercial) {
      return {
        source: 'commercial',
        parid: toNullableString(commercial.PARID) ?? parid,
        neighborhoodName: toNullableString(commercial.NBHD_1_CN),
        propertyClass: toNullableString(commercial.PROPERTY_CLASS_DESC),
        totalBuildingSqft: toNullableNumber(commercial.TOTL_SQFT),
        aboveGradeSqft: null,
        basementSqft: toNullableNumber(commercial.BSMT_AREA),
        finishedBasementSqft: toNullableNumber(commercial.FBSMT_SQFT),
        grossAreaSqft: toNullableNumber(commercial.GROSS_AREA),
        netAreaSqft: toNullableNumber(commercial.NET_AREA),
        groundFloorSqft: null,
        floors: toNullableNumber(commercial.NO_FLOORS),
        units: toNullableNumber(commercial.TOT_UNITS),
        yearBuilt: toNullableNumber(commercial.ORIG_YOC),
        remodelYear: toNullableNumber(commercial.REMODEL),
        style: toNullableString(commercial.D_CLASS_CN),
        buildingName: toNullableString(commercial.BLD_NAME),
      };
    }
  } catch {
    return null;
  }

  return null;
}

function toNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function toNullableString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text || null;
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

export async function queryParcelsNearby(
  lng: number,
  lat: number,
  radiusMiles: number,
  limit = 60
): Promise<ParcelFeature[]> {
  const latDelta = radiusMiles / 69;
  const lngDelta = radiusMiles / (Math.cos((lat * Math.PI) / 180) * 69 || 1);

  const params = new URLSearchParams({
    geometry: JSON.stringify({
      xmin: lng - lngDelta,
      ymin: lat - latDelta,
      xmax: lng + lngDelta,
      ymax: lat + latDelta,
      spatialReference: { wkid: 4326 },
    }),
    geometryType: 'esriGeometryEnvelope',
    inSR: '4326',
    spatialRel: 'esriSpatialRelIntersects',
    outFields: PARCEL_FIELDS,
    returnGeometry: 'true',
    outSR: '4326',
    resultRecordCount: String(limit),
    f: 'json',
  });

  const res = await fetch(`${PARCEL_API}?${params}`);
  if (!res.ok) throw new Error(`Parcel nearby service returned ${res.status}`);

  const data = await res.json() as EsriJsonResponse;
  if (data.error) throw new Error(data.error.message);

  return (data.features ?? []).map((feature) => {
    const centroid = ringsCentroid(feature.geometry?.rings) ?? { lat, lng };
    return normalizeParcelFeature(feature, centroid.lat, centroid.lng);
  });
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

function ringsCentroid(rings?: number[][][]): { lat: number; lng: number } | null {
  const ring = rings?.[0];
  if (!ring?.length) return null;

  let minLng = Infinity;
  let maxLng = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;

  for (const [pointLng, pointLat] of ring) {
    if (pointLng < minLng) minLng = pointLng;
    if (pointLng > maxLng) maxLng = pointLng;
    if (pointLat < minLat) minLat = pointLat;
    if (pointLat > maxLat) maxLat = pointLat;
  }

  if (!Number.isFinite(minLng) || !Number.isFinite(minLat)) return null;

  return {
    lng: (minLng + maxLng) / 2,
    lat: (minLat + maxLat) / 2,
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
