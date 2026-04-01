// Run once: node scripts/geocodeDirectory.cjs
// Reads the business directory xlsx, geocodes each address via Nominatim,
// writes src/data/businessDirectory.json
const XLSX = require('xlsx');
const https = require('https');
const fs = require('fs');
const path = require('path');

const XLSX_PATH = '/Users/shaquillecarter/Downloads/Business Directory.xlsx';
const OUT_PATH = path.join(__dirname, '../src/data/businessDirectory.json');

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function geocode(address) {
  return new Promise((resolve) => {
    const q = encodeURIComponent(address + ', Colorado, USA');
    const options = {
      hostname: 'nominatim.openstreetmap.org',
      path: `/search?q=${q}&format=json&limit=1&countrycodes=us`,
      headers: {
        'User-Agent': 'ColoradoAtlas/1.0 (contact@coloradoatlas.com)',
        'Accept-Language': 'en',
      },
    };
    const req = https.get(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
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
    req.end();
  });
}

async function main() {
  const wb = XLSX.readFile(XLSX_PATH);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const [, ...rows] = XLSX.utils.sheet_to_json(ws, { header: 1 });

  const businesses = [];
  let geocoded = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const name    = row[0]  ? String(row[0])  : null;
    const category = row[2] ? String(row[2])  : '';
    const website  = row[3] ? String(row[3])  : '';
    const address  = row[4] ? String(row[4])  : null;
    const about    = row[7] ? String(row[7])  : '';
    const phone    = row[13] ? String(row[13]) : '';
    const email    = row[12] ? String(row[12]) : '';
    const nakedProperty = row[17] ? String(row[17]) : null;
    const nakedArticle  = row[18] ? String(row[18]) : null;

    if (!name) continue;

    process.stdout.write(`[${i+1}/${rows.length}] ${name} ... `);

    let coords = null;
    if (address) {
      coords = await geocode(address);
      await sleep(1100); // Nominatim: 1 req/sec
    }

    if (coords) { geocoded++; process.stdout.write(`✓\n`); }
    else { process.stdout.write(`✗ (no coords)\n`); }

    businesses.push({ id: i + 1, name, category, website, address, about, phone, email, nakedProperty, nakedArticle, coordinates: coords });
  }

  fs.writeFileSync(OUT_PATH, JSON.stringify(businesses, null, 2));
  console.log(`\nDone: ${geocoded}/${businesses.length} geocoded → ${OUT_PATH}`);
}

main().catch(console.error);
