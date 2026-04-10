/**
 * City of Grand Junction Zoning Code
 * Based on the Grand Junction Land Development Code.
 * Source: external22-gis.gjcity.org MapServer (layer 76, ZONE_PRIM field)
 * Note: Known API codes include RL-4, I-1, PD, R-R, B-1, B-2, C-1, C-2.
 */

export interface GrandJunctionZoneDistrict {
  code: string;
  name: string;
  category: 'residential' | 'mixed-use' | 'commercial' | 'industrial' | 'agricultural' | 'open-space' | 'overlay';
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

export type GrandJunctionZoneCategory = GrandJunctionZoneDistrict['category'];

const GRAND_JUNCTION_ZONES: GrandJunctionZoneDistrict[] = [
  // Rural / Agricultural
  {
    code: 'A',
    name: 'Agricultural',
    category: 'agricultural',
    summary: 'General agricultural district for farming, ranching, and rural uses on large parcels.',
    minLotSqft: 217800, // 5 acres
    maxHeightFt: 35,
    maxDensityPerAcre: 0.2,
    maxFAR: 0.05,
    permittedByRight: ['Crop farming', 'Ranch operations', 'Single-family home (1 per parcel)', 'Agricultural structures'],
    conditionalUses: ['Livestock operations', 'Agricultural processing', 'Temporary farm labor housing', 'Church'],
    prohibited: ['Subdivision (< 5 acres)', 'Commercial retail', 'Industrial (non-agricultural)'],
  },
  {
    code: 'R-R',
    name: 'Rural Residential (1 acre min)',
    category: 'residential',
    summary: 'Rural residential district for low-density single-family housing on 1-acre or larger parcels.',
    minLotSqft: 43560, // 1 acre
    maxHeightFt: 35,
    maxDensityPerAcre: 1,
    maxFAR: 0.2,
    permittedByRight: ['Single-family detached home', 'Accessory structure', 'Home occupation', 'Small-scale agriculture'],
    conditionalUses: ['ADU', 'Church', 'School', 'Bed & breakfast', 'Small kennel'],
    prohibited: ['Duplex', 'Multi-family', 'Commercial', 'Industrial'],
  },
  // Residential Low Density
  {
    code: 'RL-1',
    name: 'Residential Low Density — RL-1 (10,000 sqft min)',
    category: 'residential',
    summary: 'Low-density single-family residential district with 10,000 square foot minimum lot size.',
    minLotSqft: 10000,
    maxHeightFt: 35,
    maxDensityPerAcre: 4,
    maxFAR: 0.35,
    permittedByRight: ['Single-family detached home', 'Accessory structure', 'Home occupation', 'Public park'],
    conditionalUses: ['ADU', 'Church', 'School', 'Day care (small family)'],
    prohibited: ['Duplex', 'Multi-family', 'Commercial', 'Industrial'],
  },
  {
    code: 'RL-2',
    name: 'Residential Low Density — RL-2 (8,500 sqft min)',
    category: 'residential',
    summary: 'Low-density single-family residential district with 8,500 square foot minimum lot size.',
    minLotSqft: 8500,
    maxHeightFt: 35,
    maxDensityPerAcre: 5,
    maxFAR: 0.35,
    permittedByRight: ['Single-family detached home', 'Accessory structure', 'Home occupation', 'Public park'],
    conditionalUses: ['ADU', 'Church', 'School', 'Day care (small family)'],
    prohibited: ['Duplex', 'Multi-family', 'Commercial', 'Industrial'],
  },
  {
    code: 'RL-3',
    name: 'Residential Low Density — RL-3 (7,000 sqft min)',
    category: 'residential',
    summary: 'Low-density single-family residential district with 7,000 square foot minimum lot size.',
    minLotSqft: 7000,
    maxHeightFt: 35,
    maxDensityPerAcre: 6,
    maxFAR: 0.4,
    permittedByRight: ['Single-family detached home', 'Accessory structure', 'Home occupation', 'Public park'],
    conditionalUses: ['ADU', 'Church', 'School', 'Day care'],
    prohibited: ['Duplex', 'Multi-family', 'Commercial', 'Industrial'],
  },
  {
    code: 'RL-4',
    name: 'Residential Low Density — RL-4 (6,000 sqft min)',
    category: 'residential',
    summary: 'Low-density single-family residential district with 6,000 square foot minimum lot size.',
    minLotSqft: 6000,
    maxHeightFt: 35,
    maxDensityPerAcre: 7,
    maxFAR: 0.4,
    permittedByRight: ['Single-family detached home', 'Accessory structure', 'Home occupation', 'Public park'],
    conditionalUses: ['ADU', 'Church', 'School', 'Day care'],
    prohibited: ['Duplex', 'Multi-family', 'Commercial', 'Industrial'],
  },
  // Residential Medium / High Density
  {
    code: 'RM-8',
    name: 'Residential Medium Density — RM-8 (8 du/acre)',
    category: 'residential',
    summary: 'Medium-density residential district allowing single-family and small multi-family at up to 8 units per acre.',
    minLotSqft: 5000,
    maxHeightFt: 35,
    maxDensityPerAcre: 8,
    maxFAR: 0.5,
    permittedByRight: ['Single-family home', 'Duplex', 'Townhouse', 'Triplex', 'Fourplex', 'Accessory structure'],
    conditionalUses: ['ADU', 'Senior housing', 'Group home', 'Church', 'Day care'],
    prohibited: ['Large apartment complex (12+)', 'Commercial', 'Industrial'],
  },
  {
    code: 'RM-12',
    name: 'Residential Medium Density — RM-12 (12 du/acre)',
    category: 'residential',
    summary: 'Medium-density multi-family residential district allowing apartment buildings up to 12 units per acre.',
    minLotSqft: 5000,
    maxHeightFt: 45,
    maxDensityPerAcre: 12,
    maxFAR: 0.7,
    permittedByRight: ['Apartment building', 'Condominium', 'Townhouse', 'Duplex', 'Single-family home'],
    conditionalUses: ['Senior housing', 'Assisted living', 'Group home', 'Church'],
    prohibited: ['Commercial retail (standalone)', 'Industrial'],
  },
  {
    code: 'RM-24',
    name: 'Residential High Density — RM-24 (24 du/acre)',
    category: 'residential',
    summary: 'High-density multi-family residential district near commercial corridors allowing up to 24 units per acre.',
    minLotSqft: 3000,
    maxHeightFt: 55,
    maxDensityPerAcre: 24,
    maxFAR: 1.2,
    permittedByRight: ['High-rise apartment', 'Condominium', 'Townhouse', 'Apartment building'],
    conditionalUses: ['Senior housing', 'Assisted living', 'Hotel', 'Live/work unit'],
    prohibited: ['Commercial retail (standalone)', 'Industrial'],
  },
  // Manufactured Home
  {
    code: 'MH',
    name: 'Manufactured Home',
    category: 'residential',
    summary: 'Residential district accommodating manufactured homes and mobile home parks.',
    minLotSqft: 43560,
    maxHeightFt: 25,
    maxDensityPerAcre: 10,
    maxFAR: 0.3,
    permittedByRight: ['Manufactured home', 'Mobile home park', 'Accessory structure', 'Park and recreation area'],
    conditionalUses: ['Community building', 'Manager residence', 'Child care (on-site)'],
    prohibited: ['Site-built single-family (standalone)', 'Commercial', 'Industrial'],
  },
  // Business / Commercial
  {
    code: 'B-1',
    name: 'Neighborhood Business',
    category: 'commercial',
    summary: 'Small-scale neighborhood business district for retail, services, and offices serving adjacent residential areas.',
    minLotSqft: 5000,
    maxHeightFt: 35,
    maxDensityPerAcre: null,
    maxFAR: 0.6,
    permittedByRight: ['Retail store', 'Personal services', 'Professional office', 'Restaurant (no drive-through)', 'Bank'],
    conditionalUses: ['Drive-through', 'Residential above commercial', 'Child care center'],
    prohibited: ['Heavy commercial', 'Auto sales', 'Industrial', 'Standalone residential'],
  },
  {
    code: 'B-2',
    name: 'Community Business',
    category: 'commercial',
    summary: 'Community-scale commercial district for retail, services, and offices along arterial corridors.',
    minLotSqft: 10000,
    maxHeightFt: 45,
    maxDensityPerAcre: null,
    maxFAR: 1.0,
    permittedByRight: ['Retail', 'Restaurant', 'Grocery store', 'Professional office', 'Hotel/motel', 'Entertainment'],
    conditionalUses: ['Drive-through', 'Gas station', 'Auto services', 'Outdoor display'],
    prohibited: ['Heavy manufacturing', 'Standalone residential'],
  },
  {
    code: 'C-1',
    name: 'General Commercial',
    category: 'commercial',
    summary: 'General commercial district accommodating a broad range of retail, service, and office uses.',
    minLotSqft: 10000,
    maxHeightFt: 50,
    maxDensityPerAcre: null,
    maxFAR: 1.2,
    permittedByRight: ['Retail', 'Restaurant', 'Hotel/motel', 'Entertainment', 'Auto dealership', 'Office', 'Gas station'],
    conditionalUses: ['Drive-through', 'Car wash', 'Outdoor storage (screened)', 'Indoor recreational facility'],
    prohibited: ['Heavy industrial', 'Standalone residential'],
  },
  {
    code: 'C-2',
    name: 'Highway Commercial',
    category: 'commercial',
    summary: 'Highway-oriented commercial district for auto-related and high-traffic commercial uses along major corridors.',
    minLotSqft: 15000,
    maxHeightFt: 50,
    maxDensityPerAcre: null,
    maxFAR: 1.0,
    permittedByRight: ['Retail', 'Hotel/motel', 'Restaurant', 'Auto dealership', 'Gas station', 'Car wash', 'RV sales'],
    conditionalUses: ['Truck stop', 'Outdoor sales lot', 'Agricultural supply', 'Drive-through'],
    prohibited: ['Residential', 'Heavy industrial'],
  },
  // Industrial
  {
    code: 'I-1',
    name: 'Light Industrial',
    category: 'industrial',
    summary: 'Light industrial district for warehousing, light manufacturing, flex industrial, and distribution.',
    minLotSqft: 10000,
    maxHeightFt: 50,
    maxDensityPerAcre: null,
    maxFAR: 1.0,
    permittedByRight: ['Light manufacturing', 'Warehouse', 'Distribution center', 'Research and development', 'Flex industrial'],
    conditionalUses: ['Truck terminal', 'Outdoor storage (screened)', 'Ancillary retail', 'Data center'],
    prohibited: ['Residential', 'Heavy noxious industry', 'Schools', 'Child care'],
  },
  {
    code: 'I-2',
    name: 'General Industrial',
    category: 'industrial',
    summary: 'General industrial district for medium-intensity manufacturing, processing, and assembly operations.',
    minLotSqft: 15000,
    maxHeightFt: 55,
    maxDensityPerAcre: null,
    maxFAR: 1.2,
    permittedByRight: ['Manufacturing', 'Processing plant', 'Assembly', 'Warehouse', 'Distribution', 'Truck terminal'],
    conditionalUses: ['Concrete/asphalt plant', 'Recycling facility', 'Outdoor storage'],
    prohibited: ['Residential', 'Schools', 'Child care', 'Retail (standalone)'],
  },
  {
    code: 'I-3',
    name: 'Heavy Industrial',
    category: 'industrial',
    summary: 'Heavy industrial district for large-scale manufacturing and processing generating significant impacts.',
    minLotSqft: 20000,
    maxHeightFt: 65,
    maxDensityPerAcre: null,
    maxFAR: 1.5,
    permittedByRight: ['Heavy manufacturing', 'Processing plant', 'Trucking terminal', 'Outdoor storage', 'Utility infrastructure'],
    conditionalUses: ['Hazardous materials storage', 'Salvage yard', 'Smelting or refining'],
    prohibited: ['Residential', 'Schools', 'Child care', 'Retail (standalone)'],
  },
  // Open Space / Public
  {
    code: 'OS',
    name: 'Open Space',
    category: 'open-space',
    summary: 'Open space district preserving natural areas, parks, trails, and recreational lands.',
    minLotSqft: 0,
    maxHeightFt: 35,
    maxDensityPerAcre: null,
    maxFAR: 0.05,
    permittedByRight: ['Park', 'Trail system', 'Natural area preservation', 'Athletic facility', 'Campground'],
    conditionalUses: ['Amphitheater', 'Commercial recreation', 'Equestrian center'],
    prohibited: ['Residential (permanent)', 'Commercial', 'Industrial'],
  },
  {
    code: 'PF',
    name: 'Public Facility',
    category: 'open-space',
    summary: 'Public facility district for government buildings, schools, utilities, and quasi-public institutions.',
    minLotSqft: 5000,
    maxHeightFt: 50,
    maxDensityPerAcre: null,
    maxFAR: 0.6,
    permittedByRight: ['School', 'Government office', 'Hospital', 'Utility facility', 'Fire station', 'Library', 'Airport'],
    conditionalUses: ['Church', 'Community center', 'Adult education facility'],
    prohibited: ['Commercial retail', 'Industrial', 'Residential (private standalone)'],
  },
  // Overlay / Planned
  {
    code: 'PD',
    name: 'Planned Development',
    category: 'overlay',
    summary: 'Planned development district with site-specific standards approved by the City of Grand Junction.',
    minLotSqft: 0,
    maxHeightFt: 0,
    maxDensityPerAcre: null,
    maxFAR: 0,
    permittedByRight: ['Per approved planned development plan'],
    conditionalUses: ['Per approved planned development plan'],
    prohibited: ['Any use not listed in the approved planned development plan'],
    notes: 'Refer to the specific Planned Development plan for applicable uses and development standards.',
  },
];

const _byCode = new Map(GRAND_JUNCTION_ZONES.map(z => [z.code.toUpperCase(), z]));

export function getGrandJunctionZoneDistrict(code: string): GrandJunctionZoneDistrict | null {
  return _byCode.get(code?.toUpperCase()?.trim()) ?? null;
}

export const GRAND_JUNCTION_CATEGORY_LABELS: Record<GrandJunctionZoneDistrict['category'], string> = {
  residential: 'Residential',
  'mixed-use': 'Mixed Use',
  commercial: 'Commercial',
  industrial: 'Industrial',
  agricultural: 'Agricultural',
  'open-space': 'Open Space / Parks',
  overlay: 'Planned / Overlay',
};
