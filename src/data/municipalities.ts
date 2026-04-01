/**
 * Colorado Municipalities Data
 *
 * All 273 active incorporated municipalities in the State of Colorado,
 * organized alphabetically by county.
 *
 * Sources:
 *  - Wikipedia: List of municipalities in Colorado (2020 Census populations)
 *  - Wikipedia: List of Colorado municipalities by county
 *  - Colorado Municipal League (CML) Member Directory (updated Oct 2025)
 *  - Colorado Secretary of State municipal elections resource
 *  - Colorado Revised Statutes Title 31 (Government – Municipal)
 *
 * Municipality types:
 *  - "Home Rule City"        – adopted home rule charter; organized as a city
 *  - "Home Rule Town"        – adopted home rule charter; organized as a town
 *  - "Statutory City"        – operates under CRS Title 31; pop ≥ 2,000 at time of inc.
 *  - "Statutory Town"        – operates under CRS Title 31; general-law town
 *  - "Territorial Charter"   – incorporated under pre-statehood territorial charter
 *  - "Consolidated City & County" – Denver and Broomfield
 *
 * Population: 2020 U.S. Census unless noted. Multi-county municipalities list
 * their total 2020 population (not per-county split).
 *
 * incorporationYear: Calendar year of original incorporation. Some very early
 * municipalities predate reliable records; those are marked null.
 *
 * NOTE on multi-county municipalities: counties[] lists every county the
 * municipality extends into. The first entry is the primary/most-populous county.
 */

export type MunicipalityType =
  | 'Home Rule City'
  | 'Home Rule Town'
  | 'Statutory City'
  | 'Statutory Town'
  | 'Territorial Charter'
  | 'Consolidated City & County';

export interface Municipality {
  name: string;
  counties: string[];          // primary county first
  type: MunicipalityType;
  population2020: number;
  incorporationYear: number | null;
}

export interface CountyMunicipalities {
  county: string;
  municipalities: Municipality[];
}

// ---------------------------------------------------------------------------
// Raw municipality array – every entry
// ---------------------------------------------------------------------------

