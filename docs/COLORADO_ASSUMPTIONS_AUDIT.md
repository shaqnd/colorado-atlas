# Colorado Assumptions Audit

This is a working inventory of Colorado-specific assumptions that should move
out of shared code over time.

## Frontend Pressure Points

### `src/components/ParcelMap.tsx`

Current Colorado-specific behaviors inside shared map flow:

- county-specific parcel hydration branches for Denver, Douglas, and Arapahoe
- Denver neighborhood loading
- Colorado statewide county and municipal boundary assumptions
- Colorado parcel preview queries against statewide parcel service
- county-specific smart-search resolution behavior

Target:
- map shell stays shared
- state/county data resolution moves behind normalized property APIs or adapter services

### `src/components/ParcelPanel.tsx`

Current Colorado-specific behaviors inside shared panel flow:

- Denver, Douglas, and Arapahoe parcel detail branching
- county-specific valuation sections
- county-specific source links
- county-specific zoning authority handling
- tax comparable logic embedded in UI
- report text composition embedded in UI

Target:
- panel renders normalized modules
- source-specific branching moves into adapters and engines

## API / Service Pressure Points

### `server.ts`

Current Colorado-specific behaviors:

- Denver building and valuation endpoints
- Douglas assessor parsing
- Arapahoe parcel and zoning parsing
- source-specific HTML parsing
- source-specific field mapping

Target:
- `server.ts` becomes route composition
- source-specific code moves into adapter modules

### `src/utils/parcelService.ts`

Current Colorado-specific behaviors:

- statewide Colorado parcel query
- Denver zoning/building helpers
- Douglas detail orchestration
- Arapahoe detail/zoning orchestration
- municipality and neighborhood boundary queries tied to Colorado sources

Target:
- parcel service becomes normalized client service
- source-specific fetchers move into state adapters

## Rules Pressure Points

### `src/utils/taxCalculations.ts`

Current Colorado-specific assumption:

- Colorado tax mechanics are embedded in a general utility context

Target:
- move to `src/states/co/engines/coloradoTaxEngine.ts`

### `src/utils/hbuAnalysis.ts`

Current Colorado-specific assumption:

- Colorado / Denver zoning mapping is embedded in a generic rules utility

Target:
- move to `src/states/co/engines/coloradoHBUEngine.ts`
- separate generic engine contract from Colorado implementation

## Data Catalog Pressure Points

### `src/data/*`

Mixed concerns currently live together:

- canonical-ish shared types
- Denver-specific zoning catalogs
- Colorado-specific counties, communities, and municipalities
- report templates
- content overlays

Target:
- shared contracts move to `src/core`
- Colorado-specific catalogs move to `src/states/co`

## Migration Rule

No file should be rewritten wholesale unless necessary.

Preferred pattern:

1. create shared replacement contract
2. create Colorado implementation behind that contract
3. add compatibility wrapper
4. migrate one UI consumer
5. remove old path only after parity is verified
