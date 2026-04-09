import type { ColoradoJurisdictionMetadata } from '@/states/co/adapters/types';

export const jeffersonAdapterMetadata: ColoradoJurisdictionMetadata = {
  state: 'CO',
  county: 'Jefferson',
  adapterId: 'co-jefferson',
  capabilities: {
    parcelDetail: true,
    ownerSearch: false,
    landImprovementSplit: true,
    taxDetail: true,
    zoning: true,
    zoningAuthorityDetection: false,
    taxComparables: false,
    hbuInputs: true,
  },
  knownLimitations: [
    'Assessor detail comes from the county FeatureServer (one query covers valuation, building, and mill levy).',
    'Owner/APN search is not yet implemented — detail requires a click on a map parcel.',
    'Municipal zoning authority separation not yet modeled for incorporated Jefferson County cities.',
    'Tax comparable and report parity not yet implemented.',
  ],
};
