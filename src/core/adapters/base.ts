import type { CanonicalModuleName, SourceAttribution } from '@/core/models/provenance';

export interface AdapterContext {
  state: string;
  county?: string;
  municipality?: string;
  module: CanonicalModuleName;
  fetchedAt: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface SourceAdapter<TQuery, TRaw, TNormalized> {
  id: string;
  sourceName: string;
  context: Omit<AdapterContext, 'fetchedAt'>;
  fetch(query: TQuery): Promise<TRaw>;
  validate(raw: TRaw): Promise<ValidationResult> | ValidationResult;
  normalize(raw: TRaw, context: AdapterContext): Promise<TNormalized> | TNormalized;
  getProvenance(raw: TRaw, context: AdapterContext): SourceAttribution;
}

export interface AdapterRegistryEntry<TQuery = unknown, TRaw = unknown, TNormalized = unknown> {
  id: string;
  adapter: SourceAdapter<TQuery, TRaw, TNormalized>;
  priority: number;
  enabled: boolean;
}
