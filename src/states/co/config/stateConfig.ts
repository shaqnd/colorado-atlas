import type { SourcePriorityRule } from '@/core/models/provenance';

export const COLORADO_STATE_CODE = 'CO';

export const coloradoSourcePriorityRules: SourcePriorityRule[] = [
  {
    state: COLORADO_STATE_CODE,
    module: 'property',
    field: 'geometry',
    orderedSources: ['county_gis', 'colorado_statewide_parcels'],
  },
  {
    state: COLORADO_STATE_CODE,
    module: 'ownership',
    orderedSources: ['county_assessor', 'colorado_statewide_parcels'],
  },
  {
    state: COLORADO_STATE_CODE,
    module: 'tax',
    orderedSources: ['county_treasurer', 'county_assessor', 'colorado_statewide_parcels'],
  },
  {
    state: COLORADO_STATE_CODE,
    module: 'zoning',
    orderedSources: ['municipality_zoning', 'county_zoning', 'colorado_statewide_parcels'],
  },
  {
    state: COLORADO_STATE_CODE,
    module: 'land_building',
    orderedSources: ['county_assessor', 'colorado_statewide_parcels'],
  },
];
