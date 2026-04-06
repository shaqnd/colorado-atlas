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
      // Denver assessor tables — residential characteristics
      '/api/denver-residential': {
        target: 'https://services1.arcgis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(
          /^\/api\/denver-residential/,
          '/zdB7qR0BtYrg0Xpl/arcgis/rest/services/ODC_real_property_residential_characteristics/FeatureServer/59'
        ),
      },
      // Denver assessor tables — apartment/commercial characteristics
      '/api/denver-commercial': {
        target: 'https://services1.arcgis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(
          /^\/api\/denver-commercial/,
          '/zdB7qR0BtYrg0Xpl/arcgis/rest/services/ODC_real_property_apartment_and_commercial_characteristics/FeatureServer/58'
        ),
      },
      // Aurora City — official zoning MapServer (layer 20, OpenData service)
      '/api/aurora-zoning': {
        target: 'https://ags.auroragov.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/aurora-zoning/, '/aurora/rest/services/OpenData/MapServer'),
      },
      // Centennial — Current Land Use MapServer (layer 0) + FeatureServer query
      '/api/centennial-zoning': {
        target: 'https://maps.centennialco.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/centennial-zoning/, '/arcgis/rest/services/Current_Land_Use'),
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
