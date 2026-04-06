/**
 * Aurora Zoning Code — Zone District Rules
 *
 * Based on the City of Aurora Zoning Ordinance (Title 146).
 * District IDs match the DISTRICT_ID field returned by the Aurora
 * OpenData MapServer (layer 20).
 *
 * Source: City of Aurora Community Development Department
 * https://www.auroragov.org/city_hall/maps/planning_and_zoning_maps
 */

export interface AuroraZoneDistrict {
  code: string;
  name: string;
  category:
    | 'residential'
    | 'mixed-use'
    | 'commercial'
    | 'industrial'
    | 'open-space'
    | 'airport'
    | 'overlay';
  summary: string;
  minLotSqft: number;
  maxHeightFt: number;
  maxDensityPerAcre: number | null;   // null = no explicit limit
  maxFAR: number;                     // 0 = not explicitly limited
  permittedByRight: string[];
  conditionalUses: string[];
  prohibited: string[];
  notes?: string;
}

const AURORA_ZONES: AuroraZoneDistrict[] = [
  // ── Residential ────────────────────────────────────────────────────────────
  {
    code: 'R-R',
    name: 'Rural Residential District',
    category: 'residential',
    summary: 'Very low-density rural residential uses on large lots. Preserves agricultural character on the urban fringe.',
    minLotSqft: 108900,   // 2.5 acres
    maxHeightFt: 35,
    maxDensityPerAcre: 0.4,
    maxFAR: 0,
    permittedByRight: [
      'Single-family detached home',
      'Agriculture and farming',
      'Home occupation (minor)',
      'Parks and open space',
      'Accessory structures',
    ],
    conditionalUses: [
      'Bed & breakfast',
      'Boarding/kennel facilities',
      'Religious institution',
      'School',
    ],
    prohibited: [
      'Multi-family residential',
      'Commercial uses',
      'Industrial uses',
      'Mobile home parks',
    ],
  },
  {
    code: 'R-1',
    name: 'Low-Density Single-Family Residential District',
    category: 'residential',
    summary: 'Traditional single-family neighborhoods. The most common residential district in Aurora.',
    minLotSqft: 6000,
    maxHeightFt: 35,
    maxDensityPerAcre: 2,
    maxFAR: 0,
    permittedByRight: [
      'Single-family detached home',
      'Parks, playgrounds, and open space',
      'Home occupation (minor)',
      'Accessory dwelling unit (ADU)',
      'Accessory structures',
    ],
    conditionalUses: [
      'Duplex (on corner lots)',
      'Group home (≤8 residents)',
      'Religious institution',
      'Elementary/middle school',
      'Child care center',
    ],
    prohibited: [
      'Apartments and multi-family (3+ units)',
      'Commercial and retail uses',
      'Industrial uses',
      'Mobile home parks',
    ],
    notes: 'Minimum lot width typically 60 ft. ADUs allowed per state statute HB21-1271.',
  },
  {
    code: 'R-2',
    name: 'Medium-Density Residential District',
    category: 'residential',
    summary: 'Allows single-family and limited multi-family housing. Bridges R-1 neighborhoods and higher-density areas.',
    minLotSqft: 3500,
    maxHeightFt: 35,
    maxDensityPerAcre: 8,
    maxFAR: 0,
    permittedByRight: [
      'Single-family detached home',
      'Duplex',
      'Townhome / rowhouse',
      'Parks and open space',
      'Home occupation',
      'Accessory dwelling unit (ADU)',
    ],
    conditionalUses: [
      'Triplex / fourplex',
      'Group home (≤8 residents)',
      'Religious institution',
      'School',
      'Child care center',
    ],
    prohibited: [
      'Apartments (5+ units standalone)',
      'Commercial retail and service',
      'Industrial and warehouse',
    ],
  },
  {
    code: 'R-3',
    name: 'Medium-Density Multifamily Residential District',
    category: 'residential',
    summary: 'Medium-density multifamily housing. Suitable for apartment buildings, condos, and townhome communities.',
    minLotSqft: 2500,
    maxHeightFt: 45,
    maxDensityPerAcre: 20,
    maxFAR: 1.0,
    permittedByRight: [
      'Apartment building',
      'Condominium building',
      'Townhome / rowhouse',
      'Single-family detached home',
      'Duplex and fourplex',
      'Senior housing',
      'Parks and open space',
    ],
    conditionalUses: [
      'Group home / residential care facility',
      'Religious institution',
      'Child care center',
      'Live-work units',
    ],
    prohibited: [
      'Commercial retail',
      'Industrial uses',
      'Drive-through facilities',
    ],
  },
  {
    code: 'R-4',
    name: 'High-Density Residential District',
    category: 'residential',
    summary: 'High-density multifamily residential. Supports dense urban housing near transit and commercial corridors.',
    minLotSqft: 2000,
    maxHeightFt: 75,
    maxDensityPerAcre: null,
    maxFAR: 2.0,
    permittedByRight: [
      'High-rise apartment / condominium',
      'Mid-rise apartment',
      'Senior / assisted living facility',
      'Townhomes and rowhouses',
      'Mixed-use residential (ground-floor residential allowed)',
      'Parks and open space',
    ],
    conditionalUses: [
      'Residential care facility',
      'Hotel / extended-stay',
      'Child care center',
      'Retail (ground floor only)',
    ],
    prohibited: [
      'Single-family detached (on lots >1 acre)',
      'Heavy commercial / industrial',
      'Drive-through facilities',
    ],
  },

  // ── Mixed-Use ──────────────────────────────────────────────────────────────
  {
    code: 'MU-N',
    name: 'Mixed-Use Neighborhood District',
    category: 'mixed-use',
    summary: 'Neighborhood-scale mixed use. Allows small retail, offices, and residential in walkable neighborhood centers.',
    minLotSqft: 2500,
    maxHeightFt: 45,
    maxDensityPerAcre: null,
    maxFAR: 1.5,
    permittedByRight: [
      'Neighborhood retail and shops',
      'Restaurant / café (no drive-through)',
      'Personal service (salon, dry cleaner, etc.)',
      'Professional office',
      'Multifamily residential',
      'Live-work unit',
      'Child care center',
      'Parks and plazas',
    ],
    conditionalUses: [
      'Drive-through facility',
      'Grocery / supermarket',
      'Fitness and recreation center',
      'Religious institution',
      'Hotel (boutique)',
    ],
    prohibited: [
      'Heavy commercial and industrial',
      'Auto-oriented strip retail',
      'Warehousing and distribution',
    ],
  },
  {
    code: 'MU-C',
    name: 'Mixed-Use Corridor District',
    category: 'mixed-use',
    summary: 'Designed for arterial corridors. Enables a mix of retail, office, and residential along major streets.',
    minLotSqft: 3000,
    maxHeightFt: 65,
    maxDensityPerAcre: null,
    maxFAR: 2.5,
    permittedByRight: [
      'Retail and commercial',
      'Restaurant and food service',
      'Professional and medical office',
      'Hotel and motel',
      'Multifamily residential',
      'Live-work unit',
      'Health and fitness center',
      'Auto service (minor)',
    ],
    conditionalUses: [
      'Drive-through facility',
      'Gas station / convenience store',
      'Auto sales and rental',
      'Entertainment venue',
      'Grocery / supermarket',
    ],
    prohibited: [
      'Heavy industrial and manufacturing',
      'Warehousing and distribution',
      'Outdoor storage',
    ],
  },
  {
    code: 'MU-R',
    name: 'Mixed-Use Regional District',
    category: 'mixed-use',
    summary: 'Regional-scale mixed use for major activity centers. Allows large-format retail, entertainment, office, and dense residential.',
    minLotSqft: 5000,
    maxHeightFt: 120,
    maxDensityPerAcre: null,
    maxFAR: 4.0,
    permittedByRight: [
      'Large-format / big-box retail',
      'Regional shopping center',
      'Restaurant and entertainment',
      'Hotel and conference center',
      'Office and corporate campus',
      'High-density multifamily residential',
      'Structured parking',
    ],
    conditionalUses: [
      'Drive-through facility',
      'Cinema and performance venue',
      'Auto dealership',
      'Hospital / medical campus',
    ],
    prohibited: [
      'Heavy industrial',
      'Outdoor storage',
      'Single-family residential',
    ],
  },
  {
    code: 'MU-OI',
    name: 'Mixed-Use Office/Institutional District',
    category: 'mixed-use',
    summary: 'Office and institutional uses with supporting commercial and residential. Common near medical campuses and universities.',
    minLotSqft: 5000,
    maxHeightFt: 100,
    maxDensityPerAcre: null,
    maxFAR: 3.0,
    permittedByRight: [
      'Office (general and professional)',
      'Medical office and clinic',
      'Hospital and healthcare facility',
      'Research and development',
      'Higher education / university campus',
      'Conference and training center',
      'Multifamily residential',
      'Hotel (limited-service)',
    ],
    conditionalUses: [
      'Retail (accessory to primary office use)',
      'Child care center',
      'Fitness and recreation',
      'Parking structure',
    ],
    prohibited: [
      'Heavy industrial',
      'Retail as primary use',
      'Single-family residential',
    ],
  },
  {
    code: 'OA-MS',
    name: 'Original Aurora Main Street District',
    category: 'mixed-use',
    summary: 'Walkable, pedestrian-oriented main street district in historic Original Aurora. Encourages ground-floor retail with upper-floor residential.',
    minLotSqft: 2000,
    maxHeightFt: 55,
    maxDensityPerAcre: null,
    maxFAR: 2.0,
    permittedByRight: [
      'Ground-floor retail and restaurant',
      'Upper-floor residential',
      'Professional office',
      'Art studio / gallery',
      'Live-work unit',
      'Boutique hotel',
      'Cultural and civic uses',
    ],
    conditionalUses: [
      'Nightclub / bar',
      'Auto service (minor)',
      'Religious institution',
      'Drive-through (with design review)',
    ],
    prohibited: [
      'Drive-through as primary use',
      'Heavy industrial',
      'Auto sales and storage',
      'Single-story big-box retail',
    ],
    notes: 'Subject to Original Aurora design standards and historic context guidelines.',
  },

  // ── Industrial / Commercial ────────────────────────────────────────────────
  {
    code: 'I-1',
    name: 'Business/Tech District',
    category: 'commercial',
    summary: 'Clean business, technology, and light industrial uses. Suitable for research parks, tech campuses, and business centers.',
    minLotSqft: 10000,
    maxHeightFt: 60,
    maxDensityPerAcre: null,
    maxFAR: 1.5,
    permittedByRight: [
      'Office and professional services',
      'Research and development',
      'Light manufacturing (clean)',
      'Tech campus and business park',
      'Distribution and fulfillment (light)',
      'Data center',
      'Brewery / food production (small-scale)',
    ],
    conditionalUses: [
      'Hotel (business class)',
      'Retail (accessory, <20% GFA)',
      'Fitness center (accessory)',
      'Child care center (accessory)',
    ],
    prohibited: [
      'Heavy manufacturing / smelting',
      'Auto salvage / junkyard',
      'Residential (except caretaker unit)',
      'Outdoor storage (primary use)',
    ],
  },
  {
    code: 'I-2',
    name: 'Industrial District',
    category: 'industrial',
    summary: 'General and heavy industrial uses. Allows manufacturing, warehousing, and industrial services.',
    minLotSqft: 10000,
    maxHeightFt: 55,
    maxDensityPerAcre: null,
    maxFAR: 1.0,
    permittedByRight: [
      'Manufacturing and assembly',
      'Warehouse and distribution',
      'Truck terminal and freight',
      'Auto repair and service',
      'Construction materials and supplies',
      'Utility facility',
      'Outdoor storage (screened)',
    ],
    conditionalUses: [
      'Hazardous material handling',
      'Salvage and recycling facility',
      'Concrete / asphalt plant',
    ],
    prohibited: [
      'Residential uses',
      'Retail (standalone)',
      'Schools and child care',
      'Hospital',
    ],
    notes: 'Uses with significant noise, vibration, or odor may require additional permits.',
  },

  // ── Open Space / Special ───────────────────────────────────────────────────
  {
    code: 'POS',
    name: 'Parks and Open Space District',
    category: 'open-space',
    summary: 'Public parks, trails, natural areas, and open space. Development is minimal and accessory to recreational use.',
    minLotSqft: 0,
    maxHeightFt: 25,
    maxDensityPerAcre: null,
    maxFAR: 0,
    permittedByRight: [
      'Public park and recreation',
      'Trail and greenway',
      'Community garden',
      'Natural area and wildlife habitat',
      'Picnic shelter and restroom facilities',
    ],
    conditionalUses: [
      'Golf course',
      'Athletic complex / stadium',
      'Recreation center (building)',
      'Special events venue',
    ],
    prohibited: [
      'Residential development',
      'Commercial and retail',
      'Industrial uses',
    ],
  },
  {
    code: 'AD',
    name: 'Airport District',
    category: 'airport',
    summary: 'Buckley Space Force Base and associated aviation uses. Development tightly controlled for military and aviation operations.',
    minLotSqft: 0,
    maxHeightFt: 0,
    maxDensityPerAcre: null,
    maxFAR: 0,
    permittedByRight: [
      'Aviation and military operations',
      'Aviation support facilities',
      'Airport-related commercial',
    ],
    conditionalUses: [],
    prohibited: [
      'Residential',
      'Schools and child care',
      'Large public assembly',
    ],
    notes: 'Subject to FAA height restrictions and military compatibility requirements.',
  },
  {
    code: 'APZ',
    name: 'Accident Potential Zone',
    category: 'overlay',
    summary: 'Accident Potential Zone overlay near Buckley Space Force Base. Strictly limits high-occupancy land uses to minimize risk.',
    minLotSqft: 0,
    maxHeightFt: 0,
    maxDensityPerAcre: null,
    maxFAR: 0,
    permittedByRight: [
      'Agriculture',
      'Low-intensity outdoor recreation',
      'Parking (surface)',
    ],
    conditionalUses: [],
    prohibited: [
      'Residential',
      'Schools and child care',
      'Hospital',
      'Large public assembly',
      'Dense commercial',
    ],
    notes: 'Uses restricted per Air Force Instruction 32-7063 and JLUS compatibility guidelines.',
  },
];

const AURORA_ZONE_MAP = new Map(AURORA_ZONES.map(z => [z.code, z]));

export function getAuroraZoneDistrict(districtId: string): AuroraZoneDistrict | null {
  return AURORA_ZONE_MAP.get(districtId.trim().toUpperCase()) ?? null;
}

export const AURORA_CATEGORY_LABELS: Record<AuroraZoneDistrict['category'], string> = {
  'residential': 'Residential',
  'mixed-use':   'Mixed-Use',
  'commercial':  'Commercial / Business',
  'industrial':  'Industrial',
  'open-space':  'Parks & Open Space',
  'airport':     'Airport / Military',
  'overlay':     'Overlay Zone',
};
