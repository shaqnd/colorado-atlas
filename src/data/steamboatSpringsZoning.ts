/**
 * City of Steamboat Springs Zoning Code
 * Based on the City of Steamboat Springs Land Use Development Code.
 * Source: City of Steamboat Springs GIS (numeric domain field mapped to zone abbreviations)
 * Note: The API returns a coded integer (1–28) that maps to a zone abbreviation.
 */

export interface SteamboatSpringsZoneDistrict {
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

export type SteamboatSpringsZoneCategory = SteamboatSpringsZoneDistrict['category'];

/**
 * Domain map from API integer to zone abbreviation string.
 * Values 1–28 as defined in the GIS field domain.
 */
const STEAMBOAT_SPRINGS_DOMAIN_MAP: Record<number, string> = {
  1: 'CC',
  2: 'CN',
  3: 'CO',
  4: 'CS',
  5: 'CY-1',
  6: 'CY-2',
  7: 'CK-1',
  8: 'CK-2',
  9: 'G-1',
  10: 'G-2',
  11: 'I',
  12: 'MF-1',
  13: 'MF-2',
  14: 'MF-3',
  15: 'MH',
  16: 'OR',
  17: 'RE-1',
  18: 'RE-1/S',
  19: 'RE-2',
  20: 'RE-2/S',
  21: 'RN-1',
  22: 'RN-2',
  23: 'RN-3',
  24: 'RN-4',
  25: 'RO',
  26: 'RR-1',
  27: 'RR-2',
  28: 'PUD',
};

/**
 * Maps an API integer domain value to its zone abbreviation string.
 * Returns null for unknown or out-of-range values.
 */
export function getSteamboatSpringsZoneCode(domainInt: number): string | null {
  return STEAMBOAT_SPRINGS_DOMAIN_MAP[domainInt] ?? null;
}

const STEAMBOAT_SPRINGS_ZONES: SteamboatSpringsZoneDistrict[] = [
  // Commercial
  {
    code: 'CC',
    name: 'Commercial Core',
    category: 'commercial',
    summary: 'Downtown Steamboat Springs commercial core district for high-intensity retail, dining, lodging, and entertainment.',
    minLotSqft: 0,
    maxHeightFt: 45,
    maxDensityPerAcre: null,
    maxFAR: 3.0,
    permittedByRight: ['Retail', 'Restaurant', 'Hotel', 'Office', 'Entertainment', 'Mixed-use building'],
    conditionalUses: ['Residential above ground floor', 'Live/work unit', 'Parking structure', 'Cultural facility'],
    prohibited: ['Heavy industrial', 'Outdoor storage', 'Auto dealership (standalone)'],
    notes: 'Design standards require active ground-floor uses and pedestrian-oriented frontages.',
  },
  {
    code: 'CN',
    name: 'Neighborhood Commercial',
    category: 'commercial',
    summary: 'Neighborhood-scale commercial district for retail, services, and offices serving nearby residential areas.',
    minLotSqft: 5000,
    maxHeightFt: 35,
    maxDensityPerAcre: null,
    maxFAR: 0.7,
    permittedByRight: ['Retail store', 'Personal services', 'Professional office', 'Restaurant (no drive-through)', 'Bank'],
    conditionalUses: ['Drive-through', 'Residential above commercial', 'Child care center'],
    prohibited: ['Heavy commercial', 'Auto dealership', 'Industrial', 'Standalone residential'],
  },
  {
    code: 'CO',
    name: 'Office Commercial',
    category: 'commercial',
    summary: 'Office-oriented commercial district for professional, medical, and business office uses.',
    minLotSqft: 5000,
    maxHeightFt: 40,
    maxDensityPerAcre: null,
    maxFAR: 1.0,
    permittedByRight: ['Professional office', 'Medical office', 'Financial services', 'Research and development'],
    conditionalUses: ['Ancillary retail (ground floor)', 'Child care (on-site)', 'Residential above ground floor'],
    prohibited: ['Heavy commercial', 'Industrial', 'Large-scale retail (standalone)'],
  },
  {
    code: 'CS',
    name: 'Service Commercial',
    category: 'commercial',
    summary: 'Service commercial district for auto-oriented and highway commercial uses along major corridors.',
    minLotSqft: 10000,
    maxHeightFt: 45,
    maxDensityPerAcre: null,
    maxFAR: 1.0,
    permittedByRight: ['Retail', 'Restaurant', 'Auto services', 'Gas station', 'Hotel/motel', 'Car wash'],
    conditionalUses: ['Drive-through', 'Outdoor display', 'RV sales', 'Truck stop'],
    prohibited: ['Residential', 'Heavy industrial'],
  },
  {
    code: 'CY-1',
    name: 'Ski Area Commercial — CY-1',
    category: 'commercial',
    summary: 'Ski area commercial district for base area retail, dining, and ski-related services (lower intensity).',
    minLotSqft: 0,
    maxHeightFt: 45,
    maxDensityPerAcre: null,
    maxFAR: 1.5,
    permittedByRight: ['Ski area retail', 'Restaurant', 'Ski rental and repair', 'Lodge', 'Ski school'],
    conditionalUses: ['Hotel', 'Residential (ski-in/ski-out)', 'Parking structure'],
    prohibited: ['Heavy industrial', 'Outdoor storage (non-ski)', 'General retail (non-ski-related)'],
  },
  {
    code: 'CY-2',
    name: 'Ski Area Commercial — CY-2',
    category: 'commercial',
    summary: 'Ski area commercial district for base area retail, dining, and ski-related services (higher intensity).',
    minLotSqft: 0,
    maxHeightFt: 60,
    maxDensityPerAcre: null,
    maxFAR: 2.5,
    permittedByRight: ['Ski area retail', 'Restaurant', 'Hotel', 'Conference center', 'Ski rental and repair', 'Entertainment'],
    conditionalUses: ['Residential (ski-in/ski-out)', 'Parking structure', 'Spa and wellness facility'],
    prohibited: ['Heavy industrial', 'Outdoor storage (non-ski)', 'Auto dealership'],
  },
  {
    code: 'CK-1',
    name: 'Ski Village Commercial — CK-1',
    category: 'mixed-use',
    summary: 'Ski village mixed-use district for pedestrian-oriented village commercial and lodging uses (lower intensity).',
    minLotSqft: 0,
    maxHeightFt: 45,
    maxDensityPerAcre: 30,
    maxFAR: 2.0,
    permittedByRight: ['Retail', 'Restaurant', 'Hotel', 'Lodging', 'Office', 'Residential above ground floor'],
    conditionalUses: ['Live/work unit', 'Parking structure', 'Cultural facility'],
    prohibited: ['Heavy industrial', 'Auto-oriented commercial (standalone)', 'Outdoor storage'],
    notes: 'Design standards require pedestrian-scale architecture and active street-level uses.',
  },
  {
    code: 'CK-2',
    name: 'Ski Village Commercial — CK-2',
    category: 'mixed-use',
    summary: 'Ski village mixed-use district for pedestrian-oriented village commercial and lodging uses (higher intensity).',
    minLotSqft: 0,
    maxHeightFt: 65,
    maxDensityPerAcre: 50,
    maxFAR: 3.5,
    permittedByRight: ['Retail', 'Restaurant', 'Hotel', 'Lodging', 'Office', 'Entertainment', 'Residential above ground floor'],
    conditionalUses: ['Live/work unit', 'Parking structure', 'Spa and wellness', 'Conference center'],
    prohibited: ['Heavy industrial', 'Auto-oriented commercial (standalone)', 'Outdoor storage'],
    notes: 'Design standards require pedestrian-scale architecture and active street-level uses.',
  },
  // Government
  {
    code: 'G-1',
    name: 'Government — G-1',
    category: 'open-space',
    summary: 'Government facility district for public buildings, civic uses, and quasi-public institutions (lower intensity).',
    minLotSqft: 5000,
    maxHeightFt: 40,
    maxDensityPerAcre: null,
    maxFAR: 0.5,
    permittedByRight: ['Government office', 'Fire station', 'Library', 'School', 'Community center', 'Utility facility'],
    conditionalUses: ['Church', 'Cultural facility', 'Public park'],
    prohibited: ['Commercial retail', 'Industrial', 'Private residential (standalone)'],
  },
  {
    code: 'G-2',
    name: 'Government — G-2',
    category: 'open-space',
    summary: 'Government facility district for large-scale public buildings, hospitals, and major civic infrastructure.',
    minLotSqft: 10000,
    maxHeightFt: 60,
    maxDensityPerAcre: null,
    maxFAR: 1.0,
    permittedByRight: ['Hospital', 'Government campus', 'Major utility infrastructure', 'Airport', 'Transit facility'],
    conditionalUses: ['Conference center', 'Research institution', 'Adult education facility'],
    prohibited: ['Commercial retail', 'Industrial', 'Private residential (standalone)'],
  },
  // Industrial
  {
    code: 'I',
    name: 'Industrial',
    category: 'industrial',
    summary: 'Industrial district for light to medium manufacturing, warehousing, and distribution operations.',
    minLotSqft: 10000,
    maxHeightFt: 50,
    maxDensityPerAcre: null,
    maxFAR: 1.0,
    permittedByRight: ['Light manufacturing', 'Warehouse', 'Distribution center', 'Research and development', 'Truck terminal'],
    conditionalUses: ['Outdoor storage (screened)', 'Ancillary retail', 'Recycling facility'],
    prohibited: ['Residential', 'Heavy noxious industry', 'Schools', 'Child care'],
  },
  // Multi-Family Residential
  {
    code: 'MF-1',
    name: 'Multifamily Residential — MF-1 (Low Density)',
    category: 'residential',
    summary: 'Low-density multi-family district for townhomes, duplexes, and small apartment buildings.',
    minLotSqft: 6000,
    maxHeightFt: 35,
    maxDensityPerAcre: 10,
    maxFAR: 0.6,
    permittedByRight: ['Duplex', 'Townhouse', 'Triplex', 'Fourplex', 'Single-family home', 'Accessory structure'],
    conditionalUses: ['ADU', 'Senior housing', 'Group home', 'Church', 'Day care'],
    prohibited: ['Commercial retail (standalone)', 'Industrial'],
  },
  {
    code: 'MF-2',
    name: 'Multifamily Residential — MF-2 (Medium Density)',
    category: 'residential',
    summary: 'Medium-density multi-family district for apartment buildings and mixed residential types.',
    minLotSqft: 5000,
    maxHeightFt: 45,
    maxDensityPerAcre: 20,
    maxFAR: 1.0,
    permittedByRight: ['Apartment building', 'Condominium', 'Townhouse', 'Duplex', 'Single-family home'],
    conditionalUses: ['Senior housing', 'Assisted living', 'Group home', 'Church'],
    prohibited: ['Commercial retail (standalone)', 'Industrial'],
  },
  {
    code: 'MF-3',
    name: 'Multifamily Residential — MF-3 (High Density)',
    category: 'residential',
    summary: 'High-density multi-family district for apartment complexes near commercial areas and ski base facilities.',
    minLotSqft: 3000,
    maxHeightFt: 55,
    maxDensityPerAcre: 35,
    maxFAR: 1.8,
    permittedByRight: ['High-rise apartment', 'Condominium', 'Townhouse', 'Apartment building'],
    conditionalUses: ['Senior housing', 'Assisted living', 'Hotel', 'Live/work unit'],
    prohibited: ['Commercial retail (standalone)', 'Industrial'],
  },
  // Mobile Home
  {
    code: 'MH',
    name: 'Mobile Home Residential',
    category: 'residential',
    summary: 'Residential district accommodating mobile homes and manufactured home parks in Steamboat Springs.',
    minLotSqft: 43560,
    maxHeightFt: 25,
    maxDensityPerAcre: 10,
    maxFAR: 0.3,
    permittedByRight: ['Mobile home park', 'Manufactured home', 'Accessory structure', 'Park and recreation area'],
    conditionalUses: ['Community building', 'Manager residence', 'Child care (on-site)'],
    prohibited: ['Site-built single-family (standalone)', 'Commercial', 'Industrial'],
  },
  // Outdoor Recreation
  {
    code: 'OR',
    name: 'Outdoor Recreation',
    category: 'open-space',
    summary: 'Outdoor recreation district for parks, trails, ski terrain, and open space lands.',
    minLotSqft: 0,
    maxHeightFt: 35,
    maxDensityPerAcre: null,
    maxFAR: 0.05,
    permittedByRight: ['Park', 'Trail system', 'Ski terrain', 'Athletic facility', 'Natural area preservation'],
    conditionalUses: ['Campground', 'Equestrian center', 'Commercial recreation facility', 'Amphitheater'],
    prohibited: ['Residential (permanent)', 'Commercial retail', 'Industrial'],
  },
  // Residential Estate
  {
    code: 'RE-1',
    name: 'Residential Estate — RE-1',
    category: 'residential',
    summary: 'Estate residential district for large-lot single-family homes in semi-rural settings.',
    minLotSqft: 87120, // 2 acres
    maxHeightFt: 35,
    maxDensityPerAcre: 0.5,
    maxFAR: 0.2,
    permittedByRight: ['Single-family detached home', 'Accessory structure', 'Home occupation', 'Small-scale agriculture'],
    conditionalUses: ['ADU', 'Church', 'School', 'Bed & breakfast'],
    prohibited: ['Duplex', 'Multi-family', 'Commercial', 'Industrial'],
  },
  {
    code: 'RE-1/S',
    name: 'Residential Estate — RE-1/S (Ski Access)',
    category: 'residential',
    summary: 'Estate residential district with ski access overlay for large-lot homes adjacent to ski terrain.',
    minLotSqft: 87120, // 2 acres
    maxHeightFt: 35,
    maxDensityPerAcre: 0.5,
    maxFAR: 0.2,
    permittedByRight: ['Single-family detached home', 'Accessory structure', 'Home occupation'],
    conditionalUses: ['ADU', 'Ski caretaker residence', 'Bed & breakfast'],
    prohibited: ['Duplex', 'Multi-family', 'Commercial', 'Industrial'],
    notes: '/S suffix denotes ski access overlay; site-specific ski easements may apply.',
  },
  {
    code: 'RE-2',
    name: 'Residential Estate — RE-2',
    category: 'residential',
    summary: 'Estate residential district for large-lot single-family homes at a slightly higher density than RE-1.',
    minLotSqft: 43560, // 1 acre
    maxHeightFt: 35,
    maxDensityPerAcre: 1,
    maxFAR: 0.25,
    permittedByRight: ['Single-family detached home', 'Accessory structure', 'Home occupation'],
    conditionalUses: ['ADU', 'Church', 'School', 'Bed & breakfast'],
    prohibited: ['Duplex', 'Multi-family', 'Commercial', 'Industrial'],
  },
  {
    code: 'RE-2/S',
    name: 'Residential Estate — RE-2/S (Ski Access)',
    category: 'residential',
    summary: 'Estate residential district with ski access overlay for 1-acre lots adjacent to ski terrain.',
    minLotSqft: 43560, // 1 acre
    maxHeightFt: 35,
    maxDensityPerAcre: 1,
    maxFAR: 0.25,
    permittedByRight: ['Single-family detached home', 'Accessory structure', 'Home occupation'],
    conditionalUses: ['ADU', 'Ski caretaker residence', 'Bed & breakfast'],
    prohibited: ['Duplex', 'Multi-family', 'Commercial', 'Industrial'],
    notes: '/S suffix denotes ski access overlay; site-specific ski easements may apply.',
  },
  // Residential Neighborhood
  {
    code: 'RN-1',
    name: 'Residential Neighborhood — RN-1',
    category: 'residential',
    summary: 'Low-density neighborhood residential district for single-family homes on standard urban lots.',
    minLotSqft: 9000,
    maxHeightFt: 35,
    maxDensityPerAcre: 4,
    maxFAR: 0.35,
    permittedByRight: ['Single-family detached home', 'Accessory structure', 'Home occupation', 'Public park'],
    conditionalUses: ['ADU', 'Church', 'School', 'Day care (small family)'],
    prohibited: ['Duplex', 'Multi-family', 'Commercial', 'Industrial'],
  },
  {
    code: 'RN-2',
    name: 'Residential Neighborhood — RN-2',
    category: 'residential',
    summary: 'Single-family neighborhood residential district with a moderately reduced minimum lot size.',
    minLotSqft: 7500,
    maxHeightFt: 35,
    maxDensityPerAcre: 5,
    maxFAR: 0.38,
    permittedByRight: ['Single-family detached home', 'Accessory structure', 'Home occupation', 'Public park'],
    conditionalUses: ['ADU', 'Church', 'School', 'Day care'],
    prohibited: ['Duplex', 'Multi-family', 'Commercial', 'Industrial'],
  },
  {
    code: 'RN-3',
    name: 'Residential Neighborhood — RN-3',
    category: 'residential',
    summary: 'Medium-density neighborhood residential district allowing duplexes and small multi-family.',
    minLotSqft: 6000,
    maxHeightFt: 35,
    maxDensityPerAcre: 8,
    maxFAR: 0.45,
    permittedByRight: ['Single-family home', 'Duplex', 'Townhouse', 'Accessory structure', 'Home occupation'],
    conditionalUses: ['ADU', 'Triplex', 'Church', 'School', 'Day care'],
    prohibited: ['Multi-family (5+)', 'Commercial', 'Industrial'],
  },
  {
    code: 'RN-4',
    name: 'Residential Neighborhood — RN-4',
    category: 'residential',
    summary: 'Higher-density neighborhood residential district for duplexes, townhomes, and small apartment buildings.',
    minLotSqft: 5000,
    maxHeightFt: 35,
    maxDensityPerAcre: 12,
    maxFAR: 0.6,
    permittedByRight: ['Single-family home', 'Duplex', 'Townhouse', 'Triplex', 'Fourplex', 'Accessory structure'],
    conditionalUses: ['ADU', 'Senior housing', 'Group home', 'Church', 'Day care'],
    prohibited: ['Large apartment complex (12+)', 'Commercial', 'Industrial'],
  },
  // Residential Office
  {
    code: 'RO',
    name: 'Residential Office',
    category: 'mixed-use',
    summary: 'Residential office transition district permitting professional offices within a residential character setting.',
    minLotSqft: 6000,
    maxHeightFt: 35,
    maxDensityPerAcre: 8,
    maxFAR: 0.6,
    permittedByRight: ['Single-family home', 'Professional office', 'Medical office', 'Studio', 'Home occupation'],
    conditionalUses: ['Duplex', 'ADU', 'Child care center', 'Bed & breakfast'],
    prohibited: ['Retail (standalone)', 'Industrial', 'Multi-family (5+)'],
  },
  // Rural Residential
  {
    code: 'RR-1',
    name: 'Rural Residential — RR-1',
    category: 'residential',
    summary: 'Rural residential district for low-density single-family housing on large parcels at the urban fringe.',
    minLotSqft: 87120, // 2 acres
    maxHeightFt: 35,
    maxDensityPerAcre: 0.5,
    maxFAR: 0.2,
    permittedByRight: ['Single-family detached home', 'Accessory structure', 'Home occupation', 'Small-scale agriculture'],
    conditionalUses: ['ADU', 'Church', 'School', 'Kennel'],
    prohibited: ['Duplex', 'Multi-family', 'Commercial', 'Industrial'],
  },
  {
    code: 'RR-2',
    name: 'Rural Residential — RR-2',
    category: 'residential',
    summary: 'Rural residential district for single-family housing on moderately large parcels.',
    minLotSqft: 43560, // 1 acre
    maxHeightFt: 35,
    maxDensityPerAcre: 1,
    maxFAR: 0.25,
    permittedByRight: ['Single-family detached home', 'Accessory structure', 'Home occupation', 'Hobby farming'],
    conditionalUses: ['ADU', 'Church', 'Bed & breakfast', 'Day care (small family)'],
    prohibited: ['Duplex', 'Multi-family', 'Commercial', 'Industrial'],
  },
  // Overlay / Planned
  {
    code: 'PUD',
    name: 'Planned Unit Development',
    category: 'overlay',
    summary: 'Master-planned development district with site-specific standards approved by the City of Steamboat Springs.',
    minLotSqft: 0,
    maxHeightFt: 0,
    maxDensityPerAcre: null,
    maxFAR: 0,
    permittedByRight: ['Per approved PUD plan'],
    conditionalUses: ['Per approved PUD plan'],
    prohibited: ['Any use not listed in the approved PUD plan'],
    notes: 'Refer to the specific Planned Unit Development plan for applicable uses and development standards.',
  },
];

const _byCode = new Map(STEAMBOAT_SPRINGS_ZONES.map(z => [z.code.toUpperCase(), z]));

export function getSteamboatSpringsZoneDistrict(code: string): SteamboatSpringsZoneDistrict | null {
  return _byCode.get(code?.toUpperCase()?.trim()) ?? null;
}

export const STEAMBOAT_SPRINGS_CATEGORY_LABELS: Record<SteamboatSpringsZoneDistrict['category'], string> = {
  residential: 'Residential',
  'mixed-use': 'Mixed Use',
  commercial: 'Commercial',
  industrial: 'Industrial',
  agricultural: 'Agricultural',
  'open-space': 'Open Space / Parks',
  overlay: 'Planned / Overlay',
};
