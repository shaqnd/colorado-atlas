/**
 * Pueblo County Zoning Code — Unincorporated County Only
 * Based on the Pueblo County Land Use Regulations.
 * Source: maps.co.pueblo.co.us/outside/rest/services/Landbase/PuebloCounty_ZoningCountyOnly/MapServer (layer 0, ZoneDist field)
 * Note: Covers unincorporated county — City of Pueblo uses its own zoning code.
 */

export interface PuebloCountyZoneDistrict {
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

const PUEBLO_COUNTY_ZONES: PuebloCountyZoneDistrict[] = [
  {
    code: 'A1',
    name: 'Agricultural — General',
    category: 'agricultural',
    summary: 'General agricultural zone for large-scale farming and ranching on Pueblo County plains.',
    minLotSqft: 871200, // 20 acres
    maxHeightFt: 35,
    maxDensityPerAcre: 0.05,
    maxFAR: 0.05,
    permittedByRight: ['Crop farming', 'Ranch operations', 'Single-family home (1 per parcel)', 'Agricultural structures'],
    conditionalUses: ['Agricultural processing', 'Livestock operations', 'Oil and gas surface use', 'Temporary farm labor housing'],
    prohibited: ['Subdivision (< 35 acres)', 'Commercial retail', 'Industrial (non-agricultural)'],
  },
  {
    code: 'A2',
    name: 'Agricultural — Transitional',
    category: 'agricultural',
    summary: 'Transitional agricultural zone allowing limited rural residential at 5-acre minimums.',
    minLotSqft: 217800, // 5 acres
    maxHeightFt: 35,
    maxDensityPerAcre: 0.2,
    maxFAR: 0.1,
    permittedByRight: ['Single-family home', 'Agricultural use', 'Accessory structures'],
    conditionalUses: ['Church', 'School', 'Kennel', 'Bed & breakfast'],
    prohibited: ['Multi-family', 'Commercial (non-agricultural)', 'Industrial'],
  },
  {
    code: 'A3',
    name: 'Agricultural — Small Parcel',
    category: 'agricultural',
    summary: 'Agricultural zone allowing residential uses on parcels as small as 2 acres.',
    minLotSqft: 87120, // 2 acres
    maxHeightFt: 35,
    maxDensityPerAcre: 0.5,
    maxFAR: 0.15,
    permittedByRight: ['Single-family home', 'Small-scale farming', 'Accessory structure'],
    conditionalUses: ['Church', 'School', 'Home occupation'],
    prohibited: ['Multi-family', 'Commercial', 'Industrial'],
  },
  {
    code: 'RR',
    name: 'Rural Residential',
    category: 'residential',
    summary: 'Rural residential zone for unincorporated communities and rural neighborhoods.',
    minLotSqft: 43560, // 1 acre
    maxHeightFt: 35,
    maxDensityPerAcre: 1,
    maxFAR: 0.2,
    permittedByRight: ['Single-family home', 'Accessory structure', 'Home occupation'],
    conditionalUses: ['Duplex', 'Church', 'School', 'Child care (small family)'],
    prohibited: ['Apartments (3+)', 'Commercial', 'Industrial'],
  },
  {
    code: 'SR1',
    name: 'Suburban Residential — Low Density',
    category: 'residential',
    summary: 'Low-density suburban single-family residential near Pueblo city limits.',
    minLotSqft: 10000,
    maxHeightFt: 35,
    maxDensityPerAcre: 4,
    maxFAR: 0.35,
    permittedByRight: ['Single-family detached home', 'Accessory structure', 'Home occupation'],
    conditionalUses: ['ADU', 'Religious institution', 'School'],
    prohibited: ['Duplex', 'Multi-family', 'Commercial', 'Industrial'],
  },
  {
    code: 'SR2',
    name: 'Suburban Residential — Medium Density',
    category: 'residential',
    summary: 'Medium-density suburban residential including duplexes and small apartment buildings.',
    minLotSqft: 6000,
    maxHeightFt: 35,
    maxDensityPerAcre: 8,
    maxFAR: 0.45,
    permittedByRight: ['Single-family home', 'Duplex', 'Accessory structure'],
    conditionalUses: ['Townhouse', 'Triplex', 'Religious institution', 'School'],
    prohibited: ['Apartment complex (5+)', 'Commercial', 'Industrial'],
  },
  {
    code: 'LR',
    name: 'Low-Density Residential',
    category: 'residential',
    summary: 'Low-density residential district in unincorporated community areas.',
    minLotSqft: 7500,
    maxHeightFt: 35,
    maxDensityPerAcre: 6,
    maxFAR: 0.4,
    permittedByRight: ['Single-family home', 'Duplex', 'Accessory structure', 'Home occupation'],
    conditionalUses: ['ADU', 'Townhouse', 'Church', 'School', 'Day care'],
    prohibited: ['Apartment complex (5+)', 'Commercial', 'Industrial'],
  },
  {
    code: 'HR',
    name: 'High-Density Residential',
    category: 'residential',
    summary: 'High-density multi-family residential near commercial corridors.',
    minLotSqft: 3000,
    maxHeightFt: 45,
    maxDensityPerAcre: 20,
    maxFAR: 1.0,
    permittedByRight: ['Apartment', 'Condominium', 'Townhouse', 'Duplex'],
    conditionalUses: ['Senior housing', 'Assisted living', 'Group home', 'Hotel'],
    prohibited: ['Commercial retail', 'Industrial'],
  },
  {
    code: 'MN',
    name: 'Neighborhood Commercial',
    category: 'commercial',
    summary: 'Small-scale neighborhood retail, services, and offices serving local residents.',
    minLotSqft: 5000,
    maxHeightFt: 35,
    maxDensityPerAcre: null,
    maxFAR: 0.7,
    permittedByRight: ['Retail store', 'Restaurant', 'Personal services', 'Professional office', 'Bank'],
    conditionalUses: ['Drive-through', 'Auto services', 'Gas station'],
    prohibited: ['Heavy industrial', 'Residential (standalone)'],
  },
  {
    code: 'MC',
    name: 'General Commercial',
    category: 'commercial',
    summary: 'General commercial uses along major corridors and near community centers.',
    minLotSqft: 10000,
    maxHeightFt: 45,
    maxDensityPerAcre: null,
    maxFAR: 1.0,
    permittedByRight: ['Retail', 'Restaurant', 'Hotel/motel', 'Entertainment', 'Auto dealership', 'Office'],
    conditionalUses: ['Drive-through', 'Gas station', 'Car wash', 'Outdoor display'],
    prohibited: ['Heavy manufacturing', 'Residential (standalone)'],
  },
  {
    code: 'CC',
    name: 'Central / Highway Commercial',
    category: 'commercial',
    summary: 'Highway-oriented commercial uses along US-50, US-25, and I-25 corridors.',
    minLotSqft: 15000,
    maxHeightFt: 50,
    maxDensityPerAcre: null,
    maxFAR: 1.5,
    permittedByRight: ['Retail', 'Hotel/motel', 'Restaurant', 'Auto-related sales', 'Entertainment complex'],
    conditionalUses: ['Truck stop', 'RV park', 'Outdoor sales lot', 'Agricultural supply'],
    prohibited: ['Residential', 'Heavy industrial'],
  },
  {
    code: 'LI',
    name: 'Light Industrial',
    category: 'industrial',
    summary: 'Light manufacturing, warehousing, flex industrial, and distribution.',
    minLotSqft: 10000,
    maxHeightFt: 50,
    maxDensityPerAcre: null,
    maxFAR: 1.0,
    permittedByRight: ['Light manufacturing', 'Warehouse', 'Distribution', 'Research and development', 'Flex industrial'],
    conditionalUses: ['Truck terminal', 'Outdoor storage (screened)', 'Ancillary retail'],
    prohibited: ['Residential', 'Heavy noxious industry'],
  },
  {
    code: 'HI',
    name: 'Heavy Industrial',
    category: 'industrial',
    summary: 'Heavy manufacturing, processing, and large-scale industrial operations.',
    minLotSqft: 20000,
    maxHeightFt: 60,
    maxDensityPerAcre: null,
    maxFAR: 1.5,
    permittedByRight: ['Heavy manufacturing', 'Processing plant', 'Trucking terminal', 'Outdoor storage', 'Utility infrastructure'],
    conditionalUses: ['Concrete/asphalt plant', 'Recycling facility', 'Hazardous materials storage'],
    prohibited: ['Residential', 'Schools', 'Child care'],
  },
  {
    code: 'PP',
    name: 'Public / Private Recreation',
    category: 'open-space',
    summary: 'Public and private parks, recreation facilities, and open space areas.',
    minLotSqft: 0,
    maxHeightFt: 40,
    maxDensityPerAcre: null,
    maxFAR: 0.1,
    permittedByRight: ['Park', 'Athletic facility', 'Golf course', 'Campground', 'Trail system'],
    conditionalUses: ['Amphitheater', 'Commercial recreation', 'Equestrian center'],
    prohibited: ['Residential (permanent)', 'Heavy commercial', 'Industrial'],
  },
  {
    code: 'PL',
    name: 'Public Lands',
    category: 'open-space',
    summary: 'Federal, state, and county public lands including BLM and national forest areas.',
    minLotSqft: 0,
    maxHeightFt: 35,
    maxDensityPerAcre: null,
    maxFAR: 0.02,
    permittedByRight: ['Public land management', 'Recreation', 'Conservation'],
    conditionalUses: ['Resource extraction (with federal/state permit)', 'Utility corridor'],
    prohibited: ['Private residential', 'Commercial development', 'Industrial'],
  },
  {
    code: 'CF',
    name: 'Community Facilities',
    category: 'open-space',
    summary: 'Public and quasi-public community facilities including schools, government, and utilities.',
    minLotSqft: 5000,
    maxHeightFt: 45,
    maxDensityPerAcre: null,
    maxFAR: 0.5,
    permittedByRight: ['School', 'Government office', 'Hospital', 'Utility facility', 'Fire station', 'Library'],
    conditionalUses: ['Church', 'Community center', 'Airport'],
    prohibited: ['Commercial retail', 'Industrial', 'Residential (private)'],
  },
  {
    code: 'PUD',
    name: 'Planned Unit Development',
    category: 'overlay',
    summary: 'Master-planned development with site-specific standards approved by Pueblo County.',
    minLotSqft: 0,
    maxHeightFt: 0,
    maxDensityPerAcre: null,
    maxFAR: 0,
    permittedByRight: ['Per approved PUD plan'],
    conditionalUses: ['Per approved PUD plan'],
    prohibited: ['Any use not listed in PUD plan'],
    notes: 'Refer to the specific Planned Unit Development plan for applicable standards.',
  },
];

const _byCode = new Map(PUEBLO_COUNTY_ZONES.map(z => [z.code.toUpperCase(), z]));

export function getPuebloCountyZoneDistrict(code: string): PuebloCountyZoneDistrict | null {
  return _byCode.get(code?.toUpperCase()?.trim()) ?? null;
}

export const PUEBLO_COUNTY_CATEGORY_LABELS: Record<PuebloCountyZoneDistrict['category'], string> = {
  residential: 'Residential',
  'mixed-use': 'Mixed Use',
  commercial: 'Commercial',
  industrial: 'Industrial',
  agricultural: 'Agricultural',
  'open-space': 'Open Space / Parks',
  overlay: 'Planned / Overlay',
};
