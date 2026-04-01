/**
 * Colorado Communities — Granular Place Data
 *
 * Covers all incorporated municipalities, Census Designated Places (CDPs),
 * significant unincorporated communities, military installations, and
 * (for consolidated Denver) official city neighborhoods.
 *
 * Organized largest-to-smallest county by population.
 * Batch 1 of 13: counties 1–5 (El Paso, Denver, Arapahoe, Jefferson, Adams)
 *
 * Sources:
 *  - 2020 U.S. Decennial Census (incorporated & CDP populations)
 *  - Colorado Municipal League member list (incorporated status)
 *  - U.S. Census Bureau TIGER/Line CDPs, Colorado 2020
 *  - Colorado Secretary of State — municipal election records
 *  - City of Denver Office of Community Planning — official neighborhood list
 *  - DOLA Colorado Demography Office
 *  - County assessor parcel data & GIS layers
 *
 * Population notes:
 *  - Incorporated municipalities: exact 2020 Census figures
 *  - CDPs: 2020 Census figures (marked cdpVerified: true)
 *  - Unincorporated / Neighborhoods: ACS 2019-2023 estimates or DOLA estimates
 *    (marked cdpVerified: false)
 *  - Multi-county places: total population listed under primary county
 */

// ── Types ────────────────────────────────────────────────────────────────────

export type CommunityType =
  | 'Home Rule City'
  | 'Home Rule Town'
  | 'Statutory City'
  | 'Statutory Town'
  | 'Consolidated City & County'
  | 'CDP'                      // Census Designated Place (unincorporated)
  | 'Unincorporated Community' // Named place, not Census-recognized as CDP
  | 'Neighborhood'             // Official sub-area of a consolidated city
  | 'Military Installation';   // On-base community / military CDP

export interface Community {
  name: string;
  county: string;              // primary county
  counties?: string[];         // all counties (multi-county places)
  type: CommunityType;
  incorporated: boolean;
  population2020: number | null; // null = no reliable figure
  cdpVerified: boolean;          // true = exact 2020 Census figure; false = estimate
  notes?: string;
}

// ── Batch 1: Counties 1–5 by population ─────────────────────────────────────

export const COMMUNITIES_BATCH1: Community[] = [

  // ══════════════════════════════════════════════════════════════════════════
  // 1. EL PASO COUNTY  (pop 752,772) — seat: Colorado Springs
  //    9 incorporated municipalities · 10 CDPs · 8 unincorporated communities
  // ══════════════════════════════════════════════════════════════════════════

  // ── Incorporated ──────────────────────────────────────────────────────────
  { name: 'Colorado Springs', county: 'El Paso', type: 'Home Rule City',   incorporated: true, population2020: 478961, cdpVerified: true,  notes: 'Largest city in CO by land area; includes Briargate, Stetson Hills, Powers annexation areas.' },
  { name: 'Fountain',         county: 'El Paso', type: 'Home Rule City',   incorporated: true, population2020: 31140,  cdpVerified: true },
  { name: 'Monument',         county: 'El Paso', type: 'Statutory Town',   incorporated: true, population2020: 10027,  cdpVerified: true,  notes: 'Northern El Paso County; fast-growing I-25 corridor town.' },
  { name: 'Manitou Springs',  county: 'El Paso', type: 'Home Rule City',   incorporated: true, population2020: 5177,   cdpVerified: true,  notes: 'Historic resort city at base of Pikes Peak.' },
  { name: 'Palmer Lake',      county: 'El Paso', type: 'Statutory Town',   incorporated: true, population2020: 2787,   cdpVerified: true },
  { name: 'Calhan',           county: 'El Paso', type: 'Statutory Town',   incorporated: true, population2020: 1004,   cdpVerified: true,  notes: 'Eastern plains agricultural community.' },
  { name: 'Green Mountain Falls', county: 'El Paso', counties: ['El Paso', 'Teller'], type: 'Statutory Town', incorporated: true, population2020: 746, cdpVerified: true, notes: 'Straddles El Paso/Teller county line.' },
  { name: 'Ramah',            county: 'El Paso', type: 'Statutory Town',   incorporated: true, population2020: 152,    cdpVerified: true },
  { name: 'Yoder',            county: 'El Paso', type: 'Statutory Town',   incorporated: true, population2020: 62,     cdpVerified: true,  notes: 'Smallest incorporated place in El Paso County.' },

  // ── CDPs ──────────────────────────────────────────────────────────────────
  { name: 'Security-Widefield', county: 'El Paso', type: 'CDP',             incorporated: false, population2020: 38436,  cdpVerified: true,  notes: 'Largest unincorporated community in El Paso County; south of Colorado Springs.' },
  { name: 'Cimarron Hills',   county: 'El Paso', type: 'CDP',               incorporated: false, population2020: 20714,  cdpVerified: true,  notes: 'Unincorporated community east of Colorado Springs.' },
  { name: 'Black Forest',     county: 'El Paso', type: 'CDP',               incorporated: false, population2020: 14432,  cdpVerified: true,  notes: 'Forested residential area NE of Colorado Springs; severely impacted by 2013 wildfire.' },
  { name: 'Fort Carson',      county: 'El Paso', type: 'Military Installation', incorporated: false, population2020: 14285, cdpVerified: true, notes: 'U.S. Army installation; Mountain Post. Includes on-post housing CDP.' },
  { name: 'Woodmoor',         county: 'El Paso', type: 'CDP',               incorporated: false, population2020: 10673,  cdpVerified: true,  notes: 'Master-planned community between Monument and Colorado Springs.' },
  { name: 'Gleneagle',        county: 'El Paso', type: 'CDP',               incorporated: false, population2020: 9578,   cdpVerified: true,  notes: 'Planned residential community north of Colorado Springs.' },
  { name: 'Stratmoor',        county: 'El Paso', type: 'CDP',               incorporated: false, population2020: 8126,   cdpVerified: true,  notes: 'Unincorporated area south of Colorado Springs near Fort Carson.' },
  { name: 'Air Force Academy', county: 'El Paso', type: 'Military Installation', incorporated: false, population2020: 6893, cdpVerified: true, notes: 'U.S. Air Force Academy installation community.' },
  { name: 'Rock Creek Park',  county: 'El Paso', type: 'CDP',               incorporated: false, population2020: 7524,   cdpVerified: false, notes: 'Unincorporated residential area east of Colorado Springs.' },
  { name: 'Old Farm',         county: 'El Paso', type: 'CDP',               incorporated: false, population2020: 4543,   cdpVerified: false, notes: 'Unincorporated residential area northeast of Colorado Springs.' },

  // ── Unincorporated Communities ────────────────────────────────────────────
  { name: 'Falcon',           county: 'El Paso', type: 'Unincorporated Community', incorporated: false, population2020: 13991, cdpVerified: false, notes: 'Fastest-growing unincorporated area in El Paso County; eastern plains/I-94 corridor.' },
  { name: 'Peyton',           county: 'El Paso', type: 'Unincorporated Community', incorporated: false, population2020: 1996,  cdpVerified: false, notes: 'Small agricultural community east of Falcon.' },
  { name: 'Lorson Ranch',     county: 'El Paso', type: 'Unincorporated Community', incorporated: false, population2020: 4200,  cdpVerified: false, notes: 'Master-planned residential community south of Fountain; large active growth area.' },
  { name: 'Knob Hill',        county: 'El Paso', type: 'Unincorporated Community', incorporated: false, population2020: 1200,  cdpVerified: false },
  { name: 'Ellicott',         county: 'El Paso', type: 'Unincorporated Community', incorporated: false, population2020: 800,   cdpVerified: false, notes: 'Eastern plains rural community along US-24.' },
  { name: 'Hanover',          county: 'El Paso', type: 'Unincorporated Community', incorporated: false, population2020: 400,   cdpVerified: false, notes: 'Small rural community in southern El Paso County.' },
  { name: 'Rush',             county: 'El Paso', type: 'Unincorporated Community', incorporated: false, population2020: 200,   cdpVerified: false, notes: 'Remote eastern plains community.' },
  { name: 'Matheson',         county: 'El Paso', type: 'Unincorporated Community', incorporated: false, population2020: 100,   cdpVerified: false },

  // ══════════════════════════════════════════════════════════════════════════
  // 2. DENVER COUNTY  (pop 729,017) — Consolidated City & County
  //    1 city-county entity · 78 official neighborhoods (major ones listed)
  // ══════════════════════════════════════════════════════════════════════════

  // ── The consolidated city-county ─────────────────────────────────────────
  { name: 'Denver', county: 'Denver', type: 'Consolidated City & County', incorporated: true, population2020: 729017, cdpVerified: true, notes: 'Consolidated city-county; no other incorporated places. Governed by one city-county government.' },

  // ── Official Denver Neighborhoods (78 recognized by city) ─────────────────
  // Central Denver
  { name: 'LoDo',              county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 4800,  cdpVerified: false, notes: 'Lower Downtown; historic warehouse district, Union Station.' },
  { name: 'Downtown Denver',   county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 11200, cdpVerified: false, notes: 'CBD; 16th Street Mall, Civic Center.' },
  { name: 'Capitol Hill',      county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 10800, cdpVerified: false, notes: 'Dense, walkable; State Capitol, Cheesman Park adjacent.' },
  { name: 'North Capitol Hill', county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 6400,  cdpVerified: false },
  { name: 'Lincoln Park',      county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 5700,  cdpVerified: false, notes: 'La Alma/Lincoln Park; historic Chicano cultural district.' },
  { name: 'Five Points',       county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 7200,  cdpVerified: false, notes: 'Historic African American cultural hub; RiNo adjacent.' },
  { name: 'Curtis Park',       county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 5100,  cdpVerified: false, notes: 'One of Denver\'s oldest neighborhoods.' },
  { name: 'Cole',              county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 5800,  cdpVerified: false },
  { name: 'Whittier',          county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 4600,  cdpVerified: false },
  { name: 'Globeville',        county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 3900,  cdpVerified: false, notes: 'Industrial neighborhood; significant I-70 redevelopment impact.' },
  { name: 'Elyria-Swansea',    county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 8900,  cdpVerified: false, notes: 'Working-class neighborhood; I-70 cover project ongoing.' },

  // Northwest Denver
  { name: 'Highland',          county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 9200,  cdpVerified: false, notes: 'LoHi area; upscale restaurants, walkable to downtown.' },
  { name: 'Potter-Highlands',  county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 6800,  cdpVerified: false },
  { name: 'Jefferson Park',    county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 4200,  cdpVerified: false, notes: 'Adjacent to Empower Field; rapid development.' },
  { name: 'Sunnyside',         county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 8700,  cdpVerified: false },
  { name: 'Regis',             county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 7300,  cdpVerified: false },
  { name: 'Berkeley',          county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 9100,  cdpVerified: false },
  { name: 'Sloan Lake',        county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 7800,  cdpVerified: false },
  { name: 'West Highlands',    county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 5900,  cdpVerified: false },

  // West Denver
  { name: 'West Colfax',       county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 9400,  cdpVerified: false },
  { name: 'Westwood',          county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 15200, cdpVerified: false, notes: 'Largest Denver neighborhood by population; majority Latino.' },
  { name: 'Harvey Park',       county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 10800, cdpVerified: false },
  { name: 'Harvey Park South', county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 6200,  cdpVerified: false },
  { name: 'Bear Valley',       county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 8700,  cdpVerified: false },
  { name: 'Barnum',            county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 6100,  cdpVerified: false },
  { name: 'Barnum West',       county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 4300,  cdpVerified: false },
  { name: 'Sun Valley',        county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 2200,  cdpVerified: false, notes: 'Major redevelopment underway; Sun Valley Eco District.' },
  { name: 'Valverde',          county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 5300,  cdpVerified: false },

  // South Denver
  { name: 'Baker',             county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 8400,  cdpVerified: false, notes: 'Historic; S. Broadway antique district.' },
  { name: 'Platt Park',        county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 9800,  cdpVerified: false },
  { name: 'Rosedale',          county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 4700,  cdpVerified: false },
  { name: 'University',        county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 14800, cdpVerified: false, notes: 'University of Denver neighborhood.' },
  { name: 'University Park',   county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 12300, cdpVerified: false },
  { name: 'University Hills',  county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 9200,  cdpVerified: false },
  { name: 'Virginia Village',  county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 10200, cdpVerified: false },
  { name: 'Hampden',           county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 11400, cdpVerified: false },
  { name: 'Hampden South',     county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 8900,  cdpVerified: false },
  { name: 'College View',      county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 7200,  cdpVerified: false },
  { name: 'South College View', county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 4100, cdpVerified: false },
  { name: 'Ruby Hill',         county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 9300,  cdpVerified: false },
  { name: 'Overland',          county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 5800,  cdpVerified: false },

  // Southeast Denver
  { name: 'Cherry Creek',      county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 8100,  cdpVerified: false, notes: 'Upscale shopping district; Creek corridor.' },
  { name: 'Country Club',      county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 3400,  cdpVerified: false },
  { name: 'Hilltop',           county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 7800,  cdpVerified: false },
  { name: 'Montclair',         county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 8200,  cdpVerified: false },
  { name: 'Hale',              county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 7600,  cdpVerified: false },
  { name: 'Mayfair',           county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 5900,  cdpVerified: false },
  { name: 'Congress Park',     county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 9700,  cdpVerified: false },
  { name: 'Cheesman Park',     county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 5200,  cdpVerified: false },
  { name: 'Washington Park',   county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 11800, cdpVerified: false },
  { name: 'Washington Park West', county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 7100, cdpVerified: false },
  { name: 'Wellshire',         county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 3900,  cdpVerified: false },
  { name: 'Goldsmith',         county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 9400,  cdpVerified: false },
  { name: 'Southmoor Park',    county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 4800,  cdpVerified: false },
  { name: 'Windsor',           county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 7200,  cdpVerified: false },

  // East Denver
  { name: 'East Colfax',       county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 12600, cdpVerified: false },
  { name: 'North Park Hill',   county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 10300, cdpVerified: false },
  { name: 'South Park Hill',   county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 10900, cdpVerified: false },
  { name: 'Northeast Park Hill', county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 8700, cdpVerified: false },
  { name: 'Stapleton',         county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 22000, cdpVerified: false, notes: 'Now officially "Central Park"; built on former Stapleton Airport. Fastest-growing Denver neighborhood.' },

  // Central-East Denver (City Park corridor)
  { name: 'City Park',         county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 7200,  cdpVerified: false, notes: 'Surrounds Denver\'s largest urban park; Denver Zoo and Museum of Nature & Science.' },
  { name: 'City Park West',    county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 9100,  cdpVerified: false, notes: 'Dense residential west of City Park; Colfax Ave corridor.' },
  { name: 'Skyland',           county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 5300,  cdpVerified: false },

  // West/Southwest Denver (additional)
  { name: 'Auraria',           county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 1100,  cdpVerified: false, notes: 'Higher education campus district; CU Denver, MSU, Community College of Denver.' },
  { name: 'Mar Lee',           county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 8600,  cdpVerified: false },
  { name: 'Kennedy',           county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 7400,  cdpVerified: false },

  // Southeast Denver (additional)
  { name: 'Lowry Field',       county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 8900,  cdpVerified: false, notes: 'Redeveloped former Lowry Air Force Base; planned mixed-use community.' },

  // Far Northeast Denver
  { name: 'Montbello',         county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 26400, cdpVerified: false, notes: 'Largest neighborhood by area in northeast Denver.' },
  { name: 'Green Valley Ranch', county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 20800, cdpVerified: false, notes: 'Master-planned community in far northeast Denver.' },
  { name: 'Gateway-Green Valley Ranch', county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 7600, cdpVerified: false },
  { name: 'Marston',           county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 5400,  cdpVerified: false },
  { name: 'Athmar Park',       county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 7800,  cdpVerified: false },
  { name: 'Indian Creek',      county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 4200,  cdpVerified: false },
  { name: 'Chaffee Park',      county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 5800,  cdpVerified: false },
  { name: 'Swansea',           county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 4100,  cdpVerified: false, notes: 'Often combined with Elyria as Elyria-Swansea.' },
  { name: 'Clayton',           county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 5600,  cdpVerified: false },
  { name: 'RiNo',              county: 'Denver', type: 'Neighborhood', incorporated: false, population2020: 3200,  cdpVerified: false, notes: 'River North Arts District; rapidly gentrifying creative district.' },

  // ══════════════════════════════════════════════════════════════════════════
  // 3. ARAPAHOE COUNTY  (pop 666,924) — seat: Littleton
  //    13 incorporated municipalities · 7 CDPs · 6 unincorporated communities
  // ══════════════════════════════════════════════════════════════════════════

  // ── Incorporated ──────────────────────────────────────────────────────────
  { name: 'Aurora',            county: 'Arapahoe', counties: ['Arapahoe', 'Adams', 'Douglas'], type: 'Home Rule City', incorporated: true, population2020: 386261, cdpVerified: true, notes: 'Colorado\'s 3rd largest city; primary county is Arapahoe.' },
  { name: 'Centennial',        county: 'Arapahoe', type: 'Home Rule City',   incorporated: true, population2020: 108418, cdpVerified: true,  notes: 'Incorporated 2001; one of largest newly incorporated cities in U.S. history.' },
  { name: 'Littleton',         county: 'Arapahoe', counties: ['Arapahoe', 'Jefferson', 'Douglas'], type: 'Home Rule City', incorporated: true, population2020: 46028, cdpVerified: true, notes: 'County seat of Arapahoe; spans three counties.' },
  { name: 'Englewood',         county: 'Arapahoe', type: 'Home Rule City',   incorporated: true, population2020: 33659,  cdpVerified: true,  notes: 'Inner suburb of Denver; CityCenter Englewood transit hub.' },
  { name: 'Greenwood Village', county: 'Arapahoe', type: 'Home Rule City',   incorporated: true, population2020: 15691,  cdpVerified: true,  notes: 'Major office/corporate campus corridor along I-25.' },
  { name: 'Lone Tree',         county: 'Arapahoe', type: 'Home Rule City',   incorporated: true, population2020: 14127,  cdpVerified: true,  notes: 'South suburban; Park Meadows mall; RTD light rail terminus.' },
  { name: 'Cherry Hills Village', county: 'Arapahoe', type: 'Home Rule City', incorporated: true, population2020: 6442, cdpVerified: true,  notes: 'Affluent equestrian community; highest median home value in region.' },
  { name: 'Sheridan',          county: 'Arapahoe', type: 'Home Rule City',   incorporated: true, population2020: 5966,   cdpVerified: true,  notes: 'Small enclave city between Englewood and Denver.' },
  { name: 'Glendale',          county: 'Arapahoe', type: 'Home Rule City',   incorporated: true, population2020: 4693,   cdpVerified: true,  notes: 'Small entertainment-focused enclave surrounded by Denver/Aurora.' },
  { name: 'Columbine Valley',  county: 'Arapahoe', type: 'Statutory Town',   incorporated: true, population2020: 1502,   cdpVerified: true,  notes: 'Affluent residential community along the Platte River.' },
  { name: 'Foxfield',          county: 'Arapahoe', type: 'Statutory Town',   incorporated: true, population2020: 754,    cdpVerified: true,  notes: 'Small equestrian community; minimum 5-acre lot zoning.' },
  { name: 'Deer Trail',        county: 'Arapahoe', type: 'Statutory Town',   incorporated: true, population2020: 1068,   cdpVerified: true,  notes: 'Eastern plains town; claims to host world\'s first rodeo (1869).' },
  { name: 'Bow Mar',           county: 'Arapahoe', counties: ['Arapahoe', 'Jefferson'], type: 'Statutory Town', incorporated: true, population2020: 810, cdpVerified: true, notes: 'Small lakeside community on Arapahoe/Jefferson border.' },

  // ── CDPs ──────────────────────────────────────────────────────────────────
  { name: 'Southglenn',        county: 'Arapahoe', type: 'CDP',              incorporated: false, population2020: 31895,  cdpVerified: true,  notes: 'Large unincorporated community between Centennial and Littleton; The Streets at SouthGlenn.' },
  { name: 'Castlewood',        county: 'Arapahoe', type: 'CDP',              incorporated: false, population2020: 4631,   cdpVerified: true,  notes: 'Unincorporated community in southeastern Arapahoe County.' },
  { name: 'Inverness',         county: 'Arapahoe', type: 'CDP',              incorporated: false, population2020: 8200,   cdpVerified: false, notes: 'Major office park and business corridor along I-25 in Englewood/Centennial area.' },
  { name: 'Meridian',          county: 'Arapahoe', type: 'CDP',              incorporated: false, population2020: 6300,   cdpVerified: false, notes: 'Business park and residential area near Lone Tree/Parker Road.' },
  { name: 'Heritage Hills',    county: 'Arapahoe', type: 'Unincorporated Community', incorporated: false, population2020: 3800, cdpVerified: false, notes: 'Master-planned golf community in Lone Tree area.' },
  { name: 'Piney Creek',       county: 'Arapahoe', type: 'Unincorporated Community', incorporated: false, population2020: 9400, cdpVerified: false, notes: 'Large unincorporated residential area east of Aurora, along Parker Road.' },
  { name: 'Tallyn\'s Reach',   county: 'Arapahoe', type: 'Unincorporated Community', incorporated: false, population2020: 7200, cdpVerified: false, notes: 'Master-planned community in SE Arapahoe County.' },
  { name: 'Saddle Rock',       county: 'Arapahoe', type: 'Unincorporated Community', incorporated: false, population2020: 5100, cdpVerified: false, notes: 'Residential area in unincorporated Arapahoe between Aurora and Centennial.' },
  { name: 'Dove Valley',       county: 'Arapahoe', type: 'Unincorporated Community', incorporated: false, population2020: 4200, cdpVerified: false, notes: 'Business park and residential development in SE Arapahoe County.' },
  { name: 'Stonegate',         county: 'Arapahoe', counties: ['Arapahoe', 'Douglas'], type: 'Unincorporated Community', incorporated: false, population2020: 7800, cdpVerified: false, notes: 'Large master-planned community straddling Arapahoe/Douglas border.' },

  // ══════════════════════════════════════════════════════════════════════════
  // 4. JEFFERSON COUNTY  (pop 579,377) — seat: Golden
  //    11 incorporated municipalities · 10 CDPs · 8 unincorporated communities
  // ══════════════════════════════════════════════════════════════════════════

  // ── Incorporated ──────────────────────────────────────────────────────────
  { name: 'Lakewood',          county: 'Jefferson', type: 'Home Rule City',  incorporated: true, population2020: 155984,  cdpVerified: true,  notes: 'Largest city in Jefferson County; home to Belmar redevelopment district.' },
  { name: 'Arvada',            county: 'Jefferson', counties: ['Jefferson', 'Adams'], type: 'Home Rule City', incorporated: true, population2020: 118428, cdpVerified: true, notes: 'Primary county is Jefferson; Gold Strike Park historic district.' },
  { name: 'Westminster',       county: 'Jefferson', counties: ['Adams', 'Jefferson'], type: 'Home Rule City', incorporated: true, population2020: 116317, cdpVerified: true, notes: 'Primary county is Adams; partly in Jefferson; major retail/office corridor.' },
  { name: 'Wheat Ridge',       county: 'Jefferson', type: 'Home Rule City',  incorporated: true, population2020: 32797,   cdpVerified: true,  notes: 'Inner suburb; Gold Line light rail. Known for carnation farms historically.' },
  { name: 'Golden',            county: 'Jefferson', type: 'Home Rule City',  incorporated: true, population2020: 20201,   cdpVerified: true,  notes: 'County seat; Coors Brewery; Colorado School of Mines.' },
  { name: 'Edgewater',         county: 'Jefferson', type: 'Statutory City',  incorporated: true, population2020: 5263,    cdpVerified: true,  notes: 'Small city surrounded by Lakewood; Sloan\'s Lake neighborhood.' },
  { name: 'Mountain View',     county: 'Jefferson', type: 'Statutory Town',  incorporated: true, population2020: 512,     cdpVerified: true,  notes: 'Tiny statutory town enclave within Lakewood.' },
  { name: 'Morrison',          county: 'Jefferson', type: 'Statutory Town',  incorporated: true, population2020: 415,     cdpVerified: true,  notes: 'Red Rocks Amphitheatre gateway town; mountain gateway community.' },
  { name: 'Lakeside',          county: 'Jefferson', type: 'Statutory Town',  incorporated: true, population2020: 12,      cdpVerified: true,  notes: 'One of smallest incorporated places in Colorado; amusement park/residential.' },
  { name: 'Bow Mar',           county: 'Jefferson', counties: ['Jefferson', 'Arapahoe'], type: 'Statutory Town', incorporated: true, population2020: 810, cdpVerified: true, notes: 'Lakeside community on Jefferson/Arapahoe border.' },

  // ── CDPs ──────────────────────────────────────────────────────────────────
  { name: 'Ken Caryl',         county: 'Jefferson', type: 'CDP',             incorporated: false, population2020: 32979,  cdpVerified: true,  notes: 'Large master-planned community in SW Jefferson County; Ken Caryl Ranch.' },
  { name: 'Columbine',         county: 'Jefferson', type: 'CDP',             incorporated: false, population2020: 24428,  cdpVerified: true,  notes: 'Large unincorporated residential community; Columbine High School area.' },
  { name: 'Applewood',         county: 'Jefferson', type: 'CDP',             incorporated: false, population2020: 9189,   cdpVerified: true,  notes: 'Unincorporated residential area between Lakewood and Golden.' },
  { name: 'Evergreen',         county: 'Jefferson', type: 'CDP',             incorporated: false, population2020: 8716,   cdpVerified: true,  notes: 'Mountain community at 7,000 ft; Evergreen Lake.' },
  { name: 'Conifer',           county: 'Jefferson', type: 'CDP',             incorporated: false, population2020: 7014,   cdpVerified: true,  notes: 'Unincorporated foothills community along US-285.' },
  { name: 'Aspen Park',        county: 'Jefferson', type: 'CDP',             incorporated: false, population2020: 6919,   cdpVerified: true,  notes: 'Unincorporated community along US-285 corridor, south of Conifer.' },
  { name: 'Bergen Park',       county: 'Jefferson', type: 'CDP',             incorporated: false, population2020: 3576,   cdpVerified: true,  notes: 'Unincorporated community near Evergreen, along I-70.' },
  { name: 'Genesee',           county: 'Jefferson', type: 'CDP',             incorporated: false, population2020: 2795,   cdpVerified: true,  notes: 'Master-planned mountain community; I-70 corridor, buffalo herd.' },
  { name: 'Kittredge',         county: 'Jefferson', type: 'CDP',             incorporated: false, population2020: 1899,   cdpVerified: true,  notes: 'Historic mountain community along Bear Creek.' },
  { name: 'Indian Hills',      county: 'Jefferson', type: 'CDP',             incorporated: false, population2020: 1643,   cdpVerified: true,  notes: 'Small mountain community along Bear Creek, south of Evergreen.' },

  // ── Unincorporated Communities ────────────────────────────────────────────
  { name: 'Idledale',          county: 'Jefferson', type: 'Unincorporated Community', incorporated: false, population2020: 490, cdpVerified: false, notes: 'Small community in Bear Creek Canyon.' },
  { name: 'Lookout Mountain',  county: 'Jefferson', type: 'Unincorporated Community', incorporated: false, population2020: 1900, cdpVerified: false, notes: 'Residential area on Lookout Mountain; Buffalo Bill\'s grave.' },
  { name: 'Pine',              county: 'Jefferson', type: 'Unincorporated Community', incorporated: false, population2020: 2800, cdpVerified: false, notes: 'Small community along US-285 near Pine Junction.' },
  { name: 'Pine Junction',     county: 'Jefferson', type: 'Unincorporated Community', incorporated: false, population2020: 1100, cdpVerified: false, notes: 'Commercial crossroads on US-285.' },
  { name: 'Marshdale',         county: 'Jefferson', type: 'Unincorporated Community', incorporated: false, population2020: 600, cdpVerified: false },
  { name: 'El Rancho',         county: 'Jefferson', type: 'Unincorporated Community', incorporated: false, population2020: 350, cdpVerified: false, notes: 'Small community at I-70/US-40 junction.' },
  { name: 'Elk Creek',         county: 'Jefferson', type: 'Unincorporated Community', incorporated: false, population2020: 280, cdpVerified: false, notes: 'Remote community SW of Pine.' },
  { name: 'Foxton',            county: 'Jefferson', type: 'Unincorporated Community', incorporated: false, population2020: 150, cdpVerified: false, notes: 'Small community along North Fork South Platte River.' },

  // ══════════════════════════════════════════════════════════════════════════
  // 5. ADAMS COUNTY  (pop 530,225) — seat: Brighton
  //    10 incorporated municipalities · 7 CDPs · 5 unincorporated communities
  // ══════════════════════════════════════════════════════════════════════════

  // ── Incorporated ──────────────────────────────────────────────────────────
  { name: 'Thornton',          county: 'Adams', counties: ['Adams', 'Weld'], type: 'Home Rule City', incorporated: true, population2020: 144835, cdpVerified: true, notes: 'Adams County\'s largest city; primary county is Adams.' },
  { name: 'Westminster',       county: 'Adams', counties: ['Adams', 'Jefferson'], type: 'Home Rule City', incorporated: true, population2020: 116317, cdpVerified: true, notes: 'Primary county Adams; listed also under Jefferson.' },
  { name: 'Commerce City',     county: 'Adams', type: 'Home Rule City',     incorporated: true, population2020: 62418,  cdpVerified: true,  notes: 'Industrial/residential; Dick\'s Sporting Goods Park; heavy oil refinery presence.' },
  { name: 'Northglenn',        county: 'Adams', type: 'Home Rule City',     incorporated: true, population2020: 39019,  cdpVerified: true },
  { name: 'Brighton',          county: 'Adams', counties: ['Adams', 'Weld'], type: 'Home Rule City', incorporated: true, population2020: 40083, cdpVerified: true, notes: 'County seat; fast-growing agricultural/bedroom community.' },
  { name: 'Federal Heights',   county: 'Adams', type: 'Home Rule City',     incorporated: true, population2020: 14382,  cdpVerified: true,  notes: 'Small city between Thornton and Westminster.' },
  { name: 'Strasburg',         county: 'Adams', type: 'Statutory Town',     incorporated: true, population2020: 8574,   cdpVerified: true,  notes: 'Eastern plains I-70 corridor community; significant growth.' },
  { name: 'Bennett',           county: 'Adams', counties: ['Adams', 'Arapahoe'], type: 'Statutory Town', incorporated: true, population2020: 2862, cdpVerified: true, notes: 'Small I-70 corridor community east of Denver metro.' },
  { name: 'Lochbuie',          county: 'Adams', counties: ['Adams', 'Weld'], type: 'Statutory Town', incorporated: true, population2020: 7585, cdpVerified: true, notes: 'Rapidly growing community straddling Adams/Weld border.' },
  { name: 'Hudson',            county: 'Adams', type: 'Statutory Town',     incorporated: true, population2020: 3420,   cdpVerified: true,  notes: 'Agricultural community in northern Adams County.' },

  // ── CDPs ──────────────────────────────────────────────────────────────────
  { name: 'Sherrelwood',       county: 'Adams', type: 'CDP',                incorporated: false, population2020: 19459,  cdpVerified: true,  notes: 'Large unincorporated community between Denver and Westminster; significant Latino population.' },
  { name: 'Welby',             county: 'Adams', type: 'CDP',                incorporated: false, population2020: 16000,  cdpVerified: false, notes: 'Unincorporated community north of Denver; market-garden history; largely Latino/agricultural.' },
  { name: 'Todd Creek',        county: 'Adams', type: 'CDP',                incorporated: false, population2020: 12381,  cdpVerified: true,  notes: 'Growing unincorporated community between Thornton and Brighton.' },
  { name: 'Henderson',         county: 'Adams', type: 'CDP',                incorporated: false, population2020: 10571,  cdpVerified: true,  notes: 'Unincorporated community in NE Adams County; landfill/industrial area.' },
  { name: 'Derby',             county: 'Adams', type: 'CDP',                incorporated: false, population2020: 9027,   cdpVerified: true,  notes: 'Unincorporated community east of Commerce City.' },
  { name: 'Barr Lake',         county: 'Adams', type: 'Unincorporated Community', incorporated: false, population2020: 800, cdpVerified: false, notes: 'Small community near Barr Lake State Park.' },
  { name: 'Keenesburg',        county: 'Adams', counties: ['Adams', 'Weld'], type: 'Statutory Town', incorporated: true, population2020: 1339, cdpVerified: true, notes: 'Small agricultural community; Wild Animal Sanctuary nearby.' },

  // ── Unincorporated Communities ────────────────────────────────────────────
  { name: 'Eastlake',          county: 'Adams', type: 'Unincorporated Community', incorporated: false, population2020: 4200, cdpVerified: false, notes: 'Unincorporated area north of Thornton; partly annexed; Coal Creek area.' },
  { name: 'Hillcrest Heights', county: 'Adams', type: 'Unincorporated Community', incorporated: false, population2020: 3100, cdpVerified: false, notes: 'Unincorporated area in west-central Adams County.' },
  { name: 'York',              county: 'Adams', type: 'Unincorporated Community', incorporated: false, population2020: 500,  cdpVerified: false, notes: 'Small rural community in NE Adams County.' },
  { name: 'Roggen',            county: 'Adams', type: 'Unincorporated Community', incorporated: false, population2020: 200,  cdpVerified: false, notes: 'Tiny agricultural community along I-76 in NE Adams.' },
  { name: 'Watkins',           county: 'Adams', counties: ['Adams', 'Arapahoe'], type: 'Unincorporated Community', incorporated: false, population2020: 1200, cdpVerified: false, notes: 'Rural I-70 community east of Denver metro.' },
];

