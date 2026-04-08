/**
 * Weld County Zoning Code — Unincorporated County Only
 * Based on the Weld County Code of Ordinances, Land Use.
 * Source: services.arcgis.com/ewjSqmSyHJnkfBLL/arcgis/rest/services/Zoning_open_data/FeatureServer (layer 38, ZONE_SYMB field)
 * Note: Covers unincorporated county — municipalities maintain their own zoning codes.
 */

export interface WeldZoneDistrict {
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

const WELD_ZONES: WeldZoneDistrict[] = [
  {
    code: 'A',
    name: 'Agricultural',
    category: 'agricultural',
    summary: 'Primary agricultural zone covering irrigated farmland and rangeland across Weld County plains.',
    minLotSqft: 871200, // 20 acres
    maxHeightFt: 35,
    maxDensityPerAcre: 0.05,
    maxFAR: 0.05,
    permittedByRight: ['Crop farming', 'Ranch / feedlot operations', 'Single-family home (1 per parcel)', 'Agricultural structures'],
    conditionalUses: ['Agricultural processing', 'Oil and gas facility', 'Livestock confinement operation', 'Dairy'],
    prohibited: ['Subdivision (lots < 35 acres)', 'Commercial retail', 'Industrial (non-ag)'],
    notes: 'Weld County is among the most productive agricultural counties in the US — oil, gas, and agricultural uses coexist under specific conditional use rules.',
  },
  {
    code: 'A-1',
    name: 'Agricultural — Transitional',
    category: 'agricultural',
    summary: 'Transitional agricultural zone allowing limited rural residential on smaller parcels.',
    minLotSqft: 217800, // 5 acres
    maxHeightFt: 35,
    maxDensityPerAcre: 0.2,
    maxFAR: 0.1,
    permittedByRight: ['Single-family home', 'Agricultural use', 'Accessory structures'],
    conditionalUses: ['Church', 'School', 'Bed & breakfast', 'Small agricultural sales'],
    prohibited: ['Multi-family', 'Commercial (non-agricultural)', 'Industrial'],
  },
  {
    code: 'R-1',
    name: 'Single-Family Residential',
    category: 'residential',
    summary: 'Standard single-family residential district in unincorporated community areas.',
    minLotSqft: 7000,
    maxHeightFt: 35,
    maxDensityPerAcre: 6,
    maxFAR: 0.4,
    permittedByRight: ['Single-family detached home', 'Accessory structure', 'Home occupation'],
    conditionalUses: ['ADU', 'Religious institution', 'School', 'Child care (small)'],
    prohibited: ['Duplex', 'Multi-family', 'Commercial', 'Industrial'],
  },
  {
    code: 'R-2',
    name: 'Two-Family Residential',
    category: 'residential',
    summary: 'Single-family and duplex residential in community areas.',
    minLotSqft: 5500,
    maxHeightFt: 35,
    maxDensityPerAcre: 10,
    maxFAR: 0.45,
    permittedByRight: ['Single-family home', 'Duplex', 'Townhouse'],
    conditionalUses: ['Group home (small)', 'Day care'],
    prohibited: ['Apartments (3+)', 'Commercial', 'Industrial'],
  },
  {
    code: 'R-3',
    name: 'Multi-Family Residential',
    category: 'residential',
    summary: 'Medium-density multi-family housing near community centers.',
    minLotSqft: 3500,
    maxHeightFt: 40,
    maxDensityPerAcre: 18,
    maxFAR: 0.8,
    permittedByRight: ['Apartment', 'Condominium', 'Townhouse', 'Duplex'],
    conditionalUses: ['Senior housing', 'Assisted living', 'Group home'],
    prohibited: ['Commercial retail', 'Industrial'],
  },
  {
    code: 'MH',
    name: 'Mobile Home / Manufactured Housing',
    category: 'residential',
    summary: 'Manufactured / mobile home community district.',
    minLotSqft: 3500,
    maxHeightFt: 25,
    maxDensityPerAcre: 10,
    maxFAR: 0.35,
    permittedByRight: ['Manufactured home', 'Park office', 'Community recreational facilities'],
    conditionalUses: ['Accessory commercial uses'],
    prohibited: ['Site-built homes (standalone)', 'General commercial', 'Industrial'],
  },
  {
    code: 'B-1',
    name: 'Neighborhood Commercial',
    category: 'commercial',
    summary: 'Small-scale neighborhood retail, services, and offices in community centers.',
    minLotSqft: 5000,
    maxHeightFt: 35,
    maxDensityPerAcre: null,
    maxFAR: 0.7,
    permittedByRight: ['Retail store', 'Restaurant', 'Personal services', 'Professional office', 'Bank'],
    conditionalUses: ['Drive-through', 'Auto services', 'Gas station'],
    prohibited: ['Heavy industrial', 'Residential (standalone)'],
  },
  {
    code: 'B-2',
    name: 'Community Commercial',
    category: 'commercial',
    summary: 'General commercial uses serving community and highway travelers.',
    minLotSqft: 10000,
    maxHeightFt: 45,
    maxDensityPerAcre: null,
    maxFAR: 1.0,
    permittedByRight: ['Retail', 'Restaurant', 'Hotel/motel', 'Entertainment', 'Auto dealership', 'Office'],
    conditionalUses: ['Drive-through', 'Gas station', 'Car wash', 'Outdoor display/storage'],
    prohibited: ['Heavy manufacturing', 'Residential (standalone)'],
  },
  {
    code: 'B-3',
    name: 'Highway Commercial',
    category: 'commercial',
    summary: 'Auto-oriented commercial along US-85, US-34, and I-25/I-76 corridors.',
    minLotSqft: 15000,
    maxHeightFt: 50,
    maxDensityPerAcre: null,
    maxFAR: 1.5,
    permittedByRight: ['Auto dealership', 'Hotel/motel', 'Restaurant', 'Large retail', 'Entertainment complex'],
    conditionalUses: ['Truck stop', 'RV park', 'Agricultural supply store', 'Outdoor sales lot'],
    prohibited: ['Residential', 'Heavy industrial'],
  },
  {
    code: 'I-1',
    name: 'Light Industrial',
    category: 'industrial',
    summary: 'Light manufacturing, warehousing, oil field services, and flex industrial.',
    minLotSqft: 10000,
    maxHeightFt: 50,
    maxDensityPerAcre: null,
    maxFAR: 1.0,
    permittedByRight: ['Light manufacturing', 'Warehouse', 'Distribution', 'Oil field services', 'Research and development'],
    conditionalUses: ['Truck terminal', 'Outdoor storage (screened)', 'Ancillary retail'],
    prohibited: ['Residential', 'Heavy noxious industry'],
  },
  {
    code: 'I-2',
    name: 'Heavy Industrial',
    category: 'industrial',
    summary: 'Heavy manufacturing, feedlot processing, energy production, and large industrial.',
    minLotSqft: 20000,
    maxHeightFt: 60,
    maxDensityPerAcre: null,
    maxFAR: 1.5,
    permittedByRight: ['Heavy manufacturing', 'Processing plant', 'Trucking terminal', 'Energy facility', 'Outdoor storage', 'Utility infrastructure'],
    conditionalUses: ['Concrete/asphalt plant', 'Recycling facility', 'Hazardous materials storage', 'Feedlot operations'],
    prohibited: ['Residential', 'Schools', 'Child care'],
    notes: 'Oil and gas extraction follows state COGCC rules in addition to county standards.',
  },
  {
    code: 'I-3',
    name: 'Oil and Gas Extraction',
    category: 'industrial',
    summary: 'Oil and gas production and related surface operations.',
    minLotSqft: 0,
    maxHeightFt: 0,
    maxDensityPerAcre: null,
    maxFAR: 0,
    permittedByRight: ['Oil well pad', 'Natural gas facility', 'Pipeline equipment'],
    conditionalUses: ['Compression station', 'Processing facility'],
    prohibited: ['Residential', 'Schools'],
    notes: 'Subject to COGCC (Colorado Oil and Gas Conservation Commission) regulations in addition to Weld County ordinances.',
  },
  {
    code: 'PUD',
    name: 'Planned Unit Development',
    category: 'overlay',
    summary: 'Master-planned development with site-specific standards approved by Weld County.',
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

const _byCode = new Map(WELD_ZONES.map(z => [z.code.toUpperCase(), z]));

export function getWeldZoneDistrict(code: string): WeldZoneDistrict | null {
  return _byCode.get(code?.toUpperCase()?.trim()) ?? null;
}

export const WELD_CATEGORY_LABELS: Record<WeldZoneDistrict['category'], string> = {
  residential: 'Residential',
  'mixed-use': 'Mixed Use',
  commercial: 'Commercial',
  industrial: 'Industrial',
  agricultural: 'Agricultural',
  'open-space': 'Open Space / Parks',
  overlay: 'Planned / Overlay',
};
