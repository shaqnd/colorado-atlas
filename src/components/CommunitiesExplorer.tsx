import { useState, useMemo } from 'react';
import {
  ALL_COMMUNITIES,
  ALL_LOADED_COUNTIES,
  type Community,
  type CommunityType,
} from '@/data/communities';
import { Card } from './Layout';

// ── Filter definitions ────────────────────────────────────────────────────────

const TYPE_FILTERS: { id: string; label: string }[] = [
  { id: 'all',                      label: 'All Types'      },
  { id: 'incorporated',             label: 'Incorporated'   },
  { id: 'CDP',                      label: 'CDP'            },
  { id: 'Unincorporated Community', label: 'Unincorporated' },
  { id: 'Neighborhood',             label: 'Neighborhood'   },
  { id: 'Military Installation',    label: 'Military'       },
];

// ── Type color coding ─────────────────────────────────────────────────────────

const TYPE_META: Record<string, { color: string; bg: string }> = {
  'Home Rule City':            { color: '#0051b3', bg: 'rgba(0,113,227,0.10)'   },
  'Home Rule Town':            { color: '#0051b3', bg: 'rgba(0,113,227,0.10)'   },
  'Statutory City':            { color: '#0051b3', bg: 'rgba(0,113,227,0.10)'   },
  'Statutory Town':            { color: '#0051b3', bg: 'rgba(0,113,227,0.10)'   },
  'Consolidated City & County':{ color: '#0051b3', bg: 'rgba(0,113,227,0.10)'   },
  'CDP':                       { color: '#6e4ff6', bg: 'rgba(110,79,246,0.10)'  },
  'Unincorporated Community':  { color: '#b25a00', bg: 'rgba(255,159,10,0.12)'  },
  'Neighborhood':              { color: '#1a7c35', bg: 'rgba(52,199,89,0.10)'   },
  'Military Installation':     { color: '#555',    bg: 'rgba(0,0,0,0.07)'       },
};

function typeLabel(t: CommunityType): string {
  switch (t) {
    case 'Home Rule City':             return 'Home Rule City';
    case 'Home Rule Town':             return 'Home Rule Town';
    case 'Statutory City':             return 'Statutory City';
    case 'Statutory Town':             return 'Statutory Town';
    case 'Consolidated City & County': return 'City & County';
    case 'CDP':                        return 'CDP';
    case 'Unincorporated Community':   return 'Unincorporated';
    case 'Neighborhood':               return 'Neighborhood';
    case 'Military Installation':      return 'Military';
  }
}

const COUNTY_COLORS: Record<string, string> = {
  // Batch 1
  'El Paso':    '#0071e3',
  'Denver':     '#6e4ff6',
  'Arapahoe':   '#ff9f0a',
  'Jefferson':  '#34c759',
  'Adams':      '#ff453a',
  // Batch 2
  'Douglas':    '#0051b3',
  'Larimer':    '#1a7c35',
  'Weld':       '#b25a00',
  'Boulder':    '#5856d6',
  'Pueblo':     '#c7291e',
  // Batch 3
  'Mesa':       '#0071e3',
  'Broomfield': '#6e4ff6',
  'Garfield':   '#34c759',
  'La Plata':   '#ff9f0a',
  'Eagle':      '#636366',
  // Batch 4
  'Fremont':    '#0051b3',
  'Montrose':   '#1a7c35',
  'Delta':      '#b25a00',
  'Summit':     '#5856d6',
  'Morgan':     '#c7291e',
  // Remaining counties
  'Elbert':      '#0071e3',
  'Montezuma':   '#8e44ad',
  'Routt':       '#16a085',
  'Teller':      '#d35400',
  'Chaffee':     '#27ae60',
  'Logan':       '#2980b9',
  'Gunnison':    '#8e44ad',
  'Pitkin':      '#16a085',
  'Las Animas':  '#c0392b',
  'Otero':       '#e67e22',
  'Grand':       '#2ecc71',
  'Archuleta':   '#9b59b6',
  'Moffat':      '#1abc9c',
  'Alamosa':     '#e74c3c',
  'Park':        '#f39c12',
  'Rio Grande':  '#3498db',
  'Prowers':     '#8e44ad',
  'Conejos':     '#27ae60',
  'Clear Creek': '#2980b9',
  'Yuma':        '#d35400',
  'Kit Carson':  '#16a085',
  'Custer':      '#c0392b',
  'Huerfano':    '#e67e22',
  'Gilpin':      '#9b59b6',
  'Rio Blanco':  '#1abc9c',
  'Ouray':       '#e74c3c',
  'San Miguel':  '#f39c12',
  'Saguache':    '#3498db',
  'Crowley':     '#8e44ad',
  'Lincoln':     '#27ae60',
  'Washington':  '#2980b9',
  'Bent':        '#d35400',
  'Jackson':     '#16a085',
  'Costilla':    '#c0392b',
  'Dolores':     '#e67e22',
  'Kiowa':       '#9b59b6',
  'Hinsdale':    '#1abc9c',
  'Mineral':     '#e74c3c',
  'Sedgwick':    '#f39c12',
  'Phillips':    '#3498db',
  'Baca':        '#8e44ad',
  'San Juan':    '#c0392b',
  'Cheyenne':    '#27ae60',
  'Lake':        '#2980b9',
};

