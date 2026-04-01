import { useState } from 'react';
import { resolveAddress } from '@/utils/addressResolver';
import { runHBUAnalysis } from '@/utils/hbuAnalysis';
import { zoneDistricts } from '@/data/zoneDistricts';
import { currentUses } from '@/data/currentUses';
import { Card, Badge } from './Layout';
import type { AddressResolution } from '@/utils/addressResolver';
import type { HBUResult } from '@/data/types';

const SEVERITY_STYLES = {
  high:   { bar: 'bg-red-500',    bg: 'bg-red-50 border-red-200',    icon: '⚠', text: 'text-red-800' },
  medium: { bar: 'bg-yellow-500', bg: 'bg-yellow-50 border-yellow-200', icon: '●', text: 'text-yellow-800' },
  info:   { bar: 'bg-blue-400',   bg: 'bg-blue-50 border-blue-200',   icon: 'ℹ', text: 'text-blue-800' },
  good:   { bar: 'bg-green-500',  bg: 'bg-green-50 border-green-200', icon: '✓', text: 'text-green-800' },
};

export function ZoningAnalyzer() {
  const [address, setAddress] = useState('');
  const [zoneCode, setZoneCode] = useState('');
  const [useCode, setUseCode] = useState('');
  const [lotSize, setLotSize] = useState('');
  const [loading, setLoading] = useState(false);
  const [resolution, setResolution] = useState<AddressResolution | null>(null);
  const [hbu, setHbu] = useState<HBUResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleLookup() {
    if (!address.trim()) return;
    setLoading(true);
    setError(null);
    setResolution(null);
    setHbu(null);
    try {
      const res = await resolveAddress(address);
      setResolution(res);
      if (res.resolvedVia === 'none') {
        setError("Couldn't identify a Colorado county from this address. Try including the city name.");
      }
    } catch {
      setError('Address lookup failed. Check your connection.');
    } finally {
      setLoading(false);
    }
  }

  function handleAnalyze() {
    if (!zoneCode || !useCode || !lotSize) return;
    const result = runHBUAnalysis({
      zoneCode,
      currentUseCode: useCode,
      lotSizeSqft: Number(lotSize),
    });
    setHbu(result);
  }

  const county = resolution?.countyData;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Zoning & Highest-Best-Use Analyzer</h2>
        <p className="text-sm text-gray-500 mt-0.5">Enter a Colorado address to resolve county, zoning code, and hearing schedule — then run an HBU analysis.</p>
      </div>

      {/* Address lookup */}
      <Card className="p-5">
        <h3 className="font-semibold text-gray-800 mb-3">Step 1 — Address Lookup</h3>
        <div className="flex gap-3">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g. 123 Main St, Boulder, CO 80302"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
          />
          <button
            onClick={handleLookup}
            disabled={loading || !address.trim()}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Looking up…' : 'Look Up'}
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        {resolution?.warning && (
          <p className="mt-2 text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-3 py-2">
            {resolution.warning}
          </p>
        )}
      </Card>

      {/* Resolution results */}
      {resolution && resolution.resolvedVia !== 'none' && county && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Address match */}
            <Card className="p-4 col-span-1">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Resolved Address</div>
              <div className="text-sm font-medium text-gray-900 break-words">
                {resolution.geocoderResult?.matchedAddress ?? resolution.rawInput}
              </div>
              {resolution.extractedCity && (
                <div className="text-xs text-gray-500 mt-1">City: {resolution.extractedCity}</div>
              )}
              <div className="text-xs text-gray-400 mt-1 capitalize">Via: {resolution.resolvedVia}</div>
              {resolution.geocoderResult && (
                <div className="text-xs text-gray-400 mt-0.5">
                  {resolution.geocoderResult.lat.toFixed(5)}, {resolution.geocoderResult.lng.toFixed(5)}
                  {resolution.geocoderResult.tractGEOID && ` · Tract ${resolution.geocoderResult.tractGEOID}`}
                </div>
              )}
            </Card>

            {/* County */}
            <Card className="p-4">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">County</div>
              <div className="text-lg font-bold text-gray-900">{county.name} County</div>
              <div className="text-sm text-gray-600">Seat: {county.seat}</div>
              <div className="text-xs text-gray-400 mt-1">Pop. {county.population.toLocaleString()}</div>
              {resolution.counties && (
                <div className="text-xs text-yellow-700 mt-1">
                  Also: {resolution.counties.slice(1).join(', ')}
                </div>
              )}
            </Card>

            {/* Comp plan */}
            <Card className="p-4">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Comp Plan</div>
              <div className="text-sm font-semibold text-gray-900 leading-snug">{county.compPlan.name}</div>
              <div className="flex items-center gap-2 mt-1.5">
                <Badge label={county.compPlan.status.charAt(0).toUpperCase() + county.compPlan.status.slice(1)} variant={county.compPlan.status} />
                <span className="text-xs text-gray-500">Adopted {county.compPlan.yearAdopted}</span>
              </div>
              {county.compPlan.horizonYear && (
                <div className="text-xs text-gray-500 mt-1">Horizon: {county.compPlan.horizonYear}</div>
              )}
              {county.compPlan.notes && (
                <div className="text-xs text-gray-500 mt-1 italic">{county.compPlan.notes}</div>
              )}
            </Card>
          </div>

          {/* Zoning & hearings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-3">Zoning Code</div>
              <div className="space-y-2 text-sm">
                <Row label="Code Name" value={county.zoning.codeName} />
                <Row label="Source" value={county.zoning.source} />
                <Row label="GIS Portal" value={county.zoning.gisPortal} />
                <Row label="GIS Type" value={county.zoning.gisType} />
                <div className="pt-1">
                  <a href={county.zoning.url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-indigo-600 hover:underline text-xs font-medium">
                    View Zoning Code ↗
                  </a>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-3">Hearing Schedule</div>
              <div className="space-y-2 text-sm">
                <Row label="BCC Schedule" value={county.hearings.bccSchedule || '—'} />
                <Row label="PC Schedule" value={county.hearings.pcSchedule || '—'} />
                <Row label="Planning Body" value={county.hearings.pcName || '—'} />
                <Row label="Video Source" value={county.hearings.bccVideoSource || 'Not available'} />
                {county.hearings.bccAgendaUrl && (
                  <div className="pt-1">
                    <a href={county.hearings.bccAgendaUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-indigo-600 hover:underline text-xs font-medium">
                      BCC Agenda Page ↗
                    </a>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Assessor */}
          <Card className="p-4">
            <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-3">Assessor</div>
            <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
              <Row label="Platform" value={county.assessor.platform} />
              <Row label="Open Data" value={county.assessor.hasOpenData ? 'Yes' : 'No'} />
              <div className="flex gap-4 flex-wrap pt-1">
                <a href={county.assessor.url} target="_blank" rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline text-xs font-medium">Assessor ↗</a>
                <a href={county.assessor.propertySearchUrl} target="_blank" rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline text-xs font-medium">Property Search ↗</a>
                <a href={county.assessor.treasurerUrl} target="_blank" rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline text-xs font-medium">Treasurer ↗</a>
              </div>
            </div>
          </Card>

          {/* HBU Inputs */}
          <Card className="p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Step 2 — Highest &amp; Best Use Analysis</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Zoning District</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={zoneCode}
                  onChange={(e) => setZoneCode(e.target.value)}
                >
                  <option value="">Select zone…</option>
                  {zoneDistricts.map((d) => (
                    <option key={d.code} value={d.code}>{d.code} — {d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Current Use</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={useCode}
                  onChange={(e) => setUseCode(e.target.value)}
                >
                  <option value="">Select use…</option>
                  {currentUses.map((u) => (
                    <option key={u.code} value={u.code}>{u.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Lot Size (sq ft)</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g. 7500"
                  value={lotSize}
                  onChange={(e) => setLotSize(e.target.value)}
                />
              </div>
            </div>
            <button
              onClick={handleAnalyze}
              disabled={!zoneCode || !useCode || !lotSize}
              className="px-5 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Run Analysis
            </button>
          </Card>

          {/* HBU Results */}
          {hbu && <HBUOutput result={hbu} />}
        </>
      )}
    </div>
  );
}

function HBUOutput({ result }: { result: HBUResult }) {
  const { verdict, signals, districtDetail: d } = result;
  const isUnder = verdict === 'underutilized';

  return (
    <div className="space-y-4">
      {/* Verdict banner */}
      <div className={`rounded-xl border p-4 flex items-center gap-3 ${isUnder ? 'bg-red-50 border-red-300' : 'bg-green-50 border-green-300'}`}>
        <span className="text-2xl">{isUnder ? '⚠️' : '✅'}</span>
        <div>
          <div className={`font-bold text-lg ${isUnder ? 'text-red-800' : 'text-green-800'}`}>
            {isUnder ? 'Potentially Underutilized' : 'At or Near Highest & Best Use'}
          </div>
          <div className={`text-sm ${isUnder ? 'text-red-600' : 'text-green-600'}`}>
            {signals.filter(s => s.severity === 'high').length} high · {signals.filter(s => s.severity === 'medium').length} medium · {signals.filter(s => s.severity === 'info').length} info signals
          </div>
        </div>
      </div>

      {/* Signal cards */}
      <div className="space-y-2">
        {signals.map((sig, i) => {
          const style = SEVERITY_STYLES[sig.severity];
          return (
            <div key={i} className={`rounded-lg border flex overflow-hidden ${style.bg}`}>
              <div className={`w-1 shrink-0 ${style.bar}`} />
              <div className="px-4 py-3">
                <div className={`text-sm font-semibold ${style.text}`}>{style.icon} {sig.title}</div>
                <div className={`text-sm mt-0.5 ${style.text} opacity-80`}>{sig.description}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* District detail */}
      <Card className="p-4">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Zone District Detail — {d.code}: {d.name}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          <MiniStat label="Min Lot" value={d.minLot > 0 ? `${d.minLot.toLocaleString()} sf` : 'None'} />
          <MiniStat label="Max Density" value={d.maxDensity > 0 ? `${d.maxDensity} DU/ac` : 'N/A'} />
          <MiniStat label="Max Height" value={d.maxHeight > 0 ? `${d.maxHeight} ft` : 'N/A'} />
          <MiniStat label="Max FAR" value={d.maxFAR > 0 ? d.maxFAR.toString() : 'N/A'} />
          <MiniStat label="Front Setback" value={`${d.setbacks.front} ft`} />
          <MiniStat label="Side Setback" value={`${d.setbacks.side} ft`} />
          <MiniStat label="Rear Setback" value={`${d.setbacks.rear} ft`} />
          <MiniStat label="Max Bldg Area" value={d.maxBuildingArea > 0 ? `${d.maxBuildingArea.toLocaleString()} sf` : 'N/A'} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 pt-3 border-t border-gray-100">
          <div>
            <div className="text-xs font-semibold text-gray-500 mb-1">Permitted Uses</div>
            <ul className="text-sm text-gray-700 space-y-0.5">
              {d.permittedUses.map((u, i) => <li key={i} className="flex gap-1.5"><span className="text-green-500">✓</span>{u}</li>)}
            </ul>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 mb-1">Conditional Uses</div>
            <ul className="text-sm text-gray-700 space-y-0.5">
              {d.conditionalUses.map((u, i) => <li key={i} className="flex gap-1.5"><span className="text-yellow-500">◉</span>{u}</li>)}
            </ul>
          </div>
        </div>
      </Card>

      {/* Nearby activity placeholder */}
      <div>
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Nearby Activity (Pipeline)</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {['Pending Rezonings', 'Recent Approvals', 'Active Variances'].map((title) => (
            <div key={title} className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-4 text-center">
              <div className="text-sm font-medium text-gray-500">{title}</div>
              <div className="text-xs text-gray-400 mt-1">Awaiting hearing data pipeline</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-gray-500 min-w-[100px] shrink-0">{label}:</span>
      <span className="text-gray-900 font-medium">{value}</span>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-sm font-bold text-gray-900 mt-0.5">{value}</div>
    </div>
  );
}
