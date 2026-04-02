import type { CanonicalProperty, TaxModule } from '@/core/models/property';
import type { SourceAttribution } from '@/core/models/provenance';

export interface TaxComparableRuleSet {
  samePropertyType?: boolean;
  sameMunicipality?: boolean;
  sameNeighborhoodOrAdjacent?: boolean;
  sameSubmarket?: boolean;
  buildingSizeTolerancePct?: number;
  unitTolerancePct?: number;
  landSizeTolerancePct?: number;
  yearBuiltTolerance?: number;
  bracketSubject?: boolean;
}

export interface TaxComparable {
  internalPropertyId: string;
  address: string | null;
  propertyType: string | null;
  neighborhood: string | null;
  municipality: string | null;
  buildingAreaSqft: number | null;
  units: number | null;
  annualTax: number | null;
  taxPerSqft: number | null;
  taxPerUnit: number | null;
  inclusionReasons: string[];
  exclusionWarnings?: string[];
}

export interface TaxAnalysisResult {
  subject: TaxModule | null;
  comparables: TaxComparable[];
  bracketed: boolean;
  conclusionType: 'supported_current' | 'indicated_adjustment' | 'insufficient_data';
  indicatedAnnualTax: number | null;
  summaryText: string;
  assumptions: string[];
  provenance: SourceAttribution[];
}

export interface TaxEngine {
  id: string;
  state: string;
  analyzeProperty(property: CanonicalProperty): Promise<TaxAnalysisResult>;
  selectComparables(property: CanonicalProperty, rules: TaxComparableRuleSet): Promise<TaxComparable[]>;
}
