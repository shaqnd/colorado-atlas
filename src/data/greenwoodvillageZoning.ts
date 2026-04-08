/**
 * Greenwood Village Zoning Code — Zone District Rules
 * Based on the City of Greenwood Village Zoning Ordinance.
 * Source: online.greenwoodvillage.com/server/rest/services/City/GreenwoodVillage_GeneralMapViewer_Web/MapServer (layer 1)
 */

export interface GreenwoodVillageZoneDistrict {
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

const GV_ZONES: GreenwoodVillageZoneDistrict[] = [
  {
    code: 'R-1',
    name: 'Single-Family Residential — Large Lot',
    category: 'residential',
    summary: 'Very low-density estate residential on large minimum lots. The predominant zone in Greenwood Village.',
    minLotSqft: 43560,
    maxHeightFt: 35,
    maxDensityPerAcre: 1,
    maxFAR: 0.25,
    permittedByRight: ['Single-family detached home', 'Accessory structure', 'Home occupation (limited)', 'Equestrian use'],
    conditionalUses: ['Church / place of worship', 'School', 'Country club / golf course'],
    prohibited: ['Multi-family', 'Commercial', 'Industrial', 'ADU'],
    notes: 'Greenwood Village is predominantly estate-lot residential. Most lots exceed 1 acre.',
  },
  {
    code: 'R-2',
    name: 'Single-Family Residential — Medium Lot',
    category: 'residential',
    summary: 'Single-family residential on mid-size lots (approx. 15,000+ sq ft).',
    minLotSqft: 15000,
    maxHeightFt: 35,
    maxDensityPerAcre: 3,
    maxFAR: 0.3,
    permittedByRight: ['Single-family detached home', 'Accessory structure', 'Home occupation'],
    conditionalUses: ['Church', 'Private school', 'Day care (small)'],
    prohibited: ['Multi-family', 'Commercial', 'Industrial'],
  },
  {
    code: 'R-3',
    name: 'Multi-Family Residential',
    category: 'residential',
    summary: 'Multi-family residential including townhomes and low-rise condominiums.',
    minLotSqft: 6000,
    maxHeightFt: 40,
    maxDensityPerAcre: 12,
    maxFAR: 0.75,
    permittedByRight: ['Townhouse', 'Condominium', 'Apartment', 'Single-family home'],
    conditionalUses: ['Senior housing', 'Assisted living'],
    prohibited: ['Commercial retail', 'Industrial'],
  },
  {
    code: 'BO',
    name: 'Business / Office',
    category: 'commercial',
    summary: 'Professional office, corporate campus, and limited service commercial.',
    minLotSqft: 10000,
    maxHeightFt: 55,
    maxDensityPerAcre: null,
    maxFAR: 1.5,
    permittedByRight: ['Professional office', 'Corporate headquarters', 'Medical office', 'Financial services', 'Research facility'],
    conditionalUses: ['Restaurant (ancillary)', 'Hotel', 'Health club'],
    prohibited: ['Retail strip center', 'Industrial', 'Residential (standalone)'],
    notes: 'Greenwood Village hosts major corporate campuses along I-25.',
  },
  {
    code: 'O',
    name: 'Office',
    category: 'commercial',
    summary: 'General office district for professional and administrative uses.',
    minLotSqft: 7500,
    maxHeightFt: 45,
    maxDensityPerAcre: null,
    maxFAR: 1.0,
    permittedByRight: ['Office', 'Medical clinic', 'Government office', 'Bank'],
    conditionalUses: ['Drive-through (bank)', 'Child care center', 'Ancillary retail'],
    prohibited: ['Heavy retail', 'Industrial', 'Residential'],
  },
  {
    code: 'M',
    name: 'Mixed Use',
    category: 'mixed-use',
    summary: 'Mixed-use commercial and residential in activity center locations.',
    minLotSqft: 5000,
    maxHeightFt: 65,
    maxDensityPerAcre: 40,
    maxFAR: 2.5,
    permittedByRight: ['Office', 'Retail', 'Restaurant', 'Hotel', 'Multi-family residential', 'Live/work'],
    conditionalUses: ['Drive-through', 'Entertainment venue', 'Brewery/taproom'],
    prohibited: ['Heavy industrial', 'Salvage', 'Auto salvage'],
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
    notes: 'Many corporate campus areas are designated as Planned Developments.',
  },
];

const _byCode = new Map(GV_ZONES.map(z => [z.code.toUpperCase(), z]));

export function getGreenwoodVillageZoneDistrict(code: string): GreenwoodVillageZoneDistrict | null {
  return _byCode.get(code?.toUpperCase()?.trim()) ?? null;
}

export const GREENWOODVILLAGE_CATEGORY_LABELS: Record<GreenwoodVillageZoneDistrict['category'], string> = {
  residential: 'Residential',
  'mixed-use': 'Mixed Use',
  commercial: 'Commercial / Office',
  industrial: 'Industrial',
  'open-space': 'Open Space / Parks',
  overlay: 'Planned / Overlay',
};