// ══════════════════════════════════════════════════════════════════════════════
// BATCH 2: Counties 6–10 by population
// Douglas, Larimer, Weld, Boulder, Pueblo
// ══════════════════════════════════════════════════════════════════════════════

export const COMMUNITIES_BATCH2: Community[] = [

  // ══════════════════════════════════════════════════════════════════════════
  // 6. DOUGLAS COUNTY  (pop 377,150) — seat: Castle Rock
  //    5 incorporated · 4 CDPs · 5 unincorporated communities
  //    NOTE: Lone Tree (14,127) is Douglas County, not Arapahoe — correction
  //    from Batch 1 where it was inadvertently grouped with Arapahoe.
  // ══════════════════════════════════════════════════════════════════════════

  // ── Incorporated ──────────────────────────────────────────────────────────
  { name: 'Castle Rock',      county: 'Douglas', type: 'Home Rule City',  incorporated: true,  population2020: 73080,  cdpVerified: true,  notes: 'County seat; fastest-growing large city in Colorado; I-25 corridor.' },
  { name: 'Parker',           county: 'Douglas', type: 'Home Rule Town',  incorporated: true,  population2020: 59476,  cdpVerified: true,  notes: 'One of the few Home Rule Towns in CO; suburban southeast Denver metro.' },
  { name: 'Lone Tree',        county: 'Douglas', type: 'Home Rule City',  incorporated: true,  population2020: 14127,  cdpVerified: true,  notes: 'Park Meadows mall; RTD light rail. Along I-25 at Arapahoe/Douglas border.' },
  { name: 'Castle Pines',     county: 'Douglas', type: 'Home Rule City',  incorporated: true,  population2020: 11420,  cdpVerified: true,  notes: 'Incorporated 2008; upscale master-planned community; The Village at Castle Pines is a separate private gated area.' },
  { name: 'Larkspur',         county: 'Douglas', type: 'Statutory Town',  incorporated: true,  population2020: 268,    cdpVerified: true,  notes: 'Small historic town along I-25; Renaissance Festival site.' },

  // ── CDPs ──────────────────────────────────────────────────────────────────
  { name: 'Highlands Ranch',  county: 'Douglas', type: 'CDP',             incorporated: false, population2020: 103323, cdpVerified: true,  notes: 'One of the largest CDPs in the United States; master-planned by Shea Homes. Population rivals Castle Rock.' },
  { name: 'The Pinery',       county: 'Douglas', type: 'CDP',             incorporated: false, population2020: 12350,  cdpVerified: false, notes: 'Affluent residential community east of Parker; equestrian lots.' },
  { name: 'Roxborough Park',  county: 'Douglas', type: 'CDP',             incorporated: false, population2020: 9950,   cdpVerified: false, notes: 'Master-planned community adjacent to Roxborough State Park; red rock landscape.' },
  { name: 'Stonegate',        county: 'Douglas', counties: ['Douglas', 'Arapahoe'], type: 'CDP', incorporated: false, population2020: 7800, cdpVerified: false, notes: 'Large master-planned community straddling the Douglas/Arapahoe border.' },

  // ── Unincorporated Communities ────────────────────────────────────────────
  { name: 'Franktown',        county: 'Douglas', type: 'Unincorporated Community', incorporated: false, population2020: 1200,  cdpVerified: false, notes: 'Historic agricultural community at Hwy 83/Hwy 86 crossroads.' },
  { name: 'Sedalia',          county: 'Douglas', type: 'Unincorporated Community', incorporated: false, population2020: 780,   cdpVerified: false, notes: 'Small community along I-25 between Denver and Castle Rock.' },
  { name: 'Louviers',         county: 'Douglas', type: 'Unincorporated Community', incorporated: false, population2020: 420,   cdpVerified: false, notes: 'Former DuPont company town along the South Platte River.' },
  { name: 'Perry Park',       county: 'Douglas', type: 'Unincorporated Community', incorporated: false, population2020: 1600,  cdpVerified: false, notes: 'Residential area along Perry Park Road; red rocks terrain.' },
  { name: 'Deckers',          county: 'Douglas', type: 'Unincorporated Community', incorporated: false, population2020: 150,   cdpVerified: false, notes: 'Remote mountain fishing community along the South Platte River.' },

  // ══════════════════════════════════════════════════════════════════════════
  // 7. LARIMER COUNTY  (pop 374,574) — seat: Fort Collins
  //    7 incorporated · 3 CDPs · 6 unincorporated communities
  // ══════════════════════════════════════════════════════════════════════════

  // ── Incorporated ──────────────────────────────────────────────────────────
  { name: 'Fort Collins',     county: 'Larimer', type: 'Home Rule City',  incorporated: true,  population2020: 164196, cdpVerified: true,  notes: 'County seat; Colorado State University; ranked among top U.S. mid-sized cities.' },
  { name: 'Loveland',         county: 'Larimer', type: 'Home Rule City',  incorporated: true,  population2020: 76378,  cdpVerified: true,  notes: 'Sculpture-casting industry hub; Thompson Valley; gateway to Rocky Mountain National Park.' },
  { name: 'Wellington',       county: 'Larimer', type: 'Statutory Town',  incorporated: true,  population2020: 10099,  cdpVerified: true,  notes: 'Rapidly growing bedroom community north of Fort Collins.' },
  { name: 'Berthoud',         county: 'Larimer', counties: ['Larimer', 'Weld'], type: 'Statutory Town', incorporated: true, population2020: 10332, cdpVerified: true, notes: 'Growing community between Loveland and Longmont; straddles Larimer/Weld line.' },
  { name: 'Timnath',          county: 'Larimer', counties: ['Larimer', 'Weld'], type: 'Statutory Town', incorporated: true, population2020: 8262,  cdpVerified: true, notes: 'One of fastest-growing small towns in CO; master-planned growth along I-25.' },
  { name: 'Estes Park',       county: 'Larimer', type: 'Statutory Town',  incorporated: true,  population2020: 5962,   cdpVerified: true,  notes: 'Gateway to Rocky Mountain National Park; ~4.5M annual visitors.' },
  { name: 'Windsor',          county: 'Larimer', counties: ['Weld', 'Larimer'], type: 'Home Rule Town', incorporated: true, population2020: 31466, cdpVerified: true, notes: 'Primary county is Weld; growing north I-25 corridor town.' },

  // ── CDPs ──────────────────────────────────────────────────────────────────
  { name: 'Laporte',          county: 'Larimer', type: 'CDP',             incorporated: false, population2020: 3741,   cdpVerified: true,  notes: 'Unincorporated community northwest of Fort Collins along Cache la Poudre River.' },
  { name: 'Bellvue',          county: 'Larimer', type: 'CDP',             incorporated: false, population2020: 631,    cdpVerified: true,  notes: 'Small community west of Fort Collins at mouth of Poudre Canyon.' },
  { name: 'Campion',          county: 'Larimer', type: 'CDP',             incorporated: false, population2020: 3270,   cdpVerified: true,  notes: 'Unincorporated community between Loveland and Berthoud.' },

  // ── Unincorporated Communities ────────────────────────────────────────────
  { name: 'Red Feather Lakes', county: 'Larimer', type: 'Unincorporated Community', incorporated: false, population2020: 1800, cdpVerified: false, notes: 'Mountain community in remote northwestern Larimer County; ~8,000 ft elevation.' },
  { name: 'Glen Haven',        county: 'Larimer', type: 'Unincorporated Community', incorporated: false, population2020: 280,  cdpVerified: false, notes: 'Small community in the Big Thompson Canyon; severely impacted by 2013 flood.' },
  { name: 'Masonville',        county: 'Larimer', type: 'Unincorporated Community', incorporated: false, population2020: 500,  cdpVerified: false, notes: 'Rural community west of Loveland in the foothills.' },
  { name: 'Virginia Dale',     county: 'Larimer', type: 'Unincorporated Community', incorporated: false, population2020: 100,  cdpVerified: false, notes: 'Remote community near the Wyoming border; historic Overland Trail station.' },
  { name: 'Livermore',         county: 'Larimer', type: 'Unincorporated Community', incorporated: false, population2020: 350,  cdpVerified: false, notes: 'Small ranching community in northern Larimer County.' },
  { name: 'Drake',             county: 'Larimer', type: 'Unincorporated Community', incorporated: false, population2020: 250,  cdpVerified: false, notes: 'Small community in the Big Thompson Canyon along Hwy 34.' },

  // ══════════════════════════════════════════════════════════════════════════
  // 8. WELD COUNTY  (pop 369,745) — seat: Greeley
  //    20 incorporated (31 total — largest count of any CO county) · 2 CDPs
  //    · 4 unincorporated communities
  // ══════════════════════════════════════════════════════════════════════════

  // ── Incorporated ──────────────────────────────────────────────────────────
  { name: 'Greeley',          county: 'Weld', type: 'Home Rule City',     incorporated: true,  population2020: 103990, cdpVerified: true,  notes: 'County seat; University of Northern Colorado; significant meatpacking/agriculture industry.' },
  { name: 'Evans',            county: 'Weld', type: 'Home Rule City',     incorporated: true,  population2020: 22514,  cdpVerified: true,  notes: 'South Greeley metro area; fastest-growing Weld city after Windsor.' },
  { name: 'Johnstown',        county: 'Weld', counties: ['Weld', 'Larimer'], type: 'Statutory Town', incorporated: true, population2020: 16557, cdpVerified: true, notes: 'Growing I-25 corridor community; straddles Weld/Larimer border.' },
  { name: 'Firestone',        county: 'Weld', type: 'Statutory Town',     incorporated: true,  population2020: 15549,  cdpVerified: true,  notes: 'Rapidly growing bedroom community SW of Greeley; home to high-profile Firestone explosion site (2017).' },
  { name: 'Frederick',        county: 'Weld', type: 'Statutory Town',     incorporated: true,  population2020: 14609,  cdpVerified: true,  notes: 'Twin city with Firestone; strong residential growth in SW Weld County.' },
  { name: 'Fort Lupton',      county: 'Weld', type: 'Home Rule City',     incorporated: true,  population2020: 9254,   cdpVerified: true,  notes: 'Agricultural hub along the South Platte River; significant Hispanic community.' },
  { name: 'Milliken',         county: 'Weld', type: 'Statutory Town',     incorporated: true,  population2020: 7753,   cdpVerified: true,  notes: 'Agricultural/residential community growing rapidly in SW Weld.' },
  { name: 'Dacono',           county: 'Weld', type: 'Home Rule City',     incorporated: true,  population2020: 6099,   cdpVerified: true,  notes: 'Home Rule City in SW Weld; oil & gas production area.' },
  { name: 'Eaton',            county: 'Weld', type: 'Statutory Town',     incorporated: true,  population2020: 5982,   cdpVerified: true,  notes: 'Agricultural community north of Greeley; sugar beet processing history.' },
  { name: 'Severance',        county: 'Weld', type: 'Statutory Town',     incorporated: true,  population2020: 4714,   cdpVerified: true,  notes: 'One of the fastest-growing small towns in Colorado; north of Windsor.' },
  { name: 'Mead',             county: 'Weld', type: 'Statutory Town',     incorporated: true,  population2020: 4919,   cdpVerified: true,  notes: 'Growing community in SW Weld between Longmont and Greeley.' },
  { name: 'Platteville',      county: 'Weld', type: 'Statutory Town',     incorporated: true,  population2020: 2979,   cdpVerified: true,  notes: 'Small community along the South Platte River; Fort Vasquez historic site.' },
  { name: 'LaSalle',          county: 'Weld', type: 'Statutory Town',     incorporated: true,  population2020: 2280,   cdpVerified: true,  notes: 'Small town along the South Platte River east of Greeley.' },
  { name: 'Kersey',           county: 'Weld', type: 'Statutory Town',     incorporated: true,  population2020: 1832,   cdpVerified: true,  notes: 'Small agricultural town east of Greeley.' },
  { name: 'Ault',             county: 'Weld', type: 'Statutory Town',     incorporated: true,  population2020: 1793,   cdpVerified: true,  notes: 'Small town northeast of Greeley; cattle and grain farming.' },
  { name: 'Gilcrest',         county: 'Weld', type: 'Statutory Town',     incorporated: true,  population2020: 1136,   cdpVerified: true,  notes: 'Agricultural community along the South Platte.' },
  { name: 'Pierce',           county: 'Weld', type: 'Statutory Town',     incorporated: true,  population2020: 1117,   cdpVerified: true,  notes: 'Small ranching/farming community in northern Weld County.' },
  { name: 'Nunn',             county: 'Weld', type: 'Statutory Town',     incorporated: true,  population2020: 530,    cdpVerified: true,  notes: 'Remote agricultural community in NE Weld County.' },
  { name: 'Carr',             county: 'Weld', type: 'Statutory Town',     incorporated: true,  population2020: 128,    cdpVerified: true,  notes: 'Very small agricultural community; 2008 tornado.' },
  { name: 'New Raymer',       county: 'Weld', type: 'Statutory Town',     incorporated: true,  population2020: 97,     cdpVerified: true,  notes: 'One of the smallest incorporated places in Colorado.' },

  // ── CDPs ──────────────────────────────────────────────────────────────────
  { name: 'Garden City',      county: 'Weld', type: 'CDP',                incorporated: false, population2020: 258,    cdpVerified: true,  notes: 'Very small community enclave adjacent to Greeley.' },
  { name: 'Lucerne',          county: 'Weld', type: 'CDP',                incorporated: false, population2020: 1840,   cdpVerified: false, notes: 'Unincorporated community northeast of Greeley.' },

  // ── Unincorporated Communities ────────────────────────────────────────────
  { name: 'Galeton',          county: 'Weld', type: 'Unincorporated Community', incorporated: false, population2020: 260, cdpVerified: false, notes: 'Small agricultural community in eastern Weld County.' },
  { name: 'Roggen',           county: 'Weld', counties: ['Weld', 'Adams'], type: 'Unincorporated Community', incorporated: false, population2020: 200, cdpVerified: false, notes: 'Tiny agricultural community along I-76.' },
  { name: 'Grover',           county: 'Weld', type: 'Unincorporated Community', incorporated: false, population2020: 150, cdpVerified: false, notes: 'Remote northeastern plains community near Pawnee Buttes.' },
  { name: 'Pawnee',           county: 'Weld', type: 'Unincorporated Community', incorporated: false, population2020: 80,  cdpVerified: false, notes: 'Tiny community in far eastern Weld County near the Pawnee National Grassland.' },

  // ══════════════════════════════════════════════════════════════════════════
  // 9. BOULDER COUNTY  (pop 329,543) — seat: Boulder
  //    10 incorporated · 3 CDPs · 4 unincorporated communities
  // ══════════════════════════════════════════════════════════════════════════

  // ── Incorporated ──────────────────────────────────────────════════════════
  { name: 'Boulder',          county: 'Boulder', type: 'Home Rule City',  incorporated: true,  population2020: 105112, cdpVerified: true,  notes: 'University of Colorado; nationally known for tech, outdoor culture, and land conservation.' },
  { name: 'Longmont',         county: 'Boulder', counties: ['Boulder', 'Weld'], type: 'Home Rule City', incorporated: true, population2020: 92858, cdpVerified: true, notes: 'Primary county is Boulder; second-largest city in Boulder County; significant manufacturing/tech.' },
  { name: 'Lafayette',        county: 'Boulder', type: 'Home Rule City',  incorporated: true,  population2020: 30498,  cdpVerified: true,  notes: 'Former coal-mining town; now a diverse growing suburb with strong arts community.' },
  { name: 'Erie',             county: 'Boulder', counties: ['Boulder', 'Weld'], type: 'Statutory Town', incorporated: true, population2020: 30038, cdpVerified: true, notes: 'One of fastest-growing towns in Colorado; straddles Boulder/Weld border.' },
  { name: 'Louisville',       county: 'Boulder', type: 'Home Rule City',  incorporated: true,  population2020: 21318,  cdpVerified: true,  notes: 'Consistently ranked one of best small cities in U.S. Damaged by Marshall Fire (Dec 2021).' },
  { name: 'Superior',         county: 'Boulder', counties: ['Boulder', 'Jefferson'], type: 'Statutory Town', incorporated: true, population2020: 13919, cdpVerified: true, notes: 'Upscale planned community; largely destroyed/rebuilt after Marshall Fire (Dec 2021).' },
  { name: 'Lyons',            county: 'Boulder', type: 'Statutory Town',  incorporated: true,  population2020: 2103,   cdpVerified: true,  notes: 'Gateway to St. Vrain Canyon; music festival hub; seriously damaged in 2013 flood.' },
  { name: 'Nederland',        county: 'Boulder', type: 'Statutory Town',  incorporated: true,  population2020: 1560,   cdpVerified: true,  notes: 'Mountain town at 8,228 ft; Frozen Dead Guy Days festival; gateway to Indian Peaks.' },
  { name: 'Jamestown',        county: 'Boulder', type: 'Statutory Town',  incorporated: true,  population2020: 310,    cdpVerified: true,  notes: 'Very small historic mining town west of Boulder; isolated canyon community.' },
  { name: 'Ward',             county: 'Boulder', type: 'Statutory Town',  incorporated: true,  population2020: 150,    cdpVerified: true,  notes: 'One of Colorado\'s smallest incorporated places; mountain community at 9,253 ft.' },

  // ── CDPs ──────────────────────────────────────────────────────────────────
  { name: 'Gunbarrel',        county: 'Boulder', type: 'CDP',             incorporated: false, population2020: 17019,  cdpVerified: true,  notes: 'Large unincorporated tech/residential community northeast of Boulder; major IBM/Google campus area.' },
  { name: 'Niwot',            county: 'Boulder', type: 'CDP',             incorporated: false, population2020: 4810,   cdpVerified: true,  notes: 'Affluent unincorporated community east of Boulder; historic downtown.' },
  { name: 'Eldorado Springs', county: 'Boulder', type: 'CDP',             incorporated: false, population2020: 738,    cdpVerified: true,  notes: 'Small community at canyon mouth; Eldorado Canyon State Park; natural spring resort history.' },

  // ── Unincorporated Communities ────────────────────────────────────────────
  { name: 'Gold Hill',        county: 'Boulder', type: 'Unincorporated Community', incorporated: false, population2020: 225, cdpVerified: false, notes: 'Historic 1859 gold mining town at 8,463 ft; year-round population ~100.' },
  { name: 'Allenspark',       county: 'Boulder', type: 'Unincorporated Community', incorporated: false, population2020: 518, cdpVerified: false, notes: 'Small mountain community along Peak to Peak Scenic Byway; near Rocky Mountain National Park.' },
  { name: 'Sunshine',         county: 'Boulder', type: 'Unincorporated Community', incorporated: false, population2020: 600, cdpVerified: false, notes: 'Residential area northwest of Boulder in the foothills.' },
  { name: 'Lefthand',         county: 'Boulder', type: 'Unincorporated Community', incorporated: false, population2020: 300, cdpVerified: false, notes: 'Small community in Lefthand Canyon west of Longmont.' },

  // ══════════════════════════════════════════════════════════════════════════
  // 10. PUEBLO COUNTY  (pop 169,356) — seat: Pueblo
  //     4 incorporated · 3 CDPs · 3 unincorporated communities
  // ══════════════════════════════════════════════════════════════════════════

  // ── Incorporated ──────────────────────────────────────────────────────────
  { name: 'Pueblo',           county: 'Pueblo', type: 'Home Rule City',   incorporated: true,  population2020: 111127, cdpVerified: true,  notes: 'Steel City of the West; University of Southern Colorado; lowest eff rate among large CO cities.' },
  { name: 'Colorado City',    county: 'Pueblo', type: 'Statutory Town',   incorporated: true,  population2020: 2176,   cdpVerified: true,  notes: 'Community in the Greenhorn Valley, south of Pueblo along I-25.' },
  { name: 'Rye',              county: 'Pueblo', type: 'Statutory Town',   incorporated: true,  population2020: 192,    cdpVerified: true,  notes: 'Small mountain community on the eastern slope of the Wet Mountains.' },
  { name: 'Boone',            county: 'Pueblo', type: 'Statutory Town',   incorporated: true,  population2020: 337,    cdpVerified: true,  notes: 'Small agricultural community east of Pueblo along Hwy 96.' },

  // ── CDPs ──────────────────────────────────────────────────────────────────
  { name: 'Pueblo West',      county: 'Pueblo', type: 'CDP',              incorporated: false, population2020: 31015,  cdpVerified: true,  notes: 'Large master-planned unincorporated community west of Pueblo. Despite size, remains unincorporated.' },
  { name: 'Avondale',         county: 'Pueblo', type: 'CDP',              incorporated: false, population2020: 1202,   cdpVerified: true,  notes: 'Small agricultural community along the Arkansas River east of Pueblo.' },
  { name: 'Vineland',         county: 'Pueblo', type: 'CDP',              incorporated: false, population2020: 1138,   cdpVerified: true,  notes: 'Small unincorporated community southeast of Pueblo.' },

  // ── Unincorporated Communities ────────────────────────────────────────────
  { name: 'Beulah',           county: 'Pueblo', type: 'Unincorporated Community', incorporated: false, population2020: 1200, cdpVerified: false, notes: 'Mountain community in the Wet Mountains SW of Pueblo; popular weekend destination.' },
  { name: 'Greenwood',        county: 'Pueblo', type: 'Unincorporated Community', incorporated: false, population2020: 800,  cdpVerified: false, notes: 'Rural community in southern Pueblo County.' },
  { name: 'Burnt Mill',       county: 'Pueblo', type: 'Unincorporated Community', incorporated: false, population2020: 300,  cdpVerified: false, notes: 'Small community in the Greenhorn Valley.' },
];

