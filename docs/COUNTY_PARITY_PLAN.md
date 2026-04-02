# County Parity Plan

This document defines the rollout path for bringing additional Colorado counties up to the same functional level as Denver and Douglas in Colorado Atlas.

## Goal

Each county should support the same core product behaviors:

1. Parcel geometry and click selection
2. Search by APN, owner, and situs address
3. Official assessor detail enrichment
4. Land value and improvement value
5. Building characteristics
6. Native zoning / land use lookup
7. Current tax and levy support
8. HBU support using native zoning and current improvements
9. Tax report export parity

## County Adapter Pattern

Every county integration should be implemented through the same adapter checklist:

1. Parcel source
   Official parcel geometry layer
   Required fields: APN/account, owner, situs, city, county, acreage/sqft, assessed/market totals

2. Assessor detail source
   Official detail endpoint or public property-search backing service
   Required fields: owner, legal, subdivision, account type, property type, class/use, year built

3. Valuation source
   Required fields:
   - land value
   - improvement value
   - total actual / appraised value
   - total assessed value

4. Building source
   Required fields:
   - building square feet
   - units
   - stories
   - style
   - year built / remodel

5. Zoning source
   Native zoning district lookup by parcel or point
   Include district code, description, height / FAR / density data when possible

6. Tax source
   Latest live tax report or tax estimator
   Required fields:
   - tax year
   - assessed value
   - full mill levy
   - estimated tax

7. Search source
   If county supports owner/APN/address search directly, use it
   Otherwise use statewide parcel search plus county-specific detail enrichment

8. HBU support
   Map county native zoning into HBU structure
   Prefer native dimensional standards over generic fallback buckets

## Rollout Order

Recommended next sequence:

1. Arapahoe
2. Jefferson
3. Adams
4. Boulder
5. Broomfield

Reasoning:
- Arapahoe is the next highest-value metro county after Denver and Douglas.
- Jefferson and Adams materially improve metro coverage and comparable logic.
- Boulder is highly important but often has more nuanced zoning and land use treatment.
- Broomfield is smaller and should move quickly once the adapter pattern is stable.

## Current Status

### Denver

Status: Strong baseline

Implemented:
- official zoning lookup
- assessor building detail
- assessor parcel valuation for land/improvement values
- tax estimate workflow
- HBU logic using zoning + current improvements

### Douglas

Status: Good baseline, still needs parity polish

Implemented:
- parcel detail enrichment
- building detail
- actual/assessed/tax report support
- zoning/tax integration

Still needed:
- comp/tax-report parity with Denver
- stronger native zoning dimensional parsing for HBU

### Arapahoe

Status: Parcel/tax adapter in progress

Official starting points identified:
- Assessor property search landing page:
  https://files.arapahoeco.gov/your_county/county_departments/assessor/property_search/index.php
- Residential / commercial / ag / vacant search:
  https://files.arapahoeco.gov/your_county/county_departments/assessor/property_search/search_residential_commercial_ag_and_vacant.php
- Assessor assessment resources:
  https://files.arapahoeco.gov/your_county/county_departments/assessor/assessment_resources/index.php

Important observed facts:
- The live assessor site explicitly supports real estate search for residential, commercial, ag, and vacant land.
- The assessor FAQ confirms 2025 valuation guidance and current reassessment cycle language.
- The property search page embeds the live parcel tool in an iframe.
- Direct parcel detail resolves via `https://parcelsearch.arapahoegov.com/PPINum.aspx?PPINum=<AIN>`.
- The treasurer tax page resolves via `https://taxsearch.arapahoegov.com/ReReport.aspx?PIN=<PIN>`.
- Tax district levy detail resolves via `Levy.aspx?id=<id>&auth=<auth>`.

Implementation tasks:
- complete UI wiring for county-specific parcel detail display
- complete tax source messaging and report parity
- identify zoning / GIS parcel source for geometry and district lookup
- extend comps / tax-report parity

Current implemented scope:
- `queryArapahoeParcelData(...)` adapter
- owner, situs, neighborhood, land use, and legal description
- land / improvement / total appraised values
- assessed value splits
- building size and residential characteristics
- current tax page parsing, payable year, taxable value, and amount due
- jurisdiction-aware zoning authority lookup via official ArapaMAP layers
- official unincorporated county zoning lookup via `ArapaMAP` layer `352`

Current known official GIS layers:
- `https://gis.arapahoegov.com/arcgis/rest/services/ArapaMAP/MapServer`
- `Jurisdictions` layer `375`
- `Zoning - Unincorporated County` layer `352`

Still pending before Denver-like parity:
- municipal zoning connectors for incorporated Arapahoe jurisdictions
- Arapahoe tax comparable/report parity

### Jefferson

Status: Research-ready

Official starting point:
- Property search:
  https://propertysearch.jeffco.us/

Implementation tasks:
- inspect search transport for owner/APN/address lookup
- inspect detail response for land/improvement split
- locate latest tax estimate source
- locate parcel geometry + zoning source

### Adams

Status: Research-ready

Official starting point:
- Assessor / property portal entry:
  https://adcogov.org/property

Implementation tasks:
- inspect parcel search transport and detail payloads
- confirm ArcGIS/open data parcel layer
- confirm land/improvement and tax endpoints
- confirm zoning source

### Boulder

Status: Research-ready

Official starting point:
- Property search:
  https://maps.boco.solutions/propertysearch

Implementation tasks:
- inspect parcel/detail service backing the BOCO property search
- confirm land/improvement and building fields
- locate current tax source
- locate zoning / land use lookup source

### Broomfield

Status: Research-ready

Official starting point:
- Assessor landing page:
  https://broomfield.org/assessor

Implementation tasks:
- determine whether public property detail is exposed directly or through a linked assessor application
- identify parcel geometry, land/improvement values, and tax source
- identify native zoning source

## Engineering Approach

To move quickly, each county should use a shared implementation template:

1. Add county detail types in `src/data/parcelTypes.ts`
2. Add county query functions in `src/utils/parcelService.ts`
3. Add any server-side proxy/detail routes in `server.ts`
4. Hydrate county detail in `src/components/ParcelMap.tsx`
5. Render county-specific parcel/zoning/tax detail in `src/components/ParcelPanel.tsx`
6. Extend HBU parsing only after native zoning data is reliable

## Definition of Done Per County

A county is considered "at parity" when:

- parcel selection loads without fallback-only blanks
- owner/APN/address search works
- land value and improvement value display
- building size / units / stories display when available
- current zoning district displays from official county/municipal source
- current tax estimate uses live county source, not statewide approximation
- HBU uses native zoning and current improvements
- tax report export works for that county
