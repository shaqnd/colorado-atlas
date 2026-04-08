/**
 * Littleton Zoning Code — Zone District Rules
 * Based on the City of Littleton Unified Land Use Code (ULUC).
 * Source: ltngiswa.littletonco.gov/server/rest/services/City/LittletonParcelZoning/MapServer (layer 2)
 */

export interface LittletonZoneDistrict {
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

const LITTLETON_ZONES: LittletonZoneDistrict[] = [
  {
    code: 'R-1',
    name: 'Single-Family Residential',
    category: 'residential',
    summary: 'Low-density single-family detached residential.',
    minLotSqft: 7000,
    maxHeightFt: 35,
    maxDensityPerAcre: 6,
    maxFAR: 0.45,
    permittedByRight: ['Single-family detached home', 'Accessory structure', 'Home occupation', 'Community garden'],
    conditionalUses: ['ADU', 'Religious institution', 'School', 'Child care (small)'],
    prohibited: ['Multi-family', 'Commercial retail', 'Industrial'],
  },
  {
    code: 'R-2',
    name: 'Single-Family Residential — Small Lot',
    category: 'residential',
    summary: 'Single-family residential on smaller lots, typical of established neighborhoods.',
    minLotSqft: 5000,
    maxHeightFt: 35,
    maxDensityPerAcre: 8,
    maxFAR: 0.5,
    permittedByRight: ['Single-family detached home', 'Accessory structure', 'Home occupation'],
    conditionalUses: ['Two-family duplex', 'Religious institution'],
    prohibited: ['Apartments (3+)', 'Commercial', 'Industrial'],
  },
  {
    code: 'R-3',
    name: 'Multi-Family Residential',
    category: 'residential',
    summary: 'Medium-density multi-family residential.',
    minLotSqft: 3500,
    maxHeightFt: 40,
    maxDensityPerAcre: 20,
    maxFAR: 0.8,
    permittedByRight: ['Apartment', 'Townhouse', 'Duplex', 'Single-family home'],
    conditionalUses: ['Assisted living', 'Group home', 'Senior housing'],
    prohibited: ['Commercial retail', 'Industrial'],
  },
  {
    code: 'MU-R',
    name: 'Mixed Use — Residential',
    category: 'mixed-use',
    summary: 'Residential-focused mixed use allowing ground-floor neighborhood services.',
    minLotSqft: 3000,
    maxHeightFt: 45,
    maxDensityPerAcre: 30,
    maxFAR: 1.5,
    permittedByRight: ['Multi-family residential', 'Live/work units', 'Neighborhood retail', 'Restaurant', 'Office'],
    conditionalUses: ['Hotel (small)', 'Child care center', 'Brewery'],
    prohibited: ['Heavy industrial', 'Auto-heavy commercial'],
  },
  {
    code: 'MU-C',
    name: 'Mixed Use — Commercial',
    category: 'mixed-use',
    summary: 'Commercial-focused mixed use along Downtown Littleton and key corridors.',
    minLotSqft: 2000,
    maxHeightFt: 55,
    maxDensityPerAcre: null,
    maxFAR: 3.0,
    permittedByRight: ['Retail', 'Restaurant', 'Office', 'Hotel', 'Entertainment', 'Multi-family above ground floor'],
    conditionalUses: ['Drive-through', 'Event venue', 'Brewery/taproom'],
    prohibited: ['Industrial', 'Outdoor storage'],
    notes: 'Applies to Downtown Littleton and major arterial corridors.',
  },
  {
    code: 'C-1',
    name: 'Neighborhood Commercial',
    category: 'commercial',
    summary: 'Small-scale neighborhood-serving retail and services.',
    minLotSqft: 5000,
    maxHeightFt: 35,
    maxDensityPerAcre: null,
    maxFAR: 0.7,
    permittedByRight: ['Retail store', 'Restaurant', 'Personal services', 'Office', 'Bank', 'Medical clinic'],
    conditionalUses: ['Drive-through', 'Auto service', 'Gas station'],
    prohibited: ['Heavy industrial', 'Residential (standalone)'],
  },
  {
    code: 'C-2',
    name: 'General Commercial',
    category: 'commercial',
    summary: 'Broad range of retail, service, and office uses.',
    minLotSqft: 10000,
    maxHeightFt: 50,
    maxDensityPerAcre: null,
    maxFAR: 1.5,
    permittedByRight: ['Retail', 'Restaurant', 'Hotel', 'Office', 'Entertainment', 'Auto dealership'],
    conditionalUses: ['Drive-through', 'Outdoor sales', 'Brewery'],
    prohibited: ['Heavy manufacturing', 'Salvage yard'],
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
    permittedByRight: ['Light manufacturing', 'Warehouse', 'Research and development', 'Printing'],
    conditionalUses: ['Truck terminal', 'Outdoor storage (screened)', 'Retail ancillary to manufacturing'],
    prohibited: ['Residential', 'Heavy industry'],
  },
  {
    code: 'I-2',
    name: 'Heavy Industrial',
    category: 'industrial',
    summary: 'Heavy manufacturing, processing, and large-scale industrial operations.',
    minLotSqft: 20000,
    maxHeightFt: 65,
    maxDensityPerAcre: null,
    maxFAR: 1.5,
    permittedByRight: ['Heavy manufacturing', 'Processing plant', 'Trucking terminal', 'Outdoor storage', 'Utility plant'],
    conditionalUses: ['Concrete/asphalt plant', 'Recycling facility'],
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
];

const _byCode = new Map(LITTLETON_ZONES.map(z => [z.code.toUpperCase(), z]));

export function getLittletonZoneDistrict(code: string): LittletonZoneDistrict | null {
  return _byCode.get(code?.toUpperCase()?.trim()) ?? null;
}

export const LITTLETON_CATEGORY_LABELS: Record<LittletonZoneDistrict['category'], string> = {
  residential: 'Residential',
  'mixed-use': 'Mixed Use',
  commercial: 'Commercial',
  industrial: 'Industrial',
  'open-space': 'Open Space / Parks',
  overlay: 'Planned / Overlay',
};
