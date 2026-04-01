import { useState } from 'react';
import { resolveAddress } from '@/utils/addressResolver';
import { calculateTax, formatCurrency, formatPercent } from '@/utils/taxCalculations';
import { getMillLevy } from '@/data/millLevies';
import { Card } from './Layout';
import type { PropertyType, TaxCalculationResult } from '@/data/types';

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'residential',         label: 'Residential' },
  { value: 'commercial_improved', label: 'Commercial (Improved)' },
  { value: 'commercial_other',    label: 'Commercial (Other / Land)' },
  { value: 'industrial',          label: 'Industrial' },
  { value: 'vacant',              label: 'Vacant Land' },
  { value: 'agricultural',        label: 'Agricultural' },
  { value: 'personal_property',   label: 'Personal Property' },
];

export function TaxCalculator() {
  const [address, setAddress]     = useState('');
  const [county, setCounty]       = useState('');
  const [propType, setPropType]   = useState<PropertyType>('residential');
  const [actualValue, setActualValue] = useState('');
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState<TaxCalculationResult | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  async function handleLookup() {
    if (!address.trim()) return;
    setLoading(true);
    setLookupError(null);
    try {
      const res = await resolveAddress(address);
      if (res.county) setCounty(res.county);
      else setLookupError("Couldn't resolve county. Enter manually.");
    } catch {
      setLookupError('Lookup failed. Enter county manually.');
    } finally {
      setLoading(false);
    }
  }

  function handleCalculate() {
    if (!county || !actualValue || !propType) return;
    setResult(calculateTax(Number(actualValue), propType, county));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--ap-t1)', margin: 0 }}>
          Tax Calculator
        </h1>
        <p style={{ fontSize: 13, color: 'var(--ap-t2)', marginTop: 4 }}>
          Estimate 2026 Colorado property taxes using split-rate residential rates.
        </p>
      </div>

      {/* Input card */}
      <Card className="p-6 space-y-5">

        {/* Address row */}
        <div>
          <FieldLabel>Address (auto-detects county)</FieldLabel>
          <div className="flex gap-2 mt-1.5">
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLookup()}
              placeholder="e.g. 123 Main St, Denver, CO 80202"
              style={inputStyle}
              className="flex-1"
            />
            <button
              onClick={handleLookup}
              disabled={loading || !address.trim()}
              style={{
                padding: '0 18px',
                height: 40,
                borderRadius: 10,
                border: 'none',
                background: loading || !address.trim() ? 'rgba(0,0,0,0.08)' : 'var(--ap-blue)',
                color: loading || !address.trim() ? 'var(--ap-t3)' : '#fff',
                fontSize: 13,
                fontWeight: 500,
                cursor: loading || !address.trim() ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
              }}
            >
              {loading ? 'Detecting…' : 'Detect County'}
            </button>
          </div>
          {lookupError && (
            <p style={{ fontSize: 12, color: 'var(--ap-red)', marginTop: 6 }}>{lookupError}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* County */}
          <div>
            <FieldLabel>County</FieldLabel>
            <input
              type="text"
              value={county}
              onChange={e => setCounty(e.target.value)}
              placeholder="e.g. Denver"
              style={{ ...inputStyle, marginTop: 6 }}
            />
          </div>

          {/* Property type */}
          <div>
            <FieldLabel>Property Type</FieldLabel>
            <select
              value={propType}
              onChange={e => setPropType(e.target.value as PropertyType)}
              style={{ ...inputStyle, marginTop: 6 }}
            >
              {PROPERTY_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Actual value */}
          <div>
            <FieldLabel>Actual Value ($)</FieldLabel>
            <input
              type="number"
              value={actualValue}
              onChange={e => setActualValue(e.target.value)}
              placeholder="e.g. 500000"
              style={{ ...inputStyle, marginTop: 6 }}
            />
          </div>
        </div>

        <button
          onClick={handleCalculate}
          disabled={!county || !actualValue}
          style={{
            padding: '0 28px',
            height: 42,
            borderRadius: 10,
            border: 'none',
            background: !county || !actualValue ? 'rgba(0,0,0,0.08)' : 'var(--ap-blue)',
            color: !county || !actualValue ? 'var(--ap-t3)' : '#fff',
            fontSize: 14,
            fontWeight: 600,
            cursor: !county || !actualValue ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s',
            letterSpacing: '-0.01em',
          }}
        >
          Calculate Tax
        </button>
      </Card>

      {result && (
        <TaxResults result={result} countyName={county} actualValue={Number(actualValue)} />
      )}
    </div>
  );
}

