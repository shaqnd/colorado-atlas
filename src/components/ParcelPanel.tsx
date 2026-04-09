/**
 * ParcelPanel — Slide-in info drawer that appears when a parcel is selected.
 * Floats over the left edge of the map; matches Apple design tokens.
 */

import { useState } from 'react';
import type { ParcelFeature } from '../data/parcelTypes';
import { formatCurrency, formatNumber, formatDate } from '../utils/parcelService';
import type { DenverBuildingData, DenverParcelValuationData, DouglasParcelData, ArapahoeParcelData, JeffersonParcelData } from '../utils/parcelService';
import { runHBUAnalysis } from '../utils/hbuAnalysis';
import { zoneDistrictsByCode } from '../data/zoneDistricts';
import { ALL_COMMUNITIES } from '../data/communities';
import { getDenverZoneDistrict, DENVER_CATEGORY_LABELS } from '../data/denverZoning';
import type { DenverZoningRaw, AuroraZoningRaw, CentennialZoningRaw, DouglasZoningRaw, JeffersonZoningRaw, LarimerZoningRaw, ElPasoZoningRaw, ClearCreekZoningRaw, LakewoodZoningRaw, ArvadaZoningRaw, GreenwoodVillageZoningRaw, LittletonZoningRaw, ThorntonZoningRaw, ArapahoeZoningRaw, BroomfieldZoningRaw, BoulderCountyZoningRaw, WeldZoningRaw, PuebloCountyZoningRaw } from '../utils/parcelService';
import { getAuroraZoneDistrict, AURORA_CATEGORY_LABELS } from '../data/auroraZoning';
import { getCentennialLandUseDistrict, CENTENNIAL_CATEGORY_LABELS } from '../data/centennialZoning';
import { getDouglasZoneDistrict, DOUGLAS_CATEGORY_LABELS } from '../data/douglasZoning';
import { getJeffersonZoneDistrict, JEFFERSON_CATEGORY_LABELS } from '../data/jeffersonZoning';
import { getLarimerZoneDistrict, LARIMER_CATEGORY_LABELS } from '../data/larimerZoning';
import { getElPasoZoneDistrict, ELPASO_CATEGORY_LABELS } from '../data/elpasoZoning';
import { getClearCreekZoneDistrict, CLEARCREEK_CATEGORY_LABELS } from '../data/clearcreekZoning';
import { getLakewoodZoneDistrict, LAKEWOOD_CATEGORY_LABELS } from '../data/lakewoodZoning';
import { getArvadaZoneDistrict, ARVADA_CATEGORY_LABELS } from '../data/arvadaZoning';
import { getGreenwoodVillageZoneDistrict, GREENWOODVILLAGE_CATEGORY_LABELS } from '../data/greenwoodvillageZoning';
import { getLittletonZoneDistrict, LITTLETON_CATEGORY_LABELS } from '../data/littletonZoning';
import { getThorntonZoneDistrict, THORNTON_CATEGORY_LABELS } from '../data/thorntonZoning';
import { getArapahoeZoneDistrict, ARAPAHOE_CATEGORY_LABELS } from '../data/arapahoezoning';
import { getBroomfieldZoneDistrict, BROOMFIELD_CATEGORY_LABELS } from '../data/broomfieldZoning';
import { getBoulderCountyZoneDistrict, BOULDER_COUNTY_CATEGORY_LABELS } from '../data/boulderCountyZoning';
import { getWeldZoneDistrict, WELD_CATEGORY_LABELS } from '../data/weldZoning';
import { getPuebloCountyZoneDistrict, PUEBLO_COUNTY_CATEGORY_LABELS } from '../data/puebloCountyZoning';
import type { Community } from '../data/communities';
import type { HBUResult } from '../data/types';

// ── Tab config ────────────────────────────────────────────────────────────────
type PanelTab = 'parcel' | 'zoning' | 'tax' | 'council' | 'activity';
const TABS: { id: PanelTab; label: string }[] = [
  { id: 'parcel',   label: 'Parcel'   },
  { id: 'zoning',   label: 'Zoning'   },
  { id: 'tax',      label: 'Tax'      },
  { id: 'council',  label: 'Council'  },
  { id: 'activity', label: 'Activity' },
];

