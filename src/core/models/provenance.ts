export type CanonicalModuleName =
  | 'property'
  | 'ownership'
  | 'land_building'
  | 'transactions'
  | 'tax'
  | 'zoning'
  | 'geography'
  | 'development_potential'
  | 'report';

export interface SourceAttribution {
  sourceName: string;
  sourceRecordId: string | null;
  sourceUrl?: string | null;
  fetchedAt: string;
  normalizedAt: string;
  effectiveDate?: string | null;
  confidenceScore?: number | null;
  notes?: string[] | null;
}

export interface RawSourceReference {
  sourceName: string;
  module: CanonicalModuleName;
  sourceRecordId: string | null;
  fetchedAt: string;
  rawPayloadRef?: string | null;
}

export interface FieldProvenance<T = unknown> {
  fieldName: string;
  value: T | null;
  source: SourceAttribution;
}

export interface CanonicalModuleEnvelope<T> {
  value: T | null;
  source: SourceAttribution;
  rawPayload?: unknown;
}

export interface SourcePriorityRule {
  state: string;
  county?: string;
  municipality?: string;
  module: CanonicalModuleName;
  field?: string;
  orderedSources: string[];
}

export interface SourceDiscrepancy {
  state: string;
  county?: string;
  municipality?: string;
  module: CanonicalModuleName;
  fieldName: string;
  sourceA: FieldProvenance;
  sourceB: FieldProvenance;
  resolutionRuleApplied?: string | null;
}
