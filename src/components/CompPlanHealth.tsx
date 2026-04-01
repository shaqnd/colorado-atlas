import { useMemo } from 'react';
import { counties } from '@/data/counties';
import { Badge, Card } from './Layout';

const CURRENT_YEAR = 2026;

const STATUS_META = {
  current:  { label: 'Current',           accent: 'var(--ap-green)',  bg: 'rgba(52,199,89,0.08)',   border: 'rgba(52,199,89,0.20)'  },
  updating: { label: 'Updating',          accent: 'var(--ap-blue)',   bg: 'rgba(0,113,227,0.07)',   border: 'rgba(0,113,227,0.15)'  },
  aging:    { label: 'Aging (5–10 yr)',   accent: 'var(--ap-orange)', bg: 'rgba(255,159,10,0.08)',  border: 'rgba(255,159,10,0.20)' },
  overdue:  { label: 'Overdue (10yr+)',   accent: 'var(--ap-red)',    bg: 'rgba(255,69,58,0.08)',   border: 'rgba(255,69,58,0.20)'  },
} as const;

type Status = keyof typeof STATUS_META;

export function CompPlanHealth() {
  const stats = useMemo(() => {
    const counts = { current: 0, updating: 0, aging: 0, overdue: 0 } as Record<Status, number>;
    for (const c of counties) counts[c.compPlan.status as Status]++;
    return counts;
  }, []);

  const grouped = useMemo(() => ({
    current:  counties.filter(c => c.compPlan.status === 'current').sort((a, b) => b.compPlan.yearAdopted - a.compPlan.yearAdopted),
    updating: counties.filter(c => c.compPlan.status === 'updating').sort((a, b) => b.compPlan.yearAdopted - a.compPlan.yearAdopted),
    aging:    counties.filter(c => c.compPlan.status === 'aging').sort((a, b) => a.compPlan.yearAdopted - b.compPlan.yearAdopted),
    overdue:  counties.filter(c => c.compPlan.status === 'overdue').sort((a, b) => a.compPlan.yearAdopted - b.compPlan.yearAdopted),
  }), []);

  const currentPct = Math.round(((stats.current + stats.updating) / 64) * 100);

  return (
    <div className="space-y-6">

      {/* Heading */}
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--ap-t1)', margin: 0 }}>
          Comp Plan Health
        </h1>
        <p style={{ fontSize: 13, color: 'var(--ap-t2)', marginTop: 4 }}>
          Currency, horizon years, and update activity across all 64 Colorado counties.
        </p>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(['current', 'updating', 'aging', 'overdue'] as const).map(s => {
          const m = STATUS_META[s];
          return (
            <div key={s} style={{ background: 'var(--ap-card)', borderRadius: 16, boxShadow: 'var(--ap-shadow)', padding: '18px 20px' }}>
              <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.04em', color: m.accent, lineHeight: 1 }}>
                {stats[s]}
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ap-t1)', marginTop: 7 }}>
                {m.label}
              </div>
              <div style={{ fontSize: 11, color: 'var(--ap-t3)', marginTop: 2 }}>
                {Math.round((stats[s] / 64) * 100)}% of counties
              </div>
            </div>
          );
        })}
      </div>

      {/* Segmented health bar */}
      <Card className="p-6">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ap-t1)' }}>Statewide Plan Currency</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ap-t1)' }}>{currentPct}% current or updating</span>
        </div>

        <div style={{ display: 'flex', gap: 3, height: 10, borderRadius: 99, overflow: 'hidden' }}>
          {(['current', 'updating', 'aging', 'overdue'] as const).map(s => (
            <div
              key={s}
              style={{
                flex: stats[s],
                background: STATUS_META[s].accent,
                transition: 'flex 0.7s ease',
                borderRadius: 0,
              }}
            />
          ))}
        </div>

        <div style={{ display: 'flex', gap: 20, marginTop: 12 }}>
          {(['current', 'updating', 'aging', 'overdue'] as const).map(s => (
            <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--ap-t3)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_META[s].accent, flexShrink: 0 }} />
              {STATUS_META[s].label.split(' ')[0]}
            </span>
          ))}
        </div>
      </Card>

      {/* County grids by status */}
      {(['overdue', 'aging', 'updating', 'current'] as const).map(status => {
        const list = grouped[status];
        if (!list.length) return null;
        const m = STATUS_META[status];
        return (
          <Card key={status} className="overflow-hidden">
            {/* Section header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 20px',
                borderBottom: '1px solid var(--ap-sep)',
                background: m.bg,
              }}
            >
              <Badge label={m.label.split(' ')[0]} variant={status} />
              <span style={{ fontSize: 13, color: 'var(--ap-t2)', fontWeight: 500 }}>
                {list.length} {list.length === 1 ? 'county' : 'counties'}
              </span>
            </div>

            {/* County cards grid */}
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {list.map(c => {
                const age = CURRENT_YEAR - c.compPlan.yearAdopted;
                const pastHorizon = c.compPlan.horizonYear && c.compPlan.horizonYear <= CURRENT_YEAR;
                return (
                  <div
                    key={c.name}
                    style={{
                      border: '1px solid var(--ap-sep)',
                      borderRadius: 12,
                      padding: '12px 14px',
                      background: 'var(--ap-card)',
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.02)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'var(--ap-card)')}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ap-t1)' }}>{c.name} County</div>
                        <div style={{ fontSize: 11, color: 'var(--ap-t3)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {c.compPlan.name}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ap-t1)' }}>{c.compPlan.yearAdopted}</div>
                        <div style={{ fontSize: 11, color: age >= 10 ? 'var(--ap-red)' : age >= 5 ? 'var(--ap-orange)' : 'var(--ap-t3)', marginTop: 1 }}>
                          {age}yr old
                        </div>
                      </div>
                    </div>

                    {c.compPlan.horizonYear && (
                      <div style={{ fontSize: 11, marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ color: 'var(--ap-t3)' }}>Horizon:</span>
                        <span style={{ fontWeight: 600, color: pastHorizon ? 'var(--ap-red)' : 'var(--ap-t2)' }}>
                          {c.compPlan.horizonYear}{pastHorizon ? ' · past' : ''}
                        </span>
                      </div>
                    )}
                    {c.compPlan.notes && (
                      <div style={{ fontSize: 11, color: 'var(--ap-t3)', marginTop: 6, fontStyle: 'italic', lineHeight: 1.5 }}>
                        {c.compPlan.notes}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