// ══════════════════════════════════════════════════════════════════════════════
// BATCH 3: Counties 11–15 by population
// Mesa, Broomfield, Garfield, La Plata, Eagle
// ══════════════════════════════════════════════════════════════════════════════

export const COMMUNITIES_BATCH3: Community[] = [

  // ══════════════════════════════════════════════════════════════════════════
  // 11. MESA COUNTY  (pop 158,601) — seat: Grand Junction
  //     6 incorporated · 4 CDPs · 4 unincorporated communities
  // ══════════════════════════════════════════════════════════════════════════

  // ── Incorporated ──────────────────────────────────────────────────────────
  { name: 'Grand Junction',   county: 'Mesa', type: 'Home Rule City',     incorporated: true,  population2020: 65560,  cdpVerified: true,  notes: 'County seat; largest city on the Western Slope; Colorado National Monument gateway.' },
  { name: 'Fruita',           county: 'Mesa', type: 'Home Rule City',     incorporated: true,  population2020: 14223,  cdpVerified: true,  notes: 'Western gateway to Colorado; mountain biking mecca; Mike the Headless Chicken festival.' },
  { name: 'Palisade',         county: 'Mesa', type: 'Statutory Town',     incorporated: true,  population2020: 2695,   cdpVerified: true,  notes: 'Wine & peach country; Colorado wine industry hub; vineyards on the Book Cliffs.' },
  { name: 'Collbran',         county: 'Mesa', type: 'Statutory Town',     incorporated: true,  population2020: 646,    cdpVerified: true,  notes: 'Small ranching community on the Grand Mesa.' },
  { name: 'De Beque',         county: 'Mesa', type: 'Statutory Town',     incorporated: true,  population2020: 531,    cdpVerified: true,  notes: 'Small community in De Beque Canyon along I-70 and the Colorado River.' },
  { name: 'Mesa',             county: 'Mesa', type: 'Statutory Town',     incorporated: true,  population2020: 178,    cdpVerified: true,  notes: 'Small community on the north slope of Grand Mesa; apple orchards.' },

  // ── CDPs ──────────────────────────────────────────────────────────────────
  { name: 'Clifton',          county: 'Mesa', type: 'CDP',                incorporated: false, population2020: 21897,  cdpVerified: true,  notes: 'Largest unincorporated community in Mesa County; east of Grand Junction along I-70.' },
  { name: 'Redlands',         county: 'Mesa', type: 'CDP',                incorporated: false, population2020: 12267,  cdpVerified: true,  notes: 'Upscale residential area on the south rim above the Colorado River; views of Colorado National Monument.' },
  { name: 'Orchard Mesa',     county: 'Mesa', type: 'CDP',                incorporated: false, population2020: 7434,   cdpVerified: true,  notes: 'Residential community on the east bank of the Colorado River south of Grand Junction.' },
  { name: 'Fruitvale',        county: 'Mesa', type: 'CDP',                incorporated: false, population2020: 5219,   cdpVerified: true,  notes: 'Unincorporated residential area between Grand Junction and Palisade.' },

  // ── Unincorporated Communities ────────────────────────────────────────────
  { name: 'Mack',             county: 'Mesa', type: 'Unincorporated Community', incorporated: false, population2020: 380,  cdpVerified: false, notes: 'Small agricultural/oil community near the Utah border along I-70.' },
  { name: 'Loma',             county: 'Mesa', type: 'Unincorporated Community', incorporated: false, population2020: 300,  cdpVerified: false, notes: 'Small rural community northwest of Fruita.' },
  { name: 'Whitewater',       county: 'Mesa', type: 'Unincorporated Community', incorporated: false, population2020: 900,  cdpVerified: false, notes: 'Ranching community south of Grand Junction at the mouth of Unaweep Canyon.' },
  { name: 'Gateway',          county: 'Mesa', type: 'Unincorporated Community', incorporated: false, population2020: 100,  cdpVerified: false, notes: 'Remote canyon community on the Dolores River; Gateway Canyons Resort.' },

  // ══════════════════════════════════════════════════════════════════════════
  // 12. BROOMFIELD COUNTY  (pop 76,304) — Consolidated City & County
  //     1 city-county entity · 3 notable community districts
  // ══════════════════════════════════════════════════════════════════════════

  { name: 'Broomfield',       county: 'Broomfield', type: 'Consolidated City & County', incorporated: true,  population2020: 76304,  cdpVerified: true,  notes: 'Consolidated city-county (since 2001). Smallest county in Colorado by land area.' },
  { name: 'Interlocken',      county: 'Broomfield', type: 'Neighborhood', incorporated: false, population2020: 4200,  cdpVerified: false, notes: 'Major tech/office park in southeast Broomfield; Oracle, Hunter Douglas, others.' },
  { name: 'Anthem',           county: 'Broomfield', type: 'Neighborhood', incorporated: false, population2020: 8900,  cdpVerified: false, notes: 'Large master-planned community in northern Broomfield.' },
  { name: 'Broadlands',       county: 'Broomfield', type: 'Neighborhood', incorporated: false, population2020: 6200,  cdpVerified: false, notes: 'Master-planned golf community in northeast Broomfield.' },

  // ══════════════════════════════════════════════════════════════════════════
  // 13. GARFIELD COUNTY  (pop 62,479) — seat: Glenwood Springs
  //     6 incorporated · 2 CDPs · 4 unincorporated communities
  // ══════════════════════════════════════════════════════════════════════════

  // ── Incorporated ──────────────────────────────────────────────────────────
  { name: 'Rifle',            county: 'Garfield', type: 'Home Rule City',  incorporated: true,  population2020: 10235,  cdpVerified: true,  notes: 'Energy industry hub; natural gas production; services eastern Garfield County.' },
  { name: 'Glenwood Springs', county: 'Garfield', type: 'Home Rule City',  incorporated: true,  population2020: 10094,  cdpVerified: true,  notes: 'County seat; Glenwood Hot Springs; gateway to Glenwood Canyon on I-70.' },
  { name: 'New Castle',       county: 'Garfield', type: 'Statutory Town',  incorporated: true,  population2020: 5037,   cdpVerified: true,  notes: 'Rapidly growing bedroom community west of Glenwood Springs.' },
  { name: 'Carbondale',       county: 'Garfield', type: 'Home Rule Town',  incorporated: true,  population2020: 7219,   cdpVerified: true,  notes: 'Arts community at the base of Mt. Sopris; Roaring Fork Valley hub.' },
  { name: 'Silt',             county: 'Garfield', type: 'Statutory Town',  incorporated: true,  population2020: 3308,   cdpVerified: true,  notes: 'Growing community in mid-Garfield County along I-70 and the Colorado River.' },
  { name: 'Parachute',        county: 'Garfield', type: 'Home Rule Town',  incorporated: true,  population2020: 1234,   cdpVerified: true,  notes: 'Small community; named for Parachute Creek; oil shale history.' },

  // ── CDPs ──────────────────────────────────────────────────────────────────
  { name: 'Battlement Mesa',  county: 'Garfield', type: 'CDP',             incorporated: false, population2020: 4926,   cdpVerified: true,  notes: 'Planned community on a mesa above the Colorado River; originally an oil shale worker community.' },
  { name: 'Canyon Creek',     county: 'Garfield', type: 'CDP',             incorporated: false, population2020: 1847,   cdpVerified: true,  notes: 'Unincorporated community east of Rifle.' },

  // ── Unincorporated Communities ────────────────────────────────────────────
  { name: 'Glenwood Springs Rural', county: 'Garfield', type: 'Unincorporated Community', incorporated: false, population2020: 2400, cdpVerified: false, notes: 'Unincorporated areas surrounding Glenwood Springs; Spring Valley, Sunlight area.' },
  { name: 'Cattle Creek',     county: 'Garfield', type: 'Unincorporated Community', incorporated: false, population2020: 900,  cdpVerified: false, notes: 'Residential area along Hwy 82 south of Glenwood Springs.' },
  { name: 'Rulison',          county: 'Garfield', type: 'Unincorporated Community', incorporated: false, population2020: 300,  cdpVerified: false, notes: 'Small community; site of 1969 Project Rulison underground nuclear detonation.' },
  { name: 'Garfield',         county: 'Garfield', type: 'Unincorporated Community', incorporated: false, population2020: 200,  cdpVerified: false, notes: 'Historic community in northern Garfield County near the White River Plateau.' },

  // ══════════════════════════════════════════════════════════════════════════
  // 14. LA PLATA COUNTY  (pop 56,331) — seat: Durango
  //     3 incorporated · 3 CDPs · 4 unincorporated communities
  // ══════════════════════════════════════════════════════════════════════════

  // ── Incorporated ──────────────────────────────────────────────────────────
  { name: 'Durango',          county: 'La Plata', type: 'Home Rule City',  incorporated: true,  population2020: 19387,  cdpVerified: true,  notes: 'County seat; Fort Lewis College; Durango & Silverton Narrow Gauge Railroad; outdoor recreation hub.' },
  { name: 'Bayfield',         county: 'La Plata', type: 'Statutory Town',  incorporated: true,  population2020: 3061,   cdpVerified: true,  notes: 'Growing agricultural/bedroom community east of Durango; Los Pinos River.' },
  { name: 'Ignacio',          county: 'La Plata', type: 'Statutory Town',  incorporated: true,  population2020: 867,    cdpVerified: true,  notes: 'Gateway to the Southern Ute Indian Reservation; Sky Ute Casino.' },

  // ── CDPs ──────────────────────────────────────────────────────────────────
  { name: 'Ponderosa Park',   county: 'La Plata', type: 'CDP',             incorporated: false, population2020: 2841,   cdpVerified: true,  notes: 'Unincorporated residential community south of Durango.' },
  { name: 'Gem Village',      county: 'La Plata', type: 'CDP',             incorporated: false, population2020: 538,    cdpVerified: true,  notes: 'Small unincorporated community east of Bayfield.' },
  { name: 'Breen',            county: 'La Plata', type: 'CDP',             incorporated: false, population2020: 412,    cdpVerified: true,  notes: 'Small unincorporated community on the Florida River corridor south of Durango.' },

  // ── Unincorporated Communities ────────────────────────────────────────────
  { name: 'Hesperus',         county: 'La Plata', type: 'Unincorporated Community', incorporated: false, population2020: 900,  cdpVerified: false, notes: 'Ranching community west of Durango at the foot of La Plata Mountains; La Plata Airport area.' },
  { name: 'Vallecito',        county: 'La Plata', type: 'Unincorporated Community', incorporated: false, population2020: 600,  cdpVerified: false, notes: 'Resort/cabin community around Vallecito Reservoir northeast of Bayfield.' },
  { name: 'Lemon Reservoir',  county: 'La Plata', type: 'Unincorporated Community', incorporated: false, population2020: 300,  cdpVerified: false, notes: 'Small community on the Florida River above Lemon Reservoir.' },
  { name: 'Marvel',           county: 'La Plata', type: 'Unincorporated Community', incorporated: false, population2020: 150,  cdpVerified: false, notes: 'Remote agricultural community in southern La Plata County.' },

  // ══════════════════════════════════════════════════════════════════════════
  // 15. EAGLE COUNTY  (pop 55,135) — seat: Eagle
  //     7 incorporated · 3 CDPs · 5 unincorporated communities
  // ══════════════════════════════════════════════════════════════════════════

  // ── Incorporated ──────────────────────────────────────────────────────────
  { name: 'Gypsum',           county: 'Eagle', type: 'Statutory Town',    incorporated: true,  population2020: 7858,   cdpVerified: true,  notes: 'Fastest-growing community in Eagle County; workforce housing hub; Eagle County Airport.' },
  { name: 'Eagle',            county: 'Eagle', type: 'Statutory Town',    incorporated: true,  population2020: 7583,   cdpVerified: true,  notes: 'County seat; services the working population of the resort valley.' },
  { name: 'Avon',             county: 'Eagle', type: 'Home Rule Town',    incorporated: true,  population2020: 6896,   cdpVerified: true,  notes: 'Retail hub of the Vail Valley; Beaver Creek Resort gateway; Nottingham Lake.' },
  { name: 'Vail',             county: 'Eagle', type: 'Home Rule Town',    incorporated: true,  population2020: 5477,   cdpVerified: true,  notes: 'World-class ski resort; year-round population ~5,500 but swells to 30,000+ in peak ski season.' },
  { name: 'Basalt',           county: 'Eagle', counties: ['Eagle', 'Pitkin'], type: 'Statutory Town', incorporated: true, population2020: 4322, cdpVerified: true, notes: 'Roaring Fork Valley community straddles Eagle/Pitkin county line; Frying Pan River trout fishing.' },
  { name: 'Minturn',          county: 'Eagle', type: 'Statutory Town',    incorporated: true,  population2020: 1115,   cdpVerified: true,  notes: 'Historic railroad town in Battle Mountain area; affordable housing relative to Vail.' },
  { name: 'Red Cliff',        county: 'Eagle', type: 'Statutory Town',    incorporated: true,  population2020: 244,    cdpVerified: true,  notes: 'Historic mining town at the confluence of Tenmile Creek and the Eagle River; one of CO\'s oldest towns.' },

  // ── CDPs ──────────────────────────────────────────────────────────────────
  { name: 'Edwards',          county: 'Eagle', type: 'CDP',               incorporated: false, population2020: 9534,   cdpVerified: true,  notes: 'Largest unincorporated community in Eagle County; major retail and residential hub between Avon and Gypsum.' },
  { name: 'El Jebel',         county: 'Eagle', counties: ['Eagle', 'Pitkin'], type: 'CDP', incorporated: false, population2020: 3481, cdpVerified: true, notes: 'Unincorporated community near Basalt; workforce housing for the Aspen/Roaring Fork area.' },
  { name: 'Beaver Creek',     county: 'Eagle', type: 'CDP',               incorporated: false, population2020: 947,    cdpVerified: true,  notes: 'Private master-planned ski resort village; full-time population small but resort capacity 10,000+.' },

  // ── Unincorporated Communities ────────────────────────────────────────────
  { name: 'Cordillera',       county: 'Eagle', type: 'Unincorporated Community', incorporated: false, population2020: 1200, cdpVerified: false, notes: 'Gated luxury community on a mesa west of Edwards; private golf and amenities.' },
  { name: 'Wolcott',          county: 'Eagle', type: 'Unincorporated Community', incorporated: false, population2020: 700,  cdpVerified: false, notes: 'Small community along I-70 and the Eagle River at Hwy 131 junction.' },
  { name: 'McCoy',            county: 'Eagle', type: 'Unincorporated Community', incorporated: false, population2020: 300,  cdpVerified: false, notes: 'Remote ranching community in northwestern Eagle County along the Colorado River.' },
  { name: 'Dotsero',          county: 'Eagle', type: 'Unincorporated Community', incorporated: false, population2020: 250,  cdpVerified: false, notes: 'Small community at the I-70/Hwy 131 junction near the Colorado River; Dotsero volcano (most recent in CO, ~4,000 yrs ago).' },
  { name: 'Burns',            county: 'Eagle', type: 'Unincorporated Community', incorporated: false, population2020: 100,  cdpVerified: false, notes: 'Tiny ranching community in the Burns Hole area of northwestern Eagle County.' },
];

