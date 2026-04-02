import type { HighestBestUseEngine, HBUInput, HBUOutput } from '@/core/engines/hbu';

/**
 * Compatibility-first scaffold for migrating the existing Colorado HBU logic
 * out of UI helpers and into a dedicated engine.
 */
export class ColoradoHBUEngine implements HighestBestUseEngine {
  id = 'co-hbu-engine';
  state = 'CO';

  async analyze(input: HBUInput): Promise<HBUOutput> {
    return {
      asThoughVacant: {
        legallyPermissible: {
          status: 'caution',
          summary: 'Legacy Colorado Atlas zoning logic still needs to be migrated into the shared engine.',
        },
        physicallyPossible: {
          status: 'caution',
          summary: 'Physical feasibility inputs are not yet standardized across counties.',
        },
        financiallyFeasible: {
          status: 'caution',
          summary: 'Financial feasibility remains a rules-based estimate until market modules are migrated.',
        },
        maximallyProductive: null,
      },
      asImproved: {
        legallyPermissible: {
          status: 'caution',
          summary: 'As-improved legal permissibility still depends on county and municipal zoning adapters.',
        },
        physicallyPossible: {
          status: 'caution',
          summary: 'Current improvement constraints still need canonical building-module integration.',
        },
        financiallyFeasible: {
          status: 'caution',
          summary: 'Financial feasibility still relies on legacy heuristics.',
        },
        maximallyProductive: null,
      },
      conclusion: {
        currentUse: input.property.modules.landBuilding?.value?.useDescription ?? null,
        likelyInterimUse: null,
        likelyUltimateUse: null,
        underbuilt: null,
        redevelopmentPotential: null,
        summaryText: 'Colorado HBU engine scaffold is in place; current parcel-specific HBU logic should migrate here incrementally.',
        confidenceScore: null,
        assumptions: ['Current HBU computations still execute in the legacy Colorado rules path.'],
      },
      provenance: input.property.sourceAttribution,
    };
  }
}
