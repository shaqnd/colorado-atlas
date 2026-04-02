/**
 * ParcelPanel — Slide-in info drawer that appears when a parcel is selected.
 * Floats over the left edge of the map; matches Apple design tokens.
 */

import { useEffect, useState } from 'react';
import type { ParcelFeature, DenverBuildingData, DouglasParcelData } from '../data/parcelTypes';
import {
  formatCurrency,
  formatNumber,
  formatDate,
  queryDenverBuilding,
  queryDenverBuildings,
  queryDenverZoning,
  queryParcelsNearby,
} from '../utils/parcelService';
import { runHBUAnalysis } from '../utils/hbuAnalysis';
import { zoneDistrictsByCode } from '../data/zoneDistricts';
import { ALL_COMMUNITIES, getCommunitiesByCounty } from '../data/communities';
import { getDenverZoneDistrict, DENVER_CATEGORY_LABELS } from '../data/denverZoning';
import type { DenverZoningRaw } from '../utils/parcelService';
import type { Community } from '../data/communities';
import type { HBUResult } from '../data/types';
import type { NakedDenverArticle } from '../data/nakedDenverArticles';

// ── Tab config ────────────────────────────────────────────────────────────────
type PanelTab = 'parcel' | 'zoning' | 'tax' | 'council' | 'activity';
const TABS: { id: PanelTab; label: string }[] = [
  { id: 'parcel',   label: 'Parcel'   },
  { id: 'zoning',   label: 'Zoning'   },
  { id: 'tax',      label: 'Tax'      },
  { id: 'council',  label: 'Council'  },
  { id: 'activity', label: 'Activity' },
];

type ComparableProperty = {
  feature: ParcelFeature;
  building: DenverBuildingData;
  propertyType: string;
  estimatedTax: number;
  taxPerBuildingSqft: number | null;
  distanceMiles: number;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function fmtCurrencyCompact(value: number | null): string {
  return value === null ? '—' : formatCurrency(value);
}

function fmtSqft(value: number | null): string {
  return value === null ? '—' : `${formatNumber(value)} sf`;
}

function getGeometryCenter(geometry: GeoJSON.Geometry | null | undefined): [number, number] | null {
  if (!geometry || !('coordinates' in geometry)) return null;
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
  if (coords.length === 0) return null;

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

// ── Props ─────────────────────────────────────────────────────────────────────
interface ParcelPanelProps {
  feature: ParcelFeature | null;
  open: boolean;
  address: string;
  neighbourhood: string | null;
  denverZoning: DenverZoningRaw | null;
  denverBuilding: DenverBuildingData | null;
  douglasParcelData: DouglasParcelData | null;
  nearbyArticles: (NakedDenverArticle & { distanceMiles: number })[];
  boundarySelection: BoundarySelectionSummary | null;
  onClose: () => void;
}

export interface BoundarySelectionSummary {
  type: 'county' | 'town' | 'neighborhood';
  name: string;
  countyName: string;
}

// ── Helper sub-components ─────────────────────────────────────────────────────

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '8px 0', borderBottom: '1px solid var(--ap-sep)' }}>
      <span style={{ fontSize: 12, color: 'var(--ap-t3)', fontWeight: 500, flexShrink: 0, marginRight: 12 }}>{label}</span>
      <span style={{ fontSize: 13, color: 'var(--ap-t1)', textAlign: 'right', wordBreak: 'break-word' }}>{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ap-t3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 2 }}>
        {title}
      </div>
      <div>{children}</div>
    </div>
  );
}

function EmptyBadge({ label }: { label: string }) {
  return (
    <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--ap-t3)', fontSize: 13 }}>
      {label}
    </div>
  );
}

// ── HBU inference helpers ─────────────────────────────────────────────────────

/** Try to map ESRI zone code to one of our standard zoneDistricts codes. */
function inferZoneCode(esriCode: string | null): string | null {
  if (!esriCode) return null;
  // Direct match
  if (zoneDistrictsByCode[esriCode]) return esriCode;
  // Strip spaces, uppercase, try with dash
  const up = esriCode.toUpperCase().replace(/\s+/g, '');
  const withDash = up.replace(/^([A-Z]+)(\d)$/, '$1-$2');
  if (zoneDistrictsByCode[withDash]) return withDash;
  // Common county code aliases → our generic districts
  const aliases: Record<string, string> = {
    'SFR': 'R-1', 'SF': 'R-1', 'RS': 'R-1', 'RL': 'R-1', 'RE': 'R-1',
    'R1': 'R-1', 'R2': 'R-2', 'R3': 'R-3', 'R4': 'R-4',
    'MF': 'R-3', 'MFR': 'R-3', 'RM': 'R-3',
    'MX': 'MX-2', 'MX1': 'MX-1', 'MX2': 'MX-2', 'MX3': 'MX-3',
    'C': 'C-1', 'CG': 'C-2', 'CS': 'C-1', 'CN': 'C-1', 'CR': 'C-1', 'CB': 'C-1',
    'C1': 'C-1', 'C2': 'C-2', 'BU': 'C-1', 'B': 'C-1',
    'I': 'I-1', 'IND': 'I-1', 'LI': 'I-1', 'HI': 'I-2',
    'I1': 'I-1', 'I2': 'I-2', 'MI': 'I-1',
    'AG': 'AG', 'A': 'AG', 'A1': 'AG', 'A2': 'AG', 'AO': 'AG',
    'PUD': 'PUD',
  };
  return aliases[up] ?? null;
}

/** Keyword-match ESRI land use text to our currentUses codes. */
function inferUseCode(landUseDsc: string | null, landUseCde: string | null): string | null {
  const text = [landUseDsc, landUseCde].filter(Boolean).join(' ').toLowerCase();
  if (!text) return null;
  if (/vacant|unimproved|undeveloped|bare land|raw land/.test(text)) return 'vacant';
  if (/parking/.test(text)) return 'surface_parking';
  if (/single.?fam|sfr|detached|1 fam|one.?fam/.test(text)) return 'single_family';
  if (/duplex|two.?fam|2.?fam/.test(text)) return 'duplex';
  if (/multi.?fam|apartment|condo|town.?home|triplex|fourplex|3\+/.test(text)) return 'large_multifamily';
  if (/mixed.?use/.test(text)) return 'mixed_use';
  if (/retail|restaurant|shopping|commercial/.test(text)) return 'retail';
  if (/office|professional|medical/.test(text)) return 'office';
  if (/light.*indust|flex|warehouse|light ind/.test(text)) return 'light_industrial';
  if (/heavy.*indust|manufactur|processing|industrial/.test(text)) return 'light_industrial';
  if (/agri|farm|ranch|crop/.test(text)) return 'agricultural';
  if (/school|church|hospital|civic|government|institutional/.test(text)) return 'institutional';
  if (/resid/.test(text)) return 'single_family';
  return null;
}

function normalizePropertyType(
  f: ParcelFeature,
  denverBuilding?: DenverBuildingData | null,
  douglasParcelData?: DouglasParcelData | null
): string {
  const douglasType = douglasParcelData?.propertyType?.toLowerCase() ?? douglasParcelData?.accountType?.toLowerCase() ?? '';
  if (douglasType) {
    if (/condo|townhome|rowhome/.test(douglasType)) return 'Condo / Townhome';
    if (/single|residential|duplex/.test(douglasType)) return 'Single Family';
    if (/multi|apartment|multiple unit/.test(douglasType)) return 'Multifamily';
    if (/industrial|warehouse|manufact/.test(douglasType)) return 'Industrial';
    if (/agri|farm|ranch/.test(douglasType)) return 'Agricultural';
    if (/vacant|exempt/.test(douglasType) && douglasParcelData?.isVacant) return 'Vacant';
    if (/commercial|retail|office/.test(douglasType)) return 'Commercial';
  }

  const denverClass = denverBuilding?.propertyClass?.toLowerCase() ?? '';
  if (denverClass) {
    if (/condo|rowhome|townhome/.test(denverClass)) return 'Condo / Townhome';
    if (/single|sfr|detached/.test(denverClass)) return 'Single Family';
    if (/apartment|multi|duplex|triplex|fourplex/.test(denverClass)) return 'Multifamily';
    if (/industrial|warehouse|manufact/.test(denverClass)) return 'Industrial';
    if (/vacant/.test(denverClass)) return 'Vacant';
    if (/office|retail|commercial|store|mixed/.test(denverClass)) return 'Commercial';
  }

  const use = inferUseCode(f.zoning.landUseDescription, f.zoning.landUseCode);
  switch (use) {
    case 'single_family': return 'Single Family';
    case 'duplex':
    case 'large_multifamily': return 'Multifamily';
    case 'mixed_use':
    case 'retail':
    case 'office': return 'Commercial';
    case 'light_industrial': return 'Industrial';
    case 'agricultural': return 'Agricultural';
    case 'vacant': return 'Vacant';
    case 'institutional': return 'Institutional';
    default: return 'Unknown';
  }
}

function getBuildingSize(
  denverBuilding?: DenverBuildingData | null,
  douglasParcelData?: DouglasParcelData | null
): number | null {
  return denverBuilding?.totalBuildingSqft ?? douglasParcelData?.primaryBuilding?.totalBuildingSqft ?? null;
}

function getBuildingUnits(
  denverBuilding?: DenverBuildingData | null,
  douglasParcelData?: DouglasParcelData | null
): number | null {
  return denverBuilding?.units ?? douglasParcelData?.primaryBuilding?.units ?? null;
}

function getBuildingYearBuilt(
  denverBuilding?: DenverBuildingData | null,
  douglasParcelData?: DouglasParcelData | null
): number | null {
  return denverBuilding?.yearBuilt ?? douglasParcelData?.primaryBuilding?.yearBuilt ?? null;
}

