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

import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import Map, {
  Source,
  Layer,
  Marker,
  NavigationControl,
} from 'react-map-gl/maplibre';
import type { MapRef, MapLayerMouseEvent } from 'react-map-gl/maplibre';

import type { ParcelState, GeoJSONGeometry, DenverBuildingData, DouglasParcelData, ArapahoeParcelData, ArapahoeZoningData, ParcelFeature } from '../data/parcelTypes';
import {
  searchPlaces,
  searchParcels,
  queryParcelByPoint,
  queryParcelsInBounds,
  reverseGeocodeNeighborhood,
  queryDenverZoning,
  queryDenverBuilding,
  queryDouglasParcelData,
  queryArapahoeParcelData,
  queryArapahoeZoning,
  queryAuroraZoning,
  queryCentennialZoning,
  queryCountyBoundaries,
  queryMunicipalBoundaries,
  queryDenverNeighborhoodBoundaries,
} from '../utils/parcelService';
import type { DenverZoningRaw, AuroraZoningRaw, CentennialZoningRaw } from '../utils/parcelService';
import { ParcelPanel, type BoundarySelectionSummary } from './ParcelPanel';
import { NAKED_DENVER_ARTICLES, NAKED_DENVER_MAPPED_ARTICLES, type NakedDenverArticle } from '../data/nakedDenverArticles';

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

const PARCEL_PREVIEW_MIN_ZOOM = 14;

const BOUNDARY_SELECTION_MAX_ZOOM = 13.5;

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

type BoundaryFeature = GeoJSON.Feature<GeoJSON.Geometry, Record<string, unknown>>;

function normalizeCountyName(value: string | null | undefined): string | null {
  if (!value) return null;
  return value
    .trim()
    .toLowerCase()
    .replace(/^city and county of\s+/i, '')
    .replace(/\s+county$/i, '')
    .replace(/\s+/g, ' ')
    .trim() || null;
}

function getBoundaryName(feature: BoundaryFeature | null | undefined): string | null {
  if (!feature?.properties) return null;
  const candidates = [
    feature.properties.name,
    feature.properties.NAME,
    feature.properties.NAME10,
    feature.properties.nbrhd_name,
    feature.properties.NBHD_NAME,
    feature.properties.neighborhood,
    feature.properties.NAMELSAD10,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
  }
  return null;
}

function getCountyDisplayName(feature: BoundaryFeature | null | undefined): string | null {
  const name = getBoundaryName(feature);
  if (!name) return null;
  return /county$/i.test(name) || /city and county/i.test(name) ? name : `${name} County`;
}

function getBaseCountyName(value: string | null | undefined): string | null {
  if (!value) return null;
  return value
    .replace(/^city and county of\s+/i, '')
    .replace(/\s+county$/i, '')
    .trim() || null;
}

function getGeometryCenter(geometry: GeoJSON.Geometry): [number, number] {
  const coords: [number, number][] = [];

  const collect = (value: unknown) => {
    if (!Array.isArray(value)) return;
    if (value.length >= 2 && typeof value[0] === 'number' && typeof value[1] === 'number') {
      coords.push([value[0], value[1]]);
      return;
    }
    for (const child of value) collect(child);
  };

  collect((geometry as { coordinates?: unknown }).coordinates);

  if (coords.length === 0) return CO_INITIAL ? [CO_INITIAL.longitude, CO_INITIAL.latitude] : [-105.55, 39.0];

  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  for (const [lng, lat] of coords) {
    minLng = Math.min(minLng, lng);
    minLat = Math.min(minLat, lat);
    maxLng = Math.max(maxLng, lng);
    maxLat = Math.max(maxLat, lat);
  }

  return [(minLng + maxLng) / 2, (minLat + maxLat) / 2];
}

function pointInRing(point: [number, number], ring: number[][]): boolean {
  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i]?.[0];
    const yi = ring[i]?.[1];
    const xj = ring[j]?.[0];
    const yj = ring[j]?.[1];
    if ([xi, yi, xj, yj].some((value) => typeof value !== 'number')) continue;

    const intersects =
      ((yi > y) !== (yj > y)) &&
      (x < ((xj - xi) * (y - yi)) / (((yj - yi) || Number.EPSILON)) + xi);

    if (intersects) inside = !inside;
  }

  return inside;
}

function geometryContainsPoint(geometry: GeoJSON.Geometry, point: [number, number]): boolean {
  if (geometry.type === 'Polygon') {
    const [outerRing, ...holes] = geometry.coordinates;
    if (!outerRing || !pointInRing(point, outerRing)) return false;
    return !holes.some((ring) => pointInRing(point, ring));
  }

  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.some(([outerRing, ...holes]) => {
      if (!outerRing || !pointInRing(point, outerRing)) return false;
      return !holes.some((ring) => pointInRing(point, ring));
    });
  }

  return false;
}

function findBoundaryFeatureAtPoint(
  featureCollection: GeoJSON.FeatureCollection | null,
  point: [number, number]
): BoundaryFeature | null {
  if (!featureCollection) return null;

  for (const feature of featureCollection.features) {
    if (!feature?.geometry) continue;
    if (geometryContainsPoint(feature.geometry as GeoJSON.Geometry, point)) {
      return feature as BoundaryFeature;
    }
  }

  return null;
}

function buildLabelPoints(
  featureCollection: GeoJSON.FeatureCollection | null,
  nameResolver: (feature: BoundaryFeature) => string | null = getBoundaryName
): GeoJSON.FeatureCollection {
  if (!featureCollection) return { type: 'FeatureCollection', features: [] };

  return {
    type: 'FeatureCollection',
    features: featureCollection.features
      .filter((feature): feature is BoundaryFeature => !!feature.geometry && !!feature.properties)
      .map((feature) => {
        const [lng, lat] = getGeometryCenter(feature.geometry);
        return {
          type: 'Feature' as const,
          geometry: { type: 'Point' as const, coordinates: [lng, lat] },
          properties: {
            ...feature.properties,
            label: nameResolver(feature) ?? '',
          },
        };
      })
      .filter((feature) => typeof feature.properties?.label === 'string' && feature.properties.label.length > 0),
  };
}

type SmartSearchResult =
  | {
      id: string;
      kind: 'parcel';
      title: string;
      subtitle: string;
      detail?: string;
      parcel: ParcelFeature;
      score: number;
    }
  | {
      id: string;
      kind: 'place';
      title: string;
      subtitle: string;
      detail?: string;
      lat: number;
      lng: number;
      score: number;
    }
  | {
      id: string;
      kind: 'business';
      title: string;
      subtitle: string;
      detail?: string;
      business: BizEntry;
      lat: number;
      lng: number;
      score: number;
    }
  | {
      id: string;
      kind: 'article';
      title: string;
      subtitle: string;
      detail?: string;
      article: NakedDenverArticle;
      lat: number;
      lng: number;
      score: number;
    };

