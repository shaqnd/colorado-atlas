/**
 * San Miguel County + Telluride Zoning
 * Covers both unincorporated San Miguel County and the Town of Telluride.
 * Source: services.arcgis.com FeatureServer layer 5
 * API fields: ZONING (zone code), ZONE_AUTH ("SAN MIGUEL COUNTY" | "TOWN OF TELLURIDE"), LUCZONE
 */

export type SanMiguelZoneCategory =
  | 'residential'
  | 'mixed-use'
  | 'commercial'
  | 'industrial'
  | 'agricultural'
  | 'open-space'
  | 'public'
  | 'ski-resort'
  | 'overlay';

export interface SanMiguelZoneDistrict {
  zoneCode: string;
  name: string;
  category: SanMiguelZoneCategory;
  authority: 'SAN MIGUEL COUNTY' | 'TOWN OF TELLURIDE' | null;
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

const SAN_MIGUEL_ZONES: SanMiguelZoneDistrict[] = [
  {
    zoneCode: 'FORESTRY/AGRICULTURE',
    name: 'Forestry / Agriculture',
    category: 'agricultural',
    authority: 'SAN MIGUEL COUNTY',
    summary: 'Rural forest and agricultural uses on large parcels in the unincorporated county. Minimum 35-acre lot size preserves working lands and forest character.',
    minLotSqft: 1524600, // 35 acres
    maxHeightFt: 35,
    maxDensityPerAcre: 0.029,
    maxFAR: 0.02,
    permittedByRight: [
      'Crop farming',
      'Ranching and grazing',
      'Timber harvesting',
      'Single-family home (1 per parcel)',
      'Agricultural structures (barns, sheds)',
    ],
    conditionalUses: [
      'Guest ranch / dude ranch',
      'Bed & breakfast (≤ 5 rooms)',
      'Agricultural processing',
      'Oil and gas surface use',
      'Caretaker unit',
    ],
    prohibited: [
      'Subdivision below 35 acres',
      'Commercial retail',
      'Industrial (non-agricultural)',
      'Multi-family residential',
    ],
  },
  {
    zoneCode: 'LOW DENSITY',
    name: 'Low Density Residential',
    category: 'residential',
    authority: 'SAN MIGUEL COUNTY',
    summary: 'Low density residential district in unincorporated San Miguel County. Minimum 5-acre lot sizes maintain rural character in mountain and valley settings.',
    minLotSqft: 217800, // 5 acres
    maxHeightFt: 35,
    maxDensityPerAcre: 0.2,
    maxFAR: 0.1,
    permittedByRight: [
      'Single-family detached home',
      'Accessory structures',
      'Home occupation (low-impact)',
      'Agricultural uses (small-scale)',
    ],
    conditionalUses: [
      'ADU / caretaker unit',
      'Bed & breakfast (≤ 3 rooms)',
      'Church',
      'Equestrian facility (private)',
    ],
    prohibited: [
      'Multi-family residential',
      'Commercial retail',
      'Industrial uses',
      'Subdivision below 5 acres',
    ],
  },
  {
    zoneCode: 'RESIDENTIAL',
    name: 'Residential',
    category: 'residential',
    authority: 'TOWN OF TELLURIDE',
    summary: 'Standard residential zone within Telluride town limits. Accommodates a mix of single-family homes and some multifamily development consistent with Telluride\'s historic neighborhood fabric.',
    minLotSqft: 6000,
    maxHeightFt: 28,
    maxDensityPerAcre: 8,
    maxFAR: 0.5,
    permittedByRight: [
      'Single-family detached home',
      'Duplex',
      'Accessory structure',
      'Home occupation (low-impact)',
    ],
    conditionalUses: [
      'ADU',
      'Triplex / fourplex',
      'Bed & breakfast',
      'Short-term rental (with license)',
      'Child care (small family home)',
    ],
    prohibited: [
      'Apartment complex (5+ units standalone)',
      'Commercial retail',
      'Industrial uses',
    ],
    notes: 'Development subject to Telluride Design Standards and Guidelines. NHD review may apply in historic core.',
  },
  {
    zoneCode: 'COMMERCIAL',
    name: 'Commercial',
    category: 'commercial',
    authority: null,
    summary: 'Mixed commercial zone covering general retail, services, lodging, and ski village commercial uses. Applies in both Telluride town center and Mountain Village resort commercial areas.',
    minLotSqft: 3000,
    maxHeightFt: 40,
    maxDensityPerAcre: null,
    maxFAR: 2.0,
    permittedByRight: [
      'Retail store',
      'Restaurant and bar',
      'Hotel / lodge / inn',
      'Professional office',
      'Personal services',
      'Ski rental and outfitter',
      'Gallery and art studio',
    ],
    conditionalUses: [
      'Drive-through (limited)',
      'Live entertainment venue',
      'Outdoor dining and sales',
      'Residential upper floors',
      'Conference center',
    ],
    prohibited: [
      'Heavy industrial',
      'Residential-only ground floor (Town Center)',
      'Auto-oriented uses (gas station, drive-through car wash)',
    ],
    notes: 'Ski village commercial areas may have additional resort-specific standards applied via ZONE_AUTH.',
  },
  {
    zoneCode: 'INDUSTRIAL',
    name: 'Industrial',
    category: 'industrial',
    authority: 'SAN MIGUEL COUNTY',
    summary: 'Light and heavy industrial uses permitted in designated industrial areas of San Miguel County. Supports mining-related, construction, and utility operations.',
    minLotSqft: 20000,
    maxHeightFt: 50,
    maxDensityPerAcre: null,
    maxFAR: 0.8,
    permittedByRight: [
      'Light manufacturing',
      'Warehouse and distribution',
      'Contractor yard',
      'Construction material storage',
      'Utility facility',
    ],
    conditionalUses: [
      'Heavy manufacturing',
      'Mining operations / processing',
      'Hazardous materials handling',
      'Truck terminal',
      'Recycling facility',
    ],
    prohibited: [
      'Residential',
      'Schools or child care',
      'Retail (standalone)',
    ],
  },
  {
    zoneCode: 'OPEN SPACE',
    name: 'Open Space',
    category: 'open-space',
    authority: null,
    summary: 'Protected open space, parks, and natural areas. Includes conserved lands, municipal parks, and environmentally sensitive areas within both the county and Telluride town limits.',
    minLotSqft: 0,
    maxHeightFt: 25,
    maxDensityPerAcre: null,
    maxFAR: 0.02,
    permittedByRight: [
      'Passive recreation (hiking, picnicking)',
      'Trailhead and trail system',
      'Conservation management',
      'Environmental restoration',
    ],
    conditionalUses: [
      'Interpretive / visitor center (small scale)',
      'Parking area (unpaved)',
      'Agricultural grazing (compatible)',
    ],
    prohibited: [
      'Residential development',
      'Commercial development',
      'Industrial uses',
      'Permanent structures (non-recreational)',
    ],
  },
  {
    zoneCode: 'PUBLIC',
    name: 'Public / Civic',
    category: 'public',
    authority: null,
    summary: 'Government facilities, civic institutions, and public uses serving San Miguel County and Telluride residents. Covers schools, libraries, emergency services, and municipal infrastructure.',
    minLotSqft: 5000,
    maxHeightFt: 40,
    maxDensityPerAcre: null,
    maxFAR: 0.6,
    permittedByRight: [
      'Government office and courthouse',
      'Public school and educational facility',
      'Library',
      'Fire station and emergency services',
      'Utility and public works facility',
      'Post office',
    ],
    conditionalUses: [
      'Community center',
      'Religious institution',
      'Hospital / medical facility',
      'Airport / helipad',
    ],
    prohibited: [
      'Private commercial retail',
      'Industrial uses',
      'Private residential',
    ],
  },
  {
    zoneCode: 'PUD',
    name: 'Planned Unit Development',
    category: 'overlay',
    authority: null,
    summary: 'Master-planned development with site-specific standards approved by San Miguel County or the Town of Telluride. Mountain Village resort area is the primary PUD in the jurisdiction.',
    minLotSqft: 0,
    maxHeightFt: 0,
    maxDensityPerAcre: null,
    maxFAR: 0,
    permittedByRight: ['Per approved PUD plan'],
    conditionalUses: ['Per approved PUD plan'],
    prohibited: ['Any use not listed in the approved PUD plan'],
    notes: 'Refer to the specific Planned Unit Development plan for all applicable development standards. Mountain Village PUD includes resort residential, commercial, and ski area provisions.',
  },
  {
    zoneCode: 'TOWN CENTER',
    name: 'Town Center',
    category: 'mixed-use',
    authority: 'TOWN OF TELLURIDE',
    summary: 'Telluride\'s historic downtown and town center mixed-use district. Supports active ground-floor commercial with residential and lodging above within the National Historic District.',
    minLotSqft: 2000,
    maxHeightFt: 32,
    maxDensityPerAcre: null,
    maxFAR: 2.5,
    permittedByRight: [
      'Ground-floor retail and restaurant',
      'Gallery and art space',
      'Hotel and lodge',
      'Professional office (upper floors)',
      'Residential (upper floors)',
      'Personal services',
    ],
    conditionalUses: [
      'Live music and entertainment venue',
      'Outdoor dining (sidewalk)',
      'Residential ground floor (limited)',
      'Grocery / market',
    ],
    prohibited: [
      'Auto-oriented uses',
      'Drive-through facilities',
      'Heavy commercial or industrial',
      'Residential-only ground floor on Main St',
    ],
    notes: 'Located within the Telluride National Historic District (NHD). All exterior modifications and new construction require review by the Telluride Historic and Architectural Review Commission (HARC).',
  },
  {
    zoneCode: 'SKI AREA',
    name: 'Ski Area / Mountain Resort',
    category: 'ski-resort',
    authority: 'SAN MIGUEL COUNTY',
    summary: 'Mountain ski area and resort uses covering Telluride Ski Resort terrain, lifts, and on-mountain facilities. Encompasses ski runs, base facilities, and ancillary mountain operations.',
    minLotSqft: 0,
    maxHeightFt: 45,
    maxDensityPerAcre: null,
    maxFAR: 0.1,
    permittedByRight: [
      'Ski lifts and tramways',
      'Ski runs and terrain management',
      'On-mountain food and beverage (hut / yurt)',
      'Ski patrol and safety facilities',
      'Snowmaking infrastructure',
      'Mountain maintenance facilities',
    ],
    conditionalUses: [
      'Base lodge expansion',
      'On-mountain overnight facilities',
      'Summer mountain recreation (bike park, gondola)',
      'Event and festival use',
    ],
    prohibited: [
      'Permanent residential (outside approved base areas)',
      'Retail commercial (non-ski-related)',
      'Industrial uses',
    ],
    notes: 'Ski area operations subject to U.S. Forest Service special use permit in addition to county zoning. Mountain Village base area governed separately under PUD.',
  },
];

const _byCode = new Map(SAN_MIGUEL_ZONES.map(z => [z.zoneCode.toUpperCase(), z]));

export function getSanMiguelZoneDistrict(code: string): SanMiguelZoneDistrict | null {
  return _byCode.get(code?.toUpperCase()?.trim()) ?? null;
}

export const SAN_MIGUEL_CATEGORY_LABELS: Record<SanMiguelZoneCategory, string> = {
  residential: 'Residential',
  'mixed-use': 'Mixed Use',
  commercial: 'Commercial',
  industrial: 'Industrial',
  agricultural: 'Agricultural / Forestry',
  'open-space': 'Open Space / Parks',
  public: 'Public / Civic',
  'ski-resort': 'Ski Area / Resort',
  overlay: 'Planned / Overlay',
};
