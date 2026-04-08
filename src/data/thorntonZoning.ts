/**
 * Thornton Zoning Code — Zone District Rules
 * Based on the City of Thornton Land Development Code.
 * Source: maps.thorntonco.gov/citydevweb/rest/services/Zoning/MapServer
 */

export interface ThorntonZoneDistrict {
  code: string;
  name: string;
  category: 'residential' | 'mixed-use' | 'commercial' | 'industrial' | 'open-space' | 'overlay';
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

const THORNTON_ZONES: ThorntonZoneDistrict[] = [
  {
    code: 'R-1',
    name: 'Single-Family Residential',
    category: 'residential',
    summary: 'Low-density single-family detached residential on standard lots.',
    minLotSqft: 7000,
    maxHeightFt: 35,
    maxDensityPerAcre: 6,
    maxFAR: 0.45,
    permittedByRight: ['Single-family detached home', 'Accessory structure', 'Home occupation'],
    conditionalUses: ['ADU', 'Religious institution', 'School', 'Child care (small)'],
    prohibited: ['Multi-family', 'Commercial retail', 'Industrial'],
  },
  {
    code: 'R-2',
    name: 'Single-Family Residential — Small Lot',
    category: 'residential',
    summary: 'Single-family residential on smaller lots.',
    minLotSqft: 5000,
    maxHeightFt: 35,
    maxDensityPerAcre: 8,
    maxFAR: 0.5,
    permittedByRight: ['Single-family detached home', 'Accessory structure', 'Home occupation'],
    conditionalUses: ['Duplex', 'Religious institution'],
    prohibited: ['Apartments (3+)', 'Commercial', 'Industrial'],
  },
  {
    code: 'R-3',
    name: 'Two-Family / Duplex Residential',
    category: 'residential',
    summary: 'Single-family and two-family duplex development.',
    minLotSqft: 5500,
    maxHeightFt: 35,
    maxDensityPerAcre: 12,
    maxFAR: 0.6,
    permittedByRight: ['Single-family home', 'Duplex', 'Townhouse'],
    conditionalUses: ['Small group home', 'Day care'],
    prohibited: ['Apartments (3+)', 'Commercial', 'Industrial'],
  },
  {
    code: 'R-4',
    name: 'Multi-Family Residential — Medium Density',
    category: 'residential',
    summary: 'Medium-density multi-family housing including apartments and condominiums.',
    minLotSqft: 3500,
    maxHeightFt: 45,
    maxDensityPerAcre: 20,
    maxFAR: 0.9,
    permittedByRight: ['Apartment', 'Condominium', 'Townhouse', 'Duplex'],
    conditionalUses: ['Assisted living', 'Group home', 'Senior housing'],
    prohibited: ['Commercial retail', 'Industrial'],
  },
  {
    code: 'R-5',
    name: 'Multi-Family Residential — High Density',
    category: 'residential',
    summary: 'High-density apartments and mixed residential near transit.',
    minLotSqft: 2500,
    maxHeightFt: 60,
    maxDensityPerAcre: 50,
    maxFAR: 1.5,
    permittedByRight: ['Apartment complex', 'Condominium', 'Senior housing'],
    conditionalUses: ['Live/work units', 'Limited ground-floor retail', 'Hotel'],
    prohibited: ['Industrial', 'Auto-oriented retail'],
  },
  {
    code: 'C-1',
    name: 'Neighborhood Commercial',
    category: 'commercial',
    summary: 'Small-scale neighborhood-serving retail and services.',
    minLotSqft: 5000,
    maxHeightFt: 35,
    maxDensityPerAcre: null,
    maxFAR: 0.8,
    permittedByRight: ['Retail store', 'Restaurant', 'Personal services', 'Office', 'Bank'],
    conditionalUses: ['Drive-through', 'Auto services', 'Gas station'],
    prohibited: ['Heavy industrial', 'Residential (standalone)'],
  },
  {
    code: 'C-2',
    name: 'Community Commercial',
    category: 'commercial',
    summary: 'Broader commercial uses including big-box retail and auto-oriented services.',
    minLotSqft: 10000,
    maxHeightFt: 45,
    maxDensityPerAcre: null,
    maxFAR: 1.0,
    permittedByRight: ['Retail', 'Restaurant', 'Auto dealership', 'Hotel', 'Entertainment', 'Office'],
    conditionalUses: ['Drive-through', 'Gas station', 'Outdoor display/storage', 'Car wash'],
    prohibited: ['Heavy manufacturing', 'Salvage', 'Residential (standalone)'],
  },
  {
    code: 'C-3',
    name: 'General Commercial / Highway',
    category: 'commercial',
    summary: 'Highway-oriented commercial uses along major arterials.',
    minLotSqft: 15000,
    maxHeightFt: 50,
    maxDensityPerAcre: null,
    maxFAR: 1.5,
    permittedByRight: ['Retail', 'Hotel/motel', 'Restaurant', 'Auto-related sales', 'Entertainment complex'],
    conditionalUses: ['Truck stop', 'RV park', 'Outdoor sales lot'],
    prohibited: ['Residential', 'Heavy industrial'],
  },
  {
    code: 'I-1',
    name: 'Light Industrial',
    category: 'industrial',
    summary: 'Light manufacturing, warehousing, and flex industrial.',
    minLotSqft: 10000,
    maxHeightFt: 50,
    maxDensityPerAcre: null,
    maxFAR: 1.0,
    permittedByRight: ['Light manufacturing', 'Warehouse', 'Research and development', 'Flex industrial'],
    conditionalUses: ['Truck terminal', 'Outdoor storage (screened)', 'Retail ancillary to manufacturing'],
    prohibited: ['Residential', 'Heavy industry with noxious emissions'],
  },
  {
    code: 'I-2',
    name: 'Heavy Industrial',
    category: 'industrial',
    summary: 'Heavy manufacturing, processing plants, and large-scale industrial.',
    minLotSqft: 20000,
    maxHeightFt: 60,
    maxDensityPerAcre: null,
    maxFAR: 1.5,
    permittedByRight: ['Heavy manufacturing', 'Processing plant', 'Trucking terminal', 'Outdoor storage', 'Utility facility'],
    conditionalUses: ['Concrete/asphalt plant', 'Recycling facility', 'Hazardous materials storage'],
    prohibited: ['Residential', 'Schools', 'Child care'],
  },
  {
    code: 'PUD',
    name: 'Planned Unit Development',
    category: 'overlay',
    summary: 'Custom master-planned development with site-specific standards.',
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
    code: 'O-1',
    name: 'Office',
    category: 'commercial',
    summary: 'Professional office, medical, and administrative uses.',
    minLotSqft: 7500,
    maxHeightFt: 45,
    maxDensityPerAcre: null,
    maxFAR: 1.0,
    permittedByRight: ['Professional office', 'Medical clinic', 'Financial services', 'Government office'],
    conditionalUses: ['Hotel', 'Child care center', 'Ancillary retail'],
    prohibited: ['Heavy retail', 'Industrial', 'Residential (standalone)'],
  },
];

const _byCode = new Map(THORNTON_ZONES.map(z => [z.code.toUpperCase(), z]));

export function getThorntonZoneDistrict(code: string): ThorntonZoneDistrict | null {
  return _byCode.get(code?.toUpperCase()?.trim()) ?? null;
}

export const THORNTON_CATEGORY_LABELS: Record<ThorntonZoneDistrict['category'], string> = {
  residential: 'Residential',
  'mixed-use': 'Mixed Use',
  commercial: 'Commercial',
  industrial: 'Industrial',
  'open-space': 'Open Space / Parks',
  overlay: 'Planned / Overlay',
};
