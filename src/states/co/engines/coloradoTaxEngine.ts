import type { CanonicalProperty } from '@/core/models/property';
import type { TaxAnalysisResult, TaxComparable, TaxComparableRuleSet, TaxEngine } from '@/core/engines/tax';

/**
 * Compatibility-first scaffold.
 *
 * This engine is intentionally minimal for now so we can move county-specific
 * logic out of UI components incrementally without breaking the current app.
 * The live UI still uses existing Colorado Atlas tax flows; this file defines
 * the national-ready contract those flows should migrate into next.
 */
export class ColoradoTaxEngine implements TaxEngine {
  id = 'co-tax-engine';
  state = 'CO';

  async analyzeProperty(property: CanonicalProperty): Promise<TaxAnalysisResult> {
    const subject = property.modules.tax?.value ?? null;

    return {
      subject,
      comparables: [],
      bracketed: false,
      conclusionType: subject ? 'insufficient_data' : 'insufficient_data',
      indicatedAnnualTax: subject?.estimatedAnnualTax ?? null,
      summaryText: 'Colorado tax engine scaffold is in place; county-specific comparable logic should be migrated here next.',
      assumptions: ['Comparable selection and bracket logic still live in legacy Colorado UI code paths.'],
      provenance: property.sourceAttribution,
    };
  }

  async selectComparables(_property: CanonicalProperty, _rules: TaxComparableRuleSet): Promise<TaxComparable[]> {
    return [];
  }
}
