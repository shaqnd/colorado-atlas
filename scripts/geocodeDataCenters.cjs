const https = require('https');
const fs = require('fs');
const path = require('path');

// Read xlsx using a simple zip/xml parse approach via child_process
const { execSync } = require('child_process');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function nominatimGeocode(address) {
  return new Promise((resolve) => {
    const q = encodeURIComponent(address);
    const options = {
      hostname: 'nominatim.openstreetmap.org',
      path: `/search?q=${q}&format=json&limit=1&countrycodes=us`,
      headers: { 'User-Agent': 'NakedDenver-Map/1.0 (shaq@nakeddenver.com)' }
    };
    const req = https.get(options, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        try {
          const results = JSON.parse(data);
          if (results.length > 0) {
            resolve({ lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) });
          } else {
            resolve(null);
          }
        } catch { resolve(null); }
      });
    });
    req.on('error', () => resolve(null));
  });
}

function stripSuite(addr) {
  return addr
    .replace(/\bSuite\s+[\w-]+/gi, '')
    .replace(/\bSte\.?\s+[\w-]+/gi, '')
    .replace(/\bUnit\s+[\w-]+/gi, '')
    .replace(/\s*#\s*[\w-]+/g, '')
    .replace(/,\s*,/g, ',')
    .replace(/\s+/g, ' ')
    .trim();
}

async function main() {
  // Parse xlsx with Python
  const rows = JSON.parse(execSync(`python3 -c "
import openpyxl, json
wb = openpyxl.load_workbook('/Users/shaquillecarter/Downloads/data-centers-csv.xlsx')
ws = wb.active
rows = list(ws.iter_rows(values_only=True))
headers = rows[0]
data = []
for r in rows[1:]:
    data.append({
        'id': r[0],
        'operator': r[1] or '',
        'facilityName': r[2] or '',
        'address': r[3] or '',
        'city': r[4] or '',
        'sqft': str(r[5]) if r[5] else 'N/A',
        'power': r[6] or 'N/A',
        'type': r[7] or '',
        'status': r[8] or ''
    })
print(json.dumps(data))
"`).toString().trim());

  console.log(`Geocoding ${rows.length} data centers...`);
  const results = [];

  for (const row of rows) {
    let coords = null;
    const addr = row.address;
    
    if (addr) {
      // Try full address first
      coords = await nominatimGeocode(addr);
      await sleep(1100);
      
      // Try without suite
      if (!coords) {
        const stripped = stripSuite(addr);
        if (stripped !== addr) {
          coords = await nominatimGeocode(stripped);
          await sleep(1100);
        }
      }
      
      // Try city-level fallback for vague addresses
      if (!coords && row.city && !['Denver metro', 'Denver region', 'Front Range'].includes(row.city)) {
        const cityAddr = `${row.city}, Colorado`;
        coords = await nominatimGeocode(cityAddr);
        await sleep(1100);
      }
    }
    
    const status = coords ? '✓' : '✗';
    console.log(`  ${row.facilityName} (${row.city}) ... ${status}`);
    
    results.push({
      id: row.id,
      operator: row.operator,
      facilityName: row.facilityName,
      address: row.address,
      city: row.city,
      sqft: row.sqft,
      power: row.power,
      type: row.type,
      status: row.status,
      coordinates: coords
    });
  }

  const geocoded = results.filter(r => r.coordinates).length;
  console.log(`\nGeocoded ${geocoded}/${results.length}`);

  const outPath = path.join(__dirname, '../src/data/dataCenters.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`Saved to ${outPath}`);
}

main().catch(console.error);