function TaxResults({ result, countyName, actualValue }: {
  result: TaxCalculationResult;
  countyName: string;
  actualValue: number;
}) {
  const levy = getMillLevy(countyName);

  return (
    <div className="space-y-4">

      {/* Summary stat row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <ResultStat label="Annual Tax"     value={formatCurrency(result.annualTax)}  accent="var(--ap-blue)" />
        <ResultStat label="Monthly"        value={formatCurrency(result.monthlyTax)} accent="#6E4FF6" />
        <ResultStat label="Effective Rate" value={formatPercent(result.effectiveRate)} accent="var(--ap-orange)" />
        <ResultStat label="Total Mills"    value={result.totalMills.toFixed(2)}       accent="var(--ap-t2)" />
      </div>

      {/* Split-rate banner */}
      {result.isResidential && (
        <div
          style={{
            background: 'rgba(52,199,89,0.08)',
            border: '1px solid rgba(52,199,89,0.2)',
            borderRadius: 12,
            padding: '14px 18px',
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1a7c35', marginBottom: 6 }}>
            2026 Split-Rate Residential System
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            <span style={{ fontSize: 12, color: '#2a6e40' }}>
              Local Gov AV: {formatCurrency(result.localGovAssessedValue)} — 6.8% × (AV − 10% of first $700k)
            </span>
            <span style={{ fontSize: 12, color: '#2a6e40' }}>
              School AV: {formatCurrency(result.schoolAssessedValue)} — 7.05% × full AV
            </span>
          </div>
          <p style={{ fontSize: 11, color: '#3a8c50', marginTop: 6, marginBottom: 0 }}>
            School district uses the higher school-assessed value; all other entities use local gov AV.
          </p>
        </div>
      )}

      {/* Mill levy verification badge */}
      {levy.verified ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#1a7c35', background: 'rgba(52,199,89,0.08)', border: '1px solid rgba(52,199,89,0.2)', borderRadius: 10, padding: '9px 14px' }}>
          <span style={{ fontWeight: 700 }}>✓ Verified</span>
          <span>{levy.taxDistrict ?? countyName}</span>
          {levy.taxYear && <span style={{ color: '#3a8c50' }}>· Tax Year {levy.taxYear}</span>}
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 12, color: '#7a4a00', background: 'rgba(255,159,10,0.08)', border: '1px solid rgba(255,159,10,0.20)', borderRadius: 10, padding: '11px 14px' }}>
          <span style={{ fontSize: 16, lineHeight: 1, marginTop: 1 }}>⚠</span>
          <div>
            <span style={{ fontWeight: 600 }}>Estimated mill levies</span>
            <span style={{ marginLeft: 4 }}>— {countyName} data has not been verified from an official source.</span>
            <div style={{ marginTop: 4, color: '#9a6200' }}>
              For accuracy: download the county Abstract of Assessments from the treasurer website, or use CORA Letters tab to request the Certification of Levies.
            </div>
          </div>
        </div>
      )}

      {/* Entity breakdown */}
      <Card className="overflow-hidden">
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--ap-sep)' }}
        >
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ap-t1)' }}>
            {countyName} County — Mill Levy Breakdown
          </span>
          <span style={{ fontSize: 11, color: 'var(--ap-t3)' }}>
            County-seat representative area
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--ap-sep)' }}>
                {['Entity', 'Mills', 'Assessed Value', 'Annual Tax', 'Share'].map((h, i) => (
                  <th key={h} style={{
                    padding: '9px 16px',
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--ap-t3)',
                    textAlign: i === 0 ? 'left' : i === 4 ? 'left' : 'right',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    background: 'rgba(0,0,0,0.02)',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.entities.map((e, i) => (
                <tr
                  key={e.name}
                  style={{ borderBottom: i < result.entities.length - 1 ? '1px solid var(--ap-sep)' : undefined }}
                  onMouseEnter={ev => (ev.currentTarget.style.background = 'rgba(0,0,0,0.02)')}
                  onMouseLeave={ev => (ev.currentTarget.style.background = '')}
                >
                  <td style={{ padding: '11px 16px', fontSize: 13, fontWeight: 500, color: 'var(--ap-t1)' }}>{e.name}</td>
                  <td style={{ padding: '11px 16px', fontSize: 13, color: 'var(--ap-t2)', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{e.mills.toFixed(3)}</td>
                  <td style={{ padding: '11px 16px', fontSize: 13, color: 'var(--ap-t2)', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(e.assessedValue)}</td>
                  <td style={{ padding: '11px 16px', fontSize: 13, fontWeight: 600, color: 'var(--ap-t1)', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(e.annualTax)}</td>
                  <td style={{ padding: '11px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 4, borderRadius: 99, background: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.min(e.share, 100)}%`, borderRadius: 99, background: 'var(--ap-blue)' }} />
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--ap-t3)', width: 28, textAlign: 'right' }}>{e.share.toFixed(0)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: '2px solid var(--ap-sep)', background: 'rgba(0,0,0,0.02)' }}>
                <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: 'var(--ap-t1)' }}>Total</td>
                <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: 'var(--ap-t1)', textAlign: 'right' }}>{result.totalMills.toFixed(3)}</td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--ap-t3)', textAlign: 'right' }}>—</td>
                <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 700, color: 'var(--ap-blue)', textAlign: 'right' }}>{formatCurrency(result.annualTax)}</td>
                <td style={{ padding: '12px 16px', fontSize: 11, color: 'var(--ap-t3)', textAlign: 'right' }}>100%</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div style={{ padding: '10px 16px', borderTop: '1px solid var(--ap-sep)', fontSize: 11, color: 'var(--ap-t3)' }}>
          Mill levies represent the county-seat tax area. Actual rates vary by parcel — some locations differ by 30–80+ mills.
        </div>
      </Card>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ap-t2)', letterSpacing: '0.01em' }}>
      {children}
    </label>
  );
}

function ResultStat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div style={{ background: 'var(--ap-card)', borderRadius: 14, boxShadow: 'var(--ap-shadow)', padding: '18px 20px' }}>
      <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', color: accent, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--ap-t2)', marginTop: 6, fontWeight: 500 }}>{label}</div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  height: 40,
  padding: '0 12px',
  borderRadius: 10,
  border: '1px solid rgba(0,0,0,0.10)',
  background: 'rgba(0,0,0,0.03)',
  fontSize: 13,
  color: 'var(--ap-t1)',
  outline: 'none',
  transition: 'border-color 0.15s, box-shadow 0.15s',
};
