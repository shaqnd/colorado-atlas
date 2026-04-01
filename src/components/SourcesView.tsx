import { Card } from './Layout';

const SOURCES = [
  {
    category: 'Property Tax',
    color: 'red',
    items: [
      {
        name: 'Colorado Division of Property Taxation (DPT)',
        description: 'Official source for assessment rates, mill levy certifications, annual reports, and property tax maps.',
        url: 'https://cdola.colorado.gov/assessment-rates',
        type: 'Government',
      },
      {
        name: 'ACS Tax Data — taxbycounty.com',
        description: 'Aggregated ACS-derived effective tax rates, median tax bills, and median home values by county.',
        url: 'https://taxbycounty.com/colorado',
        type: 'Aggregator',
      },
      {
        name: 'Colorado Sunshine Law — CRS 39-1-104',
        description: 'Assessment rate statutes. Key sections: 39-1-104 (rates), 39-5-121 (notice), 39-8-107 (appeals).',
        url: 'https://leg.colorado.gov/topics/taxation',
        type: 'Statute',
      },
    ],
  },
  {
    category: 'Demographics & Population',
    color: 'blue',
    items: [
      {
        name: 'DOLA Demography Office',
        description: 'Official Colorado state population estimates, county-level forecasts, and demographic profiles.',
        url: 'https://demography.dola.colorado.gov',
        type: 'Government',
      },
      {
        name: 'Census Bureau — Population Estimates Program (PEP)',
        description: 'Annual county-level population estimates between decennial censuses. Used for current population figures.',
        url: 'https://www.census.gov/programs-surveys/popest.html',
        type: 'Government',
      },
      {
        name: 'American Community Survey (ACS) 5-Year',
        description: '5-year rolling survey data. Used for income, housing values, and demographic characteristics.',
        url: 'https://www.census.gov/programs-surveys/acs',
        type: 'Government',
      },
    ],
  },
  {
    category: 'Comprehensive Plans',
    color: 'orange',
    items: [
      {
        name: 'DOLA Land Planning & Community Development',
        description: 'Guidance documents, comp plan update grants (LPC grants), and planning resources for Colorado jurisdictions.',
        url: 'https://cdola.colorado.gov/land-planning-community-development',
        type: 'Government',
      },
      {
        name: 'DOLA LPC Grant Awards',
        description: 'List of Local Planning Capacity grant recipients — identifies counties actively updating comp plans.',
        url: 'https://cdola.colorado.gov/land-planning-community-development/grants',
        type: 'Government',
      },
    ],
  },
  {
    category: 'Open Meetings & CORA',
    color: 'purple',
    items: [
      {
        name: 'DOLA Local Government Information System (LGIS)',
        description: 'Master inventory of Colorado local governments — meeting schedules, clerk contacts, website URLs. CRS 24-32-116.',
        url: 'https://dola.colorado.gov/lgis/lgHomePage.jsf',
        type: 'Government',
      },
      {
        name: 'Colorado Sunshine Law — CRS 24-6-402',
        description: 'Open Meetings Law. Governs public notice, executive sessions, and meeting notification lists.',
        url: 'https://leg.colorado.gov/sites/default/files/images/olls/crs2023-title-24.pdf',
        type: 'Statute',
      },
      {
        name: 'Colorado Open Records Act (CORA) — CRS 24-72-201',
        description: 'Public records access statute. 3-day inspection deadline, 7-day copy deadline. Fee waiver provisions.',
        url: 'https://leg.colorado.gov/sites/default/files/images/olls/crs2023-title-24.pdf',
        type: 'Statute',
      },
    ],
  },
  {
    category: 'Zoning & Land Use',
    color: 'green',
    items: [
      {
        name: 'Municode Colorado',
        description: 'Hosted zoning codes for ~30 Colorado counties and municipalities. Searchable full text.',
        url: 'https://library.municode.com/co',
        type: 'Platform',
      },
      {
        name: 'Colorado Municipal League (CML) Directory',
        description: 'Directory of all Colorado municipalities with contact information and website links.',
        url: 'https://www.cml.org/municipalities/municipal-directory',
        type: 'Association',
      },
      {
        name: 'Colorado Association of Counties (CACo)',
        description: 'County directory, commissioner contacts, and county government resources.',
        url: 'https://cacionline.org',
        type: 'Association',
      },
    ],
  },
  {
    category: 'Geocoding & GIS',
    color: 'indigo',
    items: [
      {
        name: 'Census Bureau Geocoder',
        description: 'Free address-to-coordinates API. Returns county FIPS, tract GEOID, and matched address. Used as primary geocoder.',
        url: 'https://geocoding.geo.census.gov/geocoder',
        type: 'API',
      },
      {
        name: 'Colorado State Demography Office GIS',
        description: 'Statewide GIS layers: county boundaries, census tracts, demographics. ESRI format.',
        url: 'https://demography.dola.colorado.gov/gis-data',
        type: 'Government',
      },
    ],
  },
];

const colorMap: Record<string, string> = {
  red:    'bg-red-50 border-red-100 text-red-800',
  blue:   'bg-blue-50 border-blue-100 text-blue-800',
  orange: 'bg-orange-50 border-orange-100 text-orange-800',
  purple: 'bg-purple-50 border-purple-100 text-purple-800',
  green:  'bg-green-50 border-green-100 text-green-800',
  indigo: 'bg-indigo-50 border-indigo-100 text-indigo-800',
};

const typeBadge: Record<string, string> = {
  Government: 'bg-blue-100 text-blue-700',
  Statute:    'bg-orange-100 text-orange-700',
  API:        'bg-green-100 text-green-700',
  Platform:   'bg-purple-100 text-purple-700',
  Association:'bg-gray-100 text-gray-700',
  Aggregator: 'bg-yellow-100 text-yellow-700',
};

export function SourcesView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Data Sources &amp; References</h2>
        <p className="text-sm text-gray-500 mt-0.5">All data sources used to build this platform, with direct links.</p>
      </div>

      {SOURCES.map((group) => (
        <Card key={group.category} className="overflow-hidden">
          <div className={`px-5 py-3 border-b font-semibold text-sm ${colorMap[group.color]}`}>
            {group.category}
          </div>
          <div className="divide-y divide-gray-50">
            {group.items.map((item) => (
              <div key={item.name} className="px-5 py-4 flex items-start gap-4 hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-sm text-indigo-700 hover:underline"
                    >
                      {item.name} ↗
                    </a>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeBadge[item.type] ?? 'bg-gray-100 text-gray-600'}`}>
                      {item.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">{item.description}</p>
                  <p className="text-xs text-gray-400 mt-1 font-mono">{item.url}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
