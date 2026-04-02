import type { ColoradoJurisdictionMetadata } from '@/states/co/adapters/types';

export const douglasAdapterMetadata: ColoradoJurisdictionMetadata = {
  state: 'CO',
  county: 'Douglas',
  adapterId: 'co-douglas',
  capabilities: {
    parcelDetail: true,
    ownerSearch: true,
    landImprovementSplit: true,
    taxDetail: true,
    zoning: true,
    zoningAuthorityDetection: false,
    taxComparables: false,
    hbuInputs: true,
  },
  knownLimitations: [
    'Douglas tax comparable/report parity is not yet finished.',
    'Municipal zoning authority separation is not yet modeled beyond county-level zoning detail.',
  ],
};