// ══════════════════════════════════════════════════════════════════════════════
// BATCH 4: Counties 16–20 by population
// Fremont, Montrose, Delta, Summit, Morgan
// ══════════════════════════════════════════════════════════════════════════════

export const COMMUNITIES_BATCH4: Community[] = [

  // ══════════════════════════════════════════════════════════════════════════
  // 16. FREMONT COUNTY  (pop 49,634) — seat: Cañon City
  //     7 incorporated · 2 CDPs · 4 unincorporated communities
  // ══════════════════════════════════════════════════════════════════════════

  // ── Incorporated ──────────────────────────────────────────────────────────
  { name: 'Cañon City',       county: 'Fremont', type: 'Home Rule City',  incorporated: true,  population2020: 17141,  cdpVerified: true,  notes: 'County seat; tourism hub at the mouth of the Royal Gorge; multiple state prisons nearby.' },
  { name: 'Florence',         county: 'Fremont', type: 'Home Rule City',  incorporated: true,  population2020: 4134,   cdpVerified: true,  notes: 'Oil discovery city (1862); antique shops; ADX Florence federal supermax prison nearby.' },
  { name: 'Rockvale',         county: 'Fremont', type: 'Statutory Town',  incorporated: true,  population2020: 562,    cdpVerified: true,  notes: 'Historic coal-mining community north of Cañon City.' },
  { name: 'Brookside',        county: 'Fremont', type: 'Statutory Town',  incorporated: true,  population2020: 491,    cdpVerified: true,  notes: 'Small community in the Arkansas River Valley near Cañon City.' },
  { name: 'Coal Creek',       county: 'Fremont', type: 'Statutory Town',  incorporated: true,  population2020: 342,    cdpVerified: true,  notes: 'Former coal-mining town northeast of Cañon City.' },
  { name: 'Howard',           county: 'Fremont', type: 'Statutory Town',  incorporated: true,  population2020: 101,    cdpVerified: true,  notes: 'Small community in the upper Arkansas River Valley.' },
  { name: 'Williamsburg',     county: 'Fremont', type: 'Statutory Town',  incorporated: true,  population2020: 84,     cdpVerified: true,  notes: 'Very small historic community near Cañon City.' },

  // ── CDPs ──────────────────────────────────────────────────────────────────
  { name: 'Penrose',          county: 'Fremont', type: 'CDP',             incorporated: false, population2020: 3548,   cdpVerified: true,  notes: 'Unincorporated residential community between Cañon City and Florence along Hwy 50.' },
  { name: 'Lincoln Park',     county: 'Fremont', type: 'CDP',             incorporated: false, population2020: 3228,   cdpVerified: true,  notes: 'Suburban community on the east edge of Cañon City.' },

  // ── Unincorporated Communities ────────────────────────────────────────────
  { name: 'Garden Park',      county: 'Fremont', type: 'Unincorporated Community', incorporated: false, population2020: 600, cdpVerified: false, notes: 'Community north of Cañon City; significant Jurassic dinosaur fossil discoveries.' },
  { name: 'Texas Creek',      county: 'Fremont', type: 'Unincorporated Community', incorporated: false, population2020: 200, cdpVerified: false, notes: 'Remote community in the upper Arkansas Canyon on Hwy 50.' },
  { name: 'Coaldale',         county: 'Fremont', type: 'Unincorporated Community', incorporated: false, population2020: 150, cdpVerified: false, notes: 'Small community west of Howard along the Arkansas River.' },
  { name: 'Cotopaxi',         county: 'Fremont', type: 'Unincorporated Community', incorporated: false, population2020: 180, cdpVerified: false, notes: 'Small community along the Arkansas River; rafting put-in area.' },

  // ══════════════════════════════════════════════════════════════════════════
  // 17. MONTROSE COUNTY  (pop 43,807) — seat: Montrose
  //     4 incorporated · 1 CDP · 5 unincorporated communities
  // ══════════════════════════════════════════════════════════════════════════

  // ── Incorporated ──────────────────────────────────────────────────────────
  { name: 'Montrose',         county: 'Montrose', type: 'Home Rule City', incorporated: true,  population2020: 19420,  cdpVerified: true,  notes: 'County seat; Western Slope regional hub; gateway to Black Canyon of the Gunnison.' },
  { name: 'Olathe',           county: 'Montrose', type: 'Statutory Town', incorporated: true,  population2020: 1958,   cdpVerified: true,  notes: 'Agricultural community north of Montrose; famous for Olathe Sweet Corn.' },
  { name: 'Nucla',            county: 'Montrose', type: 'Statutory Town', incorporated: true,  population2020: 702,    cdpVerified: true,  notes: 'Historic uranium-mining town on the San Miguel River; formed as a utopian cooperative colony.' },
  { name: 'Naturita',         county: 'Montrose', type: 'Statutory Town', incorporated: true,  population2020: 647,    cdpVerified: true,  notes: 'Small town on the San Miguel River; uranium and vanadium mining history.' },

  // ── CDPs ──────────────────────────────────────────────────────────────────
  { name: 'Colona',           county: 'Montrose', type: 'CDP',            incorporated: false, population2020: 479,    cdpVerified: true,  notes: 'Unincorporated community south of Montrose near the Uncompahgre River.' },

  // ── Unincorporated Communities ────────────────────────────────────════════
  { name: 'Cimarron',         county: 'Montrose', type: 'Unincorporated Community', incorporated: false, population2020: 100, cdpVerified: false, notes: 'Remote community near Morrow Point Reservoir and the Black Canyon.' },
  { name: 'Paradox',          county: 'Montrose', type: 'Unincorporated Community', incorporated: false, population2020: 80,  cdpVerified: false, notes: 'Tiny community in Paradox Valley; named for the Dolores River\'s paradoxical east-west course across the valley.' },
  { name: 'Bedrock',          county: 'Montrose', type: 'Unincorporated Community', incorporated: false, population2020: 50,  cdpVerified: false, notes: 'One of Colorado\'s most remote communities; Dolores River canyon country.' },
  { name: 'Uravan',           county: 'Montrose', type: 'Unincorporated Community', incorporated: false, population2020: 0,   cdpVerified: false, notes: 'Former uranium/vanadium mill town; EPA Superfund site. Ghost town — mill demolished, residents relocated.' },
  { name: 'Peach Valley',     county: 'Montrose', type: 'Unincorporated Community', incorporated: false, population2020: 350, cdpVerified: false, notes: 'Agricultural community in the Uncompahgre Valley north of Montrose.' },

  // ══════════════════════════════════════════════════════════════════════════
  // 18. DELTA COUNTY  (pop 31,598) — seat: Delta
  //     5 incorporated · 2 CDPs · 4 unincorporated communities
  // ══════════════════════════════════════════════════════════════════════════

  // ── Incorporated ──────────────────────────────────────────────────────────
  { name: 'Delta',            county: 'Delta', type: 'Home Rule City',    incorporated: true,  population2020: 9407,   cdpVerified: true,  notes: 'County seat; confluence of Gunnison and Uncompahgre rivers; agriculture and tourism.' },
  { name: 'Orchard City',     county: 'Delta', type: 'Statutory Town',    incorporated: true,  population2020: 3118,   cdpVerified: true,  notes: 'Surface Creek valley community; apple orchards, peaches, pears.' },
  { name: 'Cedaredge',        county: 'Delta', type: 'Statutory Town',    incorporated: true,  population2020: 2602,   cdpVerified: true,  notes: 'Growing community on the southern slopes of Grand Mesa; fruit orchards.' },
  { name: 'Paonia',           county: 'Delta', type: 'Home Rule Town',    incorporated: true,  population2020: 1399,   cdpVerified: true,  notes: 'North Fork Valley arts and organic farming community; Elephant Butte coal mine nearby.' },
  { name: 'Hotchkiss',        county: 'Delta', type: 'Statutory Town',    incorporated: true,  population2020: 991,    cdpVerified: true,  notes: 'Small agricultural community in the North Fork of the Gunnison Valley.' },

  // ── CDPs ──────────────────────────────────────────────────────────────────
  { name: 'Austin',           county: 'Delta', type: 'CDP',               incorporated: false, population2020: 512,    cdpVerified: true,  notes: 'Small unincorporated community in the Surface Creek area between Delta and Cedaredge.' },
  { name: 'Crawford',         county: 'Delta', type: 'CDP',               incorporated: false, population2020: 431,    cdpVerified: true,  notes: 'Small community near Crawford Reservoir; outdoor recreation.' },

  // ── Unincorporated Communities ────────────────────────────────────────────
  { name: 'Eckert',           county: 'Delta', type: 'Unincorporated Community', incorporated: false, population2020: 700, cdpVerified: false, notes: 'Community in the Surface Creek Valley; known for cherries and fruit orchards.' },
  { name: 'Lazear',           county: 'Delta', type: 'Unincorporated Community', incorporated: false, population2020: 250, cdpVerified: false, notes: 'Small agricultural community west of Hotchkiss.' },
  { name: 'Garnet Mesa',      county: 'Delta', type: 'Unincorporated Community', incorporated: false, population2020: 400, cdpVerified: false, notes: 'Residential area south of Delta on a mesa above the Gunnison River.' },
  { name: 'Somerset',         county: 'Delta', type: 'Unincorporated Community', incorporated: false, population2020: 100, cdpVerified: false, notes: 'Remote coal mining community in the North Fork Valley; active Bowie coal mine.' },

  // ══════════════════════════════════════════════════════════════════════════
  // 19. SUMMIT COUNTY  (pop 31,017) — seat: Breckenridge
  //     6 incorporated · 4 CDPs · 3 unincorporated communities
  //     Note: Year-round population is ~31K but seasonal peak exceeds 100K.
  // ══════════════════════════════════════════════════════════════════════════

  // ── Incorporated ──────────────────────────────────────────────────────────
  { name: 'Breckenridge',     county: 'Summit', type: 'Home Rule Town',   incorporated: true,  population2020: 4961,   cdpVerified: true,  notes: 'County seat; world-class ski resort; National Historic District Victorian downtown; peak seasonal pop 30,000+.' },
  { name: 'Silverthorne',     county: 'Summit', type: 'Statutory Town',   incorporated: true,  population2020: 4264,   cdpVerified: true,  notes: 'I-70 retail hub; outlet mall; primary workforce housing for the ski resorts.' },
  { name: 'Frisco',           county: 'Summit', type: 'Home Rule Town',   incorporated: true,  population2020: 3347,   cdpVerified: true,  notes: 'Central Summit County hub; Frisco Bay Marina on Dillon Reservoir; local gateway.' },
  { name: 'Blue River',       county: 'Summit', type: 'Statutory Town',   incorporated: true,  population2020: 1251,   cdpVerified: true,  notes: 'Residential community south of Breckenridge along the Blue River.' },
  { name: 'Dillon',           county: 'Summit', type: 'Statutory Town',   incorporated: true,  population2020: 939,    cdpVerified: true,  notes: 'Historic town relocated when Dillon Reservoir was created in 1963; now adjacent to the reservoir.' },
  { name: 'Montezuma',        county: 'Summit', type: 'Statutory Town',   incorporated: true,  population2020: 82,     cdpVerified: true,  notes: 'Tiny historic silver-mining town at 10,340 ft; one of Colorado\'s highest incorporated communities.' },

  // ── CDPs ──────────────────────────────────────────────────────────────────
  { name: 'Keystone',         county: 'Summit', type: 'CDP',              incorporated: false, population2020: 1025,   cdpVerified: true,  notes: 'Major ski resort community; year-round pop ~1,000 swells to 25,000+ in ski season.' },
  { name: 'Wildernest',       county: 'Summit', type: 'CDP',              incorporated: false, population2020: 2917,   cdpVerified: true,  notes: 'Largest residential CDP in Summit County; workforce housing on the slopes above Silverthorne.' },
  { name: 'Dillon Valley',    county: 'Summit', type: 'CDP',              incorporated: false, population2020: 1942,   cdpVerified: true,  notes: 'Residential community along the shore of Dillon Reservoir.' },
  { name: 'Copper Mountain',  county: 'Summit', type: 'CDP',              incorporated: false, population2020: 385,    cdpVerified: true,  notes: 'Ski resort village at the base of Copper Mountain; primarily seasonal.' },

  // ── Unincorporated Communities ────────────────────────────────────────────
  { name: 'Summit Cove',      county: 'Summit', type: 'Unincorporated Community', incorporated: false, population2020: 1200, cdpVerified: false, notes: 'Residential community on the eastern shore of Dillon Reservoir.' },
  { name: 'Mesa Cortina',     county: 'Summit', type: 'Unincorporated Community', incorporated: false, population2020: 700,  cdpVerified: false, notes: 'Residential community above Dillon; popular with local workforce.' },
  { name: 'Tiger Run',        county: 'Summit', type: 'Unincorporated Community', incorporated: false, population2020: 400,  cdpVerified: false, notes: 'RV/cabin resort community along the Blue River south of Breckenridge.' },

  // ══════════════════════════════════════════════════════════════════════════
  // 20. MORGAN COUNTY  (pop 29,520) — seat: Fort Morgan
  //     4 incorporated · 1 CDP · 4 unincorporated communities
  // ══════════════════════════════════════════════════════════════════════════

  // ── Incorporated ──────────────────────────────────────────────────────────
  { name: 'Fort Morgan',      county: 'Morgan', type: 'Home Rule City',   incorporated: true,  population2020: 11740,  cdpVerified: true,  notes: 'County seat; meatpacking industry (JBS); significant Hispanic community; Glenn Miller birthplace.' },
  { name: 'Brush',            county: 'Morgan', type: 'Home Rule City',   incorporated: true,  population2020: 5607,   cdpVerified: true,  notes: 'Agricultural hub on the South Platte River; sugar beets and feedlots.' },
  { name: 'Wiggins',          county: 'Morgan', type: 'Statutory Town',   incorporated: true,  population2020: 1129,   cdpVerified: true,  notes: 'Small agricultural community in eastern Morgan County.' },
  { name: 'Log Lane Village', county: 'Morgan', type: 'Statutory Town',   incorporated: true,  population2020: 956,    cdpVerified: true,  notes: 'Small residential community adjacent to Fort Morgan.' },

  // ── CDPs ──────────────────────────────────────────────────────────────────
  { name: 'Weldona',          county: 'Morgan', type: 'CDP',              incorporated: false, population2020: 201,    cdpVerified: true,  notes: 'Small agricultural community along the South Platte River.' },

  // ── Unincorporated Communities ────────────────────────────────────────────
  { name: 'Snyder',           county: 'Morgan', type: 'Unincorporated Community', incorporated: false, population2020: 400, cdpVerified: false, notes: 'Small farming community in central Morgan County.' },
  { name: 'Goodrich',         county: 'Morgan', type: 'Unincorporated Community', incorporated: false, population2020: 200, cdpVerified: false, notes: 'Rural community in eastern Morgan County.' },
  { name: 'Orchard',          county: 'Morgan', type: 'Unincorporated Community', incorporated: false, population2020: 150, cdpVerified: false, notes: 'Small farming community along the South Platte River in eastern Morgan County.' },
  { name: 'Bijou',            county: 'Morgan', type: 'Unincorporated Community', incorporated: false, population2020: 100, cdpVerified: false, notes: 'Tiny agricultural community in southern Morgan County.' },
];

