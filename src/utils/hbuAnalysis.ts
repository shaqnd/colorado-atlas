import { zoneDistrictsByCode } from '@/data/zoneDistricts';
import { currentUsesByCode } from '@/data/currentUses';
import type { HBUDecisionTest, HBUResult, HBUSignal, HBUTrackResult, ZoneDistrict } from '@/data/types';

export interface HBUInput {
  zoneCode: string;
  currentUseCode: string;
  lotSizeSqft: number;
  sourceZoneCode?: string | null;
  maxBuildingAreaOverride?: number | null;
  maxHeightStoriesOverride?: number | null;
  currentStories?: number | null;
  buildingSizeSqft?: number | null;
  unitCount?: number | null;
  propertyTypeLabel?: string | null;
}

export function runHBUAnalysis(input: HBUInput): HBUResult | null {
  const {
    zoneCode,
    currentUseCode,
    lotSizeSqft,
    sourceZoneCode,
    maxBuildingAreaOverride,
    maxHeightStoriesOverride,
    currentStories,
    buildingSizeSqft,
    unitCount,
    propertyTypeLabel,
  } = input;

  const district = zoneDistrictsByCode[zoneCode];
  const currentUse = currentUsesByCode[currentUseCode];
  if (!district || !currentUse) return null;

  const signals: HBUSignal[] = [];

  // ── Derived dimensions ─────────────────────────────────────────────────────
  const maxBuildingArea =
    maxBuildingAreaOverride && maxBuildingAreaOverride > 0
      ? Math.round(maxBuildingAreaOverride)
      : district.maxFAR > 0
      ? Math.round(lotSizeSqft * district.maxFAR)
      : 0;
  const maxDwellingUnits =
    district.maxDensity > 0
      ? Math.floor((lotSizeSqft / 43560) * district.maxDensity)
      : 0;
  const currentFAR =
    buildingSizeSqft && lotSizeSqft > 0 ? buildingSizeSqft / lotSizeSqft : 0;
  const farUtilization =
    buildingSizeSqft && maxBuildingArea > 0 ? buildingSizeSqft / maxBuildingArea : 0;
  const densityUtilization =
    unitCount && maxDwellingUnits > 0 ? unitCount / maxDwellingUnits : 0;
  const storyUtilization =
    currentStories && maxHeightStoriesOverride && maxHeightStoriesOverride > 0
      ? currentStories / maxHeightStoriesOverride
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

  // 10. Built FAR is materially below zoning capacity
  if (
    buildingSizeSqft &&
    maxBuildingArea > 0 &&
    farUtilization > 0 &&
    farUtilization < 0.35 &&
    ['com', 'mix', 'ind'].includes(district.category)
  ) {
    signals.push({
      severity: 'medium',
      title: 'Improvement Intensity Below Zoning Capacity',
      description: `The existing improvement contains about ${buildingSizeSqft.toLocaleString()} sq ft, or ${(farUtilization * 100).toFixed(0)}% of the estimated ${maxBuildingArea.toLocaleString()} sq ft zoning buildout. This suggests the site may not be utilizing its full development envelope.`,
    });
  }

  // 11. Residential density below permitted density
  if (
    unitCount &&
    maxDwellingUnits > 0 &&
    densityUtilization > 0 &&
    densityUtilization < 0.5 &&
    ['res', 'mix'].includes(district.category)
  ) {
    signals.push({
      severity: 'medium',
      title: 'Existing Unit Count Below Permitted Density',
      description: `The parcel appears to contain ${unitCount} unit${unitCount !== 1 ? 's' : ''} versus an estimated zoning capacity of ${maxDwellingUnits}. Existing density is roughly ${(densityUtilization * 100).toFixed(0)}% of that implied capacity.`,
    });
  }

  // 12. Improvement scale supports existing use
  if (
    propertyTypeLabel &&
    buildingSizeSqft &&
    currentFAR > 0.5 &&
    signals.filter((s) => s.severity === 'high').length === 0
  ) {
    signals.push({
      severity: 'good',
      title: 'Existing Improvement Shows Meaningful Site Utilization',
      description: `The current ${propertyTypeLabel.toLowerCase()} improvement contains about ${buildingSizeSqft.toLocaleString()} sq ft with an estimated current FAR of ${currentFAR.toFixed(2)}. Existing improvements indicate the parcel is already developed at a meaningful intensity.`,
    });
  }

  // 13. Existing height below zoning envelope
  if (
    currentStories &&
    maxHeightStoriesOverride &&
    maxHeightStoriesOverride > currentStories &&
    storyUtilization > 0 &&
    storyUtilization < 0.7 &&
    ['com', 'mix', 'res'].includes(district.category)
  ) {
    signals.push({
      severity: storyUtilization < 0.4 ? 'high' : 'medium',
      title: 'Existing Building Height Is Below Zoning Envelope',
      description: `The existing improvement appears to be about ${Number(currentStories.toFixed(1))} stor${Math.abs(currentStories - 1) < 0.01 ? 'y' : 'ies'}, while ${sourceZoneCode ?? district.code} allows a building scale of up to ${maxHeightStoriesOverride} stories.`,
    });
  }

  // 14. Use consistent with zoning — good signal
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
  const recommendation = buildRecommendation({
    district,
    currentUse,
    sourceZoneCode: sourceZoneCode ?? zoneCode,
    verdict,
    maxBuildingArea,
    maxDwellingUnits,
    currentFAR,
    farUtilization,
    densityUtilization,
    maxHeightStoriesOverride: maxHeightStoriesOverride ?? null,
    currentStories: currentStories ?? null,
    storyUtilization,
    buildingSizeSqft: buildingSizeSqft ?? null,
    unitCount: unitCount ?? null,
    propertyTypeLabel: propertyTypeLabel ?? null,
  });

  const framework = buildFramework({
    district,
    currentUse,
    sourceZoneCode: sourceZoneCode ?? zoneCode,
    lotSizeSqft,
    maxBuildingArea,
    currentFAR,
    farUtilization,
    densityUtilization,
    buildingSizeSqft: buildingSizeSqft ?? null,
    unitCount: unitCount ?? null,
    recommendation,
    useCategoryMatchesZone,
  });

  return {
    verdict,
    signals,
    framework,
    recommendation,
    districtDetail: {
      ...district,
      maxBuildingArea,
      maxDwellingUnits,
      currentFAR,
      farUtilization,
      densityUtilization,
    },
  };
}

