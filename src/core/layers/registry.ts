export type LayerCategory =
  | 'parcel'
  | 'boundary'
  | 'zoning'
  | 'risk'
  | 'district'
  | 'content'
  | 'analysis';

export interface LayerRegistryEntry {
  id: string;
  name: string;
  category: LayerCategory;
  source: string;
  geometryType: 'point' | 'line' | 'polygon' | 'raster';
  stateScope: string[];
  countyScope?: string[];
  municipalityScope?: string[];
  defaultVisibility: boolean;
  attribution: string;
  refreshCadence: string;
  style: Record<string, unknown>;
  filters?: string[];
  availability?: {
    requiresCounty?: boolean;
    requiresMunicipality?: boolean;
    requiresModules?: string[];
  };
}
