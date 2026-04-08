/**
 * Larimer County Zoning Districts
 *
 * Based on the Larimer County Land Use Code.
 * Code values match the field returned by the Larimer County
 * GIS MapServer (maps1.larimer.org/arcgis/rest/services/MapServices/LC_Zoning/MapServer/0).
 *
 * Source: Larimer County Planning
 * https://www.larimer.org/planning/zoning
 */

export interface LarimerZoneDistrict {
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

const LARIMER_ZONES: LarimerZoneDistrict[] = [
  // ── Agricultural ──────────────────────────────────────────────────────────
  {
    code: 'FA-1',
    name: 'Farming District',
    category: 'agricultural',
    summary: 'Primary farming and agricultural district. Preserves agricultural land on the plains and transition areas of Larimer County.',
    minLotSqft: 8712000, // 200 acres
    maxHeightFt: 35,
    maxDensityPerAcre: 0.005,
    maxFAR: 0,
    permittedByRight: [
      'Farming and crop production',
      'Livestock and grazing',
      'Agricultural support facilities',
      'Single-family home (accessory to farm)',
    ],
    conditionalUses: [
      'Agricultural processing',
      'Farm worker housing',
      'Agricultural tourism',
    ],
    prohibited: [
      'Non-agricultural residential subdivision',
      'Commercial retail',
      'Industrial uses',
    ],
  },
  {
    code: 'O-Open',
    name: 'Open District',
    category: 'agricultural',
    summary: 'Very large rural lots (35 acres minimum). Protects open space and rural character in foothill and plains areas.',
    minLotSqft: 1524600, // 35 acres
    maxHeightFt: 35,
    maxDensityPerAcre: 0.03,
    maxFAR: 0,
    permittedByRight: [
      'Single-family detached home',
      'Farming and agriculture',
      'Livestock and grazing',
      'Accessory structures',
    ],
    conditionalUses: [
      'Bed & breakfast',
      'Riding stable',
    ],
    prohibited: [
      'Multi-family residential',
      'Commercial retail',
      'Industrial uses',
    ],
  },
  {
    code: 'RE',
    name: 'Rural Estate District',
    category: 'residential',
    summary: 'Large rural residential lots of 2+ acres. Typical in unincorporated rural areas surrounding Fort Collins, Loveland, and Estes Park.',
    minLotSqft: 87120, // 2 acres
    maxHeightFt: 35,
    maxDensityPerAcre: 0.5,
    maxFAR: 0,
    permittedByRight: [
      'Single-family detached home',
      'Agriculture and hobby farming',
      'Home occupation (minor)',
      'Accessory structures',
    ],
    conditionalUses: [
      'Bed & breakfast',
      'Group home',
      'Religious institution',
    ],
    prohibited: [
      'Multi-family residential',
      'Commercial retail',
      'Industrial uses',
    ],
  },

  // ── Residential ───────────────────────────────────────────────────────────
  {
    code: 'R',
    name: 'Residential District',
    category: 'residential',
    summary: 'Standard single-family residential district for unincorporated suburban areas near Fort Collins, Loveland, and Berthoud.',
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
      'Duplex (on corner lots)',
      'Group home (≤8 residents)',
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
    code: 'RM',
    name: 'Residential Manufactured Home District',
    category: 'residential',
    summary: 'Allows manufactured / mobile homes and site-built single-family on appropriately sized lots.',
    minLotSqft: 5000,
    maxHeightFt: 35,
    maxDensityPerAcre: 6,
    maxFAR: 0,
    permittedByRight: [
      'Single-family detached home',
      'Manufactured / mobile home',
      'Home occupation',
      'Accessory structures',
    ],
    conditionalUses: [
      'Duplex',
      'Mobile home park',
    ],
    prohibited: [
      'Apartment buildings',
      'Commercial retail',
      'Industrial uses',
    ],
  },

  // ── Commercial / Business ─────────────────────────────────────────────────
  {
    code: 'C',
    name: 'Commercial District',
    category: 'commercial',
    summary: 'General commercial district along arterial corridors in unincorporated Larimer County.',
    minLotSqft: 10000,
    maxHeightFt: 50,
    maxDensityPerAcre: null,
    maxFAR: 1.5,
    permittedByRight: [
      'Retail and shopping centers',
      'Restaurant and food service',
      'Auto service and repair',
      'Office and professional services',
      'Hotel and motel',
      'Drive-through facilities',
    ],
    conditionalUses: [
      'Gas station',
      'Auto sales and rental',
      'Outdoor commercial recreation',
    ],
    prohibited: [
      'Heavy manufacturing',
      'Residential (standalone)',
      'Outdoor storage (primary)',
    ],
  },
  {
    code: 'T',
    name: 'Tourist District',
    category: 'commercial',
    summary: 'Tourist-oriented commercial uses near Estes Park, mountain communities, and recreational areas.',
    minLotSqft: 10000,
    maxHeightFt: 45,
    maxDensityPerAcre: null,
    maxFAR: 1.5,
    permittedByRight: [
      'Hotel and motel',
      'Bed & breakfast',
      'Restaurant and food service',
      'Retail (tourist-serving)',
      'Outdoor recreation facility',
      'Gas station',
    ],
    conditionalUses: [
      'Campground and RV park',
      'Amusement and recreation facility',
      'Mixed-use (residential above commercial)',
    ],
    prohibited: [
      'Heavy industrial',
      'Residential subdivision (standalone)',
      'Outdoor storage (primary)',
    ],
    notes: 'Especially common in unincorporated areas near Estes Park and along US 34/36 corridors.',
  },

  // ── Industrial ────────────────────────────────────────────────────────────
  {
    code: 'I',
    name: 'Industrial District',
    category: 'industrial',
    summary: 'Light to general industrial uses in unincorporated Larimer County employment centers.',
    minLotSqft: 20000,
    maxHeightFt: 55,
    maxDensityPerAcre: null,
    maxFAR: 1.0,
    permittedByRight: [
      'Manufacturing and assembly',
      'Warehouse and distribution',
      'Research and development',
      'Contractor yard',
      'Utility facility',
    ],
    conditionalUses: [
      'Truck terminal',
      'Outdoor storage (screened)',
      'Salvage and recycling',
    ],
    prohibited: [
      'Residential uses',
      'Retail (standalone)',
      'Schools and child care',
    ],
  },

  // ── Open Space / Overlay ──────────────────────────────────────────────────
  {
    code: 'AP',
    name: 'Airport Overlay Zone',
    category: 'overlay',
    summary: 'Airport compatibility overlay near Fort Collins–Loveland Municipal Airport. Restricts building heights and high-occupancy uses in approach paths.',
    minLotSqft: 0,
    maxHeightFt: 0,
    maxDensityPerAcre: null,
    maxFAR: 0,
    permittedByRight: [
      'Per underlying base zone',
      'Low-intensity agricultural uses',
      'Surface parking',
    ],
    conditionalUses: [],
    prohibited: [
      'Structures exceeding FAA height limits',
      'Schools and hospitals in approach zones',
      'Large public assembly in primary approach',
    ],
    notes: 'Height limits vary by distance and location relative to runway ends. Consult Larimer County Planning and FAA Part 77.',
  },
  {
    code: 'FP',
    name: 'Floodplain Overlay',
    category: 'overlay',
    summary: 'FEMA-regulated floodplain overlay restricting development in 100-year flood areas throughout Larimer County.',
    minLotSqft: 0,
    maxHeightFt: 0,
    maxDensityPerAcre: null,
    maxFAR: 0,
    permittedByRight: [
      'Agriculture',
      'Parks and recreation (non-structural)',
      'Trails',
    ],
    conditionalUses: [
      'Infrastructure with floodplain study',
    ],
    prohibited: [
      'New residential construction in floodway',
      'Basement construction in flood fringe',
    ],
    notes: 'Subject to FEMA NFIP regulations and Larimer County Floodplain Regulations.',
  },
];

const LARIMER_ZONE_MAP = new Map(LARIMER_ZONES.map(z => [z.code, z]));

export function getLarimerZoneDistrict(zoneCode: string): LarimerZoneDistrict | null {
  return LARIMER_ZONE_MAP.get(zoneCode.trim()) ?? null;
}

export const LARIMER_CATEGORY_LABELS: Record<LarimerZoneDistrict['category'], string> = {
  'residential':  'Residential',
  'mixed-use':    'Mixed-Use',
  'commercial':   'Commercial / Tourist',
  'industrial':   'Industrial',
  'agricultural': 'Agricultural',
  'open-space':   'Parks & Open Space',
  'overlay':      'Overlay Zone',
};
