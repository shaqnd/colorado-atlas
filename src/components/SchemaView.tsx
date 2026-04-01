import { Card } from './Layout';

const TABLES = [
  {
    name: 'counties',
    description: 'Master county record — one row per CO county',
    columns: [
      { name: 'id', type: 'uuid', pk: true, note: 'FIPS-based UUID' },
      { name: 'fips', type: 'text', note: '5-digit FIPS code (e.g. 08013)' },
      { name: 'name', type: 'text', note: 'County name (no "County" suffix)' },
      { name: 'seat', type: 'text', note: 'County seat city' },
      { name: 'population', type: 'integer', note: 'Latest Census PEP estimate' },
      { name: 'population_5yr', type: 'integer', note: '~5-year prior estimate' },
      { name: 'population_10yr', type: 'integer', note: '~10-year prior estimate' },
      { name: 'eff_tax_rate', type: 'numeric(6,4)', note: 'Effective rate as decimal' },
      { name: 'median_tax', type: 'integer', note: 'Median annual tax $' },
      { name: 'median_home', type: 'integer', note: 'Median home value $' },
      { name: 'county_mill', type: 'numeric(8,3)', note: 'County-only mill levy' },
      { name: 'comp_plan_name', type: 'text', note: '' },
      { name: 'comp_plan_year', type: 'smallint', note: 'Year adopted' },
      { name: 'comp_plan_status', type: 'text', note: 'current|aging|overdue|updating' },
      { name: 'comp_plan_horizon', type: 'smallint', note: 'Horizon year if stated' },
      { name: 'zoning_code_name', type: 'text', note: '' },
      { name: 'zoning_url', type: 'text', note: '' },
      { name: 'gis_portal', type: 'text', note: '' },
      { name: 'bcc_schedule', type: 'text', note: '' },
      { name: 'bcc_agenda_url', type: 'text', note: '' },
      { name: 'bcc_video_source', type: 'text', note: '' },
      { name: 'pc_schedule', type: 'text', note: '' },
      { name: 'pc_name', type: 'text', note: '' },
      { name: 'assessor_url', type: 'text', note: '' },
      { name: 'assessor_platform', type: 'text', note: '' },
      { name: 'assessor_has_open_data', type: 'boolean', note: '' },
      { name: 'updated_at', type: 'timestamptz', note: '' },
    ],
    source: 'Manual curation + ACS 5yr + Census PEP',
  },
  {
    name: 'places',
    description: 'Colorado incorporated cities & towns',
    columns: [
      { name: 'id', type: 'uuid', pk: true, note: '' },
      { name: 'name', type: 'text', note: 'City/town name' },
      { name: 'county_id', type: 'uuid', note: 'FK → counties.id (primary county)' },
      { name: 'county_ids', type: 'uuid[]', note: 'All counties (multi-county cities)' },
      { name: 'place_fips', type: 'text', note: 'Census place FIPS' },
      { name: 'population', type: 'integer', note: '' },
      { name: 'lat', type: 'numeric(9,6)', note: '' },
      { name: 'lng', type: 'numeric(9,6)', note: '' },
    ],
    source: 'Census TIGER/Line, CML Municipal Directory',
  },
  {
    name: 'tracts',
    description: 'Census tracts within Colorado',
    columns: [
      { name: 'geoid', type: 'text', pk: true, note: '11-digit GEOID' },
      { name: 'county_id', type: 'uuid', note: 'FK → counties.id' },
      { name: 'name', type: 'text', note: 'Tract name' },
      { name: 'population', type: 'integer', note: '' },
      { name: 'median_income', type: 'integer', note: 'ACS 5yr' },
      { name: 'geom', type: 'geometry(polygon,4326)', note: 'Tract boundary' },
    ],
    source: 'Census TIGER/Line ACS 5yr',
  },
  {
    name: 'parcels',
    description: 'Individual parcel records (county-sourced)',
    columns: [
      { name: 'id', type: 'uuid', pk: true, note: '' },
      { name: 'county_id', type: 'uuid', note: 'FK → counties.id' },
      { name: 'parcel_id', type: 'text', note: "Assessor's parcel number (APN)" },
      { name: 'situs_address', type: 'text', note: 'Site address' },
      { name: 'owner_name', type: 'text', note: '' },
      { name: 'land_use_code', type: 'text', note: "Assessor's use code" },
      { name: 'zone_district', type: 'text', note: 'Current zoning designation' },
      { name: 'actual_value', type: 'integer', note: 'Assessor actual value $' },
      { name: 'assessed_value', type: 'integer', note: '' },
      { name: 'lot_size_sqft', type: 'integer', note: '' },
      { name: 'year_built', type: 'smallint', note: '' },
      { name: 'geom', type: 'geometry(polygon,4326)', note: 'Parcel boundary' },
      { name: 'tract_geoid', type: 'text', note: 'FK → tracts.geoid' },
      { name: 'last_sale_date', type: 'date', note: '' },
      { name: 'last_sale_price', type: 'integer', note: '' },
    ],
    source: 'County assessor open data portals',
  },
  {
    name: 'permits',
    description: 'Building permits and land use applications',
    columns: [
      { name: 'id', type: 'uuid', pk: true, note: '' },
      { name: 'county_id', type: 'uuid', note: 'FK → counties.id' },
      { name: 'parcel_id', type: 'uuid', note: 'FK → parcels.id' },
      { name: 'permit_number', type: 'text', note: '' },
      { name: 'permit_type', type: 'text', note: 'building|rezoning|variance|cup|subdivision' },
      { name: 'status', type: 'text', note: 'pending|approved|denied|appealed' },
      { name: 'applied_date', type: 'date', note: '' },
      { name: 'decision_date', type: 'date', note: '' },
      { name: 'description', type: 'text', note: '' },
      { name: 'hearing_id', type: 'uuid', note: 'FK → hearings.id' },
    ],
    source: 'County planning portals, CORA requests',
  },
  {
    name: 'hearings',
    description: 'BCC and Planning Commission meeting records',
    columns: [
      { name: 'id', type: 'uuid', pk: true, note: '' },
      { name: 'county_id', type: 'uuid', note: 'FK → counties.id' },
      { name: 'body_name', type: 'text', note: 'e.g. "Board of County Commissioners"' },
      { name: 'meeting_date', type: 'date', note: '' },
      { name: 'meeting_time', type: 'time', note: '' },
      { name: 'agenda_url', type: 'text', note: '' },
      { name: 'minutes_url', type: 'text', note: '' },
      { name: 'video_url', type: 'text', note: '' },
      { name: 'video_platform', type: 'text', note: 'YouTube|Granicus|Viebit|Other' },
      { name: 'agenda_items', type: 'jsonb', note: 'Structured agenda items array' },
      { name: 'scraped_at', type: 'timestamptz', note: '' },
    ],
    source: 'CORA requests, clerk notification lists, DOLA LGIS',
  },
  {
    name: 'tax_rates',
    description: 'Historical and current assessment rates',
    columns: [
      { name: 'id', type: 'uuid', pk: true, note: '' },
      { name: 'tax_year', type: 'smallint', note: '' },
      { name: 'classification', type: 'text', note: '' },
      { name: 'local_gov_rate', type: 'numeric(6,4)', note: '' },
      { name: 'school_rate', type: 'numeric(6,4)', note: '' },
      { name: 'statute', type: 'text', note: 'Authorizing statute' },
    ],
    source: 'CRS 39-1-104, DPT, Legislative Council',
  },
  {
    name: 'mill_levies',
    description: 'Entity-level mill levies by county and year',
    columns: [
      { name: 'id', type: 'uuid', pk: true, note: '' },
      { name: 'county_id', type: 'uuid', note: 'FK → counties.id' },
      { name: 'tax_year', type: 'smallint', note: '' },
      { name: 'entity_name', type: 'text', note: '' },
      { name: 'entity_type', type: 'text', note: 'county|municipality|school|fire|water|metro|library|other' },
      { name: 'mills', type: 'numeric(8,3)', note: '' },
    ],
    source: 'County treasurer certification, DOLA',
  },
];

