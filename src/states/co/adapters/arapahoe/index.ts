import type { ColoradoJurisdictionMetadata } from '@/states/co/adapters/types';

export const arapahoeAdapterMetadata: ColoradoJurisdictionMetadata = {
  state: 'CO',
  county: 'Arapahoe',
  adapterId: 'co-arapahoe',
  capabilities: {
    parcelDetail: true,
    ownerSearch: true,
    landImprovementSplit: true,
    taxDetail: true,
    zoning: true,
    zoningAuthorityDetection: true,
    taxComparables: false,
    hbuInputs: true,
  },
  knownLimitations: [
    'Official county zoning is available only for unincorporated Arapahoe County.',
    'Municipal zoning connectors for Greenwood Village, Centennial, Aurora, Littleton, Englewood, and other incorporated jurisdictions are still pending.',
    'Arapahoe tax comparable/report parity is not yet implemented.',
  ],
};
