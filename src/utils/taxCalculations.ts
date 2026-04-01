import { getMillLevy } from '@/data/millLevies';
import { RATES_2026 } from '@/data/assessmentRates';
import type { PropertyType, TaxCalculationResult, TaxEntity } from '@/data/types';

export function calculateTax(
  actualValue: number,
  propertyType: PropertyType,
  countyName: string
): TaxCalculationResult {
  const levy = getMillLevy(countyName);
  const isResidential = propertyType === 'residential';

  if (isResidential) {
    return calculateResidentialTax(actualValue, levy);
  }

  const rate = getNonResidentialRate(propertyType);
  return calculateNonResidentialTax(actualValue, rate, levy, propertyType);
}

function calculateResidentialTax(
  actualValue: number,
  levy: ReturnType<typeof getMillLevy>
): TaxCalculationResult {
  const r = RATES_2026.residential;

  // Local gov assessed value (split-rate with $700k threshold)
  const reductionBase = Math.min(actualValue, 700_000);
  const reduction = reductionBase * r.reductionOnFirst700k;
  const localGovAV = Math.max((actualValue - reduction) * r.localGov, r.minAssessedValue);

  // School assessed value (full actual value, no reduction)
  const schoolAV = actualValue * r.school;

  const entities: TaxEntity[] = [
    {
      name: 'County',
      mills: levy.county,
      assessedValue: localGovAV,
      annualTax: (localGovAV * levy.county) / 1000,
      share: 0,
    },
    {
      name: 'Municipality',
      mills: levy.municipality,
      assessedValue: localGovAV,
      annualTax: (localGovAV * levy.municipality) / 1000,
      share: 0,
    },
    {
      name: 'School District',
      mills: levy.schoolDistrict,
      assessedValue: schoolAV,
      annualTax: (schoolAV * levy.schoolDistrict) / 1000,
      share: 0,
    },
    {
      name: 'Fire District',
      mills: levy.fire,
      assessedValue: localGovAV,
      annualTax: (localGovAV * levy.fire) / 1000,
      share: 0,
    },
    {
      name: 'Water / Sanitation',
      mills: levy.waterSanitation,
      assessedValue: localGovAV,
      annualTax: (localGovAV * levy.waterSanitation) / 1000,
      share: 0,
    },
    {
      name: 'Metro District',
      mills: levy.metroDistrict,
      assessedValue: localGovAV,
      annualTax: (localGovAV * levy.metroDistrict) / 1000,
      share: 0,
    },
    {
      name: 'Library District',
      mills: levy.library,
      assessedValue: localGovAV,
      annualTax: (localGovAV * levy.library) / 1000,
      share: 0,
    },
    {
      name: 'Other',
      mills: levy.other,
      assessedValue: localGovAV,
      annualTax: (localGovAV * levy.other) / 1000,
      share: 0,
    },
  ].filter((e) => e.mills > 0);

  const annualTax = entities.reduce((sum, e) => sum + e.annualTax, 0);

  // Calculate share percentages
  const withShares = entities.map((e) => ({
    ...e,
    share: annualTax > 0 ? (e.annualTax / annualTax) * 100 : 0,
  }));

  return {
    annualTax,
    monthlyTax: annualTax / 12,
    effectiveRate: actualValue > 0 ? (annualTax / actualValue) * 100 : 0,
    totalMills: levy.total,
    localGovAssessedValue: localGovAV,
    schoolAssessedValue: schoolAV,
    isResidential: true,
    entities: withShares,
  };
}

function calculateNonResidentialTax(
  actualValue: number,
  rate: number,
  levy: ReturnType<typeof getMillLevy>,
  propertyType: PropertyType
): TaxCalculationResult {
  const assessedValue = actualValue * rate;

  const entities: TaxEntity[] = [
    { name: 'County', mills: levy.county, assessedValue, annualTax: (assessedValue * levy.county) / 1000, share: 0 },
    { name: 'Municipality', mills: levy.municipality, assessedValue, annualTax: (assessedValue * levy.municipality) / 1000, share: 0 },
    { name: 'School District', mills: levy.schoolDistrict, assessedValue, annualTax: (assessedValue * levy.schoolDistrict) / 1000, share: 0 },
    { name: 'Fire District', mills: levy.fire, assessedValue, annualTax: (assessedValue * levy.fire) / 1000, share: 0 },
    { name: 'Water / Sanitation', mills: levy.waterSanitation, assessedValue, annualTax: (assessedValue * levy.waterSanitation) / 1000, share: 0 },
    { name: 'Metro District', mills: levy.metroDistrict, assessedValue, annualTax: (assessedValue * levy.metroDistrict) / 1000, share: 0 },
    { name: 'Library District', mills: levy.library, assessedValue, annualTax: (assessedValue * levy.library) / 1000, share: 0 },
    { name: 'Other', mills: levy.other, assessedValue, annualTax: (assessedValue * levy.other) / 1000, share: 0 },
  ].filter((e) => e.mills > 0);

  const annualTax = entities.reduce((sum, e) => sum + e.annualTax, 0);

  const withShares = entities.map((e) => ({
    ...e,
    share: annualTax > 0 ? (e.annualTax / annualTax) * 100 : 0,
  }));

  return {
    annualTax,
    monthlyTax: annualTax / 12,
    effectiveRate: actualValue > 0 ? (annualTax / actualValue) * 100 : 0,
    totalMills: levy.total,
    localGovAssessedValue: assessedValue,
    schoolAssessedValue: assessedValue,
    isResidential: false,
    entities: withShares,
  };
}

function getNonResidentialRate(type: PropertyType): number {
  switch (type) {
    case 'commercial_improved': return RATES_2026.commercial_improved;
    case 'commercial_other': return RATES_2026.commercial_other;
    case 'industrial': return RATES_2026.industrial;
    case 'vacant': return RATES_2026.vacant;
    case 'agricultural': return RATES_2026.agricultural;
    case 'personal_property': return RATES_2026.personal_property;
    default: return RATES_2026.commercial_other;
  }
}

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

export function formatPercent(n: number, decimals = 2): string {
  return `${n.toFixed(decimals)}%`;
}