// ── Component ─────────────────────────────────────────────────────────────────

export function CommunitiesExplorer() {
  const [search, setSearch]     = useState('');
  const [county, setCounty]     = useState<string>('all');
  const [typeFilter, setType]   = useState<string>('all');

  const filtered = useMemo(() => {
    let list = ALL_COMMUNITIES;
    if (county !== 'all') list = list.filter(c => c.county === county);
    if (typeFilter === 'incorporated') {
      list = list.filter(c => c.incorporated);
    } else if (typeFilter !== 'all') {
      list = list.filter(c => c.type === typeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.county.toLowerCase().includes(q) ||
        (c.notes ?? '').toLowerCase().includes(q)
      );
    }
    return list.slice().sort((a, b) =>
      (b.population2020 ?? 0) - (a.population2020 ?? 0)
    );
  }, [search, county, typeFilter]);

  // summary stats for current selection
  const stats = useMemo(() => ({
    total:         filtered.length,
    incorporated:  filtered.filter(c => c.incorporated).length,
    cdps:          filtered.filter(c => c.type === 'CDP').length,
    unincorporated:filtered.filter(c => c.type === 'Unincorporated Community').length,
    neighborhoods: filtered.filter(c => c.type === 'Neighborhood').length,
  }), [filtered]);

  return (
    <div className="space-y-6">

      {/* Heading */}
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--ap-t1)', margin: 0 }}>
          Communities
        </h1>
        <p style={{ fontSize: 13, color: 'var(--ap-t2)', marginTop: 4 }}>
          Incorporated cities & towns, Census Designated Places, unincorporated communities, and neighborhoods.
          <span style={{ marginLeft: 6, padding: '1px 8px', borderRadius: 99, background: 'rgba(52,199,89,0.12)', color: '#1a7c35', fontSize: 11, fontWeight: 600 }}>
            Complete · All 64 counties loaded
          </span>
        </p>
      </div>

      {/* Summary stat row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total Places',   value: stats.total,         accent: 'var(--ap-t1)'  },
          { label: 'Incorporated',   value: stats.incorporated,  accent: 'var(--ap-blue)'},
          { label: 'CDPs',           value: stats.cdps,          accent: '#6e4ff6'       },
          { label: 'Unincorporated', value: stats.unincorporated,accent: 'var(--ap-orange)'},
          { label: 'Neighborhoods',  value: stats.neighborhoods, accent: 'var(--ap-green)'},
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--ap-card)', borderRadius: 14, boxShadow: 'var(--ap-shadow)', padding: '14px 16px' }}>
            <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', color: s.accent, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--ap-t2)', marginTop: 5, fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search community name, county, or keyword…"
          style={{
            height: 38, padding: '0 14px', borderRadius: 10,
            border: '1px solid rgba(0,0,0,0.10)', background: 'rgba(0,0,0,0.03)',
            fontSize: 13, color: 'var(--ap-t1)', outline: 'none', width: '100%',
          }}
        />

        {/* County chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ap-t3)', textTransform: 'uppercase', letterSpacing: '0.04em', marginRight: 4 }}>County</span>
          {['all', ...ALL_LOADED_COUNTIES].map(c => {
            const active = county === c;
            const col = c === 'all' ? 'var(--ap-blue)' : COUNTY_COLORS[c];
            return (
              <button
                key={c}
                onClick={() => setCounty(c)}
                style={{
                  padding: '4px 12px', borderRadius: 99,
                  border: active ? 'none' : '1px solid rgba(0,0,0,0.10)',
                  background: active ? col : 'rgba(0,0,0,0.04)',
                  color: active ? '#fff' : 'var(--ap-t2)',
                  fontSize: 12, fontWeight: active ? 600 : 400,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                {c === 'all' ? 'All Counties' : c}
              </button>
            );
          })}
        </div>

        {/* Type chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ap-t3)', textTransform: 'uppercase', letterSpacing: '0.04em', marginRight: 4 }}>Type</span>
          {TYPE_FILTERS.map(f => {
            const active = typeFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setType(f.id)}
                style={{
                  padding: '4px 12px', borderRadius: 99,
                  border: active ? 'none' : '1px solid rgba(0,0,0,0.10)',
                  background: active ? 'var(--ap-blue)' : 'rgba(0,0,0,0.04)',
                  color: active ? '#fff' : 'var(--ap-t2)',
                  fontSize: 12, fontWeight: active ? 600 : 400,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                {f.label}
              </button>
            );
          })}
          <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--ap-t3)' }}>
            {filtered.length} places
          </span>
        </div>
      </div>

      {/* Community cards grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--ap-t3)', fontSize: 14 }}>
          No communities match your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(c => <CommunityCard key={`${c.county}-${c.name}`} community={c} />)}
        </div>
      )}

      {/* Batch notice */}
      <Card className="p-5">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ fontSize: 22, lineHeight: 1 }}>🗂</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ap-t1)', marginBottom: 4 }}>
              All 64 Colorado Counties — Complete Dataset
            </div>
            <div style={{ fontSize: 12, color: 'var(--ap-t2)', lineHeight: 1.6 }}>
              All 64 Colorado counties are loaded, covering incorporated cities and towns,
              Census Designated Places (CDPs), unincorporated communities, neighborhoods,
              and military installations. Populations from 2020 U.S. Decennial Census;
              unincorporated places use ACS 2019–2023 or DOLA estimates.
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ── Community card ────────────────────────────────────────────────────────────