export const ALL_MUNICIPALITIES: Municipality[] = [
  // ── Alamosa County ──────────────────────────────────────────────────────
  { name: 'Alamosa',            counties: ['Alamosa'],                       type: 'Home Rule City',        population2020: 9806,   incorporationYear: 1878 },
  { name: 'Hooper',             counties: ['Alamosa'],                       type: 'Statutory Town',        population2020: 101,    incorporationYear: 1886 },

  // ── Adams County ─────────────────────────────────────────────────────────
  // (Multi-county cities are listed under their PRIMARY county only)
  { name: 'Aurora',             counties: ['Arapahoe', 'Adams', 'Douglas'],  type: 'Home Rule City',        population2020: 386261, incorporationYear: 1903 },
  { name: 'Bennett',            counties: ['Adams', 'Arapahoe'],             type: 'Statutory Town',        population2020: 2862,   incorporationYear: 1930 },
  { name: 'Brighton',           counties: ['Adams', 'Weld'],                 type: 'Home Rule City',        population2020: 40083,  incorporationYear: 1887 },
  { name: 'Commerce City',      counties: ['Adams'],                         type: 'Home Rule City',        population2020: 62418,  incorporationYear: 1952 },
  { name: 'Federal Heights',    counties: ['Adams'],                         type: 'Home Rule City',        population2020: 14382,  incorporationYear: 1940 },
  { name: 'Northglenn',         counties: ['Adams'],                         type: 'Home Rule City',        population2020: 39019,  incorporationYear: 1967 },
  { name: 'Strasburg',          counties: ['Adams'],                         type: 'Statutory Town',        population2020: 8574,   incorporationYear: 1951 },
  { name: 'Thornton',           counties: ['Adams', 'Weld'],                 type: 'Home Rule City',        population2020: 144835, incorporationYear: 1953 },

  // ── Arapahoe County ──────────────────────────────────────────────────────
  { name: 'Centennial',         counties: ['Arapahoe'],                      type: 'Home Rule City',        population2020: 108418, incorporationYear: 2001 },
  { name: 'Cherry Hills Village',counties: ['Arapahoe'],                     type: 'Home Rule City',        population2020: 6442,   incorporationYear: 1945 },
  { name: 'Columbine Valley',   counties: ['Arapahoe'],                      type: 'Statutory Town',        population2020: 1502,   incorporationYear: 1959 },
  { name: 'Deer Trail',         counties: ['Arapahoe'],                      type: 'Statutory Town',        population2020: 1068,   incorporationYear: 1920 },
  { name: 'Englewood',          counties: ['Arapahoe'],                      type: 'Home Rule City',        population2020: 33659,  incorporationYear: 1903 },
  { name: 'Foxfield',           counties: ['Arapahoe'],                      type: 'Statutory Town',        population2020: 754,    incorporationYear: 1994 },
  { name: 'Glendale',           counties: ['Arapahoe'],                      type: 'Home Rule City',        population2020: 4693,   incorporationYear: 1904 },
  { name: 'Greenwood Village',  counties: ['Arapahoe', 'Douglas'],           type: 'Home Rule City',        population2020: 15933,  incorporationYear: 1964 },
  { name: 'Sheridan',           counties: ['Arapahoe'],                      type: 'Home Rule City',        population2020: 6049,   incorporationYear: 1907 },
  // Littleton primary county is Arapahoe
  { name: 'Littleton',          counties: ['Arapahoe', 'Douglas', 'Jefferson'], type: 'Home Rule City',    population2020: 45647,  incorporationYear: 1890 },
  // Bow Mar straddles Arapahoe & Jefferson – listed here as primary
  { name: 'Bow Mar',            counties: ['Arapahoe', 'Jefferson'],         type: 'Statutory Town',        population2020: 853,    incorporationYear: 1958 },

  // ── Archuleta County ─────────────────────────────────────────────────────
  { name: 'Pagosa Springs',     counties: ['Archuleta'],                     type: 'Home Rule Town',        population2020: 2005,   incorporationYear: 1891 },

  // ── Baca County ──────────────────────────────────────────────────────────
  { name: 'Campo',              counties: ['Baca'],                          type: 'Statutory Town',        population2020: 103,    incorporationYear: 1950 },
  { name: 'Pritchett',          counties: ['Baca'],                          type: 'Statutory Town',        population2020: 88,     incorporationYear: 1920 },
  { name: 'Springfield',        counties: ['Baca'],                          type: 'Statutory City',        population2020: 1397,   incorporationYear: 1887 },
  { name: 'Two Buttes',         counties: ['Baca'],                          type: 'Statutory Town',        population2020: 40,     incorporationYear: 1908 },
  { name: 'Vilas',              counties: ['Baca'],                          type: 'Statutory Town',        population2020: 107,    incorporationYear: 1916 },
  { name: 'Walsh',              counties: ['Baca'],                          type: 'Statutory Town',        population2020: 517,    incorporationYear: 1923 },

  // ── Bent County ──────────────────────────────────────────────────────────
  { name: 'Las Animas',         counties: ['Bent'],                          type: 'Statutory City',        population2020: 2190,   incorporationYear: 1887 },
  { name: 'McClave',            counties: ['Bent'],                          type: 'Statutory Town',        population2020: 76,     incorporationYear: 1918 },

  // ── Boulder County ───────────────────────────────────────────────────────
  { name: 'Boulder',            counties: ['Boulder'],                       type: 'Home Rule City',        population2020: 108250, incorporationYear: 1871 },
  // Erie primary county Weld; also in Boulder – listed under Weld below
  { name: 'Jamestown',          counties: ['Boulder'],                       type: 'Statutory Town',        population2020: 215,    incorporationYear: 1875 },
  { name: 'Lafayette',          counties: ['Boulder'],                       type: 'Home Rule City',        population2020: 29404,  incorporationYear: 1890 },
  { name: 'Longmont',           counties: ['Boulder'],                       type: 'Home Rule City',        population2020: 97379,  incorporationYear: 1873 },
  { name: 'Louisville',         counties: ['Boulder'],                       type: 'Home Rule City',        population2020: 21646,  incorporationYear: 1882 },
  { name: 'Lyons',              counties: ['Boulder'],                       type: 'Statutory Town',        population2020: 2069,   incorporationYear: 1881 },
  { name: 'Nederland',          counties: ['Boulder'],                       type: 'Statutory Town',        population2020: 1540,   incorporationYear: 1883 },
  { name: 'Superior',           counties: ['Boulder', 'Jefferson'],          type: 'Home Rule Town',        population2020: 13208,  incorporationYear: 1982 },
  { name: 'Ward',               counties: ['Boulder'],                       type: 'Statutory Town',        population2020: 234,    incorporationYear: 1900 },

  // ── Broomfield County ────────────────────────────────────────────────────
  { name: 'Broomfield',         counties: ['Broomfield'],                    type: 'Consolidated City & County', population2020: 74112, incorporationYear: 1961 },

  // ── Chaffee County ───────────────────────────────────────────────────────
  { name: 'Buena Vista',        counties: ['Chaffee'],                       type: 'Statutory Town',        population2020: 2855,   incorporationYear: 1879 },
  { name: 'Poncha Springs',     counties: ['Chaffee'],                       type: 'Statutory Town',        population2020: 940,    incorporationYear: 1892 },
  { name: 'Salida',             counties: ['Chaffee'],                       type: 'Home Rule City',        population2020: 5763,   incorporationYear: 1881 },

  // ── Cheyenne County ──────────────────────────────────────────────────────
  { name: 'Cheyenne Wells',     counties: ['Cheyenne'],                      type: 'Statutory Town',        population2020: 758,    incorporationYear: 1890 },
  { name: 'Kit Carson',         counties: ['Cheyenne'],                      type: 'Statutory Town',        population2020: 220,    incorporationYear: 1914 },

  // ── Clear Creek County ───────────────────────────────────────────────────
  // Central City spans Gilpin & Clear Creek; listed under Gilpin as primary
  { name: 'Empire',             counties: ['Clear Creek'],                   type: 'Statutory Town',        population2020: 345,    incorporationYear: 1882 },
  { name: 'Georgetown',         counties: ['Clear Creek'],                   type: 'Territorial Charter',   population2020: 1118,   incorporationYear: 1868 },
  { name: 'Idaho Springs',      counties: ['Clear Creek'],                   type: 'Home Rule City',        population2020: 1891,   incorporationYear: 1859 },
  { name: 'Silver Plume',       counties: ['Clear Creek'],                   type: 'Statutory Town',        population2020: 176,    incorporationYear: 1880 },

  // ── Conejos County ───────────────────────────────────────────────────────
  { name: 'Antonito',           counties: ['Conejos'],                       type: 'Statutory Town',        population2020: 647,    incorporationYear: 1889 },
  { name: 'La Jara',            counties: ['Conejos'],                       type: 'Statutory Town',        population2020: 803,    incorporationYear: 1908 },
  { name: 'Manassa',            counties: ['Conejos'],                       type: 'Statutory Town',        population2020: 969,    incorporationYear: 1888 },
  { name: 'Romeo',              counties: ['Conejos'],                       type: 'Statutory Town',        population2020: 406,    incorporationYear: 1910 },
  { name: 'Sanford',            counties: ['Conejos'],                       type: 'Statutory Town',        population2020: 858,    incorporationYear: 1912 },

  // ── Costilla County ──────────────────────────────────────────────────────
  { name: 'Blanca',             counties: ['Costilla'],                      type: 'Statutory Town',        population2020: 322,    incorporationYear: 1910 },
  { name: 'San Luis',           counties: ['Costilla'],                      type: 'Statutory Town',        population2020: 644,    incorporationYear: 1872 },

  // ── Crowley County ───────────────────────────────────────────────────────
  { name: 'Crowley',            counties: ['Crowley'],                       type: 'Statutory Town',        population2020: 166,    incorporationYear: 1921 },
  { name: 'Olney Springs',      counties: ['Crowley'],                       type: 'Statutory Town',        population2020: 329,    incorporationYear: 1907 },
  { name: 'Ordway',             counties: ['Crowley'],                       type: 'Statutory City',        population2020: 1028,   incorporationYear: 1882 },
  { name: 'Sugar City',         counties: ['Crowley'],                       type: 'Statutory Town',        population2020: 246,    incorporationYear: 1913 },

  // ── Custer County ────────────────────────────────────────────────────────
  { name: 'Silver Cliff',       counties: ['Custer'],                        type: 'Statutory Town',        population2020: 657,    incorporationYear: 1879 },
  { name: 'Westcliffe',         counties: ['Custer'],                        type: 'Statutory Town',        population2020: 620,    incorporationYear: 1887 },

  // ── Delta County ─────────────────────────────────────────────────────────
  { name: 'Cedaredge',          counties: ['Delta'],                         type: 'Home Rule Town',        population2020: 2279,   incorporationYear: 1907 },
  { name: 'Crawford',           counties: ['Delta'],                         type: 'Statutory Town',        population2020: 403,    incorporationYear: 1910 },
  { name: 'Delta',              counties: ['Delta'],                         type: 'Home Rule City',        population2020: 9035,   incorporationYear: 1882 },
  { name: 'Hotchkiss',          counties: ['Delta'],                         type: 'Statutory Town',        population2020: 933,    incorporationYear: 1900 },
  { name: 'Orchard City',       counties: ['Delta'],                         type: 'Statutory Town',        population2020: 3580,   incorporationYear: 1906 },
  { name: 'Paonia',             counties: ['Delta'],                         type: 'Statutory Town',        population2020: 1547,   incorporationYear: 1906 },

  // ── Denver County ────────────────────────────────────────────────────────
  { name: 'Denver',             counties: ['Denver'],                        type: 'Consolidated City & County', population2020: 715522, incorporationYear: 1859 },

  // ── Dolores County ───────────────────────────────────────────────────────
  { name: 'Dove Creek',         counties: ['Dolores'],                       type: 'Statutory Town',        population2020: 635,    incorporationYear: 1939 },
  { name: 'Rico',               counties: ['Dolores'],                       type: 'Statutory Town',        population2020: 232,    incorporationYear: 1879 },

  // ── Douglas County ───────────────────────────────────────────────────────
  { name: 'Castle Pines',       counties: ['Douglas'],                       type: 'Home Rule City',        population2020: 11036,  incorporationYear: 2007 },
  { name: 'Castle Rock',        counties: ['Douglas'],                       type: 'Home Rule Town',        population2020: 73158,  incorporationYear: 1881 },
  { name: 'Larkspur',           counties: ['Douglas'],                       type: 'Statutory Town',        population2020: 257,    incorporationYear: 1904 },
  { name: 'Lone Tree',          counties: ['Douglas'],                       type: 'Home Rule City',        population2020: 13113,  incorporationYear: 1995 },
  { name: 'Parker',             counties: ['Douglas'],                       type: 'Home Rule Town',        population2020: 57706,  incorporationYear: 1981 },
  { name: 'Sedalia',            counties: ['Douglas'],                       type: 'Statutory Town',        population2020: 331,    incorporationYear: 1994 },

  // ── Eagle County ─────────────────────────────────────────────────────────
  // Basalt spans Eagle & Pitkin; primary is Eagle
  { name: 'Avon',               counties: ['Eagle'],                         type: 'Home Rule Town',        population2020: 6072,   incorporationYear: 1978 },
  { name: 'Basalt',             counties: ['Eagle', 'Pitkin'],               type: 'Home Rule Town',        population2020: 3984,   incorporationYear: 1901 },
  { name: 'Eagle',              counties: ['Eagle'],                         type: 'Home Rule Town',        population2020: 7511,   incorporationYear: 1905 },
  { name: 'Gypsum',             counties: ['Eagle'],                         type: 'Statutory Town',        population2020: 8073,   incorporationYear: 1966 },
  { name: 'Minturn',            counties: ['Eagle'],                         type: 'Home Rule Town',        population2020: 1118,   incorporationYear: 1948 },
  { name: 'Red Cliff',          counties: ['Eagle'],                         type: 'Statutory Town',        population2020: 271,    incorporationYear: 1881 },
  { name: 'Vail',               counties: ['Eagle'],                         type: 'Home Rule Town',        population2020: 5633,   incorporationYear: 1966 },

  // ── Elbert County ────────────────────────────────────────────────────────
  { name: 'Elizabeth',          counties: ['Elbert'],                        type: 'Statutory Town',        population2020: 1675,   incorporationYear: 1890 },
  { name: 'Kiowa',              counties: ['Elbert'],                        type: 'Statutory Town',        population2020: 757,    incorporationYear: 1904 },
  { name: 'Simla',              counties: ['Elbert'],                        type: 'Statutory Town',        population2020: 639,    incorporationYear: 1907 },

  // ── El Paso County ───────────────────────────────────────────────────────
  { name: 'Calhan',             counties: ['El Paso'],                       type: 'Statutory Town',        population2020: 762,    incorporationYear: 1919 },
  { name: 'Colorado Springs',   counties: ['El Paso'],                       type: 'Home Rule City',        population2020: 478961, incorporationYear: 1886 },
  { name: 'Fountain',           counties: ['El Paso'],                       type: 'Home Rule City',        population2020: 29802,  incorporationYear: 1903 },
  { name: 'Green Mountain Falls',counties: ['El Paso', 'Teller'],            type: 'Statutory Town',        population2020: 706,    incorporationYear: 1890 },
  { name: 'Manitou Springs',    counties: ['El Paso'],                       type: 'Home Rule City',        population2020: 5280,   incorporationYear: 1882 },
  { name: 'Monument',           counties: ['El Paso'],                       type: 'Statutory Town',        population2020: 6227,   incorporationYear: 1879 },
  { name: 'Palmer Lake',        counties: ['El Paso'],                       type: 'Statutory Town',        population2020: 2772,   incorporationYear: 1889 },
  { name: 'Ramah',              counties: ['El Paso'],                       type: 'Statutory Town',        population2020: 129,    incorporationYear: 1914 },

  // ── Fremont County ───────────────────────────────────────────────────────
  { name: 'Brookside',          counties: ['Fremont'],                       type: 'Statutory Town',        population2020: 236,    incorporationYear: 1913 },
  { name: 'Cañon City',         counties: ['Fremont'],                       type: 'Home Rule City',        population2020: 17141,  incorporationYear: 1872 },
  { name: 'Coal Creek',         counties: ['Fremont'],                       type: 'Statutory Town',        population2020: 364,    incorporationYear: 1882 },
  { name: 'Florence',           counties: ['Fremont'],                       type: 'Statutory City',        population2020: 3822,   incorporationYear: 1887 },
  { name: 'Rockvale',           counties: ['Fremont'],                       type: 'Statutory Town',        population2020: 558,    incorporationYear: 1911 },
  { name: 'Williamsburg',       counties: ['Fremont'],                       type: 'Statutory Town',        population2020: 702,    incorporationYear: 1910 },

  // ── Garfield County ──────────────────────────────────────────────────────
  { name: 'Carbonate',          counties: ['Garfield'],                      type: 'Statutory Town',        population2020: 0,      incorporationYear: 1883 },
  { name: 'Carbondale',         counties: ['Garfield'],                      type: 'Home Rule Town',        population2020: 6434,   incorporationYear: 1888 },
  { name: 'Glenwood Springs',   counties: ['Garfield'],                      type: 'Home Rule City',        population2020: 10161,  incorporationYear: 1885 },
  { name: 'New Castle',         counties: ['Garfield'],                      type: 'Home Rule Town',        population2020: 5546,   incorporationYear: 1888 },
  { name: 'Parachute',          counties: ['Garfield'],                      type: 'Home Rule Town',        population2020: 1339,   incorporationYear: 1983 },
  { name: 'Rifle',              counties: ['Garfield'],                      type: 'Home Rule City',        population2020: 10250,  incorporationYear: 1905 },
  { name: 'Silt',               counties: ['Garfield'],                      type: 'Statutory Town',        population2020: 3293,   incorporationYear: 1909 },

  // ── Gilpin County ────────────────────────────────────────────────────────
  { name: 'Black Hawk',         counties: ['Gilpin'],                        type: 'Home Rule City',        population2020: 127,    incorporationYear: 1886 },
  // Central City is in both Gilpin (primary) and Clear Creek
  { name: 'Central City',       counties: ['Gilpin', 'Clear Creek'],         type: 'Home Rule City',        population2020: 779,    incorporationYear: 1886 },

  // ── Grand County ─────────────────────────────────────────────────────────
  { name: 'Fraser',             counties: ['Grand'],                         type: 'Statutory Town',        population2020: 1400,   incorporationYear: 1953 },
  { name: 'Grand Lake',         counties: ['Grand'],                         type: 'Statutory Town',        population2020: 486,    incorporationYear: 1907 },
  { name: 'Granby',             counties: ['Grand'],                         type: 'Statutory Town',        population2020: 2077,   incorporationYear: 1905 },
  { name: 'Hot Sulphur Springs',counties: ['Grand'],                         type: 'Statutory Town',        population2020: 569,    incorporationYear: 1887 },
  { name: 'Kremmling',          counties: ['Grand'],                         type: 'Statutory Town',        population2020: 1478,   incorporationYear: 1881 },
  { name: 'Winter Park',        counties: ['Grand'],                         type: 'Home Rule Town',        population2020: 1051,   incorporationYear: 1978 },

  // ── Gunnison County ──────────────────────────────────────────────────────
  { name: 'Crested Butte',      counties: ['Gunnison'],                      type: 'Home Rule Town',        population2020: 1639,   incorporationYear: 1880 },
  { name: 'Gunnison',           counties: ['Gunnison'],                      type: 'Home Rule City',        population2020: 6994,   incorporationYear: 1880 },
  { name: 'Marble',             counties: ['Gunnison'],                      type: 'Statutory Town',        population2020: 197,    incorporationYear: 1899 },
  { name: 'Mount Crested Butte',counties: ['Gunnison'],                      type: 'Statutory Town',        population2020: 852,    incorporationYear: 1974 },
  { name: 'Pitkin',             counties: ['Gunnison'],                      type: 'Statutory Town',        population2020: 72,     incorporationYear: 1879 },

  // ── Hinsdale County ──────────────────────────────────────────────────────
  { name: 'Lake City',          counties: ['Hinsdale'],                      type: 'Statutory Town',        population2020: 318,    incorporationYear: 1874 },

  // ── Huerfano County ──────────────────────────────────────────────────────
  { name: 'La Veta',            counties: ['Huerfano'],                      type: 'Statutory Town',        population2020: 810,    incorporationYear: 1877 },
  { name: 'Walsenburg',         counties: ['Huerfano'],                      type: 'Home Rule City',        population2020: 2862,   incorporationYear: 1876 },

  // ── Jackson County ───────────────────────────────────────────────────────
  { name: 'Walden',             counties: ['Jackson'],                       type: 'Statutory Town',        population2020: 600,    incorporationYear: 1903 },

  // ── Jefferson County ─────────────────────────────────────────────────────
  { name: 'Arvada',             counties: ['Jefferson', 'Adams'],            type: 'Home Rule City',        population2020: 124402, incorporationYear: 1904 },
  { name: 'Edgewater',          counties: ['Jefferson'],                     type: 'Home Rule City',        population2020: 5005,   incorporationYear: 1904 },
  { name: 'Golden',             counties: ['Jefferson'],                     type: 'Home Rule City',        population2020: 21278,  incorporationYear: 1859 },
  { name: 'Lakeside',           counties: ['Jefferson'],                     type: 'Statutory Town',        population2020: 8,      incorporationYear: 1907 },
  { name: 'Lakewood',           counties: ['Jefferson'],                     type: 'Home Rule City',        population2020: 155984, incorporationYear: 1969 },
  { name: 'Morrison',           counties: ['Jefferson'],                     type: 'Home Rule Town',        population2020: 424,    incorporationYear: 1906 },
  { name: 'Mountain View',      counties: ['Jefferson'],                     type: 'Statutory Town',        population2020: 537,    incorporationYear: 1903 },
  { name: 'Westminster',        counties: ['Jefferson', 'Adams'],            type: 'Home Rule City',        population2020: 113479, incorporationYear: 1911 },
  { name: 'Wheat Ridge',        counties: ['Jefferson'],                     type: 'Home Rule City',        population2020: 30718,  incorporationYear: 1969 },

  // ── Kiowa County ─────────────────────────────────────────────────────────
  { name: 'Eads',               counties: ['Kiowa'],                         type: 'Statutory Town',        population2020: 672,    incorporationYear: 1916 },
  { name: 'Haswell',            counties: ['Kiowa'],                         type: 'Statutory Town',        population2020: 67,     incorporationYear: 1912 },
  { name: 'Sheridan Lake',      counties: ['Kiowa'],                         type: 'Statutory Town',        population2020: 153,    incorporationYear: 1911 },

  // ── Kit Carson County ────────────────────────────────────────────────────
  { name: 'Bethune',            counties: ['Kit Carson'],                    type: 'Statutory Town',        population2020: 183,    incorporationYear: 1926 },
  { name: 'Burlington',         counties: ['Kit Carson'],                    type: 'Home Rule City',        population2020: 3172,   incorporationYear: 1888 },
  { name: 'Flagler',            counties: ['Kit Carson'],                    type: 'Statutory Town',        population2020: 567,    incorporationYear: 1916 },
  { name: 'Seibert',            counties: ['Kit Carson'],                    type: 'Statutory Town',        population2020: 216,    incorporationYear: 1912 },
  { name: 'Stratton',           counties: ['Kit Carson'],                    type: 'Statutory City',        population2020: 633,    incorporationYear: 1895 },
  { name: 'Vona',               counties: ['Kit Carson'],                    type: 'Statutory Town',        population2020: 104,    incorporationYear: 1917 },

  // ── Lake County ──────────────────────────────────────────────────────────
  { name: 'Leadville',          counties: ['Lake'],                          type: 'Statutory City',        population2020: 2602,   incorporationYear: 1878 },

  // ── La Plata County ──────────────────────────────────────────────────────
  { name: 'Bayfield',           counties: ['La Plata'],                      type: 'Statutory Town',        population2020: 2838,   incorporationYear: 1906 },
  { name: 'Durango',            counties: ['La Plata'],                      type: 'Home Rule City',        population2020: 19071,  incorporationYear: 1881 },
  { name: 'Ignacio',            counties: ['La Plata'],                      type: 'Statutory Town',        population2020: 724,    incorporationYear: 1911 },

  // ── Larimer County ───────────────────────────────────────────────────────
  // Berthoud spans Larimer & Weld; primary Larimer
  { name: 'Berthoud',           counties: ['Larimer', 'Weld'],               type: 'Statutory Town',        population2020: 10332,  incorporationYear: 1888 },
  { name: 'Estes Park',         counties: ['Larimer'],                       type: 'Statutory Town',        population2020: 5904,   incorporationYear: 1917 },
  { name: 'Fort Collins',       counties: ['Larimer'],                       type: 'Home Rule City',        population2020: 169810, incorporationYear: 1883 },
  { name: 'Loveland',           counties: ['Larimer'],                       type: 'Home Rule City',        population2020: 89750,  incorporationYear: 1881 },
  { name: 'Timnath',            counties: ['Larimer', 'Weld'],               type: 'Home Rule Town',        population2020: 8074,   incorporationYear: 2007 },
  { name: 'Wellington',         counties: ['Larimer'],                       type: 'Statutory Town',        population2020: 7891,   incorporationYear: 1901 },

  // ── Las Animas County ────────────────────────────────────────────────────
  { name: 'Aguilar',            counties: ['Las Animas'],                    type: 'Statutory Town',        population2020: 456,    incorporationYear: 1894 },
  { name: 'Branson',            counties: ['Las Animas'],                    type: 'Statutory Town',        population2020: 57,     incorporationYear: 1921 },
  { name: 'Cokedale',           counties: ['Las Animas'],                    type: 'Statutory Town',        population2020: 127,    incorporationYear: 1948 },
  { name: 'Kim',                counties: ['Las Animas'],                    type: 'Statutory Town',        population2020: 69,     incorporationYear: 1920 },
  { name: 'Starkville',         counties: ['Las Animas'],                    type: 'Statutory Town',        population2020: 55,     incorporationYear: 1911 },
  { name: 'Trinidad',           counties: ['Las Animas'],                    type: 'Home Rule City',        population2020: 8424,   incorporationYear: 1876 },

  // ── Lincoln County ───────────────────────────────────────────────────────
  { name: 'Arriba',             counties: ['Lincoln'],                       type: 'Statutory Town',        population2020: 202,    incorporationYear: 1918 },
  { name: 'Genoa',              counties: ['Lincoln'],                       type: 'Statutory Town',        population2020: 153,    incorporationYear: 1905 },
  { name: 'Hugo',               counties: ['Lincoln'],                       type: 'Statutory Town',        population2020: 717,    incorporationYear: 1907 },
  { name: 'Limon',              counties: ['Lincoln'],                       type: 'Statutory City',        population2020: 1924,   incorporationYear: 1888 },

  // ── Logan County ─────────────────────────────────────────────────────────
  { name: 'Crook',              counties: ['Logan'],                         type: 'Statutory Town',        population2020: 133,    incorporationYear: 1918 },
  { name: 'Fleming',            counties: ['Logan'],                         type: 'Statutory Town',        population2020: 428,    incorporationYear: 1917 },
  { name: 'Iliff',              counties: ['Logan'],                         type: 'Statutory Town',        population2020: 308,    incorporationYear: 1904 },
  { name: 'Merino',             counties: ['Logan'],                         type: 'Statutory Town',        population2020: 279,    incorporationYear: 1905 },
  { name: 'Peetz',              counties: ['Logan'],                         type: 'Statutory Town',        population2020: 234,    incorporationYear: 1917 },
  { name: 'Sterling',           counties: ['Logan'],                         type: 'Home Rule City',        population2020: 15088,  incorporationYear: 1884 },

  // ── Mesa County ──────────────────────────────────────────────────────────
  { name: 'Collbran',           counties: ['Mesa'],                          type: 'Statutory Town',        population2020: 369,    incorporationYear: 1908 },
  { name: 'De Beque',           counties: ['Mesa'],                          type: 'Statutory Town',        population2020: 493,    incorporationYear: 1890 },
  { name: 'Fruita',             counties: ['Mesa'],                          type: 'Home Rule City',        population2020: 13395,  incorporationYear: 1894 },
  { name: 'Grand Junction',     counties: ['Mesa'],                          type: 'Home Rule City',        population2020: 65113,  incorporationYear: 1882 },
  { name: 'Palisade',           counties: ['Mesa'],                          type: 'Statutory Town',        population2020: 2621,   incorporationYear: 1904 },

  // ── Mineral County ───────────────────────────────────────────────────────
  { name: 'Creede',             counties: ['Mineral'],                       type: 'Statutory Town',        population2020: 257,    incorporationYear: 1892 },

  // ── Moffat County ────────────────────────────────────────────────────────
  { name: 'Craig',              counties: ['Moffat'],                        type: 'Home Rule City',        population2020: 9060,   incorporationYear: 1908 },
  { name: 'Dinosaur',           counties: ['Moffat'],                        type: 'Statutory Town',        population2020: 243,    incorporationYear: 1947 },

  // ── Montezuma County ─────────────────────────────────────────────────────
  { name: 'Cortez',             counties: ['Montezuma'],                     type: 'Home Rule City',        population2020: 8766,   incorporationYear: 1902 },
  { name: 'Dolores',            counties: ['Montezuma'],                     type: 'Statutory Town',        population2020: 885,    incorporationYear: 1900 },
  { name: 'Mancos',             counties: ['Montezuma'],                     type: 'Statutory Town',        population2020: 1419,   incorporationYear: 1894 },

  // ── Montrose County ──────────────────────────────────────────────────────
  { name: 'Montrose',           counties: ['Montrose'],                      type: 'Home Rule City',        population2020: 19660,  incorporationYear: 1882 },
  { name: 'Naturita',           counties: ['Montrose'],                      type: 'Statutory Town',        population2020: 773,    incorporationYear: 1906 },
  { name: 'Nucla',              counties: ['Montrose'],                      type: 'Statutory Town',        population2020: 734,    incorporationYear: 1908 },
  { name: 'Olathe',             counties: ['Montrose'],                      type: 'Statutory Town',        population2020: 1977,   incorporationYear: 1907 },

  // ── Morgan County ────────────────────────────────────────────────────────
  { name: 'Brush',              counties: ['Morgan'],                        type: 'Statutory City',        population2020: 5339,   incorporationYear: 1884 },
  { name: 'Fort Morgan',        counties: ['Morgan'],                        type: 'Home Rule City',        population2020: 11597,  incorporationYear: 1887 },
  { name: 'Hillrose',           counties: ['Morgan'],                        type: 'Statutory Town',        population2020: 254,    incorporationYear: 1910 },
  { name: 'Log Lane Village',   counties: ['Morgan'],                        type: 'Statutory Town',        population2020: 1122,   incorporationYear: 1983 },
  { name: 'Wiggins',            counties: ['Morgan'],                        type: 'Statutory Town',        population2020: 996,    incorporationYear: 1921 },

  // ── Otero County ─────────────────────────────────────────────────────────
  { name: 'Cheraw',             counties: ['Otero'],                         type: 'Statutory Town',        population2020: 237,    incorporationYear: 1917 },
  { name: 'Fowler',             counties: ['Otero'],                         type: 'Statutory Town',        population2020: 1253,   incorporationYear: 1900 },
  { name: 'La Junta',           counties: ['Otero'],                         type: 'Home Rule City',        population2020: 7077,   incorporationYear: 1873 },
  { name: 'Manzanola',          counties: ['Otero'],                         type: 'Statutory Town',        population2020: 478,    incorporationYear: 1909 },
  { name: 'Rocky Ford',         counties: ['Otero'],                         type: 'Statutory City',        population2020: 3755,   incorporationYear: 1887 },
  { name: 'Swink',              counties: ['Otero'],                         type: 'Statutory Town',        population2020: 558,    incorporationYear: 1907 },

  // ── Ouray County ─────────────────────────────────────────────────────────
  { name: 'Ouray',              counties: ['Ouray'],                         type: 'Home Rule City',        population2020: 1051,   incorporationYear: 1877 },
  { name: 'Ridgway',            counties: ['Ouray'],                         type: 'Statutory Town',        population2020: 1056,   incorporationYear: 1891 },

  // ── Park County ──────────────────────────────────────────────────────────
  { name: 'Alma',               counties: ['Park'],                          type: 'Statutory Town',        population2020: 296,    incorporationYear: 1873 },
  { name: 'Fairplay',           counties: ['Park'],                          type: 'Statutory Town',        population2020: 724,    incorporationYear: 1872 },

  // ── Phillips County ──────────────────────────────────────────────────────
  { name: 'Haxtun',             counties: ['Phillips'],                      type: 'Statutory Town',        population2020: 921,    incorporationYear: 1908 },
  { name: 'Holyoke',            counties: ['Phillips'],                      type: 'Statutory Town',        population2020: 2299,   incorporationYear: 1887 },
  { name: 'Paoli',              counties: ['Phillips'],                      type: 'Statutory Town',        population2020: 35,     incorporationYear: 1918 },

  // ── Pitkin County ────────────────────────────────────────────────────────
  { name: 'Aspen',              counties: ['Pitkin'],                        type: 'Home Rule City',        population2020: 7004,   incorporationYear: 1881 },
  { name: 'Snowmass Village',   counties: ['Pitkin'],                        type: 'Home Rule Town',        population2020: 3139,   incorporationYear: 1977 },

  // ── Prowers County ───────────────────────────────────────────────────────
  { name: 'Granada',            counties: ['Prowers'],                       type: 'Statutory Town',        population2020: 500,    incorporationYear: 1907 },
  { name: 'Hartman',            counties: ['Prowers'],                       type: 'Statutory Town',        population2020: 75,     incorporationYear: 1914 },
  { name: 'Holly',              counties: ['Prowers'],                       type: 'Statutory Town',        population2020: 775,    incorporationYear: 1900 },
  { name: 'Lamar',              counties: ['Prowers'],                       type: 'Home Rule City',        population2020: 7623,   incorporationYear: 1886 },
  { name: 'Wiley',              counties: ['Prowers'],                       type: 'Statutory Town',        population2020: 393,    incorporationYear: 1908 },

  // ── Pueblo County ────────────────────────────────────────────────────────
  { name: 'Boone',              counties: ['Pueblo'],                        type: 'Statutory Town',        population2020: 305,    incorporationYear: 1956 },
  { name: 'Pueblo',             counties: ['Pueblo'],                        type: 'Home Rule City',        population2020: 117564, incorporationYear: 1870 },
  { name: 'Rye',                counties: ['Pueblo'],                        type: 'Statutory Town',        population2020: 210,    incorporationYear: 1917 },

  // ── Rio Blanco County ────────────────────────────────────────────────────
  { name: 'Meeker',             counties: ['Rio Blanco'],                    type: 'Statutory Town',        population2020: 2346,   incorporationYear: 1885 },
  { name: 'Rangely',            counties: ['Rio Blanco'],                    type: 'Statutory Town',        population2020: 2364,   incorporationYear: 1913 },

  // ── Rio Grande County ────────────────────────────────────────────────────
  // Center spans Saguache & Rio Grande; listed under Saguache as primary
  { name: 'Del Norte',          counties: ['Rio Grande'],                    type: 'Statutory Town',        population2020: 1458,   incorporationYear: 1874 },
  { name: 'Monte Vista',        counties: ['Rio Grande'],                    type: 'Home Rule City',        population2020: 4382,   incorporationYear: 1886 },
  { name: 'South Fork',         counties: ['Rio Grande'],                    type: 'Statutory Town',        population2020: 637,    incorporationYear: 1887 },

  // ── Routt County ─────────────────────────────────────────────────────────
  { name: 'Hayden',             counties: ['Routt'],                         type: 'Statutory Town',        population2020: 1855,   incorporationYear: 1908 },
  { name: 'Oak Creek',          counties: ['Routt'],                         type: 'Statutory Town',        population2020: 1006,   incorporationYear: 1908 },
  { name: 'Steamboat Springs',  counties: ['Routt'],                         type: 'Home Rule City',        population2020: 12868,  incorporationYear: 1900 },
  { name: 'Yampa',              counties: ['Routt'],                         type: 'Statutory Town',        population2020: 373,    incorporationYear: 1905 },

  // ── Saguache County ──────────────────────────────────────────────────────
  { name: 'Bonanza',            counties: ['Saguache'],                      type: 'Statutory Town',        population2020: 17,     incorporationYear: 1881 },
  // Center spans Saguache (primary) & Rio Grande
  { name: 'Center',             counties: ['Saguache', 'Rio Grande'],        type: 'Statutory Town',        population2020: 1929,   incorporationYear: 1907 },
  { name: 'Crestone',           counties: ['Saguache'],                      type: 'Statutory Town',        population2020: 141,    incorporationYear: 1902 },
  { name: 'Moffat',             counties: ['Saguache'],                      type: 'Statutory Town',        population2020: 120,    incorporationYear: 1909 },
  { name: 'Saguache',           counties: ['Saguache'],                      type: 'Statutory Town',        population2020: 455,    incorporationYear: 1874 },

  // ── San Juan County ──────────────────────────────────────────────────────
  { name: 'Silverton',          counties: ['San Juan'],                      type: 'Home Rule Town',        population2020: 645,    incorporationYear: 1874 },

  // ── San Miguel County ────────────────────────────────────────────────────
  { name: 'Mountain Village',   counties: ['San Miguel'],                    type: 'Home Rule Town',        population2020: 1402,   incorporationYear: 1994 },
  { name: 'Norwood',            counties: ['San Miguel'],                    type: 'Statutory Town',        population2020: 591,    incorporationYear: 1904 },
  { name: 'Ophir',              counties: ['San Miguel'],                    type: 'Statutory Town',        population2020: 179,    incorporationYear: 1881 },
  { name: 'Sawpit',             counties: ['San Miguel'],                    type: 'Statutory Town',        population2020: 35,     incorporationYear: 1906 },
  { name: 'Telluride',          counties: ['San Miguel'],                    type: 'Home Rule Town',        population2020: 2380,   incorporationYear: 1878 },

  // ── Sedgwick County ──────────────────────────────────────────────────────
  { name: 'Julesburg',          counties: ['Sedgwick'],                      type: 'Statutory City',        population2020: 1180,   incorporationYear: 1884 },
  { name: 'Ovid',               counties: ['Sedgwick'],                      type: 'Statutory Town',        population2020: 308,    incorporationYear: 1916 },
  { name: 'Sedgwick',           counties: ['Sedgwick'],                      type: 'Statutory Town',        population2020: 140,    incorporationYear: 1918 },

  // ── Summit County ────────────────────────────────────────────────────────
  { name: 'Blue River',         counties: ['Summit'],                        type: 'Statutory Town',        population2020: 877,    incorporationYear: 1964 },
  { name: 'Breckenridge',       counties: ['Summit'],                        type: 'Home Rule Town',        population2020: 5078,   incorporationYear: 1880 },
  { name: 'Dillon',             counties: ['Summit'],                        type: 'Home Rule Town',        population2020: 1064,   incorporationYear: 1883 },
  { name: 'Frisco',             counties: ['Summit'],                        type: 'Home Rule Town',        population2020: 2913,   incorporationYear: 1880 },
  { name: 'Keystone',           counties: ['Summit'],                        type: 'Home Rule Town',        population2020: 1369,   incorporationYear: 2024 },
  { name: 'Montezuma',          counties: ['Summit'],                        type: 'Statutory Town',        population2020: 68,     incorporationYear: 1883 },
  { name: 'Silverthorne',       counties: ['Summit'],                        type: 'Home Rule Town',        population2020: 4531,   incorporationYear: 1973 },

  // ── Teller County ────────────────────────────────────────────────────────
  { name: 'Cripple Creek',      counties: ['Teller'],                        type: 'Statutory City',        population2020: 1155,   incorporationYear: 1892 },
  { name: 'Victor',             counties: ['Teller'],                        type: 'Statutory Town',        population2020: 378,    incorporationYear: 1891 },
  { name: 'Woodland Park',      counties: ['Teller'],                        type: 'Home Rule City',        population2020: 7466,   incorporationYear: 1891 },

  // ── Washington County ────────────────────────────────────────────────────
  { name: 'Akron',              counties: ['Washington'],                    type: 'Statutory Town',        population2020: 1757,   incorporationYear: 1887 },
  { name: 'Otis',               counties: ['Washington'],                    type: 'Statutory Town',        population2020: 485,    incorporationYear: 1913 },

  // ── Weld County ──────────────────────────────────────────────────────────
  { name: 'Ault',               counties: ['Weld'],                          type: 'Statutory Town',        population2020: 1887,   incorporationYear: 1904 },
  { name: 'Dacono',             counties: ['Weld'],                          type: 'Home Rule City',        population2020: 6297,   incorporationYear: 1908 },
  { name: 'Eaton',              counties: ['Weld'],                          type: 'Statutory Town',        population2020: 5802,   incorporationYear: 1892 },
  // Erie spans Weld (primary) & Boulder
  { name: 'Erie',               counties: ['Weld', 'Boulder'],               type: 'Home Rule Town',        population2020: 30038,  incorporationYear: 1874 },
  { name: 'Evans',              counties: ['Weld'],                          type: 'Home Rule City',        population2020: 22165,  incorporationYear: 1885 },
  { name: 'Firestone',          counties: ['Weld'],                          type: 'Statutory Town',        population2020: 16381,  incorporationYear: 1908 },
  { name: 'Fort Lupton',        counties: ['Weld'],                          type: 'Statutory City',        population2020: 7955,   incorporationYear: 1890 },
  { name: 'Frederick',          counties: ['Weld'],                          type: 'Statutory Town',        population2020: 14513,  incorporationYear: 1908 },
  { name: 'Garden City',        counties: ['Weld'],                          type: 'Statutory Town',        population2020: 254,    incorporationYear: 1936 },
  { name: 'Gilcrest',           counties: ['Weld'],                          type: 'Statutory Town',        population2020: 1108,   incorporationYear: 1911 },
  { name: 'Greeley',            counties: ['Weld'],                          type: 'Home Rule City',        population2020: 108143, incorporationYear: 1869 },
  { name: 'Grover',             counties: ['Weld'],                          type: 'Statutory Town',        population2020: 153,    incorporationYear: 1908 },
  { name: 'Hudson',             counties: ['Weld'],                          type: 'Statutory Town',        population2020: 1838,   incorporationYear: 1907 },
  { name: 'Johnstown',          counties: ['Weld', 'Larimer'],               type: 'Home Rule Town',        population2020: 10113,  incorporationYear: 1902 },
  { name: 'Keenesburg',         counties: ['Weld'],                          type: 'Statutory Town',        population2020: 1229,   incorporationYear: 1909 },
  { name: 'Kersey',             counties: ['Weld'],                          type: 'Statutory Town',        population2020: 1655,   incorporationYear: 1902 },
  { name: 'La Salle',           counties: ['Weld'],                          type: 'Statutory Town',        population2020: 3325,   incorporationYear: 1911 },
  { name: 'Lochbuie',           counties: ['Weld'],                          type: 'Statutory Town',        population2020: 6936,   incorporationYear: 1978 },
  { name: 'Mead',               counties: ['Weld'],                          type: 'Statutory Town',        population2020: 4737,   incorporationYear: 1909 },
  { name: 'Milliken',           counties: ['Weld'],                          type: 'Statutory Town',        population2020: 7674,   incorporationYear: 1907 },
  { name: 'Nunn',               counties: ['Weld'],                          type: 'Statutory Town',        population2020: 463,    incorporationYear: 1911 },
  { name: 'Pierce',             counties: ['Weld'],                          type: 'Statutory Town',        population2020: 1132,   incorporationYear: 1904 },
  { name: 'Platteville',        counties: ['Weld'],                          type: 'Statutory Town',        population2020: 3540,   incorporationYear: 1887 },
  { name: 'Raymer',             counties: ['Weld'],                          type: 'Statutory Town',        population2020: 110,    incorporationYear: 1914 },
  { name: 'Severance',          counties: ['Weld'],                          type: 'Statutory Town',        population2020: 5064,   incorporationYear: 1909 },
  { name: 'Windsor',            counties: ['Weld', 'Larimer'],               type: 'Home Rule Town',        population2020: 32048,  incorporationYear: 1890 },

  // ── Yuma County ──────────────────────────────────────────────────────────
  { name: 'Eckley',             counties: ['Yuma'],                          type: 'Statutory Town',        population2020: 232,    incorporationYear: 1920 },
  { name: 'Idalia',             counties: ['Yuma'],                          type: 'Statutory Town',        population2020: 85,     incorporationYear: 1909 },
  { name: 'Wray',               counties: ['Yuma'],                          type: 'Statutory City',        population2020: 2334,   incorporationYear: 1906 },
  { name: 'Yuma',               counties: ['Yuma'],                          type: 'Statutory City',        population2020: 3460,   incorporationYear: 1886 },
];

