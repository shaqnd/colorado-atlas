/**
 * ParcelMap — Full-bleed interactive map for Colorado parcel intelligence.
 *
 * Features:
 *  - MapLibre GL JS via react-map-gl (free tiles, no API key)
 *  - Floating address search bar (US Census Geocoder, free)
 *  - Click-to-select parcel (Colorado ESRI statewide parcel layer)
 *  - Slide-in parcel info panel with 5 tabs
 *  - Parcel polygon highlight layer
 */

import 'maplibre-gl/dist/maplibre-gl.css';

import { useState, useRef, useCallback, useMemo } from 'react';
import Map, {
  Source,
  Layer,
  Marker,
  NavigationControl,
  Popup,
} from 'react-map-gl/maplibre';
import type { MapRef, MapLayerMouseEvent } from 'react-map-gl/maplibre';

import type { ParcelState, GeoJSONGeometry } from '../data/parcelTypes';
import { geocodeAddress, queryParcelByPoint, reverseGeocodeNeighborhood, queryDenverZoning, queryAuroraZoning, queryCentennialZoning, queryDouglasZoning, queryJeffersonZoning, queryLarimerZoning, queryElPasoZoning, queryClearCreekZoning, queryLakewoodZoning, queryArvadaZoning, queryGreenwoodVillageZoning, queryLittletonZoning, queryThorntonZoning, queryArapahoeZoning, queryBroomfieldZoning, queryBoulderCountyZoning, queryWeldZoning, queryPuebloCountyZoning, queryAdamsZoning, fetchDenverBuilding, fetchDenverValuation, fetchDouglasDetail, fetchArapahoeDetail, fetchJeffersonDetail } from '../utils/parcelService';
import type { DenverZoningRaw, AuroraZoningRaw, CentennialZoningRaw, DouglasZoningRaw, JeffersonZoningRaw, LarimerZoningRaw, ElPasoZoningRaw, ClearCreekZoningRaw, LakewoodZoningRaw, ArvadaZoningRaw, GreenwoodVillageZoningRaw, LittletonZoningRaw, ThorntonZoningRaw, ArapahoeZoningRaw, BroomfieldZoningRaw, BoulderCountyZoningRaw, WeldZoningRaw, PuebloCountyZoningRaw, AdamsZoningRaw, DenverBuildingData, DenverParcelValuationData, DouglasParcelData, ArapahoeParcelData, JeffersonParcelData } from '../utils/parcelService';
import { ParcelPanel } from './ParcelPanel';

// Business directory data — pre-geocoded at build time
import businessDirectoryRaw from '../data/businessDirectory.json';

// ── Constants ─────────────────────────────────────────────────────────────────

const MAP_STYLE_STREET = 'https://tiles.openfreemap.org/styles/liberty';

/** ESRI World Imagery — free raster satellite tiles, no API key required. */
const MAP_STYLE_SATELLITE = {
  version: 8 as const,
  sources: {
    satellite: {
      type: 'raster' as const,
      tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
      tileSize: 256,
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    },
    'satellite-labels': {
      type: 'raster' as const,
      tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'],
      tileSize: 256,
    },
  },
  layers: [
    { id: 'satellite-bg',     type: 'raster' as const, source: 'satellite' },
    { id: 'satellite-labels', type: 'raster' as const, source: 'satellite-labels' },
  ],
};

/**
 * FEMA NFHL — dynamic ArcGIS MapServer (no tile cache).
 * Uses bbox export format; MapLibre replaces {bbox-epsg-3857} with actual bounds.
 * Shows all flood zone types with FEMA's standard symbology.
 */
const FEMA_FLOOD_TILES = '/api/fema-nfhl/export?bbox={bbox-epsg-3857}&bboxSR=3857&size=256,256&imageSR=3857&format=png&transparent=true&f=image';

/**
 * USFS Wildfire Hazard Potential 2023 — 5-class classified raster (IIPP platform).
 * Classes: 1=Very Low, 2=Low, 3=Moderate, 4=High, 5=Very High.
 * Resolution: 270m. Coverage: contiguous US.
 */
const WILDFIRE_TILES = '/api/wildfire/exportImage?bbox={bbox-epsg-3857}&bboxSR=3857&size=256,256&imageSR=3857&format=png&transparent=true&f=image';

// ── Boundary layer GeoJSON fetch helpers (fetched once on first toggle) ────────

async function fetchCountyBoundariesGeoJSON(): Promise<GeoJSON.FeatureCollection | null> {
  try {
    const params = new URLSearchParams({ where: '1=1', outFields: 'COUNTY,CNTY_FIPS', outSR: '4326', f: 'geojson' });
    const res = await fetch(`/api/co-county-boundaries/query?${params}`);
    if (!res.ok) return null;
    return await res.json() as GeoJSON.FeatureCollection;
  } catch { return null; }
}

async function fetchMunicipalBoundariesGeoJSON(): Promise<GeoJSON.FeatureCollection | null> {
  try {
    const params = new URLSearchParams({ where: '1=1', outFields: 'NAME20', outSR: '4326', resultRecordCount: '2000', f: 'geojson' });
    const res = await fetch(`/api/co-municipal-boundaries/query?${params}`);
    if (!res.ok) return null;
    return await res.json() as GeoJSON.FeatureCollection;
  } catch { return null; }
}

async function fetchDenverNeighborhoodsGeoJSON(): Promise<GeoJSON.FeatureCollection | null> {
  try {
    const params = new URLSearchParams({ where: '1=1', outFields: 'NBHD_NAME,NBHD_ID', outSR: '4326', f: 'geojson' });
    const res = await fetch(`/api/denver-neighborhoods/query?${params}`);
    if (!res.ok) return null;
    return await res.json() as GeoJSON.FeatureCollection;
  } catch { return null; }
}

/**
 * Denver City & County Zoning Districts — official MapServer (denvergov.org).
 * Layer 1 contains zoning polygons with ZONE_DISTRICT field.
 * Coverage: Denver County only.
 */
const DENVER_ZONING_TILES = '/api/denver-zoning/export?bbox={bbox-epsg-3857}&bboxSR=3857&layers=show:1&size=256,256&imageSR=3857&format=png32&transparent=true&f=image';

/**
 * Aurora City Zoning Districts — OpenData MapServer (ags.auroragov.org).
 * Layer 20 contains zoning polygons.
 * Coverage: Aurora city limits (Adams + Arapahoe counties).
 */
const AURORA_ZONING_TILES = '/api/aurora-zoning/export?bbox={bbox-epsg-3857}&bboxSR=3857&layers=show:20&size=256,256&imageSR=3857&format=png32&transparent=true&f=image';

/**
 * Centennial Current Land Use — official MapServer (maps.centennialco.gov).
 * Layer 0 contains land use polygons (RES_SFD, COM_RETAIL, IND_LIGHT, etc.).
 * Coverage: City of Centennial (Arapahoe County).
 */
const CENTENNIAL_ZONING_TILES = '/api/centennial-zoning/MapServer/export?bbox={bbox-epsg-3857}&bboxSR=3857&layers=show:0&size=256,256&imageSR=3857&format=png32&transparent=true&f=image';

/**
 * Douglas County Zoning — Landuse MapServer (apps.douglas.co.us).
 * Layer 1 contains zoning polygons with ZONE_TYPE field.
 * Coverage: Unincorporated Douglas County.
 */
const DOUGLAS_ZONING_TILES = '/api/douglas-zoning/export?bbox={bbox-epsg-3857}&bboxSR=3857&layers=show:1&size=256,256&imageSR=3857&format=png32&transparent=true&f=image';

/**
 * Jefferson County Zoning — Zoning MapServer (gisportal.jeffco.us).
 * Layer 36 contains zoning polygons.
 * Coverage: Unincorporated Jefferson County.
 */
const JEFFERSON_ZONING_TILES = '/api/jefferson-zoning/export?bbox={bbox-epsg-3857}&bboxSR=3857&layers=show:36&size=256,256&imageSR=3857&format=png32&transparent=true&f=image';

/**
 * Larimer County Zoning — LC_Zoning MapServer (maps1.larimer.org).
 * Layer 0 contains zoning district polygons.
 * Coverage: Unincorporated Larimer County.
 */
const LARIMER_ZONING_TILES = '/api/larimer-zoning/export?bbox={bbox-epsg-3857}&bboxSR=3857&layers=show:0&size=256,256&imageSR=3857&format=png32&transparent=true&f=image';

/**
 * El Paso County Zoning — ZoningAreas MapServer (gisservices.elpasoco.com).
 * Layer 1 contains zoning area polygons.
 * Coverage: Unincorporated El Paso County.
 */
const ELPASO_ZONING_TILES = '/api/elpaso-zoning/export?bbox={bbox-epsg-3857}&bboxSR=3857&layers=show:1&size=256,256&imageSR=3857&format=png32&transparent=true&f=image';

/**
 * Clear Creek County Zoning — Cadastral MapServer (gis.clearcreekcounty.us).
 * Layer 18 contains zoning polygons with CURR_ZONE field.
 * Coverage: Clear Creek County (Georgetown, Idaho Springs, Empire).
 */
const CLEARCREEK_ZONING_TILES = '/api/clearcreek-zoning/export?bbox={bbox-epsg-3857}&bboxSR=3857&layers=show:18&size=256,256&imageSR=3857&format=png32&transparent=true&f=image';
const LAKEWOOD_ZONING_TILES = '/api/lakewood-zoning/export?bbox={bbox-epsg-3857}&bboxSR=3857&layers=show:0&size=256,256&imageSR=3857&format=png32&transparent=true&f=image';
const ARVADA_ZONING_TILES = '/api/arvada-zoning/export?bbox={bbox-epsg-3857}&bboxSR=3857&layers=show:0&size=256,256&imageSR=3857&format=png32&transparent=true&f=image';
const GREENWOODVILLAGE_ZONING_TILES = '/api/greenwoodvillage-zoning/export?bbox={bbox-epsg-3857}&bboxSR=3857&layers=show:1&size=256,256&imageSR=3857&format=png32&transparent=true&f=image';
const LITTLETON_ZONING_TILES = '/api/littleton-zoning/export?bbox={bbox-epsg-3857}&bboxSR=3857&layers=show:2&size=256,256&imageSR=3857&format=png32&transparent=true&f=image';
const THORNTON_ZONING_TILES = '/api/thornton-zoning/export?bbox={bbox-epsg-3857}&bboxSR=3857&layers=show:0&size=256,256&imageSR=3857&format=png32&transparent=true&f=image';
// Arapahoe County — MapServer layer 352
const ARAPAHOE_ZONING_TILES = '/api/arapahoe-zoning/export?bbox={bbox-epsg-3857}&bboxSR=3857&layers=show:352&size=256,256&imageSR=3857&format=png32&transparent=true&f=image';
// Boulder County — MapServer layer 0
const BOULDER_COUNTY_ZONING_TILES = '/api/boulder-county-zoning/export?bbox={bbox-epsg-3857}&bboxSR=3857&layers=show:0&size=256,256&imageSR=3857&format=png32&transparent=true&f=image';
// Pueblo County — MapServer layer 0
const PUEBLO_COUNTY_ZONING_TILES = '/api/pueblo-county-zoning/export?bbox={bbox-epsg-3857}&bboxSR=3857&layers=show:0&size=256,256&imageSR=3857&format=png32&transparent=true&f=image';
// Broomfield and Weld use FeatureServer (ArcGIS Online) — no /export tile support; query only

// Colorado geographic center
const CO_INITIAL: { longitude: number; latitude: number; zoom: number } = {
  longitude: -105.7821,
  latitude:  39.5501,
  zoom:      7,
};