// ── Remaining 44 counties (Batches 5–13) ─────────────────────────────────────

export const COMMUNITIES_REMAINING: Community[] = [

  // ══════════════════════════════════════════════════════════════════════════
  // 21. ELBERT COUNTY  (pop 25,162) — seat: Kiowa
  //     4 incorporated · 2 unincorporated communities
  // ══════════════════════════════════════════════════════════════════════════
  { name: 'Elizabeth',  county: 'Elbert', type: 'Statutory Town',           incorporated: true,  population2020: 1502,  cdpVerified: true,  notes: 'Fastest-growing town in Elbert County; bedroom community for the Denver metro.' },
  { name: 'Kiowa',      county: 'Elbert', type: 'Statutory Town',           incorporated: true,  population2020: 794,   cdpVerified: true,  notes: 'County seat; small ranching community.' },
  { name: 'Simla',      county: 'Elbert', type: 'Statutory Town',           incorporated: true,  population2020: 608,   cdpVerified: true,  notes: 'Agricultural community in central Elbert County.' },
  { name: 'Elbert',     county: 'Elbert', type: 'Statutory Town',           incorporated: true,  population2020: 197,   cdpVerified: true,  notes: 'Historic ranching town; namesake of the county.' },
  { name: 'Agate',      county: 'Elbert', type: 'Unincorporated Community', incorporated: false, population2020: 200,   cdpVerified: false, notes: 'Small ranching community along I-70 in eastern Elbert County.' },
  { name: 'Matheson',   county: 'Elbert', type: 'Unincorporated Community', incorporated: false, population2020: 150,   cdpVerified: false, notes: 'Tiny farming and ranching settlement.' },

  // ══════════════════════════════════════════════════════════════════════════
  // 22. MONTEZUMA COUNTY  (pop 26,183) — seat: Cortez
  //     3 incorporated · 1 CDP · 2 unincorporated communities
  // ══════════════════════════════════════════════════════════════════════════
  { name: 'Cortez',         county: 'Montezuma', type: 'Home Rule City',           incorporated: true,  population2020: 8903,  cdpVerified: true,  notes: 'County seat and largest city; gateway to Mesa Verde National Park and Ancestral Puebloan sites.' },
  { name: 'Mancos',         county: 'Montezuma', type: 'Statutory Town',           incorporated: true,  population2020: 1373,  cdpVerified: true,  notes: 'Historic town at the foot of Mesa Verde; ranching and tourism.' },
  { name: 'Dolores',        county: 'Montezuma', type: 'Statutory Town',           incorporated: true,  population2020: 974,   cdpVerified: true,  notes: 'Small town on the Dolores River; McPhee Reservoir nearby.' },
  { name: 'Towaoc',         county: 'Montezuma', type: 'CDP',                      incorporated: false, population2020: 1057,  cdpVerified: true,  notes: 'Capital of the Ute Mountain Ute Tribe; home of Ute Mountain Casino.' },
  { name: 'Pleasant View',  county: 'Montezuma', type: 'CDP',                      incorporated: false, population2020: 451,   cdpVerified: true,  notes: 'Rural CDP in northwestern Montezuma County.' },
  { name: 'Yellow Jacket',  county: 'Montezuma', type: 'Unincorporated Community', incorporated: false, population2020: 200,   cdpVerified: false, notes: 'Small agricultural community in northern Montezuma County.' },
  { name: 'Lewis',          county: 'Montezuma', type: 'Unincorporated Community', incorporated: false, population2020: 300,   cdpVerified: false, notes: 'Farming community in southwestern Montezuma County.' },

  // ══════════════════════════════════════════════════════════════════════════
  // 23. ROUTT COUNTY  (pop 25,638) — seat: Steamboat Springs
  //     4 incorporated · 1 CDP · 2 unincorporated communities
  // ══════════════════════════════════════════════════════════════════════════
  { name: 'Steamboat Springs', county: 'Routt', type: 'Home Rule City',           incorporated: true,  population2020: 13081, cdpVerified: true,  notes: 'County seat and world-class ski resort city; renowned for Champagne Powder snow and Old Town hot springs.' },
  { name: 'Hayden',            county: 'Routt', type: 'Statutory Town',           incorporated: true,  population2020: 1999,  cdpVerified: true,  notes: 'Agricultural and energy town; Yampa Valley Regional Airport nearby.' },
  { name: 'Oak Creek',         county: 'Routt', type: 'Statutory Town',           incorporated: true,  population2020: 1017,  cdpVerified: true,  notes: 'Former coal mining town south of Steamboat Springs.' },
  { name: 'Yampa',             county: 'Routt', type: 'Statutory Town',           incorporated: true,  population2020: 433,   cdpVerified: true,  notes: 'Small ranching community on the Yampa River.' },
  { name: 'Stagecoach',        county: 'Routt', type: 'CDP',                      incorporated: false, population2020: 567,   cdpVerified: true,  notes: 'Reservoir community south of Steamboat Springs; popular for boating.' },
  { name: 'Milner',            county: 'Routt', type: 'Unincorporated Community', incorporated: false, population2020: 150,   cdpVerified: false, notes: 'Small ranching community along the Yampa River.' },
  { name: 'Clark',             county: 'Routt', type: 'Unincorporated Community', incorporated: false, population2020: 200,   cdpVerified: false, notes: 'Rural community north of Steamboat Springs; gateway to Mount Zirkel Wilderness.' },

  // ══════════════════════════════════════════════════════════════════════════
  // 24. TELLER COUNTY  (pop 24,794) — seat: Cripple Creek
  //     4 incorporated · 2 CDPs
  // ══════════════════════════════════════════════════════════════════════════
  { name: 'Woodland Park',       county: 'Teller', type: 'Home Rule City',  incorporated: true,  population2020: 8083,  cdpVerified: true,  notes: 'Largest city; "City Above the Clouds" at 8,465 ft; bedroom community for Colorado Springs.' },
  { name: 'Cripple Creek',       county: 'Teller', type: 'Home Rule City',  incorporated: true,  population2020: 1189,  cdpVerified: true,  notes: 'County seat; historic gold mining district now featuring limited-stakes casinos.' },
  { name: 'Victor',              county: 'Teller', type: 'Home Rule City',  incorporated: true,  population2020: 396,   cdpVerified: true,  notes: 'Historic mining town adjacent to Cripple Creek; known as the "City of Mines."' },
  { name: 'Green Mountain Falls', county: 'Teller', type: 'Statutory Town', incorporated: true,  population2020: 865,   cdpVerified: true,  notes: 'Small mountain community in Ute Pass; straddles El Paso and Teller county lines.' },
  { name: 'Divide',              county: 'Teller', type: 'CDP',             incorporated: false, population2020: 1140,  cdpVerified: true,  notes: 'Unincorporated community at the junction of US 24 and CO 67; gateway to Cripple Creek.' },
  { name: 'Florissant',          county: 'Teller', type: 'CDP',             incorporated: false, population2020: 1047,  cdpVerified: true,  notes: 'Near Florissant Fossil Beds National Monument; ranching and outdoor recreation.' },

  // ══════════════════════════════════════════════════════════════════════════
  // 25. CHAFFEE COUNTY  (pop 20,356) — seat: Salida
  //     3 incorporated · 2 unincorporated communities
  // ══════════════════════════════════════════════════════════════════════════
  { name: 'Salida',         county: 'Chaffee', type: 'Home Rule City',           incorporated: true,  population2020: 5765,  cdpVerified: true,  notes: 'County seat on the Arkansas River; whitewater rafting, arts community, and Monarch Ski Area gateway.' },
  { name: 'Buena Vista',    county: 'Chaffee', type: 'Statutory Town',           incorporated: true,  population2020: 3168,  cdpVerified: true,  notes: 'Outdoor recreation hub with access to 14ers, Arkansas River rafting, and Collegiate Peaks Wilderness.' },
  { name: 'Poncha Springs', county: 'Chaffee', type: 'Statutory Town',           incorporated: true,  population2020: 1012,  cdpVerified: true,  notes: 'Junction of US 285 and US 50; rapidly growing bedroom community.' },
  { name: 'Nathrop',        county: 'Chaffee', type: 'Unincorporated Community', incorporated: false, population2020: 300,   cdpVerified: false, notes: 'Small community on the Arkansas River; Mount Princeton Hot Springs nearby.' },
  { name: 'Maysville',      county: 'Chaffee', type: 'Unincorporated Community', incorporated: false, population2020: 100,   cdpVerified: false, notes: 'Tiny community on US 50 at the foot of Monarch Pass.' },

  // ══════════════════════════════════════════════════════════════════════════
  // 26. LOGAN COUNTY  (pop 21,928) — seat: Sterling
  //     5 incorporated · 1 unincorporated community
  // ══════════════════════════════════════════════════════════════════════════
  { name: 'Sterling',  county: 'Logan', type: 'Home Rule City',           incorporated: true,  population2020: 14360, cdpVerified: true,  notes: 'County seat; largest city on the northeastern plains; Overland Trail Museum; sugar beet processing.' },
  { name: 'Fleming',   county: 'Logan', type: 'Statutory Town',           incorporated: true,  population2020: 332,   cdpVerified: true,  notes: 'Small agricultural community in eastern Logan County.' },
  { name: 'Merino',    county: 'Logan', type: 'Statutory Town',           incorporated: true,  population2020: 235,   cdpVerified: true,  notes: 'Riverside community on the South Platte River.' },
  { name: 'Iliff',     county: 'Logan', type: 'Statutory Town',           incorporated: true,  population2020: 249,   cdpVerified: true,  notes: 'Small town on the South Platte River; John Wesley Iliff cattle empire heritage.' },
  { name: 'Crook',     county: 'Logan', type: 'Statutory Town',           incorporated: true,  population2020: 92,    cdpVerified: true,  notes: 'Tiny agricultural town in eastern Logan County.' },
  { name: 'Atwood',    county: 'Logan', type: 'Unincorporated Community', incorporated: false, population2020: 150,   cdpVerified: false, notes: 'Small community in southern Logan County.' },

  // ══════════════════════════════════════════════════════════════════════════
  // 27. GUNNISON COUNTY  (pop 17,462) — seat: Gunnison
  //     4 incorporated · 2 unincorporated communities
  // ══════════════════════════════════════════════════════════════════════════
  { name: 'Gunnison',          county: 'Gunnison', type: 'Statutory City',           incorporated: true,  population2020: 6680,  cdpVerified: true,  notes: 'County seat; home of Western Colorado University; gateway to Crested Butte and Black Canyon.' },
  { name: 'Crested Butte',     county: 'Gunnison', type: 'Home Rule Town',           incorporated: true,  population2020: 1726,  cdpVerified: true,  notes: 'Historic mining turned ski-resort town at 8,885 ft; wildflower capital of Colorado.' },
  { name: 'Mount Crested Butte', county: 'Gunnison', type: 'Home Rule Town',         incorporated: true,  population2020: 882,   cdpVerified: true,  notes: 'Ski resort village adjacent to Crested Butte; home of Crested Butte Mountain Resort base area.' },
  { name: 'Marble',             county: 'Gunnison', type: 'Statutory Town',           incorporated: true,  population2020: 131,   cdpVerified: true,  notes: 'Historic quarry town; marble used in Lincoln Memorial and Tomb of the Unknown Soldier.' },
  { name: 'Almont',             county: 'Gunnison', type: 'Unincorporated Community', incorporated: false, population2020: 250,   cdpVerified: false, notes: 'Confluence of East and Taylor rivers; popular fly-fishing destination.' },
  { name: 'Parlin',             county: 'Gunnison', type: 'Unincorporated Community', incorporated: false, population2020: 100,   cdpVerified: false, notes: 'Tiny ranching community in the Gunnison Valley.' },

  // ══════════════════════════════════════════════════════════════════════════
  // 28. PITKIN COUNTY  (pop 17,767) — seat: Aspen
  //     2 incorporated · 2 CDPs
  //     Note: Basalt is listed under Eagle County (Batch 3) as primary
  // ══════════════════════════════════════════════════════════════════════════
  { name: 'Aspen',            county: 'Pitkin', type: 'Home Rule City',  incorporated: true,  population2020: 7004,  cdpVerified: true,  notes: 'County seat; world-renowned ski and cultural resort; most expensive real estate in Colorado; Aspen Institute HQ.' },
  { name: 'Snowmass Village', county: 'Pitkin', type: 'Home Rule Town',  incorporated: true,  population2020: 3126,  cdpVerified: true,  notes: 'Ski resort town adjacent to Aspen; hosts Snowmass Ski Area and Jazz Aspen Snowmass.' },
  { name: 'Woody Creek',      county: 'Pitkin', type: 'CDP',             incorporated: false, population2020: 311,   cdpVerified: true,  notes: 'Rural CDP; former home of journalist Hunter S. Thompson.' },
  { name: 'Redstone',         county: 'Pitkin', type: 'CDP',             incorporated: false, population2020: 86,    cdpVerified: true,  notes: 'Historic coal company town on the Crystal River; Victorian inn and historic coke ovens.' },

  // ══════════════════════════════════════════════════════════════════════════
  // 29. LAS ANIMAS COUNTY  (pop 14,180) — seat: Trinidad
  //     3 incorporated · 2 unincorporated communities
  // ══════════════════════════════════════════════════════════════════════════
  { name: 'Trinidad',  county: 'Las Animas', type: 'Home Rule City',           incorporated: true,  population2020: 8210,  cdpVerified: true,  notes: 'County seat on the Purgatoire River near Raton Pass; historic coal and ranching town on the Santa Fe Trail.' },
  { name: 'Aguilar',   county: 'Las Animas', type: 'Statutory Town',           incorporated: true,  population2020: 610,   cdpVerified: true,  notes: 'Former coal mining town in northern Las Animas County.' },
  { name: 'Branson',   county: 'Las Animas', type: 'Statutory Town',           incorporated: true,  population2020: 67,    cdpVerified: true,  notes: 'Very small town in southeastern Las Animas County near the New Mexico border.' },
  { name: 'Ludlow',    county: 'Las Animas', type: 'Unincorporated Community', incorporated: false, population2020: 100,   cdpVerified: false, notes: 'Site of the 1914 Ludlow Massacre during the Colorado coal miners\' strike; now a national monument.' },
  { name: 'Weston',    county: 'Las Animas', type: 'Unincorporated Community', incorporated: false, population2020: 150,   cdpVerified: false, notes: 'Small community in the Purgatoire Valley south of Trinidad.' },

  // ══════════════════════════════════════════════════════════════════════════
  // 30. OTERO COUNTY  (pop 18,278) — seat: La Junta
  //     6 incorporated
  // ══════════════════════════════════════════════════════════════════════════
  { name: 'La Junta',    county: 'Otero', type: 'Home Rule City',  incorporated: true,  population2020: 6887,  cdpVerified: true,  notes: 'County seat on the Arkansas River; Bent\'s Old Fort NHS nearby; regional agricultural trade center.' },
  { name: 'Rocky Ford',  county: 'Otero', type: 'Home Rule City',  incorporated: true,  population2020: 3640,  cdpVerified: true,  notes: 'Famous for Rocky Ford cantaloupes and watermelons; agricultural community on the Arkansas River.' },
  { name: 'Fowler',      county: 'Otero', type: 'Statutory Town',  incorporated: true,  population2020: 1181,  cdpVerified: true,  notes: 'Small agricultural town west of La Junta.' },
  { name: 'Swink',       county: 'Otero', type: 'Statutory Town',  incorporated: true,  population2020: 652,   cdpVerified: true,  notes: 'Small agricultural community on the Arkansas River.' },
  { name: 'Manzanola',   county: 'Otero', type: 'Statutory Town',  incorporated: true,  population2020: 459,   cdpVerified: true,  notes: 'Small town on the Arkansas River corridor.' },
  { name: 'Cheraw',      county: 'Otero', type: 'Statutory Town',  incorporated: true,  population2020: 219,   cdpVerified: true,  notes: 'Tiny agricultural community in eastern Otero County.' },

  // ══════════════════════════════════════════════════════════════════════════
  // 31. GRAND COUNTY  (pop 15,734) — seat: Hot Sulphur Springs
  //     6 incorporated · 1 CDP · 1 unincorporated community
  // ══════════════════════════════════════════════════════════════════════════
  { name: 'Granby',             county: 'Grand', type: 'Statutory Town',           incorporated: true,  population2020: 2007,  cdpVerified: true,  notes: 'Largest town in Grand County; gateway to Rocky Mountain National Park west entrance and Lake Granby.' },
  { name: 'Kremmling',          county: 'Grand', type: 'Statutory Town',           incorporated: true,  population2020: 1622,  cdpVerified: true,  notes: 'Junction of US 40 and CO 9; ranching and outdoor recreation hub at the confluence of the Colorado and Blue rivers.' },
  { name: 'Hot Sulphur Springs', county: 'Grand', type: 'Statutory Town',          incorporated: true,  population2020: 711,   cdpVerified: true,  notes: 'County seat; historic hot springs resort community on the Colorado River.' },
  { name: 'Fraser',             county: 'Grand', type: 'Home Rule Town',           incorporated: true,  population2020: 1234,  cdpVerified: true,  notes: 'Mountain community near Winter Park; frequently among the coldest spots in the contiguous US.' },
  { name: 'Winter Park',        county: 'Grand', type: 'Statutory Town',           incorporated: true,  population2020: 999,   cdpVerified: true,  notes: 'Ski resort town adjacent to Winter Park Resort; part of the Winter Park–Fraser valley.' },
  { name: 'Grand Lake',         county: 'Grand', type: 'Statutory Town',           incorporated: true,  population2020: 471,   cdpVerified: true,  notes: 'On the shore of Colorado\'s largest natural lake; west entrance to Rocky Mountain National Park.' },
  { name: 'Tabernash',          county: 'Grand', type: 'CDP',                      incorporated: false, population2020: 479,   cdpVerified: true,  notes: 'Residential community between Fraser and Granby.' },
  { name: 'Parshall',           county: 'Grand', type: 'Unincorporated Community', incorporated: false, population2020: 100,   cdpVerified: false, notes: 'Tiny ranching community on the Colorado River.' },

  // ══════════════════════════════════════════════════════════════════════════
  // 32. ARCHULETA COUNTY  (pop 14,029) — seat: Pagosa Springs
  //     1 incorporated · 1 CDP · 2 unincorporated communities
  // ══════════════════════════════════════════════════════════════════════════
  { name: 'Pagosa Springs',  county: 'Archuleta', type: 'Home Rule Town',           incorporated: true,  population2020: 1884,  cdpVerified: true,  notes: 'County seat; world\'s deepest geothermal hot springs; gateway to Wolf Creek Ski Area and San Juan National Forest.' },
  { name: 'Arboles',         county: 'Archuleta', type: 'CDP',                      incorporated: false, population2020: 461,   cdpVerified: true,  notes: 'Community near Navajo State Park and Navajo Reservoir on the New Mexico border.' },
  { name: 'Pagosa Junction', county: 'Archuleta', type: 'Unincorporated Community', incorporated: false, population2020: 150,   cdpVerified: false, notes: 'Small community along the San Juan River south of Pagosa Springs.' },
  { name: 'Chromo',          county: 'Archuleta', type: 'Unincorporated Community', incorporated: false, population2020: 100,   cdpVerified: false, notes: 'Rural community in southern Archuleta County near the New Mexico border.' },

  // ══════════════════════════════════════════════════════════════════════════
  // 33. MOFFAT COUNTY  (pop 13,285) — seat: Craig
  //     2 incorporated · 2 unincorporated communities
  // ══════════════════════════════════════════════════════════════════════════
  { name: 'Craig',     county: 'Moffat', type: 'Home Rule City',           incorporated: true,  population2020: 9098,  cdpVerified: true,  notes: 'County seat; former coal energy hub on the Yampa River; transitioning economy as power plants close.' },
  { name: 'Dinosaur',  county: 'Moffat', type: 'Statutory Town',           incorporated: true,  population2020: 339,   cdpVerified: true,  notes: 'Gateway to Dinosaur National Monument; streets named after dinosaur species.' },
  { name: 'Maybell',   county: 'Moffat', type: 'Unincorporated Community', incorporated: false, population2020: 100,   cdpVerified: false, notes: 'Small ranching community on US 40 between Craig and Dinosaur.' },
  { name: 'Hamilton',  county: 'Moffat', type: 'Unincorporated Community', incorporated: false, population2020: 50,    cdpVerified: false, notes: 'Tiny agricultural settlement in central Moffat County.' },

  // ══════════════════════════════════════════════════════════════════════════
  // 34. ALAMOSA COUNTY  (pop 16,435) — seat: Alamosa
  //     2 incorporated · 1 CDP · 1 unincorporated community
  // ══════════════════════════════════════════════════════════════════════════
  { name: 'Alamosa',      county: 'Alamosa', type: 'Home Rule City',           incorporated: true,  population2020: 10015, cdpVerified: true,  notes: 'County seat and San Luis Valley hub; Adams State University; gateway to Great Sand Dunes National Park.' },
  { name: 'Hooper',       county: 'Alamosa', type: 'Statutory Town',           incorporated: true,  population2020: 104,   cdpVerified: true,  notes: 'Small agricultural town; UFO Watchtower roadside attraction.' },
  { name: 'Alamosa East', county: 'Alamosa', type: 'CDP',                      incorporated: false, population2020: 1631,  cdpVerified: true,  notes: 'Unincorporated residential area east of the city of Alamosa.' },
  { name: 'Mosca',        county: 'Alamosa', type: 'Unincorporated Community', incorporated: false, population2020: 200,   cdpVerified: false, notes: 'Small community near the Great Sand Dunes; potato and quinoa farming area.' },

  // ══════════════════════════════════════════════════════════════════════════
  // 35. PARK COUNTY  (pop 18,845) — seat: Fairplay
  //     2 incorporated · 1 CDP · 2 unincorporated communities
  // ══════════════════════════════════════════════════════════════════════════
  { name: 'Fairplay',  county: 'Park', type: 'Statutory Town',           incorporated: true,  population2020: 746,   cdpVerified: true,  notes: 'County seat at 9,953 ft; South Park City living history museum; historic gold dredging heritage.' },
  { name: 'Alma',      county: 'Park', type: 'Statutory Town',           incorporated: true,  population2020: 289,   cdpVerified: true,  notes: 'At ~10,578 ft, among the highest incorporated communities in North America; historic mining town.' },
  { name: 'Bailey',    county: 'Park', type: 'CDP',                      incorporated: false, population2020: 1983,  cdpVerified: true,  notes: 'Largest community in Park County; bedroom community on US 285 between Denver and South Park.' },
  { name: 'Hartsel',   county: 'Park', type: 'Unincorporated Community', incorporated: false, population2020: 300,   cdpVerified: false, notes: 'Crossroads in the heart of South Park basin; fishing on the South Platte headwaters.' },
  { name: 'Como',      county: 'Park', type: 'Unincorporated Community', incorporated: false, population2020: 150,   cdpVerified: false, notes: 'Historic railroad roundhouse site in South Park; very small permanent population.' },

  // ══════════════════════════════════════════════════════════════════════════
  // 36. RIO GRANDE COUNTY  (pop 11,390) — seat: Del Norte
  //     3 incorporated · 1 CDP
  // ══════════════════════════════════════════════════════════════════════════
  { name: 'Monte Vista', county: 'Rio Grande', type: 'Home Rule City',  incorporated: true,  population2020: 4382,  cdpVerified: true,  notes: 'Largest city in Rio Grande County; agricultural center of the San Luis Valley; sandhill crane migration viewing.' },
  { name: 'Del Norte',   county: 'Rio Grande', type: 'Statutory Town',  incorporated: true,  population2020: 1559,  cdpVerified: true,  notes: 'County seat on the Rio Grande; gateway to the San Juan Mountains and Wolf Creek Pass.' },
  { name: 'Center',      county: 'Rio Grande', counties: ['Rio Grande', 'Saguache'], type: 'Statutory Town', incorporated: true, population2020: 2398, cdpVerified: true, notes: 'Potato-farming center straddling the Rio Grande–Saguache county line; large Hispanic agricultural workforce.' },
  { name: 'South Fork',  county: 'Rio Grande', type: 'CDP',             incorporated: false, population2020: 686,   cdpVerified: true,  notes: 'Tourism community at the confluence of the South Fork and Rio Grande rivers; skiing and fishing.' },

  // ══════════════════════════════════════════════════════════════════════════
  // 37. PROWERS COUNTY  (pop 12,172) — seat: Lamar
  //     4 incorporated · 1 unincorporated community
  // ══════════════════════════════════════════════════════════════════════════
  { name: 'Lamar',    county: 'Prowers', type: 'Home Rule City',           incorporated: true,  population2020: 7637,  cdpVerified: true,  notes: 'County seat on the Arkansas River; agricultural trade center and US 50 corridor hub.' },
  { name: 'Holly',    county: 'Prowers', type: 'Statutory Town',           incorporated: true,  population2020: 998,   cdpVerified: true,  notes: 'Small agricultural town near the Kansas border on the Arkansas River.' },
  { name: 'Granada',  county: 'Prowers', type: 'Statutory Town',           incorporated: true,  population2020: 537,   cdpVerified: true,  notes: 'Near Amache (Granada War Relocation Center) — WWII Japanese American incarceration site, now a National Historic Site.' },
  { name: 'Wiley',    county: 'Prowers', type: 'Statutory Town',           incorporated: true,  population2020: 465,   cdpVerified: true,  notes: 'Small agricultural community west of Lamar.' },
  { name: 'Hasty',    county: 'Prowers', type: 'Unincorporated Community', incorporated: false, population2020: 100,   cdpVerified: false, notes: 'Tiny community along the Arkansas River; John Martin Reservoir State Park nearby.' },

  // ══════════════════════════════════════════════════════════════════════════
  // 38. CONEJOS COUNTY  (pop 7,975) — seat: Conejos
  //     5 incorporated · 1 unincorporated community
  // ══════════════════════════════════════════════════════════════════════════
  { name: 'Manassa',   county: 'Conejos', type: 'Statutory Town',           incorporated: true,  population2020: 940,   cdpVerified: true,  notes: 'Birthplace of boxer Jack Dempsey; predominantly Hispanic community in the San Luis Valley.' },
  { name: 'Sanford',   county: 'Conejos', type: 'Statutory Town',           incorporated: true,  population2020: 850,   cdpVerified: true,  notes: 'Agricultural community in the Conejos River Valley.' },
  { name: 'Antonito',  county: 'Conejos', type: 'Statutory Town',           incorporated: true,  population2020: 728,   cdpVerified: true,  notes: 'Southern terminus of the Cumbres & Toltec Scenic Railroad; historic narrow-gauge route to New Mexico.' },
  { name: 'La Jara',   county: 'Conejos', type: 'Statutory Town',           incorporated: true,  population2020: 486,   cdpVerified: true,  notes: 'Agricultural community in the Conejos River Valley.' },
  { name: 'Romeo',     county: 'Conejos', type: 'Statutory Town',           incorporated: true,  population2020: 356,   cdpVerified: true,  notes: 'Small Hispanic community in southern Conejos County.' },
  { name: 'Capulin',   county: 'Conejos', type: 'Unincorporated Community', incorporated: false, population2020: 150,   cdpVerified: false, notes: 'Small rural community in southern Conejos County near the New Mexico border.' },

  // ══════════════════════════════════════════════════════════════════════════
  // 39. CLEAR CREEK COUNTY  (pop 9,700) — seat: Georgetown
  //     4 incorporated · 1 CDP
  // ══════════════════════════════════════════════════════════════════════════
  { name: 'Idaho Springs',  county: 'Clear Creek', type: 'Home Rule City',   incorporated: true,  population2020: 1717,  cdpVerified: true,  notes: 'Historic gold mining town on I-70; gateway to Mount Blue Sky (Evans) Scenic Byway.' },
  { name: 'Georgetown',     county: 'Clear Creek', type: 'Statutory City',   incorporated: true,  population2020: 1097,  cdpVerified: true,  notes: 'County seat; exceptionally well-preserved Victorian silver mining town; Georgetown Loop Railroad.' },
  { name: 'Silver Plume',   county: 'Clear Creek', type: 'Statutory Town',   incorporated: true,  population2020: 228,   cdpVerified: true,  notes: 'Historic silver mining town adjacent to Georgetown; upper terminus of the Georgetown Loop.' },
  { name: 'Empire',         county: 'Clear Creek', type: 'Statutory Town',   incorporated: true,  population2020: 305,   cdpVerified: true,  notes: 'Small mountain town on US 40 at the foot of Berthoud Pass.' },
  { name: 'Dumont',         county: 'Clear Creek', type: 'CDP',              incorporated: false, population2020: 338,   cdpVerified: true,  notes: 'Residential community along I-70 in Clear Creek Canyon.' },

  // ══════════════════════════════════════════════════════════════════════════
  // 40. YUMA COUNTY  (pop 10,066) — seat: Wray
  //     4 incorporated · 1 unincorporated community
  // ══════════════════════════════════════════════════════════════════════════
  { name: 'Yuma',    county: 'Yuma', type: 'Home Rule City',           incorporated: true,  population2020: 3416,  cdpVerified: true,  notes: 'Largest city in Yuma County; agricultural hub for dryland farming on the eastern plains.' },
  { name: 'Wray',    county: 'Yuma', type: 'Statutory City',           incorporated: true,  population2020: 2339,  cdpVerified: true,  notes: 'County seat on the Republican River; Arikaree Breaks nearby; agricultural community.' },
  { name: 'Eckley',  county: 'Yuma', type: 'Statutory Town',           incorporated: true,  population2020: 204,   cdpVerified: true,  notes: 'Small farming community in northern Yuma County.' },
  { name: 'Idalia',  county: 'Yuma', type: 'Statutory Town',           incorporated: true,  population2020: 105,   cdpVerified: true,  notes: 'Tiny agricultural community in central Yuma County.' },
  { name: 'Joes',    county: 'Yuma', type: 'Unincorporated Community', incorporated: false, population2020: 50,    cdpVerified: false, notes: 'Very small ranching community in Yuma County.' },

  // ══════════════════════════════════════════════════════════════════════════
  // 41. KIT CARSON COUNTY  (pop 7,098) — seat: Burlington
  //     5 incorporated
  // ══════════════════════════════════════════════════════════════════════════
  { name: 'Burlington',  county: 'Kit Carson', type: 'Home Rule City',  incorporated: true, population2020: 4254, cdpVerified: true, notes: 'County seat on US 24; Old Town Museum with historic carousel; eastern Colorado agricultural hub.' },
  { name: 'Stratton',    county: 'Kit Carson', type: 'Statutory Town',  incorporated: true, population2020: 664,  cdpVerified: true, notes: 'Small town on I-70 in eastern Kit Carson County.' },
  { name: 'Flagler',     county: 'Kit Carson', type: 'Statutory Town',  incorporated: true, population2020: 608,  cdpVerified: true, notes: 'Small agricultural community in central Kit Carson County.' },
  { name: 'Bethune',     county: 'Kit Carson', type: 'Statutory Town',  incorporated: true, population2020: 166,  cdpVerified: true, notes: 'Small ranching and farming community in Kit Carson County.' },
  { name: 'Seibert',     county: 'Kit Carson', type: 'Statutory Town',  incorporated: true, population2020: 163,  cdpVerified: true, notes: 'Tiny agricultural community on the eastern plains.' },

  // ══════════════════════════════════════════════════════════════════════════
  // 42. CUSTER COUNTY  (pop 4,640) — seat: Westcliffe
  //     2 incorporated · 2 unincorporated communities
  // ══════════════════════════════════════════════════════════════════════════
  { name: 'Silver Cliff', county: 'Custer', type: 'Statutory Town',           incorporated: true,  population2020: 596,   cdpVerified: true,  notes: 'Adjacent to Westcliffe; historic silver mining town; the two communities form a combined area.' },
  { name: 'Westcliffe',   county: 'Custer', type: 'Statutory Town',           incorporated: true,  population2020: 568,   cdpVerified: true,  notes: 'County seat in the Wet Mountain Valley; International Dark Sky Community designation; stunning Sangre de Cristo views.' },
  { name: 'Wetmore',      county: 'Custer', type: 'Unincorporated Community', incorporated: false, population2020: 150,   cdpVerified: false, notes: 'Rural community in the eastern foothills of Custer County.' },
  { name: 'Querida',      county: 'Custer', type: 'Unincorporated Community', incorporated: false, population2020: 100,   cdpVerified: false, notes: 'Small community in northern Custer County.' },

  // ══════════════════════════════════════════════════════════════════════════
  // 43. HUERFANO COUNTY  (pop 6,897) — seat: Walsenburg
  //     2 incorporated · 2 unincorporated communities
  // ══════════════════════════════════════════════════════════════════════════
  { name: 'Walsenburg',  county: 'Huerfano', type: 'Home Rule City',           incorporated: true,  population2020: 2944,  cdpVerified: true,  notes: 'County seat at the foot of the Spanish Peaks; I-25 corridor community; former coal mining heritage.' },
  { name: 'La Veta',     county: 'Huerfano', type: 'Statutory Town',           incorporated: true,  population2020: 815,   cdpVerified: true,  notes: 'Scenic arts community at the base of the Spanish Peaks; gateway to La Veta Pass.' },
  { name: 'Gardner',     county: 'Huerfano', type: 'Unincorporated Community', incorporated: false, population2020: 200,   cdpVerified: false, notes: 'Small ranching community in the Huerfano River Valley beneath the Sangre de Cristos.' },
  { name: 'Cuchara',     county: 'Huerfano', type: 'Unincorporated Community', incorporated: false, population2020: 100,   cdpVerified: false, notes: 'Small mountain community in the Spanish Peaks area; former ski area.' },

  // ══════════════════════════════════════════════════════════════════════════
  // 44. GILPIN COUNTY  (pop 6,243) — seat: Central City
  //     2 incorporated · 1 CDP · 1 unincorporated community
  // ══════════════════════════════════════════════════════════════════════════
  { name: 'Central City',  county: 'Gilpin', type: 'Home Rule City',           incorporated: true,  population2020: 749,   cdpVerified: true,  notes: 'County seat; historic gold rush city; limited-stakes casino gaming since 1991; National Historic Landmark District.' },
  { name: 'Black Hawk',    county: 'Gilpin', type: 'Home Rule City',           incorporated: true,  population2020: 152,   cdpVerified: true,  notes: 'Adjacent to Central City; Colorado\'s major casino destination; Isle of Capri and Ameristar properties.' },
  { name: 'Rollinsville',  county: 'Gilpin', type: 'CDP',                      incorporated: false, population2020: 186,   cdpVerified: true,  notes: 'Small residential community at the foot of Rollins Pass road.' },
  { name: 'Tolland',       county: 'Gilpin', type: 'Unincorporated Community', incorporated: false, population2020: 50,    cdpVerified: false, notes: 'Historic rail stop near the Moffat Tunnel east portal.' },

  // ══════════════════════════════════════════════════════════════════════════
  // 45. RIO BLANCO COUNTY  (pop 6,326) — seat: Meeker
  //     2 incorporated · 1 unincorporated community
  // ══════════════════════════════════════════════════════════════════════════
  { name: 'Meeker',   county: 'Rio Blanco', type: 'Statutory Town',           incorporated: true,  population2020: 2475,  cdpVerified: true,  notes: 'County seat on the White River; site of the 1879 Meeker Massacre; oil shale country; elk hunting mecca.' },
  { name: 'Rangely',  county: 'Rio Blanco', type: 'Statutory Town',           incorporated: true,  population2020: 2365,  cdpVerified: true,  notes: 'Oil and gas production hub in the Piceance Basin; Colorado Northwestern Community College campus.' },
  { name: 'Dinosaur', county: 'Rio Blanco', type: 'Unincorporated Community', incorporated: false, population2020: 100,   cdpVerified: false, notes: 'Rural area near the Utah border; do not confuse with the incorporated Town of Dinosaur in Moffat County.' },

  // ══════════════════════════════════════════════════════════════════════════
  // 46. OURAY COUNTY  (pop 4,952) — seat: Ouray
  //     2 incorporated · 2 CDPs
  // ══════════════════════════════════════════════════════════════════════════
  { name: 'Ouray',            county: 'Ouray', type: 'Statutory City',  incorporated: true,  population2020: 1006,  cdpVerified: true,  notes: 'County seat; "Switzerland of America"; natural hot springs pool, ice climbing festival, Victorian mining architecture.' },
  { name: 'Ridgway',          county: 'Ouray', type: 'Statutory Town',  incorporated: true,  population2020: 1030,  cdpVerified: true,  notes: 'Gateway to the San Juan Skyway; Ridgway State Park reservoir; growing arts and outdoor recreation community.' },
  { name: 'Log Hill Village', county: 'Ouray', type: 'CDP',             incorporated: false, population2020: 886,   cdpVerified: true,  notes: 'Residential community on the mesa above Ridgway.' },
  { name: 'Colona',           county: 'Ouray', type: 'CDP',             incorporated: false, population2020: 314,   cdpVerified: true,  notes: 'Small community at the junction of US 550 and CO 90.' },

  // ══════════════════════════════════════════════════════════════════════════
  // 47. SAN MIGUEL COUNTY  (pop 8,179) — seat: Telluride
  //     4 incorporated · 1 unincorporated community
  // ══════════════════════════════════════════════════════════════════════════
  { name: 'Telluride',        county: 'San Miguel', type: 'Home Rule Town',           incorporated: true,  population2020: 2527,  cdpVerified: true,  notes: 'County seat; world-class ski resort and festival destination (film, bluegrass, jazz) in a box canyon at 8,750 ft.' },
  { name: 'Mountain Village', county: 'San Miguel', type: 'Statutory Town',           incorporated: true,  population2020: 1412,  cdpVerified: true,  notes: 'Ski-in/ski-out resort community connected to Telluride by free gondola.' },
  { name: 'Norwood',          county: 'San Miguel', type: 'Statutory Town',           incorporated: true,  population2020: 546,   cdpVerified: true,  notes: 'Agricultural community on the Uncompahgre Plateau; gateway to Telluride from the north.' },
  { name: 'Ophir',            county: 'San Miguel', type: 'Statutory Town',           incorporated: true,  population2020: 145,   cdpVerified: true,  notes: 'Historic mining town at the foot of Ophir Pass; very small incorporated community.' },
  { name: 'Placerville',      county: 'San Miguel', type: 'Unincorporated Community', incorporated: false, population2020: 100,   cdpVerified: false, notes: 'Small community on the San Miguel River en route to Telluride.' },

  // ══════════════════════════════════════════════════════════════════════════
  // 48. SAGUACHE COUNTY  (pop 6,897) — seat: Saguache
  //     4 incorporated · 1 unincorporated community
  // ══════════════════════════════════════════════════════════════════════════
  { name: 'Saguache',  county: 'Saguache', type: 'Statutory Town',           incorporated: true,  population2020: 483,   cdpVerified: true,  notes: 'County seat in the San Luis Valley; ranching and agriculture; gateway to the Saguache Mountains.' },
  { name: 'Moffat',    county: 'Saguache', type: 'Statutory Town',           incorporated: true,  population2020: 118,   cdpVerified: true,  notes: 'Tiny agricultural town in the San Luis Valley.' },
  { name: 'Crestone',  county: 'Saguache', type: 'Statutory Town',           incorporated: true,  population2020: 147,   cdpVerified: true,  notes: 'Spiritual and intentional community at the base of the Sangre de Cristo Mountains; numerous retreat centers and ashrams.' },
  { name: 'Center',    county: 'Saguache', counties: ['Saguache', 'Rio Grande'], type: 'Statutory Town', incorporated: true, population2020: 2398, cdpVerified: true, notes: 'Potato farming hub straddling the Saguache–Rio Grande county line; large Hispanic agricultural workforce.' },
  { name: 'Villa Grove', county: 'Saguache', type: 'Unincorporated Community', incorporated: false, population2020: 100, cdpVerified: false, notes: 'Small community at the north end of the San Luis Valley on US 285.' },

  // ══════════════════════════════════════════════════════════════════════════
  // 49. CROWLEY COUNTY  (pop 6,061) — seat: Ordway
  //     3 incorporated
  // ══════════════════════════════════════════════════════════════════════════
  { name: 'Ordway',        county: 'Crowley', type: 'Statutory Town', incorporated: true, population2020: 1209, cdpVerified: true, notes: 'County seat; agricultural community on the Arkansas River; sugar beet and melon farming.' },
  { name: 'Olney Springs', county: 'Crowley', type: 'Statutory Town', incorporated: true, population2020: 354,  cdpVerified: true, notes: 'Small town in western Crowley County on the Arkansas River.' },
  { name: 'Sugar City',    county: 'Crowley', type: 'Statutory Town', incorporated: true, population2020: 264,  cdpVerified: true, notes: 'Small community named for its sugar beet processing heritage.' },

  // ══════════════════════════════════════════════════════════════════════════
  // 50. LINCOLN COUNTY  (pop 5,701) — seat: Hugo
  //     4 incorporated · 1 unincorporated community
  // ══════════════════════════════════════════════════════════════════════════
  { name: 'Limon',   county: 'Lincoln', type: 'Statutory Town',           incorporated: true,  population2020: 1793,  cdpVerified: true,  notes: 'Crossroads of I-70 and US 24/US 40; eastern Colorado travel hub; notable tornado history.' },
  { name: 'Hugo',    county: 'Lincoln', type: 'Statutory Town',           incorporated: true,  population2020: 693,   cdpVerified: true,  notes: 'County seat; small ranching and farming community.' },
  { name: 'Arriba',  county: 'Lincoln', type: 'Statutory Town',           incorporated: true,  population2020: 283,   cdpVerified: true,  notes: 'Small community on I-70 in central Lincoln County.' },
  { name: 'Genoa',   county: 'Lincoln', type: 'Statutory Town',           incorporated: true,  population2020: 130,   cdpVerified: true,  notes: 'Tiny community near Genoa Tower, known for sweeping panoramic views.' },
  { name: 'Karval',  county: 'Lincoln', type: 'Unincorporated Community', incorporated: false, population2020: 50,    cdpVerified: false, notes: 'Very small ranching community in southern Lincoln County.' },

  // ══════════════════════════════════════════════════════════════════════════
  // 51. WASHINGTON COUNTY  (pop 4,908) — seat: Akron
  //     2 incorporated · 2 unincorporated communities
  // ══════════════════════════════════════════════════════════════════════════
  { name: 'Akron',    county: 'Washington', type: 'Statutory Town',           incorporated: true,  population2020: 1640,  cdpVerified: true,  notes: 'County seat; dryland farming community on the eastern plains.' },
  { name: 'Otis',     county: 'Washington', type: 'Statutory Town',           incorporated: true,  population2020: 440,   cdpVerified: true,  notes: 'Small agricultural community in central Washington County.' },
  { name: 'Woodrow',  county: 'Washington', type: 'Unincorporated Community', incorporated: false, population2020: 100,   cdpVerified: false, notes: 'Tiny farming settlement in Washington County.' },
  { name: 'Cope',     county: 'Washington', type: 'Unincorporated Community', incorporated: false, population2020: 50,    cdpVerified: false, notes: 'Very small community in eastern Washington County.' },

  // ══════════════════════════════════════════════════════════════════════════
  // 52. BENT COUNTY  (pop 5,577) — seat: Las Animas
  //     1 incorporated · 2 unincorporated communities
  // ══════════════════════════════════════════════════════════════════════════
  { name: 'Las Animas',  county: 'Bent', type: 'Home Rule City',           incorporated: true,  population2020: 2410,  cdpVerified: true,  notes: 'County seat on the Arkansas River near Bent\'s Fort area; Amache (WWII internment site) nearby.' },
  { name: 'McClave',     county: 'Bent', type: 'Unincorporated Community', incorporated: false, population2020: 200,   cdpVerified: false, notes: 'Small agricultural community on the Arkansas River.' },
  { name: 'Hasty',       county: 'Bent', type: 'Unincorporated Community', incorporated: false, population2020: 100,   cdpVerified: false, notes: 'Small community near John Martin Reservoir State Park.' },

  // ══════════════════════════════════════════════════════════════════════════
  // 53. JACKSON COUNTY  (pop 1,392) — seat: Walden
  //     1 incorporated · 2 unincorporated communities
  // ══════════════════════════════════════════════════════════════════════════
  { name: 'Walden',   county: 'Jackson', type: 'Statutory Town',           incorporated: true,  population2020: 583,   cdpVerified: true,  notes: 'County seat and only incorporated place in Jackson County; "Moose Viewing Capital of Colorado"; North Park ranching community.' },
  { name: 'Gould',    county: 'Jackson', type: 'Unincorporated Community', incorporated: false, population2020: 50,    cdpVerified: false, notes: 'Tiny ranching community in North Park near Colorado State Forest State Park.' },
  { name: 'Cowdrey',  county: 'Jackson', type: 'Unincorporated Community', incorporated: false, population2020: 50,    cdpVerified: false, notes: 'Small ranching settlement in North Park along CO 125.' },

  // ══════════════════════════════════════════════════════════════════════════
  // 54. COSTILLA COUNTY  (pop 3,887) — seat: San Luis
  //     2 incorporated · 1 CDP · 1 unincorporated community
  // ══════════════════════════════════════════════════════════════════════════
  { name: 'San Luis',    county: 'Costilla', type: 'Statutory Town',           incorporated: true,  population2020: 612,   cdpVerified: true,  notes: 'County seat; established 1851 as the oldest continually inhabited town in Colorado; deep Hispano heritage.' },
  { name: 'Blanca',      county: 'Costilla', type: 'Statutory Town',           incorporated: true,  population2020: 414,   cdpVerified: true,  notes: 'Community at the base of Blanca Peak (14,351 ft), Colorado\'s 4th highest summit.' },
  { name: 'Fort Garland', county: 'Costilla', type: 'CDP',                     incorporated: false, population2020: 450,   cdpVerified: true,  notes: 'Historic military post site; Fort Garland Museum; community near La Veta Pass.' },
  { name: 'San Pablo',   county: 'Costilla', type: 'Unincorporated Community', incorporated: false, population2020: 150,   cdpVerified: false, notes: 'Small Hispano community along the Culebra River.' },

  // ══════════════════════════════════════════════════════════════════════════
  // 55. DOLORES COUNTY  (pop 2,126) — seat: Dove Creek
  //     2 incorporated
  // ══════════════════════════════════════════════════════════════════════════
  { name: 'Dove Creek',  county: 'Dolores', type: 'Statutory Town', incorporated: true, population2020: 711, cdpVerified: true, notes: 'County seat; "Pinto Bean Capital of the World"; pinto bean farming and ranching community.' },
  { name: 'Rico',        county: 'Dolores', type: 'Statutory Town', incorporated: true, population2020: 242, cdpVerified: true, notes: 'Historic silver and gold mining town at 8,827 ft; scenic mountain setting.' },

  // ══════════════════════════════════════════════════════════════════════════
  // 56. KIOWA COUNTY  (pop 1,406) — seat: Eads
  //     2 incorporated · 1 unincorporated community
  // ══════════════════════════════════════════════════════════════════════════
  { name: 'Eads',    county: 'Kiowa', type: 'Statutory Town',           incorporated: true,  population2020: 614,   cdpVerified: true,  notes: 'County seat; dryland farming community; Sand Creek Massacre National Historic Site nearby.' },
  { name: 'Haswell', county: 'Kiowa', type: 'Statutory Town',           incorporated: true,  population2020: 65,    cdpVerified: true,  notes: 'One of the smallest incorporated towns in Colorado.' },
  { name: 'Towner',  county: 'Kiowa', type: 'Unincorporated Community', incorporated: false, population2020: 50,    cdpVerified: false, notes: 'Tiny plains community in southern Kiowa County.' },

  // ══════════════════════════════════════════════════════════════════════════
  // 57. HINSDALE COUNTY  (pop 820) — seat: Lake City
  //     1 incorporated · 1 unincorporated community
  // ══════════════════════════════════════════════════════════════════════════
  { name: 'Lake City',          county: 'Hinsdale', type: 'Statutory Town',           incorporated: true,  population2020: 381,   cdpVerified: true,  notes: 'County seat and only incorporated place; historic mining town at 8,671 ft; Alferd Packer notoriety; very small permanent population.' },
  { name: 'Lake San Cristobal', county: 'Hinsdale', type: 'Unincorporated Community', incorporated: false, population2020: 100,   cdpVerified: false, notes: 'Small resort community on Colorado\'s second-largest natural lake.' },

  // ══════════════════════════════════════════════════════════════════════════
  // 58. MINERAL COUNTY  (pop 822) — seat: Creede
  //     1 incorporated · 1 unincorporated community
  // ══════════════════════════════════════════════════════════════════════════
  { name: 'Creede',          county: 'Mineral', type: 'Statutory Town',           incorporated: true,  population2020: 290,   cdpVerified: true,  notes: 'County seat and only incorporated place; famous silver mining boomtown; Creede Repertory Theatre; very small permanent population.' },
  { name: 'Wagon Wheel Gap', county: 'Mineral', type: 'Unincorporated Community', incorporated: false, population2020: 100,   cdpVerified: false, notes: 'Historic community on the Rio Grande; former hot springs resort area.' },

  // ══════════════════════════════════════════════════════════════════════════
  // 59. SEDGWICK COUNTY  (pop 2,248) — seat: Julesburg
  //     3 incorporated
  // ══════════════════════════════════════════════════════════════════════════
  { name: 'Julesburg',  county: 'Sedgwick', type: 'Statutory City', incorporated: true, population2020: 1107, cdpVerified: true, notes: 'County seat; only city in Sedgwick County; northeast corner of Colorado; historic Pony Express and Overland Stage stop.' },
  { name: 'Ovid',       county: 'Sedgwick', type: 'Statutory Town', incorporated: true, population2020: 305,  cdpVerified: true, notes: 'Small farming community in northern Sedgwick County.' },
  { name: 'Sedgwick',   county: 'Sedgwick', type: 'Statutory Town', incorporated: true, population2020: 155,  cdpVerified: true, notes: 'Small agricultural community in eastern Sedgwick County.' },

  // ══════════════════════════════════════════════════════════════════════════
  // 60. PHILLIPS COUNTY  (pop 4,319) — seat: Holyoke
  //     2 incorporated · 1 unincorporated community
  // ══════════════════════════════════════════════════════════════════════════
  { name: 'Holyoke',  county: 'Phillips', type: 'Statutory City',           incorporated: true,  population2020: 2258,  cdpVerified: true,  notes: 'County seat; agricultural hub in the northeastern corner of Colorado; Phillips County Museum.' },
  { name: 'Haxtun',   county: 'Phillips', type: 'Statutory Town',           incorporated: true,  population2020: 978,   cdpVerified: true,  notes: 'Second-largest community in Phillips County; dryland farming community.' },
  { name: 'Amherst',  county: 'Phillips', type: 'Unincorporated Community', incorporated: false, population2020: 50,    cdpVerified: false, notes: 'Very small community in northern Phillips County.' },

  // ══════════════════════════════════════════════════════════════════════════
  // 61. BACA COUNTY  (pop 3,651) — seat: Springfield
  //     4 incorporated · 1 unincorporated community
  // ══════════════════════════════════════════════════════════════════════════
  { name: 'Springfield', county: 'Baca', type: 'Statutory Town',           incorporated: true,  population2020: 1318,  cdpVerified: true,  notes: 'County seat; southeastern Colorado agricultural community; sunflower and sorghum farming.' },
  { name: 'Walsh',       county: 'Baca', type: 'Statutory Town',           incorporated: true,  population2020: 649,   cdpVerified: true,  notes: 'Small community in central Baca County.' },
  { name: 'Campo',       county: 'Baca', type: 'Statutory Town',           incorporated: true,  population2020: 108,   cdpVerified: true,  notes: 'Tiny town in southeastern Baca County near the Oklahoma border.' },
  { name: 'Pritchett',   county: 'Baca', type: 'Statutory Town',           incorporated: true,  population2020: 108,   cdpVerified: true,  notes: 'Very small community in southern Baca County.' },
  { name: 'Two Buttes',  county: 'Baca', type: 'Unincorporated Community', incorporated: false, population2020: 50,    cdpVerified: false, notes: 'Tiny community near Two Buttes Reservoir in eastern Baca County.' },

  // ══════════════════════════════════════════════════════════════════════════
  // 62. SAN JUAN COUNTY  (pop 728) — seat: Silverton
  //     1 incorporated · 1 unincorporated community
  // ══════════════════════════════════════════════════════════════════════════
  { name: 'Silverton', county: 'San Juan', type: 'Statutory City',           incorporated: true,  population2020: 604,   cdpVerified: true,  notes: 'County seat and only incorporated place; historic silver mining town at 9,318 ft; terminus of the Durango & Silverton Narrow Gauge Railroad; National Historic Landmark District.' },
  { name: 'Eureka',    county: 'San Juan', type: 'Unincorporated Community', incorporated: false, population2020: 50,    cdpVerified: false, notes: 'Ghost town remnants northeast of Silverton in Cunningham Gulch; former silver mining camp.' },

  // ══════════════════════════════════════════════════════════════════════════
  // 63. CHEYENNE COUNTY  (pop 1,831) — seat: Cheyenne Wells
  //     2 incorporated · 1 unincorporated community
  // ══════════════════════════════════════════════════════════════════════════
  { name: 'Cheyenne Wells', county: 'Cheyenne', type: 'Statutory Town',           incorporated: true,  population2020: 868,   cdpVerified: true,  notes: 'County seat on US 40; sparsely populated eastern plains; dryland wheat and sorghum farming.' },
  { name: 'Kit Carson',     county: 'Cheyenne', type: 'Statutory Town',           incorporated: true,  population2020: 200,   cdpVerified: true,  notes: 'Small community named for frontier scout Kit Carson; not to be confused with Kit Carson County.' },
  { name: 'Wild Horse',     county: 'Cheyenne', type: 'Unincorporated Community', incorporated: false, population2020: 50,    cdpVerified: false, notes: 'Tiny ranching community in Cheyenne County.' },

  // ══════════════════════════════════════════════════════════════════════════
  // 64. LAKE COUNTY  (pop 7,859) — seat: Leadville
  //     1 incorporated · 2 CDPs · 1 unincorporated community
  // ══════════════════════════════════════════════════════════════════════════
  { name: 'Leadville',       county: 'Lake', type: 'Home Rule City',           incorporated: true,  population2020: 2879,  cdpVerified: true,  notes: 'County seat at 10,152 ft — the highest incorporated city in the United States; silver boom history; Tabor Opera House; Leadville 100 ultramarathon.' },
  { name: 'Leadville North', county: 'Lake', type: 'CDP',                      incorporated: false, population2020: 592,   cdpVerified: true,  notes: 'Residential CDP immediately north of Leadville city limits.' },
  { name: 'Twin Lakes',      county: 'Lake', type: 'CDP',                      incorporated: false, population2020: 260,   cdpVerified: true,  notes: 'Resort community on Twin Lakes Reservoir; trailhead for Mount Elbert — highest point in Colorado and the Rocky Mountains.' },
  { name: 'Malta',           county: 'Lake', type: 'Unincorporated Community', incorporated: false, population2020: 300,   cdpVerified: false, notes: 'Residential community south of Leadville on US 24.' },
];

