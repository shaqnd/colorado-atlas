# Colorado Atlas

Colorado Atlas is a React and TypeScript application for exploring Colorado parcel, zoning, tax, community, and planning data, with a lightweight Express proxy for geocoding workflows.

## Stack

- Vite + React 19 + TypeScript
- Express for local API endpoints
- MapLibre and `react-map-gl` for mapping
- Local data modules and JSON reference files under `src/data`
- Utility scripts under `scripts/` for geocoding and data preparation

## Repository Layout

```text
.
├── src/            # App UI, data modules, and utilities
├── public/         # Static assets
├── scripts/        # Data and geocoding scripts
├── docs/           # Architecture and migration notes
├── server.ts       # Local geocoding proxy API
└── .github/        # PR workflow metadata
```

## Getting Started

Install dependencies:

```bash
npm install
```

Run the frontend:

```bash
npm run dev
```

Run the local API server:

```bash
npm run server
```

Build the app:

```bash
npm run build
```

## Working Agreement

- Keep source code, prompts, scripts, and documentation in git.
- Keep secrets, `.env` files, caches, and generated outputs out of git.
- Use focused commits so Codex and GitHub can track intent cleanly.

## Migration Status

This repository is now the source of truth for the project that was previously developed outside git in Claude Code.