function test(status: HBUDecisionTest['status'], summary: string): HBUDecisionTest {
  return { status, summary };
}

function buildFramework({
  district,
  currentUse,
  sourceZoneCode,
  lotSizeSqft,
  maxBuildingArea,
  currentFAR,
  farUtilization,
  densityUtilization,
  buildingSizeSqft,
  unitCount,
  recommendation,
  useCategoryMatchesZone,
}: {
  district: ZoneDistrict;
  currentUse: { label: string; code: string };
  sourceZoneCode: string;
  lotSizeSqft: number;
  maxBuildingArea: number;
  currentFAR: number;
  farUtilization: number;
  densityUtilization: number;
  buildingSizeSqft: number | null;
  unitCount: number | null;
  recommendation: HBUResult['recommendation'];
  useCategoryMatchesZone: boolean;
}): HBUResult['framework'] {
  const lotBelowMinimum = district.minLot > 0 && lotSizeSqft < district.minLot;
  const asThoughVacantLegal =
    lotBelowMinimum
      ? test('caution', `The current zoning is ${sourceZoneCode}, but the site is below the district's typical minimum lot size. Development may still be possible, but conformance or relief should be verified.`)
      : test('pass', `The current zoning (${sourceZoneCode}) provides the legal framework for testing alternative uses without assuming a rezoning.`);

  const asThoughVacantPhysical =
    maxBuildingArea > 0
      ? test('pass', `The site appears physically capable of supporting additional development under the current zoning envelope, including roughly ${maxBuildingArea.toLocaleString()} sq ft of potential buildout.`)
      : test('caution', 'Physical capacity for a denser alternative is not fully demonstrated from the current in-app data and should be verified with site-specific constraints.');

  const asThoughVacantFinancial =
    recommendation.conclusionType === 'redevelopment'
      ? test('caution', 'An alternative use appears plausible, but financial feasibility is only preliminarily indicated here. Market rent, absorption, cost, and residual land value testing would still be required.')
      : test('caution', 'Financial feasibility for vacant-land redevelopment has not been fully tested here and should be confirmed with market evidence before concluding a new development is currently feasible.');

  const asThoughVacant: HBUTrackResult = {
    legalPermissibility: asThoughVacantLegal,
    physicalPossibility: asThoughVacantPhysical,
    financialFeasibility: asThoughVacantFinancial,
    conclusion:
      recommendation.conclusionType === 'redevelopment'
        ? `As though vacant, the site appears best suited for ${recommendation.likelyUltimateUse.toLowerCase()} under the current zoning, subject to separate financial feasibility support.`
        : `As though vacant, ${recommendation.likelyUltimateUse.toLowerCase()} appears to be the leading legally permissible use category under the current zoning.`
  };

  const asImprovedLegal =
    useCategoryMatchesZone
      ? test('pass', `The existing ${currentUse.label.toLowerCase()} use appears legally consistent with ${sourceZoneCode}.`)
      : test('caution', `The current improvements do not appear fully aligned with ${sourceZoneCode}. If the use continues, it may rely on legal nonconforming status or similar grandfathered rights that should be verified.`);

  const asImprovedPhysical =
    buildingSizeSqft && currentFAR > 0
      ? farUtilization < 0.7 || densityUtilization < 0.7
        ? test('caution', `The current improvements are physically viable, but the site appears underimproved relative to the present zoning envelope.`)
        : test('pass', 'The current improvements appear physically capable of continuing in their present form.')
      : test('caution', 'The current improvement pattern is not fully documented, so the physical suitability of continuing the existing improvements should be verified.');

  const asImprovedFinancial =
    recommendation.conclusionType === 'continue_current_use'
      ? test('pass', 'The current improvements appear to support a continuing use that is preliminarily economically supportable based on the present improvement pattern.')
      : recommendation.conclusionType === 'interim_use'
      ? test('caution', 'The current improvements may represent an interim use. They appear serviceable today, but the data suggests a more productive future use may ultimately be warranted.')
      : test('fail', 'The current improvements do not appear to represent the maximally productive long-term use of the site under present zoning assumptions.');

  const asImproved: HBUTrackResult = {
    legalPermissibility: asImprovedLegal,
    physicalPossibility: asImprovedPhysical,
    financialFeasibility: asImprovedFinancial,
    conclusion:
      recommendation.conclusionType === 'continue_current_use'
        ? `As improved, the current ${currentUse.label.toLowerCase()} use appears to remain the highest and best use.`
        : recommendation.conclusionType === 'interim_use'
        ? `As improved, the current ${currentUse.label.toLowerCase()} use appears to be an interim use, with ${recommendation.likelyUltimateUse.toLowerCase()} representing the likely ultimate highest and best use.`
        : `As improved, the current improvements do not appear to maximize the site's value, and redevelopment to ${recommendation.likelyUltimateUse.toLowerCase()} is the more compelling highest and best use conclusion.`
  };

  return { asThoughVacant, asImproved };
}

