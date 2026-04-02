/**
 * Parcel data types — structured so any backend (ESRI, county API, custom DB)
 * can be swapped in by updating parcelService.ts without touching UI components.
 */

/**
 * Raw attribute map from Colorado_Public_Parcels FeatureServer (layer 0).
 * Field names confirmed from live service — gis.colorado.gov/public/rest/services/
 * Address_and_Parcel/Colorado_Public_Parcels/FeatureServer/0
 */
export interface EsriParcelAttributes {
  // Identity
  parcel_id?: string;
  account?: string;
  OBJECTID?: number;
  sharing?: string;
  // Owner
  owner?: string;
  owner2?: string;
  ownerAdd?: string;
  ownAddCty?: string;
  ownAddStt?: string;
  ownAddCou?: string;
  ownAddZip?: string;
  // Situs address
  situsAdd?: string;
  sitAddCty?: string;
  sitAddZip?: string;
  // County
  countyName?: string;
  countyFips?: string;
  // Area
  landAcres?: number | null;
  landSqft?: number | null;
  Shape__Area?: number;
  Shape__Length?: number;
  // Zoning / use
  zoningCode?: string;
  zoningDesc?: string;
  landUseCde?: string;
  landUseDsc?: string;
  // Legal
  legalDesc?: string;
  subName?: string;
  subCode?: string;
  block?: string;
  lot?: string;
  // Valuation (stored as strings in this service)
  apprValTot?: string | number;
  asedValTot?: string | number;
  // Sales
  saleDate?: string;
  salePrice?: string | number;
  // Metadata
  dateReceived?: string;
  URL?: string;
  [key: string]: unknown;
}

// ── Normalized domain model — what UI components consume ─────────────────────

export interface ParcelIdentity {
  apn: string;
  legalDescription: string | null;
  subdivision: string | null;
  acreage: number | null;
  sqft: number | null;
}

export interface ParcelOwner {
  name: string;
  mailingAddress: string | null;
}

export interface ParcelLocation {
  situsAddress: string;
  city: string;
  county: string;
  countyFIPS: string | null;
  lat: number;
  lng: number;
}

export interface ParcelZoning {
  code: string | null;
  description: string | null;
  landUseCode: string | null;
  landUseDescription: string | null;
}

export interface ParcelValuation {
  taxYear: number | null;
  assessedValue: number | null;   // County taxable assessed value (asedValTot)
  marketValue: number | null;     // Total appraised/market value (apprValTot)
  landValue: number | null;       // Land-only value (not in statewide ESRI layer)
  improvementValue: number | null; // Building-only value (not in statewide ESRI layer)
  annualTax: number | null;       // Not returned by ESRI; calculated in UI
  lastSaleDate: string | null;
  lastSalePrice: number | null;
}

export interface DenverBuildingData {
  source: 'residential' | 'commercial';
  parid: string;
  neighborhoodName: string | null;
  propertyClass: string | null;
  totalBuildingSqft: number | null;
  aboveGradeSqft: number | null;
  basementSqft: number | null;
  finishedBasementSqft: number | null;
  grossAreaSqft: number | null;
  netAreaSqft: number | null;
  groundFloorSqft: number | null;
  floors: number | null;
  units: number | null;
  yearBuilt: number | null;
  remodelYear: number | null;
  style: string | null;
  buildingName: string | null;
}

export interface DenverParcelValuationData {
  parid: string;
  appraisedLandValue: number | null;
  appraisedImprovementValue: number | null;
  appraisedTotalValue: number | null;
  assessedLandValue: number | null;
  assessedImprovementValue: number | null;
  assessedTotalValue: number | null;
}

export interface DouglasBuildingData {
  propertyType: string | null;
  totalBuildingSqft: number | null;
  basementSqft: number | null;
  floors: number | null;
  units: number | null;
  yearBuilt: number | null;
  remodelYear: number | null;
  style: string | null;
  useDescription: string | null;
  constructionDescription: string | null;
}

export interface DouglasTaxReportData {
  taxYear: number | null;
  totalActualValue: number | null;
  legislativeAdjustment: number | null;
  taxableActualValue: number | null;
  taxableAssessedValue: number | null;
  millLevy: number | null;
  taxRatePercent: number | null;
  estimatedTaxes: number | null;
  estimatedRefund: number | null;
  sourceUrl: string | null;
}

