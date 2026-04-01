// Retry failed geocodes with simplified addresses (strip suite/unit numbers)
const XLSX = require('xlsx');
const https = require('https');
const fs = require('fs');
const path = require('path');

const XLSX_PATH = '/Users/shaquillecarter/Downloads/Business Directory.xlsx';
const JSON_PATH = path.join(__dirname, '../src/data/businessDirectory.json');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function stripSuite(address) {
  // Remove suite/unit/floor designators: "Suite 117", "Ste. 110", "#200", "Floor 5", etc.
  return address
    .replace(/,?\s*(Suite|Ste\.?|Unit|Fl\.?|Floor|#)\s*[\w\d-]+/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function geocode(query) {
  return new Promise((resolve) => {
    const q = encodeURIComponent(query);
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
          resolve(results.length > 0 ? { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) } : null);
        } catch { resolve(null); }
      });
    });
    req.on('error', () => resolve(null));
    req.end();
  });
}

async function main() {
  // Load what we have
  const businesses = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
  const failed = businesses.filter(b => !b.coordinates && b.address);
  console.log(`Retrying ${failed.length} failed geocodes with simplified addresses…\n`);

  let fixed = 0;
  for (let i = 0; i < failed.length; i++) {
    const b = failed[i];
    const simplified = stripSuite(b.address);
    process.stdout.write(`[${i+1}/${failed.length}] ${b.name} — "${simplified}" ... `);

    const coords = await geocode(simplified);
    await sleep(1100);

    if (coords) {
      // Update in main array
      const idx = businesses.findIndex(x => x.id === b.id);
      businesses[idx].coordinates = coords;
      fixed++;
      process.stdout.write(`✓\n`);
    } else {
      process.stdout.write(`✗\n`);
    }
  }

  const total = businesses.filter(b => b.coordinates).length;
  console.log(`\nFixed: ${fixed}/${failed.length} | Total geocoded: ${total}/${businesses.length}`);
  fs.writeFileSync(JSON_PATH, JSON.stringify(businesses, null, 2));
  console.log('Saved.');
}

main().catch(console.error);
