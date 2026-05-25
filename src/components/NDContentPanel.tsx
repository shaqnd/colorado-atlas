/**
 * NDContentPanel — Floating search/filter panel for Naked Denver articles and properties.
 *
 * Shows all ND articles and properties with search, filters, and a scrollable card list.
 * When a business is focused in the directory, automatically filters to linked content.
 * Clicking a card flies the map to that location (if geocoded) and opens the ND page.
 */

import { useState, useMemo } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface NDArticle {
  id: string;
  title: string;
  url: string;
  publishedAt: string | null;
  summary: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  neighborhood: string | null;
  developmentType: string | null;
  tags: string[];
  linkedBizIds: number[];
}

export interface NDProperty {
  id: string;
  title: string;
  url: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  type: string | null;
  status: string | null;
  description: string | null;
  imageUrl: string | null;
  linkedBizIds: number[];
  linkedArticleIds: string[];
}

export interface NDMeta {
  updatedAt: string | null;
  count: number;
  geocodedCount: number;
}

interface NDContentPanelProps {
  articles: NDArticle[];
  properties: NDProperty[];
  articlesMeta: NDMeta | null;
  propertiesMeta: NDMeta | null;
  focusedBizId: number | null;
  focusedBizName: string | null;
  onFlyTo: (lng: number, lat: number) => void;
  onClose: () => void;
  offsetLeft?: number;
}

// ── Dev type colour map ────────────────────────────────────────────────────────

const TYPE_COLORS: Record<string, string> = {
  'Residential':        '#2563eb',
  'Office':             '#64748b',
  'Retail':             '#f59e0b',
  'Hotel':              '#8b5cf6',
  'Industrial':         '#6b7280',
  'Sports / Entertainment': '#ef4444',
  'Civic / Institutional':  '#14b8a6',
};

function typeColor(t: string | null): string {
  return TYPE_COLORS[t ?? ''] ?? '#6b7280';
}

function relDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const diffDays = Math.round((Date.now() - d.getTime()) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.round(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.round(diffDays / 30)}mo ago`;
  return `${Math.round(diffDays / 365)}y ago`;
}

// ── Article card ───────────────────────────────────────────────────────────────

function ArticleCard({ article, onFlyTo }: { article: NDArticle; onFlyTo: (lng: number, lat: number) => void }) {
  const color = typeColor(article.developmentType);
  const hasLocation = article.lat !== null && article.lng !== null;

  return (
    <div style={{
      padding: '10px 12px',
      borderBottom: '1px solid rgba(0,0,0,0.06)',
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, justifyContent: 'space-between' }}>
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: 12, fontWeight: 700, color: '#1c1c1e', lineHeight: 1.35, textDecoration: 'none', flex: 1 }}
        >
          {article.title}
        </a>
        {hasLocation && (
          <button
            onClick={() => onFlyTo(article.lng!, article.lat!)}
            title="Fly to location on map"
            style={{
              flexShrink: 0, border: 'none', background: 'rgba(0,113,227,0.08)',
              borderRadius: 5, padding: '2px 6px', cursor: 'pointer',
              fontSize: 10, color: '#0071e3', fontWeight: 600, whiteSpace: 'nowrap',
            }}
          >
            📍 Map
          </button>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        {article.publishedAt && (
          <span style={{ fontSize: 10, color: '#8e8e93' }}>{relDate(article.publishedAt)}</span>
        )}
        {article.neighborhood && (
          <span style={{ fontSize: 10, color: '#8e8e93', background: 'rgba(0,0,0,0.05)', padding: '1px 6px', borderRadius: 4 }}>
            {article.neighborhood}
          </span>
        )}
        {article.developmentType && (
          <span style={{
            fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 4,
            background: color + '14', color: color,
          }}>
            {article.developmentType}
          </span>
        )}
      </div>

      {article.summary && (
        <div style={{
          fontSize: 11, color: '#6c6c70', lineHeight: 1.4,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as React.CSSProperties['WebkitBoxOrient'],
          overflow: 'hidden',
        }}>
          {article.summary}
        </div>
      )}
    </div>
  );
}

// ── Property card ──────────────────────────────────────────────────────────────

function PropertyCard({ property, onFlyTo }: { property: NDProperty; onFlyTo: (lng: number, lat: number) => void }) {
  const hasLocation = property.lat !== null && property.lng !== null;
  return (
    <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, justifyContent: 'space-between' }}>
        <a
          href={property.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: 12, fontWeight: 700, color: '#1c1c1e', lineHeight: 1.35, textDecoration: 'none', flex: 1 }}
        >
          {property.title}
        </a>
        {hasLocation && (
          <button
            onClick={() => onFlyTo(property.lng!, property.lat!)}
            title="Fly to location on map"
            style={{
              flexShrink: 0, border: 'none', background: 'rgba(245,158,11,0.1)',
              borderRadius: 5, padding: '2px 6px', cursor: 'pointer',
              fontSize: 10, color: '#d97706', fontWeight: 600, whiteSpace: 'nowrap',
            }}
          >
            📍 Map
          </button>
        )}
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {property.address && (
          <span style={{ fontSize: 10, color: '#8e8e93' }}>{property.address}</span>
        )}
        {property.type && (
          <span style={{
            fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 4,
            background: typeColor(property.type) + '14', color: typeColor(property.type),
          }}>
            {property.type}
          </span>
        )}
        {property.status && (
          <span style={{ fontSize: 10, color: '#8e8e93', background: 'rgba(0,0,0,0.05)', padding: '1px 6px', borderRadius: 4 }}>
            {property.status}
          </span>
        )}
      </div>
      {property.description && (
        <div style={{
          fontSize: 11, color: '#6c6c70', lineHeight: 1.4,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as React.CSSProperties['WebkitBoxOrient'],
          overflow: 'hidden',
        }}>
          {property.description}
        </div>
      )}
    </div>
  );
}

// ── Dev type filter chips ──────────────────────────────────────────────────────

const ALL_DEV_TYPES = ['Residential', 'Office', 'Retail', 'Hotel', 'Industrial', 'Sports / Entertainment', 'Civic / Institutional'];
const ALL_NEIGHBORHOODS = ['RiNo', 'Five Points', 'Highland', 'Cherry Creek', 'Downtown', 'Capitol Hill',
  'City Park', 'City Park West', 'Baker', 'Sunnyside', 'Lincoln Park', 'Virginia Village',
  'Stapleton', 'Central Park', 'Cole', 'Park Hill', 'Belleview Station'];

// ── Main panel component ───────────────────────────────────────────────────────

export function NDContentPanel({
  articles,
  properties,
  articlesMeta,
  propertiesMeta,
  focusedBizId,
  focusedBizName,
  onFlyTo,
  onClose,
  offsetLeft = 52,
}: NDContentPanelProps) {
  const [tab, setTab] = useState<'articles' | 'properties'>('articles');
  const [query, setQuery] = useState('');
  const [devTypeFilters, setDevTypeFilters] = useState<Set<string>>(new Set());
  const [neighborhoodFilter, setNeighborhoodFilter] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // When a business is focused, auto-show its related content
  const filteredArticles = useMemo(() => {
    let list = articles;

    // If a biz is focused, only show linked articles
    if (focusedBizId !== null) {
      list = list.filter(a => a.linkedBizIds.includes(focusedBizId));
    }

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(a =>
        a.title.toLowerCase().includes(q) ||
        (a.summary ?? '').toLowerCase().includes(q) ||
        (a.neighborhood ?? '').toLowerCase().includes(q)
      );
    }

    if (devTypeFilters.size > 0) {
      list = list.filter(a => a.developmentType && devTypeFilters.has(a.developmentType));
    }

    if (neighborhoodFilter) {
      list = list.filter(a => a.neighborhood === neighborhoodFilter);
    }

    return list;
  }, [articles, focusedBizId, query, devTypeFilters, neighborhoodFilter]);

  const filteredProperties = useMemo(() => {
    let list = properties;
    if (focusedBizId !== null) {
      list = list.filter(p => p.linkedBizIds.includes(focusedBizId));
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        (p.address ?? '').toLowerCase().includes(q) ||
        (p.description ?? '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [properties, focusedBizId, query]);

  const current = tab === 'articles' ? filteredArticles : filteredProperties;
  const hasActiveFilters = devTypeFilters.size > 0 || neighborhoodFilter || !!query;
  const meta = tab === 'articles' ? articlesMeta : propertiesMeta;

  const focusedLabel = focusedBizName ? `${focusedBizName} — ` : '';

  return (
    <div style={{
      position: 'absolute',
      top: 60,
      left: offsetLeft,
      zIndex: 25,
      transition: 'left 300ms cubic-bezier(0.4,0,0.2,1)',
      width: 300,
      maxHeight: 'calc(100vh - 120px)',
      background: 'rgba(255,255,255,0.97)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderRadius: 12,
      boxShadow: '0 4px 24px rgba(0,0,0,0.16)',
      border: '1px solid rgba(0,0,0,0.08)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>

      {/* Header */}
      <div style={{ padding: '10px 12px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#1c1c1e' }}>
              {focusedLabel}Naked Denver
            </div>
            <div style={{ fontSize: 10, color: '#8e8e93', marginTop: 1 }}>
              {tab === 'articles'
                ? `${filteredArticles.length} of ${articles.length} articles`
                : `${filteredProperties.length} of ${properties.length} properties`}
              {meta?.geocodedCount ? ` · ${meta.geocodedCount} on map` : ''}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 5 }}>
            {hasActiveFilters && (
              <button
                onClick={() => { setQuery(''); setDevTypeFilters(new Set()); setNeighborhoodFilter(null); }}
                style={{ fontSize: 10, fontWeight: 600, color: '#ff3b30', background: 'rgba(255,59,48,0.08)', border: 'none', cursor: 'pointer', padding: '3px 7px', borderRadius: 5 }}
              >
                Reset
              </button>
            )}
            <button
              onClick={onClose}
              style={{ width: 22, height: 22, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 2L8 8M8 2L2 8" stroke="rgba(0,0,0,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, borderRadius: 8, background: 'rgba(0,0,0,0.05)', padding: 2, marginBottom: 8 }}>
          {(['articles', 'properties'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1, padding: '5px 8px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600,
                background: tab === t ? '#fff' : 'transparent',
                color: tab === t ? '#1c1c1e' : '#8e8e93',
                boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
                transition: 'all 100ms',
              }}
            >
              {t === 'articles' ? `Articles (${articles.length})` : `Properties (${properties.length})`}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.05)', borderRadius: 8, padding: '6px 9px', marginBottom: 6 }}>
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" style={{ flexShrink: 0, color: '#8e8e93' }}>
            <circle cx="5" cy="5" r="3.5" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M7.5 7.5L10 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={tab === 'articles' ? 'Search articles…' : 'Search properties…'}
            style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 12, color: '#1c1c1e', fontFamily: 'inherit' }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#8e8e93', padding: 0, display: 'flex', alignItems: 'center' }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><circle cx="5" cy="5" r="4.5" fill="rgba(0,0,0,0.12)"/><path d="M3 3L7 7M7 3L3 7" stroke="white" strokeWidth="1.2" strokeLinecap="round"/></svg>
            </button>
          )}
          <button
            onClick={() => setShowFilters(v => !v)}
            title="Toggle filters"
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: devTypeFilters.size > 0 || neighborhoodFilter ? '#0071e3' : '#8e8e93', padding: 0, display: 'flex', alignItems: 'center', flexShrink: 0 }}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M1.5 3.5h10M3.5 6.5h6M5.5 9.5h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Filters (collapsible) */}
        {showFilters && tab === 'articles' && (
          <div style={{ marginBottom: 6 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#8e8e93', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
              Development Type
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginBottom: 6 }}>
              {ALL_DEV_TYPES.map(t => {
                const active = devTypeFilters.has(t);
                const c = typeColor(t);
                return (
                  <button
                    key={t}
                    onClick={() => setDevTypeFilters(prev => {
                      const next = new Set(prev);
                      next.has(t) ? next.delete(t) : next.add(t);
                      return next;
                    })}
                    style={{
                      padding: '2px 7px', borderRadius: 20, fontSize: 10, fontWeight: 600, cursor: 'pointer',
                      border: `1px solid ${active ? c : 'rgba(0,0,0,0.12)'}`,
                      background: active ? c + '18' : 'transparent',
                      color: active ? c : '#6c6c70',
                    }}
                  >
                    {t}
                  </button>
                );
              })}
            </div>

            <div style={{ fontSize: 10, fontWeight: 600, color: '#8e8e93', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
              Neighborhood
            </div>
            <select
              value={neighborhoodFilter ?? ''}
              onChange={e => setNeighborhoodFilter(e.target.value || null)}
              style={{ width: '100%', fontSize: 11, padding: '4px 6px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.12)', background: '#fff', color: '#1c1c1e', outline: 'none', marginBottom: 4 }}
            >
              <option value="">All neighborhoods</option>
              {ALL_NEIGHBORHOODS.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Card list */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {current.length === 0 ? (
          <div style={{ padding: '20px 16px', textAlign: 'center', color: '#8e8e93', fontSize: 12 }}>
            {focusedBizId !== null
              ? `No ${tab} linked to this company`
              : hasActiveFilters
              ? `No ${tab} match your filters`
              : `No ${tab} available`}
          </div>
        ) : (
          tab === 'articles'
            ? (filteredArticles as NDArticle[]).map(a => <ArticleCard key={a.id} article={a} onFlyTo={onFlyTo} />)
            : (filteredProperties as NDProperty[]).map(p => <PropertyCard key={p.id} property={p} onFlyTo={onFlyTo} />)
        )}
      </div>

      {/* Footer */}
      {meta?.updatedAt && (
        <div style={{ padding: '6px 12px', borderTop: '1px solid rgba(0,0,0,0.06)', fontSize: 9, color: '#8e8e93', flexShrink: 0 }}>
          Updated {new Date(meta.updatedAt).toLocaleDateString()} · Source: nakeddenver.com
        </div>
      )}
    </div>
  );
}
