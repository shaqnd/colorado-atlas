/**
 * Clear Creek County Zoning Districts
 *
 * Based on the Clear Creek County Land Use Regulations.
 * Code values match the CURR_ZONE field returned by the Clear Creek County
 * GIS MapServer (gis.clearcreekcounty.us/arcgis2/rest/services/ClearCreek/Cadastral/MapServer/18).
 *
 * Source: Clear Creek County Community Development
 * https://www.co.clear-creek.co.us/230/Community-Development
 */

export interface ClearCreekZoneDistrict {
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

const CLEARCREEK_ZONES: ClearCreekZoneDistrict[] = [
  // ── Agricultural / Open ──────────────────────────────────────────────────
  {
    code: 'A-1',
    name: 'Agricultural District',
    category: 'agricultural',
    summary: 'Large-lot rural and agricultural district. Supports farming, ranching, and very low-density residential in Clear Creek County valleys.',
    minLotSqft: 1524600, // 35 acres
    maxHeightFt: 35,
    maxDensityPerAcre: 0.03,
    maxFAR: 0,
    permittedByRight: [
      'Single-family detached home',
      'Farming and ranching',
      'Forestry and timber',
      'Accessory structures',
      'Home occupation (minor)',
    ],
    conditionalUses: [
      'Bed & breakfast',
      'Riding stable',
      'Religious institution',
    ],
    prohibited: [
      'Multi-family residential',
      'Commercial retail',
      'Industrial uses',
      'Mobile home parks',
    ],
  },
  {
    code: 'F-1',
    name: 'Forestry District',
    category: 'open-space',
    summary: 'Forestry and resource management district covering heavily wooded mountain slopes and upper elevations.',
    minLotSqft: 4356000, // 100 acres
    maxHeightFt: 30,
    maxDensityPerAcre: 0.01,
    maxFAR: 0,
    permittedByRight: [
      'Forestry and timber harvesting',
      'Wildlife habitat management',
      'Single-family home on very large parcels',
    ],
    conditionalUses: [
      'Mining and mineral extraction',
      'Utility facility',
    ],
    prohibited: [
      'Residential subdivision',
      'Commercial and retail',
      'Industrial uses',
    ],
    notes: 'Subject to wildfire mitigation requirements and mountain development standards.',
  },
  {
    code: 'OS',
    name: 'Open Space District',
    category: 'open-space',
    summary: 'Protected open space and natural areas including Clear Creek Canyon, Mt. Evans corridor, and county parks.',
    minLotSqft: 0,
    maxHeightFt: 25,
    maxDensityPerAcre: null,
    maxFAR: 0,
    permittedByRight: [
      'Public park and recreation area',
      'Trail and greenway',
      'Natural area and wildlife habitat',
      'Conservation easement land',
    ],
    conditionalUses: [
      'Campground',
      'Outdoor recreation facility',
    ],
    prohibited: [
      'Residential development',
      'Commercial retail',
      'Industrial uses',
    ],
  },

  // ── Residential ───────────────────────────────────────────────────────────
  {
    code: 'R-1',
    name: 'Residential-One District',
    category: 'residential',
    summary: 'Single-family residential on large mountain lots. Common in Georgetown, Idaho Springs, and Empire town areas.',
    minLotSqft: 21780, // 0.5 acre
    maxHeightFt: 35,
    maxDensityPerAcre: 2,
    maxFAR: 0,
    permittedByRight: [
      'Single-family detached home',
      'Parks and open space',
      'Home occupation (minor)',
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
    notes: 'Mountain development standards apply. Wildfire mitigation required for new construction.',
  },
  {
    code: 'R-2',
    name: 'Residential-Two District',
    category: 'residential',
    summary: 'Medium-density residential allowing single-family and duplex uses on standard mountain lots.',
    minLotSqft: 10000,
    maxHeightFt: 35,
    maxDensityPerAcre: 4,
    maxFAR: 0,
    permittedByRight: [
      'Single-family detached home',
      'Duplex',
      'Home occupation',
      'Accessory structures',
    ],
    conditionalUses: [
      'Townhome / rowhouse',
      'Group home',
      'Religious institution',
    ],
    prohibited: [
      'Apartment buildings',
      'Commercial retail',
      'Industrial uses',
    ],
  },
  {
    code: 'R-3',
    name: 'Residential-Three District',
    category: 'residential',
    summary: 'Higher density residential within established mountain communities, allowing multi-family uses.',
    minLotSqft: 6000,
    maxHeightFt: 40,
    maxDensityPerAcre: 10,
    maxFAR: 0.75,
    permittedByRight: [
      'Single-family detached home',
      'Duplex and townhome',
      'Small apartment building',
      'Parks and open space',
    ],
    conditionalUses: [
      'Larger apartment complex',
      'Senior housing',
      'Residential care facility',
    ],
    prohibited: [
      'Commercial retail',
      'Industrial uses',
    ],
  },
  {
    code: 'MH',
    name: 'Mobile Home / Manufactured Housing District',
    category: 'residential',
    summary: 'Allows manufactured and mobile homes on individual lots in designated areas.',
    minLotSqft: 5000,
    maxHeightFt: 30,
    maxDensityPerAcre: 6,
    maxFAR: 0,
    permittedByRight: [
      'Manufactured / mobile home',
      'Single-family detached home',
      'Home occupation',
    ],
    conditionalUses: [
      'Mobile home park',
    ],
    prohibited: [
      'Commercial retail',
      'Industrial uses',
    ],
  },

  // ── Commercial ────────────────────────────────────────────────────────────
  {
    code: 'B-1',
    name: 'Neighborhood Business District',
    category: 'commercial',
    summary: 'Small-scale commercial serving mountain community residents and tourists. Common in Georgetown and Idaho Springs town cores.',
    minLotSqft: 3000,
    maxHeightFt: 35,
    maxDensityPerAcre: null,
    maxFAR: 1.0,
    permittedByRight: [
      'Retail shops and personal services',
      'Restaurant / café',
      'Professional office',
      'Gas station / convenience store',
      'Bed & breakfast',
      'Hotel (small)',
    ],
    conditionalUses: [
      'Drive-through facility',
      'Auto service (minor)',
      'Entertainment venue',
    ],
    prohibited: [
      'Heavy industrial',
      'Auto sales (large lot)',
      'Outdoor storage (primary)',
      'Residential (standalone)',
    ],
    notes: 'Historic design standards may apply in Georgetown and Idaho Springs historic districts.',
  },
  {
    code: 'B-2',
    name: 'General Business District',
    category: 'commercial',
    summary: 'Broader commercial along US-40 and I-70 corridors serving residents and mountain travelers.',
    minLotSqft: 10000,
    maxHeightFt: 45,
    maxDensityPerAcre: null,
    maxFAR: 1.5,
    permittedByRight: [
      'Retail and commercial services',
      'Restaurant and food service',
      'Hotel and motel',
      'Auto service and repair',
      'Drive-through facilities',
      'Office and professional services',
      'Outdoor recreation sales and rental',
    ],
    conditionalUses: [
      'Auto sales',
      'RV and campground',
      'Outdoor storage (screened)',
    ],
    prohibited: [
      'Heavy manufacturing',
      'Residential (standalone)',
    ],
  },

  // ── Industrial / Mining ───────────────────────────────────────────────────
  {
    code: 'I-1',
    name: 'Light Industrial District',
    category: 'industrial',
    summary: 'Light industrial uses compatible with mountain setting. Common near Idaho Springs and Empire.',
    minLotSqft: 20000,
    maxHeightFt: 50,
    maxDensityPerAcre: null,
    maxFAR: 1.0,
    permittedByRight: [
      'Light manufacturing and assembly',
      'Warehouse and storage',
      'Contractor yard and shop',
      'Utility facility',
    ],
    conditionalUses: [
      'Outdoor storage (screened)',
      'Recycling facility',
    ],
    prohibited: [
      'Residential uses',
      'Heavy manufacturing',
      'Schools and child care',
    ],
  },
  {
    code: 'M-1',
    name: 'Mining District',
    category: 'industrial',
    summary: 'Mineral extraction and mining uses consistent with Clear Creek County\'s historic and active mining economy.',
    minLotSqft: 217800, // 5 acres
    maxHeightFt: 50,
    maxDensityPerAcre: null,
    maxFAR: 0,
    permittedByRight: [
      'Mineral extraction and mining',
      'Mine support facilities',
      'Ore processing (small-scale)',
    ],
    conditionalUses: [
      'Large-scale processing',
      'Tailings and waste management',
    ],
    prohibited: [
      'Residential uses',
      'Schools and hospitals',
      'Retail (standalone)',
    ],
    notes: 'Subject to state DRMS mine permit requirements and Clear Creek County mining regulations.',
  },

  // ── Special / Overlay ──────────────────────────────────────────────────────
  {
    code: 'PUD',
    name: 'Planned Unit Development',
    category: 'mixed-use',
    summary: 'Flexible planned development district with site-specific uses and standards.',
    minLotSqft: 0,
    maxHeightFt: 0,
    maxDensityPerAcre: null,
    maxFAR: 0,
    permittedByRight: ['Per approved PUD plan'],
    conditionalUses: [],
    prohibited: [],
    notes: 'Consult Clear Creek County Community Development for specific PUD regulations.',
  },
];

const CLEARCREEK_ZONE_MAP = new Map(CLEARCREEK_ZONES.map(z => [z.code, z]));

export function getClearCreekZoneDistrict(currZone: string): ClearCreekZoneDistrict | null {
  return CLEARCREEK_ZONE_MAP.get(currZone.trim().toUpperCase()) ?? null;
}

export const CLEARCREEK_CATEGORY_LABELS: Record<ClearCreekZoneDistrict['category'], string> = {
  'residential':  'Residential',
  'mixed-use':    'Mixed-Use / PUD',
  'commercial':   'Commercial / Business',
  'industrial':   'Industrial / Mining',
  'agricultural': 'Agricultural',
  'open-space':   'Parks & Open Space',
  'overlay':      'Overlay Zone',
};
