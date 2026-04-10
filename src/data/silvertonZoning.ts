/**
 * Town of Silverton Zoning (San Juan County, Colorado)
 * Covers the incorporated Town of Silverton (~600 residents).
 * Source: services9.arcgis.com FeatureServer layer 100
 * API field: PropZonAbbr (e.g., "R-1", "R-2", "C-1", "C-2", "MU-2", "P", "PUD")
 * Note: Silverton is a National Historic District (NHD) — most new construction
 * and exterior modifications are subject to architectural review.
 */

export type SilvertonZoneCategory =
  | 'residential'
  | 'mixed-use'
  | 'commercial'
  | 'industrial'
  | 'public'
  | 'economic-development'
  | 'overlay';

export interface SilvertonZoneDistrict {
  zoneCode: string;
  name: string;
  category: SilvertonZoneCategory;
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

const SILVERTON_ZONES: SilvertonZoneDistrict[] = [
  {
    zoneCode: 'R-1',
    name: 'Single-Family Residential',
    category: 'residential',
    summary: 'Single-family residential district reflecting Silverton\'s historic lot pattern. Minimum 6,000 sq ft lot size consistent with original town plat. Primary housing zone for Silverton\'s year-round residents.',
    minLotSqft: 6000,
    maxHeightFt: 30,
    maxDensityPerAcre: 7,
    maxFAR: 0.4,
    permittedByRight: [
      'Single-family detached home',
      'Accessory structure (garage, shed)',
      'Home occupation (low-impact)',
      'Community garden',
    ],
    conditionalUses: [
      'ADU / carriage house',
      'Bed & breakfast (≤ 3 rooms)',
      'Family day care home',
      'Religious institution',
    ],
    prohibited: [
      'Duplex or multi-family',
      'Commercial retail',
      'Industrial uses',
      'Short-term rental as primary use (without CUP)',
    ],
    notes: 'Located within Silverton National Historic District. Exterior alterations and new construction require review by the Silverton Board of Trustees / Historic Review Board.',
  },
  {
    zoneCode: 'R-2',
    name: 'Multi-Family Residential',
    category: 'residential',
    summary: 'Multi-family residential zone allowing up to four dwelling units per parcel. Supports workforce and attainable housing in a town with significant seasonal population pressure.',
    minLotSqft: 6000,
    maxHeightFt: 35,
    maxDensityPerAcre: 14,
    maxFAR: 0.6,
    permittedByRight: [
      'Single-family detached home',
      'Duplex',
      'Triplex',
      'Fourplex',
      'Accessory structure',
    ],
    conditionalUses: [
      'ADU',
      'Bed & breakfast (≤ 5 rooms)',
      'Group home',
      'Assisted living (small scale)',
      'Child care center',
    ],
    prohibited: [
      'Apartment complex (5+ units)',
      'Commercial retail (standalone)',
      'Industrial uses',
    ],
    notes: 'NHD architectural review applies. Density bonuses may be available for deed-restricted affordable units per town housing policy.',
  },
  {
    zoneCode: 'C-1',
    name: 'Neighborhood Commercial',
    category: 'commercial',
    summary: 'Small-scale neighborhood-serving retail, personal services, and professional offices. Intended to serve daily needs of Silverton residents with pedestrian-friendly, low-intensity commercial uses.',
    minLotSqft: 3000,
    maxHeightFt: 30,
    maxDensityPerAcre: null,
    maxFAR: 0.8,
    permittedByRight: [
      'Retail store (small scale)',
      'Restaurant and café',
      'Personal services (salon, tailor)',
      'Professional office',
      'Art studio and gallery',
    ],
    conditionalUses: [
      'Residential upper floor',
      'Bed & breakfast',
      'Outdoor seating',
      'Food truck / seasonal vendor',
    ],
    prohibited: [
      'Drive-through facilities',
      'Auto-oriented uses',
      'Heavy commercial',
      'Industrial uses',
    ],
    notes: 'NHD review required for all exterior work. Signage subject to historic district guidelines.',
  },
  {
    zoneCode: 'C-2',
    name: 'General Commercial',
    category: 'commercial',
    summary: 'Larger-scale commercial uses including tourism retail, lodging, and visitor services. Primary commercial zone for Silverton\'s Greene Street corridor serving the tourist economy.',
    minLotSqft: 5000,
    maxHeightFt: 35,
    maxDensityPerAcre: null,
    maxFAR: 1.5,
    permittedByRight: [
      'Retail store',
      'Restaurant and bar',
      'Hotel, motel, and inn',
      'Outfitter and guide service',
      'Tourist attraction and museum',
      'Professional office',
      'Entertainment venue',
    ],
    conditionalUses: [
      'Outdoor sales and display',
      'Event space and special events',
      'Warehouse / storage (accessory)',
      'Residential upper floor',
      'Gas station (limited)',
    ],
    prohibited: [
      'Heavy industrial',
      'Auto dealership',
      'Drive-through',
      'Residential ground floor on primary commercial street',
    ],
    notes: 'Core tourism commercial district. NHD review required. Historic storefronts must maintain character-defining features per Secretary of the Interior Standards.',
  },
  {
    zoneCode: 'MU-2',
    name: 'Mixed Use 2',
    category: 'mixed-use',
    summary: 'Mixed-use district requiring active commercial or retail uses on the ground floor with residential permitted above. Supports vibrant street life and housing supply in Silverton\'s compact downtown.',
    minLotSqft: 3000,
    maxHeightFt: 35,
    maxDensityPerAcre: null,
    maxFAR: 2.0,
    permittedByRight: [
      'Ground-floor retail and restaurant',
      'Ground-floor gallery and studio',
      'Ground-floor personal services',
      'Residential (upper floors)',
      'Office (upper floors)',
      'Lodging / short-term rental (upper floors)',
    ],
    conditionalUses: [
      'Residential ground floor (non-primary frontage)',
      'Live-work unit',
      'Outdoor dining',
      'Brewpub / distillery (small scale)',
    ],
    prohibited: [
      'Residential-only ground floor on primary street',
      'Auto-oriented uses',
      'Industrial uses',
      'Drive-through',
    ],
    notes: 'Ground floor commercial activation required along primary street frontages. NHD review applies to all exterior work.',
  },
  {
    zoneCode: 'P',
    name: 'Public',
    category: 'public',
    summary: 'Public and civic uses including government facilities, schools, and community institutions serving the Town of Silverton and San Juan County.',
    minLotSqft: 5000,
    maxHeightFt: 40,
    maxDensityPerAcre: null,
    maxFAR: 0.5,
    permittedByRight: [
      'Government office (town, county, state, federal)',
      'Public school and library',
      'Fire station and emergency services',
      'Community center',
      'Public utility and infrastructure',
      'Post office',
    ],
    conditionalUses: [
      'Religious institution',
      'Hospital and medical facility',
      'Cultural institution and museum',
      'Civic event space',
    ],
    prohibited: [
      'Private commercial retail',
      'Industrial uses',
      'Private residential',
    ],
    notes: 'NHD review applies to exterior modifications of historic public buildings including Silverton Town Hall and San Juan County Courthouse.',
  },
  {
    zoneCode: 'PUD',
    name: 'Planned Unit Development',
    category: 'overlay',
    summary: 'Master-planned development with site-specific standards approved by the Town of Silverton. Allows flexibility for mixed-use and resort projects that require unified planning.',
    minLotSqft: 0,
    maxHeightFt: 0,
    maxDensityPerAcre: null,
    maxFAR: 0,
    permittedByRight: ['Per approved PUD plan'],
    conditionalUses: ['Per approved PUD plan'],
    prohibited: ['Any use not listed in the approved PUD plan'],
    notes: 'Refer to the specific Planned Unit Development plan for all applicable development standards. NHD review applies to exterior elements visible from public right-of-way.',
  },
  {
    zoneCode: 'ED',
    name: 'Economic Development',
    category: 'economic-development',
    summary: 'Economic development zone designed to attract tourism-related industry, outdoor recreation businesses, and economic growth that supports Silverton\'s transition from a historic mining economy. Provides flexible standards to encourage investment while respecting the town\'s character.',
    minLotSqft: 10000,
    maxHeightFt: 40,
    maxDensityPerAcre: null,
    maxFAR: 1.0,
    permittedByRight: [
      'Tourism and recreation business',
      'Light manufacturing and craft production',
      'Outdoor outfitter and guide headquarters',
      'Warehouse and fulfillment (small scale)',
      'Micro-brewery and distillery',
      'Commercial kitchen and food production',
    ],
    conditionalUses: [
      'Hotel and lodging',
      'Event venue',
      'Retail (accessory to primary use)',
      'Remote work hub / co-working',
      'Workforce housing (accessory)',
    ],
    prohibited: [
      'Heavy industrial (noxious, hazardous)',
      'Residential (primary standalone)',
      'Auto salvage or junkyard',
    ],
    notes: 'Economic Development zone may be located partially outside the NHD core. Projects within or adjacent to the NHD boundary remain subject to architectural review. The Town encourages businesses that leverage Silverton\'s outdoor recreation assets (San Juan Skyway, Weminuche Wilderness, Durango & Silverton Narrow Gauge Railroad).',
  },
];

const _byCode = new Map(SILVERTON_ZONES.map(z => [z.zoneCode.toUpperCase(), z]));

export function getSilvertonZoneDistrict(code: string): SilvertonZoneDistrict | null {
  return _byCode.get(code?.toUpperCase()?.trim()) ?? null;
}

export const SILVERTON_CATEGORY_LABELS: Record<SilvertonZoneCategory, string> = {
  residential: 'Residential',
  'mixed-use': 'Mixed Use',
  commercial: 'Commercial',
  industrial: 'Industrial',
  public: 'Public / Civic',
  'economic-development': 'Economic Development',
  overlay: 'Planned / Overlay',
};
