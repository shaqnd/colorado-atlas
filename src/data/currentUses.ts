import type { CurrentUse } from './types';

export const currentUses: CurrentUse[] = [
  {
    code: 'vacant',
    label: 'Vacant Land',
    intensityScore: 0,
    description: 'Undeveloped, no structures or improvements',
  },
  {
    code: 'surface_parking',
    label: 'Surface Parking Lot',
    intensityScore: 1,
    description: 'At-grade parking only, no vertical development',
  },
  {
    code: 'single_family',
    label: 'Single-Family Residential',
    intensityScore: 2,
    description: 'One detached dwelling unit',
  },
  {
    code: 'duplex',
    label: 'Duplex / Two-Family',
    intensityScore: 3,
    description: 'Two attached or detached units on one parcel',
  },
  {
    code: 'small_multifamily',
    label: 'Small Multi-Family (3–8 units)',
    intensityScore: 4,
    description: 'Triplex, fourplex, or small apartment building',
  },
  {
    code: 'large_multifamily',
    label: 'Large Multi-Family (9+ units)',
    intensityScore: 6,
    description: 'Apartment complex or condominium building',
  },
  {
    code: 'retail',
    label: 'Retail / Restaurant',
    intensityScore: 5,
    description: 'Ground-floor commercial, customer-facing',
  },
  {
    code: 'office',
    label: 'Office',
    intensityScore: 5,
    description: 'Professional, administrative, or medical office',
  },
  {
    code: 'mixed_use',
    label: 'Mixed-Use (Commercial + Residential)',
    intensityScore: 7,
    description: 'Vertical mix of commercial and residential',
  },
  {
    code: 'light_industrial',
    label: 'Light Industrial / Flex',
    intensityScore: 5,
    description: 'Warehouse, light manufacturing, flex/tech space',
  },
  {
    code: 'heavy_industrial',
    label: 'Heavy Industrial',
    intensityScore: 6,
    description: 'Manufacturing, processing, bulk storage',
  },
  {
    code: 'agricultural',
    label: 'Agricultural / Farm',
    intensityScore: 1,
    description: 'Crops, livestock, farm structures',
  },
  {
    code: 'institutional',
    label: 'Institutional / Civic',
    intensityScore: 4,
    description: 'School, church, government, hospital',
  },
];

export const currentUsesByCode: Record<string, CurrentUse> = Object.fromEntries(
  currentUses.map((u) => [u.code, u])
);
