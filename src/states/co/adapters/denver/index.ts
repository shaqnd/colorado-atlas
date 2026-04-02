import type { ColoradoJurisdictionMetadata } from '@/states/co/adapters/types';

export const denverAdapterMetadata: ColoradoJurisdictionMetadata = {
  state: 'CO',
  county: 'Denver',
  municipality: 'Denver',
  adapterId: 'co-denver',
  capabilities: {
    parcelDetail: true,
    ownerSearch: true,
    landImprovementSplit: true,
    taxDetail: true,
    zoning: true,
    zoningAuthorityDetection: true,
    taxComparables: true,
    hbuInputs: true,
  },
  knownLimitations: [
    'Comparable selection is still heuristic and should move into the tax engine.',
    'PDF export relies on browser print behavior and still needs a reusable report renderer.',
  ],
};
