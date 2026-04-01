import { zoneDistrictsByCode } from '@/data/zoneDistricts';
import { currentUsesByCode } from '@/data/currentUses';
import type { HBUResult, HBUSignal, ZoneDistrict } from '@/data/types';

export interface HBUInput {
  zoneCode: string;
  currentUseCode: string;
  lotSizeSqft: number;
}

export function runHBUAnalysis(input: HBUInput): HBUResult | null {
  const { zoneCode, currentUseCode, lotSizeSqft } = input;

  const district = zoneDistrictsByCode[zoneCode];
  const currentUse = currentUsesByCode[currentUseCode];
  if (!district || !currentUse) return null;

  const signals: HBUSignal[] = [];

  // ── Derived dimensions ─────────────────────────────────────────────────────
  const maxBuildingArea =
    district.maxFAR > 0 ? Math.round(lotSizeSqft * district.maxFAR) : 0;
  const maxDwellingUnits =
    district.maxDensity > 0
      ? Math.floor((lotSizeSqft / 43560) * district.maxDensity)
      : 0;

  // ── Signal rules ───────────────────────────────────────────────────────────

  // 1. Vacant land in developable zone
  if (
    currentUseCode === 'vacant' &&
    district.category !== 'ag' &&
    zoneCode !== 'PUD'
  ) {
    signals.push({
      severity: 'high',
      title: 'Vacant Land in Developable Zone',
      description: `This parcel is unimproved but zoned ${district.code} (${district.name}), which permits development. Vacant land in a developable zone is a primary underutilization signal.`,
    });
  }

  // 2. Surface parking on commercial / mixed-use land
  if (
    currentUseCode === 'surface_parking' &&
    (district.category === 'com' || district.category === 'mix')
  ) {
    signals.push({
      severity: 'high',
      title: 'Surface Parking on Commercial / Mixed-Use Land',
      description: `At-grade parking is typically the lowest-value use of commercially-zoned land. ${district.code} allows up to ${district.maxFAR} FAR — this site may support ${maxBuildingArea.toLocaleString()} sq ft of development.`,
    });
  }

  // 3. Single-family on multi-family zoning (R-3, R-4, R-5)
  if (
    currentUseCode === 'single_family' &&
    ['R-3', 'R-4', 'R-5'].includes(zoneCode)
  ) {
    signals.push({
      severity: 'high',
      title: 'Single-Family Use on Multi-Family Zoning',
      description: `The ${zoneCode} zone allows up to ${district.maxDensity} DU/acre. This ${(lotSizeSqft / 43560).toFixed(2)}-acre lot could support ~${maxDwellingUnits} units. Current single-family occupancy represents significant underutilization.`,
    });
  }

  // 4. Single-family on commercial / mixed-use zoning
  if (
    currentUseCode === 'single_family' &&
    (district.category === 'com' || district.category === 'mix')
  ) {
    signals.push({
      severity: 'high',
      title: 'Residential Use in Commercial / Mixed-Use Zone',
      description: `${zoneCode} (${district.name}) allows commercial and/or mixed uses with up to ${district.maxFAR} FAR. Single-family residential is a low-intensity use relative to the zone's development potential.`,
    });
  }

  // 5. Single-family on duplex zoning (R-2)
  if (currentUseCode === 'single_family' && zoneCode === 'R-2') {
    signals.push({
      severity: 'medium',
      title: 'Single-Family Use in Duplex-Permitted Zone',
      description: `R-2 zoning permits two-family / duplex development. Converting to a duplex or adding an ADU could increase density and income potential without a rezoning.`,
    });
  }

  // 6. Agricultural use in non-agricultural zone
  if (
    currentUseCode === 'agricultural' &&
    district.category !== 'ag'
  ) {
    signals.push({
      severity: 'medium',
      title: 'Agricultural Use in Non-Agricultural Zone',
      description: `This parcel is being used agriculturally but is zoned ${zoneCode} (${district.name}). Zoning may allow higher-intensity development.`,
    });
  }

  // 7. Lot smaller than minimum — likely non-conforming
  if (lotSizeSqft < district.minLot && district.minLot > 0) {
    signals.push({
      severity: 'info',
      title: 'Lot Size Below Minimum — Possible Non-Conforming Parcel',
      description: `${zoneCode} requires a minimum lot of ${district.minLot.toLocaleString()} sq ft. This lot (${lotSizeSqft.toLocaleString()} sq ft) is ${((1 - lotSizeSqft / district.minLot) * 100).toFixed(0)}% below minimum. Development may require a variance or lot merger.`,
    });
  }

  // 8. Max building area info card
  if (maxBuildingArea > 0) {
    signals.push({
      severity: 'info',
      title: 'Maximum Building Area',
      description: `At ${district.maxFAR} FAR, this ${lotSizeSqft.toLocaleString()} sq ft lot supports up to ${maxBuildingArea.toLocaleString()} sq ft of gross floor area.`,
    });
  }

  // 9. Max dwelling units info card
  if (maxDwellingUnits > 0 && district.category === 'res') {
    signals.push({
      severity: 'info',
      title: 'Maximum Dwelling Units',
      description: `At ${district.maxDensity} DU/acre, this lot could support up to ${maxDwellingUnits} dwelling unit${maxDwellingUnits !== 1 ? 's' : ''}.`,
    });
  }

  // 10. Use consistent with zoning — good signal
  const useCategoryMatchesZone = isUseConsistentWithZone(currentUseCode, district);
  if (useCategoryMatchesZone && signals.filter(s => s.severity === 'high').length === 0) {
    signals.push({
      severity: 'good',
      title: 'Use Consistent with Zoning',
      description: `The current use (${currentUse.label}) is consistent with ${zoneCode} (${district.name}) zoning. The site appears to be operating at or near its permitted highest and best use.`,
    });
  }

  // ── Verdict ────────────────────────────────────────────────────────────────
  const highSignals = signals.filter((s) => s.severity === 'high').length;
  const mediumSignals = signals.filter((s) => s.severity === 'medium').length;
  const verdict: HBUResult['verdict'] =
    highSignals > 0 || mediumSignals > 1 ? 'underutilized' : 'optimal';

  return {
    verdict,
    signals,
    districtDetail: {
      ...district,
      maxBuildingArea,
      maxDwellingUnits,
    },
  };
}

function isUseConsistentWithZone(useCode: string, district: ZoneDistrict): boolean {
  const { category } = district;
  switch (useCode) {
    case 'single_family':
    case 'duplex':
      return category === 'res';
    case 'small_multifamily':
    case 'large_multifamily':
      return ['res', 'mix'].includes(category);
    case 'retail':
    case 'office':
      return ['com', 'mix'].includes(category);
    case 'mixed_use':
      return category === 'mix';
    case 'light_industrial':
      return category === 'ind';
    case 'heavy_industrial':
      return category === 'ind';
    case 'agricultural':
      return category === 'ag';
    case 'institutional':
      return true; // conditionally allowed almost everywhere
    default:
      return false;
  }
}
