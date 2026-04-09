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
      // Douglas County — Landuse MapServer (layer 1, ZONE_TYPE field)
      '/api/douglas-zoning': {
        target: 'https://apps.douglas.co.us',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/douglas-zoning/, '/gisod/rest/services/Landuse/MapServer'),
      },
      // Jefferson County — Zoning MapServer (layer 36)
      '/api/jefferson-zoning': {
        target: 'https://gisportal.jeffco.us',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/jefferson-zoning/, '/server2/rest/services/Zoning/MapServer'),
      },
      // Larimer County — LC_Zoning MapServer (layer 0)
      '/api/larimer-zoning': {
        target: 'https://maps1.larimer.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/larimer-zoning/, '/arcgis/rest/services/MapServices/LC_Zoning/MapServer'),
      },
      // El Paso County — ZoningAreas MapServer (layer 1)
      '/api/elpaso-zoning': {
        target: 'https://gisservices.elpasoco.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/elpaso-zoning/, '/arcgis2/rest/services/HubPublic/ZoningAreas/MapServer'),
      },
      // Clear Creek County — Cadastral MapServer (layer 18, CURR_ZONE field)
      '/api/clearcreek-zoning': {
        target: 'https://gis.clearcreekcounty.us',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/clearcreek-zoning/, '/arcgis2/rest/services/ClearCreek/Cadastral/MapServer'),
      },
      // Lakewood — Zoning MapServer (layer 0)
      '/api/lakewood-zoning': {
        target: 'https://egis.lakewood.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/lakewood-zoning/, '/server/rest/services/PL/Zoning/MapServer'),
      },
      // Arvada — Planning/Zoning MapServer (layer 0)
      '/api/arvada-zoning': {
        target: 'https://maps.arvada.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/arvada-zoning/, '/arcgis/rest/services/Planning/Zoning/MapServer'),
      },
      // Greenwood Village — GeneralMapViewer MapServer (layer 1 = Zoning)
      '/api/greenwoodvillage-zoning': {
        target: 'https://online.greenwoodvillage.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/greenwoodvillage-zoning/, '/server/rest/services/City/GreenwoodVillage_GeneralMapViewer_Web/MapServer'),
      },
      // Littleton — LittletonParcelZoning MapServer (layer 2 = Zoning Districts)
      '/api/littleton-zoning': {
        target: 'https://ltngiswa.littletonco.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/littleton-zoning/, '/server/rest/services/City/LittletonParcelZoning/MapServer'),
      },
      // Thornton — Zoning MapServer (layer 0)
      '/api/thornton-zoning': {
        target: 'https://maps.thorntonco.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/thornton-zoning/, '/citydevweb/rest/services/Zoning/MapServer'),
      },
      // Arapahoe County — ArapaMAP MapServer (layer 352 = Zoning, ZONING field)
      '/api/arapahoe-zoning': {
        target: 'https://gis.arapahoegov.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/arapahoe-zoning/, '/arcgis/rest/services/ArapaMAP/MapServer'),
      },
      // Broomfield City & County — ArcGIS Online FeatureServer (layer 0, ZONING field)
      '/api/broomfield-zoning': {
        target: 'https://services1.arcgis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/broomfield-zoning/, '/vXSRPZbyyOmH9pek/arcgis/rest/services/Zoning/FeatureServer'),
      },
      // Boulder County — Planning LUC_ZoningDistricts MapServer (layer 0, ZONE_DIST field)
      '/api/boulder-county-zoning': {
        target: 'https://maps.bouldercounty.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/boulder-county-zoning/, '/arcgis/rest/services/PLANNING/LUC_ZoningDistricts/MapServer'),
      },
      // Weld County — ArcGIS Online Zoning_open_data FeatureServer (layer 38, ZONE_SYMB field)
      '/api/weld-zoning': {
        target: 'https://services.arcgis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/weld-zoning/, '/ewjSqmSyHJnkfBLL/arcgis/rest/services/Zoning_open_data/FeatureServer'),
      },
      // Pueblo County — ZoningCountyOnly MapServer (layer 0, ZoneDist field)
      '/api/pueblo-county-zoning': {
        target: 'https://maps.co.pueblo.co.us',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/pueblo-county-zoning/, '/outside/rest/services/Landbase/PuebloCounty_ZoningCountyOnly/MapServer'),
      },
      // Adams County — Zoning FeatureServer (layer 0, ZONE_ field) — public ArcGIS Online
      '/api/adams-zoning': {
        target: 'https://services3.arcgis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/adams-zoning/, '/4PNQOtAivErR7nbT/arcgis/rest/services/Zoning/FeatureServer'),
      },
      // Colorado county boundaries — CDPHE MapServer layer 5 (COUNTY, CNTY_FIPS fields)
      '/api/co-county-boundaries': {
        target: 'https://www.cohealthmaps.dphe.state.co.us',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/co-county-boundaries/, '/arcgis/rest/services/OPEN_DATA/cdphe_geographic_analysis_boundaries/MapServer/5'),
      },
      // Colorado municipal boundaries — ArcGIS Online FeatureServer (NAME20 field)
      '/api/co-municipal-boundaries': {
        target: 'https://services.arcgis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/co-municipal-boundaries/, '/yzB9WM8W0BO3Ql7d/arcgis/rest/services/Colorado_Municipalities/FeatureServer/0'),
      },
      // Denver neighborhoods — Denver MapServer layer 0 (NBHD_NAME field)
      '/api/denver-neighborhoods': {
        target: 'https://denvergov.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/denver-neighborhoods/, '/maps/data/Neighborhoods/MapServer/0'),
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
