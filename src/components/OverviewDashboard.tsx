import { useMemo } from 'react';
import { counties } from '@/data/counties';
import { Card, Badge } from './Layout';

const fmt = (n: number) => n.toLocaleString();

export function OverviewDashboard() {
  const stats = useMemo(() => {
    const cs = { current: 0, updating: 0, aging: 0, overdue: 0 };
    let totalPop = 0, openData = 0;
    for (const c of counties) {
      cs[c.compPlan.status]++;
      totalPop += c.population;
      if (c.assessor.hasOpenData) openData++;
    }
    const avgEffRate = counties.reduce((s, c) => s + c.tax.effRate, 0) / counties.length;
    return { cs, totalPop, openData, avgEffRate };
  }, []);

  return (
    <div className="space-y-7">

      {/* Page heading */}
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--ap-t1)', margin: 0 }}>
          Overview
        </h1>
        <p style={{ fontSize: 13, color: 'var(--ap-t2)', marginTop: 4 }}>
          Statewide summary · all 64 Colorado counties · 2025–2026 data
        </p>
      </div>

      {/* Hero stat row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <HeroStat value="64"
          label="Counties"
          sub="All of Colorado"
          accent="var(--ap-blue)" />
        <HeroStat
          value={(stats.totalPop / 1_000_000).toFixed(2) + 'M'}
          label="Total Population"
          sub="2024 ACS estimates"
          accent="#6E4FF6" />
        <HeroStat
          value={stats.avgEffRate.toFixed(2) + '%'}
          label="Avg Effective Rate"
          sub="Statewide median"
          accent="var(--ap-red)" />
        <HeroStat
          value={String(stats.openData)}
          label="Open Data Portals"
          sub={`${Math.round((stats.openData / 64) * 100)}% of counties`}
          accent="var(--ap-green)" />
      </div>

      {/* Two-column row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Comp plan health */}
        <Card className="p-6">
          <SectionLabel>Comp Plan Health</SectionLabel>
          <div className="mt-4 space-y-3">
            {([
              { label: 'Current',        count: stats.cs.current,  color: 'var(--ap-green)', bg: 'rgba(52,199,89,0.14)' },
              { label: 'Updating',       count: stats.cs.updating, color: 'var(--ap-blue)',  bg: 'rgba(0,113,227,0.12)' },
              { label: 'Aging (5–10yr)',  count: stats.cs.aging,    color: 'var(--ap-orange)',bg: 'rgba(255,159,10,0.14)' },
              { label: 'Overdue (10yr+)', count: stats.cs.overdue,  color: 'var(--ap-red)',  bg: 'rgba(255,69,58,0.12)' },
            ] as const).map(row => (
              <div key={row.label} className="flex items-center gap-3">
                <span style={{ fontSize: 12, color: 'var(--ap-t2)', width: 110, flexShrink: 0 }}>
                  {row.label}
                </span>
                <div className="flex-1 rounded-full overflow-hidden" style={{ height: 6, background: 'rgba(0,0,0,0.06)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${(row.count / 64) * 100}%`, background: row.color }}
                  />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ap-t1)', width: 20, textAlign: 'right' }}>
                  {row.count}
                </span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: 'var(--ap-t3)', marginTop: 16 }}>
            {Math.round(((stats.cs.current + stats.cs.updating) / 64) * 100)}% of counties have a current or actively updating comp plan
          </p>
        </Card>

        {/* Data completeness */}
        <Card className="p-6">
          <SectionLabel>Data Completeness</SectionLabel>
          <div className="mt-4 space-y-3">
            {([
              { label: 'County records',         pct: 100, note: '64/64' },
              { label: 'Zoning codes',            pct: 100, note: '64/64' },
              { label: 'Comp plan data',          pct: 100, note: '64/64' },
              { label: 'Hearing schedules',       pct: 94,  note: '60/64' },
              { label: 'Mill levies (3 verified)',pct: 100, note: '64/64' },
              { label: 'Open data portals',       pct: Math.round((stats.openData / 64) * 100), note: `${stats.openData}/64` },
            ] as const).map(row => {
              const color = row.pct === 100 ? 'var(--ap-green)' : row.pct >= 50 ? 'var(--ap-blue)' : 'var(--ap-orange)';
              return (
                <div key={row.label} className="flex items-center gap-3">
                  <span style={{ fontSize: 12, color: 'var(--ap-t2)', width: 170, flexShrink: 0 }}>
                    {row.label}
                  </span>
                  <div className="flex-1 rounded-full overflow-hidden" style={{ height: 6, background: 'rgba(0,0,0,0.06)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${row.pct}%`, background: color }}
                    />
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--ap-t3)', width: 32, textAlign: 'right' }}>
                    {row.note}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* 3-step pipeline */}
      <Card className="p-6">
        <SectionLabel>Fastest Path to Statewide Hearing Intelligence</SectionLabel>
        <p style={{ fontSize: 12, color: 'var(--ap-t3)', marginTop: 2, marginBottom: 20 }}>
          Deploy these 3 steps in parallel to build a complete CO hearing monitoring pipeline.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              step: 1, accent: '#6E4FF6',
              title: 'DOLA LGIS Request',
              desc: 'Send a single CORA request to DOLA LGIS for the master export of all local government meeting URLs, schedules, and clerk contacts.',
              time: '~1 week turnaround',
              cta: 'See Templates →',
            },
            {
              step: 2, accent: 'var(--ap-blue)',
              title: 'Clerk Notification List',
              desc: 'File meeting notification requests with each county clerk under CRS 24-6-402(7). Valid 2 years. Covers all BCC and PC meetings.',
              time: 'Immediate effect',
              cta: '64 letters to send',
            },
            {
              step: 3, accent: 'var(--ap-green)',
              title: 'CORA Recording Requests',
              desc: 'Request audio/video recordings for historical hearings (last 12–24 months) to backfill the intelligence pipeline.',
              time: '3-day response window',
              cta: 'Template ready',
            },
          ].map(item => (
            <div
              key={item.step}
              style={{
                borderRadius: 12,
                border: `1px solid rgba(0,0,0,0.07)`,
                overflow: 'hidden',
              }}
            >
              <div
                className="flex items-center gap-2.5 px-4 py-3"
                style={{ background: item.accent }}
              >
                <span
                  className="flex items-center justify-center rounded-full shrink-0 text-xs font-bold"
                  style={{ width: 22, height: 22, background: 'rgba(255,255,255,0.22)', color: '#fff' }}
                >
                  {item.step}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{item.title}</span>
              </div>
              <div className="px-4 py-3.5" style={{ background: 'var(--ap-card)' }}>
                <p style={{ fontSize: 12, color: 'var(--ap-t2)', lineHeight: 1.55, margin: 0 }}>
                  {item.desc}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <span style={{ fontSize: 11, color: 'var(--ap-t3)' }}>{item.time}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: item.accent }}>{item.cta}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Top 10 counties */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--ap-sep)' }}>
          <SectionLabel>Top 10 Counties by Population</SectionLabel>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--ap-sep)' }}>
                {['County', 'Population', '10yr Growth', 'Eff Rate', 'Median Home', 'Plan Status'].map(h => (
                  <th
                    key={h}
                    style={{
                      padding: '10px 16px',
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'var(--ap-t3)',
                      textAlign: h === 'County' ? 'left' : 'right',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      background: 'rgba(0,0,0,0.02)',
                    }}
                  >
                    {h === 'Plan Status' ? <span style={{ textAlign: 'center', display: 'block' }}>{h}</span> : h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {counties.slice(0, 10).map((c, i) => {
                const growth = ((c.population - c.population10yr) / c.population10yr * 100).toFixed(1);
                const growthPos = Number(growth) >= 0;
                return (
                  <tr
                    key={c.name}
                    style={{
                      borderBottom: i < 9 ? '1px solid var(--ap-sep)' : undefined,
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.02)')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}
                  >
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: 'var(--ap-t1)' }}>
                      {c.name}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--ap-t1)', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                      {fmt(c.population)}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: growthPos ? 'var(--ap-green)' : 'var(--ap-red)' }}>
                      {growthPos ? '+' : ''}{growth}%
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--ap-t2)', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                      {c.tax.effRate.toFixed(2)}%
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--ap-t2)', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                      ${fmt(c.tax.medianHome)}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <Badge label={c.compPlan.status} variant={c.compPlan.status as 'current' | 'aging' | 'overdue' | 'updating'} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function HeroStat({ value, label, sub, accent }: { value: string; label: string; sub: string; accent: string }) {
  return (
    <div
      style={{
        background: 'var(--ap-card)',
        borderRadius: 16,
        boxShadow: 'var(--ap-shadow)',
        padding: '22px 22px 18px',
      }}
    >
      <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.035em', color: accent, lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ap-t1)', marginTop: 7 }}>
        {label}
      </div>
      <div style={{ fontSize: 11, color: 'var(--ap-t3)', marginTop: 2 }}>
        {sub}
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--ap-t1)', margin: 0, letterSpacing: '-0.01em' }}>
      {children}
    </h3>
  );
}
