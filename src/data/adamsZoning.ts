/**
 * Adams County Zoning Districts — Unincorporated Adams County
 *
 * Source: Adams County Zoning FeatureServer
 * https://services3.arcgis.com/4PNQOtAivErR7nbT/arcgis/rest/services/Zoning/FeatureServer/0
 *
 * Key field: ZONE_ — zone code (e.g., "A-1", "R-1-A", "C-1")
 * Note: Records with city names (AURORA, THORNTON, etc.) represent incorporated
 *       city boundaries and are excluded — those jurisdictions have their own zoning layers.
 */

export type AdamsZoneCategory =
  | 'residential'
  | 'multifamily'
  | 'commercial'
  | 'industrial'
  | 'agricultural'
  | 'mixed_use'
  | 'special';

export interface AdamsZoneDistrict {
  code: string;
  name: string;
  category: AdamsZoneCategory;
  description?: string;
}

const ADAMS_ZONE_DISTRICTS: AdamsZoneDistrict[] = [
  // ── Agricultural ──────────────────────────────────────────────────────────
  { code: 'A-1',  name: 'Agricultural',                        category: 'agricultural', description: 'Limited agricultural uses, large minimum lot sizes' },
  { code: 'A-2',  name: 'Agricultural General',                category: 'agricultural', description: 'General agricultural uses' },
  { code: 'A-3',  name: 'Agricultural Transitional',           category: 'agricultural', description: 'Agricultural transitional zone near urban areas' },
  { code: 'AV',   name: 'Airport Vicinity',                    category: 'special',      description: 'Airport vicinity overlay district' },
  { code: 'CO',   name: 'Conservation Open Space',             category: 'agricultural', description: 'Conservation and open space uses' },
  // ── Residential ───────────────────────────────────────────────────────────
  { code: 'R-E',  name: 'Residential Estate',                  category: 'residential',  description: 'Estate residential, large lot single-family' },
  { code: 'R-1-A', name: 'Residential Single-Family',          category: 'residential',  description: 'Single-family residential' },
  { code: 'R-1-C', name: 'Residential Single-Family (Cluster)', category: 'residential', description: 'Single-family residential cluster development' },
  { code: 'R-2',  name: 'Residential Two-Family',              category: 'residential',  description: 'Two-family / duplex residential' },
  { code: 'R-3',  name: 'Residential Multi-Family Low Density', category: 'multifamily', description: 'Low-density multi-family residential' },
  { code: 'R-4',  name: 'Residential Multi-Family High Density', category: 'multifamily', description: 'High-density multi-family residential' },
  { code: 'M-H',  name: 'Mobile Home',                         category: 'residential',  description: 'Mobile home park district' },
  // ── Commercial ────────────────────────────────────────────────────────────
  { code: 'C-0',  name: 'Office',                              category: 'commercial',   description: 'Professional office uses' },
  { code: 'C-1',  name: 'Commercial Neighborhood',             category: 'commercial',   description: 'Neighborhood-scale retail and services' },
  { code: 'C-2',  name: 'Commercial Community',                category: 'commercial',   description: 'Community-scale retail and services' },
  { code: 'C-3',  name: 'Commercial Regional',                 category: 'commercial',   description: 'Regional retail and major commercial uses' },
  { code: 'C-4',  name: 'Commercial Highway',                  category: 'commercial',   description: 'Highway-oriented commercial uses' },
  { code: 'C-5',  name: 'Commercial Heavy',                    category: 'commercial',   description: 'Heavy commercial and auto-oriented uses' },
  // ── Industrial ────────────────────────────────────────────────────────────
  { code: 'I-1',  name: 'Industrial Light',                    category: 'industrial',   description: 'Light industrial and warehousing' },
  { code: 'I-2',  name: 'Industrial General',                  category: 'industrial',   description: 'General industrial uses' },
  { code: 'I-3',  name: 'Industrial Heavy',                    category: 'industrial',   description: 'Heavy industrial uses' },
  // ── Special / Mixed ───────────────────────────────────────────────────────
  { code: 'P-U-D',  name: 'Planned Unit Development',          category: 'mixed_use',    description: 'Planned unit development — uses per approved plan' },
  { code: 'P-U-D(P)', name: 'Planned Unit Development (Preliminary)', category: 'mixed_use', description: 'PUD with preliminary plan approval' },
  { code: 'PL',   name: 'Public Lands',                        category: 'special',      description: 'Public lands and government-owned property' },
  { code: 'TOD',  name: 'Transit-Oriented Development',        category: 'mixed_use',    description: 'Mixed-use transit-oriented development' },
  { code: 'DIA',  name: 'Denver International Airport',        category: 'special',      description: 'Denver International Airport district' },
];

const DISTRICT_MAP = new Map(ADAMS_ZONE_DISTRICTS.map(d => [d.code, d]));

export function getAdamsZoneDistrict(code: string): AdamsZoneDistrict | null {
  return DISTRICT_MAP.get(code) ?? null;
}

export const ADAMS_CATEGORY_LABELS: Record<AdamsZoneCategory, string> = {
  residential:  'Residential',
  multifamily:  'Multi-Family',
  commercial:   'Commercial',
  industrial:   'Industrial',
  agricultural: 'Agricultural',
  mixed_use:    'Mixed Use / PUD',
  special:      'Special District',
};