// ── Search bar ────────────────────────────────────────────────────────────────

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => Promise<void>;
  results: SmartSearchResult[];
  onSelectResult: (result: SmartSearchResult) => void;
  searching: boolean;
  error: string | null;
  panelOpen: boolean;
}

function SearchBar({ value, onChange, onSearch, results, onSelectResult, searching, error, panelOpen }: SearchBarProps) {
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
            onChange={e => onChange(e.target.value)}
            placeholder="Search address, APN, owner, business, school, park, neighborhood…"
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
              onClick={() => onChange('')}
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

        {results.length > 0 && (
          <div
            style={{
              marginTop: 8,
              background: 'rgba(255,255,255,0.98)',
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
              borderRadius: 12,
              boxShadow: '0 8px 30px rgba(0,0,0,0.14)',
              border: '1px solid rgba(0,0,0,0.08)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '8px 12px', fontSize: 11, fontWeight: 700, color: 'var(--ap-t3)', letterSpacing: '0.05em', textTransform: 'uppercase', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              Search Results
            </div>
            <div style={{ maxHeight: 340, overflowY: 'auto' }}>
              {results.map((result) => (
                <button
                  key={result.id}
                  type="button"
                  onClick={() => onSelectResult(result)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    padding: '10px 12px',
                    borderBottom: '1px solid rgba(0,0,0,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ap-t1)' }}>{result.title}</div>
                    <div style={{ fontSize: 10, color: 'var(--ap-blue)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em', flexShrink: 0 }}>
                      {result.kind}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--ap-t2)', lineHeight: 1.4 }}>{result.subtitle}</div>
                  {result.detail && (
                    <div style={{ fontSize: 10, color: 'var(--ap-t3)', lineHeight: 1.35 }}>{result.detail}</div>
                  )}
                </button>
              ))}
            </div>
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

const COUNTY_FILL_LAYER = {
  id: 'county-fill',
  type: 'fill' as const,
  paint: {
    'fill-color': '#1d4ed8',
    'fill-opacity': 0.02,
  },
};

const COUNTY_LINE_LAYER = {
  id: 'county-line',
  type: 'line' as const,
  paint: {
    'line-color': '#1d4ed8',
    'line-width': ['interpolate', ['linear'], ['zoom'], 6, 0.8, 10, 1.8] as unknown as number,
    'line-opacity': 0.55,
  },
};

const SELECTED_COUNTY_FILL_LAYER = {
  id: 'selected-county-fill',
  type: 'fill' as const,
  paint: {
    'fill-color': '#2563eb',
    'fill-opacity': 0.08,
  },
};

const SELECTED_COUNTY_LINE_LAYER = {
  id: 'selected-county-line',
  type: 'line' as const,
  paint: {
    'line-color': '#1d4ed8',
    'line-width': 2.8,
    'line-opacity': 0.95,
  },
};

const HOVERED_COUNTY_FILL_LAYER = {
  id: 'hovered-county-fill',
  type: 'fill' as const,
  paint: {
    'fill-color': '#60a5fa',
    'fill-opacity': 0.14,
  },
};

const HOVERED_COUNTY_LINE_LAYER = {
  id: 'hovered-county-line',
  type: 'line' as const,
  paint: {
    'line-color': '#3b82f6',
    'line-width': 2.2,
    'line-opacity': 0.95,
  },
};

const SUB_BOUNDARY_FILL_LAYER = {
  id: 'sub-boundary-fill',
  type: 'fill' as const,
  paint: {
    'fill-color': '#14b8a6',
    'fill-opacity': 0.05,
  },
};

const SUB_BOUNDARY_LINE_LAYER = {
  id: 'sub-boundary-line',
  type: 'line' as const,
  paint: {
    'line-color': '#0f766e',
    'line-width': ['interpolate', ['linear'], ['zoom'], 9, 0.8, 13, 1.8] as unknown as number,
    'line-opacity': 0.8,
  },
};

const HOVERED_SUB_BOUNDARY_FILL_LAYER = {
  id: 'hovered-sub-boundary-fill',
  type: 'fill' as const,
  paint: {
    'fill-color': '#2dd4bf',
    'fill-opacity': 0.24,
  },
};

const HOVERED_SUB_BOUNDARY_LINE_LAYER = {
  id: 'hovered-sub-boundary-line',
  type: 'line' as const,
  paint: {
    'line-color': '#0f766e',
    'line-width': 3.2,
    'line-opacity': 1,
  },
};

const SELECTED_SUB_BOUNDARY_FILL_LAYER = {
  id: 'selected-sub-boundary-fill',
  type: 'fill' as const,
  paint: {
    'fill-color': '#14b8a6',
    'fill-opacity': 0.18,
  },
};

const SELECTED_SUB_BOUNDARY_LINE_LAYER = {
  id: 'selected-sub-boundary-line',
  type: 'line' as const,
  paint: {
    'line-color': '#0f766e',
    'line-width': 2.6,
    'line-opacity': 0.95,
  },
};

const PARCEL_PREVIEW_FILL_LAYER = {
  id: 'parcel-preview-fill',
  type: 'fill' as const,
  minzoom: PARCEL_PREVIEW_MIN_ZOOM,
  paint: {
    'fill-color': '#2563eb',
    'fill-opacity': ['interpolate', ['linear'], ['zoom'], PARCEL_PREVIEW_MIN_ZOOM, 0.035, 15, 0.055, 17, 0.075] as unknown as number,
  },
};

const PARCEL_PREVIEW_HALO_LINE_LAYER = {
  id: 'parcel-preview-halo-line',
  type: 'line' as const,
  minzoom: PARCEL_PREVIEW_MIN_ZOOM,
  paint: {
    'line-color': 'rgba(255,255,255,0.92)',
    'line-width': ['interpolate', ['linear'], ['zoom'], PARCEL_PREVIEW_MIN_ZOOM, 1.4, 16, 2.2, 18, 2.8] as unknown as number,
    'line-opacity': ['interpolate', ['linear'], ['zoom'], PARCEL_PREVIEW_MIN_ZOOM, 0.72, 16, 0.9] as unknown as number,
  },
};

const PARCEL_PREVIEW_LINE_LAYER = {
  id: 'parcel-preview-line',
  type: 'line' as const,
  minzoom: PARCEL_PREVIEW_MIN_ZOOM,
  paint: {
    'line-color': 'rgba(29,78,216,0.98)',
    'line-width': ['interpolate', ['linear'], ['zoom'], PARCEL_PREVIEW_MIN_ZOOM, 0.9, 16, 1.4, 18, 1.9] as unknown as number,
    'line-opacity': ['interpolate', ['linear'], ['zoom'], PARCEL_PREVIEW_MIN_ZOOM, 0.8, 17, 0.98] as unknown as number,
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

function formatArticleDate(value: string | null): string {
  if (!value) return 'Undated';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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

function normalizeSearchText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function buildSearchScore(query: string, haystacks: string[], boosts = 0): number {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return boosts;

  let score = boosts;
  for (const haystack of haystacks) {
    const normalizedHaystack = normalizeSearchText(haystack);
    if (!normalizedHaystack) continue;
    if (normalizedHaystack === normalizedQuery) score += 120;
    else if (normalizedHaystack.startsWith(normalizedQuery)) score += 80;
    else if (normalizedHaystack.includes(normalizedQuery)) score += 50;

    for (const token of normalizedQuery.split(' ')) {
      if (token.length < 2) continue;
      if (normalizedHaystack.startsWith(token)) score += 14;
      else if (normalizedHaystack.includes(token)) score += 8;
    }
  }
  return score;
}

// ── Business filter panel ─────────────────────────────────────────────────────

interface BizFilterPanelProps {
  search: string;
  onSearch: (v: string) => void;
  groupFilters: Set<string>;
  onToggleGroup: (key: string) => void;
  onClearFilters: () => void;
  onClose: () => void;
  totalVisible: number;
  totalAll: number;
  ndOnly: boolean;
  onToggleNDOnly: () => void;
  visibleBusinesses: BizEntry[];
  onSelectBiz: (biz: BizEntry) => void;
  selectedBizId: number | null;
  focusedBiz: BizEntry | null;
  onClearFocus: () => void;
}

function BizFilterPanel({ search, onSearch, groupFilters, onToggleGroup, onClearFilters, onClose, totalVisible, totalAll, ndOnly, onToggleNDOnly, visibleBusinesses, onSelectBiz, selectedBizId, focusedBiz, onClearFocus }: BizFilterPanelProps) {
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
            aria-label="Close business directory"
            title="Close business directory"
            style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(0,0,0,0.07)',
              color: '#666',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1.5 1.5L8.5 8.5M8.5 1.5L1.5 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
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

interface ArticlePopupProps {
  article: NakedDenverArticle;
  onClose: () => void;
}

function ArticlePopup({ article, onClose }: ArticlePopupProps) {
  return (
    <div style={{
      position: 'absolute',
      bottom: 80,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 40,
      width: 340,
      background: 'rgba(255,255,255,0.98)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderRadius: 14,
      boxShadow: '0 8px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)',
      border: '1px solid rgba(0,0,0,0.07)',
      overflow: 'hidden',
    }}>
      <div style={{ height: 4, background: 'linear-gradient(90deg, #f59e0b 0%, #ea580c 100%)' }} />
      <div style={{ padding: '12px 14px 10px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1c1c1e', lineHeight: 1.3 }}>{article.title}</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 5 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#b45309', background: 'rgba(245,158,11,0.12)', borderRadius: 99, padding: '3px 8px' }}>
                Naked Denver
              </span>
              {article.developmentType && (
                <span style={{ fontSize: 10, fontWeight: 700, color: '#9a3412', background: 'rgba(234,88,12,0.10)', borderRadius: 99, padding: '3px 8px' }}>
                  {article.developmentType}
                </span>
              )}
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
      <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ fontSize: 11, color: '#8e8e93' }}>
          {[formatArticleDate(article.publishedAt), article.neighborhood, article.address].filter(Boolean).join(' · ')}
        </div>
        {article.summary && (
          <div style={{ fontSize: 11, color: '#3c3c3e', lineHeight: 1.5 }}>
            {article.summary}
          </div>
        )}
        {article.tags && article.tags.length > 0 && (
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {article.tags.slice(0, 4).map((tag) => (
              <span key={tag} style={{ fontSize: 10, color: '#92400e', background: 'rgba(245,158,11,0.08)', borderRadius: 6, padding: '3px 7px' }}>
                {tag}
              </span>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 10px',
              borderRadius: 6, background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.22)',
              fontSize: 11, fontWeight: 700, color: '#b45309', textDecoration: 'none',
            }}
          >
            Open Article ↗
          </a>
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
  const emptyFeatureCollection: GeoJSON.FeatureCollection = useMemo(
    () => ({ type: 'FeatureCollection', features: [] }),
    []
  );

  const [parcelState, setParcelState] = useState<ParcelState>({ status: 'idle' });
  const [markerPos, setMarkerPos] = useState<{ lng: number; lat: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SmartSearchResult[]>([]);
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
  const [denverBuilding, setDenverBuilding] = useState<DenverBuildingData | null>(null);
  const [douglasParcelData, setDouglasParcelData] = useState<DouglasParcelData | null>(null);
  const [arapahoeParcelData, setArapahoeParcelData] = useState<ArapahoeParcelData | null>(null);
  const [arapahoeZoningData, setArapahoeZoningData] = useState<ArapahoeZoningData | null>(null);
  const [showCountyBoundaries, setShowCountyBoundaries] = useState(true);
  const [countyBoundaries, setCountyBoundaries] = useState<GeoJSON.FeatureCollection | null>(null);
  const [municipalBoundaries, setMunicipalBoundaries] = useState<GeoJSON.FeatureCollection | null>(null);
  const [denverNeighborhoodBoundaries, setDenverNeighborhoodBoundaries] = useState<GeoJSON.FeatureCollection | null>(null);
  const [selectedCountyName, setSelectedCountyName] = useState<string | null>(null);
  const [selectedSubdivisionName, setSelectedSubdivisionName] = useState<string | null>(null);
  const [selectedBoundary, setSelectedBoundary] = useState<BoundarySelectionSummary | null>(null);
  const [hoveredCountyName, setHoveredCountyName] = useState<string | null>(null);
  const [hoveredSubdivisionName, setHoveredSubdivisionName] = useState<string | null>(null);
  const [mapCursor, setMapCursor] = useState<'crosshair' | 'pointer'>('crosshair');
  const [viewZoom, setViewZoom] = useState(CO_INITIAL.zoom);
  const [parcelPreviewBounds, setParcelPreviewBounds] = useState<string | null>(null);
  const [parcelPreviewGeoJSON, setParcelPreviewGeoJSON] = useState<GeoJSON.FeatureCollection>(emptyFeatureCollection);
  const [showFloodZones, setShowFloodZones] = useState(false);
  const [showWildfireRisk, setShowWildfireRisk] = useState(false);
  const [showZoning, setShowZoning] = useState(false);
  const [showBusinessDir, setShowBusinessDir] = useState(false);
  const [showNDArticles, setShowNDArticles] = useState(false);
  const [selectedBiz, setSelectedBiz] = useState<BizEntry | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<NakedDenverArticle | null>(null);
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

  const boundaryPanelOpen = !multiSelectMode && !!selectedBoundary;
  const panelOpen = !multiSelectMode && (parcelState.status === 'loaded' || parcelState.status === 'not_found' || boundaryPanelOpen);
  const leftPanelOpen = multiSelectMode || panelOpen;
  const leftPanelWidth = multiSelectMode ? 300 : 380;
  const feature = parcelState.status === 'loaded' ? parcelState.feature : null;

  useEffect(() => {
    let cancelled = false;

    async function loadBoundaries() {
      try {
        const [counties, municipalities, denverNeighborhoods] = await Promise.all([
          queryCountyBoundaries(),
          queryMunicipalBoundaries(),
          queryDenverNeighborhoodBoundaries(),
        ]);

        if (cancelled) return;
        setCountyBoundaries(counties);
        setMunicipalBoundaries(municipalities);
        setDenverNeighborhoodBoundaries(denverNeighborhoods);
      } catch (error) {
        console.warn('[ParcelMap] boundary layer fetch failed:', error);
      }
    }

    void loadBoundaries();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (feature?.location.county) {
      setSelectedCountyName(feature.location.county);
    }
  }, [feature?.location.county]);

  useEffect(() => {
    let cancelled = false;

    async function hydrateSelectedParcel() {
      if (!feature) return;

      const [centerLng, centerLat] = getGeometryCenter(feature.geometry as GeoJSON.Geometry);

      if (feature.location.county.trim().toLowerCase() === 'denver') {
        try {
          const [zoning, building] = await Promise.all([
            queryDenverZoning(centerLat, centerLng),
            queryDenverBuilding(feature.identity.apn),
          ]);

          if (!cancelled) {
            setDenverZoning(zoning?.zoneDistrict ? zoning : null);
            setDenverBuilding(building);
          }
        } catch {
          if (!cancelled) {
            setDenverZoning(null);
            setDenverBuilding(null);
          }
        }
        return;
      }

      if (feature.location.county.trim().toLowerCase() === 'douglas') {
        try {
          const douglasData = await queryDouglasParcelData(centerLng, centerLat);
          if (!cancelled) {
            setDouglasParcelData(douglasData);
          }
        } catch {
          if (!cancelled) {
            setDouglasParcelData(null);
          }
        }
        return;
      }

      if (feature.location.county.trim().toLowerCase() === 'arapahoe') {
        try {
          const [arapahoeData, zoning, auroraResult] = await Promise.all([
            queryArapahoeParcelData(feature.identity.apn),
            queryArapahoeZoning(centerLng, centerLat),
            queryAuroraZoning(centerLat, centerLng),
          ]);
          if (!cancelled) {
            setArapahoeParcelData(arapahoeData);
            setArapahoeZoningData(zoning);
            const az = auroraResult;
            setAuroraZoning(az?.districtId ? az : null);
          }
        } catch {
          if (!cancelled) {
            setArapahoeParcelData(null);
            setArapahoeZoningData(null);
            setAuroraZoning(null);
          }
        }
      }
    }

    void hydrateSelectedParcel();

    return () => {
      cancelled = true;
    };
  }, [feature]);

  useEffect(() => {
    let cancelled = false;

    async function loadVisibleParcels() {
      if (feature || !selectedCountyName || !parcelPreviewBounds || viewZoom < PARCEL_PREVIEW_MIN_ZOOM) {
        setParcelPreviewGeoJSON(emptyFeatureCollection);
        return;
      }

      const [west, south, east, north] = parcelPreviewBounds.split(',').map(Number);
      if ([west, south, east, north].some((value) => Number.isNaN(value))) return;

      try {
        const visibleParcels = await queryParcelsInBounds(west, south, east, north, 120);
        if (!cancelled) {
          setParcelPreviewGeoJSON(
            Array.isArray(visibleParcels?.features) ? visibleParcels : emptyFeatureCollection
          );
        }
      } catch (error) {
        if (!cancelled) {
          console.warn('[ParcelMap] visible parcel preview failed:', error);
          setParcelPreviewGeoJSON(emptyFeatureCollection);
        }
      }
    }

    void loadVisibleParcels();

    return () => {
      cancelled = true;
    };
  }, [emptyFeatureCollection, feature, parcelPreviewBounds, selectedCountyName, viewZoom]);

  const nearbyArticles = useMemo(() => {
    if (!feature) return [];
    const lat = feature.location.lat;
    const lng = feature.location.lng;
    return NAKED_DENVER_ARTICLES
      .filter((article): article is NakedDenverArticle & { lat: number; lng: number } => typeof article.lat === 'number' && typeof article.lng === 'number')
      .map((article) => ({
        ...article,
        distanceMiles: haversineM([lng, lat], [article.lng, article.lat]) / 1609.344,
      }))
      .filter((article) => article.distanceMiles <= 0.5)
      .sort((a, b) => a.distanceMiles - b.distanceMiles);
  }, [feature]);

  const selectedCountyFeature = useMemo(() => {
    if (!countyBoundaries || !selectedCountyName) return null;
    const normalized = normalizeCountyName(selectedCountyName);
    return countyBoundaries.features.find((feature): feature is BoundaryFeature => {
      const name = normalizeCountyName(getBoundaryName(feature as BoundaryFeature));
      return !!name && !!normalized && name === normalized;
    }) ?? null;
  }, [countyBoundaries, selectedCountyName]);

  const hoveredCountyFeature = useMemo(() => {
    if (!countyBoundaries || !hoveredCountyName) return null;
    const normalized = normalizeCountyName(hoveredCountyName);
    return countyBoundaries.features.find((feature): feature is BoundaryFeature => {
      const name = normalizeCountyName(getBoundaryName(feature as BoundaryFeature));
      return !!name && !!normalized && name === normalized;
    }) ?? null;
  }, [countyBoundaries, hoveredCountyName]);

  const selectedCountyGeoJSON = useMemo<GeoJSON.FeatureCollection | null>(() => {
    if (!selectedCountyFeature) return null;
    return {
      type: 'FeatureCollection',
      features: [selectedCountyFeature],
    };
  }, [selectedCountyFeature]);

  const hoveredCountyGeoJSON = useMemo<GeoJSON.FeatureCollection | null>(() => {
    if (!hoveredCountyFeature) return null;
    const hoveredNormalized = normalizeCountyName(hoveredCountyName);
    const selectedNormalized = normalizeCountyName(selectedCountyName);
    if (hoveredNormalized && selectedNormalized && hoveredNormalized === selectedNormalized) return null;
    return {
      type: 'FeatureCollection',
      features: [hoveredCountyFeature],
    };
  }, [hoveredCountyFeature, hoveredCountyName, selectedCountyName]);

  const countyLabelGeoJSON = useMemo(
    () => buildLabelPoints(countyBoundaries, getCountyDisplayName),
    [countyBoundaries]
  );

  const activeCountySubdivisionGeoJSON = useMemo<GeoJSON.FeatureCollection | null>(() => {
    if (!selectedCountyFeature || !selectedCountyName) return null;

    if (normalizeCountyName(selectedCountyName) === 'denver') {
      return denverNeighborhoodBoundaries;
    }

    if (!municipalBoundaries) return null;

    const countyGeometry = selectedCountyFeature.geometry;
    if (!countyGeometry) return null;

    return {
      type: 'FeatureCollection',
      features: municipalBoundaries.features.filter((feature): feature is BoundaryFeature => {
        if (!feature.geometry) return false;
        const center = getGeometryCenter(feature.geometry);
        return geometryContainsPoint(countyGeometry, center);
      }),
    };
  }, [denverNeighborhoodBoundaries, municipalBoundaries, selectedCountyFeature, selectedCountyName]);

  const activeCountySubdivisionLabelGeoJSON = useMemo(
    () => buildLabelPoints(activeCountySubdivisionGeoJSON),
    [activeCountySubdivisionGeoJSON]
  );

  const hoveredSubdivisionFeature = useMemo(() => {
    if (!activeCountySubdivisionGeoJSON || !hoveredSubdivisionName) return null;
    const normalized = hoveredSubdivisionName.trim().toLowerCase();
    return activeCountySubdivisionGeoJSON.features.find((feature): feature is BoundaryFeature => {
      const name = getBoundaryName(feature as BoundaryFeature);
      return !!name && name.trim().toLowerCase() === normalized;
    }) ?? null;
  }, [activeCountySubdivisionGeoJSON, hoveredSubdivisionName]);

  const hoveredSubdivisionGeoJSON = useMemo<GeoJSON.FeatureCollection | null>(() => {
    if (!hoveredSubdivisionFeature) return null;
    return {
      type: 'FeatureCollection',
      features: [hoveredSubdivisionFeature],
    };
  }, [hoveredSubdivisionFeature]);

  const selectedSubdivisionFeature = useMemo(() => {
    if (!activeCountySubdivisionGeoJSON || !selectedSubdivisionName) return null;
    const normalized = selectedSubdivisionName.trim().toLowerCase();
    return activeCountySubdivisionGeoJSON.features.find((feature): feature is BoundaryFeature => {
      const name = getBoundaryName(feature as BoundaryFeature);
      return !!name && name.trim().toLowerCase() === normalized;
    }) ?? null;
  }, [activeCountySubdivisionGeoJSON, selectedSubdivisionName]);

  const selectedSubdivisionGeoJSON = useMemo<GeoJSON.FeatureCollection | null>(() => {
    if (!selectedSubdivisionFeature) return null;
    return {
      type: 'FeatureCollection',
      features: [selectedSubdivisionFeature],
    };
  }, [selectedSubdivisionFeature]);

  const hoveredBoundaryLabel = hoveredSubdivisionName ?? selectedSubdivisionName ?? hoveredCountyName;
  const hoveredBoundaryContext = hoveredSubdivisionName || selectedSubdivisionName
    ? (normalizeCountyName(selectedCountyName) === 'denver' ? 'Neighborhood' : 'Town')
    : hoveredCountyName
    ? 'County'
    : null;

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

  const clearParcelSelection = useCallback(() => {
    setParcelState({ status: 'idle' });
    setMarkerPos(null);
    setNeighbourhood(null);
    setDenverZoning(null);
    setAuroraZoning(null);
    setDenverBuilding(null);
    setDouglasParcelData(null);
    setArapahoeParcelData(null);
    setArapahoeZoningData(null);
    setShowHint(true);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchError(null);
    }
  }, [searchQuery]);

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
    setSelectedBoundary(null);
    setSearchResults([]);
    setShowHint(false);
    setMarkerPos({ lng, lat });
    setParcelState({ status: 'loading', lat, lng });
    setNeighbourhood(null);
    setDenverZoning(null);
    setAuroraZoning(null);
    setCentennialZoning(null);
    setDenverBuilding(null);
    setDouglasParcelData(null);
    setArapahoeParcelData(null);
    setArapahoeZoningData(null);
    setSearchError(null);

    // Fly to location
    mapRef.current?.flyTo({
      center: [lng, lat],
      zoom: 16,
      duration: 1400,
      essential: true,
    });

    try {
      // First find the parcel and nearby neighborhood context.
      const [parcelResult, nbResult, auroraResult, centennialResult] = await Promise.allSettled([
        queryParcelByPoint(lng, lat),
        reverseGeocodeNeighborhood(lat, lng),
        queryAuroraZoning(lat, lng),
        queryCentennialZoning(lat, lng),
      ]);

      const parcel = parcelResult.status === 'fulfilled' ? parcelResult.value : null;
      const nb = nbResult.status === 'fulfilled' ? nbResult.value : null;
      const az = auroraResult.status === 'fulfilled' ? auroraResult.value : null;
      const cz = centennialResult.status === 'fulfilled' ? centennialResult.value : null;
      setNeighbourhood(nb);
      setAuroraZoning(az?.districtId ? az : null);
      setCentennialZoning(cz?.landUse ? cz : null);

      if (parcel) {
        setParcelState({ status: 'loaded', feature: parcel });
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
    const query = address.trim();
    if (!query) return;

    setSearching(true);
    setSearchError(null);
    setSearchedAddress(query);

    try {
      const businessResults: SmartSearchResult[] = BUSINESS_DIRECTORY
        .map((business) => {
          const firstLocation = business.allLocations?.[0] ?? (business.coordinates ? { address: business.address ?? '', ...business.coordinates } : null);
          if (!firstLocation) return null;
          const score = buildSearchScore(query, [business.name, business.category, business.address ?? '', business.about], 25);
          if (score < 45) return null;
          return {
            id: `business-${business.id}`,
            kind: 'business' as const,
            title: business.name,
            subtitle: `${business.category} · ${firstLocation.address || business.address || 'Colorado'}`,
            detail: business.website || undefined,
            business,
            lat: firstLocation.lat,
            lng: firstLocation.lng,
            score,
          };
        })
        .filter((result): result is SmartSearchResult & { kind: 'business' } => !!result);

      const articleResults: SmartSearchResult[] = NAKED_DENVER_MAPPED_ARTICLES
        .map((article) => {
          const score = buildSearchScore(query, [article.title, article.neighborhood ?? '', article.address ?? '', article.summary ?? ''], 10);
          if (score < 48) return null;
          return {
            id: `article-${article.id}`,
            kind: 'article' as const,
            title: article.title,
            subtitle: [article.neighborhood, article.address].filter(Boolean).join(' · ') || 'Naked Denver article',
            detail: article.developmentType || undefined,
            article,
            lat: article.lat,
            lng: article.lng,
            score,
          };
        })
        .filter((result): result is SmartSearchResult & { kind: 'article' } => !!result);

      const [parcelResultsRaw, placeResultsRaw] = await Promise.allSettled([
        searchParcels(query, 14),
        searchPlaces(query, 6),
      ]);

      const parcelResults: SmartSearchResult[] =
        parcelResultsRaw.status === 'fulfilled'
          ? parcelResultsRaw.value.map((parcel) => ({
              id: `parcel-${parcel.identity.apn}`,
              kind: 'parcel' as const,
              title: parcel.location.situsAddress || parcel.identity.apn,
              subtitle: `${parcel.owner.name} · ${parcel.location.city || parcel.location.county || 'Colorado'}`,
              detail: `APN ${parcel.identity.apn}`,
              parcel,
              score: buildSearchScore(query, [parcel.identity.apn, parcel.location.situsAddress, parcel.owner.name, parcel.location.city, parcel.identity.legalDescription ?? ''], 40),
            }))
          : [];

      const placeResults: SmartSearchResult[] =
        placeResultsRaw.status === 'fulfilled'
          ? placeResultsRaw.value.map((place, index) => ({
              id: `place-${index}-${place.lat}-${place.lng}`,
              kind: 'place' as const,
              title: place.formattedAddress.split(',')[0] ?? place.formattedAddress,
              subtitle: place.formattedAddress,
              detail: [place.county, place.state].filter(Boolean).join(' · ') || undefined,
              lat: place.lat,
              lng: place.lng,
              score: buildSearchScore(query, [place.formattedAddress], 5),
            }))
          : [];

      const combined = [...parcelResults, ...businessResults, ...articleResults, ...placeResults]
        .sort((a, b) => b.score - a.score)
        .slice(0, 12);

      setSearchResults(combined);

      const digitsOnly = query.replace(/\D/g, '');
      const isApnLike = /^[\d-\s]+$/.test(query) && digitsOnly.length >= 6;

      if (isApnLike && parcelResults.length === 1) {
        const parcel = parcelResults[0]!.parcel;
        await fetchParcel(parcel.location.lng, parcel.location.lat, parcel.location.situsAddress || parcel.identity.apn);
        setSearchResults([]);
        return;
      }

      if (combined.length === 1 && combined[0]?.kind === 'place') {
        const place = combined[0];
        await fetchParcel(place.lng, place.lat, place.title);
        setSearchResults([]);
        return;
      }

      if (combined.length === 0) {
        setSearchError('No matching parcels, owners, places, or businesses found.');
        setParcelState({ status: 'idle' });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Search failed.';
      setSearchError(msg);
      setParcelState({ status: 'idle' });
    } finally {
      setSearching(false);
    }
  }, [fetchParcel]);

  const handleSelectSearchResult = useCallback(async (result: SmartSearchResult) => {
    setSearchResults([]);
    setSearchError(null);
    setSearchQuery(result.title);
    setSearchedAddress(result.title);

    if (result.kind === 'parcel') {
      await fetchParcel(result.parcel.location.lng, result.parcel.location.lat, result.parcel.location.situsAddress || result.parcel.identity.apn);
      return;
    }

    if (result.kind === 'business') {
      setSelectedArticle(null);
      setShowBusinessDir(true);
      setSelectedBiz(result.business);
      setSelectedBoundary(null);
      clearParcelSelection();
      mapRef.current?.flyTo({ center: [result.lng, result.lat], zoom: 16, duration: 1000, essential: true });
      return;
    }

    if (result.kind === 'article') {
      setSelectedBiz(null);
      setShowNDArticles(true);
      setSelectedArticle(result.article);
      setSelectedBoundary(null);
      clearParcelSelection();
      mapRef.current?.flyTo({ center: [result.lng, result.lat], zoom: 16, duration: 1000, essential: true });
      return;
    }

    await fetchParcel(result.lng, result.lat, result.title);
  }, [clearParcelSelection, fetchParcel]);

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
    if (showNDArticles && mapRef.current) {
        const articlePins = mapRef.current.queryRenderedFeatures(e.point, { layers: ['nd-article-circles'] });
      if (articlePins.length > 0) {
        const props = articlePins[0].properties as { articleId?: string };
        const match = NAKED_DENVER_MAPPED_ARTICLES.find((article) => article.id === props.articleId);
        if (match) {
          setSelectedBiz(null);
          setSelectedArticle(match);
          return;
        }
      }
    }
    if (showCountyBoundaries) {
      const point: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      const currentZoom = mapRef.current?.getZoom() ?? CO_INITIAL.zoom;
      const subdivisionHit = findBoundaryFeatureAtPoint(activeCountySubdivisionGeoJSON, point);
      const countyHit = findBoundaryFeatureAtPoint(countyBoundaries, point);

      if (currentZoom <= BOUNDARY_SELECTION_MAX_ZOOM && (subdivisionHit || countyHit)) {
        const countyLabel = countyHit ? getBoundaryName(countyHit) : selectedCountyName;
        const countyBaseName = getBaseCountyName(countyLabel) ?? getBaseCountyName(selectedCountyName) ?? null;

        if (countyHit) {
          if (countyLabel) {
            setSelectedCountyName(countyLabel);
          }
        }

        if (subdivisionHit) {
          const subdivisionName = getBoundaryName(subdivisionHit);
          if (subdivisionName && countyBaseName) {
            setSelectedSubdivisionName(subdivisionName);
            setHoveredSubdivisionName(subdivisionName);
            setSelectedBoundary({
              type: normalizeCountyName(countyBaseName) === 'denver' ? 'neighborhood' : 'town',
              name: subdivisionName,
              countyName: countyBaseName,
            });
          }
        } else {
          setSelectedSubdivisionName(null);
          if (countyLabel && countyBaseName) {
            setSelectedBoundary({
              type: 'county',
              name: getCountyDisplayName(countyHit) ?? countyLabel,
              countyName: countyBaseName,
            });
          }
        }

        setSelectedBiz(null);
        setSelectedArticle(null);
        clearParcelSelection();
        return;
      }

      if (countyHit) {
        const countyName = getBoundaryName(countyHit);
        if (countyName) {
          setSelectedCountyName(countyName);
        }
      }

      setSelectedSubdivisionName(null);
    }
    setSelectedBiz(null);
    setSelectedArticle(null);
    setSelectedBoundary(null);
    setParcelPreviewGeoJSON(emptyFeatureCollection);
    fetchParcel(e.lngLat.lng, e.lngLat.lat);
  }, [activeCountySubdivisionGeoJSON, clearParcelSelection, countyBoundaries, emptyFeatureCollection, fetchParcel, fetchParcelForMultiSelect, measureMode, multiSelectMode, selectedCountyName, showBusinessDir, showCountyBoundaries, showNDArticles]);

  const handleMapMouseMove = useCallback((e: MapLayerMouseEvent) => {
    let nextCursor: 'crosshair' | 'pointer' = 'crosshair';
    const point: [number, number] = [e.lngLat.lng, e.lngLat.lat];

    if (showCountyBoundaries && activeCountySubdivisionGeoJSON?.features.length) {
      const subdivisionHit = findBoundaryFeatureAtPoint(activeCountySubdivisionGeoJSON, point);
      if (subdivisionHit) {
        const subdivisionName = getBoundaryName(subdivisionHit);
        setHoveredSubdivisionName(subdivisionName);
        setHoveredCountyName(null);
        nextCursor = 'pointer';
        setMapCursor(nextCursor);
        return;
      }
    }

    setHoveredSubdivisionName(null);

    if (!showCountyBoundaries) {
      setHoveredCountyName(null);
      setMapCursor(nextCursor);
      return;
    }

    const countyHit = findBoundaryFeatureAtPoint(countyBoundaries, point);
    if (countyHit) {
      const countyName = getBoundaryName(countyHit);
      setHoveredCountyName(countyName);
      nextCursor = 'pointer';
    } else {
      setHoveredCountyName(null);
    }

    setMapCursor(nextCursor);
  }, [activeCountySubdivisionGeoJSON, countyBoundaries, showCountyBoundaries]);

  // ── Close panel ───────────────────────────────────────────────────────────

  const handleClose = useCallback(() => {
    clearParcelSelection();
    setSelectedBoundary(null);
    setSelectedSubdivisionName(null);
    setHoveredSubdivisionName(null);
    setHoveredCountyName(null);
  }, [clearParcelSelection]);

  const closeBusinessDirectory = useCallback(() => {
    setShowBusinessDir(false);
    setSelectedBiz(null);
    setFocusedBizId(null);
    setBizSearch('');
    setBizGroupFilters(new Set());
    setBizNDOnly(false);
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      if (selectedBiz) {
        setSelectedBiz(null);
        return;
      }
      if (showBusinessDir) {
        closeBusinessDirectory();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [closeBusinessDirectory, selectedBiz, showBusinessDir]);

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

  const ndArticlesGeoJSON = useMemo((): GeoJSON.FeatureCollection => ({
    type: 'FeatureCollection',
    features: NAKED_DENVER_MAPPED_ARTICLES.map((article) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [article.lng, article.lat] },
      properties: {
        articleId: article.id,
        title: article.title,
        developmentType: article.developmentType ?? '',
        neighborhood: article.neighborhood ?? '',
      },
    })),
  }), []);

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

  const getMapSnapshot = useCallback(async (): Promise<string> => {
    const map = mapRef.current?.getMap();
    if (!map) return '';

    try {
      map.triggerRepaint();
      await new Promise<void>((resolve) => {
        let settled = false;
        const finish = () => {
          if (settled) return;
          settled = true;
          resolve();
        };
        map.once('render', () => {
          requestAnimationFrame(() => {
            requestAnimationFrame(finish);
          });
        });
        setTimeout(finish, 250);
      });
      return map.getCanvas().toDataURL('image/png');
    } catch {
      return '';
    }
  }, []);

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
        preserveDrawingBuffer
        cursor={mapCursor}
        onClick={handleMapClick}
        onMouseMove={handleMapMouseMove}
        onMove={(event) => {
          setViewZoom(event.viewState.zoom);
        }}
        onMoveEnd={() => {
          const bounds = mapRef.current?.getBounds();
          if (!bounds) return;
          setParcelPreviewBounds(
            [
              bounds.getWest(),
              bounds.getSouth(),
              bounds.getEast(),
              bounds.getNorth(),
            ].join(',')
          );
        }}
        attributionControl={false}
      >
        {showCountyBoundaries && countyBoundaries && (
          <Source id="county-boundaries" type="geojson" data={countyBoundaries}>
            <Layer {...COUNTY_FILL_LAYER} />
            <Layer {...COUNTY_LINE_LAYER} />
          </Source>
        )}

        {showCountyBoundaries && countyLabelGeoJSON.features.length > 0 && (
          <Source id="county-labels" type="geojson" data={countyLabelGeoJSON}>
            <Layer
              id="county-label-layer"
              type="symbol"
              minzoom={6}
              layout={{
                'text-field': ['get', 'label'],
                'text-font': ['Open Sans Semibold', 'Arial Unicode MS Regular'],
                'text-size': ['interpolate', ['linear'], ['zoom'], 6, 10, 10, 13] as unknown as number,
              }}
              paint={{
                'text-color': 'rgba(15,23,42,0.74)',
                'text-halo-color': 'rgba(255,255,255,0.88)',
                'text-halo-width': 1.1,
              }}
            />
          </Source>
        )}

        {showCountyBoundaries && selectedCountyGeoJSON && (
          <Source id="selected-county" type="geojson" data={selectedCountyGeoJSON}>
            <Layer {...SELECTED_COUNTY_FILL_LAYER} />
            <Layer {...SELECTED_COUNTY_LINE_LAYER} />
          </Source>
        )}

        {showCountyBoundaries && hoveredCountyGeoJSON && (
          <Source id="hovered-county" type="geojson" data={hoveredCountyGeoJSON}>
            <Layer {...HOVERED_COUNTY_FILL_LAYER} />
            <Layer {...HOVERED_COUNTY_LINE_LAYER} />
          </Source>
        )}

        {showCountyBoundaries && activeCountySubdivisionGeoJSON && activeCountySubdivisionGeoJSON.features.length > 0 && (
          <Source id="county-subdivisions" type="geojson" data={activeCountySubdivisionGeoJSON}>
            <Layer {...SUB_BOUNDARY_FILL_LAYER} />
            <Layer {...SUB_BOUNDARY_LINE_LAYER} />
          </Source>
        )}

        {showCountyBoundaries && selectedSubdivisionGeoJSON && (
          <Source id="selected-county-subdivision" type="geojson" data={selectedSubdivisionGeoJSON}>
            <Layer {...SELECTED_SUB_BOUNDARY_FILL_LAYER} />
            <Layer {...SELECTED_SUB_BOUNDARY_LINE_LAYER} />
          </Source>
        )}

        {showCountyBoundaries && hoveredSubdivisionGeoJSON && (
          <Source id="hovered-county-subdivision" type="geojson" data={hoveredSubdivisionGeoJSON}>
            <Layer {...HOVERED_SUB_BOUNDARY_FILL_LAYER} />
            <Layer {...HOVERED_SUB_BOUNDARY_LINE_LAYER} />
          </Source>
        )}

        {showCountyBoundaries && activeCountySubdivisionLabelGeoJSON.features.length > 0 && (
          <Source id="county-subdivision-labels" type="geojson" data={activeCountySubdivisionLabelGeoJSON}>
            <Layer
              id="county-subdivision-label-layer"
              type="symbol"
              minzoom={10}
              layout={{
                'text-field': ['get', 'label'],
                'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
                'text-size': ['interpolate', ['linear'], ['zoom'], 10, 10, 14, 12] as unknown as number,
              }}
              paint={{
                'text-color': 'rgba(15,118,110,0.9)',
                'text-halo-color': 'rgba(255,255,255,0.92)',
                'text-halo-width': 1,
              }}
            />
          </Source>
        )}

        {!feature && !multiSelectMode && parcelPreviewGeoJSON && parcelPreviewGeoJSON.features.length > 0 && (
          <Source id="parcel-preview" type="geojson" data={parcelPreviewGeoJSON}>
            <Layer {...PARCEL_PREVIEW_FILL_LAYER} />
            <Layer {...PARCEL_PREVIEW_HALO_LINE_LAYER} />
            <Layer {...PARCEL_PREVIEW_LINE_LAYER} />
          </Source>
        )}

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

        {/* ND parcel polygons */}
        {ndParcels.features.length > 0 && (
          <Source id="nd-parcels" type="geojson" data={ndParcels}>
            <Layer id="nd-parcels-fill" type="fill" paint={{ 'fill-color': '#f59e0b', 'fill-opacity': 0.18 }} />
            <Layer id="nd-parcels-line" type="line" paint={{ 'line-color': '#d97706', 'line-width': 2.5, 'line-opacity': 0.9 }} />
          </Source>
        )}

        {showNDArticles && ndArticlesGeoJSON.features.length > 0 && (
          <Source id="nd-articles" type="geojson" data={ndArticlesGeoJSON}>
            <Layer
              id="nd-article-halo"
              type="circle"
              paint={{
                'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 8, 15, 12],
                'circle-color': 'rgba(245,158,11,0.18)',
                'circle-stroke-width': 0,
              }}
            />
            <Layer
              id="nd-article-circles"
              type="circle"
              paint={{
                'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 4, 15, 7],
                'circle-color': '#f59e0b',
                'circle-opacity': 0.95,
                'circle-stroke-width': 1.6,
                'circle-stroke-color': '#fff',
              }}
            />
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
      </Map>

      {/* ── Search bar ── */}
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        onSearch={handleSearch}
        results={searchResults}
        onSelectResult={handleSelectSearchResult}
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
          denverBuilding={denverBuilding}
          denverValuation={null}
          douglasParcelData={douglasParcelData}
          arapahoeParcelData={arapahoeParcelData}
          arapahoeZoningData={arapahoeZoningData}
          auroraZoning={auroraZoning}
          centennialZoning={centennialZoning}
          nearbyArticles={nearbyArticles}
          boundarySelection={selectedBoundary}
          getMapSnapshot={getMapSnapshot}
          onClose={handleClose}
        />
      )}

      {viewZoom >= PARCEL_PREVIEW_MIN_ZOOM && !feature && !multiSelectMode && (
        <div
          style={{
            position: 'absolute',
            bottom: 92,
            left: leftPanelOpen ? leftPanelWidth + 18 : 18,
            zIndex: 12,
            padding: '8px 12px',
            borderRadius: 12,
            background: 'rgba(255,255,255,0.94)',
            border: '1px solid rgba(37,99,235,0.18)',
            boxShadow: '0 8px 24px rgba(15,23,42,0.12)',
            fontSize: 12,
            color: '#0f3f75',
            fontWeight: 600,
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            pointerEvents: 'none',
          }}
        >
          Parcel boundaries are active. Click any outlined parcel to inspect it.
        </div>
      )}

      {showCountyBoundaries && hoveredBoundaryLabel && hoveredBoundaryContext && (
        <div
          style={{
            position: 'absolute',
            top: 72,
            right: 52,
            zIndex: 26,
            padding: '9px 12px',
            borderRadius: 12,
            background: 'rgba(255,255,255,0.96)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.14)',
            border: '1px solid rgba(0,0,0,0.08)',
            minWidth: 180,
            pointerEvents: 'none',
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--ap-t3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>
            {hoveredBoundaryContext}
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ap-t1)' }}>
            {hoveredBoundaryLabel}
          </div>
        </div>
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
        {(showCountyBoundaries || showFloodZones || showWildfireRisk || showNDArticles) && (
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
            {showCountyBoundaries && (
              <div style={{ marginBottom: showFloodZones || showWildfireRisk || showNDArticles ? 8 : 0 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--ap-t3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                  County Boundaries
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: activeCountySubdivisionGeoJSON?.features.length ? 4 : 0 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 2, background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(29,78,216,0.45)', flexShrink: 0 }} />
                  <span style={{ fontSize: 10, color: 'var(--ap-t2)', lineHeight: 1.3 }}>
                    Colorado counties
                  </span>
                </div>
                {selectedCountyName && activeCountySubdivisionGeoJSON?.features.length ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 2, background: 'rgba(20,184,166,0.10)', border: '1px solid rgba(15,118,110,0.5)', flexShrink: 0 }} />
                    <span style={{ fontSize: 10, color: 'var(--ap-t2)', lineHeight: 1.3 }}>
                      {selectedCountyName.trim().toLowerCase() === 'denver' ? 'Denver neighborhoods' : `${selectedCountyName} towns`}
                    </span>
                  </div>
                ) : null}
              </div>
            )}
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
            {showNDArticles && (
              <div style={{ marginTop: showFloodZones || showWildfireRisk ? 8 : 0 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--ap-t3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                  Naked Denver Articles
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f59e0b', border: '1px solid rgba(0,0,0,0.12)', flexShrink: 0 }} />
                  <span style={{ fontSize: 10, color: 'var(--ap-t2)', lineHeight: 1.3 }}>
                    Article location / project reference point
                  </span>
                </div>
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
            { key: 'counties', label: 'Counties', active: showCountyBoundaries, color: '#2563eb', toggle: () => setShowCountyBoundaries(v => !v) },
            { key: 'directory', label: 'Directory', active: showBusinessDir, color: '#6366f1', toggle: () => { setShowBusinessDir(v => !v); setSelectedBiz(null); } },
            { key: 'nd-articles', label: 'ND Articles', active: showNDArticles, color: '#f59e0b', toggle: () => { setShowNDArticles(v => !v); if (showNDArticles) setSelectedArticle(null); } },
            { key: 'flood', label: 'Flood Zones', active: showFloodZones, color: '#4B9FE8', toggle: () => setShowFloodZones(v => !v) },
            { key: 'wildfire', label: 'Wildfire Risk', active: showWildfireRisk, color: '#d7191c', toggle: () => setShowWildfireRisk(v => !v) },
            { key: 'zoning', label: 'Zoning', active: showZoning, color: '#8b5cf6', toggle: () => setShowZoning(v => !v) },
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
          onClose={closeBusinessDirectory}
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

      {selectedArticle && (
        <ArticlePopup
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
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
