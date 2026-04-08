/**
 * Broomfield City & County Zoning Code
 * Based on the Broomfield Land Use & Development Code.
 * Source: services1.arcgis.com/vXSRPZbyyOmH9pek/arcgis/rest/services/Zoning/FeatureServer (layer 0, ZONING field)
 * Note: Broomfield is a combined city/county — zoning applies citywide.
 */

export interface BroomfieldZoneDistrict {
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

const BROOMFIELD_ZONES: BroomfieldZoneDistrict[] = [
  {
    code: 'A-1',
    name: 'Agricultural',
    category: 'agricultural',
    summary: 'Agricultural holding zone for rural parcels awaiting urban development.',
    minLotSqft: 217800, // 5 acres
    maxHeightFt: 35,
    maxDensityPerAcre: 0.2,
    maxFAR: 0.1,
    permittedByRight: ['Single-family home', 'Farm / ranch use', 'Accessory structures'],
    conditionalUses: ['Riding stable', 'Greenhouse / nursery'],
    prohibited: ['Multi-family', 'Commercial', 'Industrial'],
  },
  {
    code: 'R-1',
    name: 'Single-Family Residential',
    category: 'residential',
    summary: 'Large-lot single-family residential; standard suburban neighborhoods.',
    minLotSqft: 8000,
    maxHeightFt: 35,
    maxDensityPerAcre: 5,
    maxFAR: 0.4,
    permittedByRight: ['Single-family detached home', 'Accessory structure', 'Home occupation'],
    conditionalUses: ['ADU', 'Religious institution', 'School', 'Child care (small)'],
    prohibited: ['Duplex', 'Multi-family', 'Commercial', 'Industrial'],
  },
  {
    code: 'R-1A',
    name: 'Single-Family Residential — Small Lot',
    category: 'residential',
    summary: 'Single-family residential on reduced lot sizes.',
    minLotSqft: 6000,
    maxHeightFt: 35,
    maxDensityPerAcre: 7,
    maxFAR: 0.45,
    permittedByRight: ['Single-family detached home', 'Accessory structure', 'Home occupation'],
    conditionalUses: ['ADU', 'Religious institution'],
    prohibited: ['Duplex', 'Multi-family', 'Commercial', 'Industrial'],
  },
  {
    code: 'R-2',
    name: 'Two-Family Residential',
    category: 'residential',
    summary: 'Single-family and duplex residential.',
    minLotSqft: 5500,
    maxHeightFt: 35,
    maxDensityPerAcre: 10,
    maxFAR: 0.5,
    permittedByRight: ['Single-family home', 'Duplex', 'Attached townhouse'],
    conditionalUses: ['Group home (small)', 'Day care'],
    prohibited: ['Apartments (3+)', 'Commercial', 'Industrial'],
  },
  {
    code: 'R-3',
    name: 'Multi-Family Residential — Low Density',
    category: 'residential',
    summary: 'Low-density multi-family housing including townhomes and small apartment buildings.',
    minLotSqft: 4000,
    maxHeightFt: 40,
    maxDensityPerAcre: 15,
    maxFAR: 0.7,
    permittedByRight: ['Apartment (up to 8 units)', 'Townhouse', 'Condominium', 'Duplex'],
    conditionalUses: ['Assisted living', 'Senior housing'],
    prohibited: ['Commercial retail', 'Industrial'],
  },
  {
    code: 'R-4',
    name: 'Multi-Family Residential — Medium Density',
    category: 'residential',
    summary: 'Medium-density apartments and condominiums near transit or commercial corridors.',
    minLotSqft: 3000,
    maxHeightFt: 50,
    maxDensityPerAcre: 25,
    maxFAR: 1.0,
    permittedByRight: ['Apartment complex', 'Condominium', 'Senior housing'],
    conditionalUses: ['Live/work units', 'Limited retail', 'Hotel'],
    prohibited: ['Industrial', 'Auto-oriented uses'],
  },
  {
    code: 'R-MF',
    name: 'Multi-Family Residential — High Density',
    category: 'residential',
    summary: 'High-density residential near transit corridors and mixed-use centers.',
    minLotSqft: 2000,
    maxHeightFt: 65,
    maxDensityPerAcre: 50,
    maxFAR: 2.0,
    permittedByRight: ['Apartment complex', 'Condominium', 'Senior/assisted living'],
    conditionalUses: ['Live/work units', 'Ground-floor retail', 'Hotel'],
    prohibited: ['Industrial', 'Heavy commercial'],
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
    conditionalUses: ['Drive-through', 'Auto services', 'Gas station'],
    prohibited: ['Heavy industrial', 'Residential (standalone)'],
  },
  {
    code: 'C-2',
    name: 'Community / Regional Commercial',
    category: 'commercial',
    summary: 'Larger-scale retail, auto-oriented uses, and entertainment.',
    minLotSqft: 10000,
    maxHeightFt: 50,
    maxDensityPerAcre: null,
    maxFAR: 1.2,
    permittedByRight: ['Retail', 'Restaurant', 'Hotel', 'Entertainment', 'Auto dealership', 'Office'],
    conditionalUses: ['Drive-through', 'Gas station', 'Car wash', 'Outdoor display'],
    prohibited: ['Heavy manufacturing', 'Residential (standalone)'],
  },
  {
    code: 'MXD',
    name: 'Mixed-Use Development',
    category: 'mixed-use',
    summary: 'Integrated mix of residential, retail, office, and civic uses in walkable settings.',
    minLotSqft: 5000,
    maxHeightFt: 65,
    maxDensityPerAcre: 40,
    maxFAR: 2.0,
    permittedByRight: ['Multi-family residential', 'Retail', 'Office', 'Restaurant', 'Hotel', 'Civic use'],
    conditionalUses: ['Live/work units', 'Entertainment', 'Drive-through (limited)'],
    prohibited: ['Heavy industrial', 'Auto-oriented (standalone)'],
  },
  {
    code: 'I-1',
    name: 'Light Industrial',
    category: 'industrial',
    summary: 'Light manufacturing, warehousing, flex industrial, and R&D.',
    minLotSqft: 10000,
    maxHeightFt: 50,
    maxDensityPerAcre: null,
    maxFAR: 1.0,
    permittedByRight: ['Light manufacturing', 'Warehouse', 'Research and development', 'Flex industrial', 'Distribution'],
    conditionalUses: ['Truck terminal', 'Outdoor storage (screened)', 'Ancillary retail'],
    prohibited: ['Residential', 'Heavy noxious industry'],
  },
  {
    code: 'I-2',
    name: 'Heavy Industrial',
    category: 'industrial',
    summary: 'Heavy manufacturing, processing, and large industrial operations.',
    minLotSqft: 20000,
    maxHeightFt: 60,
    maxDensityPerAcre: null,
    maxFAR: 1.5,
    permittedByRight: ['Heavy manufacturing', 'Processing plant', 'Trucking terminal', 'Outdoor storage', 'Utility facility'],
    conditionalUses: ['Concrete/asphalt plant', 'Recycling facility', 'Hazardous materials storage'],
    prohibited: ['Residential', 'Schools', 'Child care'],
  },
  {
    code: 'PD',
    name: 'Planned Development',
    category: 'overlay',
    summary: 'Master-planned development with site-specific standards negotiated with the City/County.',
    minLotSqft: 0,
    maxHeightFt: 0,
    maxDensityPerAcre: null,
    maxFAR: 0,
    permittedByRight: ['Per approved PD plan'],
    conditionalUses: ['Per approved PD plan'],
    prohibited: ['Any use not listed in PD plan'],
    notes: 'Refer to the specific Planned Development plan document for applicable standards.',
  },
  {
    code: 'OS',
    name: 'Open Space',
    category: 'open-space',
    summary: 'Public and private open space, parks, trails, and natural areas.',
    minLotSqft: 0,
    maxHeightFt: 25,
    maxDensityPerAcre: null,
    maxFAR: 0.05,
    permittedByRight: ['Park', 'Trail', 'Natural open space', 'Community garden'],
    conditionalUses: ['Recreational facility', 'Golf course', 'Amphitheater'],
    prohibited: ['Residential', 'Commercial', 'Industrial'],
  },
];

const _byCode = new Map(BROOMFIELD_ZONES.map(z => [z.code.toUpperCase(), z]));

export function getBroomfieldZoneDistrict(code: string): BroomfieldZoneDistrict | null {
  return _byCode.get(code?.toUpperCase()?.trim()) ?? null;
}

export const BROOMFIELD_CATEGORY_LABELS: Record<BroomfieldZoneDistrict['category'], string> = {
  residential: 'Residential',
  'mixed-use': 'Mixed Use',
  commercial: 'Commercial',
  industrial: 'Industrial',
  agricultural: 'Agricultural',
  'open-space': 'Open Space / Parks',
  overlay: 'Planned / Overlay',
};
