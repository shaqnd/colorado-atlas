import type { CanonicalModuleEnvelope, RawSourceReference, SourceAttribution } from './provenance';

export interface CanonicalPropertyIdentity {
  internalPropertyId: string;
  sourcePropertyId: string | null;
  parcelNumber: string | null;
  sourceRecordId: string | null;
}

export interface CanonicalPropertyLocation {
  address: string | null;
  city: string | null;
  county: string;
  state: string;
  zipCode: string | null;
  latitude: number | null;
  longitude: number | null;
  geometry: GeoJSON.Geometry | null;
  municipality: string | null;
  neighborhood: string | null;
  submarket: string | null;
  countyFips?: string | null;
}

export interface OwnershipModule {
  ownerName: string | null;
  ownerType: string | null;
  ownerMailingAddress: string | null;
  ownershipLastUpdated?: string | null;
}

export interface LandBuildingModule {
  propertyType: string | null;
  landAreaSqft: number | null;
  landAreaAcres: number | null;
  buildingAreaSqft: number | null;
  grossBuildingAreaSqft: number | null;
  netRentableAreaSqft: number | null;
  units: number | null;
  yearBuilt: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  stories: number | null;
  useCode: string | null;
  useDescription: string | null;
  buildingLastUpdated?: string | null;
}

export interface SaleRecord {
  saleDate: string | null;
  salePrice: number | null;
  buyerName?: string | null;
  sellerName?: string | null;
  documentNumber?: string | null;
}

export interface TransactionModule {
  lastSaleDate: string | null;
  lastSalePrice: number | null;
  saleHistory: SaleRecord[];
  transactionLastUpdated?: string | null;
}

export interface TaxDistrict {
  districtName: string;
  mills: number | null;
  category?: string | null;
}

export interface TaxModule {
  taxYear: number | null;
  actualValue: number | null;
  assessedValue: number | null;
  assessmentRate: number | null;
  millLevy: number | null;
  estimatedAnnualTax: number | null;
  taxLiabilityPerSqft: number | null;
  taxLiabilityPerUnit: number | null;
  taxDistricts: TaxDistrict[];
  taxLastUpdated?: string | null;
}

export interface ZoningModule {
  zoningCode: string | null;
  zoningLabel: string | null;
  zoningDescription: string | null;
  municipalityName: string | null;
  overlayDistricts: string[];
  futureLandUse: string | null;
  zoningLastUpdated?: string | null;
  rawZoningPayload?: unknown;
}

export interface GeographyRiskModule {
  municipality: string | null;
  neighborhood: string | null;
  submarket: string | null;
  schoolDistrict: string | null;
  floodZone: string | null;
  wildfireRisk: string | null;
  politicalDistricts: string[];
  geographyLastUpdated?: string | null;
}

export interface DevelopmentPotentialModule {
  allowedFar: number | null;
  allowedHeight: number | null;
  allowedDensity: number | null;
  allowedUnits: number | null;
  allowedBuildingAreaSqft: number | null;
  lotCoverageLimit: number | null;
  setbacks?: Record<string, number | null>;
  parkingRequirements?: string | null;
  municipalityRulesSource?: SourceAttribution;
  zoningCapacityConfidence: number | null;
  assumptionsUsed: string[];
}

export interface CanonicalPropertyModules {
  ownership?: CanonicalModuleEnvelope<OwnershipModule>;
  landBuilding?: CanonicalModuleEnvelope<LandBuildingModule>;
  transactions?: CanonicalModuleEnvelope<TransactionModule>;
  tax?: CanonicalModuleEnvelope<TaxModule>;
  zoning?: CanonicalModuleEnvelope<ZoningModule>;
  geography?: CanonicalModuleEnvelope<GeographyRiskModule>;
  developmentPotential?: CanonicalModuleEnvelope<DevelopmentPotentialModule>;
}

export interface CanonicalProperty {
  identity: CanonicalPropertyIdentity;
  location: CanonicalPropertyLocation;
  sourceAttribution: SourceAttribution[];
  sourceRecordId: string | null;
  ingestedAt: string;
  normalizedAt: string;
  effectiveDate: string | null;
  confidenceScore: number | null;
  modules: CanonicalPropertyModules;
  rawRefs?: RawSourceReference[];
}