// ── Props ─────────────────────────────────────────────────────────────────────
interface ParcelPanelProps {
  feature: ParcelFeature | null;
  open: boolean;
  address: string;
  neighbourhood: string | null;
  denverZoning: DenverZoningRaw | null;
  auroraZoning: AuroraZoningRaw | null;
  centennialZoning: CentennialZoningRaw | null;
  douglasZoning?: DouglasZoningRaw | null;
  jeffersonZoning?: JeffersonZoningRaw | null;
  larimerZoning?: LarimerZoningRaw | null;
  elpasoZoning?: ElPasoZoningRaw | null;
  clearcreekZoning?: ClearCreekZoningRaw | null;
  lakewoodZoning?: LakewoodZoningRaw | null;
  arvadaZoning?: ArvadaZoningRaw | null;
  greenwoodvillageZoning?: GreenwoodVillageZoningRaw | null;
  littletonZoning?: LittletonZoningRaw | null;
  thorntonZoning?: ThorntonZoningRaw | null;
  arapahoeZoning?: ArapahoeZoningRaw | null;
  broomfieldZoning?: BroomfieldZoningRaw | null;
  boulderCountyZoning?: BoulderCountyZoningRaw | null;
  weldZoning?: WeldZoningRaw | null;
  puebloCountyZoning?: PuebloCountyZoningRaw | null;
  denverBuilding?: DenverBuildingData | null;
  denverValuation?: DenverParcelValuationData | null;
  douglasDetail?: DouglasParcelData | null;
  arapahoeDetail?: ArapahoeParcelData | null;
  jeffersonDetail?: JeffersonParcelData | null;
  onClose: () => void;
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

function ParcelTab({ f, neighbourhood, denverBuilding, denverValuation, douglasDetail, arapahoeDetail, jeffersonDetail }: {
  f: ParcelFeature;
  neighbourhood?: string | null;
  denverBuilding?: DenverBuildingData | null;
  denverValuation?: DenverParcelValuationData | null;
  douglasDetail?: DouglasParcelData | null;
  arapahoeDetail?: ArapahoeParcelData | null;
  jeffersonDetail?: JeffersonParcelData | null;
}) {
  const sqftLabel = f.identity.sqft ? `${formatNumber(f.identity.sqft)} sf` : '—';
  const acreLabel = f.identity.acreage ? `${f.identity.acreage.toFixed(3)} ac` : '—';
  const community = findCommunity(f, neighbourhood);

  // Prefer county-enriched values over ESRI statewide layer
  const ownerDisplay = douglasDetail?.ownerName ?? arapahoeDetail?.ownerName ?? jeffersonDetail?.ownerName ?? f.owner.name;
  const subdivisionDisplay = douglasDetail?.subdivision ?? f.identity.subdivision;
  const legalDisplay = douglasDetail?.legalDescription ?? arapahoeDetail?.legalDescription ?? f.identity.legalDescription;

  // Building data — pick from whichever county has it
  const bldg = denverBuilding ?? douglasDetail?.primaryBuilding ?? null;
  const bldgSqft = bldg
    ? ('totalBuildingSqft' in bldg ? bldg.totalBuildingSqft : null)
    : jeffersonDetail?.grossAreaSqft ?? null;
  const bldgUnits = bldg ? bldg.units : null;
  const bldgFloors = bldg ? bldg.floors : null;
  const bldgYearBuilt = bldg ? bldg.yearBuilt : (jeffersonDetail?.yearBuilt ?? null);
  const bldgStyle = bldg ? bldg.style : (jeffersonDetail?.structureType ?? null);
  const hasBuildingData = !!(bldgSqft || bldgUnits || bldgFloors || bldgYearBuilt || bldgStyle);

  const countyDetailSource = denverBuilding ? 'Denver Assessor'
    : douglasDetail ? 'Douglas County Assessor'
    : arapahoeDetail ? 'Arapahoe County Assessor'
    : jeffersonDetail ? 'Jefferson County Assessor'
    : null;

  return (
    <>
      <Section title="Identity">
        <Row label="Parcel ID"     value={f.identity.apn} />
        <Row label="Owner"         value={ownerDisplay} />
        <Row label="County"        value={f.location.county || '—'} />
        <Row label="Subdivision"   value={subdivisionDisplay || '—'} />
      </Section>

      <Section title="Site">
        <Row label="Address"       value={(douglasDetail?.locationAddress ?? arapahoeDetail?.situsAddress ?? jeffersonDetail?.propertyAddress ?? f.location.situsAddress) || '—'} />
        <Row label="City"          value={(douglasDetail?.cityName ?? arapahoeDetail?.situsCity ?? jeffersonDetail?.propertyCity ?? f.location.city) || '—'} />
        <Row label="Lot Size"      value={`${sqftLabel} · ${acreLabel}`} />
        <Row label="Coordinates"   value={`${f.location.lat.toFixed(5)}, ${f.location.lng.toFixed(5)}`} />
      </Section>

      {hasBuildingData && (
        <Section title="Building">
          {bldgSqft    && <Row label="Building Sqft" value={formatNumber(bldgSqft)} />}
          {bldgUnits   && <Row label="Units"         value={String(bldgUnits)} />}
          {bldgFloors  && <Row label="Stories"       value={String(bldgFloors)} />}
          {bldgYearBuilt && <Row label="Year Built"  value={String(bldgYearBuilt)} />}
          {bldgStyle   && <Row label="Style"         value={bldgStyle} />}
          {denverBuilding?.neighborhoodName && <Row label="Neighborhood" value={denverBuilding.neighborhoodName} />}
        </Section>
      )}

      {/* Arapahoe building detail */}
      {arapahoeDetail?.building && (
        <Section title="Building">
          {arapahoeDetail.building.totalBuildingSqft && <Row label="Building Sqft"    value={formatNumber(arapahoeDetail.building.totalBuildingSqft)} />}
          {arapahoeDetail.building.floors            && <Row label="Stories"          value={String(arapahoeDetail.building.floors)} />}
          {arapahoeDetail.building.yearBuilt         && <Row label="Year Built"       value={String(arapahoeDetail.building.yearBuilt)} />}
          {arapahoeDetail.building.architecturalStyle && <Row label="Style"           value={arapahoeDetail.building.architecturalStyle} />}
          {arapahoeDetail.building.bedrooms          && <Row label="Bedrooms"         value={String(arapahoeDetail.building.bedrooms)} />}
          {arapahoeDetail.building.bathrooms         && <Row label="Bathrooms"        value={String(arapahoeDetail.building.bathrooms)} />}
          {arapahoeDetail.building.improvementType   && <Row label="Improvement Type" value={arapahoeDetail.building.improvementType} />}
        </Section>
      )}

      {legalDisplay && (
        <Section title="Legal Description">
          <p style={{ fontSize: 12, color: 'var(--ap-t2)', lineHeight: 1.6, margin: 0 }}>
            {legalDisplay}
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
        {countyDetailSource
          ? `Parcel: Colorado Statewide Parcels · ESRI · Detail: ${countyDetailSource}`
          : 'Source: Colorado Statewide Parcels · ESRI REST Service'}
      </div>
    </>
  );
}

function ZoningTab({ f, denverZoning, auroraZoning, centennialZoning, douglasZoning, jeffersonZoning, larimerZoning, elpasoZoning, clearcreekZoning, lakewoodZoning, arvadaZoning, greenwoodvillageZoning, littletonZoning, thorntonZoning, arapahoeZoning, broomfieldZoning, boulderCountyZoning, weldZoning, puebloCountyZoning }: { f: ParcelFeature; denverZoning?: DenverZoningRaw | null; auroraZoning?: AuroraZoningRaw | null; centennialZoning?: CentennialZoningRaw | null; douglasZoning?: DouglasZoningRaw | null; jeffersonZoning?: JeffersonZoningRaw | null; larimerZoning?: LarimerZoningRaw | null; elpasoZoning?: ElPasoZoningRaw | null; clearcreekZoning?: ClearCreekZoningRaw | null; lakewoodZoning?: LakewoodZoningRaw | null; arvadaZoning?: ArvadaZoningRaw | null; greenwoodvillageZoning?: GreenwoodVillageZoningRaw | null; littletonZoning?: LittletonZoningRaw | null; thorntonZoning?: ThorntonZoningRaw | null; arapahoeZoning?: ArapahoeZoningRaw | null; broomfieldZoning?: BroomfieldZoningRaw | null; boulderCountyZoning?: BoulderCountyZoningRaw | null; weldZoning?: WeldZoningRaw | null; puebloCountyZoning?: PuebloCountyZoningRaw | null }) {
  const z = f.zoning;
  const dzDistrict = denverZoning?.zoneDistrict ? getDenverZoneDistrict(denverZoning.zoneDistrict) : null;
  const isDenver = !!denverZoning?.zoneDistrict;
  const azDistrict = auroraZoning?.districtId ? getAuroraZoneDistrict(auroraZoning.districtId) : null;
  const isAurora = !!auroraZoning?.districtId;
  const czDistrict = centennialZoning?.landUse ? getCentennialLandUseDistrict(centennialZoning.landUse) : null;
  const isCentennial = !!centennialZoning?.landUse;
  const dgzDistrict = douglasZoning?.zoneType ? getDouglasZoneDistrict(douglasZoning.zoneType) : null;
  const isDouglas = !!douglasZoning?.zoneType;
  const jfzDistrict = jeffersonZoning?.zoneCode ? getJeffersonZoneDistrict(jeffersonZoning.zoneCode) : null;
  const isJefferson = !!jeffersonZoning?.zoneCode;
  const lrzDistrict = larimerZoning?.zoneCode ? getLarimerZoneDistrict(larimerZoning.zoneCode) : null;
  const isLarimer = !!larimerZoning?.zoneCode;
  const epzDistrict = elpasoZoning?.zoneCode ? getElPasoZoneDistrict(elpasoZoning.zoneCode) : null;
  const isElPaso = !!elpasoZoning?.zoneCode;
  const cczDistrict = clearcreekZoning?.currZone ? getClearCreekZoneDistrict(clearcreekZoning.currZone) : null;
  const isClearCreek = !!clearcreekZoning?.currZone;
  const lkwDistrict = lakewoodZoning?.zoneCode ? getLakewoodZoneDistrict(lakewoodZoning.zoneCode) : null;
  const isLakewood = !!lakewoodZoning?.zoneCode;
  const arvDistrict = arvadaZoning?.zoneCode ? getArvadaZoneDistrict(arvadaZoning.zoneCode) : null;
  const isArvada = !!arvadaZoning?.zoneCode;
  const gvDistrict = greenwoodvillageZoning?.zoneCode ? getGreenwoodVillageZoneDistrict(greenwoodvillageZoning.zoneCode) : null;
  const isGreenwoodVillage = !!greenwoodvillageZoning?.zoneCode;
  const ltlDistrict = littletonZoning?.zoneCode ? getLittletonZoneDistrict(littletonZoning.zoneCode) : null;
  const isLittleton = !!littletonZoning?.zoneCode;
  const thrDistrict = thorntonZoning?.zoneCode ? getThorntonZoneDistrict(thorntonZoning.zoneCode) : null;
  const isThornton = !!thorntonZoning?.zoneCode;
  const arapDistrict = arapahoeZoning?.zoneCode ? getArapahoeZoneDistrict(arapahoeZoning.zoneCode) : null;
  const isArapahoe = !!arapahoeZoning?.zoneCode;
  const broomDistrict = broomfieldZoning?.zoneCode ? getBroomfieldZoneDistrict(broomfieldZoning.zoneCode) : null;
  const isBroomfield = !!broomfieldZoning?.zoneCode;
  const bocoDistrict = boulderCountyZoning?.zoneCode ? getBoulderCountyZoneDistrict(boulderCountyZoning.zoneCode) : null;
  const isBoulderCounty = !!boulderCountyZoning?.zoneCode;
  const weldDistrict = weldZoning?.zoneCode ? getWeldZoneDistrict(weldZoning.zoneCode) : null;
  const isWeld = !!weldZoning?.zoneCode;
  const puebloDistrict = puebloCountyZoning?.zoneCode ? getPuebloCountyZoneDistrict(puebloCountyZoning.zoneCode) : null;
  const isPuebloCounty = !!puebloCountyZoning?.zoneCode;

  // For HBU: prefer city/county official zone, fall back to ESRI
  const officialZoneCode = isDenver ? denverZoning!.zoneDistrict
    : isAurora ? auroraZoning!.districtId
    : isDouglas ? douglasZoning!.zoneType
    : isJefferson ? jeffersonZoning!.zoneCode
    : isLarimer ? larimerZoning!.zoneCode
    : isElPaso ? elpasoZoning!.zoneCode
    : isClearCreek ? clearcreekZoning!.currZone
    : isLakewood ? lakewoodZoning!.zoneCode
    : isArvada ? arvadaZoning!.zoneCode
    : isGreenwoodVillage ? greenwoodvillageZoning!.zoneCode
    : isLittleton ? littletonZoning!.zoneCode
    : isThornton ? thorntonZoning!.zoneCode
    : isArapahoe ? arapahoeZoning!.zoneCode
    : isBroomfield ? broomfieldZoning!.zoneCode
    : isBoulderCounty ? boulderCountyZoning!.zoneCode
    : isWeld ? weldZoning!.zoneCode
    : isPuebloCounty ? puebloCountyZoning!.zoneCode
    : null;
  const zoneCodeForHbu = officialZoneCode ? inferZoneCode(officialZoneCode) : inferZoneCode(z.code);
  const mappedUse = inferUseCode(z.landUseDescription, z.landUseCode);
  const sqft = f.identity.sqft ?? 0;
  const hbuResult: HBUResult | null =
    zoneCodeForHbu && mappedUse && sqft > 0
      ? runHBUAnalysis({ zoneCode: zoneCodeForHbu, currentUseCode: mappedUse, lotSizeSqft: sqft })
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
                  {denverZoning!.zoneDistrict}
                </div>
                <div style={{ fontSize: 13, color: 'var(--ap-t2)', marginTop: 2 }}>
                  {dzDistrict?.name ?? denverZoning!.zoneDescription ?? '—'}
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
                {denverZoning!.nbhdContext && (
                  <div style={{ fontSize: 11, color: 'var(--ap-t3)', marginTop: 4 }}>
                    {denverZoning!.nbhdContext} context
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
                  ['Max Height', dzDistrict.maxHeightFt > 0 ? `${dzDistrict.maxHeightFt} ft (${dzDistrict.maxHeightStories} stories)` : denverZoning!.heightStories ? `${denverZoning!.heightStories} stories` : 'No fixed limit'],
                  ['Min Lot Size', dzDistrict.minLotSqft > 0 ? `${dzDistrict.minLotSqft.toLocaleString()} sq ft` : 'None'],
                  ['Max FAR', dzDistrict.maxFAR > 0 ? String(dzDistrict.maxFAR) : 'N/A'],
                  ['Max Lot Coverage', dzDistrict.maxLotCoveragePercent > 0 ? `${dzDistrict.maxLotCoveragePercent}%` : 'N/A'],
                  ['Front Setback', `${dzDistrict.setbacks.primaryStreetFt} ft`],
                  ['Side Setback', `${dzDistrict.setbacks.sideFt} ft`],
                  ['Rear Setback', `${dzDistrict.setbacks.rearFt} ft`],
                  ['ADU Allowed', dzDistrict.aduAllowed ? 'Yes' : (denverZoning!.aduAllowed === 'Yes' ? 'Yes' : 'No')],
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
          {(denverZoning!.overlayDistrict || denverZoning!.pudNum) && (
            <div style={{ padding: '10px 12px', borderRadius: 8, background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)', marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#92400e', marginBottom: 4 }}>Overlays & Special Conditions</div>
              {denverZoning!.overlayDistrict && <div style={{ fontSize: 12, color: '#92400e' }}>Overlay: {denverZoning!.overlayDistrict}</div>}
              {denverZoning!.pudNum && (
                <div style={{ fontSize: 12, color: '#92400e' }}>
                  PUD #{denverZoning!.pudNum}
                  {denverZoning!.pudDocument && (
                    <> · <a href={denverZoning!.pudDocument} target="_blank" rel="noopener noreferrer" style={{ color: '#0051b3' }}>View PUD Document ↗</a></>
                  )}
                </div>
              )}
              {denverZoning!.ordNum && <div style={{ fontSize: 11, color: '#b45309', marginTop: 2 }}>Ordinance {denverZoning!.ordNum} ({denverZoning!.ordYear})</div>}
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

      {/* ── Aurora Official Zoning (authoritative) ── */}
      {isAurora && !isDenver && (
        <div style={{ marginBottom: 20 }}>
          {/* Header badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ap-t3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Official Aurora Zoning
            </div>
            <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 99, background: 'rgba(52,199,89,0.12)', color: '#166534', fontWeight: 600 }}>
              City of Aurora — Authoritative
            </span>
          </div>

          {/* Zone code hero */}
          <div style={{
            borderRadius: 12,
            border: '1.5px solid rgba(139,92,246,0.25)',
            background: 'rgba(139,92,246,0.04)',
            padding: '12px 14px',
            marginBottom: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#6d28d9', letterSpacing: '-0.01em' }}>
                  {auroraZoning!.districtId}
                </div>
                <div style={{ fontSize: 13, color: 'var(--ap-t2)', marginTop: 2 }}>
                  {azDistrict?.name ?? auroraZoning!.distName ?? '—'}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                {azDistrict && (
                  <span style={{
                    fontSize: 11, padding: '3px 9px', borderRadius: 99,
                    background: 'rgba(0,0,0,0.06)', color: 'var(--ap-t2)', fontWeight: 500,
                  }}>
                    {AURORA_CATEGORY_LABELS[azDistrict.category]}
                  </span>
                )}
                {auroraZoning!.subzone && (
                  <div style={{ fontSize: 11, color: 'var(--ap-t3)', marginTop: 4 }}>
                    Subzone: {auroraZoning!.subzone}
                  </div>
                )}
              </div>
            </div>

            {azDistrict?.summary && (
              <div style={{ fontSize: 12, color: 'var(--ap-t2)', lineHeight: 1.6, marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--ap-sep)' }}>
                {azDistrict.summary}
              </div>
            )}
          </div>

          {/* Development standards grid */}
          {azDistrict && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ap-t3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>
                Development Standards
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {[
                  ['Max Height', azDistrict.maxHeightFt > 0 ? `${azDistrict.maxHeightFt} ft` : 'Per overlay'],
                  ['Min Lot Size', azDistrict.minLotSqft > 0 ? `${azDistrict.minLotSqft.toLocaleString()} sq ft` : 'None'],
                  ['Max Density', azDistrict.maxDensityPerAcre != null ? `${azDistrict.maxDensityPerAcre} du/acre` : (auroraZoning!.density || 'N/A')],
                  ['Max FAR', azDistrict.maxFAR > 0 ? String(azDistrict.maxFAR) : (auroraZoning!.far || 'N/A')],
                  ['Category', AURORA_CATEGORY_LABELS[azDistrict.category]],
                  ['Ordinance', auroraZoning!.ordinance || '—'],
                ].map(([label, val]) => (
                  <div key={label} style={{ background: 'rgba(0,0,0,0.025)', borderRadius: 8, padding: '7px 10px', border: '1px solid var(--ap-sep)' }}>
                    <div style={{ fontSize: 10, color: 'var(--ap-t3)' }}>{label}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ap-t1)', marginTop: 1 }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Permitted / conditional / prohibited */}
          {azDistrict && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <UseList title="Permitted By Right" items={azDistrict.permittedByRight} color="#166534" dotColor="#34c759" bg="rgba(52,199,89,0.06)" border="rgba(52,199,89,0.2)" />
              {azDistrict.conditionalUses.length > 0 && (
                <UseList title="Conditional Uses (Review Required)" items={azDistrict.conditionalUses} color="#92400e" dotColor="#f59e0b" bg="rgba(245,158,11,0.06)" border="rgba(245,158,11,0.2)" />
              )}
              <UseList title="Prohibited Uses" items={azDistrict.prohibited} color="#991b1b" dotColor="#ef4444" bg="rgba(239,68,68,0.05)" border="rgba(239,68,68,0.15)" />
            </div>
          )}

          {azDistrict?.notes && (
            <div style={{ marginTop: 10, padding: '8px 10px', borderRadius: 8, background: 'rgba(0,0,0,0.03)', fontSize: 11, color: 'var(--ap-t3)', lineHeight: 1.5 }}>
              {azDistrict.notes}
            </div>
          )}
        </div>
      )}

      {/* ── Centennial Official Land Use (authoritative) ── */}
      {isCentennial && !isDenver && !isAurora && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ap-t3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Official Centennial Land Use
            </div>
            <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 99, background: 'rgba(52,199,89,0.12)', color: '#166534', fontWeight: 600 }}>
              City of Centennial — Authoritative
            </span>
          </div>

          <div style={{ borderRadius: 12, border: '1.5px solid rgba(16,185,129,0.25)', background: 'rgba(16,185,129,0.04)', padding: '12px 14px', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#065f46', letterSpacing: '-0.01em' }}>
                  {centennialZoning!.landUse}
                </div>
                <div style={{ fontSize: 13, color: 'var(--ap-t2)', marginTop: 2 }}>
                  {czDistrict?.name ?? centennialZoning!.landUseType ?? '—'}
                </div>
              </div>
              {czDistrict && (
                <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 99, background: 'rgba(0,0,0,0.06)', color: 'var(--ap-t2)', fontWeight: 500, flexShrink: 0 }}>
                  {CENTENNIAL_CATEGORY_LABELS[czDistrict.category]}
                </span>
              )}
            </div>
            {czDistrict?.summary && (
              <div style={{ fontSize: 12, color: 'var(--ap-t2)', lineHeight: 1.6, marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--ap-sep)' }}>
                {czDistrict.summary}
              </div>
            )}
          </div>

          {czDistrict && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ap-t3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>
                Development Standards
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {[
                  ['Max Height', czDistrict.maxHeightFt > 0 ? `${czDistrict.maxHeightFt} ft` : 'Per overlay'],
                  ['Min Lot Size', czDistrict.minLotSqft > 0 ? `${czDistrict.minLotSqft.toLocaleString()} sq ft` : 'None'],
                  ['Max Density', czDistrict.maxDensityPerAcre != null ? `${czDistrict.maxDensityPerAcre} du/acre` : 'N/A'],
                  ['Category', CENTENNIAL_CATEGORY_LABELS[czDistrict.category]],
                  ['Level I', centennialZoning!.levelI || '—'],
                  ['Level II', centennialZoning!.levelII || '—'],
                ].map(([label, val]) => (
                  <div key={label} style={{ background: 'rgba(0,0,0,0.025)', borderRadius: 8, padding: '7px 10px', border: '1px solid var(--ap-sep)' }}>
                    <div style={{ fontSize: 10, color: 'var(--ap-t3)' }}>{label}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ap-t1)', marginTop: 1 }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {czDistrict && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <UseList title="Permitted By Right" items={czDistrict.permittedByRight} color="#166534" dotColor="#34c759" bg="rgba(52,199,89,0.06)" border="rgba(52,199,89,0.2)" />
              {czDistrict.conditionalUses.length > 0 && (
                <UseList title="Conditional Uses (Review Required)" items={czDistrict.conditionalUses} color="#92400e" dotColor="#f59e0b" bg="rgba(245,158,11,0.06)" border="rgba(245,158,11,0.2)" />
              )}
              {czDistrict.prohibited.length > 0 && (
                <UseList title="Prohibited Uses" items={czDistrict.prohibited} color="#991b1b" dotColor="#ef4444" bg="rgba(239,68,68,0.05)" border="rgba(239,68,68,0.15)" />
              )}
            </div>
          )}

          {czDistrict?.notes && (
            <div style={{ marginTop: 10, padding: '8px 10px', borderRadius: 8, background: 'rgba(0,0,0,0.03)', fontSize: 11, color: 'var(--ap-t3)', lineHeight: 1.5 }}>
              {czDistrict.notes}
            </div>
          )}
        </div>
      )}

      {/* ── Douglas County Official Zoning (authoritative) ── */}
      {isDouglas && !isDenver && !isAurora && !isCentennial && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ap-t3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Official Douglas County Zoning
            </div>
            <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 99, background: 'rgba(52,199,89,0.12)', color: '#166534', fontWeight: 600 }}>
              Douglas County — Authoritative
            </span>
          </div>

          <div style={{ borderRadius: 12, border: '1.5px solid rgba(59,130,246,0.25)', background: 'rgba(59,130,246,0.04)', padding: '12px 14px', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#1e40af', letterSpacing: '-0.01em' }}>
                  {douglasZoning!.zoneType}
                </div>
                <div style={{ fontSize: 13, color: 'var(--ap-t2)', marginTop: 2 }}>
                  {dgzDistrict?.name ?? douglasZoning!.zoneName ?? '—'}
                </div>
              </div>
              {dgzDistrict && (
                <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 99, background: 'rgba(0,0,0,0.06)', color: 'var(--ap-t2)', fontWeight: 500, flexShrink: 0 }}>
                  {DOUGLAS_CATEGORY_LABELS[dgzDistrict.category]}
                </span>
              )}
            </div>
            {dgzDistrict?.summary && (
              <div style={{ fontSize: 12, color: 'var(--ap-t2)', lineHeight: 1.6, marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--ap-sep)' }}>
                {dgzDistrict.summary}
              </div>
            )}
          </div>

          {dgzDistrict && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ap-t3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>
                Development Standards
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {[
                  ['Max Height', dgzDistrict.maxHeightFt > 0 ? `${dgzDistrict.maxHeightFt} ft` : 'Per overlay'],
                  ['Min Lot Size', dgzDistrict.minLotSqft > 0 ? `${dgzDistrict.minLotSqft.toLocaleString()} sq ft` : 'None'],
                  ['Max Density', dgzDistrict.maxDensityPerAcre != null ? `${dgzDistrict.maxDensityPerAcre} du/acre` : 'N/A'],
                  ['Max FAR', dgzDistrict.maxFAR > 0 ? String(dgzDistrict.maxFAR) : 'N/A'],
                  ['Category', DOUGLAS_CATEGORY_LABELS[dgzDistrict.category]],
                  ['Zone Code', douglasZoning!.zoneType || '—'],
                ].map(([label, val]) => (
                  <div key={label} style={{ background: 'rgba(0,0,0,0.025)', borderRadius: 8, padding: '7px 10px', border: '1px solid var(--ap-sep)' }}>
                    <div style={{ fontSize: 10, color: 'var(--ap-t3)' }}>{label}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ap-t1)', marginTop: 1 }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {dgzDistrict && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <UseList title="Permitted By Right" items={dgzDistrict.permittedByRight} color="#166534" dotColor="#34c759" bg="rgba(52,199,89,0.06)" border="rgba(52,199,89,0.2)" />
              {dgzDistrict.conditionalUses.length > 0 && (
                <UseList title="Conditional Uses (Review Required)" items={dgzDistrict.conditionalUses} color="#92400e" dotColor="#f59e0b" bg="rgba(245,158,11,0.06)" border="rgba(245,158,11,0.2)" />
              )}
              {dgzDistrict.prohibited.length > 0 && (
                <UseList title="Prohibited Uses" items={dgzDistrict.prohibited} color="#991b1b" dotColor="#ef4444" bg="rgba(239,68,68,0.05)" border="rgba(239,68,68,0.15)" />
              )}
            </div>
          )}

          {dgzDistrict?.notes && (
            <div style={{ marginTop: 10, padding: '8px 10px', borderRadius: 8, background: 'rgba(0,0,0,0.03)', fontSize: 11, color: 'var(--ap-t3)', lineHeight: 1.5 }}>
              {dgzDistrict.notes}
            </div>
          )}
        </div>
      )}

      {/* ── Jefferson County Official Zoning (authoritative) ── */}
      {isJefferson && !isDenver && !isAurora && !isCentennial && !isDouglas && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ap-t3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Official Jefferson County Zoning
            </div>
            <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 99, background: 'rgba(52,199,89,0.12)', color: '#166534', fontWeight: 600 }}>
              Jefferson County — Authoritative
            </span>
          </div>

          <div style={{ borderRadius: 12, border: '1.5px solid rgba(245,158,11,0.25)', background: 'rgba(245,158,11,0.04)', padding: '12px 14px', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#92400e', letterSpacing: '-0.01em' }}>
                  {jeffersonZoning!.zoneCode}
                </div>
                <div style={{ fontSize: 13, color: 'var(--ap-t2)', marginTop: 2 }}>
                  {jfzDistrict?.name ?? jeffersonZoning!.zoneName ?? '—'}
                </div>
              </div>
              {jfzDistrict && (
                <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 99, background: 'rgba(0,0,0,0.06)', color: 'var(--ap-t2)', fontWeight: 500, flexShrink: 0 }}>
                  {JEFFERSON_CATEGORY_LABELS[jfzDistrict.category]}
                </span>
              )}
            </div>
            {jfzDistrict?.summary && (
              <div style={{ fontSize: 12, color: 'var(--ap-t2)', lineHeight: 1.6, marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--ap-sep)' }}>
                {jfzDistrict.summary}
              </div>
            )}
          </div>

          {jfzDistrict && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ap-t3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>
                Development Standards
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {[
                  ['Max Height', jfzDistrict.maxHeightFt > 0 ? `${jfzDistrict.maxHeightFt} ft` : 'Per overlay'],
                  ['Min Lot Size', jfzDistrict.minLotSqft > 0 ? `${jfzDistrict.minLotSqft.toLocaleString()} sq ft` : 'None'],
                  ['Max Density', jfzDistrict.maxDensityPerAcre != null ? `${jfzDistrict.maxDensityPerAcre} du/acre` : 'N/A'],
                  ['Max FAR', jfzDistrict.maxFAR > 0 ? String(jfzDistrict.maxFAR) : 'N/A'],
                  ['Category', JEFFERSON_CATEGORY_LABELS[jfzDistrict.category]],
                  ['Zone Code', jeffersonZoning!.zoneCode || '—'],
                ].map(([label, val]) => (
                  <div key={label} style={{ background: 'rgba(0,0,0,0.025)', borderRadius: 8, padding: '7px 10px', border: '1px solid var(--ap-sep)' }}>
                    <div style={{ fontSize: 10, color: 'var(--ap-t3)' }}>{label}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ap-t1)', marginTop: 1 }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {jfzDistrict && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <UseList title="Permitted By Right" items={jfzDistrict.permittedByRight} color="#166534" dotColor="#34c759" bg="rgba(52,199,89,0.06)" border="rgba(52,199,89,0.2)" />
              {jfzDistrict.conditionalUses.length > 0 && (
                <UseList title="Conditional Uses (Review Required)" items={jfzDistrict.conditionalUses} color="#92400e" dotColor="#f59e0b" bg="rgba(245,158,11,0.06)" border="rgba(245,158,11,0.2)" />
              )}
              {jfzDistrict.prohibited.length > 0 && (
                <UseList title="Prohibited Uses" items={jfzDistrict.prohibited} color="#991b1b" dotColor="#ef4444" bg="rgba(239,68,68,0.05)" border="rgba(239,68,68,0.15)" />
              )}
            </div>
          )}

          {jfzDistrict?.notes && (
            <div style={{ marginTop: 10, padding: '8px 10px', borderRadius: 8, background: 'rgba(0,0,0,0.03)', fontSize: 11, color: 'var(--ap-t3)', lineHeight: 1.5 }}>
              {jfzDistrict.notes}
            </div>
          )}
        </div>
      )}

      {/* ── Larimer County Official Zoning (authoritative) ── */}
      {isLarimer && !isDenver && !isAurora && !isCentennial && !isDouglas && !isJefferson && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ap-t3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Official Larimer County Zoning
            </div>
            <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 99, background: 'rgba(52,199,89,0.12)', color: '#166634', fontWeight: 600 }}>
              Larimer County — Authoritative
            </span>
          </div>

          <div style={{ borderRadius: 12, border: '1.5px solid rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.05)', padding: '12px 14px', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#065f46', letterSpacing: '-0.01em' }}>
                  {larimerZoning!.zoneCode}
                </div>
                <div style={{ fontSize: 13, color: 'var(--ap-t2)', marginTop: 2 }}>
                  {lrzDistrict?.name ?? larimerZoning!.zoneName ?? '—'}
                </div>
              </div>
              {lrzDistrict && (
                <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 99, background: 'rgba(0,0,0,0.06)', color: 'var(--ap-t2)', fontWeight: 500, flexShrink: 0 }}>
                  {LARIMER_CATEGORY_LABELS[lrzDistrict.category]}
                </span>
              )}
            </div>
            {lrzDistrict?.summary && (
              <div style={{ fontSize: 12, color: 'var(--ap-t2)', lineHeight: 1.6, marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--ap-sep)' }}>
                {lrzDistrict.summary}
              </div>
            )}
          </div>

          {lrzDistrict && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ap-t3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>
                Development Standards
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {[
                  ['Max Height', lrzDistrict.maxHeightFt > 0 ? `${lrzDistrict.maxHeightFt} ft` : 'Per overlay'],
                  ['Min Lot Size', lrzDistrict.minLotSqft > 0 ? `${lrzDistrict.minLotSqft.toLocaleString()} sq ft` : 'None'],
                  ['Max Density', lrzDistrict.maxDensityPerAcre != null ? `${lrzDistrict.maxDensityPerAcre} du/acre` : 'N/A'],
                  ['Max FAR', lrzDistrict.maxFAR > 0 ? String(lrzDistrict.maxFAR) : 'N/A'],
                  ['Category', LARIMER_CATEGORY_LABELS[lrzDistrict.category]],
                  ['Zone Code', larimerZoning!.zoneCode || '—'],
                ].map(([label, val]) => (
                  <div key={label} style={{ background: 'rgba(0,0,0,0.025)', borderRadius: 8, padding: '7px 10px', border: '1px solid var(--ap-sep)' }}>
                    <div style={{ fontSize: 10, color: 'var(--ap-t3)' }}>{label}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ap-t1)', marginTop: 1 }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {lrzDistrict && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <UseList title="Permitted By Right" items={lrzDistrict.permittedByRight} color="#166534" dotColor="#34c759" bg="rgba(52,199,89,0.06)" border="rgba(52,199,89,0.2)" />
              {lrzDistrict.conditionalUses.length > 0 && (
                <UseList title="Conditional Uses (Review Required)" items={lrzDistrict.conditionalUses} color="#92400e" dotColor="#f59e0b" bg="rgba(245,158,11,0.06)" border="rgba(245,158,11,0.2)" />
              )}
              {lrzDistrict.prohibited.length > 0 && (
                <UseList title="Prohibited Uses" items={lrzDistrict.prohibited} color="#991b1b" dotColor="#ef4444" bg="rgba(239,68,68,0.05)" border="rgba(239,68,68,0.15)" />
              )}
            </div>
          )}

          {lrzDistrict?.notes && (
            <div style={{ marginTop: 10, padding: '8px 10px', borderRadius: 8, background: 'rgba(0,0,0,0.03)', fontSize: 11, color: 'var(--ap-t3)', lineHeight: 1.5 }}>
              {lrzDistrict.notes}
            </div>
          )}
        </div>
      )}

      {/* ── El Paso County Official Zoning (authoritative) ── */}
      {isElPaso && !isDenver && !isAurora && !isCentennial && !isDouglas && !isJefferson && !isLarimer && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ap-t3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Official El Paso County Zoning
            </div>
            <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 99, background: 'rgba(52,199,89,0.12)', color: '#166534', fontWeight: 600 }}>
              El Paso County — Authoritative
            </span>
          </div>

          <div style={{ borderRadius: 12, border: '1.5px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.04)', padding: '12px 14px', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#7f1d1d', letterSpacing: '-0.01em' }}>
                  {elpasoZoning!.zoneCode}
                </div>
                <div style={{ fontSize: 13, color: 'var(--ap-t2)', marginTop: 2 }}>
                  {epzDistrict?.name ?? elpasoZoning!.zoneName ?? '—'}
                </div>
              </div>
              {epzDistrict && (
                <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 99, background: 'rgba(0,0,0,0.06)', color: 'var(--ap-t2)', fontWeight: 500, flexShrink: 0 }}>
                  {ELPASO_CATEGORY_LABELS[epzDistrict.category]}
                </span>
              )}
            </div>
            {epzDistrict?.summary && (
              <div style={{ fontSize: 12, color: 'var(--ap-t2)', lineHeight: 1.6, marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--ap-sep)' }}>
                {epzDistrict.summary}
              </div>
            )}
          </div>

          {epzDistrict && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ap-t3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>
                Development Standards
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {[
                  ['Max Height', epzDistrict.maxHeightFt > 0 ? `${epzDistrict.maxHeightFt} ft` : 'Per overlay'],
                  ['Min Lot Size', epzDistrict.minLotSqft > 0 ? `${epzDistrict.minLotSqft.toLocaleString()} sq ft` : 'None'],
                  ['Max Density', epzDistrict.maxDensityPerAcre != null ? `${epzDistrict.maxDensityPerAcre} du/acre` : 'N/A'],
                  ['Max FAR', epzDistrict.maxFAR > 0 ? String(epzDistrict.maxFAR) : 'N/A'],
                  ['Category', ELPASO_CATEGORY_LABELS[epzDistrict.category]],
                  ['Zone Code', elpasoZoning!.zoneCode || '—'],
                ].map(([label, val]) => (
                  <div key={label} style={{ background: 'rgba(0,0,0,0.025)', borderRadius: 8, padding: '7px 10px', border: '1px solid var(--ap-sep)' }}>
                    <div style={{ fontSize: 10, color: 'var(--ap-t3)' }}>{label}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ap-t1)', marginTop: 1 }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {epzDistrict && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <UseList title="Permitted By Right" items={epzDistrict.permittedByRight} color="#166534" dotColor="#34c759" bg="rgba(52,199,89,0.06)" border="rgba(52,199,89,0.2)" />
              {epzDistrict.conditionalUses.length > 0 && (
                <UseList title="Conditional Uses (Review Required)" items={epzDistrict.conditionalUses} color="#92400e" dotColor="#f59e0b" bg="rgba(245,158,11,0.06)" border="rgba(245,158,11,0.2)" />
              )}
              {epzDistrict.prohibited.length > 0 && (
                <UseList title="Prohibited Uses" items={epzDistrict.prohibited} color="#991b1b" dotColor="#ef4444" bg="rgba(239,68,68,0.05)" border="rgba(239,68,68,0.15)" />
              )}
            </div>
          )}

          {epzDistrict?.notes && (
            <div style={{ marginTop: 10, padding: '8px 10px', borderRadius: 8, background: 'rgba(0,0,0,0.03)', fontSize: 11, color: 'var(--ap-t3)', lineHeight: 1.5 }}>
              {epzDistrict.notes}
            </div>
          )}
        </div>
      )}

      {/* ── Clear Creek County Official Zoning (authoritative) ── */}
      {isClearCreek && !isDenver && !isAurora && !isCentennial && !isDouglas && !isJefferson && !isLarimer && !isElPaso && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ap-t3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Official Clear Creek County Zoning
            </div>
            <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 99, background: 'rgba(52,199,89,0.12)', color: '#166534', fontWeight: 600 }}>
              Clear Creek County — Authoritative
            </span>
          </div>

          <div style={{ borderRadius: 12, border: '1.5px solid rgba(167,139,250,0.3)', background: 'rgba(167,139,250,0.05)', padding: '12px 14px', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#4c1d95', letterSpacing: '-0.01em' }}>
                  {clearcreekZoning!.currZone}
                </div>
                <div style={{ fontSize: 13, color: 'var(--ap-t2)', marginTop: 2 }}>
                  {cczDistrict?.name ?? clearcreekZoning!.zoneName ?? '—'}
                </div>
              </div>
              {cczDistrict && (
                <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 99, background: 'rgba(0,0,0,0.06)', color: 'var(--ap-t2)', fontWeight: 500, flexShrink: 0 }}>
                  {CLEARCREEK_CATEGORY_LABELS[cczDistrict.category]}
                </span>
              )}
            </div>
            {cczDistrict?.summary && (
              <div style={{ fontSize: 12, color: 'var(--ap-t2)', lineHeight: 1.6, marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--ap-sep)' }}>
                {cczDistrict.summary}
              </div>
            )}
          </div>

          {cczDistrict && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ap-t3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>
                Development Standards
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {[
                  ['Max Height', cczDistrict.maxHeightFt > 0 ? `${cczDistrict.maxHeightFt} ft` : 'Per overlay'],
                  ['Min Lot Size', cczDistrict.minLotSqft > 0 ? `${cczDistrict.minLotSqft.toLocaleString()} sq ft` : 'None'],
                  ['Max Density', cczDistrict.maxDensityPerAcre != null ? `${cczDistrict.maxDensityPerAcre} du/acre` : 'N/A'],
                  ['Max FAR', cczDistrict.maxFAR > 0 ? String(cczDistrict.maxFAR) : 'N/A'],
                  ['Category', CLEARCREEK_CATEGORY_LABELS[cczDistrict.category]],
                  ['Zone Code', clearcreekZoning!.currZone || '—'],
                ].map(([label, val]) => (
                  <div key={label} style={{ background: 'rgba(0,0,0,0.025)', borderRadius: 8, padding: '7px 10px', border: '1px solid var(--ap-sep)' }}>
                    <div style={{ fontSize: 10, color: 'var(--ap-t3)' }}>{label}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ap-t1)', marginTop: 1 }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {cczDistrict && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <UseList title="Permitted By Right" items={cczDistrict.permittedByRight} color="#166534" dotColor="#34c759" bg="rgba(52,199,89,0.06)" border="rgba(52,199,89,0.2)" />
              {cczDistrict.conditionalUses.length > 0 && (
                <UseList title="Conditional Uses (Review Required)" items={cczDistrict.conditionalUses} color="#92400e" dotColor="#f59e0b" bg="rgba(245,158,11,0.06)" border="rgba(245,158,11,0.2)" />
              )}
              {cczDistrict.prohibited.length > 0 && (
                <UseList title="Prohibited Uses" items={cczDistrict.prohibited} color="#991b1b" dotColor="#ef4444" bg="rgba(239,68,68,0.05)" border="rgba(239,68,68,0.15)" />
              )}
            </div>
          )}

          {cczDistrict?.notes && (
            <div style={{ marginTop: 10, padding: '8px 10px', borderRadius: 8, background: 'rgba(0,0,0,0.03)', fontSize: 11, color: 'var(--ap-t3)', lineHeight: 1.5 }}>
              {cczDistrict.notes}
            </div>
          )}
        </div>
      )}

      {/* ── Lakewood Official Zoning (authoritative) ── */}
      {isLakewood && !isDenver && !isAurora && !isCentennial && !isDouglas && !isJefferson && !isLarimer && !isElPaso && !isClearCreek && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ap-t3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Official Lakewood Zoning</div>
            <div style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 600, color: '#0e7490', background: 'rgba(6,182,212,0.12)', borderRadius: 6, padding: '2px 8px', border: '1px solid rgba(6,182,212,0.3)' }}>City of Lakewood — Authoritative</div>
          </div>
          <div style={{ background: 'rgba(6,182,212,0.08)', border: '1.5px solid rgba(6,182,212,0.3)', borderRadius: 12, padding: '14px 16px', marginBottom: 12 }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#0e7490', letterSpacing: '-0.5px' }}>{lakewoodZoning?.zoneCode ?? '—'}</div>
            {lkwDistrict && <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ap-t1)', marginTop: 2 }}>{lkwDistrict.name}</div>}
            {lkwDistrict && <div style={{ fontSize: 12, color: 'var(--ap-t2)', marginTop: 6, lineHeight: 1.5 }}>{lkwDistrict.summary}</div>}
          </div>
          {lkwDistrict && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
              {([['Max Height', lkwDistrict.maxHeightFt ? `${lkwDistrict.maxHeightFt} ft` : 'N/A'], ['Min Lot Size', lkwDistrict.minLotSqft ? `${lkwDistrict.minLotSqft.toLocaleString()} sq ft` : 'N/A'], ['Max Density', lkwDistrict.maxDensityPerAcre ? `${lkwDistrict.maxDensityPerAcre} du/ac` : 'N/A'], ['Category', LAKEWOOD_CATEGORY_LABELS[lkwDistrict.category]]] as [string, string][]).map(([label, val]) => (
                <div key={label} style={{ background: 'rgba(0,0,0,0.025)', borderRadius: 8, padding: '7px 10px', border: '1px solid var(--ap-sep)' }}>
                  <div style={{ fontSize: 10, color: 'var(--ap-t3)' }}>{label}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ap-t1)', marginTop: 1 }}>{val}</div>
                </div>
              ))}
            </div>
          )}
          {lkwDistrict && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <UseList title="Permitted By Right" items={lkwDistrict.permittedByRight} color="#166534" dotColor="#34c759" bg="rgba(52,199,89,0.06)" border="rgba(52,199,89,0.2)" />
              {lkwDistrict.conditionalUses.length > 0 && <UseList title="Conditional Uses" items={lkwDistrict.conditionalUses} color="#92400e" dotColor="#f59e0b" bg="rgba(245,158,11,0.06)" border="rgba(245,158,11,0.2)" />}
              {lkwDistrict.prohibited.length > 0 && <UseList title="Prohibited" items={lkwDistrict.prohibited} color="#7f1d1d" dotColor="#ef4444" bg="rgba(239,68,68,0.06)" border="rgba(239,68,68,0.2)" />}
            </div>
          )}
        </div>
      )}

