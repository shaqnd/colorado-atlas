import { useState, type ReactNode } from 'react';

export type TabId =
  | 'map'
  | 'overview' | 'zoning' | 'tax' | 'rates'
  | 'counties' | 'communities' | 'compplan' | 'templates' | 'schema' | 'sources';

// ── SVG icon set (16×16, SF Symbols-inspired) ────────────────────────────────
const Ico = {
  map: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M1.5 4.5L5.5 3L10.5 5L14.5 3.5V12.5L10.5 14L5.5 12L1.5 13.5V4.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="none"/>
      <path d="M5.5 3V12M10.5 5V14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  overview: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1.5" fill="currentColor"/>
      <rect x="9"   y="1.5" width="5.5" height="5.5" rx="1.5" fill="currentColor"/>
      <rect x="1.5" y="9"   width="5.5" height="5.5" rx="1.5" fill="currentColor"/>
      <rect x="9"   y="9"   width="5.5" height="5.5" rx="1.5" fill="currentColor"/>
    </svg>
  ),
  zoning: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1.5 L2 6.5 L2 14 L6 14 L6 10 L10 10 L10 14 L14 14 L14 6.5 Z" fill="currentColor" fillRule="evenodd"/>
    </svg>
  ),
  tax: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="2" width="12" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M5.5 8H10.5M8 5.5V10.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
    </svg>
  ),
  rates: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="1.5" width="12" height="13" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M5 6H11M5 9H9M5 12H8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  counties: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="1.5" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M1.5 5.5H14.5M1.5 9.5H14.5M5.5 1.5V14.5" stroke="currentColor" strokeWidth="1.4"/>
    </svg>
  ),
  compplan: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 12L5.5 7.5L8.5 10L11.5 5.5L14 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 14H14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity=".4"/>
    </svg>
  ),
  templates: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="3.5" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M2 7H14" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M5.5 3.5V2M10.5 3.5V2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  schema: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <ellipse cx="8" cy="4.5" rx="5.5" ry="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M2.5 4.5V8C2.5 9.1 5 10 8 10s5.5-.9 5.5-2V4.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M2.5 8V11.5C2.5 12.6 5 13.5 8 13.5s5.5-.9 5.5-2V8" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  communities: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1.5C5.515 1.5 3.5 3.515 3.5 6C3.5 9.375 8 14.5 8 14.5C8 14.5 12.5 9.375 12.5 6C12.5 3.515 10.485 1.5 8 1.5Z" fill="currentColor"/>
      <circle cx="8" cy="6" r="1.75" fill="white" fillOpacity="0.9"/>
    </svg>
  ),
  sources: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M7 3H4a1.5 1.5 0 00-1.5 1.5v7A1.5 1.5 0 004 13h8a1.5 1.5 0 001.5-1.5V9M10 2h4v4M14 2L7.5 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  menu: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M3 5H15M3 9H15M3 13H15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
    </svg>
  ),
  close: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M4 4L14 14M14 4L4 14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
    </svg>
  ),
};

// ── Navigation config ─────────────────────────────────────────────────────────
const NAV: { id: TabId; label: string; icon: ReactNode }[][] = [
  [
    { id: 'map',       label: 'Parcel Map',     icon: Ico.map       },
    { id: 'overview',  label: 'Overview',       icon: Ico.overview  },
    { id: 'zoning',    label: 'Zoning / HBU',   icon: Ico.zoning    },
    { id: 'tax',       label: 'Tax Calculator', icon: Ico.tax       },
    { id: 'rates',     label: 'Rates & Law',    icon: Ico.rates     },
    { id: 'counties',     label: 'County Table',   icon: Ico.counties     },
    { id: 'communities',  label: 'Communities',    icon: Ico.communities  },
    { id: 'compplan',     label: 'Comp Plans',     icon: Ico.compplan     },
    { id: 'templates', label: 'CORA Letters',   icon: Ico.templates },
  ],
  [
    { id: 'schema',  label: 'Schema',  icon: Ico.schema  },
    { id: 'sources', label: 'Sources', icon: Ico.sources },
  ],
];

// ── Layout ────────────────────────────────────────────────────────────────────
interface LayoutProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  children: ReactNode;
  /** When true, removes the max-width/padding wrapper so content fills all available space (e.g. the map). */
  fullBleed?: boolean;
}

