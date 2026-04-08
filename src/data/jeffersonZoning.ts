/**
 * Jefferson County Zoning Districts
 *
 * Based on the Jefferson County Zoning Resolution.
 * Code values match the Zoning field returned by the Jefferson County
 * GIS MapServer (gisportal.jeffco.us/server2/rest/services/Zoning/MapServer/36).
 *
 * Source: Jefferson County Planning & Zoning
 * https://www.jeffco.us/1228/Zoning-Resolution
 */

export interface JeffersonZoneDistrict {
  code: string;
  name: string;
  category:
    | 'residential'
    | 'mixed-use'
    | 'commercial'
    | 'industrial'
    | 'agricultural'
    | 'open-space'
    | 'overlay';
  summary: string;
  minLotSqft: number;
  maxHeightFt: number;
  maxDensityPerAcre: number | null;
  maxFAR: number;
  permittedByRight: string[];
  conditionalUses: string[];
  prohibited: string[];
  notes?: string;
}

const JEFFERSON_ZONES: JeffersonZoneDistrict[] = [
  // ── Agricultural ──────────────────────────────────────────────────────────
  {
    code: 'A-1',
    name: 'Agricultural-One District',
    category: 'agricultural',
    summary: 'Large-lot agricultural and rural residential uses on minimum 2-acre lots. Protects mountain and foothill agricultural character.',
    minLotSqft: 87120, // 2 acres
    maxHeightFt: 35,
    maxDensityPerAcre: 0.5,
    maxFAR: 0,
    permittedByRight: [
      'Single-family detached home',
      'Agriculture, farming, and ranching',
      'Horse keeping',
      'Home occupation (minor)',
      'Accessory structures',
    ],
    conditionalUses: [
      'Bed & breakfast',
      'Kennel / boarding',
      'Religious institution',
      'School',
      'Winery / brewery (small-scale)',
    ],
    prohibited: [
      'Multi-family residential',
      'Commercial retail',
      'Industrial uses',
      'Mobile home parks',
    ],
  },
  {
    code: 'A-2',
    name: 'Agricultural-Two District',
    category: 'agricultural',
    summary: 'Larger rural agricultural lots, typically 5+ acres. Supports active farming and ranching operations.',
    minLotSqft: 217800, // 5 acres
    maxHeightFt: 35,
    maxDensityPerAcre: 0.2,
    maxFAR: 0,
    permittedByRight: [
      'Single-family detached home',
      'Farming and crop production',
      'Livestock and grazing',
      'Accessory structures',
    ],
    conditionalUses: [
      'Agricultural processing facility',
      'Farm worker housing',
      'Riding stable / equestrian center',
    ],
    prohibited: [
      'Residential subdivision',
      'Commercial and industrial uses',
    ],
  },

  // ── Residential ───────────────────────────────────────────────────────────
  {
    code: 'MR-1',
    name: 'Mountain Residential-One',
    category: 'residential',
    summary: 'Very low-density mountain residential on large lots. Common in unincorporated Jefferson County mountain communities.',
    minLotSqft: 217800, // 5 acres
    maxHeightFt: 35,
    maxDensityPerAcre: 0.2,
    maxFAR: 0,
    permittedByRight: [
      'Single-family detached home',
      'Parks and open space',
      'Home occupation (minor)',
      'Accessory structures',
    ],
    conditionalUses: [
      'Bed & breakfast',
      'Religious institution',
      'School',
    ],
    prohibited: [
      'Multi-family residential',
      'Commercial retail',
      'Industrial uses',
    ],
  },
  {
    code: 'MR-2',
    name: 'Mountain Residential-Two',
    category: 'residential',
    summary: 'Low-density mountain residential, typically on 1–5 acre lots in foothill communities.',
    minLotSqft: 43560, // 1 acre
    maxHeightFt: 35,
    maxDensityPerAcre: 1,
    maxFAR: 0,
    permittedByRight: [
      'Single-family detached home',
      'Parks and open space',
      'Home occupation',
      'Accessory structures',
    ],
    conditionalUses: [
      'Group home (≤8 residents)',
      'Religious institution',
      'School',
    ],
    prohibited: [
      'Multi-family (3+ units)',
      'Commercial retail',
      'Industrial uses',
    ],
  },
  {
    code: 'MR-3',
    name: 'Mountain Residential-Three',
    category: 'residential',
    summary: 'Moderate mountain residential density on 0.5–1 acre lots near mountain communities.',
    minLotSqft: 21780, // 0.5 acre
    maxHeightFt: 35,
    maxDensityPerAcre: 2,
    maxFAR: 0,
    permittedByRight: [
      'Single-family detached home',
      'Home occupation',
      'Accessory structures',
    ],
    conditionalUses: [
      'Duplex',
      'Religious institution',
    ],
    prohibited: [
      'Multi-family (3+ units)',
      'Commercial retail',
      'Industrial uses',
    ],
  },
  {
    code: 'SR-1',
    name: 'Suburban Residential-One',
    category: 'residential',
    summary: 'Low-density suburban residential on 0.5–1 acre lots in unincorporated suburban areas.',
    minLotSqft: 21780, // 0.5 acre
    maxHeightFt: 35,
    maxDensityPerAcre: 2,
    maxFAR: 0,
    permittedByRight: [
      'Single-family detached home',
      'Parks and open space',
      'Home occupation (minor)',
      'Accessory dwelling unit (ADU)',
      'Accessory structures',
    ],
    conditionalUses: [
      'Duplex',
      'Group home (≤8 residents)',
      'Religious institution',
      'School',
    ],
    prohibited: [
      'Multi-family (3+ units)',
      'Commercial retail',
      'Industrial uses',
    ],
  },
  {
    code: 'SR-2',
    name: 'Suburban Residential-Two',
    category: 'residential',
    summary: 'Standard suburban residential on 10,000–20,000 sq ft lots.',
    minLotSqft: 10000,
    maxHeightFt: 35,
    maxDensityPerAcre: 4,
    maxFAR: 0,
    permittedByRight: [
      'Single-family detached home',
      'Parks and open space',
      'Home occupation (minor)',
      'ADU',
      'Accessory structures',
    ],
    conditionalUses: [
      'Duplex (on corner lots)',
      'Group home',
      'Religious institution',
      'School',
      'Child care center',
    ],
    prohibited: [
      'Multi-family (3+ units)',
      'Commercial retail',
      'Industrial uses',
    ],
  },
  {
    code: 'R-1',
    name: 'Residential-One',
    category: 'residential',
    summary: 'Medium-density single-family residential on standard urban-sized lots.',
    minLotSqft: 6000,
    maxHeightFt: 35,
    maxDensityPerAcre: 6,
    maxFAR: 0,
    permittedByRight: [
      'Single-family detached home',
      'Parks and open space',
      'Home occupation',
      'ADU',
    ],
    conditionalUses: [
      'Duplex',
      'Group home',
      'Religious institution',
      'School',
    ],
    prohibited: [
      'Apartment buildings',
      'Commercial retail',
      'Industrial uses',
    ],
  },
  {
    code: 'R-2',
    name: 'Residential-Two',
    category: 'residential',
    summary: 'Medium-density residential allowing single-family, duplex, and some multifamily uses.',
    minLotSqft: 4000,
    maxHeightFt: 35,
    maxDensityPerAcre: 10,
    maxFAR: 0.5,
    permittedByRight: [
      'Single-family detached home',
      'Duplex',
      'Townhome',
      'Home occupation',
    ],
    conditionalUses: [
      'Triplex / fourplex',
      'Group home',
      'Religious institution',
    ],
    prohibited: [
      'Large apartment buildings (5+ units)',
      'Commercial retail',
      'Industrial uses',
    ],
  },
  {
    code: 'R-3',
    name: 'Residential-Three',
    category: 'residential',
    summary: 'Higher-density multi-family residential. Supports apartment complexes and senior housing.',
    minLotSqft: 3000,
    maxHeightFt: 45,
    maxDensityPerAcre: 20,
    maxFAR: 1.0,
    permittedByRight: [
      'Apartment building',
      'Condominium',
      'Townhome',
      'Senior housing',
      'Parks and open space',
    ],
    conditionalUses: [
      'Residential care facility',
      'Religious institution',
      'Child care center',
    ],
    prohibited: [
      'Commercial retail',
      'Industrial uses',
    ],
  },

  // ── Commercial ────────────────────────────────────────────────────────────
  {
    code: 'NB',
    name: 'Neighborhood Business District',
    category: 'commercial',
    summary: 'Small-scale commercial serving nearby residential neighborhoods. Emphasizes pedestrian-friendly, low-intensity uses.',
    minLotSqft: 5000,
    maxHeightFt: 35,
    maxDensityPerAcre: null,
    maxFAR: 1.0,
    permittedByRight: [
      'Retail shops and personal services',
      'Restaurant / café',
      'Professional office',
      'Medical clinic',
      'Child care center',
    ],
    conditionalUses: [
      'Drive-through facility',
      'Gas station',
      'Financial services',
    ],
    prohibited: [
      'Heavy industrial',
      'Auto sales',
      'Outdoor storage',
      'Residential (standalone)',
    ],
  },
  {
    code: 'BC',
    name: 'Business / Commercial District',
    category: 'commercial',
    summary: 'Community-scale commercial for corridors and commercial nodes. Accommodates auto-oriented uses.',
    minLotSqft: 10000,
    maxHeightFt: 50,
    maxDensityPerAcre: null,
    maxFAR: 1.5,
    permittedByRight: [
      'Retail and shopping centers',
      'Restaurant and food service',
      'Hotel and motel',
      'Auto service and repair',
      'Drive-through facilities',
      'Office and professional services',
    ],
    conditionalUses: [
      'Gas station',
      'Auto sales',
      'Entertainment venue',
    ],
    prohibited: [
      'Heavy manufacturing',
      'Outdoor storage (primary)',
      'Residential (standalone)',
    ],
  },

  // ── Industrial / Business Park ────────────────────────────────────────────
  {
    code: 'LI',
    name: 'Light Industrial District',
    category: 'industrial',
    summary: 'Light industrial, flex, and business park uses with limited nuisance impacts.',
    minLotSqft: 20000,
    maxHeightFt: 55,
    maxDensityPerAcre: null,
    maxFAR: 1.0,
    permittedByRight: [
      'Light manufacturing and assembly',
      'Warehouse and distribution',
      'Research and development',
      'Business park and office',
      'Data center',
    ],
    conditionalUses: [
      'Truck terminal',
      'Outdoor storage (screened)',
      'Retail (accessory)',
    ],
    prohibited: [
      'Residential uses',
      'Heavy manufacturing',
      'Hazardous material processing',
      'Schools and child care',
    ],
  },
  {
    code: 'I',
    name: 'Industrial District',
    category: 'industrial',
    summary: 'General and heavy industrial uses including manufacturing, processing, and industrial services.',
    minLotSqft: 20000,
    maxHeightFt: 65,
    maxDensityPerAcre: null,
    maxFAR: 1.0,
    permittedByRight: [
      'Manufacturing and processing',
      'Warehouse and distribution',
      'Truck terminal',
      'Contractor yard',
      'Outdoor storage (screened)',
    ],
    conditionalUses: [
      'Asphalt / concrete plant',
      'Salvage and recycling',
    ],
    prohibited: [
      'Residential uses',
      'Retail (standalone)',
      'Schools',
    ],
  },

  // ── Open Space / PUD ──────────────────────────────────────────────────────
  {
    code: 'OS',
    name: 'Open Space District',
    category: 'open-space',
    summary: 'Public parks, natural areas, trails, and conservation lands in unincorporated Jefferson County.',
    minLotSqft: 0,
    maxHeightFt: 25,
    maxDensityPerAcre: null,
    maxFAR: 0,
    permittedByRight: [
      'Public park and recreation',
      'Trail and greenway',
      'Natural area and open space',
      'Community garden',
    ],
    conditionalUses: [
      'Golf course',
      'Athletic complex',
      'Equestrian facility',
    ],
    prohibited: [
      'Residential development',
      'Commercial retail',
      'Industrial uses',
    ],
  },
  {
    code: 'PD',
    name: 'Planned Development',
    category: 'mixed-use',
    summary: 'Flexible planned development district with site-specific uses and standards established by approved plan.',
    minLotSqft: 0,
    maxHeightFt: 0,
    maxDensityPerAcre: null,
    maxFAR: 0,
    permittedByRight: ['Per approved PD plan'],
    conditionalUses: [],
    prohibited: [],
    notes: 'All development standards are established by the approved PD document. Consult Jefferson County Planning for specific regulations.',
  },
];

const JEFFERSON_ZONE_MAP = new Map(JEFFERSON_ZONES.map(z => [z.code, z]));

export function getJeffersonZoneDistrict(zoneCode: string): JeffersonZoneDistrict | null {
  return JEFFERSON_ZONE_MAP.get(zoneCode.trim().toUpperCase()) ?? null;
}

export const JEFFERSON_CATEGORY_LABELS: Record<JeffersonZoneDistrict['category'], string> = {
  'residential':  'Residential',
  'mixed-use':    'Mixed-Use / PD',
  'commercial':   'Commercial / Business',
  'industrial':   'Industrial',
  'agricultural': 'Agricultural',
  'open-space':   'Parks & Open Space',
  'overlay':      'Overlay Zone',
};
