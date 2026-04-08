/**
 * Lakewood Zoning Code — Zone District Rules
 * Based on the City of Lakewood Zoning Ordinance (Chapter 17).
 * Source: egis.lakewood.org/server/rest/services/PL/Zoning/MapServer
 */

export interface LakewoodZoneDistrict {
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

const LAKEWOOD_ZONES: LakewoodZoneDistrict[] = [
  {
    code: 'R-1',
    name: 'Single-Family Residential',
    category: 'residential',
    summary: 'Low-density single-family detached residential neighborhood.',
    minLotSqft: 7000,
    maxHeightFt: 35,
    maxDensityPerAcre: 6,
    maxFAR: 0.5,
    permittedByRight: ['Single-family detached home', 'Accessory dwelling unit', 'Home occupation', 'Park / open space'],
    conditionalUses: ['Religious institution', 'School', 'Child care center'],
    prohibited: ['Multi-family', 'Commercial retail', 'Industrial'],
  },
  {
    code: 'R-2',
    name: 'Low-Medium Density Residential',
    category: 'residential',
    summary: 'Allows single-family and duplex units.',
    minLotSqft: 5000,
    maxHeightFt: 35,
    maxDensityPerAcre: 12,
    maxFAR: 0.6,
    permittedByRight: ['Single-family home', 'Two-family/duplex', 'Accessory dwelling unit'],
    conditionalUses: ['Townhouse', 'Boarding house', 'Religious institution'],
    prohibited: ['Multi-family 3+ units without CU', 'Heavy commercial', 'Industrial'],
  },
  {
    code: 'R-3',
    name: 'Medium Density Residential',
    category: 'residential',
    summary: 'Allows multi-family residential including apartments and townhomes.',
    minLotSqft: 3500,
    maxHeightFt: 45,
    maxDensityPerAcre: 24,
    maxFAR: 0.9,
    permittedByRight: ['Multi-family residential', 'Townhouse', 'Duplex', 'Single-family home'],
    conditionalUses: ['Assisted living', 'Group home', 'Religious institution'],
    prohibited: ['Commercial retail', 'Industrial'],
  },
  {
    code: 'R-4',
    name: 'High Density Residential',
    category: 'residential',
    summary: 'High-density apartments and condominiums near transit corridors.',
    minLotSqft: 2500,
    maxHeightFt: 60,
    maxDensityPerAcre: 50,
    maxFAR: 1.5,
    permittedByRight: ['Apartment complex', 'Condominium', 'Multi-family residential'],
    conditionalUses: ['Senior housing', 'Live/work units', 'Limited retail on ground floor'],
    prohibited: ['Industrial', 'Auto-oriented retail'],
  },
  {
    code: 'NMU',
    name: 'Neighborhood Mixed Use',
    category: 'mixed-use',
    summary: 'Small-scale neighborhood retail, services, and residential mix.',
    minLotSqft: 3000,
    maxHeightFt: 40,
    maxDensityPerAcre: 20,
    maxFAR: 1.0,
    permittedByRight: ['Neighborhood retail', 'Restaurant', 'Multi-family residential', 'Personal services'],
    conditionalUses: ['Drive-through (limited)', 'Auto service', 'Live/work'],
    prohibited: ['Heavy industrial', 'Warehousing'],
  },
  {
    code: 'CMU',
    name: 'Corridor Mixed Use',
    category: 'mixed-use',
    summary: 'Medium-intensity commercial and residential along major corridors.',
    minLotSqft: 5000,
    maxHeightFt: 55,
    maxDensityPerAcre: 40,
    maxFAR: 2.0,
    permittedByRight: ['Retail', 'Office', 'Restaurant', 'Multi-family', 'Hotel'],
    conditionalUses: ['Drive-through', 'Car wash', 'Brewery/taproom'],
    prohibited: ['Industrial', 'Outside storage'],
  },
  {
    code: 'MU',
    name: 'Mixed Use',
    category: 'mixed-use',
    summary: 'General mixed-use development combining commercial and residential.',
    minLotSqft: 5000,
    maxHeightFt: 65,
    maxDensityPerAcre: null,
    maxFAR: 2.5,
    permittedByRight: ['Office', 'Retail', 'Residential', 'Hotel', 'Entertainment venue'],
    conditionalUses: ['Auto dealership', 'Gas station', 'Brewery'],
    prohibited: ['Heavy manufacturing', 'Salvage yard'],
  },
  {
    code: 'I-1',
    name: 'Light Industrial',
    category: 'industrial',
    summary: 'Light manufacturing, warehousing, and business services.',
    minLotSqft: 10000,
    maxHeightFt: 50,
    maxDensityPerAcre: null,
    maxFAR: 1.0,
    permittedByRight: ['Light manufacturing', 'Warehouse', 'Flex office/industrial', 'Research and development'],
    conditionalUses: ['Truck terminal', 'Outdoor storage', 'Retail sales ancillary to manufacturing'],
    prohibited: ['Residential', 'Heavy industry with noxious emissions'],
  },
  {
    code: 'I-2',
    name: 'General Industrial',
    category: 'industrial',
    summary: 'Heavy manufacturing, processing, and large-scale industrial operations.',
    minLotSqft: 20000,
    maxHeightFt: 60,
    maxDensityPerAcre: null,
    maxFAR: 1.5,
    permittedByRight: ['Heavy manufacturing', 'Processing plant', 'Truck terminal', 'Outdoor storage', 'Utility facility'],
    conditionalUses: ['Concrete/asphalt plant', 'Salvage operations', 'Hazardous material storage'],
    prohibited: ['Residential', 'Schools', 'Child care'],
  },
  {
    code: 'PD',
    name: 'Planned Development',
    category: 'overlay',
    summary: 'Custom development with negotiated standards. Refer to specific PD ordinance.',
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
    code: 'OS',
    name: 'Open Space',
    category: 'open-space',
    summary: 'Parks, recreation, natural areas, and greenways.',
    minLotSqft: 0,
    maxHeightFt: 25,
    maxDensityPerAcre: 0,
    maxFAR: 0,
    permittedByRight: ['Park and recreation', 'Trail', 'Natural area preservation', 'Community garden'],
    conditionalUses: ['Recreational facility', 'Amphitheater', 'Parking for park'],
    prohibited: ['Residential', 'Commercial', 'Industrial'],
  },
];

const _byCode = new Map(LAKEWOOD_ZONES.map(z => [z.code.toUpperCase(), z]));

export function getLakewoodZoneDistrict(code: string): LakewoodZoneDistrict | null {
  return _byCode.get(code?.toUpperCase()?.trim()) ?? null;
}

export const LAKEWOOD_CATEGORY_LABELS: Record<LakewoodZoneDistrict['category'], string> = {
  residential: 'Residential',
  'mixed-use': 'Mixed Use',
  commercial: 'Commercial',
  industrial: 'Industrial',
  'open-space': 'Open Space / Parks',
  overlay: 'Planned / Overlay',
};
