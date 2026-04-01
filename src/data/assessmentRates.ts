import type { AssessmentRate } from './types';

// Colorado property tax assessment rates by classification.
// Sources: CRS 39-1-104, HB24B-1001, SB24-233, SB22-238, SB21-293.

export const assessmentRates: AssessmentRate[] = [
  {
    classification: 'Residential (Local Gov)',
    rate2024: 0.0667,
    rate2025: 0.0625,
    rate2026: 0.068,
    rate2027plus: 0.068,
    notes: '2026+: 10% reduction on first $700k AV; min assessed value $1,000',
  },
  {
    classification: 'Residential (Schools)',
    rate2024: 0.0706,
    rate2025: 0.0705,
    rate2026: 0.0705,
    rate2027plus: 0.0705,
    notes: 'School rate applies to full actual value without $700k reduction',
  },
  {
    classification: 'Commercial (Improved)',
    rate2024: 0.29,
    rate2025: 0.27,
    rate2026: 0.25,
    rate2027plus: 0.25,
    notes: 'Includes retail, office, hotel buildings',
  },
  {
    classification: 'Commercial (Other)',
    rate2024: 0.29,
    rate2025: 0.27,
    rate2026: 0.26,
    rate2027plus: 0.25,
    notes: 'Commercial land without improvements',
  },
  {
    classification: 'Industrial',
    rate2024: 0.29,
    rate2025: 0.27,
    rate2026: 0.26,
    rate2027plus: 0.25,
  },
  {
    classification: 'Vacant Land',
    rate2024: 0.29,
    rate2025: 0.27,
    rate2026: 0.26,
    rate2027plus: 0.25,
  },
  {
    classification: 'Agricultural',
    rate2024: 0.265,
    rate2025: 0.265,
    rate2026: 0.25,
    rate2027plus: 0.25,
    notes: 'Valued on productive capacity, not market value',
  },
  {
    classification: 'Personal Property',
    rate2024: 0.29,
    rate2025: 0.27,
    rate2026: 0.26,
    rate2027plus: 0.25,
    notes: 'Business equipment, machinery, furniture',
  },
  {
    classification: 'State Assessed',
    rate2024: 0.29,
    rate2025: 0.27,
    rate2026: 0.26,
    rate2027plus: 0.25,
    notes: 'Utilities, railroads, airlines',
  },
  {
    classification: 'Producing Mines',
    rate2024: 'Special',
    rate2025: 'Special',
    rate2026: 'Special',
    rate2027plus: 'Special',
    notes: '25% of gross proceeds OR 100% of net proceeds',
  },
];

export interface AssessmentRateResult {
  localGovRate: number;
  schoolRate: number;
  isResidential: boolean;
}

// 2026 rates (current)
export const RATES_2026 = {
  residential: {
    localGov: 0.068,
    school: 0.0705,
    reductionOnFirst700k: 0.10,
    minAssessedValue: 1000,
  },
  commercial_improved: 0.25,
  commercial_other: 0.26,
  industrial: 0.26,
  vacant: 0.26,
  agricultural: 0.25,
  personal_property: 0.26,
} as const;

export const legislativeHistory = [
  {
    year: 1982,
    event: 'Gallagher Amendment',
    description:
      'Constitutional amendment fixing residential assessed value at ~45% of total assessed value statewide. Drove residential rates steadily downward over decades.',
  },
  {
    year: 2020,
    event: 'Gallagher Repeal (Amendment B)',
    description:
      'Voters repealed Gallagher in November 2020, freezing residential assessment rate at 7.15% and allowing legislature to set future rates.',
  },
  {
    year: 2021,
    event: 'SB21-293',
    description:
      'Temporary residential rate reduction to 6.95% for 2022-2023 to offset pandemic-era value increases.',
  },
  {
    year: 2022,
    event: 'SB22-238',
    description:
      'Further temporary reductions: residential 6.765% for 2023, commercial 27.9% for 2023. $700M property tax relief package.',
  },
  {
    year: 2024,
    event: 'SB24-233 / HB24B-1001',
    description:
      'Comprehensive property tax reform. Established 2025 residential rate of 6.25% (local gov) and 7.05% (schools). Created split-rate system with $700k actual value threshold beginning 2026.',
  },
  {
    year: 2026,
    event: 'Split-Rate System Begins',
    description:
      'Residential local gov rate 6.8% with 10% reduction on first $700k of actual value. School rate 7.05% on full value. Non-residential rates continue phased reduction to 25%.',
  },
];
