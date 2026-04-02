# National Platform Refactor

This document extends the current Colorado Atlas codebase into a national-ready
architecture without rebuilding the product from scratch.

## Non-Negotiables

- Keep the current Colorado Atlas map and parcel workflows working throughout refactor.
- Do not move state-specific or county-specific assumptions into shared UI components.
- Preserve raw source payloads and raw source values for auditability.
- Standardize the internal schema, not the external source formats.
- Treat partial data availability as normal.
- Track provenance, freshness, and confidence at the module level.

## Current Codebase Reality

Today, the app is already split in a useful way:

- frontend app:
  - `src/components`
  - `src/App.tsx`
- source data and reference rules:
  - `src/data`
- live data fetching and source parsing:
  - `src/utils/parcelService.ts`
  - `server.ts`
- rules logic:
  - `src/utils/taxCalculations.ts`
  - `src/utils/hbuAnalysis.ts`

The biggest architectural pressure points are:

- `server.ts`
  - mixes transport, source parsing, and source-specific business rules
- `src/utils/parcelService.ts`
  - mixes canonical service intent with Colorado-specific source behavior
- `src/components/ParcelMap.tsx`
  - still owns too much data-hydration logic
- `src/components/ParcelPanel.tsx`
  - still contains source-specific display and analysis branching

## Target Architecture Layers

### 1. Core Platform

Shared across all states:

- canonical models
- normalized API contracts
- adapter contracts
- engine contracts
- layer registry
- report section contracts

New foundational files:

- `src/core/models/property.ts`
- `src/core/models/provenance.ts`
- `src/core/adapters/base.ts`
- `src/core/engines/tax.ts`
- `src/core/engines/hbu.ts`
- `src/core/layers/registry.ts`
- `src/core/api/contracts.ts`

### 2. State Modules

Each state gets:

- config
- county/municipality adapters
- tax engine implementation
- HBU engine implementation
- source-priority rules

Colorado scaffold added:

- `src/states/co/config/stateConfig.ts`
- `src/states/co/adapters/*`
- `src/states/co/engines/*`

### 3. Migration Principle

The current app does **not** switch to these new modules all at once.

Instead:

1. create the stable architecture
2. wrap current Colorado behavior into those interfaces
3. migrate one feature at a time
4. keep compatibility wrappers until the live UI is fully moved

## Recommended Next Migration Sequence

### Phase 1: Foundation

- add canonical models
- add provenance types
- add adapter contracts
- add Colorado module metadata

### Phase 2: Normalized Read API

Add normalized endpoints beside current source endpoints:

- `GET /search?q=`
- `GET /properties/:id`
- `GET /properties/:id/ownership`
- `GET /properties/:id/tax`
- `GET /properties/:id/zoning`
- `GET /properties/:id/development-potential`

These endpoints should initially adapt current Colorado flows behind the scenes.

### Phase 3: Tax and HBU Extraction

- move tax comparable logic out of `ParcelPanel`
- move HBU logic out of `ParcelPanel` and `hbuAnalysis.ts`
- keep existing output shape until UI migration is complete

### Phase 4: Layer Registry

- move hardcoded layer definitions out of `ParcelMap`
- make layer availability config-driven by state/county/municipality

### Phase 5: Report Engine

- replace hand-built report rendering branches with reusable report sections
- keep current printable outputs working through compatibility templates

## Colorado-Specific Immediate Implications

Colorado remains the first production state module.

Near-term county completion path:

1. finish Arapahoe municipal zoning connectors
2. complete Douglas parity
3. migrate Denver/Douglas/Arapahoe tax logic into `ColoradoTaxEngine`
4. migrate Colorado HBU logic into `ColoradoHBUEngine`
5. expose normalized `/properties/:id/*` endpoints

Only after that should the next county/state rollout expand materially.
