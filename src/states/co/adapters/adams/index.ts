import type { ColoradoJurisdictionMetadata } from '@/states/co/adapters/types';

export const adamsAdapterMetadata: ColoradoJurisdictionMetadata = {
  state: 'CO',
  county: 'Adams',
  adapterId: 'co-adams',
  capabilities: {
    parcelDetail: false,
    ownerSearch: false,
    landImprovementSplit: false,
    taxDetail: false,
    zoning: true,
    zoningAuthorityDetection: true,
    taxComparables: false,
    hbuInputs: true,
  },
  knownLimitations: [
    'Zoning covers unincorporated Adams County only — incorporated city parcels (Aurora, Thornton, Westminster, etc.) are excluded.',
    'Assessor detail (owner, valuation, building) not yet implemented — requires scraping gisapp.adcogov.org.',
    'Tax data not yet implemented — adcotax.com uses session-based JSP, not a REST API.',
    'Owner/APN search is not yet implemented — detail requires a click on a map parcel.',
  ],
};