// ── Combined export ───────────────────────────────────────────────────────────

export const ALL_COMMUNITIES: Community[] = [
  ...COMMUNITIES_BATCH1,
  ...COMMUNITIES_BATCH2,
  ...COMMUNITIES_BATCH3,
  ...COMMUNITIES_BATCH4,
  ...COMMUNITIES_REMAINING,
];

export const BATCH1_COUNTIES = ['El Paso', 'Denver', 'Arapahoe', 'Jefferson', 'Adams'] as const;
export const BATCH2_COUNTIES = ['Douglas', 'Larimer', 'Weld', 'Boulder', 'Pueblo'] as const;
export const BATCH3_COUNTIES = ['Mesa', 'Broomfield', 'Garfield', 'La Plata', 'Eagle'] as const;
export const BATCH4_COUNTIES = ['Fremont', 'Montrose', 'Delta', 'Summit', 'Morgan'] as const;
export const REMAINING_COUNTIES = [
  'Elbert', 'Montezuma', 'Routt', 'Teller', 'Chaffee',
  'Logan', 'Gunnison', 'Pitkin', 'Las Animas', 'Otero',
  'Grand', 'Archuleta', 'Moffat', 'Alamosa', 'Park',
  'Rio Grande', 'Prowers', 'Conejos', 'Clear Creek', 'Yuma',
  'Kit Carson', 'Custer', 'Huerfano', 'Gilpin', 'Rio Blanco',
  'Ouray', 'San Miguel', 'Saguache', 'Crowley', 'Lincoln',
  'Washington', 'Bent', 'Jackson', 'Costilla', 'Dolores',
  'Kiowa', 'Hinsdale', 'Mineral', 'Sedgwick', 'Phillips',
  'Baca', 'San Juan', 'Cheyenne', 'Lake',
] as const;
export const ALL_LOADED_COUNTIES = [...BATCH1_COUNTIES, ...BATCH2_COUNTIES, ...BATCH3_COUNTIES, ...BATCH4_COUNTIES, ...REMAINING_COUNTIES] as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Return all communities for a given county (primary county match). */
export function getCommunitiesByCounty(county: string): Community[] {
  return ALL_COMMUNITIES.filter(c => c.county === county);
}

/** Return only incorporated municipalities for a county. */
export function getIncorporatedByCounty(county: string): Community[] {
  return ALL_COMMUNITIES.filter(c => c.county === county && c.incorporated);
}

/** Return only CDPs and unincorporated communities for a county. */
export function getUnincorporatedByCounty(county: string): Community[] {
  return ALL_COMMUNITIES.filter(c => c.county === county && !c.incorporated);
}