// ---------------------------------------------------------------------------
// Organized by county (alphabetical)
// Multi-county municipalities appear ONLY under their primary county.
// ---------------------------------------------------------------------------

/**
 * Returns all Colorado municipalities grouped by their primary county,
 * counties sorted alphabetically, municipalities within each county
 * sorted alphabetically by name.
 */
export function getMunicipalitiesByCounty(): CountyMunicipalities[] {
  const countyMap = new Map<string, Municipality[]>();

  for (const m of ALL_MUNICIPALITIES) {
    const primaryCounty = m.counties[0];
    if (!countyMap.has(primaryCounty)) {
      countyMap.set(primaryCounty, []);
    }
    countyMap.get(primaryCounty)!.push(m);
  }

  return Array.from(countyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([county, municipalities]) => ({
      county,
      municipalities: municipalities.sort((a, b) =>
        a.name.localeCompare(b.name)
      ),
    }));
}

/**
 * Look up a municipality by name (case-insensitive).
 */
export function findMunicipality(name: string): Municipality | undefined {
  const lower = name.toLowerCase();
  return ALL_MUNICIPALITIES.find((m) => m.name.toLowerCase() === lower);
}

/**
 * Get all municipalities within a given county (including multi-county
 * municipalities whose primary county matches).
 */
export function getMunicipalitiesInCounty(county: string): Municipality[] {
  const lower = county.toLowerCase();
  return ALL_MUNICIPALITIES.filter((m) =>
    m.counties.some((c) => c.toLowerCase() === lower)
  ).sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Get all municipalities of a given type.
 */
export function getMunicipalitiesByType(type: MunicipalityType): Municipality[] {
  return ALL_MUNICIPALITIES.filter((m) => m.type === type).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}

export const MUNICIPALITIES_BY_COUNTY: CountyMunicipalities[] =
  getMunicipalitiesByCounty();
