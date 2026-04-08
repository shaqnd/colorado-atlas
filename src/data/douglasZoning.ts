/**
 * Douglas County Zoning Districts
 *
 * Based on the Douglas County Zoning Resolution (Land Development Code).
 * Code values match the ZONE_TYPE field returned by the Douglas County
 * GIS MapServer (apps.douglas.co.us/gisod/rest/services/Landuse/MapServer/1).
 *
 * Source: Douglas County Community Development
 * https://www.douglas.co.us/documents/zoning-resolution/
 */

export interface DouglasZoneDistrict {
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

const DOUGLAS_ZONES: DouglasZoneDistrict[] = [
  // ── Agricultural ──────────────────────────────────────────────────────────
  {
    code: 'A-1',
    name: 'Agricultural District',
    category: 'agricultural',
    summary: 'Large-lot agricultural and rural uses. Preserves farming, ranching, and open land character of unincorporated Douglas County.',
    minLotSqft: 217800, // 5 acres
    maxHeightFt: 35,
    maxDensityPerAcre: 0.2,
    maxFAR: 0,
    permittedByRight: [
      'Single-family detached home',
      'Agriculture, farming, and ranching',
      'Horticulture and greenhouses',
      'Accessory structures',
      'Home occupation (minor)',
    ],
    conditionalUses: [
      'Bed & breakfast',
      'Commercial kennel / boarding',
      'Religious institution',
      'School',
      'Riding stable',
      'Winery / brewery (small scale)',
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
    name: 'Agricultural Two District',
    category: 'agricultural',
    summary: 'Very large-lot rural uses with minimum 35-acre parcels. Protects prime agricultural land and rural open space.',
    minLotSqft: 1524600, // 35 acres
    maxHeightFt: 35,
    maxDensityPerAcre: 0.03,
    maxFAR: 0,
    permittedByRight: [
      'Single-family detached home',
      'Farming, ranching, and crop production',
      'Livestock and grazing',
      'Accessory structures',
    ],
    conditionalUses: [
      'Agricultural processing',
      'Farm worker housing',
    ],
    prohibited: [
      'Residential subdivision',
      'Commercial and industrial uses',
    ],
  },

  // ── Residential ───────────────────────────────────────────────────────────
  {
    code: 'SR',
    name: 'Suburban Residential District',
    category: 'residential',
    summary: 'Semi-rural low-density residential. Typical minimum lots of 1–2.5 acres in foothill and transition areas.',
    minLotSqft: 43560, // 1 acre
    maxHeightFt: 35,
    maxDensityPerAcre: 1,
    maxFAR: 0,
    permittedByRight: [
      'Single-family detached home',
      'Parks and open space',
      'Home occupation (minor)',
      'Accessory structures',
    ],
    conditionalUses: [
      'Duplex (on large lots)',
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
    code: 'R-1',
    name: 'Single-Family Residential District',
    category: 'residential',
    summary: 'Standard suburban single-family neighborhoods. Most common residential district in Douglas County planned communities.',
    minLotSqft: 6000,
    maxHeightFt: 35,
    maxDensityPerAcre: 4,
    maxFAR: 0,
    permittedByRight: [
      'Single-family detached home',
      'Parks and open space',
      'Home occupation (minor)',
      'Accessory dwelling unit (ADU)',
      'Accessory structures',
    ],
    conditionalUses: [
      'Duplex (corner lots only)',
      'Group home (≤8 residents)',
      'Religious institution',
      'School',
      'Child care center',
    ],
    prohibited: [
      'Multi-family (3+ units)',
      'Commercial and retail uses',
      'Industrial uses',
      'Mobile home parks',
    ],
    notes: 'Typical minimum lot width 60 ft. ADUs allowed per Colorado state statute.',
  },
  {
    code: 'R-2',
    name: 'Two-Family Residential District',
    category: 'residential',
    summary: 'Allows single-family and duplex uses on medium-density lots.',
    minLotSqft: 5000,
    maxHeightFt: 35,
    maxDensityPerAcre: 8,
    maxFAR: 0,
    permittedByRight: [
      'Single-family detached home',
      'Duplex',
      'Home occupation',
      'Parks and open space',
    ],
    conditionalUses: [
      'Townhome / rowhouse',
      'Group home',
      'Religious institution',
    ],
    prohibited: [
      'Apartment buildings (5+ units)',
      'Commercial retail',
      'Industrial uses',
    ],
  },
  {
    code: 'R-3',
    name: 'Multi-Family Residential District',
    category: 'residential',
    summary: 'Medium- to high-density multi-family housing. Supports apartments, condominiums, and senior living.',
    minLotSqft: 3000,
    maxHeightFt: 45,
    maxDensityPerAcre: 20,
    maxFAR: 1.0,
    permittedByRight: [
      'Apartment building',
      'Condominium',
      'Townhome / rowhouse',
      'Senior housing / assisted living',
      'Parks and open space',
    ],
    conditionalUses: [
      'Group home / residential care facility',
      'Religious institution',
      'Child care center',
    ],
    prohibited: [
      'Commercial retail',
      'Industrial uses',
      'Single-family detached (standalone)',
    ],
  },

  // ── Commercial ────────────────────────────────────────────────────────────
  {
    code: 'B-1',
    name: 'Neighborhood Business District',
    category: 'commercial',
    summary: 'Small-scale neighborhood-serving retail and services. Designed for walkable neighborhood commercial nodes.',
    minLotSqft: 5000,
    maxHeightFt: 35,
    maxDensityPerAcre: null,
    maxFAR: 1.0,
    permittedByRight: [
      'Retail shops and personal services',
      'Restaurant / café (no drive-through)',
      'Professional office',
      'Medical and dental clinic',
      'Child care center',
    ],
    conditionalUses: [
      'Drive-through facility',
      'Gas station / convenience store',
      'Financial services',
    ],
    prohibited: [
      'Heavy industrial',
      'Auto sales and service',
      'Outdoor storage',
      'Residential (standalone)',
    ],
  },
  {
    code: 'B-2',
    name: 'Community Business District',
    category: 'commercial',
    summary: 'Community-scale commercial corridor uses. Supports shopping centers, auto-oriented uses, and larger retail.',
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
      'Entertainment and recreation',
    ],
    conditionalUses: [
      'Gas station',
      'Auto sales and rental',
      'Outdoor commercial recreation',
    ],
    prohibited: [
      'Heavy manufacturing',
      'Outdoor storage (primary use)',
      'Residential (standalone)',
    ],
  },

  // ── Industrial ────────────────────────────────────────────────────────────
  {
    code: 'LI',
    name: 'Light Industrial District',
    category: 'industrial',
    summary: 'Light industrial, warehouse, and business park uses with minimal nuisance impacts.',
    minLotSqft: 20000,
    maxHeightFt: 50,
    maxDensityPerAcre: null,
    maxFAR: 1.0,
    permittedByRight: [
      'Light manufacturing and assembly',
      'Warehouse and distribution',
      'Research and development',
      'Business park and office',
      'Data center',
      'Utility facility',
    ],
    conditionalUses: [
      'Truck terminal',
      'Recycling facility',
      'Outdoor storage (screened)',
    ],
    prohibited: [
      'Residential uses',
      'Heavy manufacturing',
      'Hazardous material handling',
      'Schools and child care',
    ],
  },
  {
    code: 'I',
    name: 'Industrial District',
    category: 'industrial',
    summary: 'General industrial uses including manufacturing, warehousing, and industrial services.',
    minLotSqft: 20000,
    maxHeightFt: 65,
    maxDensityPerAcre: null,
    maxFAR: 1.0,
    permittedByRight: [
      'Manufacturing and processing',
      'Warehouse and distribution',
      'Truck terminal and freight',
      'Contractor and trades yard',
      'Outdoor storage (screened)',
      'Utility and public facilities',
    ],
    conditionalUses: [
      'Asphalt / concrete plant',
      'Salvage and recycling',
      'Hazardous material handling (with permit)',
    ],
    prohibited: [
      'Residential uses',
      'Retail (standalone)',
      'Schools and child care',
      'Hospital',
    ],
  },

  // ── Open Space / PUD ──────────────────────────────────────────────────────
  {
    code: 'OS',
    name: 'Open Space District',
    category: 'open-space',
    summary: 'Public and private open space, parks, natural areas, and conservation lands.',
    minLotSqft: 0,
    maxHeightFt: 25,
    maxDensityPerAcre: null,
    maxFAR: 0,
    permittedByRight: [
      'Public park and recreation area',
      'Trail and greenway',
      'Natural area and habitat',
      'Community garden',
      'Stormwater and drainage facility',
    ],
    conditionalUses: [
      'Golf course',
      'Athletic complex',
      'Recreation center (building)',
      'Equestrian facility',
    ],
    prohibited: [
      'Residential development',
      'Commercial and retail',
      'Industrial uses',
    ],
  },
  {
    code: 'PUD',
    name: 'Planned Unit Development',
    category: 'mixed-use',
    summary: 'Flexible planned development district negotiated between developer and county. Uses, densities, and standards set by approved PUD plan.',
    minLotSqft: 0,
    maxHeightFt: 0,
    maxDensityPerAcre: null,
    maxFAR: 0,
    permittedByRight: [
      'Per approved PUD plan',
    ],
    conditionalUses: [],
    prohibited: [],
    notes: 'All development standards are established by the approved PUD document. Consult Douglas County Planning for specific PUD regulations.',
  },
];

const DOUGLAS_ZONE_MAP = new Map(DOUGLAS_ZONES.map(z => [z.code, z]));

export function getDouglasZoneDistrict(zoneType: string): DouglasZoneDistrict | null {
  return DOUGLAS_ZONE_MAP.get(zoneType.trim().toUpperCase()) ?? null;
}

export const DOUGLAS_CATEGORY_LABELS: Record<DouglasZoneDistrict['category'], string> = {
  'residential':  'Residential',
  'mixed-use':    'Mixed-Use / PUD',
  'commercial':   'Commercial / Business',
  'industrial':   'Industrial',
  'agricultural': 'Agricultural',
  'open-space':   'Parks & Open Space',
  'overlay':      'Overlay Zone',
};
