/**
 * Boulder County Zoning Code — Unincorporated County Only
 * Based on Article 4 of the Boulder County Land Use Code.
 * Source: maps.bouldercounty.org/arcgis/rest/services/PLANNING/LUC_ZoningDistricts/MapServer (layer 0, ZONE_DIST field)
 * Note: Covers unincorporated county only — City of Boulder uses its own zoning code.
 */

export interface BoulderCountyZoneDistrict {
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

const BOULDER_COUNTY_ZONES: BoulderCountyZoneDistrict[] = [
  {
    code: 'A',
    name: 'Agricultural',
    category: 'agricultural',
    summary: 'Primary agricultural district protecting farmland and open space in the plains and foothills.',
    minLotSqft: 871200, // 20 acres
    maxHeightFt: 35,
    maxDensityPerAcre: 0.05,
    maxFAR: 0.05,
    permittedByRight: ['Farm / ranch operations', 'Single-family home (1 per parcel)', 'Agricultural structures'],
    conditionalUses: ['Agricultural processing', 'Riding stable', 'Bed & breakfast', 'Winery'],
    prohibited: ['Subdivision', 'Commercial (non-agricultural)', 'Industrial', 'Multi-family'],
  },
  {
    code: 'F',
    name: 'Forestry',
    category: 'agricultural',
    summary: 'Forestry and timber management district in the mountain foothills.',
    minLotSqft: 871200, // 20 acres
    maxHeightFt: 35,
    maxDensityPerAcre: 0.05,
    maxFAR: 0.05,
    permittedByRight: ['Timber harvesting', 'Single-family home (1 per parcel)', 'Agricultural structures'],
    conditionalUses: ['Wilderness lodge', 'Agricultural processing'],
    prohibited: ['Commercial', 'Multi-family', 'Industrial'],
  },
  {
    code: 'E-1',
    name: 'Estate Residential — 35 Acre Min.',
    category: 'residential',
    summary: 'Very low-density estate residential in rural and mountain areas.',
    minLotSqft: 1524600, // 35 acres
    maxHeightFt: 35,
    maxDensityPerAcre: 0.03,
    maxFAR: 0.05,
    permittedByRight: ['Single-family home', 'Agricultural use', 'Accessory structures'],
    conditionalUses: ['B&B', 'Home occupation', 'Guest house'],
    prohibited: ['Multi-family', 'Commercial', 'Industrial'],
    notes: '35-acre minimum lot size per Boulder County Land Use Code.',
  },
  {
    code: 'E-2',
    name: 'Estate Residential — 10 Acre Min.',
    category: 'residential',
    summary: 'Low-density mountain estate residential.',
    minLotSqft: 435600, // 10 acres
    maxHeightFt: 35,
    maxDensityPerAcre: 0.1,
    maxFAR: 0.1,
    permittedByRight: ['Single-family home', 'Agricultural use', 'Accessory structures'],
    conditionalUses: ['B&B', 'Home occupation'],
    prohibited: ['Multi-family', 'Commercial', 'Industrial'],
  },
  {
    code: 'E-3',
    name: 'Estate Residential — 5 Acre Min.',
    category: 'residential',
    summary: 'Low-density rural residential on 5-acre minimum parcels.',
    minLotSqft: 217800, // 5 acres
    maxHeightFt: 35,
    maxDensityPerAcre: 0.2,
    maxFAR: 0.1,
    permittedByRight: ['Single-family home', 'Accessory structure', 'Agricultural use'],
    conditionalUses: ['B&B', 'Home occupation', 'Child care (small family)'],
    prohibited: ['Multi-family', 'Commercial', 'Industrial'],
  },
  {
    code: 'RR',
    name: 'Rural Residential',
    category: 'residential',
    summary: 'Rural residential district typically found in unincorporated community areas.',
    minLotSqft: 87120, // 2 acres
    maxHeightFt: 35,
    maxDensityPerAcre: 0.5,
    maxFAR: 0.15,
    permittedByRight: ['Single-family home', 'Accessory structure', 'Home occupation'],
    conditionalUses: ['Duplex', 'Church', 'School'],
    prohibited: ['Apartments (3+)', 'Commercial', 'Industrial'],
  },
  {
    code: 'R-1',
    name: 'Residential',
    category: 'residential',
    summary: 'Standard residential district in unincorporated community areas.',
    minLotSqft: 7500,
    maxHeightFt: 35,
    maxDensityPerAcre: 5,
    maxFAR: 0.4,
    permittedByRight: ['Single-family home', 'Accessory structure', 'Home occupation'],
    conditionalUses: ['ADU', 'Duplex', 'Religious institution', 'School'],
    prohibited: ['Apartments (3+)', 'Commercial', 'Industrial'],
  },
  {
    code: 'R-2',
    name: 'Multi-Family Residential',
    category: 'residential',
    summary: 'Multi-family residential in established unincorporated community areas.',
    minLotSqft: 3500,
    maxHeightFt: 40,
    maxDensityPerAcre: 16,
    maxFAR: 0.8,
    permittedByRight: ['Apartment', 'Condominium', 'Townhouse', 'Duplex'],
    conditionalUses: ['Senior housing', 'Assisted living'],
    prohibited: ['Commercial retail', 'Industrial'],
  },
  {
    code: 'MHC',
    name: 'Mobile Home Community',
    category: 'residential',
    summary: 'Manufactured / mobile home community district.',
    minLotSqft: 3500,
    maxHeightFt: 25,
    maxDensityPerAcre: 10,
    maxFAR: 0.35,
    permittedByRight: ['Manufactured home', 'Park office', 'Community facilities'],
    conditionalUses: ['Accessory commercial uses'],
    prohibited: ['Site-built homes', 'General commercial', 'Industrial'],
  },
  {
    code: 'BO',
    name: 'Business / Office',
    category: 'commercial',
    summary: 'Office and limited business uses in unincorporated community areas.',
    minLotSqft: 7500,
    maxHeightFt: 40,
    maxDensityPerAcre: null,
    maxFAR: 0.8,
    permittedByRight: ['Professional office', 'Medical clinic', 'Financial services', 'Personal services'],
    conditionalUses: ['Limited retail', 'Restaurant', 'Hotel'],
    prohibited: ['Heavy retail', 'Industrial', 'Residential (standalone)'],
  },
  {
    code: 'CO',
    name: 'Community / General Commercial',
    category: 'commercial',
    summary: 'General commercial uses in unincorporated community centers.',
    minLotSqft: 10000,
    maxHeightFt: 40,
    maxDensityPerAcre: null,
    maxFAR: 1.0,
    permittedByRight: ['Retail', 'Restaurant', 'Hotel', 'Entertainment', 'Auto sales', 'Office'],
    conditionalUses: ['Drive-through', 'Gas station', 'Outdoor storage'],
    prohibited: ['Heavy manufacturing', 'Residential (standalone)'],
  },
  {
    code: 'I',
    name: 'Industrial',
    category: 'industrial',
    summary: 'Light to moderate industrial uses in unincorporated areas.',
    minLotSqft: 10000,
    maxHeightFt: 50,
    maxDensityPerAcre: null,
    maxFAR: 1.0,
    permittedByRight: ['Light manufacturing', 'Warehouse', 'Distribution', 'Research and development'],
    conditionalUses: ['Heavy manufacturing', 'Outdoor storage', 'Recycling facility'],
    prohibited: ['Residential', 'Schools', 'Child care'],
  },
  {
    code: 'PUD',
    name: 'Planned Unit Development',
    category: 'overlay',
    summary: 'Master-planned development with site-specific standards approved by Boulder County.',
    minLotSqft: 0,
    maxHeightFt: 0,
    maxDensityPerAcre: null,
    maxFAR: 0,
    permittedByRight: ['Per approved PUD plan'],
    conditionalUses: ['Per approved PUD plan'],
    prohibited: ['Any use not listed in PUD plan'],
    notes: 'Refer to the specific Planned Unit Development plan for applicable standards.',
  },
  {
    code: 'TT',
    name: 'Town / Township',
    category: 'overlay',
    summary: 'Historic township or community center overlay with mixed uses.',
    minLotSqft: 5000,
    maxHeightFt: 35,
    maxDensityPerAcre: 8,
    maxFAR: 0.7,
    permittedByRight: ['Single-family home', 'Small retail', 'Personal services', 'Restaurant', 'Office'],
    conditionalUses: ['Duplex', 'Hotel', 'Religious institution'],
    prohibited: ['Heavy industrial', 'Big-box retail'],
    notes: 'Found in historic unincorporated communities such as Lyons, Ward, and Jamestown.',
  },
];

const _byCode = new Map(BOULDER_COUNTY_ZONES.map(z => [z.code.toUpperCase(), z]));

export function getBoulderCountyZoneDistrict(code: string): BoulderCountyZoneDistrict | null {
  return _byCode.get(code?.toUpperCase()?.trim()) ?? null;
}

export const BOULDER_COUNTY_CATEGORY_LABELS: Record<BoulderCountyZoneDistrict['category'], string> = {
  residential: 'Residential',
  'mixed-use': 'Mixed Use',
  commercial: 'Commercial',
  industrial: 'Industrial',
  agricultural: 'Agricultural',
  'open-space': 'Open Space / Parks',
  overlay: 'Planned / Overlay',
};