function buildRecommendation({
  district,
  currentUse,
  sourceZoneCode,
  verdict,
  maxBuildingArea,
  maxDwellingUnits,
  currentFAR,
  farUtilization,
  densityUtilization,
  maxHeightStoriesOverride,
  currentStories,
  storyUtilization,
  buildingSizeSqft,
  unitCount,
  propertyTypeLabel,
}: {
  district: ZoneDistrict;
  currentUse: { label: string; code: string };
  sourceZoneCode: string;
  verdict: HBUResult['verdict'];
  maxBuildingArea: number;
  maxDwellingUnits: number;
  currentFAR: number;
  farUtilization: number;
  densityUtilization: number;
  maxHeightStoriesOverride: number | null;
  currentStories: number | null;
  storyUtilization: number;
  buildingSizeSqft: number | null;
  unitCount: number | null;
  propertyTypeLabel: string | null;
}): HBUResult['recommendation'] {
  const currentUseLabel = currentUse.label;
  const support: string[] = [];
  const rationale: string[] = [];
  const useConsistentWithZone = isUseConsistentWithZone(currentUse.code, district);
  const hasBuilding = !!buildingSizeSqft && buildingSizeSqft > 0;
  const hasResidentialCapacity = maxDwellingUnits > 0 && ['res', 'mix'].includes(district.category);
  const materiallyUnderbuiltByFar =
    hasBuilding && maxBuildingArea > 0 && farUtilization > 0 && farUtilization < 0.4;
  const materiallyUnderbuiltByDensity =
    (unitCount ?? 0) > 0 && hasResidentialCapacity && densityUtilization > 0 && densityUtilization < 0.55;
  const noMeaningfulImprovements =
    !hasBuilding || currentUse.code === 'vacant' || currentUse.code === 'surface_parking';

  if (district.maxFAR > 0 && maxBuildingArea > 0) {
    support.push(
      `${sourceZoneCode} permits a development pattern modeled here at up to ${district.maxFAR} FAR, implying roughly ${maxBuildingArea.toLocaleString()} sq ft of buildout on this site.`,
    );
  } else if (maxBuildingArea > 0 && maxHeightStoriesOverride && maxHeightStoriesOverride > 0) {
    support.push(
      `${sourceZoneCode} allows a building scale of up to ${maxHeightStoriesOverride} stories. Based on the current building footprint, that suggests a rough gross buildout potential of about ${maxBuildingArea.toLocaleString()} sq ft.`,
    );
  }

  if (maxHeightStoriesOverride && maxHeightStoriesOverride > 0) {
    support.push(`${sourceZoneCode} allows a building scale of up to ${maxHeightStoriesOverride} stories.`);
  }

  if (district.maxDensity > 0 && maxDwellingUnits > 0 && ['res', 'mix'].includes(district.category)) {
    support.push(
      `${sourceZoneCode} also implies a residential density capacity modeled at about ${maxDwellingUnits} unit${maxDwellingUnits !== 1 ? 's' : ''}.`,
    );
  }

  if (buildingSizeSqft && farUtilization > 0) {
    support.push(
      `The existing improvement contains about ${buildingSizeSqft.toLocaleString()} sq ft, or ${(farUtilization * 100).toFixed(0)}% of estimated zoning buildout.`,
    );
  }

  if (unitCount && densityUtilization > 0) {
    support.push(
      `Existing density appears to be ${unitCount} unit${unitCount !== 1 ? 's' : ''}, or ${(densityUtilization * 100).toFixed(0)}% of implied unit capacity.`,
    );
  }

  if (propertyTypeLabel) {
    support.push(`The parcel currently appears improved with a ${propertyTypeLabel.toLowerCase()} use profile.`);
  }

  let likelyInterimUse = currentUseLabel;
  let likelyUltimateUse = currentUseLabel;
  let conclusionType: HBUResult['recommendation']['conclusionType'] = 'continue_current_use';
  let opinion = 'The current improvement pattern appears to be the site’s highest and best use under the present zoning.';

  switch (district.category) {
    case 'res':
      if (district.code === 'R-1') {
        likelyInterimUse = currentUse.code === 'vacant' ? 'Single-Family Residential' : currentUseLabel;
        likelyUltimateUse = 'Single-Family Residential';
      } else if (district.code === 'R-2') {
        likelyInterimUse = ['single_family', 'vacant'].includes(currentUse.code) ? 'Single-Family Residential with ADU or Duplex' : currentUseLabel;
        likelyUltimateUse = 'Duplex / Two-Family Residential';
      } else if (district.code === 'R-3') {
        likelyInterimUse = currentUse.code === 'single_family' ? 'Duplex / Townhome Redevelopment' : 'Townhome or Small Multi-Family Residential';
        likelyUltimateUse = 'Townhome or Small Multi-Family Residential';
      } else if (district.code === 'R-4' || district.code === 'R-5') {
        likelyInterimUse = currentUse.code.includes('multifamily') ? currentUseLabel : 'Multi-Family Redevelopment';
        likelyUltimateUse = district.code === 'R-5' ? 'High-Density Multi-Family or Mixed Residential Tower' : 'Multi-Family Residential';
      } else {
        likelyInterimUse = verdict === 'underutilized' ? 'Moderately Higher-Density Residential' : currentUseLabel;
        likelyUltimateUse = 'Residential Use Consistent with Zoning';
      }
      break;
    case 'mix':
      likelyInterimUse = currentUse.code === 'surface_parking' ? 'Interim Commercial Activation' : 'Mixed-Use Redevelopment';
      likelyUltimateUse = 'Mixed-Use Development';
      break;
    case 'com':
      likelyInterimUse = currentUse.code === 'single_family' ? 'Commercial Conversion or Low-Scale Redevelopment' : 'Commercial Redevelopment';
      likelyUltimateUse = district.code === 'O-1' ? 'Office / Professional Development' : 'Commercial Development';
      break;
    case 'ind':
      likelyInterimUse = 'Industrial / Flex Redevelopment';
      likelyUltimateUse = 'Industrial or Flex Development';
      break;
    case 'ag':
      likelyInterimUse = currentUseLabel;
      likelyUltimateUse = 'Agricultural / Rural Use';
      break;
  }

  if (verdict === 'optimal') {
    likelyInterimUse = currentUseLabel;
    if (district.category === 'res' && currentUse.code === 'single_family' && district.code === 'R-1') {
      likelyUltimateUse = 'Continued Single-Family Residential';
    } else if (district.category === 'ag') {
      likelyUltimateUse = currentUseLabel;
    } else if (currentFAR >= 0.5 || currentUse.code === 'mixed_use') {
      likelyUltimateUse = currentUseLabel;
    }
    rationale.push('The existing use appears broadly aligned with the zoning district and does not show strong underutilization signals.');
  } else {
    rationale.push('The parcel appears capable of supporting a more intensive use than the current improvement pattern suggests.');
  }

  if (farUtilization > 0 && farUtilization < 0.35 && ['com', 'mix', 'ind'].includes(district.category)) {
    rationale.push('Improvement intensity is materially below estimated zoning buildout, which supports redevelopment potential.');
  }

  if (densityUtilization > 0 && densityUtilization < 0.5 && ['res', 'mix'].includes(district.category)) {
    rationale.push('Existing residential density appears meaningfully below implied zoning capacity.');
  }

  if (currentUse.code === 'single_family' && ['R-3', 'R-4', 'R-5'].includes(district.code)) {
    rationale.push('Single-family occupancy in a higher-density residential district typically supports a denser residential highest and best use conclusion.');
  }

  if (currentUse.code === 'single_family' && ['com', 'mix'].includes(district.category)) {
    rationale.push('A detached residential use in a commercial or mixed-use district is typically transitional rather than the zone’s ultimate use pattern.');
  }

  if (rationale.length === 0) {
    rationale.push('The current zoning envelope, site size, and observed improvement pattern support the recommended use conclusion.');
  }

  if (district.category === 'ag') {
    conclusionType = 'continue_current_use';
    opinion = 'The zoning and current improvement pattern both support continued agricultural or low-intensity rural use as the highest and best use.';
  } else if (!useConsistentWithZone) {
    conclusionType = hasBuilding ? 'interim_use' : 'redevelopment';
    opinion = hasBuilding
      ? `The current ${currentUseLabel.toLowerCase()} use appears to be an interim use. The zoning supports a different and more economically aligned use pattern.`
      : `The parcel appears best suited for redevelopment to a use consistent with ${district.code} zoning rather than its current unimproved or low-intensity state.`;
  } else if (noMeaningfulImprovements) {
    conclusionType = 'redevelopment';
    opinion = `The highest and best use appears to be development to a use allowed by ${district.code} zoning, as the site is currently vacant or improved only with low-intensity site work.`;
  } else if (materiallyUnderbuiltByFar || materiallyUnderbuiltByDensity) {
    conclusionType = 'interim_use';
    opinion = `The existing improvements appear to support an interim use, but the site seems underbuilt relative to what ${district.code} zoning allows. A denser future use is likely the ultimate highest and best use.`;
  } else if (
    currentStories &&
    maxHeightStoriesOverride &&
    maxHeightStoriesOverride > currentStories &&
    storyUtilization > 0 &&
    storyUtilization < 0.7
  ) {
    conclusionType = 'interim_use';
    opinion = `The current improvements underutilize the permitted building scale. While the present use may remain viable today, a taller and denser project appears supportable under ${sourceZoneCode} zoning.`;
  } else {
    conclusionType = 'continue_current_use';
    opinion = 'The current improvements appear generally consistent with the zoning envelope, so continued use in their present form appears to be the highest and best use.';
  }

  if (
    currentUse.code === 'single_family' &&
    ['R-3', 'R-4', 'R-5'].includes(district.code)
  ) {
    conclusionType = 'interim_use';
    opinion = `The current single-family improvement appears to be an interim use. The zoning supports a materially denser residential program, which is likely the site’s ultimate highest and best use.`;
  }

  if (
    currentUse.code === 'single_family' &&
    ['com', 'mix'].includes(district.category)
  ) {
    conclusionType = 'interim_use';
    opinion = `The detached residential improvement appears transitional. The zoning supports commercial or mixed-use redevelopment, which is likely the site’s ultimate highest and best use.`;
  }

  if (
    district.category === 'res' &&
    useConsistentWithZone &&
    hasBuilding &&
    farUtilization >= 0.55 &&
    (!hasResidentialCapacity || densityUtilization === 0 || densityUtilization >= 0.7)
  ) {
    conclusionType = 'continue_current_use';
    opinion = 'The parcel appears improved in a manner that is broadly consistent with its residential zoning, so continued residential use appears to be the highest and best use.';
  }

  return {
    opinion,
    conclusionType,
    sourceZoneCode,
    analyzedZoneCode: district.code,
    currentUseLabel,
    likelyInterimUse,
    likelyUltimateUse,
    rationale,
    support,
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
