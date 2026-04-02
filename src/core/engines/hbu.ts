import type { CanonicalProperty, DevelopmentPotentialModule, ZoningModule } from '@/core/models/property';
import type { SourceAttribution } from '@/core/models/provenance';

export interface HBUDecisionTest {
  status: 'pass' | 'caution' | 'fail';
  summary: string;
}

export interface HBUTrackResult {
  legallyPermissible: HBUDecisionTest;
  physicallyPossible: HBUDecisionTest;
  financiallyFeasible: HBUDecisionTest;
  maximallyProductive: string | null;
}

export interface HBUOutput {
  asThoughVacant: HBUTrackResult;
  asImproved: HBUTrackResult;
  conclusion: {
    currentUse: string | null;
    likelyInterimUse: string | null;
    likelyUltimateUse: string | null;
    underbuilt: boolean | null;
    redevelopmentPotential: boolean | null;
    summaryText: string;
    confidenceScore: number | null;
    assumptions: string[];
  };
  provenance: SourceAttribution[];
}

export interface HBUInput {
  property: CanonicalProperty;
  zoning: ZoningModule | null;
  developmentPotential: DevelopmentPotentialModule | null;
}

export interface HighestBestUseEngine {
  id: string;
  state: string;
  analyze(input: HBUInput): Promise<HBUOutput>;
}