function CommunityCard({ community: c }: { community: Community }) {
  const tm = TYPE_META[c.type] ?? { color: 'var(--ap-t2)', bg: 'rgba(0,0,0,0.06)' };
  const countyColor = COUNTY_COLORS[c.county] ?? 'var(--ap-blue)';

  return (
    <div
      style={{
        background: 'var(--ap-card)',
        borderRadius: 14,
        boxShadow: 'var(--ap-shadow)',
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        transition: 'box-shadow 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.11),0 1px 4px rgba(0,0,0,0.06)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--ap-shadow)')}
    >
      {/* Name + county dot */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ap-t1)', lineHeight: 1.3 }}>
          {c.name}
        </div>
        <span
          style={{
            fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99,
            background: `${countyColor}18`, color: countyColor, flexShrink: 0,
            letterSpacing: '0.02em',
          }}
        >
          {c.county}
        </span>
      </div>

      {/* Type + population row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span
          style={{
            fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 99,
            background: tm.bg, color: tm.color,
          }}
        >
          {typeLabel(c.type)}
        </span>
        {c.population2020 !== null && (
          <span style={{ fontSize: 12, color: 'var(--ap-t2)', fontVariantNumeric: 'tabular-nums' }}>
            {c.population2020.toLocaleString()}
            {!c.cdpVerified && <span style={{ color: 'var(--ap-t3)', fontSize: 10 }}> est.</span>}
          </span>
        )}
      </div>

      {/* Multi-county indicator */}
      {c.counties && c.counties.length > 1 && (
        <div style={{ fontSize: 11, color: 'var(--ap-t3)' }}>
          Also in: {c.counties.filter(x => x !== c.county).join(', ')}
        </div>
      )}

      {/* Notes */}
      {c.notes && (
        <div style={{ fontSize: 11, color: 'var(--ap-t3)', lineHeight: 1.5, borderTop: '1px solid var(--ap-sep)', paddingTop: 8 }}>
          {c.notes}
        </div>
      )}
    </div>
  );
}
