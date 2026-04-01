import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      // Nominatim (OpenStreetMap geocoder) — proxy avoids browser CORS restriction
      '/api/nominatim': {
        target: 'https://nominatim.openstreetmap.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/nominatim/, ''),
        headers: {
          'User-Agent': 'ColoradoParcelIntelligence/1.0 (contact@coloradoparcel.com)',
          'Accept-Language': 'en',
        },
      },
      // Denver City & County — official zoning MapServer (ZONE_DISTRICT field)
      '/api/denver-zoning': {
        target: 'https://denvergov.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/denver-zoning/, '/maps/data/Zoning/MapServer'),
      },
      // FEMA National Flood Hazard Layer (NFHL) — dynamic MapServer, use /export not /tile
      '/api/fema-nfhl': {
        target: 'https://hazards.fema.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/fema-nfhl/, '/arcgis/rest/services/public/NFHL/MapServer'),
      },
      // USFS Wildfire Hazard Potential 2023 — migrated to IIPP platform (geoplatform.gov)
      '/api/wildfire': {
        target: 'https://imagery.geoplatform.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/wildfire/, '/iipp/rest/services/Fire_Aviation/USFS_EDW_RMRS_WildfireHazardPotentialClassified/ImageServer'),
      },
      // Colorado GIS ESRI parcel service — proxy avoids browser CORS restriction
      // Correct base path: gis.colorado.gov/public/rest/services/ (not /arcgis/)
      '/api/esri-co': {
        target: 'https://gis.colorado.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/esri-co/, '/public/rest/services'),
      },
      // Express backend (all other /api routes)
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
