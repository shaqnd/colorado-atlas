/**
 * Arapahoe County Zoning Code — Unincorporated County Only
 * Based on the Arapahoe County Land Development Code.
 * Source: gis.arapahoegov.com/arcgis/rest/services/ArapaMAP/MapServer (layer 352, ZONING field)
 * Note: Covers unincorporated county parcels only — incorporated cities use their own zoning.
 */

export interface ArapahoeZoneDistrict {
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

const ARAPAHOE_ZONES: ArapahoeZoneDistrict[] = [
  {
    code: 'A-1',
    name: 'Agricultural',
    category: 'agricultural',
    summary: 'Large-lot agricultural district; primary use is farming, ranching, and rural open land.',
    minLotSqft: 217800, // 5 acres
    maxHeightFt: 35,
    maxDensityPerAcre: 0.2,
    maxFAR: 0.1,
    permittedByRight: ['Single-family home', 'Farm / ranch', 'Equestrian use', 'Accessory structures', 'Nursery / greenhouse'],
    conditionalUses: ['Bed and breakfast', 'Church / place of worship', 'Kennel', 'Riding stable', 'Agricultural processing'],
    prohibited: ['Multi-family', 'Commercial retail', 'Industrial', 'Subdivision lots < 5 acres'],
  },
  {
    code: 'A-2',
    name: 'Agricultural — Transitional',
    category: 'agricultural',
    summary: 'Transitional agricultural zone allowing limited rural residential on smaller parcels.',
    minLotSqft: 87120, // 2 acres
    maxHeightFt: 35,
    maxDensityPerAcre: 0.5,
    maxFAR: 0.15,
    permittedByRight: ['Single-family home', 'Farm use', 'Accessory structure'],
    conditionalUses: ['Church', 'School', 'Kennel', 'Agricultural tourism'],
    prohibited: ['Multi-family', 'Commercial', 'Industrial'],
  },
  {
    code: 'UR',
    name: 'Urban Reserve',
    category: 'residential',
    summary: 'Low-density holding zone for land anticipated for future urban development.',
    minLotSqft: 43560, // 1 acre
    maxHeightFt: 35,
    maxDensityPerAcre: 1,
    maxFAR: 0.1,
    permittedByRight: ['Single-family home', 'Agricultural use'],
    conditionalUses: ['Church', 'School'],
    prohibited: ['Commercial', 'Multi-family', 'Industrial'],
    notes: 'Typically rezoned to a specific district at time of development.',
  },
  {
    code: 'R-1',
    name: 'Single-Family Residential',
    category: 'residential',
    summary: 'Standard single-family residential district for suburban neighborhoods.',
    minLotSqft: 7500,
    maxHeightFt: 35,
    maxDensityPerAcre: 5,
    maxFAR: 0.4,
    permittedByRight: ['Single-family detached home', 'Accessory structure', 'Home occupation'],
    conditionalUses: ['ADU', 'Religious institution', 'School', 'Child care (small family)'],
    prohibited: ['Duplex', 'Multi-family', 'Commercial', 'Industrial'],
  },
  {
    code: 'R-2',
    name: 'Single-Family Residential — Small Lot',
    category: 'residential',
    summary: 'Single-family residential on reduced lot sizes near urban services.',
    minLotSqft: 5500,
    maxHeightFt: 35,
    maxDensityPerAcre: 7,
    maxFAR: 0.45,
    permittedByRight: ['Single-family detached home', 'Accessory structure', 'Home occupation'],
    conditionalUses: ['ADU', 'Duplex', 'Religious institution'],
    prohibited: ['Apartments (3+)', 'Commercial', 'Industrial'],
  },
  {
    code: 'R-3',
    name: 'Multi-Family Residential',
    category: 'residential',
    summary: 'Medium-density multi-family housing including apartments and townhomes.',
    minLotSqft: 3000,
    maxHeightFt: 45,
    maxDensityPerAcre: 18,
    maxFAR: 0.8,
    permittedByRight: ['Apartment', 'Condominium', 'Townhouse', 'Duplex'],
    conditionalUses: ['Assisted living', 'Group home', 'Senior housing'],
    prohibited: ['Commercial retail', 'Industrial'],
  },
  {
    code: 'MHP',
    name: 'Manufactured Housing Park',
    category: 'residential',
    summary: 'Manufactured / mobile home park community.',
    minLotSqft: 3500,
    maxHeightFt: 25,
    maxDensityPerAcre: 10,
    maxFAR: 0.4,
    permittedByRight: ['Manufactured home', 'Park office / clubhouse', 'Accessory recreational facilities'],
    conditionalUses: ['Storage'],
    prohibited: ['Site-built homes', 'Commercial', 'Industrial'],
  },
  {
    code: 'B-1',
    name: 'Neighborhood Business',
    category: 'commercial',
    summary: 'Small-scale neighborhood-serving retail, services, and offices.',
    minLotSqft: 5000,
    maxHeightFt: 35,
    maxDensityPerAcre: null,
    maxFAR: 0.7,
    permittedByRight: ['Retail store', 'Restaurant (no drive-through)', 'Personal services', 'Professional office', 'Bank'],
    conditionalUses: ['Drive-through', 'Auto repair', 'Gas station'],
    prohibited: ['Heavy industrial', 'Warehousing', 'Residential (standalone)'],
  },
  {
    code: 'B-2',
    name: 'Community Business',
    category: 'commercial',
    summary: 'Community-scale commercial serving multiple neighborhoods.',
    minLotSqft: 10000,
    maxHeightFt: 45,
    maxDensityPerAcre: null,
    maxFAR: 1.0,
    permittedByRight: ['Retail', 'Restaurant', 'Hotel', 'Entertainment', 'Auto sales', 'Office'],
    conditionalUses: ['Drive-through', 'Gas station', 'Car wash', 'Outdoor storage (screened)'],
    prohibited: ['Heavy manufacturing', 'Residential (standalone)'],
  },
  {
    code: 'B-3',
    name: 'Highway Business',
    category: 'commercial',
    summary: 'Auto-oriented commercial uses along major highway corridors.',
    minLotSqft: 15000,
    maxHeightFt: 50,
    maxDensityPerAcre: null,
    maxFAR: 1.5,
    permittedByRight: ['Auto dealership', 'Hotel/motel', 'Restaurant', 'Entertainment complex', 'Retail'],
    conditionalUses: ['Truck stop', 'Recreational vehicle park', 'Outdoor sales lot'],
    prohibited: ['Residential', 'Heavy industrial'],
  },
  {
    code: 'I-1',
    name: 'Light Industrial',
    category: 'industrial',
    summary: 'Light manufacturing, warehousing, flex office, and research uses.',
    minLotSqft: 10000,
    maxHeightFt: 50,
    maxDensityPerAcre: null,
    maxFAR: 1.0,
    permittedByRight: ['Light manufacturing', 'Warehouse', 'Research and development', 'Flex office/industrial', 'Distribution'],
    conditionalUses: ['Truck terminal', 'Outdoor storage (screened)', 'Ancillary retail'],
    prohibited: ['Residential', 'Heavy industry with noxious emissions'],
  },
  {
    code: 'I-2',
    name: 'Heavy Industrial',
    category: 'industrial',
    summary: 'Heavy manufacturing, processing facilities, and large-scale industrial uses.',
    minLotSqft: 20000,
    maxHeightFt: 60,
    maxDensityPerAcre: null,
    maxFAR: 1.5,
    permittedByRight: ['Heavy manufacturing', 'Processing plant', 'Trucking terminal', 'Outdoor storage', 'Utility infrastructure'],
    conditionalUses: ['Concrete/asphalt plant', 'Recycling facility', 'Hazardous materials handling'],
    prohibited: ['Residential', 'Schools', 'Child care'],
  },
  {
    code: 'O/P',
    name: 'Office / Professional Park',
    category: 'commercial',
    summary: 'Professional office campus and business park uses.',
    minLotSqft: 10000,
    maxHeightFt: 45,
    maxDensityPerAcre: null,
    maxFAR: 1.0,
    permittedByRight: ['Professional office', 'Medical clinic', 'Research facility', 'Financial services'],
    conditionalUses: ['Hotel', 'Conference center', 'Ancillary retail', 'Child care'],
    prohibited: ['Heavy retail', 'Industrial', 'Residential (standalone)'],
  },
  {
    code: 'PUD',
    name: 'Planned Unit Development',
    category: 'overlay',
    summary: 'Master-planned development with site-specific standards negotiated through the county.',
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

const _byCode = new Map(ARAPAHOE_ZONES.map(z => [z.code.toUpperCase(), z]));

export function getArapahoeZoneDistrict(code: string): ArapahoeZoneDistrict | null {
  return _byCode.get(code?.toUpperCase()?.trim()) ?? null;
}

export const ARAPAHOE_CATEGORY_LABELS: Record<ArapahoeZoneDistrict['category'], string> = {
  residential: 'Residential',
  'mixed-use': 'Mixed Use',
  commercial: 'Commercial',
  industrial: 'Industrial',
  agricultural: 'Agricultural',
  'open-space': 'Open Space / Parks',
  overlay: 'Planned / Overlay',
};
