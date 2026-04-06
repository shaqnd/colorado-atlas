/**
 * Centennial Land Use Designations
 *
 * Based on the City of Centennial Current Land Use map and
 * the Centennial Municipal Code / Comprehensive Plan.
 * Code values match the Land_Use field from the Current_Land_Use
 * FeatureServer (maps.centennialco.gov).
 *
 * Source: City of Centennial Community Development
 * https://www.centennialco.gov/Maps/Centennial-Maps/Zoning-Map
 */

export interface CentennialLandUseDistrict {
  code: string;
  name: string;
  category:
    | 'residential'
    | 'commercial'
    | 'industrial'
    | 'office'
    | 'institutional'
    | 'open-space'
    | 'mixed-use'
    | 'vacant';
  summary: string;
  minLotSqft: number;
  maxHeightFt: number;
  maxDensityPerAcre: number | null;
  permittedByRight: string[];
  conditionalUses: string[];
  prohibited: string[];
  notes?: string;
}

const CENTENNIAL_DISTRICTS: CentennialLandUseDistrict[] = [
  // ── Residential ────────────────────────────────────────────────────────────
  {
    code: 'RES_SFD',
    name: 'Single-Family Detached Residential',
    category: 'residential',
    summary: 'Low-density single-family detached homes on individual lots. The predominant land use in Centennial.',
    minLotSqft: 6000,
    maxHeightFt: 35,
    maxDensityPerAcre: 4,
    permittedByRight: [
      'Single-family detached home',
      'Home occupation (minor)',
      'Accessory dwelling unit (ADU)',
      'Accessory structures (garage, shed)',
      'Parks and trails',
    ],
    conditionalUses: [
      'Group home (≤8 residents)',
      'Religious institution',
      'School',
      'Child care (family home)',
    ],
    prohibited: [
      'Multi-family residential',
      'Commercial uses',
      'Industrial uses',
      'Mobile home parks',
    ],
    notes: 'ADUs allowed per Arapahoe County/Centennial regulations and state statute HB21-1271.',
  },
  {
    code: 'RES_SFA',
    name: 'Single-Family Attached Residential',
    category: 'residential',
    summary: 'Attached single-family housing including townhomes, rowhouses, and duplexes. Allows for slightly higher density in targeted areas.',
    minLotSqft: 2500,
    maxHeightFt: 40,
    maxDensityPerAcre: 8,
    permittedByRight: [
      'Townhome / rowhouse',
      'Duplex',
      'Single-family attached',
      'Home occupation',
      'Parks and open space',
    ],
    conditionalUses: [
      'Small-scale multifamily (≤4 units)',
      'Group home',
      'Child care center',
      'Religious institution',
    ],
    prohibited: [
      'Large apartment buildings (5+ units standalone)',
      'Commercial and retail',
      'Industrial uses',
    ],
  },
  {
    code: 'RES_MU_RES',
    name: 'Mixed-Use Residential (Urban Center)',
    category: 'mixed-use',
    summary: 'Higher-density residential with ground-floor retail or live-work opportunities in Centennial\'s urban center nodes.',
    minLotSqft: 2000,
    maxHeightFt: 55,
    maxDensityPerAcre: null,
    permittedByRight: [
      'Multifamily residential',
      'Townhome and rowhouse',
      'Ground-floor retail (small-scale)',
      'Live-work unit',
      'Professional office',
      'Restaurant / café',
    ],
    conditionalUses: [
      'Hotel (boutique)',
      'Fitness and recreation center',
      'Child care center',
      'Drive-through (with design review)',
    ],
    prohibited: [
      'Heavy industrial',
      'Auto-oriented big-box retail',
      'Outdoor storage',
    ],
    notes: 'Located in urban center nodes per the Centennial Comprehensive Plan.',
  },

  // ── Commercial ─────────────────────────────────────────────────────────────
  {
    code: 'COM_RETAIL',
    name: 'Commercial Retail',
    category: 'commercial',
    summary: 'Retail, restaurant, and consumer service uses along major arterials and commercial corridors.',
    minLotSqft: 5000,
    maxHeightFt: 45,
    maxDensityPerAcre: null,
    permittedByRight: [
      'Retail store and shop',
      'Restaurant and food service',
      'Personal service (salon, dry cleaner, etc.)',
      'Bank and financial service',
      'Auto service (minor)',
      'Gas station / convenience store',
    ],
    conditionalUses: [
      'Drive-through facility',
      'Auto sales and rental',
      'Hotel and motel',
      'Entertainment and recreation venue',
      'Grocery / supermarket',
    ],
    prohibited: [
      'Heavy industrial and manufacturing',
      'Residential (standalone)',
      'Outdoor storage (primary use)',
      'Salvage / junkyard',
    ],
  },
  {
    code: 'COM_MU',
    name: 'Commercial Mixed Use',
    category: 'commercial',
    summary: 'A blend of commercial, office, and residential uses in walkable mixed-use nodes and corridors.',
    minLotSqft: 3000,
    maxHeightFt: 55,
    maxDensityPerAcre: null,
    permittedByRight: [
      'Retail and restaurant',
      'Professional and medical office',
      'Multifamily residential (upper floors)',
      'Hotel and extended-stay',
      'Health and fitness center',
      'Live-work unit',
    ],
    conditionalUses: [
      'Drive-through (with design review)',
      'Entertainment venue',
      'Child care center',
      'Religious institution',
    ],
    prohibited: [
      'Heavy industrial',
      'Auto salvage',
      'Outdoor storage',
    ],
  },

  // ── Office ─────────────────────────────────────────────────────────────────
  {
    code: 'OFFICE_MED',
    name: 'Medium Office / Employment Center',
    category: 'office',
    summary: 'Mid-sized office, medical, and professional employment uses. Supports corporate campuses and medical facilities.',
    minLotSqft: 5000,
    maxHeightFt: 65,
    maxDensityPerAcre: null,
    permittedByRight: [
      'General and professional office',
      'Medical office and clinic',
      'Research and development',
      'Financial services',
      'Conference and training center',
    ],
    conditionalUses: [
      'Hotel (business)',
      'Retail (accessory, <20% GFA)',
      'Child care center (accessory)',
      'Fitness center (accessory)',
      'Parking structure',
    ],
    prohibited: [
      'Heavy industrial',
      'Residential (standalone)',
      'Auto salvage / junkyard',
    ],
  },
  {
    code: 'OFF_LOW',
    name: 'Low-Intensity Office / Employment Center',
    category: 'office',
    summary: 'Small-scale professional offices, often as a transition between residential neighborhoods and more intense commercial areas.',
    minLotSqft: 3500,
    maxHeightFt: 40,
    maxDensityPerAcre: null,
    permittedByRight: [
      'Professional office (small-scale)',
      'Medical / dental office',
      'Studio and design services',
      'Financial and insurance services',
    ],
    conditionalUses: [
      'Child care center',
      'Religious institution',
      'Live-work unit',
    ],
    prohibited: [
      'Retail (primary use)',
      'Industrial',
      'Drive-through',
      'Residential (standalone)',
    ],
    notes: 'Typically located along collector roads bordering residential areas.',
  },

  // ── Industrial ─────────────────────────────────────────────────────────────
  {
    code: 'IND_LIGHT',
    name: 'Light Industrial / Employment Center',
    category: 'industrial',
    summary: 'Clean light industrial, flex, and business park uses. Supports employment with limited impact on adjacent areas.',
    minLotSqft: 10000,
    maxHeightFt: 50,
    maxDensityPerAcre: null,
    permittedByRight: [
      'Light manufacturing and assembly',
      'Warehouse and distribution (light)',
      'Research and development / tech',
      'Flex / business park space',
      'Contractor and trade services',
      'Auto repair and service',
    ],
    conditionalUses: [
      'Outdoor storage (screened)',
      'Wholesale and building materials',
      'Retail (accessory, <20% GFA)',
      'Truck terminal (small)',
    ],
    prohibited: [
      'Heavy manufacturing / smelting',
      'Residential',
      'Schools and child care',
      'Hospital',
      'Auto salvage / junkyard',
    ],
    notes: 'No significant noise, odor, or hazardous material operations permitted without special use approval.',
  },

  // ── Institutional ──────────────────────────────────────────────────────────
  {
    code: 'INS_CIVIC',
    name: 'Institutional / Civic',
    category: 'institutional',
    summary: 'Public and quasi-public civic facilities including government buildings, community centers, libraries, and places of worship.',
    minLotSqft: 5000,
    maxHeightFt: 50,
    maxDensityPerAcre: null,
    permittedByRight: [
      'Government office and civic facility',
      'Library and community center',
      'Religious institution / place of worship',
      'Museum and cultural facility',
      'Utility and public service facility',
    ],
    conditionalUses: [
      'Hospital and medical campus',
      'Cemetery',
      'Special events venue',
      'Homeless shelter / transitional housing',
    ],
    prohibited: [
      'Commercial retail (primary use)',
      'Industrial',
      'Residential (standalone)',
    ],
  },
  {
    code: 'INS_SCHOOL',
    name: 'Institutional / School',
    category: 'institutional',
    summary: 'Public and private educational facilities from pre-K through higher education.',
    minLotSqft: 20000,
    maxHeightFt: 50,
    maxDensityPerAcre: null,
    permittedByRight: [
      'Public and private K–12 school',
      'Charter school',
      'College and university campus',
      'Child care and pre-school',
      'Athletic fields and facilities',
    ],
    conditionalUses: [
      'Community use of facilities after hours',
      'Child care center (joint use)',
      'Group home (on-campus)',
    ],
    prohibited: [
      'Commercial retail (primary use)',
      'Industrial',
      'Residential (standalone)',
    ],
  },

  // ── Open Space ─────────────────────────────────────────────────────────────
  {
    code: 'OPEN SPACE',
    name: 'Parks and Open Space',
    category: 'open-space',
    summary: 'Public parks, trails, natural areas, and recreational open space. One of Centennial\'s defining characteristics.',
    minLotSqft: 0,
    maxHeightFt: 25,
    maxDensityPerAcre: null,
    permittedByRight: [
      'Public park and recreation',
      'Trail and greenway',
      'Community garden',
      'Natural area and wildlife habitat',
      'Picnic shelter and restroom facilities',
      'Dog park',
    ],
    conditionalUses: [
      'Recreational sports complex',
      'Golf course',
      'Special event venue (temporary)',
      'Recreation / community center (building)',
    ],
    prohibited: [
      'Residential',
      'Commercial and retail',
      'Industrial',
    ],
    notes: 'Centennial maintains one of the most extensive trail systems in the Denver metro area.',
  },

  // ── Vacant ─────────────────────────────────────────────────────────────────
  {
    code: 'VACANT',
    name: 'Vacant / Undeveloped Land',
    category: 'vacant',
    summary: 'Undeveloped land without a defined current use. Future development determined by the Comprehensive Plan land use designation.',
    minLotSqft: 0,
    maxHeightFt: 0,
    maxDensityPerAcre: null,
    permittedByRight: [
      'Agriculture (interim)',
      'Surface parking (interim)',
    ],
    conditionalUses: [],
    prohibited: [],
    notes: 'Refer to the Centennial Comprehensive Plan for future land use designations and development potential.',
  },
];

const CENTENNIAL_ZONE_MAP = new Map(CENTENNIAL_DISTRICTS.map(d => [d.code, d]));

export function getCentennialLandUseDistrict(code: string): CentennialLandUseDistrict | null {
  return CENTENNIAL_ZONE_MAP.get(code.trim().toUpperCase()) ?? CENTENNIAL_ZONE_MAP.get(code.trim()) ?? null;
}

export const CENTENNIAL_CATEGORY_LABELS: Record<CentennialLandUseDistrict['category'], string> = {
  'residential':   'Residential',
  'commercial':    'Commercial',
  'industrial':    'Industrial',
  'office':        'Office / Employment',
  'institutional': 'Institutional / Civic',
  'open-space':    'Parks & Open Space',
  'mixed-use':     'Mixed-Use',
  'vacant':        'Vacant / Undeveloped',
};
