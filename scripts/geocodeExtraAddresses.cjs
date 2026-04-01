// Geocodes Address 2 and Address 3 for businesses that have them,
// adds an `allLocations` array to each entry in businessDirectory.json.
const XLSX = require('xlsx');
const https = require('https');
const fs = require('fs');
const path = require('path');

const XLSX_PATH = '/Users/shaquillecarter/Downloads/Business Directory.xlsx';
const JSON_PATH = path.join(__dirname, '../src/data/businessDirectory.json');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function stripSuite(addr) {
  return addr.replace(/,?\s*(Suite|Ste\.?|Unit|Fl\.?|Floor|#)\s*[\w\d-]+/gi, '').replace(/\s+/g, ' ').trim();
}

function geocode(address) {
  return new Promise((resolve) => {
    const q = encodeURIComponent(stripSuite(address));
    const options = {
      hostname: 'nominatim.openstreetmap.org',
      path: `/search?q=${q}&format=json&limit=1&countrycodes=us`,
      headers: { 'User-Agent': 'ColoradoAtlas/1.0', 'Accept-Language': 'en' },
    };
    const req = https.get(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const r = JSON.parse(data);
          resolve(r.length > 0 ? { lat: parseFloat(r[0].lat), lng: parseFloat(r[0].lon) } : null);
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

  // Build a name → [addr1, addr2, addr3] map from xlsx
  const xlsxAddrs = {};
  rows.forEach(r => {
    const name = r[0] ? String(r[0]).trim() : null;
    if (!name) return;
    xlsxAddrs[name] = [
      r[4] ? String(r[4]).trim() : null,
      r[5] ? String(r[5]).trim() : null,
      r[6] ? String(r[6]).trim() : null,
    ];
  });

  const businesses = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
  let totalFixed = 0;

  for (const biz of businesses) {
    const addrs = xlsxAddrs[biz.name] || [biz.address, null, null];

    // Build allLocations starting from whatever we already have
    const locations = [];

    // Primary (already geocoded)
    if (biz.coordinates) {
      locations.push({ address: biz.address, ...biz.coordinates });
    } else if (addrs[0]) {
      // Try primary if it failed before
      const coords = await geocode(addrs[0]);
      await sleep(1100);
      if (coords) { locations.push({ address: addrs[0], ...coords }); }
    }

    // Extra addresses
    for (let i = 1; i <= 2; i++) {
      const addr = addrs[i];
      if (!addr) continue;
      process.stdout.write(`  ${biz.name} — addr${i+1}: "${stripSuite(addr)}" ... `);
      const coords = await geocode(addr);
      await sleep(1100);
      if (coords) {
        locations.push({ address: addr, ...coords });
        process.stdout.write(`✓\n`);
        totalFixed++;
      } else {
        process.stdout.write(`✗\n`);
      }
    }

    biz.allLocations = locations;
  }

  fs.writeFileSync(JSON_PATH, JSON.stringify(businesses, null, 2));
  console.log(`\nAdded ${totalFixed} extra locations. Saved.`);
}

main().catch(console.error);
