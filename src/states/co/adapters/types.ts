export interface ColoradoAdapterCapabilities {
  parcelDetail: boolean;
  ownerSearch: boolean;
  landImprovementSplit: boolean;
  taxDetail: boolean;
  zoning: boolean;
  zoningAuthorityDetection: boolean;
  taxComparables: boolean;
  hbuInputs: boolean;
}

export interface ColoradoJurisdictionMetadata {
  state: 'CO';
  county: string;
  municipality?: string | null;
  adapterId: string;
  capabilities: ColoradoAdapterCapabilities;
  knownLimitations: string[];
}
