export interface County {
  rank: number;
  name: string;
  population: number;
  population5yr: number;
  population10yr: number;
  seat: string;
  tax: {
    effRate: number;
    medianTax: number;
    medianHome: number;
    countyMill?: number;
  };
  compPlan: {
    name: string;
    yearAdopted: number;
    status: 'current' | 'aging' | 'overdue' | 'updating';
    horizonYear?: number;
    notes: string;
  };
  zoning: {
    codeName: string;
    source: string;
    url: string;
    gisPortal: string;
    gisType: string;
  };
  hearings: {
    bccSchedule: string;
    bccAgendaUrl: string;
    bccVideoSource: string;
    pcSchedule: string;
    pcName: string;
  };
  assessor: {
    url: string;
    propertySearchUrl: string;
    treasurerUrl: string;
    platform: string;
    hasOpenData: boolean;
  };
}

export type CompPlanStatus = 'current' | 'aging' | 'overdue' | 'updating';

export type PropertyType =
  | 'residential'
  | 'commercial_improved'
  | 'commercial_other'
  | 'industrial'
  | 'vacant'
  | 'agricultural'
  | 'personal_property';

export interface ZoneDistrict {
  code: string;
  name: string;
  category: 'res' | 'com' | 'ind' | 'mix' | 'ag';
  minLot: number;
  maxDensity: number;
  maxHeight: number;
  maxFAR: number;
  setbacks: { front: number; side: number; rear: number };
  permittedUses: string[];
  conditionalUses: string[];
}

export interface MillLevy {
  county: number;
  municipality: number;
  schoolDistrict: number;
  fire: number;
  waterSanitation: number;
  metroDistrict: number;
  library: number;
  other: number;
  total: number;
  /** True = sourced from official county abstract/certification. False = DOLA-pattern estimate. */
  verified?: boolean;
  /** Official source document or URL */
  source?: string;
  /** Tax year the certified data applies to */
  taxYear?: number;
  /** Representative tax district (mill levies vary by location within county) */
  taxDistrict?: string;
}

export interface AssessmentRate {
  classification: string;
  rate2024: number | string;
  rate2025: number | string;
  rate2026: number | string;
  rate2027plus: number | string;
  notes?: string;
}

export interface CurrentUse {
  code: string;
  label: string;
  intensityScore: number;
  description: string;
}

export interface CoraTemplate {
  id: string;
  title: string;
  subject: string;
  body: string;
  statute: string;
  deploymentNotes: string;
}

export interface TaxCalculationResult {
  annualTax: number;
  monthlyTax: number;
  effectiveRate: number;
  totalMills: number;
  localGovAssessedValue: number;
  schoolAssessedValue: number;
  isResidential: boolean;
  entities: TaxEntity[];
}

export interface TaxEntity {
  name: string;
  mills: number;
  assessedValue: number;
  annualTax: number;
  share: number;
}

export interface HBUSignal {
  severity: 'high' | 'medium' | 'info' | 'good';
  title: string;
  description: string;
}

export interface HBUDecisionTest {
  status: 'pass' | 'caution' | 'fail';
  summary: string;
}

export interface HBUTrackResult {
  legalPermissibility: HBUDecisionTest;
  physicalPossibility: HBUDecisionTest;
  financialFeasibility: HBUDecisionTest;
  conclusion: string;
}

export interface HBUResult {
  verdict: 'underutilized' | 'optimal';
  signals: HBUSignal[];
  framework: {
    asThoughVacant: HBUTrackResult;
    asImproved: HBUTrackResult;
  };
  recommendation: {
    opinion: string;
    conclusionType: 'continue_current_use' | 'interim_use' | 'redevelopment';
    sourceZoneCode: string;
    analyzedZoneCode: string;
    currentUseLabel: string;
    likelyInterimUse: string;
    likelyUltimateUse: string;
    rationale: string[];
    support: string[];
  };
  districtDetail: ZoneDistrict & {
    maxBuildingArea: number;
    maxDwellingUnits: number;
    currentFAR: number;
    farUtilization: number;
    densityUtilization: number;
  };
}

export interface GeocoderResult {
  matchedAddress: string;
  lat: number;
  lng: number;
  countyFIPS: string;
  countyName: string;
  tractGEOID: string;
}