      {/* ── Arvada Official Zoning (authoritative) ── */}
      {isArvada && !isDenver && !isAurora && !isCentennial && !isDouglas && !isJefferson && !isLarimer && !isElPaso && !isClearCreek && !isLakewood && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ap-t3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Official Arvada Zoning</div>
            <div style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 600, color: '#3f6212', background: 'rgba(132,204,22,0.12)', borderRadius: 6, padding: '2px 8px', border: '1px solid rgba(132,204,22,0.3)' }}>City of Arvada — Authoritative</div>
          </div>
          <div style={{ background: 'rgba(132,204,22,0.08)', border: '1.5px solid rgba(132,204,22,0.3)', borderRadius: 12, padding: '14px 16px', marginBottom: 12 }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#3f6212', letterSpacing: '-0.5px' }}>{arvadaZoning?.zoneCode ?? '—'}</div>
            {arvDistrict && <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ap-t1)', marginTop: 2 }}>{arvDistrict.name}</div>}
            {arvDistrict && <div style={{ fontSize: 12, color: 'var(--ap-t2)', marginTop: 6, lineHeight: 1.5 }}>{arvDistrict.summary}</div>}
          </div>
          {arvDistrict && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
              {([['Max Height', arvDistrict.maxHeightFt ? `${arvDistrict.maxHeightFt} ft` : 'N/A'], ['Min Lot Size', arvDistrict.minLotSqft ? `${arvDistrict.minLotSqft.toLocaleString()} sq ft` : 'N/A'], ['Max Density', arvDistrict.maxDensityPerAcre ? `${arvDistrict.maxDensityPerAcre} du/ac` : 'N/A'], ['Category', ARVADA_CATEGORY_LABELS[arvDistrict.category]]] as [string, string][]).map(([label, val]) => (
                <div key={label} style={{ background: 'rgba(0,0,0,0.025)', borderRadius: 8, padding: '7px 10px', border: '1px solid var(--ap-sep)' }}>
                  <div style={{ fontSize: 10, color: 'var(--ap-t3)' }}>{label}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ap-t1)', marginTop: 1 }}>{val}</div>
                </div>
              ))}
            </div>
          )}
          {arvDistrict && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <UseList title="Permitted By Right" items={arvDistrict.permittedByRight} color="#166534" dotColor="#34c759" bg="rgba(52,199,89,0.06)" border="rgba(52,199,89,0.2)" />
              {arvDistrict.conditionalUses.length > 0 && <UseList title="Conditional Uses" items={arvDistrict.conditionalUses} color="#92400e" dotColor="#f59e0b" bg="rgba(245,158,11,0.06)" border="rgba(245,158,11,0.2)" />}
              {arvDistrict.prohibited.length > 0 && <UseList title="Prohibited" items={arvDistrict.prohibited} color="#7f1d1d" dotColor="#ef4444" bg="rgba(239,68,68,0.06)" border="rgba(239,68,68,0.2)" />}
            </div>
          )}
        </div>
      )}

      {/* ── Greenwood Village Official Zoning (authoritative) ── */}
      {isGreenwoodVillage && !isDenver && !isAurora && !isCentennial && !isDouglas && !isJefferson && !isLarimer && !isElPaso && !isClearCreek && !isLakewood && !isArvada && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ap-t3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Official Greenwood Village Zoning</div>
            <div style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 600, color: '#9d174d', background: 'rgba(236,72,153,0.12)', borderRadius: 6, padding: '2px 8px', border: '1px solid rgba(236,72,153,0.3)' }}>Greenwood Village — Authoritative</div>
          </div>
          <div style={{ background: 'rgba(236,72,153,0.08)', border: '1.5px solid rgba(236,72,153,0.3)', borderRadius: 12, padding: '14px 16px', marginBottom: 12 }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#9d174d', letterSpacing: '-0.5px' }}>{greenwoodvillageZoning?.zoneCode ?? '—'}</div>
            {gvDistrict && <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ap-t1)', marginTop: 2 }}>{gvDistrict.name}</div>}
            {gvDistrict && <div style={{ fontSize: 12, color: 'var(--ap-t2)', marginTop: 6, lineHeight: 1.5 }}>{gvDistrict.summary}</div>}
          </div>
          {gvDistrict && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
              {([['Max Height', gvDistrict.maxHeightFt ? `${gvDistrict.maxHeightFt} ft` : 'N/A'], ['Min Lot Size', gvDistrict.minLotSqft ? `${gvDistrict.minLotSqft.toLocaleString()} sq ft` : 'N/A'], ['Max Density', gvDistrict.maxDensityPerAcre ? `${gvDistrict.maxDensityPerAcre} du/ac` : 'N/A'], ['Category', GREENWOODVILLAGE_CATEGORY_LABELS[gvDistrict.category]]] as [string, string][]).map(([label, val]) => (
                <div key={label} style={{ background: 'rgba(0,0,0,0.025)', borderRadius: 8, padding: '7px 10px', border: '1px solid var(--ap-sep)' }}>
                  <div style={{ fontSize: 10, color: 'var(--ap-t3)' }}>{label}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ap-t1)', marginTop: 1 }}>{val}</div>
                </div>
              ))}
            </div>
          )}
          {gvDistrict && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <UseList title="Permitted By Right" items={gvDistrict.permittedByRight} color="#166534" dotColor="#34c759" bg="rgba(52,199,89,0.06)" border="rgba(52,199,89,0.2)" />
              {gvDistrict.conditionalUses.length > 0 && <UseList title="Conditional Uses" items={gvDistrict.conditionalUses} color="#92400e" dotColor="#f59e0b" bg="rgba(245,158,11,0.06)" border="rgba(245,158,11,0.2)" />}
              {gvDistrict.prohibited.length > 0 && <UseList title="Prohibited" items={gvDistrict.prohibited} color="#7f1d1d" dotColor="#ef4444" bg="rgba(239,68,68,0.06)" border="rgba(239,68,68,0.2)" />}
              {gvDistrict.notes && <div style={{ marginTop: 6, padding: '8px 10px', borderRadius: 8, background: 'rgba(0,0,0,0.03)', fontSize: 11, color: 'var(--ap-t3)', lineHeight: 1.5 }}>{gvDistrict.notes}</div>}
            </div>
          )}
        </div>
      )}

      {/* ── Littleton Official Zoning (authoritative) ── */}
      {isLittleton && !isDenver && !isAurora && !isCentennial && !isDouglas && !isJefferson && !isLarimer && !isElPaso && !isClearCreek && !isLakewood && !isArvada && !isGreenwoodVillage && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ap-t3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Official Littleton Zoning</div>
            <div style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 600, color: '#1e3a5f', background: 'rgba(100,116,139,0.12)', borderRadius: 6, padding: '2px 8px', border: '1px solid rgba(100,116,139,0.3)' }}>City of Littleton — Authoritative</div>
          </div>
          <div style={{ background: 'rgba(100,116,139,0.08)', border: '1.5px solid rgba(100,116,139,0.3)', borderRadius: 12, padding: '14px 16px', marginBottom: 12 }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#1e3a5f', letterSpacing: '-0.5px' }}>{littletonZoning?.zoneCode ?? '—'}</div>
            {ltlDistrict && <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ap-t1)', marginTop: 2 }}>{ltlDistrict.name}</div>}
            {ltlDistrict && <div style={{ fontSize: 12, color: 'var(--ap-t2)', marginTop: 6, lineHeight: 1.5 }}>{ltlDistrict.summary}</div>}
          </div>
          {ltlDistrict && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
              {([['Max Height', ltlDistrict.maxHeightFt ? `${ltlDistrict.maxHeightFt} ft` : 'N/A'], ['Min Lot Size', ltlDistrict.minLotSqft ? `${ltlDistrict.minLotSqft.toLocaleString()} sq ft` : 'N/A'], ['Max Density', ltlDistrict.maxDensityPerAcre ? `${ltlDistrict.maxDensityPerAcre} du/ac` : 'N/A'], ['Category', LITTLETON_CATEGORY_LABELS[ltlDistrict.category]]] as [string, string][]).map(([label, val]) => (
                <div key={label} style={{ background: 'rgba(0,0,0,0.025)', borderRadius: 8, padding: '7px 10px', border: '1px solid var(--ap-sep)' }}>
                  <div style={{ fontSize: 10, color: 'var(--ap-t3)' }}>{label}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ap-t1)', marginTop: 1 }}>{val}</div>
                </div>
              ))}
            </div>
          )}
          {ltlDistrict && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <UseList title="Permitted By Right" items={ltlDistrict.permittedByRight} color="#166534" dotColor="#34c759" bg="rgba(52,199,89,0.06)" border="rgba(52,199,89,0.2)" />
              {ltlDistrict.conditionalUses.length > 0 && <UseList title="Conditional Uses" items={ltlDistrict.conditionalUses} color="#92400e" dotColor="#f59e0b" bg="rgba(245,158,11,0.06)" border="rgba(245,158,11,0.2)" />}
              {ltlDistrict.prohibited.length > 0 && <UseList title="Prohibited" items={ltlDistrict.prohibited} color="#7f1d1d" dotColor="#ef4444" bg="rgba(239,68,68,0.06)" border="rgba(239,68,68,0.2)" />}
            </div>
          )}
        </div>
      )}

      {/* ── Thornton Official Zoning (authoritative) ── */}
      {isThornton && !isDenver && !isAurora && !isCentennial && !isDouglas && !isJefferson && !isLarimer && !isElPaso && !isClearCreek && !isLakewood && !isArvada && !isGreenwoodVillage && !isLittleton && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ap-t3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Official Thornton Zoning</div>
            <div style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 600, color: '#134e4a', background: 'rgba(20,184,166,0.12)', borderRadius: 6, padding: '2px 8px', border: '1px solid rgba(20,184,166,0.3)' }}>City of Thornton — Authoritative</div>
          </div>
          <div style={{ background: 'rgba(20,184,166,0.08)', border: '1.5px solid rgba(20,184,166,0.3)', borderRadius: 12, padding: '14px 16px', marginBottom: 12 }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#134e4a', letterSpacing: '-0.5px' }}>{thorntonZoning?.zoneCode ?? '—'}</div>
            {thrDistrict && <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ap-t1)', marginTop: 2 }}>{thrDistrict.name}</div>}
            {thrDistrict && <div style={{ fontSize: 12, color: 'var(--ap-t2)', marginTop: 6, lineHeight: 1.5 }}>{thrDistrict.summary}</div>}
          </div>
          {thrDistrict && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
              {([['Max Height', thrDistrict.maxHeightFt ? `${thrDistrict.maxHeightFt} ft` : 'N/A'], ['Min Lot Size', thrDistrict.minLotSqft ? `${thrDistrict.minLotSqft.toLocaleString()} sq ft` : 'N/A'], ['Max Density', thrDistrict.maxDensityPerAcre ? `${thrDistrict.maxDensityPerAcre} du/ac` : 'N/A'], ['Category', THORNTON_CATEGORY_LABELS[thrDistrict.category]]] as [string, string][]).map(([label, val]) => (
                <div key={label} style={{ background: 'rgba(0,0,0,0.025)', borderRadius: 8, padding: '7px 10px', border: '1px solid var(--ap-sep)' }}>
                  <div style={{ fontSize: 10, color: 'var(--ap-t3)' }}>{label}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ap-t1)', marginTop: 1 }}>{val}</div>
                </div>
              ))}
            </div>
          )}
          {thrDistrict && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <UseList title="Permitted By Right" items={thrDistrict.permittedByRight} color="#166534" dotColor="#34c759" bg="rgba(52,199,89,0.06)" border="rgba(52,199,89,0.2)" />
              {thrDistrict.conditionalUses.length > 0 && <UseList title="Conditional Uses" items={thrDistrict.conditionalUses} color="#92400e" dotColor="#f59e0b" bg="rgba(245,158,11,0.06)" border="rgba(245,158,11,0.2)" />}
              {thrDistrict.prohibited.length > 0 && <UseList title="Prohibited" items={thrDistrict.prohibited} color="#7f1d1d" dotColor="#ef4444" bg="rgba(239,68,68,0.06)" border="rgba(239,68,68,0.2)" />}
              {thrDistrict.notes && <div style={{ marginTop: 6, padding: '8px 10px', borderRadius: 8, background: 'rgba(0,0,0,0.03)', fontSize: 11, color: 'var(--ap-t3)', lineHeight: 1.5 }}>{thrDistrict.notes}</div>}
            </div>
          )}
        </div>
      )}

      {/* ── Arapahoe County Official Zoning (authoritative) ── */}
      {isArapahoe && !isDenver && !isAurora && !isCentennial && !isDouglas && !isJefferson && !isLarimer && !isElPaso && !isClearCreek && !isLakewood && !isArvada && !isGreenwoodVillage && !isLittleton && !isThornton && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ap-t3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Arapahoe County Zoning</span>
            <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 99, background: 'rgba(234,88,12,0.12)', color: '#c2410c', fontWeight: 700 }}>Unincorporated County</span>
          </div>
          {arapDistrict ? (
            <>
              <Row label="Zone" value={<><span style={{ fontWeight: 700, color: '#c2410c' }}>{arapahoeZoning!.zoneCode}</span> — {arapDistrict.name}</>} />
              <Row label="Category" value={ARAPAHOE_CATEGORY_LABELS[arapDistrict.category]} />
              <Row label="Summary" value={arapDistrict.summary} />
              {arapDistrict.minLotSqft > 0 && <Row label="Min Lot" value={`${arapDistrict.minLotSqft.toLocaleString()} sf`} />}
              {arapDistrict.maxHeightFt > 0 && <Row label="Max Height" value={`${arapDistrict.maxHeightFt} ft`} />}
              {arapDistrict.maxDensityPerAcre !== null && <Row label="Max Density" value={`${arapDistrict.maxDensityPerAcre} du/ac`} />}
              {arapDistrict.maxFAR > 0 && <Row label="Max FAR" value={arapDistrict.maxFAR.toFixed(2)} />}
              {arapDistrict.permittedByRight.length > 0 && <Row label="Permitted by Right" value={arapDistrict.permittedByRight.join(' · ')} />}
              {arapDistrict.conditionalUses.length > 0 && <Row label="Conditional Uses" value={arapDistrict.conditionalUses.join(' · ')} />}
              {arapDistrict.notes && <Row label="Notes" value={arapDistrict.notes} />}
            </>
          ) : (
            <Row label="Zone Code" value={arapahoeZoning!.zoneCode ?? '—'} />
          )}
          <div style={{ fontSize: 10, color: 'var(--ap-t3)', marginTop: 8 }}>Source: Arapahoe County ArapaMAP — Zoning Layer 352</div>
        </div>
      )}

      {/* ── Broomfield Official Zoning (authoritative) ── */}
      {isBroomfield && !isDenver && !isAurora && !isCentennial && !isDouglas && !isJefferson && !isLarimer && !isElPaso && !isClearCreek && !isLakewood && !isArvada && !isGreenwoodVillage && !isLittleton && !isThornton && !isArapahoe && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ap-t3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Broomfield Zoning</span>
            <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 99, background: 'rgba(79,70,229,0.12)', color: '#4338ca', fontWeight: 700 }}>City & County</span>
          </div>
          {broomDistrict ? (
            <>
              <Row label="Zone" value={<><span style={{ fontWeight: 700, color: '#4338ca' }}>{broomfieldZoning!.zoneCode}</span> — {broomDistrict.name}</>} />
              <Row label="Category" value={BROOMFIELD_CATEGORY_LABELS[broomDistrict.category]} />
              <Row label="Summary" value={broomDistrict.summary} />
              {broomDistrict.minLotSqft > 0 && <Row label="Min Lot" value={`${broomDistrict.minLotSqft.toLocaleString()} sf`} />}
              {broomDistrict.maxHeightFt > 0 && <Row label="Max Height" value={`${broomDistrict.maxHeightFt} ft`} />}
              {broomDistrict.maxDensityPerAcre !== null && <Row label="Max Density" value={`${broomDistrict.maxDensityPerAcre} du/ac`} />}
              {broomDistrict.maxFAR > 0 && <Row label="Max FAR" value={broomDistrict.maxFAR.toFixed(2)} />}
              {broomDistrict.permittedByRight.length > 0 && <Row label="Permitted by Right" value={broomDistrict.permittedByRight.join(' · ')} />}
              {broomDistrict.conditionalUses.length > 0 && <Row label="Conditional Uses" value={broomDistrict.conditionalUses.join(' · ')} />}
              {broomDistrict.notes && <Row label="Notes" value={broomDistrict.notes} />}
            </>
          ) : (
            <Row label="Zone Code" value={broomfieldZoning!.zoneCode ?? '—'} />
          )}
          <div style={{ fontSize: 10, color: 'var(--ap-t3)', marginTop: 8 }}>Source: Broomfield Open Data — Zoning (ArcGIS Online)</div>
        </div>
      )}

      {/* ── Boulder County Official Zoning (authoritative) ── */}
      {isBoulderCounty && !isDenver && !isAurora && !isCentennial && !isDouglas && !isJefferson && !isLarimer && !isElPaso && !isClearCreek && !isLakewood && !isArvada && !isGreenwoodVillage && !isLittleton && !isThornton && !isArapahoe && !isBroomfield && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ap-t3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Boulder County Zoning</span>
            <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 99, background: 'rgba(5,150,105,0.12)', color: '#047857', fontWeight: 700 }}>Unincorporated County</span>
          </div>
          {bocoDistrict ? (
            <>
              <Row label="Zone" value={<><span style={{ fontWeight: 700, color: '#047857' }}>{boulderCountyZoning!.zoneCode}</span> — {bocoDistrict.name}</>} />
              <Row label="Category" value={BOULDER_COUNTY_CATEGORY_LABELS[bocoDistrict.category]} />
              <Row label="Summary" value={bocoDistrict.summary} />
              {bocoDistrict.minLotSqft > 0 && <Row label="Min Lot" value={`${bocoDistrict.minLotSqft.toLocaleString()} sf`} />}
              {bocoDistrict.maxHeightFt > 0 && <Row label="Max Height" value={`${bocoDistrict.maxHeightFt} ft`} />}
              {bocoDistrict.maxDensityPerAcre !== null && <Row label="Max Density" value={`${bocoDistrict.maxDensityPerAcre} du/ac`} />}
              {bocoDistrict.maxFAR > 0 && <Row label="Max FAR" value={bocoDistrict.maxFAR.toFixed(2)} />}
              {bocoDistrict.permittedByRight.length > 0 && <Row label="Permitted by Right" value={bocoDistrict.permittedByRight.join(' · ')} />}
              {bocoDistrict.conditionalUses.length > 0 && <Row label="Conditional Uses" value={bocoDistrict.conditionalUses.join(' · ')} />}
              {bocoDistrict.notes && <Row label="Notes" value={bocoDistrict.notes} />}
            </>
          ) : (
            <Row label="Zone Code" value={boulderCountyZoning!.zoneCode ?? '—'} />
          )}
          <div style={{ fontSize: 10, color: 'var(--ap-t3)', marginTop: 8 }}>Source: Boulder County Planning — LUC Zoning Districts MapServer</div>
        </div>
      )}

      {/* ── Weld County Official Zoning (authoritative) ── */}
      {isWeld && !isDenver && !isAurora && !isCentennial && !isDouglas && !isJefferson && !isLarimer && !isElPaso && !isClearCreek && !isLakewood && !isArvada && !isGreenwoodVillage && !isLittleton && !isThornton && !isArapahoe && !isBroomfield && !isBoulderCounty && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ap-t3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Weld County Zoning</span>
            <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 99, background: 'rgba(161,98,7,0.12)', color: '#92400e', fontWeight: 700 }}>Unincorporated County</span>
          </div>
          {weldDistrict ? (
            <>
              <Row label="Zone" value={<><span style={{ fontWeight: 700, color: '#92400e' }}>{weldZoning!.zoneCode}</span> — {weldDistrict.name}</>} />
              {weldZoning!.zoneName && <Row label="Description" value={weldZoning!.zoneName} />}
              <Row label="Category" value={WELD_CATEGORY_LABELS[weldDistrict.category]} />
              <Row label="Summary" value={weldDistrict.summary} />
              {weldDistrict.minLotSqft > 0 && <Row label="Min Lot" value={`${weldDistrict.minLotSqft.toLocaleString()} sf`} />}
              {weldDistrict.maxHeightFt > 0 && <Row label="Max Height" value={`${weldDistrict.maxHeightFt} ft`} />}
              {weldDistrict.maxDensityPerAcre !== null && <Row label="Max Density" value={`${weldDistrict.maxDensityPerAcre} du/ac`} />}
              {weldDistrict.maxFAR > 0 && <Row label="Max FAR" value={weldDistrict.maxFAR.toFixed(2)} />}
              {weldDistrict.permittedByRight.length > 0 && <Row label="Permitted by Right" value={weldDistrict.permittedByRight.join(' · ')} />}
              {weldDistrict.conditionalUses.length > 0 && <Row label="Conditional Uses" value={weldDistrict.conditionalUses.join(' · ')} />}
              {weldDistrict.notes && <Row label="Notes" value={weldDistrict.notes} />}
            </>
          ) : (
            <Row label="Zone Code" value={weldZoning!.zoneCode ?? '—'} />
          )}
          <div style={{ fontSize: 10, color: 'var(--ap-t3)', marginTop: 8 }}>Source: Weld County Open Data — Zoning (ArcGIS Online)</div>
        </div>
      )}

      {/* ── Pueblo County Official Zoning (authoritative) ── */}
      {isPuebloCounty && !isDenver && !isAurora && !isCentennial && !isDouglas && !isJefferson && !isLarimer && !isElPaso && !isClearCreek && !isLakewood && !isArvada && !isGreenwoodVillage && !isLittleton && !isThornton && !isArapahoe && !isBroomfield && !isBoulderCounty && !isWeld && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ap-t3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Pueblo County Zoning</span>
            <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 99, background: 'rgba(124,58,237,0.12)', color: '#6d28d9', fontWeight: 700 }}>Unincorporated County</span>
          </div>
          {puebloDistrict ? (
            <>
              <Row label="Zone" value={<><span style={{ fontWeight: 700, color: '#6d28d9' }}>{puebloCountyZoning!.zoneCode}</span> — {puebloDistrict.name}</>} />
              <Row label="Category" value={PUEBLO_COUNTY_CATEGORY_LABELS[puebloDistrict.category]} />
              <Row label="Summary" value={puebloDistrict.summary} />
              {puebloDistrict.minLotSqft > 0 && <Row label="Min Lot" value={`${puebloDistrict.minLotSqft.toLocaleString()} sf`} />}
              {puebloDistrict.maxHeightFt > 0 && <Row label="Max Height" value={`${puebloDistrict.maxHeightFt} ft`} />}
              {puebloDistrict.maxDensityPerAcre !== null && <Row label="Max Density" value={`${puebloDistrict.maxDensityPerAcre} du/ac`} />}
              {puebloDistrict.maxFAR > 0 && <Row label="Max FAR" value={puebloDistrict.maxFAR.toFixed(2)} />}
              {puebloDistrict.permittedByRight.length > 0 && <Row label="Permitted by Right" value={puebloDistrict.permittedByRight.join(' · ')} />}
              {puebloDistrict.conditionalUses.length > 0 && <Row label="Conditional Uses" value={puebloDistrict.conditionalUses.join(' · ')} />}
              {puebloDistrict.notes && <Row label="Notes" value={puebloDistrict.notes} />}
            </>
          ) : (
            <Row label="Zone Code" value={puebloCountyZoning!.zoneCode ?? '—'} />
          )}
          <div style={{ fontSize: 10, color: 'var(--ap-t3)', marginTop: 8 }}>Source: Pueblo County GIS — Zoning (County Only)</div>
        </div>
      )}

      {/* ── Statewide ESRI zoning (fallback / supplement) ── */}
      {!isDenver && !isAurora && !isCentennial && !isDouglas && !isJefferson && !isLarimer && !isElPaso && !isClearCreek && !isLakewood && !isArvada && !isGreenwoodVillage && !isLittleton && !isThornton && !isArapahoe && !isBroomfield && !isBoulderCounty && !isWeld && !isPuebloCounty && (
        <>
          {(z.code || z.description || z.landUseCode || z.landUseDescription) ? (
            <Section title="Zoning (Statewide Layer)">
              <Row label="Zone Code"     value={z.code || '—'} />
              <Row label="Description"   value={z.description || '—'} />
              <Row label="Land Use Code" value={z.landUseCode || '—'} />
              <Row label="Land Use"      value={z.landUseDescription || '—'} />
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
          <HBUMini result={hbuResult} zoneCode={zoneCodeForHbu!} useCode={mappedUse!} />
        ) : (
          <div style={{ padding: '12px', borderRadius: 10, background: 'rgba(0,0,0,0.03)', border: '1px dashed var(--ap-sep)' }}>
            <div style={{ fontSize: 12, color: 'var(--ap-t3)', lineHeight: 1.5 }}>
              {!officialZoneCode && !z.code
                ? 'No zone code available.'
                : !zoneCodeForHbu
                ? `Zone "${officialZoneCode ?? z.code}" not yet in the HBU rules engine — use the Zoning & HBU tab.`
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

function TaxTab({ f, denverZoning, denverValuation, douglasDetail, arapahoeDetail, jeffersonDetail }: {
  f: ParcelFeature;
  denverZoning?: DenverZoningRaw | null;
  denverValuation?: DenverParcelValuationData | null;
  douglasDetail?: DouglasParcelData | null;
  arapahoeDetail?: ArapahoeParcelData | null;
  jeffersonDetail?: JeffersonParcelData | null;
}) {
  const v = f.valuation;
  const isDenver = !!denverZoning?.zoneDistrict;
  const isDouglas = !!douglasDetail;
  const isArapahoe = !!arapahoeDetail;
  const isJefferson = !!jeffersonDetail;
  const zoneCode = denverZoning?.zoneDistrict ?? f.zoning.code ?? '';
  const propertyClass = classifyPropertyType(zoneCode, f.zoning.landUseDescription, f.zoning.landUseCode);
  const taxEstimate = isDenver ? estimateDenverTax(v.assessedValue ?? v.improvementValue ?? null, propertyClass) : null;

  return (
    <>
      {/* ── Denver Tax Estimate ── */}
      {isDenver && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ap-t3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Estimated Annual Tax
            </div>
            <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 99, background: 'rgba(52,199,89,0.12)', color: '#166534', fontWeight: 600 }}>
              Denver 2025 · Payable 2026
            </span>
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
              </div>

              {/* Inferred market value note */}
              {taxEstimate.inferredActualValue && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', borderRadius: 8, background: 'rgba(0,0,0,0.025)', border: '1px solid var(--ap-sep)', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: 'var(--ap-t3)' }}>Inferred Market Value</span>
                  <span style={{ fontSize: 11, color: 'var(--ap-t2)', fontWeight: 600 }}>
                    ~{formatCurrency(taxEstimate.inferredActualValue)}
                    <span style={{ fontWeight: 400, color: 'var(--ap-t3)' }}> (assessed ÷ {(taxEstimate.assessmentRate * 100).toFixed(2)}%)</span>
                  </span>
                </div>
              )}

              {/* Calculation steps */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
                {([
                  ['Assessed Value (County Assessor)', formatCurrency(taxEstimate.assessedValue)],
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

              {/* Mill levy breakdown */}
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
            </>
          ) : (
            <div style={{ padding: '12px', borderRadius: 10, background: 'rgba(0,0,0,0.03)', border: '1px dashed var(--ap-sep)', fontSize: 12, color: 'var(--ap-t3)', lineHeight: 1.5 }}>
              Appraised value required to estimate tax. The ESRI parcel service did not return a value for this property.
            </div>
          )}
        </div>
      )}

      {/* ── Denver enriched valuation (land/improvement split) ── */}
      {isDenver && denverValuation && (
        <Section title="Valuation (Denver Assessor)">
          <Row label="Appraised Land"        value={formatCurrency(denverValuation.appraisedLandValue)} />
          <Row label="Appraised Improvement" value={formatCurrency(denverValuation.appraisedImprovementValue)} />
          <Row label="Appraised Total"       value={formatCurrency(denverValuation.appraisedTotalValue)} />
          <Row label="Assessed Land"         value={formatCurrency(denverValuation.assessedLandValue)} />
          <Row label="Assessed Improvement"  value={formatCurrency(denverValuation.assessedImprovementValue)} />
          <Row label="Assessed Total"        value={formatCurrency(denverValuation.assessedTotalValue)} />
        </Section>
      )}

      {/* ── Douglas County tax detail ── */}
      {isDouglas && (
        <>
          <Section title="Valuation (Douglas County Assessor)">
            <Row label="Appraised Total Value" value={formatCurrency(douglasDetail!.totalActualValue)} />
            <Row label="Assessed Value"        value={formatCurrency(douglasDetail!.totalAssessedValue)} />
            <Row label="Property Type"         value={douglasDetail!.propertyType || douglasDetail!.accountSubtypeCode || '—'} />
          </Section>
          <Section title="Tax (Douglas County)">
            {douglasDetail!.latestTaxReport ? (
              <>
                <Row label="Tax Year"           value={douglasDetail!.latestTaxReport.taxYear ? String(douglasDetail!.latestTaxReport.taxYear) : '—'} />
                <Row label="Total Actual Value" value={formatCurrency(douglasDetail!.latestTaxReport.totalActualValue)} />
                <Row label="Taxable Assessed"   value={formatCurrency(douglasDetail!.latestTaxReport.taxableAssessedValue)} />
                <Row label="Mill Levy"          value={douglasDetail!.latestTaxReport.millLevy ? `${douglasDetail!.latestTaxReport.millLevy.toFixed(3)} mills` : '—'} />
                <Row label="Estimated Tax"      value={formatCurrency(douglasDetail!.latestTaxReport.estimatedTaxes)} />
              </>
            ) : (
              <>
                <Row label="Assessed Value"  value={formatCurrency(douglasDetail!.totalAssessedValue)} />
                <Row label="Mill Levy"       value={douglasDetail!.fullMillLevy ? `${douglasDetail!.fullMillLevy.toFixed(3)} mills` : '—'} />
                <Row label="Estimated Tax"   value={formatCurrency(douglasDetail!.estimatedAnnualTax)} />
              </>
            )}
            <Row label="Assessor Detail" value={
              <a href={douglasDetail!.detailUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ap-blue)', fontSize: 11 }}>
                Douglas Assessor ↗
              </a>
            } />
          </Section>
        </>
      )}

      {/* ── Arapahoe County tax detail ── */}
      {isArapahoe && (
        <>
          <Section title="Valuation (Arapahoe County Assessor)">
            <Row label="Appraised Land"        value={formatCurrency(arapahoeDetail!.appraisedLandValue)} />
            <Row label="Appraised Improvement" value={formatCurrency(arapahoeDetail!.appraisedBuildingValue)} />
            <Row label="Appraised Total"       value={formatCurrency(arapahoeDetail!.appraisedTotalValue)} />
            <Row label="Assessed Land"         value={formatCurrency(arapahoeDetail!.assessedLandValue)} />
            <Row label="Assessed Improvement"  value={formatCurrency(arapahoeDetail!.assessedBuildingValue)} />
            <Row label="Assessed Total"        value={formatCurrency(arapahoeDetail!.assessedTotalValue)} />
            <Row label="Land Use"              value={arapahoeDetail!.landUse || '—'} />
          </Section>
          {arapahoeDetail!.tax && (
            <Section title="Tax (Arapahoe County)">
              <Row label="Tax Year"        value={arapahoeDetail!.tax.taxYear ? String(arapahoeDetail!.tax.taxYear) : '—'} />
              <Row label="Taxable Value"   value={formatCurrency(arapahoeDetail!.tax.taxableValue)} />
              <Row label="Tax Rate"        value={arapahoeDetail!.tax.totalTaxRate ? `${arapahoeDetail!.tax.totalTaxRate.toFixed(3)} mills` : '—'} />
              <Row label="Assessed Tax"    value={formatCurrency(arapahoeDetail!.tax.assessedTax)} />
              <Row label="Total Due"       value={formatCurrency(arapahoeDetail!.tax.totalDue)} />
              <Row label="Assessor Detail" value={
                <a href={arapahoeDetail!.detailUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ap-blue)', fontSize: 11 }}>
                  Arapahoe Assessor ↗
                </a>
              } />
            </Section>
          )}
        </>
      )}

      {/* ── Jefferson County tax detail ── */}
      {isJefferson && (
        <>
          <Section title="Valuation (Jefferson County Assessor)">
            <Row label="Appraised Land"        value={formatCurrency(jeffersonDetail!.landValue)} />
            <Row label="Appraised Improvement" value={formatCurrency(jeffersonDetail!.improvementValue)} />
            <Row label="Appraised Total"       value={formatCurrency(jeffersonDetail!.totalActualValue)} />
            <Row label="Assessed Value"        value={formatCurrency(jeffersonDetail!.assessedValue)} />
            <Row label="Tax Class"             value={jeffersonDetail!.taxClass || '—'} />
          </Section>
          <Section title="Tax (Jefferson County)">
            <Row label="Mill Levy"      value={jeffersonDetail!.millLevy ? `${jeffersonDetail!.millLevy.toFixed(3)} mills` : '—'} />
            <Row label="Estimated Tax"  value={formatCurrency(jeffersonDetail!.estimatedAnnualTax)} />
            <Row label="Assessor Detail" value={
              <a href={jeffersonDetail!.detailUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ap-blue)', fontSize: 11 }}>
                Jefferson Assessor ↗
              </a>
            } />
          </Section>
        </>
      )}

      {/* ── Valuation from ESRI ── */}
      <Section title={isDenver || isDouglas || isArapahoe || isJefferson ? 'Valuation (ESRI Statewide Layer)' : 'Valuation'}>
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

function ActivityTab({ f }: { f: ParcelFeature }) {
  return (
    <>
      <Section title="Development Activity">
        <EmptyBadge label="No recent permit or application activity on file." />
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

export function ParcelPanel({ feature, open, address, neighbourhood, denverZoning, auroraZoning, centennialZoning, douglasZoning, jeffersonZoning, larimerZoning, elpasoZoning, clearcreekZoning, lakewoodZoning, arvadaZoning, greenwoodvillageZoning, littletonZoning, thorntonZoning, arapahoeZoning, broomfieldZoning, boulderCountyZoning, weldZoning, puebloCountyZoning, denverBuilding, denverValuation, douglasDetail, arapahoeDetail, jeffersonDetail, onClose }: ParcelPanelProps) {
  const [activeTab, setActiveTab] = useState<PanelTab>('parcel');

  const panelW = 380;

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
              {feature?.location.situsAddress || address || 'Selected Location'}
            </div>
            {(feature?.location.city || feature?.location.county) && (
              <div style={{ fontSize: 12, color: 'var(--ap-t3)', marginTop: 2 }}>
                {neighbourhood
                  ? [neighbourhood, feature.location.city, feature.location.county + ' County', 'CO'].filter(Boolean).join(', ')
                  : [feature.location.city, feature.location.county + ' County', 'CO'].filter(Boolean).join(', ')
                }
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
            {denverZoning?.zoneDistrict && (
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: 'rgba(0,113,227,0.10)', color: '#0051b3', fontWeight: 700 }}>
                {denverZoning.zoneDistrict}
              </span>
            )}
            {feature._source === 'esri' && (
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: 'rgba(52,199,89,0.10)', color: '#1a7c35', fontWeight: 500 }}>
                ESRI Live
              </span>
            )}
          </div>
        )}

        {/* Tab bar */}
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
      </div>

      {/* ── Scrollable content ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px 24px' }}>
        {!feature ? (
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
            {activeTab === 'parcel'   && <ParcelTab f={feature} neighbourhood={neighbourhood} denverBuilding={denverBuilding} denverValuation={denverValuation} douglasDetail={douglasDetail} arapahoeDetail={arapahoeDetail} jeffersonDetail={jeffersonDetail} />}
            {activeTab === 'zoning'   && <ZoningTab f={feature} denverZoning={denverZoning} auroraZoning={auroraZoning} centennialZoning={centennialZoning} douglasZoning={douglasZoning} jeffersonZoning={jeffersonZoning} larimerZoning={larimerZoning} elpasoZoning={elpasoZoning} clearcreekZoning={clearcreekZoning} lakewoodZoning={lakewoodZoning} arvadaZoning={arvadaZoning} greenwoodvillageZoning={greenwoodvillageZoning} littletonZoning={littletonZoning} thorntonZoning={thorntonZoning} arapahoeZoning={arapahoeZoning} broomfieldZoning={broomfieldZoning} boulderCountyZoning={boulderCountyZoning} weldZoning={weldZoning} puebloCountyZoning={puebloCountyZoning} />}
            {activeTab === 'tax'      && <TaxTab f={feature} denverZoning={denverZoning} denverValuation={denverValuation} douglasDetail={douglasDetail} arapahoeDetail={arapahoeDetail} jeffersonDetail={jeffersonDetail} />}
            {activeTab === 'council'  && <CouncilTab f={feature} />}
            {activeTab === 'activity' && <ActivityTab f={feature} />}
          </>
        )}
      </div>
    </div>
  );
}