const TRACT_STEPS = [
  'Address → Census geocoder → returns tract GEOID + county FIPS',
  'Parcel geometry intersect with tract polygons → assign tract_geoid',
  'Population-weight ACS variables from tract to parcel',
  'Join mill levies: parcel county_id + tax_year → entity levies',
  'Compute assessed value by classification rate × actual value → taxes',
];

export function SchemaView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Database Schema</h2>
        <p className="text-sm text-gray-500 mt-0.5">Proposed relational schema for the Colorado Atlas backend. PostgreSQL + PostGIS.</p>
      </div>

      {/* Tract allocation model */}
      <Card className="p-5">
        <h3 className="font-semibold text-gray-800 mb-3">Tract Allocation Model</h3>
        <div className="flex flex-col gap-2">
          {TRACT_STEPS.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i+1}</div>
              <p className="text-sm text-gray-700">{step}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Tables */}
      <div className="space-y-4">
        {TABLES.map((table) => (
          <Card key={table.name} className="overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-start justify-between gap-4">
              <div>
                <code className="text-base font-bold text-indigo-700">{table.name}</code>
                <p className="text-xs text-gray-500 mt-0.5">{table.description}</p>
              </div>
              <span className="text-xs text-gray-400 shrink-0">Source: {table.source}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-gray-500 border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left px-5 py-2 font-medium">Column</th>
                    <th className="text-left px-3 py-2 font-medium">Type</th>
                    <th className="text-left px-3 py-2 font-medium">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {table.columns.map((col) => (
                    <tr key={col.name} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-5 py-1.5">
                        <code className={`font-mono ${col.pk ? 'text-indigo-700 font-bold' : 'text-gray-800'}`}>{col.name}</code>
                        {col.pk && <span className="ml-1.5 text-xs bg-indigo-100 text-indigo-600 rounded px-1">PK</span>}
                      </td>
                      <td className="px-3 py-1.5"><code className="text-green-700 font-mono">{col.type}</code></td>
                      <td className="px-3 py-1.5 text-gray-500">{col.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
