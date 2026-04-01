# Architecture Notes

## Current Shape

- Frontend: React + Vite single-page application in `src/`
- Backend: lightweight Express server in `server.ts`
- Data layer: checked-in TypeScript modules and JSON reference data in `src/data/`
- Scripts: geocoding and address-enrichment utilities in `scripts/`

## Primary Product Areas

- Parcel map exploration
- Zoning analysis
- Tax calculation
- County and community reference views
- Comprehensive plan health and source/schema visibility

## Current Service Boundary

- `GET /api/geocode`
  - Proxies Census geocoding to avoid browser CORS issues
- `GET /api/health`
  - Basic health endpoint for local verification

## Near-Term Improvements

- Add a formal environment setup doc with required Node version
- Add automated tests for critical utilities and server routes
- Separate curated reference data from generated data pipelines if the dataset grows
- Add CI for install, lint, and build validation
