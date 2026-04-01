import { assessmentRates, legislativeHistory } from '@/data/assessmentRates';
import { Card } from './Layout';

export function AssessmentRates() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Assessment Rates & Tax Law</h2>
        <p className="text-sm text-gray-500 mt-0.5">Colorado property tax classification rates, the 2026 split-rate formula, and key legislative history.</p>
      </div>

      {/* Rate table */}
      <Card className="overflow-hidden">
        <div className="px-5 py-3 bg-orange-50 border-b border-orange-100">
          <h3 className="font-semibold text-orange-900">Assessment Rates by Classification</h3>
          <p className="text-xs text-orange-600 mt-0.5">Residential rates apply to actual value. Non-residential rates apply uniformly.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500">
                <th className="text-left px-5 py-2.5 font-medium">Classification</th>
                <th className="text-right px-4 py-2.5 font-medium">2024</th>
                <th className="text-right px-4 py-2.5 font-medium">2025</th>
                <th className="text-right px-4 py-2.5 font-medium bg-orange-50 text-orange-700">2026 ★</th>
                <th className="text-right px-4 py-2.5 font-medium">2027+</th>
                <th className="text-left px-4 py-2.5 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {assessmentRates.map((row) => (
                <tr key={row.classification} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-2.5 font-medium text-gray-800">{row.classification}</td>
                  <td className="px-4 py-2.5 text-right text-gray-600">{fmt(row.rate2024)}</td>
                  <td className="px-4 py-2.5 text-right text-gray-600">{fmt(row.rate2025)}</td>
                  <td className="px-4 py-2.5 text-right font-bold text-orange-700 bg-orange-50">{fmt(row.rate2026)}</td>
                  <td className="px-4 py-2.5 text-right text-gray-600">{fmt(row.rate2027plus)}</td>
                  <td className="px-4 py-2.5 text-xs text-gray-400 max-w-[240px]">{row.notes ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-2 bg-gray-50 border-t text-xs text-gray-400">
          ★ 2026 is the current tax year. Sources: CRS 39-1-104, HB24B-1001, SB24-233.
        </div>
      </Card>

      {/* Formula walkthrough */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="font-semibold text-gray-800 mb-3">2026 Tax Formula — Residential</h3>
          <div className="space-y-3 text-sm">
            <FormulaStep n={1} label="Reduction Base" formula="MIN(Actual Value, $700,000)" />
            <FormulaStep n={2} label="Local Gov Assessed Value" formula="MAX((AV − 10% × Reduction Base) × 6.8%, $1,000)" />
            <FormulaStep n={3} label="School Assessed Value" formula="Actual Value × 7.05%" />
            <FormulaStep n={4} label="School Tax" formula="School AV × School Mills ÷ 1,000" />
            <FormulaStep n={5} label="All Other Taxes" formula="Local Gov AV × Entity Mills ÷ 1,000" />
            <FormulaStep n={6} label="Total Tax" formula="Sum of all entity taxes" />
          </div>

          {/* Example */}
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm">
            <div className="font-semibold text-orange-900 mb-2">Example: $500k Home, Denver</div>
            <div className="space-y-1 text-orange-800 text-xs font-mono">
              <div>AV = $500,000</div>
              <div>Reduction = MIN(500k, 700k) × 10% = $50,000</div>
              <div>Local Gov AV = (500k − 50k) × 6.8% = $30,600</div>
              <div>School AV = 500k × 7.05% = $35,250</div>
              <div>School tax ≈ 35,250 × 46.143 ÷ 1,000 = $1,627</div>
              <div>County tax ≈ 30,600 × 8.868 ÷ 1,000 = $271</div>
              <div className="font-bold border-t border-orange-300 pt-1 mt-1">Total ≈ $2,167/yr</div>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold text-gray-800 mb-3">2026 Formula — Non-Residential</h3>
          <div className="space-y-3 text-sm">
            <FormulaStep n={1} label="Assessed Value" formula="Actual Value × Classification Rate" />
            <FormulaStep n={2} label="Entity Tax" formula="Assessed Value × Entity Mills ÷ 1,000" />
            <FormulaStep n={3} label="Total Tax" formula="Sum of all entity taxes" />
          </div>
          <div className="mt-4 space-y-2 text-xs">
            <div className="font-semibold text-gray-700">2026 Non-Residential Rates:</div>
            <table className="w-full text-xs border-collapse">
              <tbody>
                {[
                  ['Commercial (Improved)', '25%'],
                  ['Commercial (Other)', '26%'],
                  ['Industrial', '26%'],
                  ['Vacant Land', '26%'],
                  ['Agricultural', '25%'],
                  ['Personal Property', '26%'],
                ].map(([type, rate]) => (
                  <tr key={type} className="border-b border-gray-50">
                    <td className="py-1 text-gray-700">{type}</td>
                    <td className="py-1 text-right font-mono font-bold text-orange-700">{rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Legislative history */}
      <Card className="p-5">
        <h3 className="font-semibold text-gray-800 mb-4">Legislative History</h3>
        <div className="relative pl-6 border-l-2 border-gray-200 space-y-5">
          {legislativeHistory.map((item) => (
            <div key={item.year} className="relative">
              <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-orange-500 border-2 border-white shadow-sm" />
              <div className="text-xs font-bold text-orange-600 mb-0.5">{item.year} — {item.event}</div>
              <div className="text-sm text-gray-600">{item.description}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function fmt(val: number | string): string {
  if (typeof val === 'string') return val;
  return `${(val * 100).toFixed(2)}%`;
}

function FormulaStep({ n, label, formula }: { n: number; label: string; formula: string }) {
  return (
    <div className="flex gap-3">
      <div className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{n}</div>
      <div>
        <div className="font-medium text-gray-800 text-xs uppercase tracking-wide">{label}</div>
        <div className="font-mono text-xs text-orange-700 bg-orange-50 rounded px-2 py-1 mt-0.5">{formula}</div>
      </div>
    </div>
  );
}
