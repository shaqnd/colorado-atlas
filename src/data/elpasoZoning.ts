/**
 * El Paso County Zoning Districts
 *
 * Based on the El Paso County Land Development Code (LDC).
 * Code values match the ZoningAreas field returned by the El Paso County
 * GIS MapServer (gisservices.elpasoco.com/arcgis2/rest/services/HubPublic/ZoningAreas/MapServer/1).
 *
 * Source: El Paso County Development Services
 * https://www.elpasoco.com/development-services/land-development-code/
 */

export interface ElPasoZoneDistrict {
  code: string;
  name: string;
  category:
    | 'residential'
    | 'mixed-use'
    | 'commercial'
    | 'industrial'
    | 'agricultural'
    | 'open-space'
    | 'overlay';
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

const ELPASO_ZONES: ElPasoZoneDistrict[] = [
  // ── Agricultural ──────────────────────────────────────────────────────────
  {
    code: 'A',
    name: 'Agricultural District',
    category: 'agricultural',
    summary: 'Large-lot rural and agricultural uses protecting farmland and ranch land in unincorporated El Paso County.',
    minLotSqft: 217800, // 5 acres
    maxHeightFt: 35,
    maxDensityPerAcre: 0.2,
    maxFAR: 0,
    permittedByRight: [
      'Single-family detached home',
      'Farming, ranching, and livestock',
      'Greenhouses and horticulture',
      'Home occupation (minor)',
      'Accessory structures',
    ],
    conditionalUses: [
      'Bed & breakfast',
      'Kennel / boarding facility',
      'Riding stable',
      'Religious institution',
      'Winery / cidery (small-scale)',
    ],
    prohibited: [
      'Multi-family residential',
      'Commercial retail',
      'Industrial uses',
      'Mobile home parks',
    ],
  },

  // ── Residential ───────────────────────────────────────────────────────────
  {
    code: 'RR',
    name: 'Rural Residential District',
    category: 'residential',
    summary: 'Large-lot residential on 2.5+ acres in rural transition areas. Common on the urban fringe of Colorado Springs.',
    minLotSqft: 108900, // 2.5 acres
    maxHeightFt: 35,
    maxDensityPerAcre: 0.4,
    maxFAR: 0,
    permittedByRight: [
      'Single-family detached home',
      'Agriculture (limited)',
      'Home occupation (minor)',
      'Accessory structures',
    ],
    conditionalUses: [
      'Duplex',
      'Group home (≤8 residents)',
      'Religious institution',
      'School',
    ],
    prohibited: [
      'Multi-family (3+ units)',
      'Commercial retail',
      'Industrial uses',
    ],
  },
  {
    code: 'RS-20000',
    name: 'Residential Suburban — 20,000 sq ft',
    category: 'residential',
    summary: 'Suburban single-family on half-acre lots in established unincorporated communities near Colorado Springs.',
    minLotSqft: 20000,
    maxHeightFt: 35,
    maxDensityPerAcre: 2,
    maxFAR: 0,
    permittedByRight: [
      'Single-family detached home',
      'Parks and open space',
      'Home occupation',
      'ADU',
      'Accessory structures',
    ],
    conditionalUses: [
      'Duplex',
      'Group home',
      'Religious institution',
    ],
    prohibited: [
      'Multi-family (3+ units)',
      'Commercial retail',
      'Industrial uses',
    ],
  },
  {
    code: 'RS-6000',
    name: 'Residential Suburban — 6,000 sq ft',
    category: 'residential',
    summary: 'Standard suburban single-family residential on 6,000 sq ft lots.',
    minLotSqft: 6000,
    maxHeightFt: 35,
    maxDensityPerAcre: 6,
    maxFAR: 0,
    permittedByRight: [
      'Single-family detached home',
      'Parks and open space',
      'Home occupation',
      'ADU',
      'Accessory structures',
    ],
    conditionalUses: [
      'Duplex (corner lots)',
      'Group home',
      'Religious institution',
      'School',
      'Child care center',
    ],
    prohibited: [
      'Multi-family (3+ units)',
      'Commercial retail',
      'Industrial uses',
    ],
  },
  {
    code: 'RMH',
    name: 'Residential Manufactured Home District',
    category: 'residential',
    summary: 'Allows manufactured / mobile homes and site-built single-family residential.',
    minLotSqft: 5000,
    maxHeightFt: 35,
    maxDensityPerAcre: 6,
    maxFAR: 0,
    permittedByRight: [
      'Manufactured / mobile home',
      'Single-family detached home',
      'Home occupation',
    ],
    conditionalUses: [
      'Mobile home park',
      'Duplex',
    ],
    prohibited: [
      'Commercial retail',
      'Industrial uses',
    ],
  },
  {
    code: 'RM',
    name: 'Residential Multi-Family District',
    category: 'residential',
    summary: 'Medium-density multi-family residential including apartments, condos, and townhomes.',
    minLotSqft: 3000,
    maxHeightFt: 45,
    maxDensityPerAcre: 18,
    maxFAR: 1.0,
    permittedByRight: [
      'Apartment building',
      'Condominium',
      'Townhome / rowhouse',
      'Senior housing',
      'Parks and open space',
    ],
    conditionalUses: [
      'Residential care facility',
      'Religious institution',
      'Child care center',
    ],
    prohibited: [
      'Commercial retail',
      'Industrial uses',
    ],
  },

  // ── Commercial ────────────────────────────────────────────────────────────
  {
    code: 'CN',
    name: 'Neighborhood Commercial District',
    category: 'commercial',
    summary: 'Small-scale neighborhood-serving commercial in unincorporated El Paso County.',
    minLotSqft: 5000,
    maxHeightFt: 35,
    maxDensityPerAcre: null,
    maxFAR: 1.0,
    permittedByRight: [
      'Retail shops and personal services',
      'Restaurant / café',
      'Professional office',
      'Medical clinic',
      'Child care center',
    ],
    conditionalUses: [
      'Drive-through facility',
      'Gas station',
    ],
    prohibited: [
      'Heavy industrial',
      'Auto sales',
      'Outdoor storage',
      'Residential (standalone)',
    ],
  },
  {
    code: 'CS',
    name: 'Service Commercial District',
    category: 'commercial',
    summary: 'General commercial along arterial corridors serving the broader unincorporated El Paso County community.',
    minLotSqft: 10000,
    maxHeightFt: 50,
    maxDensityPerAcre: null,
    maxFAR: 1.5,
    permittedByRight: [
      'Retail and commercial services',
      'Restaurant and food service',
      'Auto service and repair',
      'Hotel and motel',
      'Drive-through facilities',
      'Office and professional services',
    ],
    conditionalUses: [
      'Gas station',
      'Auto sales',
      'Entertainment venue',
    ],
    prohibited: [
      'Heavy manufacturing',
      'Residential (standalone)',
    ],
  },
  {
    code: 'CG',
    name: 'General Commercial District',
    category: 'commercial',
    summary: 'Broad commercial district allowing large-format retail, highway commercial, and mixed commercial uses.',
    minLotSqft: 10000,
    maxHeightFt: 65,
    maxDensityPerAcre: null,
    maxFAR: 2.0,
    permittedByRight: [
      'Large-format retail / big-box',
      'Restaurant and entertainment',
      'Hotel and conference center',
      'Auto sales and service',
      'Office and business park',
      'Drive-through facilities',
    ],
    conditionalUses: [
      'RV and mobile home sales',
      'Outdoor storage (screened)',
    ],
    prohibited: [
      'Heavy manufacturing',
      'Residential (standalone)',
    ],
  },

  // ── Industrial ────────────────────────────────────────────────────────────
  {
    code: 'M-1',
    name: 'Light Industrial / Manufacturing District',
    category: 'industrial',
    summary: 'Light industrial, flex, and manufacturing uses in employment centers in unincorporated El Paso County.',
    minLotSqft: 20000,
    maxHeightFt: 50,
    maxDensityPerAcre: null,
    maxFAR: 1.0,
    permittedByRight: [
      'Light manufacturing and assembly',
      'Warehouse and distribution',
      'Research and development',
      'Business park and office',
      'Contractor yard (screened)',
    ],
    conditionalUses: [
      'Truck terminal',
      'Outdoor storage',
      'Recycling facility',
    ],
    prohibited: [
      'Residential uses',
      'Heavy industrial with significant nuisance',
      'Schools and child care',
    ],
  },
  {
    code: 'M-2',
    name: 'General Industrial / Manufacturing District',
    category: 'industrial',
    summary: 'Heavy industrial and general manufacturing uses. Allows uses with greater nuisance potential.',
    minLotSqft: 20000,
    maxHeightFt: 65,
    maxDensityPerAcre: null,
    maxFAR: 1.0,
    permittedByRight: [
      'Manufacturing and processing',
      'Warehouse and distribution',
      'Truck terminal',
      'Outdoor storage',
      'Utility and public facility',
    ],
    conditionalUses: [
      'Asphalt / concrete plant',
      'Salvage and recycling',
      'Hazardous material handling',
    ],
    prohibited: [
      'Residential uses',
      'Retail (standalone)',
      'Schools and hospitals',
    ],
  },

  // ── Open Space / Overlay ──────────────────────────────────────────────────
  {
    code: 'OS',
    name: 'Open Space District',
    category: 'open-space',
    summary: 'Protected open space, parks, and natural areas in unincorporated El Paso County, including Pikes Peak area.',
    minLotSqft: 0,
    maxHeightFt: 25,
    maxDensityPerAcre: null,
    maxFAR: 0,
    permittedByRight: [
      'Public park and recreation',
      'Trail and greenway',
      'Natural area and wildlife habitat',
      'Stormwater facility',
    ],
    conditionalUses: [
      'Athletic complex',
      'Golf course',
      'Equestrian facility',
    ],
    prohibited: [
      'Residential development',
      'Commercial and retail',
      'Industrial uses',
    ],
  },
  {
    code: 'PD',
    name: 'Planned Development',
    category: 'mixed-use',
    summary: 'Flexible planned development district with uses and standards established by approved PD plan.',
    minLotSqft: 0,
    maxHeightFt: 0,
    maxDensityPerAcre: null,
    maxFAR: 0,
    permittedByRight: ['Per approved PD plan'],
    conditionalUses: [],
    prohibited: [],
    notes: 'Consult El Paso County Development Services for specific PD regulations.',
  },
];

const ELPASO_ZONE_MAP = new Map(ELPASO_ZONES.map(z => [z.code, z]));

export function getElPasoZoneDistrict(zoneCode: string): ElPasoZoneDistrict | null {
  return ELPASO_ZONE_MAP.get(zoneCode.trim()) ?? null;
}

export const ELPASO_CATEGORY_LABELS: Record<ElPasoZoneDistrict['category'], string> = {
  'residential':  'Residential',
  'mixed-use':    'Mixed-Use / PD',
  'commercial':   'Commercial',
  'industrial':   'Industrial / Manufacturing',
  'agricultural': 'Agricultural',
  'open-space':   'Parks & Open Space',
  'overlay':      'Overlay Zone',
};