function haversineMiles(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 3958.7613;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) *
      Math.cos((bLat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function parseComparableSaleDate(value: string | null): number | null {
  if (!value) return null;
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : null;
}

/**
 * Find the best community match from our dataset.
 *
 * Priority:
 *  1. Neighbourhood name from Nominatim reverse geocode (most specific — e.g. "City Park West")
 *  2. Exact city + county match
 *  3. City-only match
 *
 * Fuzzy matching handles casing differences and minor name variations
 * between Nominatim's OSM data and our communities dataset.
 */
function findCommunity(f: ParcelFeature, neighbourhood?: string | null): Community | null {
  const county = f.location.county?.trim().toLowerCase();
  const city   = f.location.city?.trim().toLowerCase();

  // 1. Neighbourhood match (Nominatim reverse geocode result)
  if (neighbourhood) {
    const nb = neighbourhood.trim().toLowerCase();
    const nbMatch = ALL_COMMUNITIES.find(c => {
      if (c.type !== 'Neighborhood') return false;
      if (county && c.county.toLowerCase() !== county) return false;
      const cn = c.name.toLowerCase();
      return cn === nb || nb.includes(cn) || cn.includes(nb);
    });
    if (nbMatch) return nbMatch;
  }

  // 2. Exact city + county match (for incorporated municipalities)
  if (city && county) {
    const exact = ALL_COMMUNITIES.find(
      c => c.name.toLowerCase() === city && c.county.toLowerCase() === county
    );
    if (exact) return exact;
  }

  // 3. City-only match
  if (city) {
    const byCity = ALL_COMMUNITIES.find(c => c.name.toLowerCase() === city);
    if (byCity) return byCity;
  }

  return null;
}

function findBoundaryCommunity(boundary: BoundarySelectionSummary): Community | null {
  const targetName = boundary.name.trim().toLowerCase();
  const countyName = boundary.countyName.trim().toLowerCase();

  return (
    ALL_COMMUNITIES.find((community) => {
      if (community.county.trim().toLowerCase() !== countyName) return false;
      if (community.name.trim().toLowerCase() !== targetName) return false;
      if (boundary.type === 'neighborhood') return community.type === 'Neighborhood';
      if (boundary.type === 'town') return community.type !== 'Neighborhood';
      return true;
    }) ?? null
  );
}

function CountyBoundaryCard({ countyName }: { countyName: string }) {
  const communities = getCommunitiesByCounty(countyName);
  const incorporatedCount = communities.filter((community) => community.incorporated).length;
  const neighborhoodCount = communities.filter((community) => community.type === 'Neighborhood').length;
  const unincorporatedCount = communities.filter(
    (community) => !community.incorporated && community.type !== 'Neighborhood'
  ).length;
  const largestCommunity = communities
    .filter((community) => typeof community.population2020 === 'number')
    .sort((a, b) => (b.population2020 ?? 0) - (a.population2020 ?? 0))[0] ?? null;

  return (
    <>
      <Section title="Overview">
        <Row label="Boundary Type" value="County" />
        <Row label="County" value={`${countyName} County`} />
        <Row label="Tracked Communities" value={communities.length > 0 ? communities.length : '—'} />
        <Row label="Incorporated Places" value={incorporatedCount > 0 ? incorporatedCount : '—'} />
        <Row label="Neighborhoods / Unincorporated Areas" value={neighborhoodCount + unincorporatedCount > 0 ? neighborhoodCount + unincorporatedCount : '—'} />
        {largestCommunity && (
          <Row
            label="Largest Place"
            value={`${largestCommunity.name}${largestCommunity.population2020 ? ` · ${formatNumber(largestCommunity.population2020)}` : ''}`}
          />
        )}
      </Section>

      {communities.length > 0 && (
        <Section title="County Snapshot">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div style={{ borderRadius: 10, border: '1px solid var(--ap-sep)', background: 'rgba(0,0,0,0.02)', padding: '10px 12px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ap-t3)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Incorporated
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ap-t1)', marginTop: 4 }}>{incorporatedCount}</div>
            </div>
            <div style={{ borderRadius: 10, border: '1px solid var(--ap-sep)', background: 'rgba(0,0,0,0.02)', padding: '10px 12px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ap-t3)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Neighborhoods / Areas
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ap-t1)', marginTop: 4 }}>{neighborhoodCount + unincorporatedCount}</div>
            </div>
          </div>
        </Section>
      )}

      <div style={{ marginTop: 8, padding: '10px 12px', borderRadius: 10, background: 'rgba(0,113,227,0.06)', color: '#0f3f75', fontSize: 12, lineHeight: 1.55 }}>
        This is a boundary-level selection. Zoom in further and click an individual parcel to see parcel ownership, zoning, tax, and building detail.
      </div>
    </>
  );
}

function BoundaryTab({ boundarySelection }: { boundarySelection: BoundarySelectionSummary }) {
  const community = boundarySelection.type === 'county' ? null : findBoundaryCommunity(boundarySelection);

  return (
    <>
      <Section title="Overview">
        <Row label="Boundary Type" value={boundarySelection.type === 'neighborhood' ? 'Neighborhood' : boundarySelection.type === 'town' ? 'Town / Place' : 'County'} />
        <Row label={boundarySelection.type === 'county' ? 'County' : 'Parent County'} value={`${boundarySelection.countyName} County`} />
      </Section>

      {boundarySelection.type === 'county' ? (
        <CountyBoundaryCard countyName={boundarySelection.countyName} />
      ) : community ? (
        <>
          <Section title="Community">
            <CommunityCard community={community} />
          </Section>
          <div style={{ marginTop: 8, padding: '10px 12px', borderRadius: 10, background: 'rgba(0,113,227,0.06)', color: '#0f3f75', fontSize: 12, lineHeight: 1.55 }}>
            You&apos;re viewing a {boundarySelection.type} boundary. Zoom in and select an individual parcel when you want parcel-level zoning, tax, building, or owner detail.
          </div>
        </>
      ) : (
        <div style={{ marginTop: 8, padding: '10px 12px', borderRadius: 10, background: 'rgba(0,0,0,0.03)', color: 'var(--ap-t2)', fontSize: 12, lineHeight: 1.55 }}>
          Boundary selected: {boundarySelection.name}. We have the geometry active on the map, but this place doesn&apos;t yet have a richer community profile in the local reference dataset.
        </div>
      )}
    </>
  );
}

// ── HBU mini-display ──────────────────────────────────────────────────────────

const SEVERITY_COLORS: Record<string, { bar: string; bg: string; text: string; icon: string }> = {
  high:   { bar: '#ef4444', bg: 'rgba(239,68,68,0.07)',   text: '#991b1b', icon: '⚠' },
  medium: { bar: '#f59e0b', bg: 'rgba(245,158,11,0.07)', text: '#92400e', icon: '●' },
  info:   { bar: '#60a5fa', bg: 'rgba(96,165,250,0.07)', text: '#1e40af', icon: 'ℹ' },
  good:   { bar: '#34c759', bg: 'rgba(52,199,89,0.07)',  text: '#166534', icon: '✓' },
};

function HBUMini({ result, zoneCode, useCode }: { result: HBUResult; zoneCode: string; useCode: string }) {
  const isUnder = result.verdict === 'underutilized';
  const d = result.districtDetail;

  return (
    <div style={{ marginTop: 4 }}>
      {/* Inferred inputs note */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: 'rgba(0,0,0,0.05)', color: 'var(--ap-t3)' }}>
          Zone → {zoneCode}
        </span>
        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: 'rgba(0,0,0,0.05)', color: 'var(--ap-t3)' }}>
          Use → {useCode.replace(/_/g, ' ')}
        </span>
        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: 'rgba(0,113,227,0.08)', color: '#0051b3', fontWeight: 500 }}>
          Auto-calculated
        </span>
      </div>

      {/* Verdict */}
      <div style={{
        borderRadius: 10,
        border: `1px solid ${isUnder ? 'rgba(239,68,68,0.25)' : 'rgba(52,199,89,0.25)'}`,
        background: isUnder ? 'rgba(239,68,68,0.06)' : 'rgba(52,199,89,0.06)',
        padding: '10px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 10,
      }}>
        <span style={{ fontSize: 20 }}>{isUnder ? '⚠️' : '✅'}</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: isUnder ? '#991b1b' : '#166534' }}>
            {isUnder ? 'Potentially Underutilized' : 'At or Near Highest & Best Use'}
          </div>
          <div style={{ fontSize: 11, color: isUnder ? '#b91c1c' : '#15803d', marginTop: 2 }}>
            {result.signals.filter(s => s.severity === 'high').length} high ·{' '}
            {result.signals.filter(s => s.severity === 'medium').length} medium ·{' '}
            {result.signals.filter(s => s.severity === 'info').length} info signals
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8, marginBottom: 10 }}>
        <div style={{ borderRadius: 10, border: '1px solid var(--ap-sep)', background: 'rgba(0,0,0,0.02)', padding: '10px 12px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ap-t3)', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 8 }}>
            HBU Recommendation
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 6 }}>
            {[
              ['Current Use', result.recommendation.currentUseLabel],
              ['Likely Interim HBU', result.recommendation.likelyInterimUse],
              ['Likely Ultimate HBU', result.recommendation.likelyUltimateUse],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, paddingBottom: 6, borderBottom: '1px solid var(--ap-sep)' }}>
                <div style={{ fontSize: 11, color: 'var(--ap-t3)', fontWeight: 600 }}>{label}</div>
                <div style={{ fontSize: 12, color: 'var(--ap-t1)', fontWeight: 700, textAlign: 'right' }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div style={{ borderRadius: 10, border: '1px solid var(--ap-sep)', background: 'rgba(0,0,0,0.02)', padding: '10px 12px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ap-t3)', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 6 }}>
              Why
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {result.recommendation.rationale.map((item, i) => (
                <div key={i} style={{ fontSize: 11, color: 'var(--ap-t2)', lineHeight: 1.45 }}>
                  • {item}
                </div>
              ))}
            </div>
          </div>

          <div style={{ borderRadius: 10, border: '1px solid var(--ap-sep)', background: 'rgba(0,0,0,0.02)', padding: '10px 12px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ap-t3)', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 6 }}>
              Zoning Support
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {result.recommendation.support.slice(0, 4).map((item, i) => (
                <div key={i} style={{ fontSize: 11, color: 'var(--ap-t2)', lineHeight: 1.45 }}>
                  • {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top signals (max 3) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
        {result.signals.slice(0, 3).map((sig, i) => {
          const sc = SEVERITY_COLORS[sig.severity] ?? SEVERITY_COLORS.info;
          return (
            <div key={i} style={{ borderRadius: 8, border: `1px solid ${sc.bar}30`, background: sc.bg, display: 'flex', overflow: 'hidden' }}>
              <div style={{ width: 3, background: sc.bar, flexShrink: 0 }} />
              <div style={{ padding: '8px 10px' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: sc.text }}>{sc.icon} {sig.title}</div>
                <div style={{ fontSize: 11, color: sc.text, opacity: 0.8, marginTop: 2, lineHeight: 1.4 }}>{sig.description}</div>
              </div>
            </div>
          );
        })}
        {result.signals.length > 3 && (
          <div style={{ fontSize: 11, color: 'var(--ap-t3)', textAlign: 'center' }}>
            +{result.signals.length - 3} more signals — see Zoning tab for full analysis
          </div>
        )}
      </div>

      {/* District mini-stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {[
          ['Min Lot', d.minLot > 0 ? `${d.minLot.toLocaleString()} sf` : 'None'],
          ['Max Density', d.maxDensity > 0 ? `${d.maxDensity} DU/ac` : 'N/A'],
          ['Max Height', d.maxHeight > 0 ? `${d.maxHeight} ft` : 'N/A'],
          ['Max FAR', d.maxFAR > 0 ? String(d.maxFAR) : 'N/A'],
        ].map(([label, val]) => (
          <div key={label} style={{ background: 'rgba(0,0,0,0.03)', borderRadius: 7, padding: '6px 8px', border: '1px solid var(--ap-sep)' }}>
            <div style={{ fontSize: 10, color: 'var(--ap-t3)' }}>{label}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ap-t1)', marginTop: 1 }}>{val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Community card ────────────────────────────────────────────────────────────

function CommunityCard({ community }: { community: Community }) {
  const typeColor =
    community.incorporated ? { bg: 'rgba(0,113,227,0.07)', text: '#0051b3' }
    : community.type === 'CDP' ? { bg: 'rgba(88,86,214,0.07)', text: '#3730a3' }
    : { bg: 'rgba(0,0,0,0.04)', text: 'var(--ap-t2)' };

  return (
    <div style={{
      borderRadius: 12,
      border: '1px solid var(--ap-sep)',
      background: 'rgba(0,0,0,0.015)',
      overflow: 'hidden',
    }}>
      {/* Header bar */}
      <div style={{
        padding: '10px 12px 8px',
        borderBottom: '1px solid var(--ap-sep)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 8,
      }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ap-t1)' }}>{community.name}</div>
          <div style={{ fontSize: 11, color: 'var(--ap-t3)', marginTop: 1 }}>
            {community.county} County, Colorado
          </div>
        </div>
        <span style={{
          fontSize: 10,
          fontWeight: 600,
          padding: '3px 8px',
          borderRadius: 99,
          background: typeColor.bg,
          color: typeColor.text,
          whiteSpace: 'nowrap',
          marginTop: 2,
        }}>
          {community.type}
        </span>
      </div>

      {/* Stats row */}
      <div style={{ padding: '8px 12px', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, color: 'var(--ap-t3)' }}>Population (2020)</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ap-t1)' }}>
            {community.population2020 != null ? community.population2020.toLocaleString() : '—'}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: 'var(--ap-t3)' }}>Status</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: community.incorporated ? '#166534' : 'var(--ap-t2)' }}>
            {community.incorporated ? 'Incorporated' : 'Unincorporated'}
          </div>
        </div>
        {community.cdpVerified && (
          <div>
            <div style={{ fontSize: 10, color: 'var(--ap-t3)' }}>Data</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#15803d' }}>Census Verified</div>
          </div>
        )}
      </div>

      {community.notes && (
        <div style={{ padding: '0 12px 10px', fontSize: 11, color: 'var(--ap-t3)', lineHeight: 1.5, borderTop: '1px solid var(--ap-sep)', paddingTop: 8 }}>
          {community.notes}
        </div>
      )}
    </div>
  );
}