// ── Measurement math ──────────────────────────────────────────────────────────

type LngLat = [number, number]; // [lng, lat]

function haversineM(a: LngLat, b: LngLat): number {
  const R = 6371000;
  const dLat = (b[1] - a[1]) * Math.PI / 180;
  const dLng = (b[0] - a[0]) * Math.PI / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a[1] * Math.PI / 180) * Math.cos(b[1] * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Shoelace formula on an equirectangular projection — accurate for areas < ~500 km². */
function calcAreaM2(pts: LngLat[]): number {
  const R = 6371000;
  let area = 0;
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const [lng1, lat1] = pts[i];
    const [lng2, lat2] = pts[(i + 1) % n];
    const avgLat = ((lat1 + lat2) / 2) * Math.PI / 180;
    const x1 = lng1 * Math.PI / 180 * R * Math.cos(avgLat);
    const y1 = lat1 * Math.PI / 180 * R;
    const x2 = lng2 * Math.PI / 180 * R * Math.cos(avgLat);
    const y2 = lat2 * Math.PI / 180 * R;
    area += x1 * y2 - x2 * y1;
  }
  return Math.abs(area / 2);
}

function fmtDistance(m: number): string {
  if (m < 1609) return `${Math.round(m * 3.28084).toLocaleString()} ft`;
  const mi = m / 1609.344;
  return `${mi.toFixed(2)} mi  (${Math.round(m).toLocaleString()} m)`;
}

function fmtArea(m2: number): string {
  const sqft = m2 * 10.7639;
  const acres = m2 / 4046.86;
  if (acres < 1) return `${Math.round(sqft).toLocaleString()} sq ft  (${acres.toFixed(3)} ac)`;
  return `${acres.toFixed(2)} acres  (${Math.round(sqft).toLocaleString()} sq ft)`;
}

// ── Search bar ────────────────────────────────────────────────────────────────

interface SearchBarProps {
  onSearch: (addr: string) => Promise<void>;
  searching: boolean;
  error: string | null;
  panelOpen: boolean;
}

function SearchBar({ onSearch, searching, error, panelOpen }: SearchBarProps) {
  const [value, setValue] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) onSearch(trimmed);
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 16,
        // Shift right when panel is open so bar doesn't overlap panel
        left: panelOpen ? `calc(50% + 190px)` : '50%',
        transform: 'translateX(-50%)',
        zIndex: 30,
        width: 480,
        maxWidth: 'calc(100vw - 80px)',
        transition: 'left 300ms cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.97)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderRadius: 14,
            boxShadow: '0 4px 24px rgba(0,0,0,0.16), 0 1px 4px rgba(0,0,0,0.08)',
            border: error ? '1px solid rgba(255,69,58,0.4)' : '1px solid rgba(0,0,0,0.08)',
            overflow: 'hidden',
            transition: 'border-color 200ms',
          }}
        >
          {/* Search icon */}
          <div style={{ paddingLeft: 14, color: searching ? 'var(--ap-blue)' : 'var(--ap-t3)', flexShrink: 0 }}>
            {searching ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.75" strokeDasharray="20 18" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M10.5 10.5L13.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            )}
          </div>

          {/* Input */}
          <input
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder="Enter a Colorado address, APN, or place…"
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: 14,
              color: 'var(--ap-t1)',
              padding: '12px 10px',
              fontFamily: 'inherit',
            }}
          />

          {/* Clear */}
          {value && (
            <button
              type="button"
              onClick={() => setValue('')}
              style={{ padding: '0 8px', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--ap-t3)', display: 'flex', alignItems: 'center' }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" fill="rgba(0,0,0,0.1)"/>
                <path d="M5 5L9 9M9 5L5 9" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          )}

          {/* Search button */}
          <button
            type="submit"
            disabled={!value.trim() || searching}
            style={{
              margin: 4,
              padding: '7px 16px',
              borderRadius: 10,
              border: 'none',
              background: value.trim() && !searching ? 'var(--ap-blue)' : 'rgba(0,0,0,0.06)',
              color: value.trim() && !searching ? '#fff' : 'var(--ap-t3)',
              fontSize: 13,
              fontWeight: 600,
              cursor: value.trim() && !searching ? 'pointer' : 'default',
              transition: 'background 200ms, color 200ms',
              whiteSpace: 'nowrap',
            }}
          >
            Search
          </button>
        </div>

        {/* Error toast */}
        {error && (
          <div
            style={{
              marginTop: 8,
              padding: '10px 14px',
              borderRadius: 10,
              background: 'rgba(255,255,255,0.97)',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
              fontSize: 13,
              color: 'var(--ap-red)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6" fill="rgba(255,69,58,0.12)"/>
              <path d="M7 4v3.5M7 9.5V10" stroke="var(--ap-red)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {error}
          </div>
        )}
      </form>
    </div>
  );
}

// ── Map tip overlay ───────────────────────────────────────────────────────────

function MapHint() {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 40,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
        padding: '9px 18px',
        borderRadius: 99,
        background: 'rgba(0,0,0,0.54)',
        backdropFilter: 'blur(12px)',
        color: 'rgba(255,255,255,0.9)',
        fontSize: 12,
        fontWeight: 500,
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      Search an address above · or click anywhere on the map
    </div>
  );
}

// ── Layer styles ──────────────────────────────────────────────────────────────

const PARCEL_FILL_LAYER = {
  id: 'parcel-fill',
  type: 'fill' as const,
  paint: {
    'fill-color': '#0071e3',
    'fill-opacity': 0.18,
  },
};

const PARCEL_LINE_LAYER = {
  id: 'parcel-line',
  type: 'line' as const,
  paint: {
    'line-color': '#0071e3',
    'line-width': 2.5,
    'line-opacity': 0.9,
  },
};

// ── Multi-select color palette ────────────────────────────────────────────────

const MULTI_COLORS = [
  { fill: 'rgba(0,113,227,0.22)',   line: '#0071e3', label: '#0051b3' }, // blue
  { fill: 'rgba(249,115,22,0.22)',  line: '#f97316', label: '#c2410c' }, // orange
  { fill: 'rgba(168,85,247,0.22)',  line: '#a855f7', label: '#7e22ce' }, // purple
  { fill: 'rgba(52,199,89,0.22)',   line: '#34c759', label: '#166534' }, // green
  { fill: 'rgba(255,59,48,0.22)',   line: '#ff3b30', label: '#b91c1c' }, // red
  { fill: 'rgba(0,199,190,0.22)',   line: '#00c7be', label: '#0e7490' }, // teal
  { fill: 'rgba(255,149,0,0.22)',   line: '#ff9500', label: '#b45309' }, // amber
  { fill: 'rgba(255,45,85,0.22)',   line: '#ff2d55', label: '#9f1239' }, // pink
];

// ── Business directory types + helpers ────────────────────────────────────────

interface BizLocation {
  address: string;
  lat: number;
  lng: number;
}

interface BizEntry {
  id: number;
  name: string;
  category: string;
  website: string;
  address: string | null;
  about: string;
  phone: string;
  email: string;
  nakedProperty: string | null;
  nakedArticle: string | null;
  coordinates: { lat: number; lng: number } | null;
  allLocations?: BizLocation[];
}

// Group diverse categories into broad buckets for color-coding
function bizCategoryColor(category: string): string {
  const c = category.toLowerCase();
  if (c.includes('architect')) return '#3b82f6';           // blue
  if (c.includes('engineer') || c.includes('civil') || c.includes('structural') || c.includes('geotech') || c.includes('mep')) return '#0ea5e9'; // sky
  if (c.includes('general contractor') || c.includes('gc') || c.includes('modular')) return '#f97316'; // orange
  if (c.includes('contractor') || c.includes('demolition') || c.includes('excavat') || c.includes('heavy civil') || c.includes('electrical') || c.includes('mechanical') || c.includes('specialty') || c.includes('low voltage') || c.includes('renewables')) return '#fb923c'; // amber-orange
  if (c.includes('developer') || c.includes('commercial real estate') || c.includes('private equity') || c.includes('investor')) return '#8b5cf6'; // purple
  if (c.includes('brokerage') || c.includes('broker')) return '#10b981'; // green
  if (c.includes('restaurant') || c.includes('food') || c.includes('bar') || c.includes('dessert') || c.includes('entertainment')) return '#ec4899'; // pink
  if (c.includes('retail') || c.includes('mercantile') || c.includes('hardware') || c.includes('shoes') || c.includes('plants') || c.includes('vintage')) return '#f59e0b'; // amber
  if (c.includes('fitness') || c.includes('health') || c.includes('sport') || c.includes('recreation')) return '#14b8a6'; // teal
  if (c.includes('nonprofit')) return '#6366f1'; // indigo
  if (c.includes('tech') || c.includes('app') || c.includes('data center')) return '#64748b'; // slate
  return '#6b7280'; // gray default
}

/** Map raw category string → filter group key */
function bizGroupKey(category: string): string {
  const c = category.toLowerCase();
  if (/general contractor|gc|modular|demolition|excavat|heavy civil|electrical|mechanical|specialty|low voltage|renewables|mep|plumbing|civil contractor/.test(c)) return 'contractor';
  if (/developer|commercial real estate|private equity|investor/.test(c)) return 'developer';
  if (/architect/.test(c)) return 'architecture';
  if (/engineer|civil|structural|geotech|building systems|building products/.test(c)) return 'engineering';
  if (/brokerage/.test(c)) return 'brokerage';
  if (/restaurant|food|bar|dessert|entertainment/.test(c)) return 'food';
  if (/retail|fitness|health|sport|recreation|mercantile/.test(c)) return 'retail';
  return 'other';
}

const BIZ_GROUPS: { key: string; label: string; color: string }[] = [
  { key: 'contractor',   label: 'Contractor',    color: '#f97316' },
  { key: 'developer',    label: 'Developer',      color: '#8b5cf6' },
  { key: 'architecture', label: 'Architecture',   color: '#3b82f6' },
  { key: 'engineering',  label: 'Engineering',    color: '#0ea5e9' },
  { key: 'brokerage',    label: 'Brokerage',      color: '#10b981' },
  { key: 'food',         label: 'Food & Drink',   color: '#ec4899' },
  { key: 'retail',       label: 'Retail/Sports',  color: '#f59e0b' },
  { key: 'other',        label: 'Other',          color: '#6b7280' },
];

const BUSINESS_DIRECTORY: BizEntry[] = (businessDirectoryRaw as BizEntry[]).filter(
  b => b.coordinates || (b.allLocations && b.allLocations.length > 0)
);

// Expand each business into one feature per location
const ALL_BIZ_GEOJSON: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: BUSINESS_DIRECTORY.flatMap(b => {
    // Use allLocations if present, fall back to single coordinates
    const locs: BizLocation[] = b.allLocations && b.allLocations.length > 0
      ? b.allLocations
      : b.coordinates ? [{ address: b.address ?? '', ...b.coordinates }] : [];

    return locs.map((loc, locIdx) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [loc.lng, loc.lat] },
      properties: {
        id: b.id,
        locIdx,                          // which office location (0 = primary)
        locationAddress: loc.address,    // this specific location's address
        totalLocations: locs.length,
        name: b.name,
        category: b.category,
        groupKey: bizGroupKey(b.category),
        website: b.website,
        about: b.about,
        phone: b.phone,
        email: b.email,
        nakedProperty: b.nakedProperty,
        nakedArticle: b.nakedArticle,
        color: bizCategoryColor(b.category),
        // Secondary offices are slightly dimmer
        opacity: locIdx === 0 ? 0.9 : 0.65,
        hasND: !!(b.nakedProperty || b.nakedArticle),
      },
    }));
  }),
};

