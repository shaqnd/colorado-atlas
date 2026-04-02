import type { CanonicalProperty } from '@/core/models/property';
import type { LayerRegistryEntry } from '@/core/layers/registry';

export interface SearchResultContract {
  id: string;
  entityType: 'property' | 'owner' | 'address' | 'municipality' | 'neighborhood' | 'submarket' | 'place';
  label: string;
  sublabel?: string | null;
  state: string;
  county?: string | null;
  municipality?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface PropertyResponseContract {
  property: CanonicalProperty;
}

export interface LayerListResponseContract {
  layers: LayerRegistryEntry[];
}