// ── Tab content ───────────────────────────────────────────────────────────────

function ParcelTab({
  f,
  neighbourhood,
  denverBuilding,
  douglasParcelData,
}: {
  f: ParcelFeature;
  neighbourhood?: string | null;
  denverBuilding?: DenverBuildingData | null;
  douglasParcelData?: DouglasParcelData | null;
}) {
  const sqftLabel = f.identity.sqft ? `${formatNumber(f.identity.sqft)} sf` : '—';
  const acreLabel = f.identity.acreage ? `${f.identity.acreage.toFixed(3)} ac` : '—';
  const community = findCommunity(f, neighbourhood);
  const buildingSize = getBuildingSize(denverBuilding, douglasParcelData);
  const isDouglas = f.location.county.toLowerCase() === 'douglas' && !!douglasParcelData;

  return (
    <>
      <Section title="Identity">
        <Row label="Parcel ID"     value={f.identity.apn} />
        {douglasParcelData?.accountNumber && <Row label="Account Number" value={douglasParcelData.accountNumber} />}
        <Row label="Owner"         value={f.owner.name} />
        <Row label="County"        value={f.location.county || '—'} />
        <Row label="Subdivision"   value={f.identity.subdivision || '—'} />
      </Section>

      <Section title="Site">
        <Row label="Address"       value={f.location.situsAddress || '—'} />
        <Row label="City"          value={f.location.city || '—'} />
        {(denverBuilding || douglasParcelData?.primaryBuilding) && (
          <Row
            label="Building Size"
            value={buildingSize ? `${formatNumber(buildingSize)} sf` : '—'}
          />
        )}
        <Row label="Lot Size"      value={`${sqftLabel} · ${acreLabel}`} />
        <Row label="Coordinates"   value={`${f.location.lat.toFixed(5)}, ${f.location.lng.toFixed(5)}`} />
      </Section>

      {denverBuilding && (
        <Section title="Denver Building Size">
          {denverBuilding.source === 'residential' && (
            <p style={{ fontSize: 11, color: 'var(--ap-t3)', lineHeight: 1.5, margin: '0 0 8px' }}>
              Denver residential records expose exact component areas. Total building size here is calculated from the assessor&apos;s above-grade and basement fields.
            </p>
          )}
          <Row label="Data Source" value={denverBuilding.source === 'residential' ? 'Denver residential characteristics' : 'Denver apartment/commercial characteristics'} />
          {denverBuilding.aboveGradeSqft !== null && (
            <Row label="Above Grade" value={`${formatNumber(denverBuilding.aboveGradeSqft)} sf`} />
          )}
          {denverBuilding.groundFloorSqft !== null && (
            <Row label="Ground Floor" value={`${formatNumber(denverBuilding.groundFloorSqft)} sf`} />
          )}
          {denverBuilding.grossAreaSqft !== null && (
            <Row label="Gross Area" value={`${formatNumber(denverBuilding.grossAreaSqft)} sf`} />
          )}
          {denverBuilding.netAreaSqft !== null && (
            <Row label="Net Area" value={`${formatNumber(denverBuilding.netAreaSqft)} sf`} />
          )}
          {denverBuilding.basementSqft !== null && (
            <Row label="Basement" value={`${formatNumber(denverBuilding.basementSqft)} sf`} />
          )}
          {denverBuilding.finishedBasementSqft !== null && (
            <Row label="Finished Basement" value={`${formatNumber(denverBuilding.finishedBasementSqft)} sf`} />
          )}
          {denverBuilding.floors !== null && (
            <Row label="Floors" value={denverBuilding.floors} />
          )}
          {denverBuilding.units !== null && (
            <Row label="Units" value={denverBuilding.units} />
          )}
          {(denverBuilding.yearBuilt !== null || denverBuilding.remodelYear !== null) && (
            <Row
              label="Year Built / Remodel"
              value={[
                denverBuilding.yearBuilt ?? '—',
                denverBuilding.remodelYear ?? '—',
              ].join(' / ')}
            />
          )}
          {denverBuilding.propertyClass && (
            <Row label="Property Class" value={denverBuilding.propertyClass} />
          )}
          {denverBuilding.style && (
            <Row label="Style / Class" value={denverBuilding.style} />
          )}
          {denverBuilding.buildingName && (
            <Row label="Building Name" value={denverBuilding.buildingName} />
          )}
        </Section>
      )}

      {isDouglas && (
        <Section title="Douglas Assessor Detail">
          <Row label="Parcel Type" value={douglasParcelData.parcelType || '—'} />
          <Row label="Account Type" value={douglasParcelData.accountType || '—'} />
          {douglasParcelData.primaryBuilding?.propertyType && (
            <Row label="Property Type" value={douglasParcelData.primaryBuilding.propertyType} />
          )}
          {douglasParcelData.primaryBuilding?.style && (
            <Row label="Style" value={douglasParcelData.primaryBuilding.style} />
          )}
          {douglasParcelData.primaryBuilding?.useDescription && (
            <Row label="Primary Use" value={douglasParcelData.primaryBuilding.useDescription} />
          )}
          {douglasParcelData.primaryBuilding?.constructionDescription && (
            <Row label="Construction" value={douglasParcelData.primaryBuilding.constructionDescription} />
          )}
          {douglasParcelData.primaryBuilding?.floors !== null && (
            <Row label="Floors" value={douglasParcelData.primaryBuilding?.floors ?? '—'} />
          )}
          {douglasParcelData.primaryBuilding?.units !== null && (
            <Row label="Units" value={douglasParcelData.primaryBuilding?.units ?? '—'} />
          )}
          {getBuildingYearBuilt(null, douglasParcelData) !== null && (
            <Row label="Year Built" value={getBuildingYearBuilt(null, douglasParcelData) ?? '—'} />
          )}
          {douglasParcelData.buildingPermitAuthorityName && (
            <Row label="Permit Authority" value={douglasParcelData.buildingPermitAuthorityName} />
          )}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
            <a href={douglasParcelData.detailUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: '#0051b3', textDecoration: 'none', fontWeight: 600 }}>
              Douglas Assessor Record ↗
            </a>
            <a href={douglasParcelData.neighborhoodInfoUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: '#0051b3', textDecoration: 'none', fontWeight: 600 }}>
              Neighborhood Info ↗
            </a>
          </div>
        </Section>
      )}

      {(douglasParcelData?.legalDescription || f.identity.legalDescription) && (
        <Section title="Legal Description">
          <p style={{ fontSize: 12, color: 'var(--ap-t2)', lineHeight: 1.6, margin: 0 }}>
            {douglasParcelData?.legalDescription || f.identity.legalDescription}
          </p>
        </Section>
      )}

      {/* Sale history */}
      {(f.valuation.lastSaleDate || f.valuation.lastSalePrice) && (
        <Section title="Sale History">
          <Row label="Last Sale Date"  value={formatDate(f.valuation.lastSaleDate)} />
          <Row label="Last Sale Price" value={formatCurrency(f.valuation.lastSalePrice)} />
        </Section>
      )}

      {/* Neighborhood card */}
      {community && (
        <Section title="Community">
          <CommunityCard community={community} />
        </Section>
      )}

      <div style={{ marginTop: 8, padding: '8px 10px', borderRadius: 8, background: 'rgba(0,0,0,0.03)', fontSize: 11, color: 'var(--ap-t3)' }}>
        Source: {isDouglas ? 'Douglas County Assessor + Colorado Statewide Parcels' : 'Colorado Statewide Parcels · ESRI REST Service'}
      </div>
    </>
  );
}