// ── Business filter panel ─────────────────────────────────────────────────────

interface BizFilterPanelProps {
  search: string;
  onSearch: (v: string) => void;
  groupFilters: Set<string>;
  onToggleGroup: (key: string) => void;
  onClearFilters: () => void;
  totalVisible: number;
  totalAll: number;
  ndOnly: boolean;
  onToggleNDOnly: () => void;
  visibleBusinesses: BizEntry[];
  onSelectBiz: (biz: BizEntry) => void;
  selectedBizId: number | null;
  focusedBiz: BizEntry | null;
  onClearFocus: () => void;
  onClose: () => void;
}

function BizFilterPanel({ search, onSearch, groupFilters, onToggleGroup, onClearFilters, totalVisible, totalAll, ndOnly, onToggleNDOnly, visibleBusinesses, onSelectBiz, selectedBizId, focusedBiz, onClearFocus, onClose }: BizFilterPanelProps) {
  const hasFilters = groupFilters.size > 0 || !!search || ndOnly;
  const showList = hasFilters || visibleBusinesses.length < totalAll || focusedBiz !== null;
  return (
    <div style={{
      position: 'absolute',
      top: 60,
      right: 52,
      zIndex: 25,
      width: 240,
      background: 'rgba(255,255,255,0.97)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderRadius: 12,
      boxShadow: '0 4px 24px rgba(0,0,0,0.16)',
      border: '1px solid rgba(0,0,0,0.08)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      maxHeight: 'calc(100vh - 180px)',
    }}>
      {/* Header */}
      <div style={{ padding: '10px 12px 8px', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {focusedBiz ? (
            <>
              <button onClick={onClearFocus} style={{ fontSize: 10, color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M6.5 1.5L2.5 5L6.5 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                All companies
              </button>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1c1c1e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{focusedBiz.name}</div>
              <div style={{ fontSize: 10, color: '#8e8e93' }}>{focusedBiz.allLocations?.length ?? 1} location{(focusedBiz.allLocations?.length ?? 1) !== 1 ? 's' : ''}</div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1c1c1e' }}>Business Directory</div>
              <div style={{ fontSize: 10, color: '#8e8e93', marginTop: 1 }}>
                {totalVisible === totalAll ? `${totalAll} businesses` : `${totalVisible} of ${totalAll} shown`}
              </div>
            </>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {!focusedBiz && hasFilters && (
            <button onClick={onClearFilters} style={{ fontSize: 10, fontWeight: 600, color: '#ff3b30', background: 'rgba(255,59,48,0.08)', border: 'none', cursor: 'pointer', padding: '3px 7px', borderRadius: 5 }}>
              Reset
            </button>
          )}
          <button
            onClick={onClose}
            style={{ width: 22, height: 22, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: 0 }}
            aria-label="Close directory"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 2L8 8M8 2L2 8" stroke="rgba(0,0,0,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Search + chips — hidden when focused on one company */}
      {!focusedBiz && <><div style={{ padding: '8px 10px 6px', flexShrink: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(0,0,0,0.05)', borderRadius: 8, padding: '6px 9px',
        }}>
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" style={{ flexShrink: 0, color: '#8e8e93' }}>
            <circle cx="5" cy="5" r="3.5" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M7.5 7.5L10 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <input
            value={search}
            onChange={e => onSearch(e.target.value)}
            placeholder="Search businesses…"
            style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 12, color: '#1c1c1e', fontFamily: 'inherit' }}
          />
          {search && (
            <button onClick={() => onSearch('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#8e8e93', padding: 0, display: 'flex', alignItems: 'center' }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><circle cx="5" cy="5" r="4.5" fill="rgba(0,0,0,0.12)"/><path d="M3 3L7 7M7 3L3 7" stroke="white" strokeWidth="1.2" strokeLinecap="round"/></svg>
            </button>
          )}
        </div>
      </div>

      {/* Category chips */}
      <div style={{ padding: '2px 10px 8px', display: 'flex', flexWrap: 'wrap', gap: 4, flexShrink: 0 }}>
        {BIZ_GROUPS.map(({ key, label, color }) => {
          const active = groupFilters.has(key);
          return (
            <button
              key={key}
              onClick={() => onToggleGroup(key)}
              style={{
                padding: '3px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600, cursor: 'pointer',
                border: `1px solid ${active ? color : 'rgba(0,0,0,0.12)'}`,
                background: active ? color + '18' : 'transparent',
                color: active ? color : '#6c6c70',
                transition: 'all 120ms',
              }}
            >
              <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: color, marginRight: 4, verticalAlign: 'middle' }} />
              {label}
            </button>
          );
        })}
        <button
          onClick={onToggleNDOnly}
          style={{
            padding: '3px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600, cursor: 'pointer',
            border: `1px solid ${ndOnly ? '#f59e0b' : 'rgba(0,0,0,0.12)'}`,
            background: ndOnly ? 'rgba(245,158,11,0.12)' : 'transparent',
            color: ndOnly ? '#d97706' : '#6c6c70',
            transition: 'all 120ms',
          }}
        >
          ★ ND Coverage
        </button>
      </div></>}

      {/* Company list — shown when filtered or focused */}
      {showList && (
        <div style={{ flex: 1, overflowY: 'auto', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          {focusedBiz ? (
            // Focused view: show this company's locations
            (focusedBiz.allLocations ?? (focusedBiz.coordinates ? [{ address: focusedBiz.address ?? '', ...focusedBiz.coordinates }] : [])).map((loc, i) => {
              const color = bizCategoryColor(focusedBiz.category);
              return (
                <button
                  key={i}
                  onClick={() => onSelectBiz(focusedBiz)}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 8,
                    width: '100%', textAlign: 'left', padding: '8px 12px',
                    border: 'none', cursor: 'pointer', background: 'transparent',
                    borderLeft: i === 0 ? `3px solid ${color}` : '3px solid rgba(0,0,0,0.08)',
                    transition: 'background 100ms',
                  }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: i === 0 ? color : 'rgba(0,0,0,0.25)', flexShrink: 0, marginTop: 3 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: i === 0 ? color : '#8e8e93' }}>
                      {i === 0 ? 'Primary Office' : `Office ${i + 1}`}
                    </div>
                    <div style={{ fontSize: 11, color: '#3c3c3e', lineHeight: 1.4, marginTop: 1 }}>{loc.address}</div>
                  </div>
                </button>
              );
            })
          ) : visibleBusinesses.length === 0 ? (
            <div style={{ padding: '14px 12px', fontSize: 11, color: '#8e8e93', textAlign: 'center' }}>
              No businesses match
            </div>
          ) : (
            visibleBusinesses.map(biz => {
              const color = bizCategoryColor(biz.category);
              const isSelected = biz.id === selectedBizId;
              const locationCount = biz.allLocations?.length ?? (biz.coordinates ? 1 : 0);
              return (
                <button
                  key={biz.id}
                  onClick={() => onSelectBiz(biz)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    width: '100%', textAlign: 'left', padding: '7px 12px',
                    border: 'none', cursor: 'pointer',
                    background: isSelected ? color + '12' : 'transparent',
                    borderLeft: isSelected ? `3px solid ${color}` : '3px solid transparent',
                    transition: 'background 100ms',
                  }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#1c1c1e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {biz.name}
                      {(biz.nakedProperty || biz.nakedArticle) && <span style={{ color: '#f59e0b', marginLeft: 4 }}>★</span>}
                    </div>
                    <div style={{ fontSize: 10, color: '#8e8e93', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {biz.category}{locationCount > 1 ? ` · ${locationCount} locations` : ''}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

// ── Business popup component ───────────────────────────────────────────────────

interface BizPopupProps {
  biz: BizEntry;
  parcelLoading: boolean;
  parcelLoaded: boolean;
  onClose: () => void;
  onLoadParcel: (biz: BizEntry) => void;
}

function BizPopup({ biz, parcelLoading, parcelLoaded, onClose, onLoadParcel }: BizPopupProps) {
  const color = bizCategoryColor(biz.category);
  const hasND = !!(biz.nakedProperty || biz.nakedArticle);
  return (
    <div style={{
      position: 'absolute',
      bottom: 80,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 40,
      width: 320,
      background: 'rgba(255,255,255,0.98)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderRadius: 14,
      boxShadow: '0 8px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)',
      border: '1px solid rgba(0,0,0,0.07)',
      overflow: 'hidden',
    }}>
      {/* Color bar + ND badge */}
      <div style={{ height: 4, background: hasND ? 'linear-gradient(90deg, ' + color + ' 60%, #f59e0b 100%)' : color }} />

      {/* Header */}
      <div style={{ padding: '12px 14px 10px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1c1c1e', lineHeight: 1.3 }}>{biz.name}</div>
              {hasND && <span style={{ fontSize: 12, color: '#f59e0b', flexShrink: 0 }} title="Has Naked Denver coverage">★</span>}
            </div>
            <div style={{
              display: 'inline-block', marginTop: 4, padding: '2px 7px', borderRadius: 4,
              background: color + '18', border: `1px solid ${color}40`,
              fontSize: 10, fontWeight: 600, color: color, letterSpacing: '0.03em',
            }}>
              {biz.category}
            </div>
          </div>
          <button onClick={onClose} style={{
            flexShrink: 0, width: 22, height: 22, borderRadius: '50%', border: 'none',
            background: 'rgba(0,0,0,0.07)', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', color: '#666', marginTop: 1,
          }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1.5 1.5L8.5 8.5M8.5 1.5L1.5 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Details */}
      <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {biz.address && (
          <div style={{ display: 'flex', gap: 7, alignItems: 'flex-start' }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0, marginTop: 1, color: '#8e8e93' }}>
              <path d="M6 1C4.067 1 2.5 2.567 2.5 4.5c0 2.5 3.5 6.5 3.5 6.5s3.5-4 3.5-6.5C9.5 2.567 7.933 1 6 1z" stroke="currentColor" strokeWidth="1.2"/>
              <circle cx="6" cy="4.5" r="1.25" stroke="currentColor" strokeWidth="1.2"/>
            </svg>
            <span style={{ fontSize: 11, color: '#3c3c3e', lineHeight: 1.4 }}>{biz.address}</span>
          </div>
        )}
        {biz.phone && (
          <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0, color: '#8e8e93' }}>
              <path d="M2 2.5C2 2.5 3 1 3.5 1c.5 0 2 2.5 2 2.5s0 1-1 1.5c.667 1.333 1.5 2.167 2.5 2.5C7.5 6.5 8 6 8 6s2.5 1.5 2.5 2 -1.5 3.5-1.5 3.5C4 11 1 7 2 2.5z" stroke="currentColor" strokeWidth="1.2"/>
            </svg>
            <span style={{ fontSize: 11, color: '#3c3c3e' }}>{biz.phone}</span>
          </div>
        )}
        {biz.about && (
          <div style={{ fontSize: 11, color: '#6c6c70', lineHeight: 1.5, maxHeight: 60, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as React.CSSProperties['WebkitBoxOrient'] }}>
            {biz.about}
          </div>
        )}

        {/* Links + parcel button */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 2 }}>
          {biz.website && (
            <a href={biz.website} target="_blank" rel="noopener noreferrer" style={{
              display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 9px',
              borderRadius: 6, background: 'rgba(0,113,227,0.08)', border: '1px solid rgba(0,113,227,0.2)',
              fontSize: 11, fontWeight: 600, color: '#0071e3', textDecoration: 'none',
            }}>
              Website ↗
            </a>
          )}
          {biz.nakedProperty && (
            <a href={biz.nakedProperty} target="_blank" rel="noopener noreferrer" style={{
              display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 9px',
              borderRadius: 6, background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)',
              fontSize: 11, fontWeight: 600, color: '#8b5cf6', textDecoration: 'none',
            }}>
              ND Property ↗
            </a>
          )}
          {biz.nakedArticle && (
            <a href={biz.nakedArticle} target="_blank" rel="noopener noreferrer" style={{
              display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 9px',
              borderRadius: 6, background: 'rgba(236,72,153,0.08)', border: '1px solid rgba(236,72,153,0.2)',
              fontSize: 11, fontWeight: 600, color: '#db2777', textDecoration: 'none',
            }}>
              ND Article ↗
            </a>
          )}
          {/* Show Parcel button — visible for any business with an address */}
          {biz.address && (
            <button
              onClick={() => onLoadParcel(biz)}
              disabled={parcelLoading || parcelLoaded}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 9px',
                borderRadius: 6, border: `1px solid ${parcelLoaded ? 'rgba(52,199,89,0.3)' : 'rgba(245,158,11,0.3)'}`,
                background: parcelLoaded ? 'rgba(52,199,89,0.08)' : 'rgba(245,158,11,0.08)',
                fontSize: 11, fontWeight: 600,
                color: parcelLoaded ? '#16a34a' : '#d97706',
                cursor: parcelLoading || parcelLoaded ? 'default' : 'pointer',
              }}
            >
              {parcelLoading ? 'Loading…' : parcelLoaded ? '✓ Parcel Loaded' : '⬡ Show Parcel'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Multi-select list panel ───────────────────────────────────────────────────

import type { ParcelFeature } from '../data/parcelTypes';

interface MultiSelectPanelProps {
  parcels: ParcelFeature[];
  loading: boolean;
  onRemove: (id: string) => void;
  onClear: () => void;
}

function MultiSelectPanel({ parcels, loading, onRemove, onClear }: MultiSelectPanelProps) {
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: 300,
      maxHeight: '100%',
      zIndex: 20,
      display: 'flex',
      flexDirection: 'column',
      background: 'rgba(255,255,255,0.97)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderRight: '1px solid var(--ap-sep)',
      boxShadow: '4px 0 32px rgba(0,0,0,0.12)',
    }}>
      {/* Header */}
      <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid var(--ap-sep)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ap-t1)' }}>
              Selected Parcels
              {loading && (
                <span style={{ display: 'inline-block', width: 12, height: 12, marginLeft: 8, borderRadius: '50%', border: '2px solid rgba(0,0,0,0.1)', borderTopColor: 'var(--ap-blue)', animation: 'spin 0.8s linear infinite', verticalAlign: 'middle' }} />
              )}
            </div>
            <div style={{ fontSize: 11, color: 'var(--ap-t3)', marginTop: 1 }}>
              {parcels.length === 0 ? 'Click parcels on the map to add them' : `${parcels.length} parcel${parcels.length !== 1 ? 's' : ''} selected`}
            </div>
          </div>
          {parcels.length > 0 && (
            <button
              onClick={onClear}
              style={{ fontSize: 11, fontWeight: 600, color: 'var(--ap-red)', background: 'rgba(255,59,48,0.08)', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 6 } as React.CSSProperties}
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Parcel list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: parcels.length ? '8px 0' : '20px 16px' }}>
        {parcels.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--ap-t3)', fontSize: 12, lineHeight: 1.6 }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🗺️</div>
            Click any parcel on the map to add it to your selection.
            <div style={{ marginTop: 8, fontSize: 11 }}>Click an already-selected parcel to remove it.</div>
          </div>
        ) : (
          parcels.map((p, i) => {
            const c = MULTI_COLORS[i % MULTI_COLORS.length];
            return (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '9px 16px',
                  borderBottom: '1px solid var(--ap-sep)',
                }}
              >
                {/* Color swatch with index */}
                <div style={{
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 1,
                  background: c.fill, border: `2px solid ${c.line}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 800, color: c.label,
                }}>
                  {i + 1}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ap-t1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.location.situsAddress || p.identity.apn}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--ap-t3)', marginTop: 1 }}>
                    APN: {p.identity.apn}
                  </div>
                  {p.identity.sqft && (
                    <div style={{ fontSize: 11, color: 'var(--ap-t3)' }}>
                      {p.identity.sqft.toLocaleString()} sf · {p.location.county} Co.
                    </div>
                  )}
                </div>

                {/* Remove */}
                <button
                  onClick={() => onRemove(p.id)}
                  style={{ flexShrink: 0, width: 20, height: 20, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.06)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ap-t3)', marginTop: 1 }}
                >
                  <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                    <path d="M1.5 1.5L7.5 7.5M7.5 1.5L1.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Footer hint */}
      {parcels.length > 0 && (
        <div style={{ padding: '10px 16px', borderTop: '1px solid var(--ap-sep)', fontSize: 11, color: 'var(--ap-t3)', flexShrink: 0 }}>
          Click a highlighted parcel to deselect it. Use OS screenshot (⌘⇧4) to capture.
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ParcelMap() {
  const mapRef = useRef<MapRef>(null);

  const [parcelState, setParcelState] = useState<ParcelState>({ status: 'idle' });
  const [markerPos, setMarkerPos] = useState<{ lng: number; lat: number } | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchedAddress, setSearchedAddress] = useState('');
  const [showHint, setShowHint] = useState(true);
  const [neighbourhood, setNeighbourhood] = useState<string | null>(null);
  const [mapMode, setMapMode] = useState<'street' | 'satellite'>('street');
  const [measureMode, setMeasureMode] = useState<'off' | 'line' | 'area'>('off');
  const [measurePoints, setMeasurePoints] = useState<LngLat[]>([]);
  const [denverZoning, setDenverZoning] = useState<DenverZoningRaw | null>(null);
  const [auroraZoning, setAuroraZoning] = useState<AuroraZoningRaw | null>(null);
  const [centennialZoning, setCentennialZoning] = useState<CentennialZoningRaw | null>(null);
  const [douglasZoning, setDouglasZoning] = useState<DouglasZoningRaw | null>(null);
  const [jeffersonZoning, setJeffersonZoning] = useState<JeffersonZoningRaw | null>(null);
  const [larimerZoning, setLarimerZoning] = useState<LarimerZoningRaw | null>(null);
  const [elpasoZoning, setElPasoZoning] = useState<ElPasoZoningRaw | null>(null);
  const [clearcreekZoning, setClearCreekZoning] = useState<ClearCreekZoningRaw | null>(null);
  const [lakewoodZoning, setLakewoodZoning] = useState<LakewoodZoningRaw | null>(null);
  const [arvadaZoning, setArvadaZoning] = useState<ArvadaZoningRaw | null>(null);
  const [greenwoodvillageZoning, setGreenwoodVillageZoning] = useState<GreenwoodVillageZoningRaw | null>(null);
  const [littletonZoning, setLittletonZoning] = useState<LittletonZoningRaw | null>(null);
  const [thorntonZoning, setThorntonZoning] = useState<ThorntonZoningRaw | null>(null);
  const [arapahoeZoning, setArapahoeZoning] = useState<ArapahoeZoningRaw | null>(null);
  const [broomfieldZoning, setBroomfieldZoning] = useState<BroomfieldZoningRaw | null>(null);
  const [boulderCountyZoning, setBoulderCountyZoning] = useState<BoulderCountyZoningRaw | null>(null);
  const [weldZoning, setWeldZoning] = useState<WeldZoningRaw | null>(null);
  const [puebloCountyZoning, setPuebloCountyZoning] = useState<PuebloCountyZoningRaw | null>(null);
  const [adamsZoning, setAdamsZoning] = useState<AdamsZoningRaw | null>(null);
  const [denverBuilding, setDenverBuilding] = useState<DenverBuildingData | null>(null);
  const [denverValuation, setDenverValuation] = useState<DenverParcelValuationData | null>(null);
  const [douglasDetail, setDouglasDetail] = useState<DouglasParcelData | null>(null);
  const [arapahoeDetail, setArapahoeDetail] = useState<ArapahoeParcelData | null>(null);
  const [jeffersonDetail, setJeffersonDetail] = useState<JeffersonParcelData | null>(null);
  const [showFloodZones, setShowFloodZones] = useState(false);
  const [showWildfireRisk, setShowWildfireRisk] = useState(false);
  const [showZoning, setShowZoning] = useState(false);
  const [showCountyBoundaries, setShowCountyBoundaries] = useState(false);
  const [countyBoundariesGeoJSON, setCountyBoundariesGeoJSON] = useState<GeoJSON.FeatureCollection | null>(null);
  const [showMunicipalBoundaries, setShowMunicipalBoundaries] = useState(false);
  const [municipalBoundariesGeoJSON, setMunicipalBoundariesGeoJSON] = useState<GeoJSON.FeatureCollection | null>(null);
  const [showDenverNeighborhoods, setShowDenverNeighborhoods] = useState(false);
  const [denverNeighborhoodsGeoJSON, setDenverNeighborhoodsGeoJSON] = useState<GeoJSON.FeatureCollection | null>(null);
  const [boundaryPopup, setBoundaryPopup] = useState<{ name: string; label: string; lat: number; lng: number } | null>(null);
  const [showBusinessDir, setShowBusinessDir] = useState(false);
  const [selectedBiz, setSelectedBiz] = useState<BizEntry | null>(null);
  const [bizSearch, setBizSearch] = useState('');
  const [bizGroupFilters, setBizGroupFilters] = useState<Set<string>>(new Set());
  const [bizNDOnly, setBizNDOnly] = useState(false);
  const [focusedBizId, setFocusedBizId] = useState<number | null>(null);
  const [ndParcels, setNdParcels] = useState<GeoJSON.FeatureCollection>({ type: 'FeatureCollection', features: [] });
  const [ndParcelLoadingId, setNdParcelLoadingId] = useState<number | null>(null);
  const [ndParcelLoadedIds, setNdParcelLoadedIds] = useState<Set<number>>(new Set());
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedParcels, setSelectedParcels] = useState<ParcelFeature[]>([]);
  const [multiSelectLoading, setMultiSelectLoading] = useState(false);

  const panelOpen = !multiSelectMode && (parcelState.status === 'loaded' || parcelState.status === 'not_found');
  const leftPanelOpen = multiSelectMode || panelOpen;
  const leftPanelWidth = multiSelectMode ? 300 : 380;
  const feature = parcelState.status === 'loaded' ? parcelState.feature : null;

  const totalDistanceM = useMemo(() => {
    if (measurePoints.length < 2) return 0;
    let d = 0;
    for (let i = 1; i < measurePoints.length; i++) d += haversineM(measurePoints[i - 1], measurePoints[i]);
    return d;
  }, [measurePoints]);

  const totalAreaM2 = useMemo(() =>
    measureMode === 'area' && measurePoints.length >= 3 ? calcAreaM2(measurePoints) : 0,
    [measurePoints, measureMode]
  );

  const measuringActive = measureMode !== 'off';

  // ── Fetch parcel for multi-select ────────────────────────────────────────

  const fetchParcelForMultiSelect = useCallback(async (lng: number, lat: number) => {
    setMultiSelectLoading(true);
    try {
      const parcel = await queryParcelByPoint(lng, lat);
      if (!parcel) return;
      setSelectedParcels(prev => {
        const exists = prev.find(p => p.identity.apn === parcel.identity.apn);
        if (exists) return prev.filter(p => p.identity.apn !== parcel.identity.apn);
        return [...prev, parcel];
      });
    } catch (err) {
      console.warn('[MultiSelect] parcel fetch failed:', err);
    } finally {
      setMultiSelectLoading(false);
    }
  }, []);

  // ── Fetch parcel for a lat/lng ────────────────────────────────────────────

  const fetchParcel = useCallback(async (lng: number, lat: number, addr?: string) => {
    setShowHint(false);
    setMarkerPos({ lng, lat });
    setParcelState({ status: 'loading', lat, lng });
    setNeighbourhood(null);
    setDenverZoning(null);
    setAuroraZoning(null);
    setCentennialZoning(null);
    setDouglasZoning(null);
    setJeffersonZoning(null);
    setLarimerZoning(null);
    setElPasoZoning(null);
    setClearCreekZoning(null);
    setLakewoodZoning(null);
    setArvadaZoning(null);
    setGreenwoodVillageZoning(null);
    setLittletonZoning(null);
    setThorntonZoning(null);
    setArapahoeZoning(null);
    setBroomfieldZoning(null);
    setBoulderCountyZoning(null);
    setWeldZoning(null);
    setPuebloCountyZoning(null);
    setAdamsZoning(null);
    setDenverBuilding(null);
    setDenverValuation(null);
    setDouglasDetail(null);
    setArapahoeDetail(null);
    setJeffersonDetail(null);
    setSearchError(null);

    // Fly to location
    mapRef.current?.flyTo({
      center: [lng, lat],
      zoom: 16,
      duration: 1400,
      essential: true,
    });

    try {
      // Run parcel lookup, reverse geocode, and city/county zoning queries all in parallel
      const [parcelResult, nbResult, denverResult, auroraResult, centennialResult, douglasResult, jeffersonResult, larimerResult, elpasoResult, clearcreekResult, lakewoodResult, arvadaResult, gvResult, littletonResult, thorntonResult, arapahoeResult, broomfieldResult, boulderCountyResult, weldResult, puebloCountyResult, adamsResult] = await Promise.allSettled([
        queryParcelByPoint(lng, lat),
        reverseGeocodeNeighborhood(lat, lng),
        queryDenverZoning(lat, lng),
        queryAuroraZoning(lat, lng),
        queryCentennialZoning(lat, lng),
        queryDouglasZoning(lat, lng),
        queryJeffersonZoning(lat, lng),
        queryLarimerZoning(lat, lng),
        queryElPasoZoning(lat, lng),
        queryClearCreekZoning(lat, lng),
        queryLakewoodZoning(lat, lng),
        queryArvadaZoning(lat, lng),
        queryGreenwoodVillageZoning(lat, lng),
        queryLittletonZoning(lat, lng),
        queryThorntonZoning(lat, lng),
        queryArapahoeZoning(lat, lng),
        queryBroomfieldZoning(lat, lng),
        queryBoulderCountyZoning(lat, lng),
        queryWeldZoning(lat, lng),
        queryPuebloCountyZoning(lat, lng),
        queryAdamsZoning(lat, lng),
      ]);

      const parcel = parcelResult.status === 'fulfilled' ? parcelResult.value : null;
      const nb = nbResult.status === 'fulfilled' ? nbResult.value : null;
      const dz = denverResult.status === 'fulfilled' ? denverResult.value : null;
      const az = auroraResult.status === 'fulfilled' ? auroraResult.value : null;
      const cz = centennialResult.status === 'fulfilled' ? centennialResult.value : null;
      const dgz = douglasResult.status === 'fulfilled' ? douglasResult.value : null;
      const jfz = jeffersonResult.status === 'fulfilled' ? jeffersonResult.value : null;
      const lrz = larimerResult.status === 'fulfilled' ? larimerResult.value : null;
      const epz = elpasoResult.status === 'fulfilled' ? elpasoResult.value : null;
      const ccz = clearcreekResult.status === 'fulfilled' ? clearcreekResult.value : null;
      setNeighbourhood(nb);
      setDenverZoning(dz?.zoneDistrict ? dz : null);
      setAuroraZoning(az?.districtId ? az : null);
      setCentennialZoning(cz?.landUse ? cz : null);
      setDouglasZoning(dgz?.zoneType ? dgz : null);
      setJeffersonZoning(jfz?.zoneCode ? jfz : null);
      setLarimerZoning(lrz?.zoneCode ? lrz : null);
      setElPasoZoning(epz?.zoneCode ? epz : null);
      setClearCreekZoning(ccz?.currZone ? ccz : null);
      const lkw = lakewoodResult.status === 'fulfilled' ? lakewoodResult.value : null;
      setLakewoodZoning(lkw?.zoneCode ? lkw : null);
      const arv = arvadaResult.status === 'fulfilled' ? arvadaResult.value : null;
      setArvadaZoning(arv?.zoneCode ? arv : null);
      const gv = gvResult.status === 'fulfilled' ? gvResult.value : null;
      setGreenwoodVillageZoning(gv?.zoneCode ? gv : null);
      const ltl = littletonResult.status === 'fulfilled' ? littletonResult.value : null;
      setLittletonZoning(ltl?.zoneCode ? ltl : null);
      const thr = thorntonResult.status === 'fulfilled' ? thorntonResult.value : null;
      setThorntonZoning(thr?.zoneCode ? thr : null);
      const arap = arapahoeResult.status === 'fulfilled' ? arapahoeResult.value : null;
      setArapahoeZoning(arap?.zoneCode ? arap : null);
      const broom = broomfieldResult.status === 'fulfilled' ? broomfieldResult.value : null;
      setBroomfieldZoning(broom?.zoneCode ? broom : null);
      const boco = boulderCountyResult.status === 'fulfilled' ? boulderCountyResult.value : null;
      setBoulderCountyZoning(boco?.zoneCode ? boco : null);
      const weld = weldResult.status === 'fulfilled' ? weldResult.value : null;
      setWeldZoning(weld?.zoneCode ? weld : null);
      const pueblo = puebloCountyResult.status === 'fulfilled' ? puebloCountyResult.value : null;
      setPuebloCountyZoning(pueblo?.zoneCode ? pueblo : null);
      const adams = adamsResult.status === 'fulfilled' ? adamsResult.value : null;
      setAdamsZoning(adams?.zoneCode ? adams : null);

      if (parcel) {
        setParcelState({ status: 'loaded', feature: parcel });
        // Fetch county assessor detail in the background (non-blocking)
        const county = parcel.location.county;
        const apn = parcel.identity.apn;
        if (county === 'Denver') {
          fetchDenverBuilding(apn).then(setDenverBuilding);
          fetchDenverValuation(apn).then(setDenverValuation);
        } else if (county === 'Douglas') {
          fetchDouglasDetail(apn).then(setDouglasDetail);
        } else if (county === 'Arapahoe') {
          fetchArapahoeDetail(apn).then(setArapahoeDetail);
        } else if (county === 'Jefferson') {
          fetchJeffersonDetail(apn).then(setJeffersonDetail);
        }
      } else {
        setParcelState({ status: 'not_found', lat, lng, address: addr });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Parcel lookup failed.';
      setParcelState({ status: 'not_found', lat, lng, address: addr });
      console.warn('[ParcelMap] ESRI query failed:', msg);
    }
  }, []);

  // ── Address search ────────────────────────────────────────────────────────

  const handleSearch = useCallback(async (address: string) => {
    setSearching(true);
    setSearchError(null);
    setSearchedAddress(address);

    try {
      const { lat, lng } = await geocodeAddress(address);
      await fetchParcel(lng, lat, address);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Geocoding failed.';
      setSearchError(msg);
      setParcelState({ status: 'idle' });
    } finally {
      setSearching(false);
    }
  }, [fetchParcel]);

  // ── Map click ─────────────────────────────────────────────────────────────

  const handleMapClick = useCallback((e: MapLayerMouseEvent) => {
    if (measureMode !== 'off') {
      setMeasurePoints(prev => [...prev, [e.lngLat.lng, e.lngLat.lat]]);
      return;
    }
    if (multiSelectMode) {
      fetchParcelForMultiSelect(e.lngLat.lng, e.lngLat.lat);
      return;
    }
    // Check if a business cluster or pin was clicked
    if (showBusinessDir && mapRef.current) {
      // Cluster click → zoom in
      const clusters = mapRef.current.queryRenderedFeatures(e.point, { layers: ['biz-clusters'] });
      if (clusters.length > 0) {
        const zoom = mapRef.current.getZoom();
        mapRef.current.flyTo({ center: e.lngLat, zoom: zoom + 2, duration: 600, essential: true });
        return;
      }
      // Individual pin click
      const pins = mapRef.current.queryRenderedFeatures(e.point, { layers: ['biz-circles'] });
      if (pins.length > 0) {
        const props = pins[0].properties as { id: number };
        const match = BUSINESS_DIRECTORY.find(b => b.id === props.id);
        if (match) { setSelectedBiz(match); return; }
      }
    }
    setSelectedBiz(null);
    // Check if a boundary layer was clicked (county, city/town, Denver neighborhood)
    if (mapRef.current) {
      const activeBoundaryLayers: string[] = [
        ...(showCountyBoundaries ? ['co-county-fill'] : []),
        ...(showMunicipalBoundaries ? ['co-municipal-fill'] : []),
        ...(showDenverNeighborhoods ? ['denver-nbhd-fill'] : []),
      ];
      if (activeBoundaryLayers.length > 0) {
        const hits = mapRef.current.queryRenderedFeatures(e.point, { layers: activeBoundaryLayers });
        if (hits.length > 0) {
          const props = hits[0].properties as Record<string, string>;
          const layerId = hits[0].layer?.id ?? '';
          const name = props['COUNTY'] ?? props['NAME20'] ?? props['NBHD_NAME'] ?? 'Unknown';
          const label = layerId === 'co-county-fill' ? 'County' : layerId === 'co-municipal-fill' ? 'Municipality' : 'Neighborhood';
          setBoundaryPopup({ name, label, lat: e.lngLat.lat, lng: e.lngLat.lng });
          return;
        }
      }
    }
    setBoundaryPopup(null);
    fetchParcel(e.lngLat.lng, e.lngLat.lat);
  }, [fetchParcel, fetchParcelForMultiSelect, measureMode, multiSelectMode, showBusinessDir, showCountyBoundaries, showMunicipalBoundaries, showDenverNeighborhoods]);

  // ── Close panel ───────────────────────────────────────────────────────────

  const handleClose = useCallback(() => {
    setParcelState({ status: 'idle' });
    setMarkerPos(null);
    setNeighbourhood(null);
    setDenverZoning(null);
    setShowHint(true);
  }, []);

  // ── GeoJSON for selected parcel polygon ───────────────────────────────────

  const parcelGeoJSON: GeoJSON.FeatureCollection | null =
    parcelState.status === 'loaded'
      ? {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            geometry: parcelState.feature.geometry as GeoJSON.Geometry,
            properties: {},
          }],
        }
      : null;

  // ── GeoJSON for multi-select parcel polygons ──────────────────────────────

  const multiParcelGeoJSON: GeoJSON.FeatureCollection | null = useMemo(() => {
    if (selectedParcels.length === 0) return null;
    return {
      type: 'FeatureCollection',
      features: selectedParcels.map((p, i) => {
        const c = MULTI_COLORS[i % MULTI_COLORS.length]!;
        return {
          type: 'Feature' as const,
          geometry: p.geometry as GeoJSON.Geometry,
          properties: { colorFill: c.fill, colorLine: c.line },
        };
      }),
    };
  }, [selectedParcels]);

  // ── Filtered business directory GeoJSON ──────────────────────────────────

  const filteredBizGeoJSON = useMemo((): GeoJSON.FeatureCollection => {
    // When a company is focused from the list, show only its locations
    if (focusedBizId !== null) {
      const features = ALL_BIZ_GEOJSON.features.filter(f => f.properties!.id === focusedBizId);
      return { type: 'FeatureCollection', features };
    }
    const q = bizSearch.trim().toLowerCase();
    const features = ALL_BIZ_GEOJSON.features.filter(f => {
      const p = f.properties!;
      if (q && !p.name.toLowerCase().includes(q)) return false;
      if (bizGroupFilters.size > 0 && !bizGroupFilters.has(p.groupKey)) return false;
      if (bizNDOnly && !p.hasND) return false;
      return true;
    });
    return { type: 'FeatureCollection', features };
  }, [bizSearch, bizGroupFilters, bizNDOnly, focusedBizId]);

  // ── Load ND parcel polygon for a business ─────────────────────────────────

  const handleLoadNDParcel = useCallback(async (biz: BizEntry) => {
    if (!biz.coordinates || ndParcelLoadedIds.has(biz.id)) return;
    setNdParcelLoadingId(biz.id);
    try {
      const parcel = await queryParcelByPoint(biz.coordinates.lng, biz.coordinates.lat);
      if (!parcel) return;
      const newFeature: GeoJSON.Feature = {
        type: 'Feature',
        geometry: parcel.geometry as GeoJSON.Geometry,
        properties: { bizId: biz.id, bizName: biz.name },
      };
      setNdParcels(prev => ({ type: 'FeatureCollection', features: [...prev.features, newFeature] }));
      setNdParcelLoadedIds(prev => new Set([...prev, biz.id]));
      // Fly to the parcel
      mapRef.current?.flyTo({ center: [biz.coordinates.lng, biz.coordinates.lat], zoom: 17, duration: 900, essential: true });
    } finally {
      setNdParcelLoadingId(null);
    }
  }, [ndParcelLoadedIds]);

  // ── GeoJSON for measurement layers ────────────────────────────────────────

  const measurePtsGeoJSON: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: measurePoints.map(([lng, lat], i) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [lng, lat] },
      properties: { index: i },
    })),
  };

  const measureLineGeoJSON: GeoJSON.FeatureCollection | null = measurePoints.length >= 2
    ? {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: measurePoints },
          properties: {},
        }],
      }
    : null;

  const measureAreaGeoJSON: GeoJSON.FeatureCollection | null =
    measureMode === 'area' && measurePoints.length >= 3
      ? {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [[...measurePoints, measurePoints[0]]],
            },
            properties: {},
          }],
        }
      : null;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>

      {/* ── Map ── */}
      <Map
        ref={mapRef}
        initialViewState={CO_INITIAL}
        mapStyle={mapMode === 'satellite' ? MAP_STYLE_SATELLITE : MAP_STYLE_STREET}
        style={{ width: '100%', height: '100%' }}
        cursor="crosshair"
        onClick={handleMapClick}
        attributionControl={false}
      >
        {/* Parcel polygon (single-select) */}
        {parcelGeoJSON && (
          <Source id="parcel" type="geojson" data={parcelGeoJSON}>
            <Layer {...PARCEL_FILL_LAYER} />
            <Layer {...PARCEL_LINE_LAYER} />
          </Source>
        )}

        {/* Multi-select parcel polygons */}
        {multiParcelGeoJSON && (
          <Source id="multi-parcel" type="geojson" data={multiParcelGeoJSON}>
            <Layer
              id="multi-parcel-fill"
              type="fill"
              paint={{ 'fill-color': ['get', 'colorFill'] as unknown as string, 'fill-opacity': 1 }}
            />
            <Layer
              id="multi-parcel-line"
              type="line"
              paint={{ 'line-color': ['get', 'colorLine'] as unknown as string, 'line-width': 2.5, 'line-opacity': 0.95 }}
            />
          </Source>
        )}

        {/* FEMA Flood Zones overlay */}
        {showFloodZones && (
          <Source id="fema-flood" type="raster" tiles={[FEMA_FLOOD_TILES]} tileSize={256}
            attribution="FEMA National Flood Hazard Layer (NFHL)">
            <Layer id="fema-flood-layer" type="raster" paint={{ 'raster-opacity': 0.72 }} />
          </Source>
        )}

        {/* USFS Wildfire Hazard Potential 2023 overlay */}
        {showWildfireRisk && (
          <Source id="wildfire-risk" type="raster" tiles={[WILDFIRE_TILES]} tileSize={256}
            attribution="USFS Wildfire Hazard Potential 2023">
            <Layer id="wildfire-risk-layer" type="raster" paint={{ 'raster-opacity': 0.68 }} />
          </Source>
        )}

        {/* Denver County Zoning Districts overlay */}
        {showZoning && (
          <Source id="denver-zoning" type="raster" tiles={[DENVER_ZONING_TILES]} tileSize={256}
            attribution="City and County of Denver — Zoning Districts">
            <Layer id="denver-zoning-layer" type="raster" paint={{ 'raster-opacity': 0.65 }} />
          </Source>
        )}

        {/* Aurora City Zoning Districts overlay */}
        {showZoning && (
          <Source id="aurora-zoning" type="raster" tiles={[AURORA_ZONING_TILES]} tileSize={256}
            attribution="City of Aurora — Zoning Districts">
            <Layer id="aurora-zoning-layer" type="raster" paint={{ 'raster-opacity': 0.65 }} />
          </Source>
        )}

        {/* Centennial Current Land Use overlay */}
        {showZoning && (
          <Source id="centennial-zoning" type="raster" tiles={[CENTENNIAL_ZONING_TILES]} tileSize={256}
            attribution="City of Centennial — Current Land Use">
            <Layer id="centennial-zoning-layer" type="raster" paint={{ 'raster-opacity': 0.65 }} />
          </Source>
        )}

        {/* Douglas County Zoning overlay */}
        {showZoning && (
          <Source id="douglas-zoning" type="raster" tiles={[DOUGLAS_ZONING_TILES]} tileSize={256}
            attribution="Douglas County — Zoning Districts">
            <Layer id="douglas-zoning-layer" type="raster" paint={{ 'raster-opacity': 0.65 }} />
          </Source>
        )}

        {/* Jefferson County Zoning overlay */}
        {showZoning && (
          <Source id="jefferson-zoning" type="raster" tiles={[JEFFERSON_ZONING_TILES]} tileSize={256}
            attribution="Jefferson County — Zoning Districts">
            <Layer id="jefferson-zoning-layer" type="raster" paint={{ 'raster-opacity': 0.65 }} />
          </Source>
        )}

        {/* Larimer County Zoning overlay */}
        {showZoning && (
          <Source id="larimer-zoning" type="raster" tiles={[LARIMER_ZONING_TILES]} tileSize={256}
            attribution="Larimer County — Zoning Districts">
            <Layer id="larimer-zoning-layer" type="raster" paint={{ 'raster-opacity': 0.65 }} />
          </Source>
        )}

        {/* El Paso County Zoning overlay */}
        {showZoning && (
          <Source id="elpaso-zoning" type="raster" tiles={[ELPASO_ZONING_TILES]} tileSize={256}
            attribution="El Paso County — Zoning Areas">
            <Layer id="elpaso-zoning-layer" type="raster" paint={{ 'raster-opacity': 0.65 }} />
          </Source>
        )}

        {/* Clear Creek County Zoning overlay */}
        {showZoning && (
          <Source id="clearcreek-zoning" type="raster" tiles={[CLEARCREEK_ZONING_TILES]} tileSize={256}
            attribution="Clear Creek County — Zoning Districts">
            <Layer id="clearcreek-zoning-layer" type="raster" paint={{ 'raster-opacity': 0.65 }} />
          </Source>
        )}
        {/* Lakewood Zoning overlay */}
        {showZoning && (
          <Source id="lakewood-zoning" type="raster" tiles={[LAKEWOOD_ZONING_TILES]} tileSize={256}
            attribution="City of Lakewood — Zoning Districts">
            <Layer id="lakewood-zoning-layer" type="raster" paint={{ 'raster-opacity': 0.65 }} />
          </Source>
        )}
        {/* Arvada Zoning overlay */}
        {showZoning && (
          <Source id="arvada-zoning" type="raster" tiles={[ARVADA_ZONING_TILES]} tileSize={256}
            attribution="City of Arvada — Zoning Districts">
            <Layer id="arvada-zoning-layer" type="raster" paint={{ 'raster-opacity': 0.65 }} />
          </Source>
        )}
        {/* Greenwood Village Zoning overlay */}
        {showZoning && (
          <Source id="greenwoodvillage-zoning" type="raster" tiles={[GREENWOODVILLAGE_ZONING_TILES]} tileSize={256}
            attribution="City of Greenwood Village — Zoning Districts">
            <Layer id="greenwoodvillage-zoning-layer" type="raster" paint={{ 'raster-opacity': 0.65 }} />
          </Source>
        )}
        {/* Littleton Zoning overlay */}
        {showZoning && (
          <Source id="littleton-zoning" type="raster" tiles={[LITTLETON_ZONING_TILES]} tileSize={256}
            attribution="City of Littleton — Zoning Districts">
            <Layer id="littleton-zoning-layer" type="raster" paint={{ 'raster-opacity': 0.65 }} />
          </Source>
        )}
        {/* Thornton Zoning overlay */}
        {showZoning && (
          <Source id="thornton-zoning" type="raster" tiles={[THORNTON_ZONING_TILES]} tileSize={256}
            attribution="City of Thornton — Zoning Districts">
            <Layer id="thornton-zoning-layer" type="raster" paint={{ 'raster-opacity': 0.65 }} />
          </Source>
        )}
        {/* Arapahoe County Zoning overlay */}
        {showZoning && (
          <Source id="arapahoe-zoning" type="raster" tiles={[ARAPAHOE_ZONING_TILES]} tileSize={256}
            attribution="Arapahoe County — Zoning Districts (unincorporated)">
            <Layer id="arapahoe-zoning-layer" type="raster" paint={{ 'raster-opacity': 0.65 }} />
          </Source>
        )}
        {/* Boulder County Zoning overlay */}
        {showZoning && (
          <Source id="boulder-county-zoning" type="raster" tiles={[BOULDER_COUNTY_ZONING_TILES]} tileSize={256}
            attribution="Boulder County — Zoning Districts (unincorporated)">
            <Layer id="boulder-county-zoning-layer" type="raster" paint={{ 'raster-opacity': 0.65 }} />
          </Source>
        )}
        {/* Pueblo County Zoning overlay */}
        {showZoning && (
          <Source id="pueblo-county-zoning" type="raster" tiles={[PUEBLO_COUNTY_ZONING_TILES]} tileSize={256}
            attribution="Pueblo County — Zoning Districts (unincorporated)">
            <Layer id="pueblo-county-zoning-layer" type="raster" paint={{ 'raster-opacity': 0.65 }} />
          </Source>
        )}
        {/* Broomfield and Weld — FeatureServer only (no tile export); data appears in parcel panel */}

        {/* Colorado county boundaries overlay */}
        {showCountyBoundaries && countyBoundariesGeoJSON && (
          <Source id="co-county-boundaries" type="geojson" data={countyBoundariesGeoJSON}>
            <Layer id="co-county-fill" type="fill" paint={{ 'fill-color': '#1d4ed8', 'fill-opacity': 0.04 }} />
            <Layer id="co-county-line" type="line" paint={{ 'line-color': '#1d4ed8', 'line-width': 1.5, 'line-opacity': 0.7 }} />
            <Layer
              id="co-county-label"
              type="symbol"
              minzoom={6}
              layout={{
                'text-field': ['get', 'COUNTY'],
                'text-font': ['Noto Sans Regular'],
                'text-size': ['interpolate', ['linear'], ['zoom'], 6, 10, 10, 13],
                'text-anchor': 'center',
                'text-max-width': 8,
                'text-allow-overlap': false,
              }}
              paint={{ 'text-color': '#1d4ed8', 'text-halo-color': '#ffffff', 'text-halo-width': 1.5 }}
            />
          </Source>
        )}

        {/* Colorado municipal boundaries overlay */}
        {showMunicipalBoundaries && municipalBoundariesGeoJSON && (
          <Source id="co-municipal-boundaries" type="geojson" data={municipalBoundariesGeoJSON}>
            <Layer id="co-municipal-fill" type="fill" paint={{ 'fill-color': '#b45309', 'fill-opacity': 0.05 }} />
            <Layer id="co-municipal-line" type="line" paint={{ 'line-color': '#b45309', 'line-width': 1, 'line-opacity': 0.85 }} />
            <Layer
              id="co-municipal-label"
              type="symbol"
              minzoom={8}
              layout={{
                'text-field': ['get', 'NAME20'],
                'text-font': ['Noto Sans Regular'],
                'text-size': ['interpolate', ['linear'], ['zoom'], 8, 9, 13, 12],
                'text-anchor': 'center',
                'text-max-width': 7,
                'text-allow-overlap': false,
              }}
              paint={{ 'text-color': '#92400e', 'text-halo-color': '#ffffff', 'text-halo-width': 1.5 }}
            />
          </Source>
        )}

        {/* Denver neighborhood boundaries overlay */}
        {showDenverNeighborhoods && denverNeighborhoodsGeoJSON && (
          <Source id="denver-neighborhoods" type="geojson" data={denverNeighborhoodsGeoJSON}>
            <Layer id="denver-nbhd-fill" type="fill" paint={{ 'fill-color': '#7c3aed', 'fill-opacity': 0.06 }} />
            <Layer id="denver-nbhd-line" type="line" paint={{ 'line-color': '#7c3aed', 'line-width': 1.5, 'line-opacity': 0.9 }} />
            <Layer
              id="denver-nbhd-label"
              type="symbol"
              minzoom={11}
              layout={{
                'text-field': ['get', 'NBHD_NAME'],
                'text-font': ['Noto Sans Regular'],
                'text-size': ['interpolate', ['linear'], ['zoom'], 11, 9, 14, 12],
                'text-anchor': 'center',
                'text-max-width': 6,
                'text-allow-overlap': false,
              }}
              paint={{ 'text-color': '#6d28d9', 'text-halo-color': '#ffffff', 'text-halo-width': 1.5 }}
            />
          </Source>
        )}

        {/* ND parcel polygons */}
        {ndParcels.features.length > 0 && (
          <Source id="nd-parcels" type="geojson" data={ndParcels}>
            <Layer id="nd-parcels-fill" type="fill" paint={{ 'fill-color': '#f59e0b', 'fill-opacity': 0.18 }} />
            <Layer id="nd-parcels-line" type="line" paint={{ 'line-color': '#d97706', 'line-width': 2.5, 'line-opacity': 0.9 }} />
          </Source>
        )}

        {/* Business directory pins */}
        {showBusinessDir && (
          <Source id="biz-dir" type="geojson" data={filteredBizGeoJSON} cluster clusterMaxZoom={12} clusterRadius={40}>
            {/* Cluster circles */}
            <Layer
              id="biz-clusters"
              type="circle"
              filter={['has', 'point_count']}
              paint={{
                'circle-color': ['step', ['get', 'point_count'], '#6366f1', 10, '#8b5cf6', 30, '#a855f7'],
                'circle-radius': ['step', ['get', 'point_count'], 16, 10, 22, 30, 28],
                'circle-opacity': 0.85,
                'circle-stroke-width': 2,
                'circle-stroke-color': '#fff',
              }}
            />
            <Layer
              id="biz-cluster-count"
              type="symbol"
              filter={['has', 'point_count']}
              layout={{
                'text-field': '{point_count_abbreviated}',
                'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
                'text-size': 12,
              }}
              paint={{ 'text-color': '#fff' }}
            />
            {/* Individual pins — secondary locations are dimmer */}
            <Layer
              id="biz-circles"
              type="circle"
              filter={['!', ['has', 'point_count']]}
              paint={{
                'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 5, 15, 8],
                'circle-color': ['get', 'color'],
                'circle-opacity': ['get', 'opacity'],
                'circle-stroke-width': ['case', ['==', ['get', 'locIdx'], 0], 1.5, 1],
                'circle-stroke-color': '#fff',
              }}
            />
          </Source>
        )}

        {/* Location marker */}
        {markerPos && (
          <Marker longitude={markerPos.lng} latitude={markerPos.lat} anchor="bottom">
            <div
              style={{
                width: 28, height: 28,
                borderRadius: '50% 50% 50% 0',
                transform: 'rotate(-45deg)',
                background: 'linear-gradient(135deg, #0071e3, #0051b3)',
                boxShadow: '0 2px 8px rgba(0,113,227,0.5)',
                border: '2px solid white',
              }}
            />
          </Marker>
        )}

        {/* Loading pulse marker */}
        {parcelState.status === 'loading' && markerPos && (
          <Marker longitude={markerPos.lng} latitude={markerPos.lat}>
            <div
              style={{
                width: 40, height: 40,
                borderRadius: '50%',
                background: 'rgba(0,113,227,0.2)',
                animation: 'pulse 1.4s ease-in-out infinite',
              }}
            />
          </Marker>
        )}

        {/* ── Measurement layers ── */}
        {measuringActive && (
          <>
            {/* Area fill */}
            {measureAreaGeoJSON && (
              <Source id="measure-area" type="geojson" data={measureAreaGeoJSON}>
                <Layer id="measure-area-fill" type="fill" paint={{ 'fill-color': '#f97316', 'fill-opacity': 0.15 }} />
                <Layer id="measure-area-outline" type="line" paint={{ 'line-color': '#f97316', 'line-width': 2, 'line-dasharray': [3, 2] }} />
              </Source>
            )}

            {/* Line segments */}
            {measureLineGeoJSON && (
              <Source id="measure-line" type="geojson" data={measureLineGeoJSON}>
                <Layer id="measure-line-layer" type="line" paint={{ 'line-color': '#f97316', 'line-width': 2.5, 'line-dasharray': [3, 2] }} />
              </Source>
            )}

            {/* Point handles */}
            <Source id="measure-pts" type="geojson" data={measurePtsGeoJSON}>
              <Layer
                id="measure-pts-halo"
                type="circle"
                paint={{ 'circle-radius': 9, 'circle-color': '#fff', 'circle-opacity': 0.7 }}
              />
              <Layer
                id="measure-pts-dot"
                type="circle"
                paint={{ 'circle-radius': 6, 'circle-color': '#f97316', 'circle-stroke-width': 2, 'circle-stroke-color': '#fff' }}
              />
            </Source>
          </>
        )}

        {/* Navigation controls */}
        <NavigationControl position="bottom-right" />

        {/* Boundary name popup */}
        {boundaryPopup && (
          <Popup
            longitude={boundaryPopup.lng}
            latitude={boundaryPopup.lat}
            anchor="bottom"
            onClose={() => setBoundaryPopup(null)}
            closeOnClick={false}
            style={{ zIndex: 10 }}
          >
            <div style={{ padding: '4px 2px', minWidth: 120 }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6b7280', marginBottom: 2 }}>
                {boundaryPopup.label}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>
                {boundaryPopup.name}
              </div>
            </div>
          </Popup>
        )}
      </Map>

      {/* ── Search bar ── */}
      <SearchBar
        onSearch={handleSearch}
        searching={searching}
        error={searchError}
        panelOpen={leftPanelOpen}
      />

      {/* ── Multi-select panel ── */}
      {multiSelectMode && (
        <MultiSelectPanel
          parcels={selectedParcels}
          loading={multiSelectLoading}
          onRemove={(id) => setSelectedParcels(prev => prev.filter(p => p.id !== id))}
          onClear={() => setSelectedParcels([])}
        />
      )}

      {/* ── Parcel panel ── */}
      {!multiSelectMode && (
        <ParcelPanel
          feature={feature}
          open={panelOpen}
          address={searchedAddress}
          neighbourhood={neighbourhood}
          denverZoning={denverZoning}
          auroraZoning={auroraZoning}
          centennialZoning={centennialZoning}
          douglasZoning={douglasZoning}
          jeffersonZoning={jeffersonZoning}
          larimerZoning={larimerZoning}
          elpasoZoning={elpasoZoning}
          clearcreekZoning={clearcreekZoning}
          lakewoodZoning={lakewoodZoning}
          arvadaZoning={arvadaZoning}
          greenwoodvillageZoning={greenwoodvillageZoning}
          littletonZoning={littletonZoning}
          thorntonZoning={thorntonZoning}
          arapahoeZoning={arapahoeZoning}
          broomfieldZoning={broomfieldZoning}
          boulderCountyZoning={boulderCountyZoning}
          weldZoning={weldZoning}
          puebloCountyZoning={puebloCountyZoning}
          denverBuilding={denverBuilding}
          denverValuation={denverValuation}
          douglasDetail={douglasDetail}
          arapahoeDetail={arapahoeDetail}
          jeffersonDetail={jeffersonDetail}
          adamsZoning={adamsZoning}
          onClose={handleClose}
        />
      )}

      {/* ── Measure toolbar ── */}
      <div
        style={{
          position: 'absolute',
          bottom: 40,
          left: leftPanelOpen ? leftPanelWidth + 16 : 16,
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          alignItems: 'flex-start',
          transition: 'left 300ms cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {/* Result card */}
        {measuringActive && measurePoints.length >= 2 && (
          <div style={{
            background: 'rgba(255,255,255,0.97)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: 12,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            border: '1px solid rgba(0,0,0,0.08)',
            padding: '10px 14px',
            minWidth: 200,
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#f97316', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 4 }}>
              {measureMode === 'line' ? 'Line Measurement' : 'Area Measurement'}
            </div>
            {measureMode === 'line' && totalDistanceM > 0 && (
              <>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#1c1c1e' }}>{fmtDistance(totalDistanceM)}</div>
                <div style={{ fontSize: 11, color: '#8e8e93', marginTop: 2 }}>{measurePoints.length} point{measurePoints.length !== 1 ? 's' : ''} · {measurePoints.length - 1} segment{measurePoints.length > 2 ? 's' : ''}</div>
              </>
            )}
            {measureMode === 'area' && measurePoints.length >= 3 && totalAreaM2 > 0 && (
              <>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#1c1c1e' }}>{fmtArea(totalAreaM2)}</div>
                <div style={{ fontSize: 11, color: '#8e8e93', marginTop: 2 }}>
                  Perimeter: {fmtDistance(totalDistanceM + haversineM(measurePoints[measurePoints.length - 1], measurePoints[0]))}
                </div>
                <div style={{ fontSize: 11, color: '#8e8e93' }}>{measurePoints.length} vertices</div>
              </>
            )}
            {measureMode === 'area' && measurePoints.length < 3 && (
              <div style={{ fontSize: 12, color: '#8e8e93' }}>Add {3 - measurePoints.length} more point{3 - measurePoints.length !== 1 ? 's' : ''} to calculate area</div>
            )}
          </div>
        )}

        {/* Mode buttons */}
        <div style={{ display: 'flex', gap: 6 }}>
          {/* Multi-select toggle */}
          <button
            onClick={() => {
              setMultiSelectMode(m => !m);
              if (multiSelectMode) setSelectedParcels([]);
              // Exit measuring mode when entering select mode
              if (!multiSelectMode) { setMeasureMode('off'); setMeasurePoints([]); }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '7px 12px',
              borderRadius: 10,
              border: multiSelectMode ? '1.5px solid #0071e3' : '1.5px solid rgba(0,0,0,0.12)',
              background: multiSelectMode ? 'rgba(0,113,227,0.10)' : 'rgba(255,255,255,0.92)',
              color: multiSelectMode ? '#0051b3' : 'rgba(0,0,0,0.65)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
              transition: 'all 150ms',
            }}
            title={multiSelectMode ? 'Exit multi-select mode' : 'Select multiple parcels'}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <rect x="1" y="1" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
              <rect x="7.5" y="1" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
              <rect x="1" y="7.5" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
              <rect x="7.5" y="7.5" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.4" fill={multiSelectMode ? 'currentColor' : 'none'} fillOpacity="0.3"/>
            </svg>
            Select
          </button>

          {(['line', 'area'] as const).map(mode => {
            const active = measureMode === mode;
            return (
              <button
                key={mode}
                onClick={() => {
                  if (measureMode === mode) {
                    setMeasureMode('off');
                    setMeasurePoints([]);
                  } else {
                    setMeasureMode(mode);
                    setMeasurePoints([]);
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '7px 12px',
                  borderRadius: 10,
                  border: active ? '1.5px solid #f97316' : '1.5px solid rgba(0,0,0,0.12)',
                  background: active ? 'rgba(249,115,22,0.10)' : 'rgba(255,255,255,0.92)',
                  color: active ? '#c2410c' : 'rgba(0,0,0,0.65)',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                  transition: 'all 150ms',
                }}
              >
                {mode === 'line'
                  ? <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1.5 11.5L11.5 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="1.5" cy="11.5" r="1.5" fill="currentColor"/><circle cx="11.5" cy="1.5" r="1.5" fill="currentColor"/></svg>
                  : <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1L12 10H1L6.5 1Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
                }
                {mode === 'line' ? 'Line' : 'Area'}
              </button>
            );
          })}

          {measuringActive && measurePoints.length > 0 && (
            <button
              onClick={() => setMeasurePoints([])}
              style={{
                padding: '7px 10px',
                borderRadius: 10,
                border: '1.5px solid rgba(0,0,0,0.12)',
                background: 'rgba(255,255,255,0.92)',
                color: 'rgba(0,0,0,0.5)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
              }}
              title="Clear measurement"
            >
              Clear
            </button>
          )}
        </div>

        {measuringActive && (
          <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)', paddingLeft: 2 }}>
            {measureMode === 'area' ? 'Click to place vertices · click Line or Area again to exit' : 'Click to place points · click Line again to exit'}
          </div>
        )}
      </div>

      {/* ── Map style toggle ── */}
      <div
        style={{
          position: 'absolute',
          bottom: 40,
          right: 52,
          zIndex: 10,
          display: 'flex',
          borderRadius: 10,
          overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
          border: '1px solid rgba(255,255,255,0.3)',
        }}
      >
        {(['street', 'satellite'] as const).map((mode) => {
          const active = mapMode === mode;
          return (
            <button
              key={mode}
              onClick={() => setMapMode(mode)}
              style={{
                padding: '7px 14px',
                fontSize: 12,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: active ? 'rgba(0,0,0,0.75)' : 'rgba(255,255,255,0.88)',
                color: active ? '#fff' : 'rgba(0,0,0,0.65)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                transition: 'background 150ms, color 150ms',
                letterSpacing: '0.01em',
              }}
            >
              {mode === 'street' ? 'Map' : 'Satellite'}
            </button>
          );
        })}
      </div>

      {/* ── Overlay layer toggles ── */}
      <div style={{
        position: 'absolute',
        bottom: 82,
        right: 52,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: 5,
        alignItems: 'flex-end',
      }}>
        {/* Legend (shown when any overlay is active) */}
        {(showFloodZones || showWildfireRisk) && (
          <div style={{
            background: 'rgba(255,255,255,0.96)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: 10,
            boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
            border: '1px solid rgba(0,0,0,0.08)',
            padding: '8px 12px',
            minWidth: 160,
          }}>
            {showFloodZones && (
              <div style={{ marginBottom: showWildfireRisk ? 8 : 0 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--ap-t3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                  Flood Zones (FEMA)
                </div>
                {[
                  { color: '#4B9FE8', label: 'High Risk (100-yr) — Zone A/AE' },
                  { color: '#A8D4F5', label: 'Moderate (500-yr) — Zone X' },
                  { color: '#E8E8E8', label: 'Minimal Risk — Zone X (unshaded)' },
                ].map(({ color, label }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 2, background: color, border: '1px solid rgba(0,0,0,0.15)', flexShrink: 0 }} />
                    <span style={{ fontSize: 10, color: 'var(--ap-t2)', lineHeight: 1.3 }}>{label}</span>
                  </div>
                ))}
              </div>
            )}
            {showWildfireRisk && (
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--ap-t3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                  Wildfire Hazard Potential (USFS)
                </div>
                {[
                  { color: '#1a9641', label: 'Very Low' },
                  { color: '#a6d96a', label: 'Low' },
                  { color: '#ffffbf', label: 'Moderate' },
                  { color: '#fdae61', label: 'High' },
                  { color: '#d7191c', label: 'Very High' },
                ].map(({ color, label }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 2, background: color, border: '1px solid rgba(0,0,0,0.12)', flexShrink: 0 }} />
                    <span style={{ fontSize: 10, color: 'var(--ap-t2)' }}>{label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Toggle buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          borderRadius: 10,
          overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
          border: '1px solid rgba(255,255,255,0.3)',
        }}>
          {([
            { key: 'directory', label: 'Directory', active: showBusinessDir, color: '#6366f1', toggle: () => { setShowBusinessDir(v => !v); setSelectedBiz(null); } },
            { key: 'flood', label: 'Flood Zones', active: showFloodZones, color: '#4B9FE8', toggle: () => setShowFloodZones(v => !v) },
            { key: 'wildfire', label: 'Wildfire Risk', active: showWildfireRisk, color: '#d7191c', toggle: () => setShowWildfireRisk(v => !v) },
            { key: 'zoning', label: 'Zoning', active: showZoning, color: '#8b5cf6', toggle: () => setShowZoning(v => !v) },
            { key: 'counties', label: 'County Lines', active: showCountyBoundaries, color: '#1d4ed8', toggle: () => {
              if (!showCountyBoundaries && !countyBoundariesGeoJSON) fetchCountyBoundariesGeoJSON().then(d => d && setCountyBoundariesGeoJSON(d));
              setShowCountyBoundaries(v => !v);
            }},
            { key: 'cities', label: 'City/Town Lines', active: showMunicipalBoundaries, color: '#b45309', toggle: () => {
              if (!showMunicipalBoundaries && !municipalBoundariesGeoJSON) fetchMunicipalBoundariesGeoJSON().then(d => d && setMunicipalBoundariesGeoJSON(d));
              setShowMunicipalBoundaries(v => !v);
            }},
            { key: 'denver-hoods', label: 'Denver Neighborhoods', active: showDenverNeighborhoods, color: '#7c3aed', toggle: () => {
              if (!showDenverNeighborhoods && !denverNeighborhoodsGeoJSON) fetchDenverNeighborhoodsGeoJSON().then(d => d && setDenverNeighborhoodsGeoJSON(d));
              setShowDenverNeighborhoods(v => !v);
            }},
          ] as const).map(({ key, label, active, color, toggle }) => (
            <button
              key={key}
              onClick={toggle}
              style={{
                padding: '7px 13px',
                fontSize: 12,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: active ? color : 'rgba(255,255,255,0.88)',
                color: active ? '#fff' : 'rgba(0,0,0,0.65)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                transition: 'background 150ms, color 150ms',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: active ? 'rgba(255,255,255,0.8)' : color,
                flexShrink: 0,
              }} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Business directory filter panel ── */}
      {showBusinessDir && (
        <BizFilterPanel
          search={bizSearch}
          onSearch={setBizSearch}
          groupFilters={bizGroupFilters}
          onToggleGroup={key => setBizGroupFilters(prev => {
            const next = new Set(prev);
            next.has(key) ? next.delete(key) : next.add(key);
            return next;
          })}
          onClearFilters={() => { setBizSearch(''); setBizGroupFilters(new Set()); setBizNDOnly(false); }}
          onClose={() => { setShowBusinessDir(false); setSelectedBiz(null); }}
          totalVisible={filteredBizGeoJSON.features.length}
          totalAll={ALL_BIZ_GEOJSON.features.length}
          ndOnly={bizNDOnly}
          onToggleNDOnly={() => setBizNDOnly(v => !v)}
          visibleBusinesses={focusedBizId !== null ? [] : BUSINESS_DIRECTORY.filter(b => {
            const q = bizSearch.trim().toLowerCase();
            if (q && !b.name.toLowerCase().includes(q)) return false;
            if (bizGroupFilters.size > 0 && !bizGroupFilters.has(bizGroupKey(b.category))) return false;
            if (bizNDOnly && !(b.nakedProperty || b.nakedArticle)) return false;
            return true;
          })}
          onSelectBiz={biz => {
            // Set focus: show only this company on the map
            setFocusedBizId(biz.id);
            setSelectedBiz(biz);
            // Fly to primary location
            const primaryLoc = biz.allLocations?.[0] ?? (biz.coordinates ? { ...biz.coordinates } : null);
            if (primaryLoc) {
              mapRef.current?.flyTo({ center: [primaryLoc.lng, primaryLoc.lat], zoom: 15, duration: 900, essential: true });
            }
          }}
          selectedBizId={selectedBiz?.id ?? null}
          focusedBiz={focusedBizId !== null ? BUSINESS_DIRECTORY.find(b => b.id === focusedBizId) ?? null : null}
          onClearFocus={() => { setFocusedBizId(null); setSelectedBiz(null); }}
        />
      )}

      {/* ── Business directory popup ── */}
      {selectedBiz && (
        <BizPopup
          biz={selectedBiz}
          parcelLoading={ndParcelLoadingId === selectedBiz.id}
          parcelLoaded={ndParcelLoadedIds.has(selectedBiz.id)}
          onClose={() => setSelectedBiz(null)}
          onLoadParcel={handleLoadNDParcel}
        />
      )}

      {/* ── Hint pill ── */}
      {showHint && !panelOpen && <MapHint />}

      {/* ── Loading overlay on panel ── */}
      {parcelState.status === 'loading' && (
        <div
          style={{
            position: 'absolute',
            top: 0, left: 0,
            width: 380, height: '100%',
            zIndex: 22,
            background: 'rgba(255,255,255,0.80)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            transform: 'translateX(0)',
            transition: 'transform 300ms cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          <div
            style={{
              width: 36, height: 36,
              borderRadius: '50%',
              border: '3px solid rgba(0,113,227,0.15)',
              borderTopColor: 'var(--ap-blue)',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <div style={{ fontSize: 13, color: 'var(--ap-t2)', fontWeight: 500 }}>
            Looking up parcel…
          </div>
        </div>
      )}

      {/* ── CSS animations ── */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.8); opacity: 0.15; }
        }
        .maplibregl-ctrl-attrib { display: none !important; }
      `}</style>
    </div>
  );
}
