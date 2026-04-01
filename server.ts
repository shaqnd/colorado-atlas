import express from 'express';
import cors from 'cors';
import https from 'https';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;

/**
 * GET /api/geocode?address=<url-encoded address>
 * Proxies the Census Bureau geocoder to avoid CORS errors from the browser.
 * Returns: { matchedAddress, lat, lng, countyFIPS, countyName, tractGEOID }
 */
app.get('/api/geocode', (req, res) => {
  const address = req.query.address as string;
  if (!address) {
    res.status(400).json({ error: 'address query param required' });
    return;
  }

  const params = new URLSearchParams({
    address,
    benchmark: 'Public_AR_Current',
    vintage: 'Census2020_Current',
    layers: 'Census Tracts',
    format: 'json',
  });

  const url = `https://geocoding.geo.census.gov/geocoder/geographies/onelineaddress?${params}`;

  https.get(url, (censusRes) => {
    let data = '';
    censusRes.on('data', (chunk) => { data += chunk; });
    censusRes.on('end', () => {
      try {
        const json = JSON.parse(data);
        const matches = json?.result?.addressMatches;

        if (!matches || matches.length === 0) {
          res.status(404).json({ error: 'No address match found' });
          return;
        }

        const match = matches[0];
        const coords = match.coordinates;
        const geographies = match.geographies;
        const county = geographies?.Counties?.[0];
        const tract = geographies?.['Census Tracts']?.[0];

        res.json({
          matchedAddress: match.matchedAddress,
          lat: coords?.y ?? null,
          lng: coords?.x ?? null,
          countyFIPS: county?.GEOID ?? null,
          countyName: county?.NAME ?? null,
          tractGEOID: tract?.GEOID ?? null,
        });
      } catch {
        res.status(500).json({ error: 'Failed to parse Census response' });
      }
    });
  }).on('error', (err) => {
    res.status(502).json({ error: `Census geocoder unreachable: ${err.message}` });
  });
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Geocoder proxy running at http://localhost:${PORT}`);
});