function ZoningTab({
  f,
  denverZoning,
  denverBuilding,
  douglasParcelData,
}: {
  f: ParcelFeature;
  denverZoning?: DenverZoningRaw | null;
  denverBuilding?: DenverBuildingData | null;
  douglasParcelData?: DouglasParcelData | null;
}) {
  const z = f.zoning;
  const dzDistrict = denverZoning?.zoneDistrict ? getDenverZoneDistrict(denverZoning.zoneDistrict) : null;
  const isDenverCounty = f.location.county.trim().toLowerCase() === 'denver';
  const isDenver = isDenverCounty;
  const isDouglas = f.location.county.toLowerCase() === 'douglas' && !!douglasParcelData;
  const effectiveZoneCode = isDenver
    ? denverZoning?.zoneDistrict ?? z.code
    : douglasParcelData?.zoningCode ?? z.code;

  // For HBU: prefer Denver zone code, fall back to ESRI
  const zoneCodeForHbu = inferZoneCode(effectiveZoneCode ?? null);
  const mappedUse = inferUseCode(z.landUseDescription, z.landUseCode);
  const sqft = f.identity.sqft ?? 0;
  const normalizedPropertyType = normalizePropertyType(f, denverBuilding, douglasParcelData);
  const hbuResult: HBUResult | null =
    zoneCodeForHbu && mappedUse && sqft > 0
      ? runHBUAnalysis({
          zoneCode: zoneCodeForHbu,
          currentUseCode: mappedUse,
          lotSizeSqft: sqft,
          buildingSizeSqft: getBuildingSize(denverBuilding, douglasParcelData),
          unitCount: getBuildingUnits(denverBuilding, douglasParcelData),
          propertyTypeLabel: normalizedPropertyType,
        })
      : null;

  return (
    <>
      {/* ── Denver Official Zoning (authoritative) ── */}
      {isDenver && (
        <div style={{ marginBottom: 20 }}>
          {/* Header badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ap-t3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Official Denver Zoning
            </div>
            <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 99, background: 'rgba(52,199,89,0.12)', color: '#166534', fontWeight: 600 }}>
              City & County of Denver — Authoritative
            </span>
          </div>

          {/* Zone code hero */}
          <div style={{
            borderRadius: 12,
            border: '1.5px solid rgba(0,113,227,0.2)',
            background: 'rgba(0,113,227,0.04)',
            padding: '12px 14px',
            marginBottom: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#0051b3', letterSpacing: '-0.01em' }}>
                  {denverZoning?.zoneDistrict ?? z.code ?? 'Denver zoning'}
                </div>
                <div style={{ fontSize: 13, color: 'var(--ap-t2)', marginTop: 2 }}>
                  {dzDistrict?.name ?? denverZoning?.zoneDescription ?? z.description ?? '—'}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                {dzDistrict && (
                  <span style={{
                    fontSize: 11, padding: '3px 9px', borderRadius: 99,
                    background: 'rgba(0,0,0,0.06)', color: 'var(--ap-t2)', fontWeight: 500,
                  }}>
                    {DENVER_CATEGORY_LABELS[dzDistrict.category]}
                  </span>
                )}
                {denverZoning?.nbhdContext && (
                  <div style={{ fontSize: 11, color: 'var(--ap-t3)', marginTop: 4 }}>
                    {denverZoning.nbhdContext} context
                  </div>
                )}
              </div>
            </div>

            {dzDistrict?.summary && (
              <div style={{ fontSize: 12, color: 'var(--ap-t2)', lineHeight: 1.6, marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--ap-sep)' }}>
                {dzDistrict.summary}
              </div>
            )}
          </div>

          {/* Development standards grid */}
          {dzDistrict && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ap-t3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>
                Development Standards
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {[
                  ['Max Height', dzDistrict.maxHeightFt > 0 ? `${dzDistrict.maxHeightFt} ft (${dzDistrict.maxHeightStories} stories)` : denverZoning?.heightStories ? `${denverZoning.heightStories} stories` : 'No fixed limit'],
                  ['Min Lot Size', dzDistrict.minLotSqft > 0 ? `${dzDistrict.minLotSqft.toLocaleString()} sq ft` : 'None'],
                  ['Max FAR', dzDistrict.maxFAR > 0 ? String(dzDistrict.maxFAR) : 'N/A'],
                  ['Current Building Size', denverBuilding?.totalBuildingSqft ? `${formatNumber(denverBuilding.totalBuildingSqft)} sq ft` : 'N/A'],
                  ['Max Lot Coverage', dzDistrict.maxLotCoveragePercent > 0 ? `${dzDistrict.maxLotCoveragePercent}%` : 'N/A'],
                  ['Front Setback', `${dzDistrict.setbacks.primaryStreetFt} ft`],
                  ['Side Setback', `${dzDistrict.setbacks.sideFt} ft`],
                  ['Rear Setback', `${dzDistrict.setbacks.rearFt} ft`],
                  ['ADU Allowed', dzDistrict.aduAllowed ? 'Yes' : (denverZoning?.aduAllowed === 'Yes' ? 'Yes' : 'No')],
                  ['Max Units', dzDistrict.maxUnits != null ? (dzDistrict.maxUnits === 0 ? 'None (no residential)' : String(dzDistrict.maxUnits)) : 'Density-based'],
                  ['Parking', dzDistrict.parkingRequired ? 'Required' : 'Not required by zone'],
                ].map(([label, val]) => (
                  <div key={label} style={{ background: 'rgba(0,0,0,0.025)', borderRadius: 8, padding: '7px 10px', border: '1px solid var(--ap-sep)' }}>
                    <div style={{ fontSize: 10, color: 'var(--ap-t3)' }}>{label}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ap-t1)', marginTop: 1 }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Overlays / special conditions */}
          {(denverZoning?.overlayDistrict || denverZoning?.pudNum) && (
            <div style={{ padding: '10px 12px', borderRadius: 8, background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)', marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#92400e', marginBottom: 4 }}>Overlays & Special Conditions</div>
              {denverZoning?.overlayDistrict && <div style={{ fontSize: 12, color: '#92400e' }}>Overlay: {denverZoning.overlayDistrict}</div>}
              {denverZoning?.pudNum && (
                <div style={{ fontSize: 12, color: '#92400e' }}>
                  PUD #{denverZoning.pudNum}
                  {denverZoning.pudDocument && (
                    <> · <a href={denverZoning.pudDocument} target="_blank" rel="noopener noreferrer" style={{ color: '#0051b3' }}>View PUD Document ↗</a></>
                  )}
                </div>
              )}
              {denverZoning?.ordNum && <div style={{ fontSize: 11, color: '#b45309', marginTop: 2 }}>Ordinance {denverZoning.ordNum} ({denverZoning.ordYear})</div>}
            </div>
          )}

          {!denverZoning?.zoneDistrict && (
            <div style={{ padding: '10px 12px', borderRadius: 8, background: 'rgba(255,159,10,0.08)', border: '1px solid rgba(255,159,10,0.18)', marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#b25a00', marginBottom: 4 }}>Denver official zoning retry still pending</div>
              <div style={{ fontSize: 12, color: '#b25a00', lineHeight: 1.5 }}>
                Using the statewide parcel zoning code <strong>{z.code || '—'}</strong> as a temporary fallback for this view while the official Denver zoning lookup resolves.
              </div>
            </div>
          )}

          {/* Permitted / conditional / prohibited */}
          {dzDistrict && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <UseList title="Permitted By Right" items={dzDistrict.permittedByRight} color="#166534" dotColor="#34c759" bg="rgba(52,199,89,0.06)" border="rgba(52,199,89,0.2)" />
              {dzDistrict.conditionalUses.length > 0 && (
                <UseList title="Conditional Uses (Review Required)" items={dzDistrict.conditionalUses} color="#92400e" dotColor="#f59e0b" bg="rgba(245,158,11,0.06)" border="rgba(245,158,11,0.2)" />
              )}
              <UseList title="Prohibited Uses" items={dzDistrict.prohibited} color="#991b1b" dotColor="#ef4444" bg="rgba(239,68,68,0.05)" border="rgba(239,68,68,0.15)" />
            </div>
          )}

          {dzDistrict?.notes && (
            <div style={{ marginTop: 10, padding: '8px 10px', borderRadius: 8, background: 'rgba(0,0,0,0.03)', fontSize: 11, color: 'var(--ap-t3)', lineHeight: 1.5 }}>
              {dzDistrict.notes}
            </div>
          )}
        </div>
      )}

      {/* ── Statewide ESRI zoning (fallback / supplement) ── */}
      {!isDenver && (
        <>
          {(douglasParcelData?.zoningCode || douglasParcelData?.zoningCodeDescription || z.code || z.description || z.landUseCode || z.landUseDescription) ? (
            <Section title="Zoning (Statewide Layer)">
              <Row label="Zone Code"     value={douglasParcelData?.zoningCode || z.code || '—'} />
              <Row label="Description"   value={douglasParcelData?.zoningCodeDescription || z.description || '—'} />
              <Row label="Land Use Code" value={z.landUseCode || '—'} />
              <Row label="Land Use"      value={z.landUseDescription || '—'} />
              {isDouglas && douglasParcelData?.propertyType && (
                <Row label="Douglas Property Type" value={douglasParcelData.propertyType} />
              )}
            </Section>
          ) : (
            <>
              <EmptyBadge label="No zoning data returned for this location." />
              <div style={{ padding: '12px', borderRadius: 10, background: 'rgba(0,113,227,0.06)', marginTop: 8, marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ap-blue)', marginBottom: 4 }}>Tip</div>
                <div style={{ fontSize: 12, color: 'var(--ap-t2)', lineHeight: 1.6 }}>
                  Check the {f.location.county} County Assessor's website or the county GIS portal for official zoning.
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* ── HBU Auto-Analysis ── */}
      <Section title="Highest &amp; Best Use — Auto-Calculated">
        {hbuResult ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 10 }}>
              <div style={{ background: 'rgba(0,0,0,0.03)', borderRadius: 7, padding: '6px 8px', border: '1px solid var(--ap-sep)' }}>
                <div style={{ fontSize: 10, color: 'var(--ap-t3)' }}>Current FAR</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ap-t1)', marginTop: 1 }}>
                  {hbuResult.districtDetail.currentFAR > 0 ? hbuResult.districtDetail.currentFAR.toFixed(2) : '—'}
                </div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.03)', borderRadius: 7, padding: '6px 8px', border: '1px solid var(--ap-sep)' }}>
                <div style={{ fontSize: 10, color: 'var(--ap-t3)' }}>FAR Utilization</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ap-t1)', marginTop: 1 }}>
                  {hbuResult.districtDetail.farUtilization > 0 ? `${(hbuResult.districtDetail.farUtilization * 100).toFixed(0)}%` : '—'}
                </div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.03)', borderRadius: 7, padding: '6px 8px', border: '1px solid var(--ap-sep)' }}>
                <div style={{ fontSize: 10, color: 'var(--ap-t3)' }}>Density Utilization</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ap-t1)', marginTop: 1 }}>
                  {hbuResult.districtDetail.densityUtilization > 0 ? `${(hbuResult.districtDetail.densityUtilization * 100).toFixed(0)}%` : '—'}
                </div>
              </div>
            </div>
            <HBUMini result={hbuResult} zoneCode={zoneCodeForHbu!} useCode={mappedUse!} />
          </>
        ) : (
          <div style={{ padding: '12px', borderRadius: 10, background: 'rgba(0,0,0,0.03)', border: '1px dashed var(--ap-sep)' }}>
            <div style={{ fontSize: 12, color: 'var(--ap-t3)', lineHeight: 1.5 }}>
              {!isDenver && !z.code
                ? 'No zone code available.'
                : !zoneCodeForHbu
                ? `Zone "${isDenver ? (denverZoning?.zoneDistrict ?? z.code ?? 'unknown') : z.code}" not yet in the HBU rules engine — use the Zoning & HBU tab.`
                : !mappedUse
                ? 'Land use could not be inferred from parcel data.'
                : 'Lot size required for analysis.'}
            </div>
          </div>
        )}
      </Section>
    </>
  );
}

function UseList({ title, items, color, dotColor, bg, border }: {
  title: string; items: string[]; color: string; dotColor: string; bg: string; border: string;
}) {
  return (
    <div style={{ borderRadius: 10, border: `1px solid ${border}`, background: bg, padding: '10px 12px' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color, marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{title}</div>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {items.map((item, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: dotColor, flexShrink: 0, marginTop: 5 }} />
            <span style={{ fontSize: 12, color, lineHeight: 1.5 }}>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Denver mill levy data (2024 assessment year, taxes payable 2025) ──────────

/**
 * Denver 2025 mill levy components (taxes payable 2026).
 * Source: 2025 Abstract of Assessment and Summary of Levies,
 *         City & County of Denver, Keith A. Erffmeyer, Assessor.
 *         https://denvergov.org/files/assets/public/v/1/finance/documents/assessor/2026/2025-abstract.pdf
 * Total general levy: 79.602 mills — applies to ALL Denver parcels.
 *
 * RTD (~0.600) and SCFD (~0.300) are levied regionally and collected
 * separately; included here for a complete bill estimate.
 */
const DENVER_MILL_LEVY_COMPONENTS: readonly { name: string; mills: number }[] = [
  // ── City & County of Denver (26.328 total) ──────────────────────────────
  { name: 'City General Fund',          mills: 9.628  },
  { name: 'City Bond Principal',        mills: 4.768  },
  { name: 'City Bond Interest',         mills: 1.732  },
  { name: 'Social Services',            mills: 2.473  },
  { name: 'Developmentally Disabled',   mills: 1.030  },
  { name: 'Fire Pension',               mills: 0.994  },
  { name: 'Police Pension',             mills: 1.185  },
  { name: 'Capital Maintenance',        mills: 2.576  },
  { name: 'Affordable Housing',         mills: 0.398  },
  { name: 'Library',                    mills: 1.544  },
  // ── Denver Public Schools (52.274 total) ────────────────────────────────
  { name: 'DPS — General Fund',         mills: 38.935 },
  { name: 'DPS — Bond Redemption',      mills: 9.339  },
  { name: 'DPS — Special Revenue',      mills: 4.000  },
  // ── Urban Drainage & Flood Control ──────────────────────────────────────
  { name: 'Urban Drainage & Flood Control', mills: 1.000 },
  // ── Regional (collected separately, included for full-bill estimate) ─────
  { name: 'RTD (Regional Transportation)', mills: 0.600 },
  { name: 'SCFD (Arts & Culture)',          mills: 0.300 },
];

/** General base levy (City + DPS + Urban Drainage) = 79.602 mills. */
const DENVER_BASE_MILL_LEVY = 79.602;
/** Full-bill estimate including RTD and SCFD. */
const DENVER_TOTAL_MILL_LEVY = DENVER_MILL_LEVY_COMPONENTS.reduce((s, c) => s + c.mills, 0);

/**
 * Colorado 2025 assessment rates by property class (SB24-233 / HB24B-1001).
 *
 * Key 2025 changes vs 2024:
 *  - Residential now has TWO rates: 6.25% for local gov, 7.05% for schools.
 *    We use 6.25% (local gov) to back-calculate inferred market value, and
 *    apply the blended mill levy to the single ESRI asedValTot figure.
 *  - $55,000 residential and $30,000 commercial value subtractions ELIMINATED.
 *  - Non-residential drops from 27.9% → 27% (steps to 26% in 2026, 25% in 2027).
 */
const ASSESSMENT_RATES: Record<string, number> = {
  residential:   0.0625,  // local-gov rate (6.25%); school rate is 7.05%
  multifamily:   0.0625,  // same residential class
  commercial:    0.2700,  // non-residential (27%)
  industrial:    0.2700,  // non-residential (27%)
  agricultural:  0.2640,  // agricultural / renewable energy (26.40%)
  vacant:        0.2700,  // non-residential (27%)
  mixed_use:     0.2700,  // treated as non-residential
  institutional: 0.0000,  // generally exempt
};

type PropertyClass = keyof typeof ASSESSMENT_RATES;

/** Classify a parcel into a Colorado assessment class using zoning + land use. */
function classifyPropertyType(
  zoneCode: string,
  landUseDsc: string | null,
  landUseCde: string | null,
): PropertyClass {
  const use = inferUseCode(landUseDsc, landUseCde);
  if (use) {
    if (['single_family', 'duplex'].includes(use)) return 'residential';
    if (['large_multifamily'].includes(use)) return 'multifamily';
    if (['retail', 'office', 'mixed_use'].includes(use)) return 'commercial';
    if (['light_industrial'].includes(use)) return 'industrial';
    if (['agricultural'].includes(use)) return 'agricultural';
    if (use === 'vacant') return 'vacant';
    if (use === 'institutional') return 'institutional';
  }
  // Fall back to zone code prefix
  const z = zoneCode.toUpperCase();
  if (/^(E-SU|U-SU|E-TU|U-TU|E-MU|U-MU|RH|R-1|R-2|R-3)/.test(z)) return 'residential';
  if (/^(G-MU|C-MX|C-MS|D-)/.test(z)) return 'commercial';
  if (/^(I-MX|I-A|I-B)/.test(z)) return 'industrial';
  if (/^OS/.test(z)) return 'institutional';
  return 'commercial'; // safe default for unknown zones
}

interface TaxEstimate {
  /** County assessor's assessed value (asedValTot from ESRI — already post-rate, post-exemption). */
  assessedValue: number;
  /** Back-calculated market value: assessedValue ÷ assessment rate. */
  inferredActualValue: number | null;
  assessmentRate: number;
  millLevy: number;
  estimatedTax: number;
  propertyClass: string;
}

/**
 * Compute estimated Denver property tax from the ESRI asedValTot field.
 *
 * The ESRI Colorado statewide parcel layer stores asedValTot as the
 * county-assessed value (actual value × assessment rate, with exemptions
 * already applied). We multiply it directly by the mill levy — do NOT
 * apply the assessment rate again.
 */
function estimateDenverTax(assessedValue: number | null, propertyClass: PropertyClass): TaxEstimate | null {
  if (!assessedValue || assessedValue <= 0) return null;
  const rate = ASSESSMENT_RATES[propertyClass] ?? ASSESSMENT_RATES.commercial;
  if (rate === 0) return null; // exempt (institutional)
  const estimatedTax = Math.round((assessedValue * DENVER_TOTAL_MILL_LEVY) / 1000);
  // Back-calculate inferred market value from assessed value ÷ assessment rate
  const inferredActualValue = Math.round(assessedValue / rate);
  return {
    assessedValue,
    inferredActualValue,
    assessmentRate: rate,
    millLevy:       DENVER_TOTAL_MILL_LEVY,
    estimatedTax,
    propertyClass:  propertyClass.charAt(0).toUpperCase() + propertyClass.slice(1),
  };
}

// ─────────────────────────────────────────────────────────────────────────────

function TaxTab({
  f,
  denverZoning,
  denverBuilding,
  douglasParcelData,
}: {
  f: ParcelFeature;
  denverZoning?: DenverZoningRaw | null;
  denverBuilding?: DenverBuildingData | null;
  douglasParcelData?: DouglasParcelData | null;
}) {
  const v = f.valuation;
  const isDenver = f.location.county.trim().toLowerCase() === 'denver';
  const isDouglas = f.location.county.toLowerCase() === 'douglas' && !!douglasParcelData;
  const zoneCode = denverZoning?.zoneDistrict ?? f.zoning.code ?? '';
  const propertyClass = classifyPropertyType(zoneCode, f.zoning.landUseDescription, f.zoning.landUseCode);
  const denverTaxEstimate = isDenver ? estimateDenverTax(v.assessedValue ?? v.improvementValue ?? null, propertyClass) : null;
  const douglasTaxableAssessedValue = douglasParcelData?.latestTaxReport?.taxableAssessedValue ?? douglasParcelData?.totalAssessedValue ?? null;
  const douglasActualValueForRate =
    douglasParcelData?.latestTaxReport?.taxableActualValue ??
    douglasParcelData?.latestTaxReport?.totalActualValue ??
    douglasParcelData?.totalActualValue ??
    null;
  const taxEstimate = isDouglas
    ? {
        assessedValue: douglasTaxableAssessedValue ?? 0,
        inferredActualValue: douglasActualValueForRate,
        assessmentRate:
          douglasActualValueForRate && douglasTaxableAssessedValue
            ? douglasTaxableAssessedValue / douglasActualValueForRate
            : 0,
        millLevy: douglasParcelData.fullMillLevy ?? douglasParcelData.reducedMillLevy ?? 0,
        estimatedTax:
          douglasParcelData.estimatedAnnualTax ??
          (douglasTaxableAssessedValue && (douglasParcelData.fullMillLevy ?? douglasParcelData.reducedMillLevy)
            ? Math.round((douglasTaxableAssessedValue * (douglasParcelData.fullMillLevy ?? douglasParcelData.reducedMillLevy ?? 0)) / 1000)
            : 0),
        propertyClass: douglasParcelData.accountType ?? normalizePropertyType(f, denverBuilding, douglasParcelData),
      }
    : denverTaxEstimate;
  const buildingSizeForTax = getBuildingSize(denverBuilding, douglasParcelData);
  const unitCountForTax = getBuildingUnits(denverBuilding, douglasParcelData);
  const normalizedPropertyType = normalizePropertyType(f, denverBuilding, douglasParcelData);
  const taxPerBuildingSqft =
    taxEstimate && buildingSizeForTax && buildingSizeForTax > 0
      ? taxEstimate.estimatedTax / buildingSizeForTax
      : null;
  const taxPerUnit =
    taxEstimate && unitCountForTax && unitCountForTax > 0 && normalizedPropertyType === 'Multifamily'
      ? taxEstimate.estimatedTax / unitCountForTax
      : null;
  const [comparables, setComparables] = useState<ComparableProperty[]>([]);
  const [comparablesLoading, setComparablesLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadComparables() {
      if (!isDenver || !taxEstimate || !denverBuilding?.totalBuildingSqft) {
        setComparables([]);
        return;
      }

      setComparablesLoading(true);
      try {
        const nearby = await queryParcelsNearby(f.location.lng, f.location.lat, 0.25, 80);
        const candidates = nearby.filter((candidate) => candidate.identity.apn !== f.identity.apn);

        const nearbyLimited = candidates
          .map((candidate) => ({
            feature: candidate,
            distanceMiles: haversineMiles(
              f.location.lat,
              f.location.lng,
              candidate.location.lat,
              candidate.location.lng,
            ),
          }))
          .sort((a, b) => a.distanceMiles - b.distanceMiles)
          .slice(0, 30)
          .map((item) => item.feature);

        const buildingMap = await queryDenverBuildings(nearbyLimited.map((candidate) => candidate.identity.apn));
        const candidateBuildings = nearbyLimited.map((candidate) => ({
          feature: candidate,
          building: buildingMap.get(candidate.identity.apn) ?? null,
        }));

        const now = Date.now();
        const ranked = candidateBuildings
          .filter((item): item is { feature: ParcelFeature; building: DenverBuildingData } => !!item.building)
          .map((item) => {
            const compPropertyType = normalizePropertyType(item.feature, item.building);
            const compTaxEstimate = estimateDenverTax(
              item.feature.valuation.assessedValue ?? item.feature.valuation.improvementValue ?? null,
              classifyPropertyType(
                item.feature.zoning.code ?? '',
                item.feature.zoning.landUseDescription,
                item.feature.zoning.landUseCode,
              )
            );
            const distanceMiles = haversineMiles(
              f.location.lat,
              f.location.lng,
              item.feature.location.lat,
              item.feature.location.lng,
            );
            const buildingSqft = item.building.totalBuildingSqft ?? 0;
            const sizeDelta = Math.abs(buildingSqft - denverBuilding.totalBuildingSqft!) / denverBuilding.totalBuildingSqft!;
            const sameNeighborhood =
              !!denverBuilding.neighborhoodName &&
              !!item.building.neighborhoodName &&
              denverBuilding.neighborhoodName.trim().toLowerCase() === item.building.neighborhoodName.trim().toLowerCase();
            const saleTime = parseComparableSaleDate(item.feature.valuation.lastSaleDate);
            const soldWithinThreeYears = !!saleTime && now - saleTime <= 3 * 365 * 24 * 60 * 60 * 1000;

            return {
              feature: item.feature,
              building: item.building,
              propertyType: compPropertyType,
              estimatedTax: compTaxEstimate?.estimatedTax ?? 0,
              taxPerBuildingSqft:
                compTaxEstimate?.estimatedTax && buildingSqft > 0
                  ? compTaxEstimate.estimatedTax / buildingSqft
                  : null,
              distanceMiles,
              sizeDelta,
              sameNeighborhood,
              saleTime,
              soldWithinThreeYears,
            };
          })
          .filter((item) =>
            item.propertyType === normalizedPropertyType &&
            item.building.totalBuildingSqft &&
            item.sizeDelta <= 0.10 &&
            (item.sameNeighborhood || item.distanceMiles <= 0.05) &&
            item.estimatedTax > 0
          )
          .sort((a, b) => {
            if (a.soldWithinThreeYears !== b.soldWithinThreeYears) return a.soldWithinThreeYears ? -1 : 1;
            if ((b.saleTime ?? 0) !== (a.saleTime ?? 0)) return (b.saleTime ?? 0) - (a.saleTime ?? 0);
            if (a.sameNeighborhood !== b.sameNeighborhood) return a.sameNeighborhood ? -1 : 1;
            if (a.sizeDelta !== b.sizeDelta) return a.sizeDelta - b.sizeDelta;
            return a.distanceMiles - b.distanceMiles;
          })
          .slice(0, 5)
          .map(({ sizeDelta: _sizeDelta, sameNeighborhood: _sameNeighborhood, saleTime: _saleTime, soldWithinThreeYears: _soldWithinThreeYears, ...rest }) => rest);

        if (!cancelled) {
          setComparables(ranked);
        }
      } catch {
        if (!cancelled) {
          setComparables([]);
        }
      } finally {
        if (!cancelled) {
          setComparablesLoading(false);
        }
      }
    }

    void loadComparables();

    return () => {
      cancelled = true;
    };
  }, [denverBuilding, denverZoning?.zoneDistrict, f, isDenver, normalizedPropertyType, taxEstimate]);

  const averageCompTaxPerSf =
    comparables.length > 0
      ? comparables.reduce((sum, comp) => sum + (comp.taxPerBuildingSqft ?? 0), 0) /
        comparables.filter((comp) => comp.taxPerBuildingSqft !== null).length
      : null;
  const projectedTaxLiability =
    averageCompTaxPerSf !== null && buildingSizeForTax
      ? averageCompTaxPerSf * buildingSizeForTax
      : null;
  const projectedAssessedValue =
    projectedTaxLiability !== null
      ? (projectedTaxLiability * 1000) / DENVER_TOTAL_MILL_LEVY
      : null;

  const handleExportPdf = () => {
    if (!taxEstimate) return;

    const mapCanvas = document.querySelector('canvas.maplibregl-canvas') as HTMLCanvasElement | null;
    let mapImage = '';
    try {
      mapImage = mapCanvas?.toDataURL('image/png') ?? '';
    } catch {
      mapImage = '';
    }

    const compRows = comparables.map((comp) => `
      <tr>
        <td>${escapeHtml(comp.feature.location.situsAddress || comp.feature.identity.apn)}</td>
        <td>${escapeHtml(fmtSqft(comp.feature.identity.sqft))}</td>
        <td>${escapeHtml(fmtSqft(comp.building.totalBuildingSqft))}</td>
        <td>${escapeHtml(fmtCurrencyCompact(comp.estimatedTax))}</td>
        <td>${escapeHtml(comp.taxPerBuildingSqft !== null ? `$${comp.taxPerBuildingSqft.toFixed(2)}` : '—')}</td>
      </tr>
    `).join('');

    const conclusion = projectedTaxLiability !== null
      ? `Based on the selected comparable properties, the subject's indicated tax liability is approximately ${formatCurrency(Math.round(projectedTaxLiability))}, or ${averageCompTaxPerSf ? `$${averageCompTaxPerSf.toFixed(2)} per building square foot` : '—'}. This estimate is intended as a market-supported reference point and should be considered alongside current assessed value, future reassessment timing, and any exemptions or special district adjustments.`
      : `Comparable properties were reviewed to benchmark the subject's current tax position. Additional market data or a broader comp set may be needed to develop a projected tax liability conclusion.`;

    const reportWindow = window.open('', '_blank', 'width=1100,height=900');
    if (!reportWindow) return;

    const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Tax Report - ${escapeHtml(f.location.situsAddress || f.identity.apn)}</title>
    <style>
      body { font-family: Georgia, 'Times New Roman', serif; color: #1d1d1f; margin: 0; background: #fff; }
      .page { padding: 28px 40px; max-width: 980px; margin: 0 auto; }
      h1 { font-size: 36px; line-height: 1.05; color: #0c5b4f; margin: 0 0 12px; font-weight: 500; }
      h2 { font-size: 22px; color: #6b8790; margin: 20px 0 8px; font-family: Arial, sans-serif; font-weight: 700; }
      h3 { font-size: 16px; color: #6b8790; margin: 14px 0 6px; font-family: Arial, sans-serif; }
      p, li, td, th, div { font-family: Arial, sans-serif; }
      p { font-size: 13px; line-height: 1.45; margin: 0 0 9px; }
      ul { margin: 0 0 8px 18px; }
      li { margin: 3px 0; font-size: 13px; }
      .formula { text-align: center; font-weight: 700; margin: 10px 0; font-size: 16px; }
      .map-wrap { margin: 12px auto 16px; border: 1px solid #d6d6d6; padding: 8px; width: 58%; max-width: 440px; }
      .map-wrap img { width: 100%; max-height: 250px; object-fit: cover; height: auto; display: block; }
      .caption { font-size: 10px; color: #666; margin-top: 5px; }
      table { width: 100%; border-collapse: collapse; margin: 8px 0 14px; font-size: 12px; }
      th, td { border-bottom: 1px solid #d9d9d9; padding: 6px 6px; text-align: left; vertical-align: top; }
      th { background: #f5f7f8; color: #45626a; font-weight: 700; }
      .hero { border: 1px solid #d8e6e1; background: #f5fbf9; padding: 12px 14px; margin: 10px 0 12px; }
      .hero-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px 18px; margin-top: 6px; }
      .label { color: #667085; font-size: 10px; text-transform: uppercase; letter-spacing: .04em; }
      .value { color: #111827; font-size: 15px; font-weight: 700; margin-top: 1px; }
      .footer-note { color: #667085; font-size: 10px; margin-top: 12px; }
      .compact-section { page-break-inside: avoid; break-inside: avoid; }
      @media print {
        @page { size: letter portrait; margin: 0.45in; }
        .page { padding: 0; max-width: none; }
        h1 { font-size: 32px; }
        h2 { font-size: 20px; margin-top: 16px; }
        .map-wrap { width: 52%; max-width: 380px; margin-bottom: 12px; }
        .map-wrap img { max-height: 210px; }
      }
    </style>
  </head>
  <body>
    <div class="page">
      <h1>Tax and Assessment Data</h1>
      <p>
        The following summarizes the local assessor's estimate of the subject's market value, assessed value, and
        taxes and presents a market-supported tax comparison based on nearby comparable properties. The report is
        intended to show current tax position, an estimated current liability, and an indicated projected liability
        based on comparable tax burdens.
      </p>

      ${mapImage ? `
        <div class="map-wrap">
          <img src="${mapImage}" alt="Subject parcel map" />
          <div class="caption">Subject parcel map at time of export with selected parcel boundary outlined.</div>
        </div>
      ` : ''}

      <div class="compact-section">
      <h2>Colorado Real Estate Tax Overview</h2>
      <p>Colorado property taxes are generally calculated using three core components:</p>
      <ul>
        <li>Assessor's actual value</li>
        <li>Assessment rate</li>
        <li>Mill levy</li>
      </ul>

      <h3>Assessor's Actual Value</h3>
      <p>
        Under Colorado law, real property is revalued on a recurring statutory cycle. The county assessor estimates
        actual value using market evidence and recognized appraisal methods. The resulting actual value is not itself
        the taxable base; it is the starting point for assessment.
      </p>

      <h3>Assessment Rate and Assessed Value</h3>
      <p>
        Colorado applies an assessment rate to actual value to derive assessed value. The assessed value is the tax
        base used for property tax calculations and varies by property class under state law.
      </p>
      <div class="formula">Assessor's Actual Value × Assessment Rate = Assessed Value</div>

      <h3>Tax Rate / Mill Levy</h3>
      <p>
        The mill levy is established by taxing authorities and represents the amount of tax due per $1,000 of
        assessed value. Once assessed value is determined, the annual property tax liability is calculated by
        applying the applicable mill levy.
      </p>
      <div class="formula">Assessed Value × Mill Levy = Property Tax Due</div>
      </div>

      <div class="compact-section">
      <h2>Current Tax Assessment and Liability</h2>
      <div class="hero">
        <div><strong>Subject Property:</strong> ${escapeHtml(f.location.situsAddress || f.identity.apn)}</div>
        <div class="hero-grid">
          <div><div class="label">Property Type</div><div class="value">${escapeHtml(normalizedPropertyType)}</div></div>
          <div><div class="label">Building Size</div><div class="value">${escapeHtml(fmtSqft(buildingSizeForTax))}</div></div>
          <div><div class="label">Inferred Market Value</div><div class="value">${escapeHtml(fmtCurrencyCompact(taxEstimate.inferredActualValue))}</div></div>
          <div><div class="label">Assessed Value</div><div class="value">${escapeHtml(fmtCurrencyCompact(taxEstimate.assessedValue))}</div></div>
          <div><div class="label">Mill Levy</div><div class="value">${taxEstimate.millLevy.toFixed(3)} mills</div></div>
          <div><div class="label">Current Tax Liability</div><div class="value">${escapeHtml(fmtCurrencyCompact(taxEstimate.estimatedTax))}</div></div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Metric</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Assessed Value</td><td>${escapeHtml(fmtCurrencyCompact(taxEstimate.assessedValue))}</td></tr>
          <tr><td>Estimated Annual Tax</td><td>${escapeHtml(fmtCurrencyCompact(taxEstimate.estimatedTax))}</td></tr>
          <tr><td>Tax Liability per Building SF</td><td>${escapeHtml(taxPerBuildingSqft !== null ? `$${taxPerBuildingSqft.toFixed(2)}` : '—')}</td></tr>
          <tr><td>Tax Liability per Unit</td><td>${escapeHtml(taxPerUnit !== null ? fmtCurrencyCompact(Math.round(taxPerUnit)) : '—')}</td></tr>
          <tr><td>Property Class Used for Estimate</td><td>${escapeHtml(taxEstimate.propertyClass)}</td></tr>
        </tbody>
      </table>
      </div>

      <div class="compact-section">
      <h2>Projected Tax Liability with Comparable Properties</h2>
      <p>
        To benchmark the subject's tax burden, comparable parcels were selected from the same neighborhood or within
        a 0.05-mile radius, matched by property type, and screened to remain within 10% of the subject's building
        size. Recent sales were prioritized in the ranking where available.
      </p>

      <table>
        <thead>
          <tr>
            <th>Address</th>
            <th>Lot Size</th>
            <th>Building Size</th>
            <th>Tax Liability</th>
            <th>Tax Liability / SF</th>
          </tr>
        </thead>
        <tbody>
          ${compRows || '<tr><td colspan="5">No qualifying comparable properties were available at the time of export.</td></tr>'}
        </tbody>
      </table>

      <table>
        <thead>
          <tr>
            <th>Projected Metric</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Average Comparable Tax / SF</td><td>${escapeHtml(averageCompTaxPerSf !== null ? `$${averageCompTaxPerSf.toFixed(2)}` : '—')}</td></tr>
          <tr><td>Projected Assessed Value</td><td>${escapeHtml(projectedAssessedValue !== null ? fmtCurrencyCompact(Math.round(projectedAssessedValue)) : '—')}</td></tr>
          <tr><td>Projected Tax Liability</td><td>${escapeHtml(projectedTaxLiability !== null ? fmtCurrencyCompact(Math.round(projectedTaxLiability)) : '—')}</td></tr>
        </tbody>
      </table>
      </div>

      <div class="compact-section">
      <h2>Conclusion</h2>
      <p>${escapeHtml(conclusion)}</p>
      </div>

      <div class="footer-note">
        Prepared from Colorado parcel data, Denver assessor data, and in-app comparable screening. Exported ${escapeHtml(new Date().toLocaleString())}.
      </div>
    </div>
  </body>
</html>`;

    reportWindow.document.open();
    reportWindow.document.write(html);
    reportWindow.document.close();
    reportWindow.focus();
    reportWindow.onload = () => {
      setTimeout(() => reportWindow.print(), 200);
    };
  };

  return (
    <>
      {/* ── Denver Tax Estimate ── */}
      {(isDenver || isDouglas) && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ap-t3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {isDouglas ? 'Douglas County Tax Position' : 'Estimated Annual Tax'}
            </div>
            <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 99, background: 'rgba(52,199,89,0.12)', color: '#166534', fontWeight: 600 }}>
              {isDouglas
                ? `Douglas Assessor · ${douglasParcelData?.latestTaxReport?.taxYear ?? new Date().getFullYear()} live`
                : 'Denver 2025 · Payable 2026'}
            </span>
            {isDenver && (
              <button
                onClick={handleExportPdf}
                style={{
                  marginLeft: 'auto',
                  padding: '7px 10px',
                  borderRadius: 8,
                  border: '1px solid rgba(0,113,227,0.18)',
                  background: 'rgba(0,113,227,0.06)',
                  color: '#0051b3',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                PDF Tax Report
              </button>
            )}
          </div>

          {taxEstimate ? (
            <>
              {/* Result hero */}
              <div style={{
                borderRadius: 12,
                border: '1.5px solid rgba(0,113,227,0.2)',
                background: 'rgba(0,113,227,0.04)',
                padding: '14px 16px',
                marginBottom: 10,
              }}>
                <div style={{ fontSize: 11, color: 'var(--ap-t3)', marginBottom: 2 }}>
                  Estimated Annual Property Tax
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#0051b3', letterSpacing: '-0.02em' }}>
                  {formatCurrency(taxEstimate.estimatedTax)}
                </div>
                <div style={{ fontSize: 11, color: 'var(--ap-t3)', marginTop: 2 }}>
                  {taxEstimate.propertyClass} · {taxEstimate.millLevy.toFixed(3)} mills total
                </div>
                <div style={{ fontSize: 11, color: 'var(--ap-t3)', marginTop: 4 }}>
                  Property Type: {normalizedPropertyType}
                </div>
                {taxPerBuildingSqft !== null && (
                  <div style={{ fontSize: 12, color: '#0051b3', fontWeight: 600, marginTop: 6 }}>
                    ${taxPerBuildingSqft.toFixed(2)} per building sf
                  </div>
                )}
                {taxPerUnit !== null && (
                  <div style={{ fontSize: 12, color: '#0051b3', fontWeight: 600, marginTop: 4 }}>
                    {formatCurrency(Math.round(taxPerUnit))} per unit
                  </div>
                )}
              </div>

              {/* Inferred market value note */}
              {taxEstimate.inferredActualValue && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', borderRadius: 8, background: 'rgba(0,0,0,0.025)', border: '1px solid var(--ap-sep)', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: 'var(--ap-t3)' }}>Inferred Market Value</span>
                  <span style={{ fontSize: 11, color: 'var(--ap-t2)', fontWeight: 600 }}>
                    ~{formatCurrency(taxEstimate.inferredActualValue)}
                    {taxEstimate.assessmentRate > 0 && (
                      <span style={{ fontWeight: 400, color: 'var(--ap-t3)' }}> (assessed ÷ {(taxEstimate.assessmentRate * 100).toFixed(2)}%)</span>
                    )}
                  </span>
                </div>
              )}

              {/* Calculation steps */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
                {([
                  ['Assessed Value (County Assessor)', formatCurrency(taxEstimate.assessedValue)],
                  ...(isDouglas && douglasParcelData?.latestTaxReport?.taxableActualValue
                    ? [['Taxable Actual Value', formatCurrency(douglasParcelData.latestTaxReport.taxableActualValue)]]
                    : []),
                  ...(taxPerBuildingSqft !== null
                    ? [['Tax per Building SF', `$${taxPerBuildingSqft.toFixed(2)}/sf`]]
                    : []),
                  ...(taxPerUnit !== null
                    ? [['Tax per Unit', formatCurrency(Math.round(taxPerUnit))]]
                    : []),
                  ['Total Mill Levy', `${taxEstimate.millLevy.toFixed(3)} mills`],
                  ['Estimated Annual Tax', formatCurrency(taxEstimate.estimatedTax)],
                ] as [string, string][]).map(([label, val], i, arr) => (
                  <div key={label} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '7px 10px',
                    borderRadius: 8,
                    background: i === arr.length - 1 ? 'rgba(0,113,227,0.06)' : 'rgba(0,0,0,0.025)',
                    border: `1px solid ${i === arr.length - 1 ? 'rgba(0,113,227,0.15)' : 'var(--ap-sep)'}`,
                    fontWeight: i === arr.length - 1 ? 700 : 400,
                  }}>
                    <span style={{ fontSize: 12, color: i === arr.length - 1 ? '#0051b3' : 'var(--ap-t3)' }}>{label}</span>
                    <span style={{ fontSize: 13, color: i === arr.length - 1 ? '#0051b3' : 'var(--ap-t1)' }}>{val}</span>
                  </div>
                ))}
              </div>

              {isDenver && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ap-t3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>
                  Comparable Properties
                </div>
                {comparablesLoading ? (
                  <div style={{ fontSize: 12, color: 'var(--ap-t3)', padding: '8px 0' }}>
                    Loading comparable properties…
                  </div>
                ) : comparables.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {comparables.map((comp) => (
                      <div key={comp.feature.id} style={{ borderRadius: 10, border: '1px solid var(--ap-sep)', background: 'rgba(0,0,0,0.02)', padding: '10px 12px' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ap-t1)' }}>
                          {comp.feature.location.situsAddress || comp.feature.identity.apn}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--ap-t3)', marginTop: 2 }}>
                          {comp.building.neighborhoodName ?? comp.feature.location.city} · {comp.distanceMiles.toFixed(2)} mi away
                          {comp.feature.valuation.lastSaleDate ? ` · Sold ${formatDate(comp.feature.valuation.lastSaleDate)}` : ''}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 8 }}>
                          <div style={{ fontSize: 11, color: 'var(--ap-t3)' }}>Lot Size<br /><span style={{ fontSize: 12, color: 'var(--ap-t1)', fontWeight: 600 }}>{comp.feature.identity.sqft ? `${formatNumber(comp.feature.identity.sqft)} sf` : '—'}</span></div>
                          <div style={{ fontSize: 11, color: 'var(--ap-t3)' }}>Building Size<br /><span style={{ fontSize: 12, color: 'var(--ap-t1)', fontWeight: 600 }}>{comp.building.totalBuildingSqft ? `${formatNumber(comp.building.totalBuildingSqft)} sf` : '—'}</span></div>
                          <div style={{ fontSize: 11, color: 'var(--ap-t3)' }}>Tax Liability<br /><span style={{ fontSize: 12, color: 'var(--ap-t1)', fontWeight: 600 }}>{formatCurrency(comp.estimatedTax)}</span></div>
                          <div style={{ fontSize: 11, color: 'var(--ap-t3)' }}>Tax Liability / SF<br /><span style={{ fontSize: 12, color: 'var(--ap-t1)', fontWeight: 600 }}>{comp.taxPerBuildingSqft !== null ? `$${comp.taxPerBuildingSqft.toFixed(2)}/sf` : '—'}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: 'var(--ap-t3)', padding: '8px 0' }}>
                    No comparable Denver parcels met the current filters for type, neighborhood or radius, and building size.
                  </div>
                )}
              </div>
              )}

              {/* Mill levy breakdown */}
              {isDenver && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ap-t3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>
                  Mill Levy Breakdown
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {DENVER_MILL_LEVY_COMPONENTS.map(c => (
                    <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 8px', borderRadius: 6, background: 'rgba(0,0,0,0.02)' }}>
                      <span style={{ fontSize: 11, color: 'var(--ap-t2)' }}>{c.name}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ap-t1)', fontVariantNumeric: 'tabular-nums' }}>
                        {c.mills.toFixed(3)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              )}

              {isDouglas && douglasParcelData && (
                <div style={{ marginBottom: 12, padding: '10px 12px', borderRadius: 10, background: 'rgba(0,0,0,0.02)', border: '1px solid var(--ap-sep)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ap-t3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
                    Douglas Assessor Sources
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <a href={douglasParcelData.detailUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#0051b3', textDecoration: 'none', fontWeight: 600 }}>
                      Property Detail Record ↗
                    </a>
                    <a href={douglasParcelData.estimatedTaxesUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#0051b3', textDecoration: 'none', fontWeight: 600 }}>
                      Estimated Taxes Report ↗
                    </a>
                    <div style={{ fontSize: 11, color: 'var(--ap-t3)', marginTop: 2 }}>
                      Tax District {douglasParcelData.taxDistrictNumber || '—'} · Full mill levy {douglasParcelData.fullMillLevy?.toFixed(3) ?? '—'}
                      {douglasParcelData.reducedMillLevy !== null ? ` · Reduced levy ${douglasParcelData.reducedMillLevy.toFixed(3)}` : ''}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ padding: '12px', borderRadius: 10, background: 'rgba(0,0,0,0.03)', border: '1px dashed var(--ap-sep)', fontSize: 12, color: 'var(--ap-t3)', lineHeight: 1.5 }}>
              Appraised value required to estimate tax. The ESRI parcel service did not return a value for this property.
            </div>
          )}
        </div>
      )}

      {/* ── Valuation from ESRI ── */}
      <Section title="Valuation (ESRI Statewide Layer)">
        <Row label="Total Market Value"  value={formatCurrency(v.marketValue)} />
        <Row label="Assessed Value"      value={formatCurrency(v.assessedValue)} />
        <Row label="Land Value"          value={
          v.landValue ? formatCurrency(v.landValue) :
          <span style={{ color: 'var(--ap-t3)', fontSize: 11 }}>Not in statewide layer</span>
        } />
        <Row label="Improvement Value"   value={
          v.improvementValue ? formatCurrency(v.improvementValue) :
          <span style={{ color: 'var(--ap-t3)', fontSize: 11 }}>Not in statewide layer</span>
        } />
        <Row label="Est. Annual Tax"     value={taxEstimate ? formatCurrency(taxEstimate.estimatedTax) : '—'} />
      </Section>

      <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(255,159,10,0.07)', fontSize: 12, color: '#b25a00', lineHeight: 1.5 }}>
        {isDenver
          ? `Estimate = County Assessed Value × ${DENVER_BASE_MILL_LEVY} mills (City 26.328 + DPS 52.274 + Urban Drainage 1.000) + RTD/SCFD (~0.9 mills). 2025 rates per Denver Abstract of Assessment (taxes payable 2026). No value subtractions in 2025 (SB24-233 exemptions expired). Actual tax may vary with senior/veteran exemptions, TIF redirections, metro district levies, or special improvement districts. Source: denvergov.org/assessor.`
          : isDouglas
          ? `Douglas County values and improvement detail are sourced from the county parcel view and live assessor detail JSON. The app now prefers the latest Douglas estimated-tax report for tax year, taxable assessed value, full mill levy, and estimated taxes, and falls back to live tax-authority totals only if the report is unavailable.`
          : `Assessment values from ${v.taxYear ?? 'the parcel service'}. Actual tax may vary with exemptions, abatements, and mill levy changes.`
        }
      </div>
    </>
  );
}

function CouncilTab({ f }: { f: ParcelFeature }) {
  const county = f.location.county;
  const city = f.location.city;

  return (
    <>
      <Section title="Jurisdiction">
        <Row label="County"    value={county || '—'} />
        <Row label="City / Town" value={city || 'Unincorporated'} />
        <Row label="State"     value="Colorado" />
      </Section>

      <div style={{ padding: '12px', borderRadius: 10, background: 'rgba(0,113,227,0.06)', fontSize: 12, lineHeight: 1.6 }}>
        <div style={{ fontWeight: 600, color: 'var(--ap-blue)', marginBottom: 4 }}>Coming Soon</div>
        <div style={{ color: 'var(--ap-t2)' }}>
          Council district, elected officials, precinct data, and meeting schedules will be added as district boundary data is integrated.
        </div>
      </div>
    </>
  );
}

function ActivityTab({ f, nearbyArticles }: { f: ParcelFeature; nearbyArticles: (NakedDenverArticle & { distanceMiles: number })[] }) {
  return (
    <>
      <Section title="Development Activity">
        <EmptyBadge label="No recent permit or application activity on file." />
      </Section>
      <Section title="Naked Denver Context">
        {nearbyArticles.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {nearbyArticles.slice(0, 5).map((article) => (
              <a
                key={article.id}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  textDecoration: 'none',
                  borderRadius: 10,
                  border: '1px solid var(--ap-sep)',
                  background: 'rgba(245,158,11,0.05)',
                  padding: '10px 12px',
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ap-t1)', lineHeight: 1.4 }}>
                  {article.title}
                </div>
                <div style={{ fontSize: 11, color: 'var(--ap-t3)', marginTop: 3 }}>
                  {(article.address || article.neighborhood || 'Denver article location') + ' · ' + `${article.distanceMiles.toFixed(2)} mi away`}
                </div>
                {(article.publishedAt || article.developmentType) && (
                  <div style={{ fontSize: 11, color: 'var(--ap-t3)', marginTop: 4 }}>
                    {[article.publishedAt ? formatDate(article.publishedAt) : null, article.developmentType].filter(Boolean).join(' · ')}
                  </div>
                )}
                {article.summary && (
                  <div style={{ fontSize: 11, color: 'var(--ap-t2)', lineHeight: 1.5, marginTop: 6 }}>
                    {article.summary}
                  </div>
                )}
              </a>
            ))}
          </div>
        ) : (
          <div style={{ padding: '12px', borderRadius: 10, background: 'rgba(0,0,0,0.03)', border: '1px dashed var(--ap-sep)', fontSize: 12, color: 'var(--ap-t3)', lineHeight: 1.5 }}>
            No Naked Denver article points are loaded nearby yet. Once articles are added to the local article dataset, nearby development coverage will appear here automatically.
          </div>
        )}
      </Section>
      <div style={{ padding: '12px', borderRadius: 10, background: 'rgba(52,199,89,0.07)', fontSize: 12, lineHeight: 1.6 }}>
        <div style={{ fontWeight: 600, color: '#1a7c35', marginBottom: 4 }}>Coming Soon</div>
        <div style={{ color: 'var(--ap-t2)' }}>
          Building permits, planning applications, variances, and recent sales for{' '}
          <strong>{f.identity.apn}</strong> will appear here once permit data is integrated.
        </div>
      </div>
    </>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ParcelPanel({
  feature,
  open,
  address,
  neighbourhood,
  denverZoning,
  denverBuilding,
  douglasParcelData,
  nearbyArticles,
  boundarySelection,
  onClose,
}: ParcelPanelProps) {
  const [activeTab, setActiveTab] = useState<PanelTab>('parcel');
  const [resolvedDenverZoning, setResolvedDenverZoning] = useState<DenverZoningRaw | null>(denverZoning);
  const [resolvedDenverBuilding, setResolvedDenverBuilding] = useState<DenverBuildingData | null>(denverBuilding);
  const boundaryMode = !feature && !!boundarySelection;

  const panelW = 380;

  useEffect(() => {
    setActiveTab('parcel');
  }, [feature?.identity.apn, boundarySelection?.name, boundarySelection?.type]);

  useEffect(() => {
    setResolvedDenverZoning(denverZoning);
  }, [denverZoning]);

  useEffect(() => {
    setResolvedDenverBuilding(denverBuilding);
  }, [denverBuilding]);

  useEffect(() => {
    let cancelled = false;

    async function hydrateDenverSidebar() {
      if (!feature || feature.location.county.trim().toLowerCase() !== 'denver') return;

      const center = getGeometryCenter(feature.geometry as GeoJSON.Geometry);
      const candidatePoints: Array<[number, number]> = [
        ...(center ? [center] : []),
        [feature.location.lng, feature.location.lat],
      ].filter(([lng, lat], index, arr) =>
        Number.isFinite(lng) &&
        Number.isFinite(lat) &&
        arr.findIndex(([otherLng, otherLat]) => otherLng === lng && otherLat === lat) === index
      );

      if (!resolvedDenverZoning?.zoneDistrict) {
        for (const [candidateLng, candidateLat] of candidatePoints) {
          try {
            const zoning = await queryDenverZoning(candidateLat, candidateLng);
            if (!cancelled && zoning?.zoneDistrict) {
              setResolvedDenverZoning(zoning);
              break;
            }
          } catch {
            continue;
          }
        }
      }

      if (!resolvedDenverBuilding) {
        try {
          const building = await queryDenverBuilding(feature.identity.apn);
          if (!cancelled && building) {
            setResolvedDenverBuilding(building);
          }
        } catch {
          // keep null and let parcel fallback render
        }
      }
    }

    void hydrateDenverSidebar();

    return () => {
      cancelled = true;
    };
  }, [feature, resolvedDenverBuilding, resolvedDenverZoning?.zoneDistrict]);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: panelW,
        height: '100%',
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRight: '1px solid var(--ap-sep)',
        boxShadow: '4px 0 32px rgba(0,0,0,0.12)',
        transform: open ? 'translateX(0)' : `translateX(-${panelW + 8}px)`,
        transition: 'transform 300ms cubic-bezier(0.4,0,0.2,1)',
        willChange: 'transform',
      }}
    >
      {/* ── Header ── */}
      <div style={{ padding: '16px 18px 0', flexShrink: 0 }}>
        {/* Address + close */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ap-t1)', lineHeight: 1.3, wordBreak: 'break-word' }}>
              {feature?.location.situsAddress || boundarySelection?.name || address || 'Selected Location'}
            </div>
            {(feature?.location.city || feature?.location.county || boundarySelection?.countyName) && (
              <div style={{ fontSize: 12, color: 'var(--ap-t3)', marginTop: 2 }}>
                {feature
                  ? (neighbourhood
                      ? [neighbourhood, feature.location.city, feature.location.county + ' County', 'CO'].filter(Boolean).join(', ')
                      : [feature.location.city, feature.location.county + ' County', 'CO'].filter(Boolean).join(', '))
                  : boundarySelection
                  ? [
                      boundarySelection.type === 'county'
                        ? 'County boundary'
                        : boundarySelection.type === 'neighborhood'
                        ? 'Neighborhood boundary'
                        : 'Town boundary',
                      boundarySelection.countyName + ' County',
                      'CO',
                    ].join(', ')
                  : null}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              flexShrink: 0,
              width: 28, height: 28,
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(0,0,0,0.06)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--ap-t2)',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* APN pill */}
        {feature && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12, marginTop: 6 }}>
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: 'rgba(0,113,227,0.10)', color: '#0051b3', fontWeight: 600 }}>
              APN: {feature.identity.apn}
            </span>
            {feature.identity.sqft && (
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: 'rgba(0,0,0,0.06)', color: 'var(--ap-t2)', fontWeight: 500 }}>
                {formatNumber(feature.identity.sqft)} sf
              </span>
            )}
            {resolvedDenverZoning?.zoneDistrict && (
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: 'rgba(0,113,227,0.10)', color: '#0051b3', fontWeight: 700 }}>
                {resolvedDenverZoning.zoneDistrict}
              </span>
            )}
            {!resolvedDenverZoning?.zoneDistrict && douglasParcelData?.zoningCode && (
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: 'rgba(0,113,227,0.10)', color: '#0051b3', fontWeight: 700 }}>
                {douglasParcelData.zoningCode}
              </span>
            )}
            {feature._source === 'esri' && (
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: 'rgba(52,199,89,0.10)', color: '#1a7c35', fontWeight: 500 }}>
                ESRI Live
              </span>
            )}
          </div>
        )}

        {boundaryMode && boundarySelection && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12, marginTop: 6 }}>
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: 'rgba(0,113,227,0.10)', color: '#0051b3', fontWeight: 700 }}>
              {boundarySelection.type === 'county' ? 'County' : boundarySelection.type === 'neighborhood' ? 'Neighborhood' : 'Town'}
            </span>
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: 'rgba(0,0,0,0.06)', color: 'var(--ap-t2)', fontWeight: 500 }}>
              {boundarySelection.countyName} County
            </span>
          </div>
        )}

        {/* Tab bar */}
        {!boundaryMode && (
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid var(--ap-sep)',
              marginLeft: -18,
              marginRight: -18,
              paddingLeft: 18,
              overflowX: 'auto',
              gap: 0,
            }}
          >
            {TABS.map(tab => {
              const active = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '8px 14px',
                    fontSize: 13,
                    fontWeight: active ? 600 : 400,
                    color: active ? 'var(--ap-blue)' : 'var(--ap-t3)',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    borderBottom: active ? '2px solid var(--ap-blue)' : '2px solid transparent',
                    marginBottom: -1,
                    whiteSpace: 'nowrap',
                    transition: 'color 150ms, border-color 150ms',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Scrollable content ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px 24px' }}>
        {boundaryMode && boundarySelection ? (
          <BoundaryTab boundarySelection={boundarySelection} />
        ) : !feature ? (
          <div style={{ padding: '32px 0', textAlign: 'center' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(0,113,227,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="6.5" stroke="#0071e3" strokeWidth="1.5"/>
                <path d="M9 6v4M9 12v.5" stroke="#0071e3" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div style={{ fontSize: 13, color: 'var(--ap-t2)' }}>No parcel data found at this location.</div>
            <div style={{ fontSize: 12, color: 'var(--ap-t3)', marginTop: 4 }}>
              Try a street address within Colorado.
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'parcel'   && <ParcelTab f={feature} neighbourhood={neighbourhood} denverBuilding={resolvedDenverBuilding} douglasParcelData={douglasParcelData} />}
            {activeTab === 'zoning'   && <ZoningTab f={feature} denverZoning={resolvedDenverZoning} denverBuilding={resolvedDenverBuilding} douglasParcelData={douglasParcelData} />}
            {activeTab === 'tax'      && <TaxTab f={feature} denverZoning={resolvedDenverZoning} denverBuilding={resolvedDenverBuilding} douglasParcelData={douglasParcelData} />}
            {activeTab === 'council'  && <CouncilTab f={feature} />}
            {activeTab === 'activity' && <ActivityTab f={feature} nearbyArticles={nearbyArticles} />}
          </>
        )}
      </div>
    </div>
  );
}
