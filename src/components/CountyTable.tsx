import { useState, useMemo } from 'react';
import { counties } from '@/data/counties';
import { Badge, Card } from './Layout';
import type { County } from '@/data/types';

type Layer = 'all' | 'compplans' | 'tax' | 'population' | 'zoning' | 'hearings' | 'assessor';
type SortKey = 'name' | 'population' | 'pop_growth' | 'effRate' | 'medianTax' | 'medianHome' | 'compYear';
type SortDir = 'asc' | 'desc';

const LAYERS: { id: Layer; label: string }[] = [
  { id: 'all',        label: 'All'        },
  { id: 'population', label: 'Population' },
  { id: 'tax',        label: 'Tax Rates'  },
  { id: 'compplans',  label: 'Comp Plans' },
  { id: 'zoning',     label: 'Zoning'     },
  { id: 'hearings',   label: 'Hearings'   },
  { id: 'assessor',   label: 'Assessor'   },
];

export function CountyTable() {
  const [search, setSearch]     = useState('');
  const [layer, setLayer]       = useState<Layer>('all');
  const [sortKey, setSortKey]   = useState<SortKey>('population');
  const [sortDir, setSortDir]   = useState<SortDir>('desc');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = [...counties];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q) || c.seat.toLowerCase().includes(q));
    }
    list.sort((a, b) => {
      let av = 0, bv = 0;
      switch (sortKey) {
        case 'name':       { const d = a.name.localeCompare(b.name); return sortDir === 'asc' ? d : -d; }
        case 'population': av = a.population; bv = b.population; break;
        case 'pop_growth': av = growthPct(a); bv = growthPct(b); break;
        case 'effRate':    av = a.tax.effRate; bv = b.tax.effRate; break;
        case 'medianTax':  av = a.tax.medianTax; bv = b.tax.medianTax; break;
        case 'medianHome': av = a.tax.medianHome; bv = b.tax.medianHome; break;
        case 'compYear':   av = a.compPlan.yearAdopted; bv = b.compPlan.yearAdopted; break;
      }
      return sortDir === 'asc' ? av - bv : bv - av;
    });
    return list;
  }, [search, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  }

  function toggleExpand(name: string) {
    setExpanded(p => p === name ? null : name);
  }

  return (
    <div className="space-y-5">

      {/* Heading */}
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--ap-t1)', margin: 0 }}>
          County Table
        </h1>
        <p style={{ fontSize: 13, color: 'var(--ap-t2)', marginTop: 4 }}>
          All 64 Colorado counties. Filter by layer, search, sort any column, expand for full detail.
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search county or seat…"
          style={{
            height: 36,
            padding: '0 12px',
            borderRadius: 10,
            border: '1px solid rgba(0,0,0,0.10)',
            background: 'rgba(0,0,0,0.03)',
            fontSize: 13,
            color: 'var(--ap-t1)',
            outline: 'none',
            width: 220,
          }}
        />

        {/* Filter chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {LAYERS.map(l => {
            const active = layer === l.id;
            return (
              <button
                key={l.id}
                onClick={() => setLayer(l.id)}
                style={{
                  padding: '4px 12px',
                  borderRadius: 99,
                  border: active ? 'none' : '1px solid rgba(0,0,0,0.10)',
                  background: active ? 'var(--ap-blue)' : 'rgba(0,0,0,0.04)',
                  color: active ? '#fff' : 'var(--ap-t2)',
                  fontSize: 12,
                  fontWeight: active ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {l.label}
              </button>
            );
          })}
        </div>

        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--ap-t3)' }}>
          {filtered.length} counties
        </span>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--ap-sep)' }}>
                <th style={thStyle(false)}>#</th>
                <SortTh label="County"    sortKey="name"       current={sortKey} dir={sortDir} onSort={toggleSort} align="left" />
                <th style={{ ...thStyle(false), textAlign: 'left' }}>Seat</th>

                {(layer === 'all' || layer === 'population') && <>
                  <SortTh label="Population"  sortKey="population" current={sortKey} dir={sortDir} onSort={toggleSort} />
                  <SortTh label="10yr Growth" sortKey="pop_growth" current={sortKey} dir={sortDir} onSort={toggleSort} />
                </>}
                {(layer === 'all' || layer === 'tax') && <>
                  <SortTh label="Eff Rate"  sortKey="effRate"    current={sortKey} dir={sortDir} onSort={toggleSort} />
                  <SortTh label="Med Tax"   sortKey="medianTax"  current={sortKey} dir={sortDir} onSort={toggleSort} />
                  <SortTh label="Med Home"  sortKey="medianHome" current={sortKey} dir={sortDir} onSort={toggleSort} />
                </>}
                {(layer === 'all' || layer === 'compplans') && <>
                  <SortTh label="Plan Year" sortKey="compYear"   current={sortKey} dir={sortDir} onSort={toggleSort} />
                  <th style={thStyle(false)}>Status</th>
                </>}
                {layer === 'zoning' && <>
                  <th style={{ ...thStyle(false), textAlign: 'left' }}>Zoning Code</th>
                  <th style={{ ...thStyle(false), textAlign: 'left' }}>Source</th>
                  <th style={{ ...thStyle(false), textAlign: 'left' }}>GIS Type</th>
                </>}
                {layer === 'hearings' && <>
                  <th style={{ ...thStyle(false), textAlign: 'left' }}>BCC Schedule</th>
                  <th style={{ ...thStyle(false), textAlign: 'left' }}>PC Name</th>
                  <th style={{ ...thStyle(false), textAlign: 'left' }}>Video</th>
                </>}
                {layer === 'assessor' && <>
                  <th style={{ ...thStyle(false), textAlign: 'left' }}>Platform</th>
                  <th style={{ ...thStyle(false), textAlign: 'left' }}>Open Data</th>
                </>}
                <th style={{ ...thStyle(false), width: 32 }} />
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => {
                const isExpanded = expanded === c.name;
                const gp = growthPct(c);
                return (
                  <>
                    <tr
                      key={c.name}
                      onClick={() => toggleExpand(c.name)}
                      style={{
                        borderBottom: '1px solid var(--ap-sep)',
                        cursor: 'pointer',
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.background = 'rgba(0,0,0,0.02)'; }}
                      onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.background = ''; }}
                    >
                      <td style={{ padding: '10px 14px', fontSize: 11, color: 'var(--ap-t3)', textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>{c.rank}</td>
                      <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 600, color: 'var(--ap-t1)' }}>{c.name}</td>
                      <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--ap-t2)' }}>{c.seat}</td>

                      {(layer === 'all' || layer === 'population') && <>
                        <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--ap-t1)', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{c.population.toLocaleString()}</td>
                        <td style={{ padding: '10px 14px', fontSize: 12, fontWeight: 600, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: gp >= 0 ? 'var(--ap-green)' : 'var(--ap-red)' }}>
                          {gp >= 0 ? '+' : ''}{gp.toFixed(1)}%
                        </td>
                      </>}
                      {(layer === 'all' || layer === 'tax') && <>
                        <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 600, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'var(--ap-red)' }}>{c.tax.effRate.toFixed(2)}%</td>
                        <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--ap-t2)', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>${c.tax.medianTax.toLocaleString()}</td>
                        <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--ap-t2)', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>${c.tax.medianHome.toLocaleString()}</td>
                      </>}
                      {(layer === 'all' || layer === 'compplans') && <>
                        <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--ap-t2)', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{c.compPlan.yearAdopted}</td>
                        <td style={{ padding: '10px 14px' }}>
                          <Badge
                            label={c.compPlan.status.charAt(0).toUpperCase() + c.compPlan.status.slice(1)}
                            variant={c.compPlan.status as 'current' | 'aging' | 'overdue' | 'updating'}
                          />
                        </td>
                      </>}
                      {layer === 'zoning' && <>
                        <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--ap-t2)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.zoning.codeName}</td>
                        <td style={{ padding: '10px 14px', fontSize: 11, color: 'var(--ap-t3)' }}>{c.zoning.source}</td>
                        <td style={{ padding: '10px 14px', fontSize: 11, color: 'var(--ap-t3)' }}>{c.zoning.gisType}</td>
                      </>}
                      {layer === 'hearings' && <>
                        <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--ap-t2)' }}>{c.hearings.bccSchedule || '—'}</td>
                        <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--ap-t3)' }}>{c.hearings.pcName || '—'}</td>
                        <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--ap-t3)' }}>{c.hearings.bccVideoSource || '—'}</td>
                      </>}
                      {layer === 'assessor' && <>
                        <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--ap-t2)' }}>{c.assessor.platform}</td>
                        <td style={{ padding: '10px 14px', fontSize: 12, fontWeight: 600, color: c.assessor.hasOpenData ? 'var(--ap-green)' : 'var(--ap-t3)' }}>
                          {c.assessor.hasOpenData ? 'Yes' : 'No'}
                        </td>
                      </>}
                      <td style={{ padding: '10px 14px', fontSize: 10, color: 'var(--ap-t3)', textAlign: 'center' }}>
                        {isExpanded ? '▲' : '▼'}
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr key={`${c.name}-exp`} style={{ borderBottom: '1px solid var(--ap-sep)' }}>
                        <td colSpan={20} style={{ padding: '0' }}>
                          <ExpandedRow county={c} />
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ── Expanded row ──────────────────────────────────────────────────────────────

function ExpandedRow({ county: c }: { county: County }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 0,
        background: 'rgba(0,113,227,0.04)',
        borderTop: '1px solid rgba(0,113,227,0.10)',
        padding: '16px 20px',
      }}
    >
      <Section accent="var(--ap-blue)" title="Population">
        <Pair k="Current"    v={c.population.toLocaleString()} />
        <Pair k="5yr ago"    v={c.population5yr.toLocaleString()} />
        <Pair k="10yr ago"   v={c.population10yr.toLocaleString()} />
        <Pair k="5yr Δ"      v={`${pctChange(c.population, c.population5yr)}%`} />
        <Pair k="10yr Δ"     v={`${pctChange(c.population, c.population10yr)}%`} />
      </Section>

      <Section accent="var(--ap-red)" title="Tax">
        <Pair k="Eff Rate"    v={`${c.tax.effRate.toFixed(2)}%`} />
        <Pair k="Median Tax"  v={`$${c.tax.medianTax.toLocaleString()}`} />
        <Pair k="Median Home" v={`$${c.tax.medianHome.toLocaleString()}`} />
        {c.tax.countyMill && <Pair k="County Mill" v={c.tax.countyMill.toFixed(3)} />}
      </Section>

      <Section accent="var(--ap-orange)" title="Comp Plan">
        <Pair k="Name"    v={c.compPlan.name} />
        <Pair k="Adopted" v={String(c.compPlan.yearAdopted)} />
        <Pair k="Status"  v={c.compPlan.status} />
        {c.compPlan.horizonYear && <Pair k="Horizon" v={String(c.compPlan.horizonYear)} />}
        {c.compPlan.notes && (
          <div style={{ fontSize: 11, color: 'var(--ap-t3)', marginTop: 6, fontStyle: 'italic', lineHeight: 1.5 }}>{c.compPlan.notes}</div>
        )}
      </Section>

      <Section accent="var(--ap-green)" title="Zoning / GIS">
        <Pair k="Code"   v={c.zoning.codeName} />
        <Pair k="Source" v={c.zoning.source} />
        <Pair k="GIS"    v={c.zoning.gisType} />
        <div style={{ marginTop: 8 }}>
          <a href={c.zoning.url} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 11, color: 'var(--ap-blue)', fontWeight: 600 }}>
            View Code ↗
          </a>
        </div>
      </Section>

      <Section accent="#6E4FF6" title="Hearings">
        <Pair k="BCC"   v={c.hearings.bccSchedule || '—'} />
        <Pair k="PC"    v={c.hearings.pcSchedule || '—'} />
        <Pair k="Body"  v={c.hearings.pcName || '—'} />
        <Pair k="Video" v={c.hearings.bccVideoSource || '—'} />
        <div style={{ marginTop: 8, display: 'flex', gap: 12 }}>
          {c.hearings.bccAgendaUrl && (
            <a href={c.hearings.bccAgendaUrl} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 11, color: 'var(--ap-blue)', fontWeight: 600 }}>
              Agenda ↗
            </a>
          )}
          <a href={c.assessor.url} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 11, color: 'var(--ap-blue)', fontWeight: 600 }}>
            Assessor ↗
          </a>
        </div>
      </Section>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function Section({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: '4px 12px 4px 0', borderRight: '1px solid rgba(0,0,0,0.06)' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: accent, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>{children}</div>
    </div>
  );
}

function Pair({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: 'flex', gap: 6, fontSize: 12 }}>
      <span style={{ color: 'var(--ap-t3)', minWidth: 72, flexShrink: 0 }}>{k}:</span>
      <span style={{ color: 'var(--ap-t1)', fontWeight: 500 }}>{v}</span>
    </div>
  );
}

function thStyle(sortable: boolean): React.CSSProperties {
  return {
    padding: '10px 14px',
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--ap-t3)',
    textAlign: 'right',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    background: 'rgba(0,0,0,0.02)',
    userSelect: sortable ? 'none' : undefined,
    cursor: sortable ? 'pointer' : undefined,
    whiteSpace: 'nowrap',
  };
}

function SortTh({
  label, sortKey: key, current, dir, onSort, align = 'right',
}: {
  label: string;
  sortKey: SortKey;
  current: SortKey;
  dir: SortDir;
  onSort: (k: SortKey) => void;
  align?: 'left' | 'right';
}) {
  const active = current === key;
  return (
    <th
      onClick={() => onSort(key)}
      style={{
        ...thStyle(true),
        textAlign: align,
        color: active ? 'var(--ap-t1)' : 'var(--ap-t3)',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--ap-t1)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = active ? 'var(--ap-t1)' : 'var(--ap-t3)'; }}
    >
      {label}{active ? (dir === 'asc' ? ' ↑' : ' ↓') : ''}
    </th>
  );
}

function growthPct(c: County): number {
  return ((c.population - c.population10yr) / c.population10yr) * 100;
}

function pctChange(current: number, prior: number): string {
  const pct = ((current - prior) / prior) * 100;
  return (pct >= 0 ? '+' : '') + pct.toFixed(1);
}