export interface DouglasParcelData {
  accountNumber: string;
  stateParcelNumber: string | null;
  parcelType: string | null;
  accountSubtypeCode: string | null;
  locationAddress: string | null;
  cityName: string | null;
  ownerName: string | null;
  mailingAddress: string | null;
  legalDescription: string | null;
  subdivision: string | null;
  zoningCode: string | null;
  zoningCodeDescription: string | null;
  taxDistrictNumber: string | null;
  totalActualValue: number | null;
  totalAssessedValue: number | null;
  reducedMillLevy: number | null;
  fullMillLevy: number | null;
  estimatedAnnualTax: number | null;
  accountType: string | null;
  appraisalType: string | null;
  propertyType: string | null;
  isVacant: boolean;
  neighborhoodCodes: string[];
  primaryBuilding: DouglasBuildingData | null;
  buildingPermitAuthorityName: string | null;
  buildingPermitAuthorityPhone: string | null;
  latestTaxReport: DouglasTaxReportData | null;
  detailUrl: string;
  estimatedTaxesUrl: string;
  neighborhoodInfoUrl: string;
  neighborhoodSalesUrl: string;
}

export interface ArapahoeBuildingData {
  qualityGrade: string | null;
  improvementType: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  architecturalStyle: string | null;
  floors: number | null;
  heatMethod: string | null;
  coolMethod: string | null;
  yearBuilt: number | null;
  roofType: string | null;
  fireplaces: number | null;
  exteriorWall: string | null;
  constructionType: string | null;
  totalBuildingSqft: number | null;
  firstFloorSqft: number | null;
  secondFloorSqft: number | null;
  basementTotalSqft: number | null;
  basementFinishedSqft: number | null;
}

export interface ArapahoeTaxData {
  taxYear: number | null;
  payableYear: number | null;
  lastUpdated: string | null;
  taxableValue: number | null;
  taxableSchoolValue: number | null;
  totalTaxRate: number | null;
  assessedTax: number | null;
  totalDue: number | null;
  amountPaid: number | null;
}

export interface ArapahoeParcelData {
  ain: string;
  pin: string | null;
  situsAddress: string | null;
  situsCity: string | null;
  ownerName: string | null;
  ownershipType: string | null;
  ownerAddress: string | null;
  ownerCityStateZip: string | null;
  neighborhood: string | null;
  neighborhoodCode: string | null;
  acreage: number | null;
  landUse: string | null;
  landLineUse: string | null;
  legalDescription: string | null;
  appraisedTotalValue: number | null;
  appraisedBuildingValue: number | null;
  appraisedLandValue: number | null;
  assessedTotalValue: number | null;
  assessedBuildingValue: number | null;
  assessedLandValue: number | null;
  assessedSchoolTotalValue: number | null;
  assessedSchoolBuildingValue: number | null;
  assessedSchoolLandValue: number | null;
  millLevy: number | null;
  building: ArapahoeBuildingData | null;
  tax: ArapahoeTaxData | null;
  detailUrl: string;
  taxUrl: string | null;
  levyUrl: string | null;
  noticeOfValueUrl: string | null;
  salesReportUrl: string | null;
  parcelMapUrl: string | null;
}

export interface ArapahoeZoningData {
  jurisdiction: string | null;
  jurisdictionCamaName: string | null;
  jurisdictionUrl: string | null;
  inCounty: boolean;
  authorityType: 'county' | 'municipal';
  zoningCode: string | null;
  zoningUrl: string | null;
  zoningDocUrl: string | null;
  caseNumber: string | null;
  active: string | null;
  amendment: string | null;
  effectiveDate: string | null;
}

// ── Top-level feature ─────────────────────────────────────────────────────────
export interface ParcelFeature {
  /** Stable ID for React keys and dedup */
  id: string;
  identity: ParcelIdentity;
  owner: ParcelOwner;
  location: ParcelLocation;
  zoning: ParcelZoning;
  valuation: ParcelValuation;
  /** GeoJSON geometry for the map polygon layer */
  geometry: GeoJSONGeometry;
  /** Raw ESRI attributes preserved for debugging / unmapped fields */
  _raw: EsriParcelAttributes;
  /** Where the data came from — swap 'esri' → 'api' when real backend is live */
  _source: 'esri' | 'mock' | 'api';
}

// Minimal GeoJSON geometry types (avoids needing @types/geojson)
export type GeoJSONGeometry =
  | { type: 'Point';           coordinates: [number, number] }
  | { type: 'Polygon';         coordinates: [number, number][][] }
  | { type: 'MultiPolygon';    coordinates: [number, number][][][]  }
  | { type: 'LineString';      coordinates: [number, number][] }
  | { type: 'MultiLineString'; coordinates: [number, number][][] };

// ── State machine for parcel selection ───────────────────────────────────────
export type ParcelState =
  | { status: 'idle' }
  | { status: 'loading'; lat: number; lng: number }
  | { status: 'loaded';  feature: ParcelFeature }
  | { status: 'not_found'; lat: number; lng: number; address?: string }
  | { status: 'error';   message: string };

// ── Geocode result ────────────────────────────────────────────────────────────
export interface GeocodeResult {
  lat: number;
  lng: number;
  formattedAddress: string;
  county?: string;
  state?: string;
}
