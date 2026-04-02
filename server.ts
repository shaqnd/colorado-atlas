import express, { type Request, type Response } from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;

type ProxyConfig = {
  routePrefix: string;
  targetOrigin: string;
  targetPrefix: string;
  headers?: Record<string, string>;
};

type DenverBuildingData = {
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
};

type DenverParcelValuationData = {
  parid: string;
  appraisedLandValue: number | null;
  appraisedImprovementValue: number | null;
  appraisedTotalValue: number | null;
  assessedLandValue: number | null;
  assessedImprovementValue: number | null;
  assessedTotalValue: number | null;
};

type DouglasBuildingData = {
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
};

type DouglasTaxReportData = {
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
};

type DouglasParcelData = {
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
};

type ArapahoeBuildingData = {
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
};

type ArapahoeTaxData = {
  taxYear: number | null;
  payableYear: number | null;
  lastUpdated: string | null;
  taxableValue: number | null;
  taxableSchoolValue: number | null;
  totalTaxRate: number | null;
  assessedTax: number | null;
  totalDue: number | null;
  amountPaid: number | null;
};

type ArapahoeParcelData = {
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
};

type ArapahoeZoningData = {
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
};

async function proxyGet(req: Request, res: Response, config: ProxyConfig) {
  const incomingUrl = new URL(req.originalUrl, `http://${req.headers.host ?? 'localhost'}`);
  const upstreamPath = incomingUrl.pathname.replace(config.routePrefix, config.targetPrefix);
  const upstreamUrl = new URL(`${upstreamPath}${incomingUrl.search}`, config.targetOrigin);

  try {
    const upstream = await fetch(upstreamUrl, {
      headers: {
        accept: req.headers.accept ?? '*/*',
        ...config.headers,
      },
    });

    res.status(upstream.status);

    const contentType = upstream.headers.get('content-type');
    const cacheControl = upstream.headers.get('cache-control');
    if (contentType) res.setHeader('content-type', contentType);
    if (cacheControl) res.setHeader('cache-control', cacheControl);

    const body = Buffer.from(await upstream.arrayBuffer());
    res.send(body);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown proxy error';
    res.status(502).json({ error: `Upstream service unreachable: ${message}` });
  }
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function toStringValue(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text ? text : null;
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function stripHtml(value: string): string {
  return decodeHtmlEntities(value)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractLabeledNumber(text: string, label: string): number | null {
  const pattern = new RegExp(`${escapeRegExp(label)}\\s*:?\\s*\\$?(-?[0-9][0-9,]*(?:\\.[0-9]+)?)`, 'i');
  const match = text.match(pattern);
  return match ? toNumber(match[1]?.replace(/,/g, '')) : null;
}

function toMoney(value: string | null): number | null {
  if (!value) return null;
  return toNumber(value.replace(/[$,%\s]/g, '').replace(/,/g, ''));
}

function toIsoDate(value: unknown): string | null {
  const num = toNumber(value);
  if (num === null) return null;
  const date = new Date(num);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function extractHtmlById(html: string, id: string): string | null {
  const pattern = new RegExp(`<[^>]+id=["']${escapeRegExp(id)}["'][^>]*>([\\s\\S]*?)<\\/[^>]+>`, 'i');
  const match = html.match(pattern);
  return match ? stripHtml(match[1]) : null;
}

function extractMatch(html: string, pattern: RegExp): string | null {
  const match = html.match(pattern);
  return match?.[1] ? decodeHtmlEntities(match[1]).trim() : null;
}

function normalizeArapahoeAin(rawAin: string): string[] {
  const trimmed = rawAin.trim();
  const digitsOnly = trimmed.replace(/\D/g, '');
  const candidates = new Set<string>();

  if (trimmed) candidates.add(trimmed);
  if (digitsOnly) {
    candidates.add(digitsOnly);
    if (digitsOnly.length === 12) {
      candidates.add(
        `${digitsOnly.slice(0, 4)}-${digitsOnly.slice(4, 6)}-${digitsOnly.slice(6, 7)}-${digitsOnly.slice(7, 9)}-${digitsOnly.slice(9)}`
      );
    }
  }

  return Array.from(candidates);
}

function toAbsoluteUrl(baseUrl: string, maybeRelative: string | null): string | null {
  if (!maybeRelative) return null;
  try {
    return new URL(maybeRelative, baseUrl).toString();
  } catch {
    return null;
  }
}

function parseArapahoeBuilding(detailHtml: string): ArapahoeBuildingData | null {
  const readAttrValue = (labelId: string) => {
    const label = extractHtmlById(detailHtml, labelId);
    if (!label) return null;
    const labelText = stripHtml(label).trim();
    const pattern = new RegExp(`${escapeRegExp(labelText)}<\\/span><\\/div><\\/td>\\s*<td[^>]*>\\s*<div>([^<]*)<`, 'i');
    const match = detailHtml.match(pattern);
    return match ? stripHtml(match[1]).trim() || null : null;
  };

  const totalBuildingSqft = toNumber(extractMatch(detailHtml, /Bldg Total Area:<\/b><\/td><td[^>]*><div[^>]*>([0-9,]+)/i)?.replace(/,/g, ''));
  const firstFloorSqft = toNumber(extractMatch(detailHtml, /First Floor<\/div><\/td><td[^>]*><div>([0-9,]+)/i)?.replace(/,/g, ''));
  const basementTotalSqft = toNumber(extractMatch(detailHtml, /Basement Total<\/div><\/td><td[^>]*><div>([0-9,]+)/i)?.replace(/,/g, ''));
  const basementFinishedSqft = toNumber(extractMatch(detailHtml, /Basement Finish<\/div><\/td><td[^>]*><div>([0-9,]+)/i)?.replace(/,/g, ''));
  const secondFloorMatches = [...detailHtml.matchAll(/Second Floor<\/div><\/td><td[^>]*><div>([0-9,]+)/gi)];
  const secondFloorSqft = secondFloorMatches.length
    ? secondFloorMatches.reduce((sum, match) => sum + (toNumber(match[1]?.replace(/,/g, '')) ?? 0), 0)
    : null;

  const building: ArapahoeBuildingData = {
    qualityGrade: readAttrValue('ucParcelResdBuild_rptrResdBuild_lblQualityGradeTitle_0'),
    improvementType: readAttrValue('ucParcelResdBuild_rptrResdBuild_lblImpTypeTitle_0'),
    bedrooms: toNumber(readAttrValue('ucParcelResdBuild_rptrResdBuild_lblBedroomTitle_0')),
    bathrooms: toNumber(readAttrValue('ucParcelResdBuild_rptrResdBuild_Label4_0')),
    architecturalStyle: readAttrValue('ucParcelResdBuild_rptrResdBuild_lblArchitecturalTitle_0'),
    floors: toNumber(readAttrValue('ucParcelResdBuild_rptrResdBuild_Label3_0')),
    heatMethod: readAttrValue('ucParcelResdBuild_rptrResdBuild_Label1_0'),
    coolMethod: readAttrValue('ucParcelResdBuild_rptrResdBuild_lblAirCondTitle_0'),
    yearBuilt: toNumber(readAttrValue('ucParcelResdBuild_rptrResdBuild_lblYearBuiltTitle_0')),
    roofType: readAttrValue('ucParcelResdBuild_rptrResdBuild_lblRoofTypeTitle_0'),
    fireplaces: toNumber(readAttrValue('ucParcelResdBuild_rptrResdBuild_Label2_0')),
    exteriorWall: readAttrValue('ucParcelResdBuild_rptrResdBuild_Label5_0'),
    constructionType: readAttrValue('ucParcelResdBuild_rptrResdBuild_Label7_0'),
    totalBuildingSqft,
    firstFloorSqft,
    secondFloorSqft,
    basementTotalSqft,
    basementFinishedSqft,
  };

  return Object.values(building).some((value) => value !== null) ? building : null;
}

function parseArapahoeTaxPage(taxHtml: string): ArapahoeTaxData | null {
  const titleMatch = taxHtml.match(/Property Taxes for\s+(\d{4})\s+Payable\s+(\d{4})/i);

  const data: ArapahoeTaxData = {
    taxYear: titleMatch ? Number(titleMatch[1]) : null,
    payableYear: titleMatch ? Number(titleMatch[2]) : null,
    lastUpdated: extractHtmlById(taxHtml, 'ContentPlaceHolder1_lblUpdateDate'),
    taxableValue: toMoney(extractHtmlById(taxHtml, 'ContentPlaceHolder1_lblTaxableValue')),
    taxableSchoolValue: toMoney(extractHtmlById(taxHtml, 'ContentPlaceHolder1_lblTaxableSchoolValue')),
    totalTaxRate: toMoney(extractHtmlById(taxHtml, 'ContentPlaceHolder1_lblMilllevy')),
    assessedTax: toMoney(extractHtmlById(taxHtml, 'ContentPlaceHolder1_lblOrigTaxAmt')),
    totalDue: toMoney(extractHtmlById(taxHtml, 'ContentPlaceHolder1_lblTaxFull')),
    amountPaid: toMoney(extractHtmlById(taxHtml, 'ContentPlaceHolder1_lblPaidTotal')),
  };

  return Object.values(data).some((value) => value !== null) ? data : null;
}

function sumDouglasTaxAuthorityMillLevy(detailJson: Record<string, unknown>): number | null {
  if (!Array.isArray(detailJson.taxAuthorities)) return null;

  let total = 0;
  let foundAny = false;

  for (const authority of detailJson.taxAuthorities as Record<string, unknown>[]) {
    if (!Array.isArray(authority?.funds)) continue;
    for (const fund of authority.funds as Record<string, unknown>[]) {
      const millLevy = toNumber(fund.millLevy) ?? 0;
      const alternateMillLevy = toNumber(fund.alternateMillLevy) ?? 0;
      if (millLevy !== 0 || alternateMillLevy !== 0) {
        foundAny = true;
      }
      total += millLevy + alternateMillLevy;
    }
  }

  return foundAny ? total : null;
}

async function fetchDouglasLatestTaxReport(accountNo: string, currentYear: number): Promise<DouglasTaxReportData | null> {
  const candidateUrls = [
    `https://pubreports.douglas.co.us/Home/index/EstimatedTaxes${currentYear}/${encodeURIComponent(accountNo)}`,
    `https://pubreports.douglas.co.us/Home/index/EstimatedTaxes/${encodeURIComponent(accountNo)}`,
    `https://pubreports.douglas.co.us/Home/index/EstimatedTaxes${currentYear - 1}/${encodeURIComponent(accountNo)}`,
  ];

  for (const sourceUrl of candidateUrls) {
    try {
      const upstream = await fetch(sourceUrl, {
        headers: {
          accept: 'text/html,application/xhtml+xml',
        },
      });
      if (!upstream.ok) continue;

      const html = await upstream.text();
      const text = stripHtml(html);
      const taxYearMatch = text.match(/(\d{4})\s+Property Values\s*&\s*Estimated Taxes/i);
      const estimatedTaxes = extractLabeledNumber(text, 'Estimated Taxes');
      const millLevy = extractLabeledNumber(text, 'Mill Levy');

      if (estimatedTaxes === null && millLevy === null) continue;

      return {
        taxYear: taxYearMatch ? Number(taxYearMatch[1]) : null,
        totalActualValue: extractLabeledNumber(text, 'Total Actual Value'),
        legislativeAdjustment: extractLabeledNumber(text, 'Legislative Adjustment'),
        taxableActualValue: extractLabeledNumber(text, 'Taxable Actual Value'),
        taxableAssessedValue: extractLabeledNumber(text, 'Taxable Assessed Value'),
        millLevy,
        taxRatePercent: extractLabeledNumber(text, 'Tax Rate'),
        estimatedTaxes,
        estimatedRefund: extractLabeledNumber(text, 'Estimated Refund'),
        sourceUrl,
      };
    } catch {
      continue;
    }
  }

  return null;
}

async function queryArcGisTable<T>(url: string, where: string, outFields: string): Promise<T | null> {
  const params = new URLSearchParams({
    where,
    outFields,
    returnGeometry: 'false',
    f: 'json',
  });

  const res = await fetch(`${url}/query?${params}`);
  if (!res.ok) {
    throw new Error(`ArcGIS table returned ${res.status}`);
  }

  const json = await res.json() as {
    features?: Array<{ attributes?: T }>;
    error?: { message?: string };
  };

  if (json.error) {
    throw new Error(json.error.message ?? 'ArcGIS query failed');
  }

  return json.features?.[0]?.attributes ?? null;
}

function buildParidWhereClause(rawParid: string): string {
  const candidates = new Set<string>();
  const trimmed = rawParid.trim();
  if (trimmed) candidates.add(trimmed);

  const digitsOnly = trimmed.replace(/\D/g, '');
  if (digitsOnly) {
    candidates.add(digitsOnly);
    if (digitsOnly.length === 12) candidates.add(`${digitsOnly}0`);
    if (digitsOnly.length === 13 && digitsOnly.endsWith('0')) candidates.add(digitsOnly.slice(0, -1));
  }

  return Array.from(candidates)
    .map((candidate) => `PARID = '${candidate.replace(/'/g, "''")}'`)
    .join(' OR ');
}

function normalizeDenverResidentialRecord(
  parid: string,
  attributes: Record<string, unknown>
): DenverBuildingData {
  const aboveGradeSqft = toNumber(attributes.AREA_ABG);
  const basementSqft = toNumber(attributes.BSMT_AREA);

  return {
    source: 'residential',
    parid,
    neighborhoodName: toStringValue(attributes.NBHD_1_CN),
    propertyClass: toStringValue(attributes.PROP_CLASS),
    totalBuildingSqft:
      aboveGradeSqft !== null || basementSqft !== null
        ? (aboveGradeSqft ?? 0) + (basementSqft ?? 0)
        : null,
    aboveGradeSqft,
    basementSqft,
    finishedBasementSqft: toNumber(attributes.FBSMT_SQFT),
    grossAreaSqft: null,
    netAreaSqft: null,
    groundFloorSqft: toNumber(attributes.GRD_AREA),
    floors: toNumber(attributes.STORY),
    units: toNumber(attributes.UNITS),
    yearBuilt: toNumber(attributes.CCYRBLT),
    remodelYear: toNumber(attributes.CCAGE_RM),
    style: toStringValue(attributes.STYLE_CN),
    buildingName: null,
  };
}

function normalizeDenverCommercialRecord(
  parid: string,
  attributes: Record<string, unknown>
): DenverBuildingData {
  return {
    source: 'commercial',
    parid,
    neighborhoodName: toStringValue(attributes.NBHD_1_CN),
    propertyClass: toStringValue(attributes.PROPERTY_CLASS_DESC),
    totalBuildingSqft: toNumber(attributes.TOTL_SQFT),
    aboveGradeSqft: null,
    basementSqft: toNumber(attributes.BSMT_AREA),
    finishedBasementSqft: toNumber(attributes.FBSMT_SQFT),
    grossAreaSqft: toNumber(attributes.GROSS_AREA),
    netAreaSqft: toNumber(attributes.NET_AREA),
    groundFloorSqft: null,
    floors: toNumber(attributes.NO_FLOORS),
    units: toNumber(attributes.TOT_UNITS),
    yearBuilt: toNumber(attributes.ORIG_YOC),
    remodelYear: toNumber(attributes.REMODEL),
    style: toStringValue(attributes.D_CLASS_CN),
    buildingName: toStringValue(attributes.BLD_NAME),
  };
}

const proxyConfigs: ProxyConfig[] = [
  {
    routePrefix: '/api/nominatim',
    targetOrigin: 'https://nominatim.openstreetmap.org',
    targetPrefix: '',
    headers: {
      'User-Agent': 'ColoradoAtlas/1.0 (contact@coloradoatlas.local)',
      'Accept-Language': 'en',
    },
  },
  {
    routePrefix: '/api/denver-zoning',
    targetOrigin: 'https://denvergov.org',
    targetPrefix: '/maps/data/Zoning/MapServer',
  },
  {
    routePrefix: '/api/fema-nfhl',
    targetOrigin: 'https://hazards.fema.gov',
    targetPrefix: '/arcgis/rest/services/public/NFHL/MapServer',
  },
  {
    routePrefix: '/api/wildfire',
    targetOrigin: 'https://imagery.geoplatform.gov',
    targetPrefix: '/iipp/rest/services/Fire_Aviation/USFS_EDW_RMRS_WildfireHazardPotentialClassified/ImageServer',
  },
  {
    routePrefix: '/api/esri-co',
    targetOrigin: 'https://gis.colorado.gov',
    targetPrefix: '/public/rest/services',
  },
  {
    routePrefix: '/api/douglas-parcels',
    targetOrigin: 'https://services.arcgis.com',
    targetPrefix: '/seTexOicoRXDvRsJ/ArcGIS/rest/services/Parcels_A_view/FeatureServer/0',
  },
];

const DENVER_RESIDENTIAL_TABLE =
  'https://services1.arcgis.com/zdB7qR0BtYrg0Xpl/arcgis/rest/services/ODC_real_property_residential_characteristics/FeatureServer/59';
const DENVER_COMMERCIAL_TABLE =
  'https://services1.arcgis.com/zdB7qR0BtYrg0Xpl/arcgis/rest/services/ODC_real_property_apartment_and_commercial_characteristics/FeatureServer/58';
const DENVER_PARCEL_VALUATION_LAYER =
  'https://services1.arcgis.com/zdB7qR0BtYrg0Xpl/arcgis/rest/services/ODC_PROP_PARCELS_A/FeatureServer/245';

for (const config of proxyConfigs) {
  app.get(new RegExp(`^${config.routePrefix}(?:/.*)?$`), (req, res) => {
    void proxyGet(req, res, config);
  });
}

app.get('/api/denver-neighborhoods', async (_req, res) => {
  const upstreamUrl =
    'https://services1.arcgis.com/zdB7qR0BtYrg0Xpl/arcgis/rest/services/ODC_ADMN_NEIGHBORHOOD_A/FeatureServer/13/query?where=1%3D1&outFields=*&returnGeometry=true&f=geojson';

  try {
    const upstream = await fetch(upstreamUrl, {
      headers: {
        accept: 'application/geo+json,application/json,text/plain,*/*',
      },
    });

    if (!upstream.ok) {
      res.status(upstream.status).json({ error: `Denver neighborhoods upstream returned ${upstream.status}` });
      return;
    }

    const contentType = upstream.headers.get('content-type');
    if (contentType) res.setHeader('content-type', contentType);

    const body = Buffer.from(await upstream.arrayBuffer());
    res.send(body);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown proxy error';
    res.status(502).json({ error: `Denver neighborhoods upstream unreachable: ${message}` });
  }
});

app.get('/api/denver-zoning-point', async (req, res) => {
  const lat = typeof req.query.lat === 'string' ? Number(req.query.lat) : NaN;
  const lng = typeof req.query.lng === 'string' ? Number(req.query.lng) : NaN;

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    res.status(400).json({ error: 'lat and lng query params are required' });
    return;
  }

  const upstreamUrl = new URL('https://denvergov.org/maps/data/Zoning/MapServer/1/query');
  upstreamUrl.search = new URLSearchParams({
    geometry: JSON.stringify({ x: lng, y: lat }),
    geometryType: 'esriGeometryPoint',
    inSR: '4326',
    spatialRel: 'esriSpatialRelIntersects',
    outFields: 'ZONE_DISTRICT,ZONE_DESCRIPTION,ZONE_DIST_TYPE,NBHD_CONTEXT,OVERLAY_DISTRICT,ADU,HEIGHT_STORIES,PUD_NUM,PUD_DOCUMENT,ORD_NUM,ORD_YEAR',
    returnGeometry: 'false',
    f: 'json',
  }).toString();

  try {
    const upstream = await fetch(upstreamUrl, {
      headers: { accept: 'application/json,text/plain,*/*' },
    });

    if (!upstream.ok) {
      res.status(upstream.status).json({ error: `Denver zoning upstream returned ${upstream.status}` });
      return;
    }

    const json = await upstream.json() as { features?: Array<{ attributes?: Record<string, unknown> }>; error?: { message?: string } };
    if (json.error) {
      res.status(502).json({ error: json.error.message ?? 'Denver zoning lookup failed' });
      return;
    }

    const attributes = json.features?.[0]?.attributes;
    if (!attributes) {
      res.json({ data: null });
      return;
    }

    const s = (key: string) => {
      const value = attributes[key];
      return value === null || value === undefined || value === '' ? null : String(value).trim() || null;
    };
    const n = (key: string) => {
      const value = Number(attributes[key]);
      return Number.isFinite(value) ? value : null;
    };

    res.json({
      data: {
        zoneDistrict: s('ZONE_DISTRICT'),
        zoneDescription: s('ZONE_DESCRIPTION'),
        zoneDistType: s('ZONE_DIST_TYPE'),
        nbhdContext: s('NBHD_CONTEXT'),
        overlayDistrict: s('OVERLAY_DISTRICT'),
        aduAllowed: s('ADU'),
        heightStories: n('HEIGHT_STORIES'),
        pudNum: s('PUD_NUM'),
        pudDocument: s('PUD_DOCUMENT'),
        ordNum: n('ORD_NUM'),
        ordYear: n('ORD_YEAR'),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Denver zoning lookup error';
    res.status(502).json({ error: `Denver zoning lookup failed: ${message}` });
  }
});

app.get('/api/denver-building', async (req, res) => {
  const parid = typeof req.query.parid === 'string' ? req.query.parid.trim() : '';
  if (!parid) {
    res.status(400).json({ error: 'parid query param required' });
    return;
  }

  const where = buildParidWhereClause(parid);

  try {
    const [residential, commercial] = await Promise.all([
      queryArcGisTable<Record<string, unknown>>(
        DENVER_RESIDENTIAL_TABLE,
        where,
        'PARID,NBHD_1_CN,PROP_CLASS,AREA_ABG,BSMT_AREA,FBSMT_SQFT,GRD_AREA,STORY,UNITS,CCYRBLT,CCAGE_RM,STYLE_CN'
      ),
      queryArcGisTable<Record<string, unknown>>(
        DENVER_COMMERCIAL_TABLE,
        where,
        'PARID,NBHD_1_CN,PROPERTY_CLASS_DESC,BLD_NAME,GROSS_AREA,NET_AREA,BSMT_AREA,FBSMT_SQFT,NO_FLOORS,TOTL_SQFT,ORIG_YOC,REMODEL,TOT_UNITS,D_CLASS_CN'
      ),
    ]);

    const data =
      residential ? normalizeDenverResidentialRecord(parid, residential) :
      commercial ? normalizeDenverCommercialRecord(parid, commercial) :
      null;

    res.json({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Denver building lookup error';
    res.status(502).json({ error: `Denver building lookup failed: ${message}` });
  }
});

app.get('/api/denver-valuation', async (req, res) => {
  const parid = typeof req.query.parid === 'string' ? req.query.parid.trim() : '';
  if (!parid) {
    res.status(400).json({ error: 'parid query param required' });
    return;
  }

  const where = buildParidWhereClause(parid).replaceAll('PARID', 'SCHEDNUM');

  try {
    const attributes = await queryArcGisTable<Record<string, unknown>>(
      DENVER_PARCEL_VALUATION_LAYER,
      where,
      [
        'SCHEDNUM',
        'APPRAISED_LAND_VALUE',
        'APPRAISED_IMP_VALUE',
        'APPRAISED_TOTAL_VALUE',
        'ASSESSED_LAND_VALUE_LOCAL',
        'ASSESSED_BLDG_VALUE_LOCAL',
        'ASSESSED_TOTAL_VALUE_LOCAL',
      ].join(',')
    );

    if (!attributes) {
      res.json({ data: null });
      return;
    }

    const data: DenverParcelValuationData = {
      parid: toStringValue(attributes.SCHEDNUM) ?? parid,
      appraisedLandValue: toNumber(attributes.APPRAISED_LAND_VALUE),
      appraisedImprovementValue: toNumber(attributes.APPRAISED_IMP_VALUE),
      appraisedTotalValue: toNumber(attributes.APPRAISED_TOTAL_VALUE),
      assessedLandValue: toNumber(attributes.ASSESSED_LAND_VALUE_LOCAL),
      assessedImprovementValue: toNumber(attributes.ASSESSED_BLDG_VALUE_LOCAL),
      assessedTotalValue: toNumber(attributes.ASSESSED_TOTAL_VALUE_LOCAL),
    };

    res.json({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Denver valuation lookup error';
    res.status(502).json({ error: `Denver valuation lookup failed: ${message}` });
  }
});

function pickDouglasPrimaryBuilding(buildings: unknown): Record<string, unknown> | null {
  if (!Array.isArray(buildings) || buildings.length === 0) return null;
  const typedBuildings = buildings.filter((value): value is Record<string, unknown> => !!value && typeof value === 'object');
  if (typedBuildings.length === 0) return null;
  return typedBuildings.reduce((best, current) => {
    const currentSqft = toNumber(current.squareFeet) ?? 0;
    const bestSqft = toNumber(best.squareFeet) ?? 0;
    return currentSqft > bestSqft ? current : best;
  });
}

function toDouglasBuildingData(building: Record<string, unknown> | null): DouglasBuildingData | null {
  if (!building) return null;

  const styles = Array.isArray(building.styles) ? building.styles as Record<string, unknown>[] : [];
  const primaryStyle = styles.find((style) => style?.isPrimary) ?? styles[0] ?? null;

  const details = Array.isArray(building.details) ? building.details as Record<string, unknown>[] : [];
  const uses = Array.isArray(building.uses) ? building.uses as Record<string, unknown>[] : [];
  const primaryUse = uses.find((use) => use?.isPrimary) ?? uses[0] ?? null;

  return {
    propertyType: toStringValue(building.propertyType),
    totalBuildingSqft: toNumber(building.squareFeet),
    basementSqft: null,
    floors: toNumber(primaryStyle?.numberOfStories),
    units:
      toNumber(primaryStyle?.totalUnitCount) ??
      details.reduce<number | null>((sum, detail) => {
        const unitCount = toNumber(detail?.unitCount);
        if (unitCount === null) return sum;
        return (sum ?? 0) + unitCount;
      }, null),
    yearBuilt: toNumber(primaryStyle?.builtYear),
    remodelYear: toNumber(primaryStyle?.remodeledYear),
    style: toStringValue(primaryStyle?.styleCodeDescription),
    useDescription: toStringValue(primaryUse?.useCodeDescription),
    constructionDescription: toStringValue(primaryStyle?.abstractCodeDescription),
  };
}

app.get('/api/douglas-detail', async (req, res) => {
  const accountNo = typeof req.query.accountNo === 'string' ? req.query.accountNo.trim() : '';
  if (!accountNo) {
    res.status(400).json({ error: 'accountNo query param required' });
    return;
  }

  const nowYear = new Date().getFullYear();
  const candidateYears = [nowYear, nowYear - 1];

  let detailJson: Record<string, unknown> | null = null;

  for (const year of candidateYears) {
    const upstreamUrl = `https://apps.douglas.co.us/realware/DATA/${year}/detail/${encodeURIComponent(accountNo)}.json`;
    try {
      const upstream = await fetch(upstreamUrl, { headers: { accept: 'application/json' } });
      if (!upstream.ok) continue;
      const contentType = upstream.headers.get('content-type') ?? '';
      if (!contentType.includes('json')) continue;
      detailJson = await upstream.json() as Record<string, unknown>;
      break;
    } catch {
      continue;
    }
  }

  if (!detailJson) {
    res.json({ data: null });
    return;
  }

  const primaryBuilding = toDouglasBuildingData(pickDouglasPrimaryBuilding(detailJson.buildings));
  const latestTaxReport = await fetchDouglasLatestTaxReport(accountNo, nowYear);
  const stateParcelNumber = toStringValue(detailJson.stateParcelNumber);
  const totalAssessedValue = toNumber(detailJson.totalAssessedValue);
  const totalActualValue = toNumber(detailJson.totalActualValue);
  const reducedMillLevy = toNumber(detailJson.reducedMillLevy);
  const fullMillLevy = latestTaxReport?.millLevy ?? sumDouglasTaxAuthorityMillLevy(detailJson);
  const locationAddress = Array.isArray(detailJson.addresses)
    ? (() => {
        const addresses = detailJson.addresses as Record<string, unknown>[];
        const primaryAddress = addresses.find((address) => address?.isPrimary) ?? addresses[0] ?? null;
        if (!primaryAddress) return null;
        const street = toStringValue(primaryAddress.street);
        const city = toStringValue(primaryAddress.city);
        const zip = toStringValue(primaryAddress.zipCode);
        return [street, [city, zip].filter(Boolean).join(' ')].filter(Boolean).join(', ') || null;
      })()
    : null;
  const owners = Array.isArray(detailJson.owners) ? detailJson.owners as Record<string, unknown>[] : [];
  const ownerName = owners.length > 0 ? toStringValue(owners[0]?.name) : null;
  const mailingAddress = owners.length > 0
    ? (() => {
        const ownerMail = owners[0]?.mailingAddress;
        if (ownerMail && typeof ownerMail === 'object') {
          const addressRecord = ownerMail as Record<string, unknown>;
          return [
            toStringValue(addressRecord.street),
            toStringValue(addressRecord.street2),
            [toStringValue(addressRecord.city), toStringValue(addressRecord.state), toStringValue(addressRecord.zipCode)].filter(Boolean).join(' '),
          ].filter(Boolean).join(', ') || null;
        }
        return null;
      })()
    : null;

  const data: DouglasParcelData = {
    accountNumber: accountNo,
    stateParcelNumber,
    parcelType: toStringValue(detailJson.parcelType),
    accountSubtypeCode: toStringValue(detailJson.accountSubtypeCode),
    locationAddress,
    cityName: Array.isArray(detailJson.addresses)
      ? toStringValue((detailJson.addresses as Record<string, unknown>[]).find((address) => address?.isPrimary)?.city)
      : null,
    ownerName,
    mailingAddress,
    legalDescription: toStringValue(detailJson.legalDescription),
    subdivision: toStringValue(detailJson.subdivision),
    zoningCode: toStringValue(detailJson.zoningCode),
    zoningCodeDescription: toStringValue(detailJson.zoningCodeDescription),
    taxDistrictNumber: toStringValue(detailJson.taxDistrictNumber),
    totalActualValue: totalActualValue ?? latestTaxReport?.totalActualValue ?? latestTaxReport?.taxableActualValue ?? null,
    totalAssessedValue,
    reducedMillLevy,
    fullMillLevy,
    estimatedAnnualTax:
      latestTaxReport?.estimatedTaxes ??
      (latestTaxReport?.taxableAssessedValue !== null && latestTaxReport?.taxableAssessedValue !== undefined && fullMillLevy !== null
        ? Math.round((latestTaxReport.taxableAssessedValue * fullMillLevy) / 1000)
        : totalAssessedValue !== null && fullMillLevy !== null
        ? Math.round((totalAssessedValue * fullMillLevy) / 1000)
        : null),
    accountType: toStringValue(detailJson.accountType),
    appraisalType: toStringValue(detailJson.appraisalType),
    propertyType: primaryBuilding?.propertyType ?? null,
    isVacant: Boolean(detailJson.isVacant),
    neighborhoodCodes: Array.isArray(detailJson.neighborhoods)
      ? (detailJson.neighborhoods as Record<string, unknown>[])
          .map((item) => toStringValue(item.code))
          .filter((value): value is string => !!value)
      : [],
    primaryBuilding,
    buildingPermitAuthorityName:
      detailJson.buildingPermitAuthority && typeof detailJson.buildingPermitAuthority === 'object'
        ? toStringValue((detailJson.buildingPermitAuthority as Record<string, unknown>).name)
        : null,
    buildingPermitAuthorityPhone:
      detailJson.buildingPermitAuthority && typeof detailJson.buildingPermitAuthority === 'object'
        ? toStringValue((detailJson.buildingPermitAuthority as Record<string, unknown>).phone)
        : null,
    latestTaxReport,
    detailUrl: `https://apps.douglas.co.us/assessor/web/#/properties/property-details;accountNo=${encodeURIComponent(accountNo)}`,
    estimatedTaxesUrl:
      latestTaxReport?.sourceUrl ??
      `https://pubreports.douglas.co.us/Home/index/EstimatedTaxes/${encodeURIComponent(accountNo)}`,
    neighborhoodInfoUrl: `https://pubreports.douglas.co.us/Home/index/PublicSalesData/${encodeURIComponent(accountNo)}`,
    neighborhoodSalesUrl: `https://co-douglas-residential.comper.info/template.aspx?propertyID=${encodeURIComponent(accountNo)}`,
  };

  res.json({ data });
});

app.get('/api/arapahoe-detail', async (req, res) => {
  const rawAin = typeof req.query.ain === 'string' ? req.query.ain.trim() : '';
  if (!rawAin) {
    res.status(400).json({ error: 'ain query param required' });
    return;
  }

  const ainCandidates = normalizeArapahoeAin(rawAin);
  let detailHtml: string | null = null;
  let resolvedAin: string | null = null;

  for (const candidate of ainCandidates) {
    const detailUrl = `https://parcelsearch.arapahoegov.com/PPINum.aspx?PPINum=${encodeURIComponent(candidate)}`;
    try {
      const upstream = await fetch(detailUrl, { headers: { accept: 'text/html,application/xhtml+xml' } });
      if (!upstream.ok) continue;
      const html = await upstream.text();
      if (/No matching records were found/i.test(html)) continue;
      detailHtml = html;
      resolvedAin = extractHtmlById(html, 'ucParcelHeader_lblAinTxt') ?? candidate;
      break;
    } catch {
      continue;
    }
  }

  if (!detailHtml || !resolvedAin) {
    res.json({ data: null });
    return;
  }

  const detailUrl = `https://parcelsearch.arapahoegov.com/PPINum.aspx?PPINum=${encodeURIComponent(resolvedAin)}`;
  const pin = extractHtmlById(detailHtml, 'ucParcelHeader_lblPinTxt');
  const levyHref =
    extractMatch(detailHtml, /<a[^>]+href=['"]([^'"]*Levy\.aspx\?id=[^'"]+)['"][^>]*>\s*Tax District Levies/i) ??
    extractMatch(detailHtml, /window\.open\(&#39;(Levy\.aspx\?id=[^&]+&amp;auth=[^&#]+)&#39;\)/i);
  const noticeHref = extractMatch(detailHtml, /href\s*=\s*['"](\.\/FileDownload\.ashx\?AIN=[^'"]+)['"][^>]*>\s*2025 Traditional Notice of Value/i);
  const salesReportHref = extractMatch(detailHtml, /href=['"](\.\/SalesReport\.aspx\?NBHD=[^'"]+&Year=\d{4})['"]/i);
  const parcelMapHref = extractMatch(detailHtml, /window\.open\('([^']*arapamaplite\/\?PARCEL=[^']+)'/i);
  const taxUrl = pin ? `https://taxsearch.arapahoegov.com/ReReport.aspx?PIN=${encodeURIComponent(pin)}` : null;

  let taxHtml: string | null = null;
  if (taxUrl) {
    try {
      const taxRes = await fetch(taxUrl, { headers: { accept: 'text/html,application/xhtml+xml' } });
      if (taxRes.ok) {
        taxHtml = await taxRes.text();
      }
    } catch {
      // keep null
    }
  }

  const tax = taxHtml ? parseArapahoeTaxPage(taxHtml) : null;

  const data: ArapahoeParcelData = {
    ain: resolvedAin,
    pin,
    situsAddress: extractHtmlById(detailHtml, 'ucParcelHeader_lblSitusAddressTxt'),
    situsCity: extractHtmlById(detailHtml, 'ucParcelHeader_lblSitusCityTxt'),
    ownerName: extractHtmlById(detailHtml, 'ucParcelHeader_lblFullOwnerListTxt'),
    ownershipType: extractHtmlById(detailHtml, 'ucParcelHeader_lblOwnershipTypeTxt'),
    ownerAddress: extractHtmlById(detailHtml, 'ucParcelHeader_lblOwnerAddressTxt'),
    ownerCityStateZip: extractHtmlById(detailHtml, 'ucParcelHeader_lblOwnerCSZTxt'),
    neighborhood: extractHtmlById(detailHtml, 'ucParcelHeader_lblNeighborhoodTxt'),
    neighborhoodCode: extractHtmlById(detailHtml, 'ucParcelHeader_lblNeighborhoodCodeTxt'),
    acreage: toNumber(extractHtmlById(detailHtml, 'ucParcelHeader_lblAcreageTxt')),
    landUse: extractHtmlById(detailHtml, 'ucParcelHeader_lblLandUseTxt'),
    landLineUse: extractMatch(detailHtml, /<td[^>]*colspan=3><div>([^<]+)<\/div><\/td>/i),
    legalDescription: extractHtmlById(detailHtml, 'ucParcelHeader_lblLegalDescTxt'),
    appraisedTotalValue: toMoney(extractHtmlById(detailHtml, 'ucParcelValue_lblApprTotal')),
    appraisedBuildingValue: toMoney(extractHtmlById(detailHtml, 'ucParcelValue_lblApprBuilding')),
    appraisedLandValue: toMoney(extractHtmlById(detailHtml, 'ucParcelValue_lblApprLand')),
    assessedTotalValue: toMoney(extractHtmlById(detailHtml, 'ucParcelValue_lblAssdTotal')),
    assessedBuildingValue: toMoney(extractHtmlById(detailHtml, 'ucParcelValue_lblAssdBuilding')),
    assessedLandValue: toMoney(extractHtmlById(detailHtml, 'ucParcelValue_lblAssdLand')),
    assessedSchoolTotalValue: toMoney(extractHtmlById(detailHtml, 'ucParcelValue_lblAssdSchoolTotal')),
    assessedSchoolBuildingValue: toMoney(extractHtmlById(detailHtml, 'ucParcelValue_lblAssdSchoolBuilding')),
    assessedSchoolLandValue: toMoney(extractHtmlById(detailHtml, 'ucParcelValue_lblAssdSchoolLand')),
    millLevy: toNumber(extractHtmlById(detailHtml, 'ucParcelValue_lnkLevy')),
    building: parseArapahoeBuilding(detailHtml),
    tax,
    detailUrl,
    taxUrl,
    levyUrl: toAbsoluteUrl(detailUrl, levyHref),
    noticeOfValueUrl: toAbsoluteUrl(detailUrl, noticeHref),
    salesReportUrl: toAbsoluteUrl(detailUrl, salesReportHref),
    parcelMapUrl: parcelMapHref,
  };

  res.json({ data });
});

app.get('/api/arapahoe-zoning', async (req, res) => {
  const lat = typeof req.query.lat === 'string' ? Number(req.query.lat) : NaN;
  const lng = typeof req.query.lng === 'string' ? Number(req.query.lng) : NaN;

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    res.status(400).json({ error: 'lat and lng query params required' });
    return;
  }

  const queryPoint = new URLSearchParams({
    geometry: JSON.stringify({ x: lng, y: lat }),
    geometryType: 'esriGeometryPoint',
    inSR: '4326',
    spatialRel: 'esriSpatialRelIntersects',
    returnGeometry: 'false',
    f: 'json',
  });

  const jurisdictionUrl = `https://gis.arapahoegov.com/arcgis/rest/services/ArapaMAP/MapServer/375/query?${queryPoint}&outFields=JURISDICTION,CAMA_NAME,HYPERLINK,IN_COUNTY`;
  const zoningUrl = `https://gis.arapahoegov.com/arcgis/rest/services/ArapaMAP/MapServer/352/query?${queryPoint}&outFields=ZONING,HYPERLINK,CASE_NUMBER,ACTIVE,DATE,AMENDMENT_,Zoning_Doc`;

  try {
    const [jurisdictionRes, zoningRes] = await Promise.all([
      fetch(jurisdictionUrl, { headers: { accept: 'application/json' } }),
      fetch(zoningUrl, { headers: { accept: 'application/json' } }),
    ]);

    if (!jurisdictionRes.ok) {
      res.status(502).json({ error: `Arapahoe jurisdiction service returned ${jurisdictionRes.status}` });
      return;
    }

    const jurisdictionJson = await jurisdictionRes.json() as {
      features?: Array<{ attributes?: Record<string, unknown> }>;
    };
    const zoningJson = zoningRes.ok
      ? await zoningRes.json() as { features?: Array<{ attributes?: Record<string, unknown> }> }
      : null;

    const jurisdictionAttributes = jurisdictionJson.features?.[0]?.attributes ?? {};
    const zoningAttributes = zoningJson?.features?.[0]?.attributes ?? {};
    const jurisdiction = toStringValue(jurisdictionAttributes.JURISDICTION);
    const authorityType: 'county' | 'municipal' =
      !jurisdiction || /unincorporated/i.test(jurisdiction) ? 'county' : 'municipal';

    const data: ArapahoeZoningData = {
      jurisdiction,
      jurisdictionCamaName: toStringValue(jurisdictionAttributes.CAMA_NAME),
      jurisdictionUrl: toStringValue(jurisdictionAttributes.HYPERLINK),
      inCounty: /^y(es)?$/i.test(toStringValue(jurisdictionAttributes.IN_COUNTY) ?? ''),
      authorityType,
      zoningCode: authorityType === 'county' ? toStringValue(zoningAttributes.ZONING) : null,
      zoningUrl: authorityType === 'county' ? toStringValue(zoningAttributes.HYPERLINK) : null,
      zoningDocUrl: authorityType === 'county' ? toStringValue(zoningAttributes.Zoning_Doc) : null,
      caseNumber: authorityType === 'county' ? toStringValue(zoningAttributes.CASE_NUMBER) : null,
      active: authorityType === 'county' ? toStringValue(zoningAttributes.ACTIVE) : null,
      amendment: authorityType === 'county' ? toStringValue(zoningAttributes.AMENDMENT_) : null,
      effectiveDate: authorityType === 'county' ? toIsoDate(zoningAttributes.DATE) : null,
    };

    res.json({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Arapahoe zoning error';
    res.status(502).json({ error: message });
  }
});

/**
 * GET /api/geocode?address=<url-encoded address>
 * Proxies the Census Bureau geocoder to avoid CORS errors from the browser.
 * Returns: { matchedAddress, lat, lng, countyFIPS, countyName, tractGEOID }
 */
app.get('/api/geocode', async (req, res) => {
  const address = req.query.address as string;
  if (!address) {
    res.status(400).json({ error: 'address query param required' });
    return;
  }

  const params = new URLSearchParams({
    address,
    benchmark: 'Public_AR_Current',
    vintage: 'Census2020_Current',
    layers: 'Census Tracts',
    format: 'json',
  });

  const url = new URL(
    `/geocoder/geographies/onelineaddress?${params}`,
    'https://geocoding.geo.census.gov'
  );

  try {
    const censusRes = await fetch(url);
    if (!censusRes.ok) {
      res.status(502).json({ error: `Census geocoder returned ${censusRes.status}` });
      return;
    }

    const json = await censusRes.json() as {
      result?: {
        addressMatches?: Array<{
          matchedAddress?: string;
          coordinates?: { x?: number; y?: number };
          geographies?: {
            Counties?: Array<{ GEOID?: string; NAME?: string }>;
            'Census Tracts'?: Array<{ GEOID?: string }>;
          };
        }>;
      };
    };

    const matches = json.result?.addressMatches;
    if (!matches?.length) {
      res.status(404).json({ error: 'No address match found' });
      return;
    }

    const match = matches[0];
    const county = match.geographies?.Counties?.[0];
    const tract = match.geographies?.['Census Tracts']?.[0];

    res.json({
      matchedAddress: match.matchedAddress ?? null,
      lat: match.coordinates?.y ?? null,
      lng: match.coordinates?.x ?? null,
      countyFIPS: county?.GEOID ?? null,
      countyName: county?.NAME ?? null,
      tractGEOID: tract?.GEOID ?? null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown geocoder error';
    res.status(502).json({ error: `Census geocoder unreachable: ${message}` });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Colorado Atlas API running at http://localhost:${PORT}`);
});
