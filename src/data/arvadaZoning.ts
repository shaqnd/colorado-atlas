/**
 * Arvada Zoning Code — Zone District Rules
 * Based on the City of Arvada Land Development Code.
 * Source: maps.arvada.org/arcgis/rest/services/Planning/Zoning/MapServer
 */

export interface ArvadaZoneDistrict {
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

const ARVADA_ZONES: ArvadaZoneDistrict[] = [
  {
    code: 'R-1',
    name: 'Single-Family Residential',
    category: 'residential',
    summary: 'Standard single-family detached residential on minimum 7,000 sq ft lots.',
    minLotSqft: 7000,
    maxHeightFt: 35,
    maxDensityPerAcre: 6,
    maxFAR: 0.45,
    permittedByRight: ['Single-family detached home', 'Accessory structure', 'Home occupation', 'Community garden'],
    conditionalUses: ['Accessory dwelling unit', 'Religious institution', 'School', 'Child care (small)'],
    prohibited: ['Multi-family', 'Commercial retail', 'Industrial'],
  },
  {
    code: 'R-1A',
    name: 'Single-Family Residential — Small Lot',
    category: 'residential',
    summary: 'Single-family residential on smaller lots; common in older neighborhoods.',
    minLotSqft: 5000,
    maxHeightFt: 35,
    maxDensityPerAcre: 8,
    maxFAR: 0.5,
    permittedByRight: ['Single-family detached home', 'Accessory structure', 'Home occupation'],
    conditionalUses: ['Duplex', 'Religious institution', 'Day care'],
    prohibited: ['Multi-family (3+)', 'Commercial retail', 'Industrial'],
  },
  {
    code: 'R-2',
    name: 'Two-Family Residential',
    category: 'residential',
    summary: 'Single-family and duplex development.',
    minLotSqft: 5500,
    maxHeightFt: 35,
    maxDensityPerAcre: 12,
    maxFAR: 0.6,
    permittedByRight: ['Single-family home', 'Two-family duplex', 'Accessory dwelling unit'],
    conditionalUses: ['Townhouse', 'Religious institution'],
    prohibited: ['Apartments (3+)', 'Commercial', 'Industrial'],
  },
  {
    code: 'R-3',
    name: 'Multi-Family Residential',
    category: 'residential',
    summary: 'Medium- to high-density multi-family housing including apartments.',
    minLotSqft: 3000,
    maxHeightFt: 45,
    maxDensityPerAcre: 25,
    maxFAR: 1.0,
    permittedByRight: ['Apartment', 'Condominium', 'Townhouse', 'Duplex', 'Single-family home'],
    conditionalUses: ['Assisted living', 'Senior housing', 'Live/work units'],
    prohibited: ['Commercial retail', 'Industrial'],
  },
  {
    code: 'C-1',
    name: 'Neighborhood Commercial',
    category: 'commercial',
    summary: 'Small-scale neighborhood retail and services.',
    minLotSqft: 5000,
    maxHeightFt: 35,
    maxDensityPerAcre: null,
    maxFAR: 0.8,
    permittedByRight: ['Retail store', 'Restaurant', 'Personal services', 'Office', 'Bank'],
    conditionalUses: ['Drive-through', 'Auto services', 'Car wash'],
    prohibited: ['Heavy industrial', 'Residential (standalone)'],
  },
  {
    code: 'C-2',
    name: 'General Commercial',
    category: 'commercial',
    summary: 'Wide range of retail, service, and office uses on arterial corridors.',
    minLotSqft: 7500,
    maxHeightFt: 45,
    maxDensityPerAcre: null,
    maxFAR: 1.5,
    permittedByRight: ['Retail', 'Restaurant', 'Hotel', 'Office', 'Auto dealership', 'Entertainment'],
    conditionalUses: ['Drive-through', 'Gas station', 'Outdoor display/storage'],
    prohibited: ['Heavy manufacturing', 'Salvage yard'],
  },
  {
    code: 'M-1',
    name: 'Light Industrial',
    category: 'industrial',
    summary: 'Light manufacturing, assembly, warehousing, and flex office.',
    minLotSqft: 10000,
    maxHeightFt: 50,
    maxDensityPerAcre: null,
    maxFAR: 1.0,
    permittedByRight: ['Light manufacturing', 'Warehouse', 'Research and development', 'Printing', 'Flex industrial'],
    conditionalUses: ['Truck terminal', 'Outdoor storage (screened)', 'Contractor yard'],
    prohibited: ['Residential', 'Heavy industry', 'Salvage'],
  },
  {
    code: 'M-2',
    name: 'Heavy Industrial',
    category: 'industrial',
    summary: 'Heavy manufacturing, processing plants, and large-scale industrial.',
    minLotSqft: 20000,
    maxHeightFt: 60,
    maxDensityPerAcre: null,
    maxFAR: 1.5,
    permittedByRight: ['Heavy manufacturing', 'Processing plant', 'Trucking terminal', 'Outdoor storage', 'Utility plant'],
    conditionalUses: ['Concrete/asphalt plant', 'Recycling facility', 'Hazardous materials storage'],
    prohibited: ['Residential', 'Schools', 'Child care'],
  },
  {
    code: 'PD',
    name: 'Planned Development',
    category: 'overlay',
    summary: 'Custom zoning with site-specific standards per approved PD plan.',
    minLotSqft: 0,
    maxHeightFt: 0,
    maxDensityPerAcre: null,
    maxFAR: 0,
    permittedByRight: ['Per approved PD plan'],
    conditionalUses: ['Per approved PD plan'],
    prohibited: ['Any use not listed in PD plan'],
    notes: 'Refer to the specific Planned Development ordinance for applicable standards.',
  },
  {
    code: 'O-A',
    name: 'Office / Agricultural',
    category: 'commercial',
    summary: 'Office uses and light agricultural / transitional districts.',
    minLotSqft: 10000,
    maxHeightFt: 35,
    maxDensityPerAcre: null,
    maxFAR: 0.5,
    permittedByRight: ['Office', 'Agricultural use', 'Greenhouse', 'Research facility'],
    conditionalUses: ['Limited retail ancillary to office', 'Light warehouse'],
    prohibited: ['Heavy industrial', 'High-density residential'],
  },
];

const _byCode = new Map(ARVADA_ZONES.map(z => [z.code.toUpperCase(), z]));

export function getArvadaZoneDistrict(code: string): ArvadaZoneDistrict | null {
  return _byCode.get(code?.toUpperCase()?.trim()) ?? null;
}

export const ARVADA_CATEGORY_LABELS: Record<ArvadaZoneDistrict['category'], string> = {
  residential: 'Residential',
  'mixed-use': 'Mixed Use',
  commercial: 'Commercial',
  industrial: 'Industrial',
  'open-space': 'Open Space / Parks',
  overlay: 'Planned / Overlay',
};