export function Layout({ activeTab, onTabChange, children, fullBleed = false }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function nav(id: TabId) {
    onTabChange(id);
    setSidebarOpen(false);
  }

  const currentLabel = NAV.flat().find(n => n.id === activeTab)?.label ?? '';

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--ap-page)' }}>

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.28)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={[
          'fixed lg:relative z-40 h-full flex flex-col shrink-0 transition-transform duration-300 ease-out',
          'lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
        style={{
          width: 240,
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRight: '1px solid var(--ap-sep)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 pt-6 pb-5">
          <div
            className="flex items-center justify-center rounded-xl text-white text-[13px] font-bold shrink-0"
            style={{
              width: 36, height: 36,
              background: 'linear-gradient(145deg,#0071E3,#0051B3)',
              boxShadow: '0 2px 8px rgba(0,113,227,0.35)',
            }}
          >
            CO
          </div>
          <div>
            <div className="text-[13px] font-semibold leading-tight" style={{ color: 'var(--ap-t1)' }}>
              Colorado Atlas
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 space-y-5 pb-4">
          {NAV.map((section, si) => (
            <div key={si}>
              {si > 0 && (
                <div className="mb-2 mx-1" style={{ height: 1, background: 'var(--ap-sep)' }} />
              )}
              <div className="space-y-0.5">
                {section.map(item => {
                  const active = item.id === activeTab;
                  return (
                    <button
                      key={item.id}
                      onClick={() => nav(item.id)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all duration-150"
                      style={{
                        background: active ? 'var(--ap-blue)' : 'transparent',
                        color: active ? '#fff' : 'var(--ap-t2)',
                        fontSize: 13,
                        fontWeight: active ? 500 : 400,
                      }}
                      onMouseEnter={e => {
                        if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.05)';
                      }}
                      onMouseLeave={e => {
                        if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent';
                      }}
                    >
                      <span className="shrink-0">{item.icon}</span>
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Status badge */}
        <div className="px-4 pb-5 pt-2">
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: 'rgba(52,199,89,0.10)' }}
          >
            <span
              className="inline-block rounded-full shrink-0 animate-pulse"
              style={{ width: 6, height: 6, background: 'var(--ap-green)' }}
            />
            <span style={{ fontSize: 11, fontWeight: 500, color: '#1a7c35' }}>
              2026 Rates Active
            </span>
          </div>
        </div>
      </aside>

      {/* ── Main column ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Mobile topbar */}
        <header
          className="flex items-center gap-3 px-4 py-3 shrink-0 lg:hidden"
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(16px)',
            borderBottom: '1px solid var(--ap-sep)',
          }}
        >
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className="rounded-lg p-1.5 transition-colors"
            style={{ color: 'var(--ap-t2)' }}
          >
            {sidebarOpen ? Ico.close : Ico.menu}
          </button>
          <span className="text-[15px] font-semibold" style={{ color: 'var(--ap-t1)' }}>
            {currentLabel}
          </span>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-hidden relative">
          {fullBleed ? (
            <div style={{ width: '100%', height: '100%' }}>
              {children}
            </div>
          ) : (
            <div className="h-full overflow-y-auto">
              <div className="max-w-5xl mx-auto px-5 py-8 lg:px-8">
                {children}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// ── Shared primitives ─────────────────────────────────────────────────────────

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={className}
      style={{
        background: 'var(--ap-card)',
        borderRadius: 16,
        boxShadow: 'var(--ap-shadow)',
      }}
    >
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;   // CSS color string, defaults to ap-blue
}

export function StatCard({ label, value, sub, accent }: StatCardProps) {
  const color = accent ?? 'var(--ap-blue)';
  return (
    <div
      style={{
        background: 'var(--ap-card)',
        borderRadius: 16,
        boxShadow: 'var(--ap-shadow)',
        padding: '20px 22px',
      }}
    >
      <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.03em', color, lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ap-t1)', marginTop: 6 }}>
        {label}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: 'var(--ap-t3)', marginTop: 2 }}>
          {sub}
        </div>
      )}
    </div>
  );
}

export function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-6">
      <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ap-t1)', margin: 0 }}>
        {title}
      </h2>
      {sub && (
        <p style={{ fontSize: 13, color: 'var(--ap-t2)', marginTop: 3, marginBottom: 0 }}>
          {sub}
        </p>
      )}
    </div>
  );
}

type BadgeVariant = 'current' | 'aging' | 'overdue' | 'updating' | 'info' | 'success' | 'warn';
const badgeStyles: Record<BadgeVariant, { bg: string; color: string }> = {
  current:  { bg: 'rgba(52,199,89,0.12)',   color: '#1a7c35' },
  updating: { bg: 'rgba(0,113,227,0.10)',    color: '#0051b3' },
  aging:    { bg: 'rgba(255,159,10,0.12)',   color: '#b25a00' },
  overdue:  { bg: 'rgba(255,69,58,0.10)',    color: '#c7291e' },
  info:     { bg: 'rgba(0,0,0,0.06)',        color: 'var(--ap-t2)' },
  success:  { bg: 'rgba(52,199,89,0.12)',    color: '#1a7c35' },
  warn:     { bg: 'rgba(255,159,10,0.12)',   color: '#b25a00' },
};

export function Badge({ label, variant }: { label: string; variant: BadgeVariant }) {
  const s = badgeStyles[variant];
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 9px',
        borderRadius: 99,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.01em',
        background: s.bg,
        color: s.color,
      }}
    >
      {label}
    </span>
  );
}

/** Horizontal rule / divider */
export function Divider() {
  return <div style={{ height: 1, background: 'var(--ap-sep)', margin: '4px 0' }} />;
}
