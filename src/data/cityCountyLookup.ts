// Colorado city/town → county mapping (lowercase keys)
// Cities spanning multiple counties use string arrays.
// Sources: Colorado Secretary of State municipal list,
//          Census Bureau TIGER/Line, DOLA municipal database
// Last updated: 2026-03-27 — covers all 64 counties
// ============================================================

export const cityCountyLookup: Record<string, string | string[]> = {

  // ── MULTI-COUNTY CITIES ──────────────────────────────────────
  aurora:              ['Arapahoe', 'Adams', 'Douglas'],
  arvada:              ['Jefferson', 'Adams'],
  'commerce city':     ['Adams', 'Denver'],
  westminster:         ['Jefferson', 'Adams'],
  broomfield:          ['Broomfield'],
  erie:                ['Boulder', 'Weld'],
  longmont:            ['Boulder', 'Weld'],
  superior:            ['Boulder', 'Jefferson'],
  berthoud:            ['Larimer', 'Weld'],
  timnath:             ['Larimer', 'Weld'],
  windsor:             ['Larimer', 'Weld'],
  'black hawk':        ['Gilpin', 'Clear Creek'],
  'green mountain falls': ['El Paso', 'Teller'],
  basalt:              ['Pitkin', 'Eagle'],
  littleton:           ['Arapahoe', 'Jefferson', 'Douglas'],
  'castle pines':      ['Douglas'],

  // ── ADAMS COUNTY ─────────────────────────────────────────────
  brighton:            'Adams',
  'federal heights':   'Adams',
  northglenn:          'Adams',
  thornton:            'Adams',
  bennett:             'Adams',
  strasburg:           'Adams',
  hudson:              'Adams',
  lochbuie:            'Adams',

  // ── ALAMOSA COUNTY ───────────────────────────────────────────
  alamosa:             'Alamosa',
  hooper:              'Alamosa',

  // ── ARAPAHOE COUNTY ──────────────────────────────────────────
  centennial:          'Arapahoe',
  'cherry hills village': 'Arapahoe',
  'columbine valley':  'Arapahoe',
  'deer trail':        'Arapahoe',
  englewood:           'Arapahoe',
  foxfield:            'Arapahoe',
  glendale:            'Arapahoe',
  'greenwood village': 'Arapahoe',
  sheridan:            'Arapahoe',

  // ── ARCHULETA COUNTY ─────────────────────────────────────────
  'pagosa springs':    'Archuleta',
  'pagosa junction':   'Archuleta',

  // ── BACA COUNTY ──────────────────────────────────────────────
  springfield:         'Baca',
  walsh:               'Baca',
  pritchett:           'Baca',
  'two buttes':        'Baca',

  // ── BENT COUNTY ──────────────────────────────────────────────
  'las animas':        'Bent',
  mcclave:             'Bent',
  hasty:               'Bent',

  // ── BOULDER COUNTY ───────────────────────────────────────────
  boulder:             'Boulder',
  jamestown:           'Boulder',
  lafayette:           'Boulder',
  louisville:          'Boulder',
  lyons:               'Boulder',
  nederland:           'Boulder',
  ward:                'Boulder',
  'left hand':         'Boulder',
  niwot:               'Boulder',

  // ── CHAFFEE COUNTY ───────────────────────────────────────────
  salida:              'Chaffee',
  'buena vista':       'Chaffee',
  'poncha springs':    'Chaffee',
  maysville:           'Chaffee',

  // ── CHEYENNE COUNTY ──────────────────────────────────────────
  'cheyenne wells':    'Cheyenne',
  'kit carson':        'Cheyenne',

  // ── CLEAR CREEK COUNTY ───────────────────────────────────────
  georgetown:          'Clear Creek',
  'idaho springs':     'Clear Creek',
  'empire':            'Clear Creek',
  'silver plume':      'Clear Creek',
  'dumont':            'Clear Creek',

  // ── CONEJOS COUNTY ───────────────────────────────────────────
  'la jara':           'Conejos',
  antonito:            'Conejos',
  romeo:               'Conejos',
  manassa:             'Conejos',
  'san antonio':       'Conejos',
  lasauses:            'Conejos',

  // ── COSTILLA COUNTY ──────────────────────────────────────────
  'fort garland':      'Costilla',
  'san luis':          'Costilla',
  blanca:              'Costilla',

  // ── CROWLEY COUNTY ───────────────────────────────────────────
  ordway:              'Crowley',
  'olney springs':     'Crowley',
  'sugar city':        'Crowley',

  // ── CUSTER COUNTY ────────────────────────────────────────────
  westcliffe:          'Custer',
  'silver cliff':      'Custer',

  // ── DELTA COUNTY ─────────────────────────────────────────────
  delta:               'Delta',
  cedaredge:           'Delta',
  crawford:            'Delta',
  hotchkiss:           'Delta',
  'orchard city':      'Delta',
  paonia:              'Delta',

  // ── DENVER COUNTY ────────────────────────────────────────────
  denver:              'Denver',

  // ── DOLORES COUNTY ───────────────────────────────────────────
  'dove creek':        'Dolores',
  rico:                'Dolores',

  // ── DOUGLAS COUNTY ───────────────────────────────────────────
  'castle rock':       'Douglas',
  'highlands ranch':   'Douglas',
  larkspur:            'Douglas',
  'lone tree':         'Douglas',
  parker:              'Douglas',
  'perry park':        'Douglas',
  'roxborough park':   'Douglas',
  sedalia:             'Douglas',
  franktown:           'Douglas',

  // ── EAGLE COUNTY ─────────────────────────────────────────────
  vail:                'Eagle',
  avon:                'Eagle',
  eagle:               'Eagle',
  gypsum:              'Eagle',
  minturn:             'Eagle',
  'red cliff':         'Eagle',
  'edwards':           'Eagle',
  'el jebel':          'Eagle',

  // ── EL PASO COUNTY ───────────────────────────────────────────
  'colorado springs':  'El Paso',
  monument:            'El Paso',
  fountain:            'El Paso',
  'manitou springs':   'El Paso',
  'palmer lake':       'El Paso',
  calhan:              'El Paso',
  ramah:               'El Paso',
  'black forest':      'El Paso',
  peyton:              'El Paso',
  'falcon':            'El Paso',
  'security':          'El Paso',
  'widefield':         'El Paso',
  'cimarron hills':    'El Paso',

  // ── ELBERT COUNTY ────────────────────────────────────────────
  elizabeth:           'Elbert',
  kiowa:               'Elbert',
  simla:               'Elbert',
  elbert:              'Elbert',
  matheson:            'Elbert',
  agate:               'Elbert',
  'horse creek':       'Elbert',

  // ── FREMONT COUNTY ───────────────────────────────────────────
  'canon city':        'Fremont',
  florence:            'Fremont',
  penrose:             'Fremont',
  brookside:           'Fremont',
  'coal creek':        'Fremont',
  rockvale:            'Fremont',
  howard:              'Fremont',

  // ── GARFIELD COUNTY ──────────────────────────────────────────
  'glenwood springs':  'Garfield',
  carbondale:          'Garfield',
  'new castle':        'Garfield',
  parachute:           'Garfield',
  rifle:               'Garfield',
  silt:                'Garfield',
  battlement:          'Garfield',

  // ── GILPIN COUNTY ────────────────────────────────────────────
  'central city':      'Gilpin',
  rollinsville:        'Gilpin',
  'coal creek canyon': 'Gilpin',

  // ── GRAND COUNTY ─────────────────────────────────────────────
  fraser:              'Grand',
  granby:              'Grand',
  'grand lake':        'Grand',
  'hot sulphur springs': 'Grand',
  kremmling:           'Grand',
  'winter park':       'Grand',
  tabernash:           'Grand',
  'parshall':          'Grand',
  'glen haven':        'Grand',

  // ── GUNNISON COUNTY ──────────────────────────────────────────
  gunnison:            'Gunnison',
  'crested butte':     'Gunnison',
  'mount crested butte': 'Gunnison',
  'mt crested butte':  'Gunnison',
  almont:              'Gunnison',
  marble:              'Gunnison',
  pitkin:              'Gunnison',
  'ohio city':         'Gunnison',
  parlin:              'Gunnison',

  // ── HINSDALE COUNTY ──────────────────────────────────────────
  'lake city':         'Hinsdale',

  // ── HUERFANO COUNTY ──────────────────────────────────────────
  walsenburg:          'Huerfano',
  'la veta':           'Huerfano',

  // ── JACKSON COUNTY ───────────────────────────────────────────
  walden:              'Jackson',
  'north park':        'Jackson',

  // ── JEFFERSON COUNTY ─────────────────────────────────────────
  lakewood:            'Jefferson',
  golden:              'Jefferson',
  'wheat ridge':       'Jefferson',
  edgewater:           'Jefferson',
  'mountain view':     'Jefferson',
  morrison:            'Jefferson',
  evergreen:           'Jefferson',
  conifer:             'Jefferson',
  pine:                'Jefferson',
  kittredge:           'Jefferson',
  'indian hills':      'Jefferson',
  'genesee':           'Jefferson',
  'lakeside':          'Jefferson',

  // ── KIOWA COUNTY ─────────────────────────────────────────────
  eads:                'Kiowa',
  haswell:             'Kiowa',
  'sheridan lake':     'Kiowa',
  towner:              'Kiowa',

  // ── KIT CARSON COUNTY ────────────────────────────────────────
  burlington:          'Kit Carson',
  bethune:             'Kit Carson',
  flagler:             'Kit Carson',
  seibert:             'Kit Carson',
  stratton:            'Kit Carson',
  vona:                'Kit Carson',

  // ── LA PLATA COUNTY ──────────────────────────────────────────
  durango:             'La Plata',
  bayfield:            'La Plata',
  ignacio:             'La Plata',
  'hesperus':          'La Plata',
  'loma linda':        'La Plata',

  // ── LAKE COUNTY ──────────────────────────────────────────────
  leadville:           'Lake',

  // ── LARIMER COUNTY ───────────────────────────────────────────
  'fort collins':      'Larimer',
  loveland:            'Larimer',
  'estes park':        'Larimer',
  wellington:          'Larimer',
  'red feather lakes': 'Larimer',
  laporte:             'Larimer',

  // ── LAS ANIMAS COUNTY ────────────────────────────────────────
  trinidad:            'Las Animas',
  aguilar:             'Las Animas',
  cokedale:            'Las Animas',
  starkville:          'Las Animas',
  ludlow:              'Las Animas',
  madrid:              'Las Animas',

  // ── LINCOLN COUNTY ───────────────────────────────────────────
  limon:               'Lincoln',
  hugo:                'Lincoln',
  arriba:              'Lincoln',
  genoa:               'Lincoln',
  karval:              'Lincoln',

  // ── LOGAN COUNTY ─────────────────────────────────────────────
  sterling:            'Logan',
  fleming:             'Logan',
  iliff:               'Logan',
  merino:              'Logan',
  peetz:               'Logan',
  crook:               'Logan',

  // ── MESA COUNTY ──────────────────────────────────────────────
  'grand junction':    'Mesa',
  fruita:              'Mesa',
  palisade:            'Mesa',
  collbran:            'Mesa',
  'de beque':          'Mesa',
  mack:                'Mesa',
  loma:                'Mesa',
  clifton:             'Mesa',

  // ── MINERAL COUNTY ───────────────────────────────────────────
  creede:              'Mineral',

  // ── MOFFAT COUNTY ────────────────────────────────────────────
  craig:               'Moffat',
  dinosaur:            'Moffat',
  maybell:             'Moffat',
  'blue mountain':     'Moffat',

  // ── MONTEZUMA COUNTY ─────────────────────────────────────────
  cortez:              'Montezuma',
  dolores:             'Montezuma',
  mancos:              'Montezuma',
  towaoc:              'Montezuma',
  'lewis':             'Montezuma',

  // ── MONTROSE COUNTY ──────────────────────────────────────────
  montrose:            'Montrose',
  naturita:            'Montrose',
  norwood:             'Montrose',
  nucla:               'Montrose',
  olathe:              'Montrose',

  // ── MORGAN COUNTY ────────────────────────────────────────────
  'fort morgan':       'Morgan',
  brush:               'Morgan',
  wiggins:             'Morgan',
  'log lane village':  'Morgan',
  weldona:             'Morgan',
  snyder:              'Morgan',

  // ── OTERO COUNTY ─────────────────────────────────────────────
  'la junta':          'Otero',
  'rocky ford':        'Otero',
  fowler:              'Otero',
  swink:               'Otero',
  manzanola:           'Otero',
  cheraw:              'Otero',

  // ── OURAY COUNTY ─────────────────────────────────────────────
  ouray:               'Ouray',
  ridgway:             'Ouray',
  'log hill village':  'Ouray',

  // ── PARK COUNTY ──────────────────────────────────────────────
  bailey:              'Park',
  fairplay:            'Park',
  alma:                'Park',
  hartsel:             'Park',
  como:                'Park',
  'jefferson village': 'Park',

  // ── PHILLIPS COUNTY ──────────────────────────────────────────
  holyoke:             'Phillips',
  haxtun:              'Phillips',
  amherst:             'Phillips',

  // ── PITKIN COUNTY ────────────────────────────────────────────
  aspen:               'Pitkin',
  'snowmass village':  'Pitkin',
  'snowmass':          'Pitkin',

  // ── PROWERS COUNTY ───────────────────────────────────────────
  lamar:               'Prowers',
  granada:             'Prowers',
  holly:               'Prowers',
  wiley:               'Prowers',
  'bristol':           'Prowers',

  // ── PUEBLO COUNTY ────────────────────────────────────────────
  pueblo:              'Pueblo',
  'pueblo west':       'Pueblo',
  beulah:              'Pueblo',

  // ── RIO BLANCO COUNTY ────────────────────────────────────────
  meeker:              'Rio Blanco',
  rangely:             'Rio Blanco',

  // ── RIO GRANDE COUNTY ────────────────────────────────────────
  'monte vista':       'Rio Grande',
  'del norte':         'Rio Grande',
  'south fork':        'Rio Grande',

  // ── ROUTT COUNTY ─────────────────────────────────────────────
  'steamboat springs': 'Routt',
  hayden:              'Routt',
  'oak creek':         'Routt',
  yampa:               'Routt',
  'soroco':            'Routt',
  phippsburg:          'Routt',

  // ── SAGUACHE COUNTY ──────────────────────────────────────────
  saguache:            'Saguache',
  center:              'Saguache',
  moffat:              'Saguache',
  'villa grove':       'Saguache',
  'crestone':          'Saguache',

  // ── SAN JUAN COUNTY ──────────────────────────────────────────
  silverton:           'San Juan',

  // ── SAN MIGUEL COUNTY ────────────────────────────────────────
  telluride:           'San Miguel',
  'mountain village':  'San Miguel',
  ophir:               'San Miguel',

  // ── SEDGWICK COUNTY ──────────────────────────────────────────
  julesburg:           'Sedgwick',
  ovid:                'Sedgwick',
  sedgwick:            'Sedgwick',

  // ── SUMMIT COUNTY ────────────────────────────────────────────
  breckenridge:        'Summit',
  frisco:              'Summit',
  dillon:              'Summit',
  keystone:            'Summit',
  silverthorne:        'Summit',
  'blue river':        'Summit',
  'montezuma':         'Summit',
  'copper mountain':   'Summit',

  // ── TELLER COUNTY ────────────────────────────────────────────
  'cripple creek':     'Teller',
  victor:              'Teller',
  'woodland park':     'Teller',
  divide:              'Teller',
  'florissant':        'Teller',

  // ── WASHINGTON COUNTY ────────────────────────────────────────
  akron:               'Washington',
  otis:                'Washington',
  woodrow:             'Washington',
  'last chance':       'Washington',

  // ── WELD COUNTY ──────────────────────────────────────────────
  greeley:             'Weld',
  evans:               'Weld',
  firestone:           'Weld',
  frederick:           'Weld',
  gilcrest:            'Weld',
  johnstown:           'Weld',
  keenesburg:          'Weld',
  kersey:              'Weld',
  lasalle:             'Weld',
  mead:                'Weld',
  milliken:            'Weld',
  nunn:                'Weld',
  platteville:         'Weld',
  severance:           'Weld',
  'garden city':       'Weld',
  grover:              'Weld',
  ault:                'Weld',
  eaton:               'Weld',
  'pierce':            'Weld',
  galeton:             'Weld',
  'fort lupton':       'Weld',

  // ── YUMA COUNTY ──────────────────────────────────────────────
  wray:                'Yuma',
  yuma:                'Yuma',
  eckley:              'Yuma',
  idalia:              'Yuma',
  'wauneta':           'Yuma',
};

/**
 * Look up county (or counties) for a given city name.
 * Returns undefined if not found.
 */
export function lookupCountyByCity(city: string): string | string[] | undefined {
  return cityCountyLookup[city.toLowerCase().trim()];
}

/**
 * Returns the primary county name (first if multi-county).
 */
export function primaryCounty(city: string): string | undefined {
  const result = lookupCountyByCity(city);
  if (!result) return undefined;
  return Array.isArray(result) ? result[0] : result;
}
