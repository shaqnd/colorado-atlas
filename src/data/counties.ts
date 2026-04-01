import type { County } from './types';

// ============================================================
// COLORADO — ALL 64 COUNTIES
// Sources: Census PEP, Colorado SDO, ACS 2019-2023,
//          county websites, DPT, DOLA
// ============================================================
export const counties: County[] = [
  {
    rank: 1, name: "El Paso", population: 752772, population5yr: 730395, population10yr: 699232, seat: "Colorado Springs",
    tax: { effRate: 0.41, medianTax: 1773, medianHome: 431000, countyMill: 7.315 },
    compPlan: { name: "Your El Paso Master Plan", yearAdopted: 2021, status: "current", horizonYear: 2050, notes: "Place-based typology, 12 place types. LDC update underway w/ DOLA grant." },
    zoning: { codeName: "Land Development Code Ch.3", source: "Municode", url: "https://library.municode.com/co/el_paso_county", gisPortal: "opendata-elpasoco.hub.arcgis.com", gisType: "ArcGIS Open Data" },
    hearings: { bccSchedule: "1st & 3rd Tues 9am", bccAgendaUrl: "https://elpasoco.com/bocc", bccVideoSource: "YouTube", pcSchedule: "2nd & 4th Tues", pcName: "Planning Commission" },
    assessor: { url: "https://assessor.elpasoco.com", propertySearchUrl: "https://property.spatialest.com/co/elpaso", treasurerUrl: "https://admin.elpasoco.com/treasurer", platform: "Spatialest", hasOpenData: true }
  },
  {
    rank: 2, name: "Denver", population: 729017, population5yr: 711463, population10yr: 682545, seat: "Denver",
    tax: { effRate: 0.44, medianTax: 2596, medianHome: 586700 },
    compPlan: { name: "Blueprint Denver", yearAdopted: 2019, status: "current", horizonYear: 2040, notes: "Citywide land use & transportation plan. Equity-focused growth strategy." },
    zoning: { codeName: "Denver Zoning Code (2010)", source: "Municode + City", url: "https://denvergov.org/Government/Agencies-Departments-Offices/Agencies-Departments-Offices-Directory/Community-Planning-and-Development/Denver-Zoning-Code", gisPortal: "denvergov.org/opendata", gisType: "Open Data" },
    hearings: { bccSchedule: "Mon 3:30pm weekly", bccAgendaUrl: "https://denver.legistar.com", bccVideoSource: "Granicus", pcSchedule: "Wed bi-weekly", pcName: "Planning Board" },
    assessor: { url: "https://denvergov.org/assessor", propertySearchUrl: "https://denvergov.org/assessor", treasurerUrl: "https://denvergov.org/treasury", platform: "City custom", hasOpenData: true }
  },
  {
    rank: 3, name: "Arapahoe", population: 666924, population5yr: 649121, population10yr: 631096, seat: "Littleton",
    tax: { effRate: 0.53, medianTax: 2767, medianHome: 526000 },
    compPlan: { name: "Arapahoe County Comprehensive Plan", yearAdopted: 2018, status: "current", horizonYear: 2035, notes: "Updated from 2001 plan. Focus areas: eastern plains growth, infrastructure." },
    zoning: { codeName: "Land Dev Code Ch.2 Zoning", source: "Self-hosted PDF", url: "https://arapahoeco.gov/government/departments_f_-_m/land_development_services/land_development_code.php", gisPortal: "GIS Services", gisType: "ESRI" },
    hearings: { bccSchedule: "1st & 3rd Tues 9:30am", bccAgendaUrl: "https://arapahoeco.gov/bocc", bccVideoSource: "YouTube", pcSchedule: "1st & 3rd Tues 6:30pm", pcName: "Planning Commission" },
    assessor: { url: "https://arapahoeco.gov/assessor", propertySearchUrl: "https://arapahoeco.gov/property_search", treasurerUrl: "https://arapahoeco.gov/treasurer", platform: "Custom + ESRI", hasOpenData: true }
  },
  {
    rank: 4, name: "Jefferson", population: 579377, population5yr: 578009, population10yr: 565524, seat: "Golden",
    tax: { effRate: 0.47, medianTax: 2867, medianHome: 604400 },
    compPlan: { name: "Comprehensive Master Plan", yearAdopted: 2010, status: "aging", notes: "Adopted 2010, updated 2019. Area plans integrated. Plains plans consolidated." },
    zoning: { codeName: "Zoning Resolution + LDR", source: "Self-hosted PDF", url: "https://jeffco.us/2460/Zoning-Resolution", gisPortal: "jeffco.us interactive map", gisType: "ESRI" },
    hearings: { bccSchedule: "Every Tues 8am", bccAgendaUrl: "https://jeffco.us/bcc", bccVideoSource: "jeffco.us/Meeting-Videos", pcSchedule: "1st & 3rd Wed", pcName: "Planning Commission" },
    assessor: { url: "https://jeffco.us/assessor", propertySearchUrl: "https://propertysearch.jeffco.us", treasurerUrl: "https://jeffco.us/treasurer", platform: "Custom", hasOpenData: true }
  },
  {
    rank: 5, name: "Adams", population: 530225, population5yr: 516730, population10yr: 487455, seat: "Brighton",
    tax: { effRate: 0.60, medianTax: 2770, medianHome: 458400 },
    compPlan: { name: "Advancing Adams", yearAdopted: 2022, status: "current", horizonYear: 2040, notes: "Adopted Sept 2022. Integrated hazard mitigation. Companion transportation & parks plans." },
    zoning: { codeName: "Dev Standards Ch.3 Zones", source: "Encode Plus", url: "https://adamscounty.municipalcodeonline.com", gisPortal: "data-adcogov.opendata.arcgis.com", gisType: "ArcGIS Open Data" },
    hearings: { bccSchedule: "Every Tues 9am", bccAgendaUrl: "https://adcogov.org/bocc", bccVideoSource: "YouTube", pcSchedule: "4th Thurs 6pm", pcName: "Planning Commission" },
    assessor: { url: "https://adamscountyco.gov/assessor", propertySearchUrl: "https://adcogov.org/property", treasurerUrl: "https://adcogov.org/treasurer", platform: "Tyler + ArcGIS", hasOpenData: true }
  },
  {
    rank: 6, name: "Douglas", population: 377150, population5yr: 357978, population10yr: 328614, seat: "Castle Rock",
    tax: { effRate: 0.55, medianTax: 3707, medianHome: 674000 },
    compPlan: { name: "2040 Comprehensive Master Plan", yearAdopted: 2019, status: "current", horizonYear: 2040, notes: "Includes mineral extraction, recreation/tourism, PTOS master plan elements." },
    zoning: { codeName: "Zoning Resolution (DCZR)", source: "Self-hosted", url: "https://douglas.co.us/planning/documents/zoning", gisPortal: "maps.douglas.co.us", gisType: "ESRI" },
    hearings: { bccSchedule: "Every Tues 1:30pm", bccAgendaUrl: "https://douglas.co.us/bocc", bccVideoSource: "YouTube", pcSchedule: "Varies", pcName: "Planning Commission" },
    assessor: { url: "https://douglas.co.us/assessor", propertySearchUrl: "https://apps.douglas.co.us/assessor/web", treasurerUrl: "https://douglas.co.us/treasurer", platform: "Custom app", hasOpenData: true }
  },
  {
    rank: 7, name: "Larimer", population: 374574, population5yr: 359066, population10yr: 338161, seat: "Fort Collins",
    tax: { effRate: 0.50, medianTax: 2662, medianHome: 532200 },
    compPlan: { name: "Larimer County Comprehensive Plan", yearAdopted: 2019, status: "current", horizonYear: 2040, notes: "Land use code updated Dec 2025. Strong ADU & housing focus." },
    zoning: { codeName: "Land Use Code Art.2 (Dec 2025)", source: "Self-hosted + Municode", url: "https://larimer.gov/planning/land-use-code", gisPortal: "larimer.gov/planning/zoning/map", gisType: "PDF + ESRI" },
    hearings: { bccSchedule: "Tues 6pm & Wed 9am", bccAgendaUrl: "https://larimer.gov/bocc", bccVideoSource: "YouTube", pcSchedule: "Wed", pcName: "Planning Commission" },
    assessor: { url: "https://larimer.gov/assessor", propertySearchUrl: "https://larimer.gov/assessor/search", treasurerUrl: "https://larimer.gov/treasurer", platform: "Custom", hasOpenData: true }
  },
  {
    rank: 8, name: "Weld", population: 369745, population5yr: 328981, population10yr: 294932, seat: "Greeley",
    tax: { effRate: 0.50, medianTax: 2242, medianHome: 444500 },
    compPlan: { name: "Weld County Comprehensive Plan", yearAdopted: 2017, status: "current", horizonYear: 2035, notes: "Oil & gas overlay. Fastest-growing county statewide. 31 incorporated municipalities." },
    zoning: { codeName: "Zoning Regulations", source: "Municode", url: "https://library.municode.com/co/weld_county", gisPortal: "gis.co.weld.co.us", gisType: "ESRI" },
    hearings: { bccSchedule: "Wed 9am", bccAgendaUrl: "https://weld.gov/bocc", bccVideoSource: "weld.gov", pcSchedule: "Varies", pcName: "Planning Commission" },
    assessor: { url: "https://weld.gov/assessor", propertySearchUrl: "https://apps.weld.gov/propertyportal", treasurerUrl: "https://weld.gov/treasurer", platform: "Property Portal", hasOpenData: true }
  },
  {
    rank: 9, name: "Boulder", population: 329543, population5yr: 326196, population10yr: 319372, seat: "Boulder",
    tax: { effRate: 0.54, medianTax: 3821, medianHome: 713900 },
    compPlan: { name: "Boulder County Comprehensive Plan", yearAdopted: 2023, status: "current", notes: "Continuously amended. IGA w/ City of Boulder (BVCP). Strong open space policy." },
    zoning: { codeName: "Land Use Code Art.4", source: "Municode", url: "https://library.municode.com/co/boulder_county", gisPortal: "maps.bouldercounty.org", gisType: "ArcGIS" },
    hearings: { bccSchedule: "Thurs 10am, Tues 4pm", bccAgendaUrl: "https://bouldercounty.gov/bocc", bccVideoSource: "YouTube", pcSchedule: "Wed", pcName: "Planning Commission" },
    assessor: { url: "https://bouldercounty.gov/assessor", propertySearchUrl: "https://maps.boco.solutions/propertysearch", treasurerUrl: "https://treasurer.bouldercounty.org", platform: "BOCO Solutions", hasOpenData: true }
  },
  {
    rank: 10, name: "Pueblo", population: 169356, population5yr: 167116, population10yr: 164685, seat: "Pueblo",
    tax: { effRate: 0.51, medianTax: 1382, medianHome: 271800 },
    compPlan: { name: "Pueblo County Comprehensive Plan", yearAdopted: 2020, status: "current", horizonYear: 2040, notes: "City comp plan update funded via DOLA LPC grant (2025)." },
    zoning: { codeName: "Land Use Regulations", source: "Self-hosted", url: "https://pueblocounty.us", gisPortal: "Yes", gisType: "ESRI" },
    hearings: { bccSchedule: "Tues 9:30am", bccAgendaUrl: "https://pueblocounty.us/bocc", bccVideoSource: "", pcSchedule: "", pcName: "Planning Commission" },
    assessor: { url: "https://county.pueblo.org/assessor", propertySearchUrl: "https://county.pueblo.org/assessor", treasurerUrl: "https://county.pueblo.org/treasurer", platform: "County custom", hasOpenData: false }
  },
  {
    rank: 11, name: "Mesa", population: 158601, population5yr: 154210, population10yr: 149575, seat: "Grand Junction",
    tax: { effRate: 0.39, medianTax: 1357, medianHome: 349400 },
    compPlan: { name: "Mesa County Land Use Plan", yearAdopted: 2017, status: "current", horizonYear: 2035, notes: "AI permit review pilot funded via DOLA LPC grant (2025)." },
    zoning: { codeName: "Land Development Code", source: "Self-hosted", url: "https://mesacounty.us", gisPortal: "emap.mesacounty.us", gisType: "Custom GIS" },
    hearings: { bccSchedule: "Mon 10am", bccAgendaUrl: "https://mesacounty.us/bocc", bccVideoSource: "mesacounty.us", pcSchedule: "", pcName: "Planning Commission" },
    assessor: { url: "https://mesacounty.us/assessor", propertySearchUrl: "https://emap.mesacounty.us/assessor_lookup", treasurerUrl: "https://mesacounty.us/treasurer", platform: "Custom eMap", hasOpenData: false }
  },
  {
    rank: 12, name: "Broomfield", population: 76304, population5yr: 72495, population10yr: 65065, seat: "Broomfield",
    tax: { effRate: 0.62, medianTax: 3888, medianHome: 631600 },
    compPlan: { name: "Broomfield Comprehensive Plan", yearAdopted: 2020, status: "current", horizonYear: 2040, notes: "City-county consolidated. Strong transit-oriented development focus." },
    zoning: { codeName: "Title 17 Zoning", source: "Municode", url: "https://library.municode.com/co/broomfield", gisPortal: "broomfield.org/GIS", gisType: "ESRI" },
    hearings: { bccSchedule: "2nd & 4th Tues 6pm", bccAgendaUrl: "https://broomfield.org", bccVideoSource: "Granicus", pcSchedule: "", pcName: "Planning & Zoning" },
    assessor: { url: "https://broomfield.org/assessor", propertySearchUrl: "https://broomfield.org/assessor", treasurerUrl: "https://broomfield.org/treasurer", platform: "City-County", hasOpenData: false }
  },
  {
    rank: 13, name: "Garfield", population: 62479, population5yr: 60061, population10yr: 58843, seat: "Glenwood Springs",
    tax: { effRate: 0.43, medianTax: 2095, medianHome: 490600 },
    compPlan: { name: "Garfield County Comprehensive Plan", yearAdopted: 2016, status: "aging", horizonYear: 2030, notes: "Nearing horizon year. Energy & natural resource focus." },
    zoning: { codeName: "Land Use & Dev Code", source: "Self-hosted", url: "https://garfield-county.com", gisPortal: "garfield-county.com/gis", gisType: "ESRI" },
    hearings: { bccSchedule: "Mon 8am", bccAgendaUrl: "https://garfield-county.com/bocc", bccVideoSource: "Stream", pcSchedule: "Wed", pcName: "Planning Commission" },
    assessor: { url: "https://garfield-county.com/assessor", propertySearchUrl: "https://garfield-county.com/assessor", treasurerUrl: "https://garfield-county.com/treasurer", platform: "County website", hasOpenData: false }
  },
  {
    rank: 14, name: "La Plata", population: 56331, population5yr: 56221, population10yr: 54909, seat: "Durango",
    tax: { effRate: 0.26, medianTax: 1452, medianHome: 549100, countyMill: 8.50 },
    compPlan: { name: "La Plata County Comprehensive Plan", yearAdopted: 2016, status: "aging", horizonYear: 2030, notes: "4th lowest county mill levy in state. Water scarcity constraints." },
    zoning: { codeName: "Land Use Code", source: "Self-hosted", url: "https://co.laplata.co.us", gisPortal: "co.laplata.co.us/gis", gisType: "ESRI" },
    hearings: { bccSchedule: "Tues 9am", bccAgendaUrl: "https://co.laplata.co.us/bocc", bccVideoSource: "", pcSchedule: "Thurs", pcName: "Planning Commission" },
    assessor: { url: "https://co.laplata.co.us/assessor", propertySearchUrl: "https://co.laplata.co.us/assessor", treasurerUrl: "https://co.laplata.co.us/treasurer", platform: "County website", hasOpenData: false }
  },
  {
    rank: 15, name: "Eagle", population: 55135, population5yr: 54960, population10yr: 53541, seat: "Eagle",
    tax: { effRate: 0.41, medianTax: 3339, medianHome: 814700 },
    compPlan: { name: "Eagle County Comprehensive Plan", yearAdopted: 2018, status: "current", horizonYear: 2038, notes: "Regional housing authority forming (DOLA LPC grant). Resort community." },
    zoning: { codeName: "Land Use Regulations", source: "Self-hosted", url: "https://eaglecounty.us", gisPortal: "eaglecounty.us/gis", gisType: "ESRI" },
    hearings: { bccSchedule: "Tues 8:30am", bccAgendaUrl: "https://eaglecounty.us/bocc", bccVideoSource: "YouTube", pcSchedule: "", pcName: "Planning Commission" },
    assessor: { url: "https://eaglecounty.us/assessor", propertySearchUrl: "https://eaglecounty.us/assessor", treasurerUrl: "https://eaglecounty.us/treasurer", platform: "County website", hasOpenData: false }
  },
  {
    rank: 16, name: "Fremont", population: 49634, population5yr: 48231, population10yr: 47433, seat: "Cañon City",
    tax: { effRate: 0.38, medianTax: 1081, medianHome: 282100 },
    compPlan: { name: "Fremont County Master Plan", yearAdopted: 2015, status: "aging", horizonYear: 2030, notes: "Approaching 10+ years." },
    zoning: { codeName: "Zoning Resolution", source: "Self-hosted", url: "https://fremontcountyco.gov/planning-and-zoning", gisPortal: "fremontgis.com", gisType: "ArcGIS WebApp" },
    hearings: { bccSchedule: "1st & 3rd Tues", bccAgendaUrl: "https://fremontcountyco.gov/bocc", bccVideoSource: "", pcSchedule: "2nd Thurs", pcName: "Planning Commission" },
    assessor: { url: "https://fremontcountyco.gov/assessor", propertySearchUrl: "https://fremontcountyco.gov/assessor", treasurerUrl: "https://fremontcountyco.gov/treasurer", platform: "Tyler EagleWeb", hasOpenData: false }
  },
  {
    rank: 17, name: "Montrose", population: 43807, population5yr: 42758, population10yr: 41276, seat: "Montrose",
    tax: { effRate: 0.36, medianTax: 1280, medianHome: 357900 },
    compPlan: { name: "Montrose County Master Plan", yearAdopted: 2014, status: "overdue", horizonYear: 2025, notes: "Past horizon. Update likely needed." },
    zoning: { codeName: "County Ordinances + LU Code", source: "Self-hosted", url: "https://montrosecounty.net/857", gisPortal: "portico.mygisonline.com", gisType: "MyGIS/Portico" },
    hearings: { bccSchedule: "Wed 9:30am", bccAgendaUrl: "https://montrosecounty.net/bocc", bccVideoSource: "", pcSchedule: "", pcName: "Planning Commission" },
    assessor: { url: "https://montrosecounty.net/68/Assessor", propertySearchUrl: "https://montrosecounty.net/assessor", treasurerUrl: "https://montrosecounty.net/169", platform: "Tyler EagleWeb", hasOpenData: false }
  },
  {
    rank: 18, name: "Delta", population: 31598, population5yr: 31024, population10yr: 30401, seat: "Delta",
    tax: { effRate: 0.31, medianTax: 986, medianHome: 318000 },
    compPlan: { name: "Delta County Master Plan", yearAdopted: 2011, status: "overdue", notes: "14+ years old." },
    zoning: { codeName: "Land Use Regulations", source: "Self-hosted", url: "https://deltacountyco.gov", gisPortal: "deltacountyco.gov/gis", gisType: "ESRI" },
    hearings: { bccSchedule: "Tues 9am", bccAgendaUrl: "https://deltacountyco.gov/bocc", bccVideoSource: "", pcSchedule: "", pcName: "Planning Commission" },
    assessor: { url: "https://deltacountyco.gov/assessor", propertySearchUrl: "https://deltacountyco.gov/assessor", treasurerUrl: "https://deltacountyco.gov/treasurer", platform: "County website", hasOpenData: false }
  },
  {
    rank: 19, name: "Summit", population: 31017, population5yr: 31011, population10yr: 29596, seat: "Breckenridge",
    tax: { effRate: 0.31, medianTax: 2641, medianHome: 850700 },
    compPlan: { name: "Summit County Countywide Comprehensive Plan", yearAdopted: 2019, status: "current", horizonYear: 2040, notes: "Resort community. Housing affordability central theme." },
    zoning: { codeName: "LU & Dev Code Ch.3 Zoning", source: "Municode", url: "https://library.municode.com/co/summit_county", gisPortal: "Interactive map", gisType: "Custom" },
    hearings: { bccSchedule: "Tues 1:30pm", bccAgendaUrl: "https://summitcountyco.gov/bocc", bccVideoSource: "YouTube", pcSchedule: "", pcName: "Planning Commission" },
    assessor: { url: "https://summitcountyco.gov/assessor", propertySearchUrl: "https://summitcountyco.gov/assessor", treasurerUrl: "https://summitcountyco.gov/treasurer", platform: "County custom", hasOpenData: false }
  },
  {
    rank: 20, name: "Morgan", population: 29520, population5yr: 28617, population10yr: 28159, seat: "Fort Morgan",
    tax: { effRate: 0.53, medianTax: 1574, medianHome: 299300 },
    compPlan: { name: "Morgan County Comprehensive Plan", yearAdopted: 2013, status: "aging", notes: "12+ years old. Agricultural county." },
    zoning: { codeName: "Zoning Regulations", source: "Self-hosted", url: "https://co.morgan.co.us", gisPortal: "Parcel search", gisType: "Parcel" },
    hearings: { bccSchedule: "Tues 9am", bccAgendaUrl: "https://co.morgan.co.us/bocc", bccVideoSource: "", pcSchedule: "", pcName: "Planning Commission" },
    assessor: { url: "https://co.morgan.co.us/assessor", propertySearchUrl: "https://co.morgan.co.us/assessor", treasurerUrl: "https://co.morgan.co.us/treasurer", platform: "County website", hasOpenData: false }
  },
  {
    rank: 21, name: "Elbert", population: 27874, population5yr: 26832, population10yr: 24435, seat: "Kiowa",
    tax: { effRate: 0.45, medianTax: 2981, medianHome: 664600 },
    compPlan: { name: "Elbert County Master Plan", yearAdopted: 2018, status: "current", horizonYear: 2038, notes: "Rural residential. Strong growth (+14% 10yr)." },
    zoning: { codeName: "Land Use Code", source: "Self-hosted", url: "https://elbertcounty-co.gov", gisPortal: "Parcel search", gisType: "Parcel" },
    hearings: { bccSchedule: "Wed 9am", bccAgendaUrl: "https://elbertcounty-co.gov/bocc", bccVideoSource: "", pcSchedule: "1st Mon", pcName: "Planning Commission" },
    assessor: { url: "https://elbertcounty-co.gov/assessor", propertySearchUrl: "https://elbertcounty-co.gov/assessor", treasurerUrl: "https://elbertcounty-co.gov/treasurer", platform: "County website", hasOpenData: false }
  },
  {
    rank: 22, name: "Montezuma", population: 26412, population5yr: 26266, population10yr: 26022, seat: "Cortez",
    tax: { effRate: 0.30, medianTax: 915, medianHome: 308100 },
    compPlan: { name: "Montezuma County Master Plan", yearAdopted: 2010, status: "overdue", notes: "15+ years old." },
    zoning: { codeName: "Land Use Code", source: "Self-hosted", url: "https://montezumacounty.org", gisPortal: "ESRI", gisType: "ESRI" },
    hearings: { bccSchedule: "Mon & Wed", bccAgendaUrl: "https://montezumacounty.org/bocc", bccVideoSource: "", pcSchedule: "", pcName: "Planning Commission" },
    assessor: { url: "https://montezumacounty.org/assessor", propertySearchUrl: "https://montezumacounty.org/assessor", treasurerUrl: "https://montezumacounty.org/treasurer", platform: "County website", hasOpenData: false }
  },
  {
    rank: 23, name: "Routt", population: 25084, population5yr: 25638, population10yr: 24397, seat: "Steamboat Springs",
    tax: { effRate: 0.33, medianTax: 2490, medianHome: 756200 },
    compPlan: { name: "Routt County Master Plan", yearAdopted: 2016, status: "current", horizonYear: 2035, notes: "Steamboat Springs housing strategy adopted 2024. DOLA LPC grant." },
    zoning: { codeName: "Zoning Regulations", source: "Self-hosted", url: "https://co.routt.co.us/planning", gisPortal: "ESRI", gisType: "ESRI" },
    hearings: { bccSchedule: "Tues 3pm", bccAgendaUrl: "https://co.routt.co.us/bocc", bccVideoSource: "YouTube", pcSchedule: "1st Thurs", pcName: "Planning Commission" },
    assessor: { url: "https://co.routt.co.us/115/Assessor", propertySearchUrl: "https://co.routt.co.us/assessor", treasurerUrl: "https://co.routt.co.us/treasurer", platform: "Spatialest", hasOpenData: false }
  },
  {
    rank: 24, name: "Teller", population: 24825, population5yr: 24710, population10yr: 23786, seat: "Cripple Creek",
    tax: { effRate: 0.36, medianTax: 1583, medianHome: 445000 },
    compPlan: { name: "Teller County Master Plan", yearAdopted: 2012, status: "aging", notes: "13+ years old. Mountain/gaming community." },
    zoning: { codeName: "Land Use Regulations", source: "Self-hosted", url: "https://tellercounty.org", gisPortal: "ESRI", gisType: "ESRI" },
    hearings: { bccSchedule: "Thurs 10am", bccAgendaUrl: "https://tellercounty.org/bocc", bccVideoSource: "", pcSchedule: "", pcName: "Planning Commission" },
    assessor: { url: "https://tellercounty.org/assessor", propertySearchUrl: "https://tellercounty.org/assessor", treasurerUrl: "https://tellercounty.org/treasurer", platform: "County website", hasOpenData: false }
  },
  {
    rank: 25, name: "Logan", population: 20892, population5yr: 21880, population10yr: 22072, seat: "Sterling",
    tax: { effRate: 0.47, medianTax: 1072, medianHome: 228100 },
    compPlan: { name: "Logan County Comprehensive Plan", yearAdopted: 2012, status: "aging", notes: "Declining population. Agricultural economy." },
    zoning: { codeName: "Zoning Regulations", source: "Self-hosted", url: "https://logancountyco.gov", gisPortal: "GIS", gisType: "GIS" },
    hearings: { bccSchedule: "Tues 9am", bccAgendaUrl: "https://logancountyco.gov/bocc", bccVideoSource: "", pcSchedule: "", pcName: "Planning Commission" },
    assessor: { url: "https://logancountyco.gov/assessor", propertySearchUrl: "https://logancountyco.gov/assessor", treasurerUrl: "https://logancountyco.gov/treasurer", platform: "County website", hasOpenData: false }
  },
  {
    rank: 26, name: "Chaffee", population: 20178, population5yr: 20356, population10yr: 18668, seat: "Salida",
    tax: { effRate: 0.28, medianTax: 1664, medianHome: 598500 },
    compPlan: { name: "Envision Chaffee County", yearAdopted: 2016, status: "current", horizonYear: 2035, notes: "Collaborative comp plan w/ Salida, Buena Vista, Poncha Springs." },
    zoning: { codeName: "Land Use Code", source: "Self-hosted", url: "https://chaffeecounty.org", gisPortal: "ArcGIS", gisType: "ArcGIS" },
    hearings: { bccSchedule: "Tues 1pm", bccAgendaUrl: "https://chaffeecounty.org/bocc", bccVideoSource: "YouTube", pcSchedule: "", pcName: "Planning Commission" },
    assessor: { url: "https://chaffeecounty.org/assessor", propertySearchUrl: "https://chaffeecounty.org/assessor", treasurerUrl: "https://chaffeecounty.org/treasurer", platform: "County website", hasOpenData: false }
  },
  {
    rank: 27, name: "Otero", population: 18321, population5yr: 18786, population10yr: 18540, seat: "La Junta",
    tax: { effRate: 0.32, medianTax: 518, medianHome: 160700 },
    compPlan: { name: "Otero County Land Use Plan", yearAdopted: 2009, status: "overdue", notes: "16+ years old." },
    zoning: { codeName: "Zoning Regulations", source: "Self-hosted", url: "https://oterocounty.org", gisPortal: "Parcel", gisType: "Parcel" },
    hearings: { bccSchedule: "Mon 10am", bccAgendaUrl: "https://oterocounty.org/bocc", bccVideoSource: "", pcSchedule: "", pcName: "Planning & Zoning" },
    assessor: { url: "https://oterocounty.org/assessor", propertySearchUrl: "https://oterocounty.org/assessor", treasurerUrl: "https://oterocounty.org/treasurer", platform: "County website", hasOpenData: false }
  },
  {
    rank: 28, name: "Park", population: 17907, population5yr: 18845, population10yr: 16612, seat: "Fairplay",
    tax: { effRate: 0.34, medianTax: 1679, medianHome: 489300 },
    compPlan: { name: "Strategic Master Plan 2025", yearAdopted: 2025, status: "current", horizonYear: 2035, notes: "PC adopted Apr 17 2025, BOCC approved Jun 2025. Fairplay UDC also updating." },
    zoning: { codeName: "Land Use Regulations", source: "Self-hosted", url: "https://parkco.us", gisPortal: "Parcel", gisType: "Parcel" },
    hearings: { bccSchedule: "Thurs", bccAgendaUrl: "https://parkco.us/bocc", bccVideoSource: "", pcSchedule: "", pcName: "Planning Commission" },
    assessor: { url: "https://parkco.us/assessor", propertySearchUrl: "https://parkco.us/assessor", treasurerUrl: "https://parkco.us/treasurer", platform: "County website", hasOpenData: false }
  },
  {
    rank: 29, name: "Gunnison", population: 17241, population5yr: 17462, population10yr: 16500, seat: "Gunnison",
    tax: { effRate: 0.28, medianTax: 1683, medianHome: 597200 },
    compPlan: { name: "Gunnison County Comprehensive Plan", yearAdopted: 2013, status: "aging", notes: "12+ years old. Growing resort community." },
    zoning: { codeName: "Municipal Code + County LU", source: "Code Publishing", url: "https://codepublishing.com/CO/Gunnison", gisPortal: "ArcGIS", gisType: "ArcGIS" },
    hearings: { bccSchedule: "Tues 9am", bccAgendaUrl: "https://gunnisoncounty.org/bocc", bccVideoSource: "", pcSchedule: "", pcName: "Planning Commission" },
    assessor: { url: "https://gunnisoncounty.org/132", propertySearchUrl: "https://gunnisoncounty.org/assessor", treasurerUrl: "https://gunnisoncounty.org/treasurer", platform: "County website", hasOpenData: false }
  },
  {
    rank: 30, name: "Pitkin", population: 16985, population5yr: 17767, population10yr: 17501, seat: "Aspen",
    tax: { effRate: 0.39, medianTax: 4450, medianHome: 1131200 },
    compPlan: { name: "Pitkin County Comprehensive Plan", yearAdopted: 2018, status: "current", horizonYear: 2040, notes: "Home rule county. Highest median tax bill in state ($4,450/yr)." },
    zoning: { codeName: "Land Use Code", source: "Self-hosted (home rule)", url: "https://pitkincounty.com/689/Planning-Zoning", gisPortal: "ArcGIS", gisType: "ArcGIS" },
    hearings: { bccSchedule: "Tues & Wed", bccAgendaUrl: "https://pitkincounty.com/bocc", bccVideoSource: "YouTube", pcSchedule: "", pcName: "Planning & Zoning" },
    assessor: { url: "https://pitkincounty.com/assessor", propertySearchUrl: "https://pitkincounty.com/assessor", treasurerUrl: "https://pitkincounty.com/treasurer", platform: "County website", hasOpenData: false }
  },
  { rank: 31, name: "Alamosa", population: 16581, population5yr: 16310, population10yr: 16188, seat: "Alamosa", tax: { effRate: 0.44, medianTax: 968, medianHome: 218800 }, compPlan: { name: "LUDC", yearAdopted: 2009, status: "overdue", notes: "Land Use & Dev Code from 2009." }, zoning: { codeName: "LUDC (2009)", source: "Self-hosted", url: "https://alamosacounty.colorado.gov", gisPortal: "ArcGIS", gisType: "ArcGIS" }, hearings: { bccSchedule: "1st & 3rd Tues", bccAgendaUrl: "https://alamosacounty.colorado.gov", bccVideoSource: "", pcSchedule: "", pcName: "Planning Commission" }, assessor: { url: "https://alamosacounty.org/assessor", propertySearchUrl: "https://alamosacounty.org/assessor", treasurerUrl: "https://alamosacounty.org/treasurer", platform: "SLV regional", hasOpenData: false } },
  { rank: 32, name: "Grand", population: 15895, population5yr: 15734, population10yr: 14843, seat: "Hot Sulphur Springs", tax: { effRate: 0.35, medianTax: 1763, medianHome: 507200 }, compPlan: { name: "Grand County Master Plan", yearAdopted: 2011, status: "overdue", notes: "" }, zoning: { codeName: "Zoning Regs", source: "Self-hosted", url: "https://co.grand.co.us", gisPortal: "ESRI", gisType: "ESRI" }, hearings: { bccSchedule: "Tues 9am", bccAgendaUrl: "https://co.grand.co.us/bocc", bccVideoSource: "", pcSchedule: "", pcName: "Planning Commission" }, assessor: { url: "https://co.grand.co.us/assessor", propertySearchUrl: "https://co.grand.co.us/assessor", treasurerUrl: "https://co.grand.co.us/treasurer", platform: "County website", hasOpenData: false } },
  { rank: 33, name: "Las Animas", population: 14413, population5yr: 14506, population10yr: 14741, seat: "Trinidad", tax: { effRate: 0.24, medianTax: 524, medianHome: 214500 }, compPlan: { name: "Las Animas County Comp Plan", yearAdopted: 2010, status: "overdue", notes: "Declining pop." }, zoning: { codeName: "Land Use Regs", source: "Self-hosted", url: "https://lasanimascounty.colorado.gov", gisPortal: "Parcel", gisType: "Parcel" }, hearings: { bccSchedule: "1st & 3rd Wed 9am", bccAgendaUrl: "https://lasanimascounty.colorado.gov", bccVideoSource: "", pcSchedule: "", pcName: "Planning & Zoning" }, assessor: { url: "https://lasanimascounty.colorado.gov/assessor", propertySearchUrl: "https://assessorweb.lasanimascounty.net", treasurerUrl: "https://lasanimascounty.colorado.gov/treasurer", platform: "Custom web", hasOpenData: false } },
  { rank: 34, name: "Archuleta", population: 13900, population5yr: 14029, population10yr: 12572, seat: "Pagosa Springs", tax: { effRate: 0.34, medianTax: 1541, medianHome: 451400 }, compPlan: { name: "Archuleta County Comp Plan", yearAdopted: 2017, status: "current", notes: "Strong growth." }, zoning: { codeName: "Land Use Regs", source: "Self-hosted", url: "https://archuletacounty.org", gisPortal: "ArcGIS", gisType: "ArcGIS" }, hearings: { bccSchedule: "1st & 3rd Tues", bccAgendaUrl: "https://archuletacounty.org", bccVideoSource: "", pcSchedule: "", pcName: "Planning Commission" }, assessor: { url: "https://archuletacounty.org/assessor", propertySearchUrl: "https://archuletacounty.org/assessor", treasurerUrl: "https://archuletacounty.org/treasurer", platform: "County website", hasOpenData: false } },
  { rank: 35, name: "Moffat", population: 13207, population5yr: 13084, population10yr: 13143, seat: "Craig", tax: { effRate: 0.43, medianTax: 1129, medianHome: 262500 }, compPlan: { name: "Moffat County Master Plan", yearAdopted: 2008, status: "overdue", notes: "Energy economy." }, zoning: { codeName: "Land Use Regs", source: "Self-hosted", url: "https://moffatcounty.net", gisPortal: "ESRI", gisType: "ESRI" }, hearings: { bccSchedule: "Tues 10am", bccAgendaUrl: "https://moffatcounty.net", bccVideoSource: "", pcSchedule: "", pcName: "Planning Commission" }, assessor: { url: "https://moffatcounty.net/assessor", propertySearchUrl: "https://moffatcounty.net/assessor", treasurerUrl: "https://moffatcounty.net/treasurer", platform: "County website", hasOpenData: false } },
  { rank: 36, name: "Prowers", population: 11910, population5yr: 12172, population10yr: 12220, seat: "Lamar", tax: { effRate: 0.33, medianTax: 494, medianHome: 150900 }, compPlan: { name: "Prowers County Plan", yearAdopted: 2010, status: "overdue", notes: "Lowest median tax ($494)." }, zoning: { codeName: "Zoning Regs", source: "Self-hosted", url: "https://prowerscounty.net", gisPortal: "Parcel", gisType: "Parcel" }, hearings: { bccSchedule: "Mon 10am", bccAgendaUrl: "https://prowerscounty.net", bccVideoSource: "", pcSchedule: "", pcName: "Planning & Zoning" }, assessor: { url: "https://prowerscounty.net/assessor", propertySearchUrl: "https://prowerscounty.net/assessor", treasurerUrl: "https://prowerscounty.net/treasurer", platform: "County website", hasOpenData: false } },
  { rank: 37, name: "Rio Grande", population: 11321, population5yr: 11267, population10yr: 11560, seat: "Del Norte", tax: { effRate: 0.41, medianTax: 893, medianHome: 215400 }, compPlan: { name: "Rio Grande County Plan", yearAdopted: 2010, status: "overdue", notes: "SLV region." }, zoning: { codeName: "Land Use Regs", source: "Self-hosted", url: "https://riograndecounty.org", gisPortal: "SLV regional", gisType: "SLV" }, hearings: { bccSchedule: "Wed 10am", bccAgendaUrl: "https://riograndecounty.org", bccVideoSource: "", pcSchedule: "", pcName: "Planning Commission" }, assessor: { url: "https://riograndecounty.org/assessor", propertySearchUrl: "https://riograndecounty.org/assessor", treasurerUrl: "https://riograndecounty.org/treasurer", platform: "SLV GIS", hasOpenData: false } },
  { rank: 38, name: "Yuma", population: 9979, population5yr: 10019, population10yr: 10103, seat: "Wray", tax: { effRate: 0.48, medianTax: 1025, medianHome: 215600 }, compPlan: { name: "Yuma County Plan", yearAdopted: 2012, status: "aging", notes: "Agricultural." }, zoning: { codeName: "Zoning Regs", source: "Self-hosted", url: "https://yumacounty.net", gisPortal: "Limited", gisType: "Limited" }, hearings: { bccSchedule: "1st & 3rd Mon", bccAgendaUrl: "https://yumacounty.net", bccVideoSource: "", pcSchedule: "", pcName: "Planning & Zoning" }, assessor: { url: "https://yumacounty.net/assessor", propertySearchUrl: "https://yumacounty.net/assessor", treasurerUrl: "https://yumacounty.net/treasurer", platform: "County website", hasOpenData: false } },
  { rank: 39, name: "Clear Creek", population: 9262, population5yr: 9700, population10yr: 9369, seat: "Georgetown", tax: { effRate: 0.38, medianTax: 2160, medianHome: 572800 }, compPlan: { name: "Clear Creek County Master Plan", yearAdopted: 2017, status: "current", notes: "I-70 corridor." }, zoning: { codeName: "Land Use Regs", source: "Self-hosted", url: "https://clearcreekcounty.us", gisPortal: "ArcGIS", gisType: "ArcGIS" }, hearings: { bccSchedule: "Wed 10am", bccAgendaUrl: "https://clearcreekcounty.us", bccVideoSource: "YouTube", pcSchedule: "", pcName: "Planning Commission" }, assessor: { url: "https://clearcreekcounty.us/assessor", propertySearchUrl: "https://clearcreekcounty.us/assessor", treasurerUrl: "https://clearcreekcounty.us/treasurer", platform: "County website", hasOpenData: false } },
  { rank: 40, name: "San Miguel", population: 7968, population5yr: 8179, population10yr: 7723, seat: "Telluride", tax: { effRate: 0.26, medianTax: 1599, medianHome: 613100 }, compPlan: { name: "San Miguel County Master Plan", yearAdopted: 2015, status: "aging", notes: "DOLA LPC housing grant." }, zoning: { codeName: "Land Use Code", source: "Self-hosted", url: "https://sanmiguelcountyco.gov", gisPortal: "Parcel", gisType: "Parcel" }, hearings: { bccSchedule: "Wed 9:30am", bccAgendaUrl: "https://sanmiguelcountyco.gov", bccVideoSource: "", pcSchedule: "", pcName: "Planning Commission" }, assessor: { url: "https://sanmiguelcountyco.gov/assessor", propertySearchUrl: "https://sanmiguelcountyco.gov/assessor", treasurerUrl: "https://sanmiguelcountyco.gov/treasurer", platform: "County website", hasOpenData: false } },
  { rank: 41, name: "Conejos", population: 7530, population5yr: 7878, population10yr: 8144, seat: "Conejos", tax: { effRate: 0.40, medianTax: 655, medianHome: 162100 }, compPlan: { name: "Conejos County Plan", yearAdopted: 2007, status: "overdue", notes: "Declining pop." }, zoning: { codeName: "Land Use Regs", source: "Self-hosted", url: "https://conejoscounty.org", gisPortal: "SLV regional", gisType: "SLV" }, hearings: { bccSchedule: "1st & 3rd Tues", bccAgendaUrl: "https://conejoscounty.org", bccVideoSource: "", pcSchedule: "", pcName: "Planning Commission" }, assessor: { url: "https://conejoscounty.org/assessor", propertySearchUrl: "https://conejoscounty.org/assessor", treasurerUrl: "https://conejoscounty.org/treasurer", platform: "SLV GIS", hasOpenData: false } },
  { rank: 42, name: "Lake", population: 7380, population5yr: 8011, population10yr: 7535, seat: "Leadville", tax: { effRate: 0.38, medianTax: 1544, medianHome: 401300 }, compPlan: { name: "Lake County Master Plan", yearAdopted: 2014, status: "aging", notes: "Mining heritage." }, zoning: { codeName: "Land Use Regs", source: "Self-hosted", url: "https://lakecountyco.com", gisPortal: "ESRI", gisType: "ESRI" }, hearings: { bccSchedule: "Tues 9am", bccAgendaUrl: "https://lakecountyco.com", bccVideoSource: "", pcSchedule: "", pcName: "Planning Commission" }, assessor: { url: "https://lakecountyco.com/assessor", propertySearchUrl: "https://lakecountyco.com/assessor", treasurerUrl: "https://lakecountyco.com/treasurer", platform: "County website", hasOpenData: false } },
  { rank: 43, name: "Kit Carson", population: 7023, population5yr: 7096, population10yr: 7717, seat: "Burlington", tax: { effRate: 0.52, medianTax: 1141, medianHome: 221400 }, compPlan: { name: "Kit Carson County Plan", yearAdopted: 2009, status: "overdue", notes: "Declining pop." }, zoning: { codeName: "Zoning Regs", source: "Self-hosted", url: "https://kitcarsoncounty.org", gisPortal: "ESRI", gisType: "ESRI" }, hearings: { bccSchedule: "Mon 9am", bccAgendaUrl: "https://kitcarsoncounty.org", bccVideoSource: "", pcSchedule: "", pcName: "Planning & Zoning" }, assessor: { url: "https://kitcarsoncounty.org/assessor", propertySearchUrl: "https://kitcarsoncounty.org/assessor", treasurerUrl: "https://kitcarsoncounty.org/treasurer", platform: "County website", hasOpenData: false } },
  { rank: 44, name: "Huerfano", population: 6972, population5yr: 6933, population10yr: 6711, seat: "Walsenburg", tax: { effRate: 0.28, medianTax: 707, medianHome: 256700 }, compPlan: { name: "Huerfano County Plan", yearAdopted: 2012, status: "aging", notes: "" }, zoning: { codeName: "Land Use Code", source: "Self-hosted", url: "https://huerfano.us", gisPortal: "ESRI", gisType: "ESRI" }, hearings: { bccSchedule: "1st & 3rd Wed", bccAgendaUrl: "https://huerfano.us", bccVideoSource: "", pcSchedule: "", pcName: "Planning Commission" }, assessor: { url: "https://huerfano.us/assessor", propertySearchUrl: "https://huerfano.us/assessor", treasurerUrl: "https://huerfano.us/treasurer", platform: "County website", hasOpenData: false } },
  { rank: 45, name: "Saguache", population: 6580, population5yr: 6824, population10yr: 6450, seat: "Saguache", tax: { effRate: 0.34, medianTax: 679, medianHome: 200000 }, compPlan: { name: "Saguache County Plan", yearAdopted: 2011, status: "overdue", notes: "SLV region." }, zoning: { codeName: "Land Use Regs", source: "Self-hosted", url: "https://saguachecounty.colorado.gov", gisPortal: "Parcel", gisType: "Parcel" }, hearings: { bccSchedule: "1st & 3rd Tues", bccAgendaUrl: "https://saguachecounty.colorado.gov", bccVideoSource: "", pcSchedule: "", pcName: "Planning Commission" }, assessor: { url: "https://saguachecounty.colorado.gov/assessor", propertySearchUrl: "https://saguachecounty.colorado.gov/assessor", treasurerUrl: "https://saguachecounty.colorado.gov/treasurer", platform: "County website", hasOpenData: false } },
  { rank: 46, name: "Rio Blanco", population: 6544, population5yr: 6352, population10yr: 6538, seat: "Meeker", tax: { effRate: 0.34, medianTax: 837, medianHome: 243400 }, compPlan: { name: "Rio Blanco County Plan", yearAdopted: 2010, status: "overdue", notes: "Energy." }, zoning: { codeName: "Land Use Regs", source: "Self-hosted", url: "https://rbc.us", gisPortal: "ESRI", gisType: "ESRI" }, hearings: { bccSchedule: "Mon", bccAgendaUrl: "https://rbc.us", bccVideoSource: "", pcSchedule: "", pcName: "Planning Commission" }, assessor: { url: "https://rbc.us/152/Assessor", propertySearchUrl: "https://rbc.us/assessor", treasurerUrl: "https://rbc.us/treasurer", platform: "County website", hasOpenData: false } },
  { rank: 47, name: "Gilpin", population: 5901, population5yr: 6243, population10yr: 5747, seat: "Central City", tax: { effRate: 0.23, medianTax: 1177, medianHome: 512600 }, compPlan: { name: "Gilpin County Master Plan", yearAdopted: 2013, status: "aging", notes: "Lowest eff rate (0.23%). Gaming." }, zoning: { codeName: "Land Use Regs", source: "Self-hosted", url: "https://gilpincounty.org", gisPortal: "ESRI", gisType: "ESRI" }, hearings: { bccSchedule: "1st & 3rd Tues", bccAgendaUrl: "https://gilpincounty.org", bccVideoSource: "", pcSchedule: "", pcName: "Planning Commission" }, assessor: { url: "https://gilpincounty.org/assessor", propertySearchUrl: "https://gilpincounty.org/assessor", treasurerUrl: "https://gilpincounty.org/treasurer", platform: "County website", hasOpenData: false } },
  { rank: 48, name: "Crowley", population: 5647, population5yr: 5922, population10yr: 5823, seat: "Ordway", tax: { effRate: 0.49, medianTax: 525, medianHome: 106700 }, compPlan: { name: "Crowley County Plan", yearAdopted: 2008, status: "overdue", notes: "Lowest med. home ($107k)." }, zoning: { codeName: "Zoning Regs", source: "Self-hosted", url: "https://crowleycounty.net", gisPortal: "Parcel", gisType: "Parcel" }, hearings: { bccSchedule: "1st & 3rd Tues", bccAgendaUrl: "https://crowleycounty.net", bccVideoSource: "", pcSchedule: "", pcName: "Planning & Zoning" }, assessor: { url: "https://crowleycounty.net/assessor", propertySearchUrl: "https://crowleycounty.net/assessor", treasurerUrl: "https://crowleycounty.net/treasurer", platform: "County website", hasOpenData: false } },
  { rank: 49, name: "Lincoln", population: 5550, population5yr: 5701, population10yr: 5608, seat: "Hugo", tax: { effRate: 0.38, medianTax: 886, medianHome: 232100 }, compPlan: { name: "Lincoln County Plan", yearAdopted: 2010, status: "overdue", notes: "" }, zoning: { codeName: "Zoning Regs", source: "Self-hosted", url: "https://lincolncountyco.us", gisPortal: "Parcel", gisType: "Parcel" }, hearings: { bccSchedule: "1st & 3rd Tues", bccAgendaUrl: "https://lincolncountyco.us", bccVideoSource: "", pcSchedule: "", pcName: "Planning & Zoning" }, assessor: { url: "https://lincolncountyco.us/assessor", propertySearchUrl: "https://lincolncountyco.us/assessor", treasurerUrl: "https://lincolncountyco.us/treasurer", platform: "County website", hasOpenData: false } },
  { rank: 50, name: "Bent", population: 5549, population5yr: 5577, population10yr: 5906, seat: "Las Animas", tax: { effRate: 0.39, medianTax: 532, medianHome: 137900 }, compPlan: { name: "Bent County Plan", yearAdopted: 2009, status: "overdue", notes: "Declining pop." }, zoning: { codeName: "Zoning Regs", source: "Self-hosted", url: "https://bentcounty.net", gisPortal: "Assessor", gisType: "Assessor" }, hearings: { bccSchedule: "1st & 3rd Wed", bccAgendaUrl: "https://bentcounty.net", bccVideoSource: "", pcSchedule: "", pcName: "Planning & Zoning" }, assessor: { url: "https://bentcounty.net/assessor", propertySearchUrl: "https://bentcounty.net/assessor", treasurerUrl: "https://bentcounty.net/treasurer", platform: "County website", hasOpenData: false } },
  { rank: 51, name: "Custer", population: 5247, population5yr: 5068, population10yr: 4404, seat: "Westcliffe", tax: { effRate: 0.36, medianTax: 1300, medianHome: 358800 }, compPlan: { name: "Custer County Plan", yearAdopted: 2016, status: "current", notes: "+19% 10yr growth." }, zoning: { codeName: "Land Use Regs", source: "Self-hosted", url: "https://custercountygov.com", gisPortal: "Parcel", gisType: "Parcel" }, hearings: { bccSchedule: "1st & 3rd Thurs", bccAgendaUrl: "https://custercountygov.com", bccVideoSource: "", pcSchedule: "", pcName: "Planning & Zoning" }, assessor: { url: "https://custercountygov.com/assessor", propertySearchUrl: "https://custercountygov.com/assessor", treasurerUrl: "https://custercountygov.com/treasurer", platform: "County website", hasOpenData: false } },
  { rank: 52, name: "Ouray", population: 5087, population5yr: 4966, population10yr: 4722, seat: "Ouray", tax: { effRate: 0.28, medianTax: 1854, medianHome: 670100 }, compPlan: { name: "Ouray County Master Plan", yearAdopted: 2014, status: "aging", notes: "Tourism/mining." }, zoning: { codeName: "Land Use Code", source: "Self-hosted", url: "https://ouraycountyco.gov", gisPortal: "Parcel", gisType: "Parcel" }, hearings: { bccSchedule: "Mon & Wed", bccAgendaUrl: "https://ouraycountyco.gov", bccVideoSource: "", pcSchedule: "", pcName: "Planning Commission" }, assessor: { url: "https://ouraycountyco.gov/assessor", propertySearchUrl: "https://ouraycountyco.gov/assessor", treasurerUrl: "https://ouraycountyco.gov/treasurer", platform: "County website", hasOpenData: false } },
  { rank: 53, name: "Washington", population: 4831, population5yr: 4817, population10yr: 4814, seat: "Akron", tax: { effRate: 0.41, medianTax: 890, medianHome: 218300 }, compPlan: { name: "Washington County Plan", yearAdopted: 2010, status: "overdue", notes: "Flat pop." }, zoning: { codeName: "Zoning Regs", source: "Self-hosted", url: "https://co.washington.co.us", gisPortal: "Limited", gisType: "Limited" }, hearings: { bccSchedule: "1st & 3rd Mon", bccAgendaUrl: "https://co.washington.co.us", bccVideoSource: "", pcSchedule: "", pcName: "Planning & Zoning" }, assessor: { url: "https://co.washington.co.us/assessor", propertySearchUrl: "https://co.washington.co.us/assessor", treasurerUrl: "https://co.washington.co.us/treasurer", platform: "County website", hasOpenData: false } },
  { rank: 54, name: "Phillips", population: 4496, population5yr: 4348, population10yr: 4442, seat: "Holyoke", tax: { effRate: 0.49, medianTax: 1263, medianHome: 255300 }, compPlan: { name: "Phillips County Plan", yearAdopted: 2010, status: "overdue", notes: "" }, zoning: { codeName: "Zoning Regs", source: "Self-hosted", url: "https://phillipscounty.co", gisPortal: "Parcel", gisType: "Parcel" }, hearings: { bccSchedule: "1st & 3rd Tues", bccAgendaUrl: "https://phillipscounty.co", bccVideoSource: "", pcSchedule: "", pcName: "Planning & Zoning" }, assessor: { url: "https://phillipscounty.co/assessor", propertySearchUrl: "https://phillipscounty.co/assessor", treasurerUrl: "https://phillipscounty.co/treasurer", platform: "County website", hasOpenData: false } },
  { rank: 55, name: "Costilla", population: 3607, population5yr: 3788, population10yr: 3524, seat: "San Luis", tax: { effRate: 0.31, medianTax: 531, medianHome: 171300 }, compPlan: { name: "Costilla County Plan", yearAdopted: 2009, status: "overdue", notes: "Oldest town in CO." }, zoning: { codeName: "Land Use Regs", source: "Self-hosted", url: "https://costillacounty.gov", gisPortal: "ESRI", gisType: "ESRI" }, hearings: { bccSchedule: "1st & 3rd Tues", bccAgendaUrl: "https://costillacounty.gov", bccVideoSource: "", pcSchedule: "", pcName: "Planning & Zoning" }, assessor: { url: "https://costillacounty.gov/assessor", propertySearchUrl: "https://costillacounty.gov/assessor", treasurerUrl: "https://costillacounty.gov/treasurer", platform: "County website", hasOpenData: false } },
  { rank: 56, name: "Baca", population: 3428, population5yr: 3557, population10yr: 3667, seat: "Springfield", tax: { effRate: 0.41, medianTax: 496, medianHome: 122000 }, compPlan: { name: "Baca County Plan", yearAdopted: 2008, status: "overdue", notes: "Declining pop." }, zoning: { codeName: "Zoning Regs", source: "Self-hosted", url: "https://bacacountyco.gov", gisPortal: "Assessor", gisType: "Assessor" }, hearings: { bccSchedule: "1st & 3rd Wed", bccAgendaUrl: "https://bacacountyco.gov", bccVideoSource: "", pcSchedule: "", pcName: "Planning & Zoning" }, assessor: { url: "https://bacacountyco.gov/assessor", propertySearchUrl: "https://bacacountyco.gov/assessor", treasurerUrl: "https://bacacountyco.gov/treasurer", platform: "County website", hasOpenData: false } },
  { rank: 57, name: "Dolores", population: 2432, population5yr: 2035, population10yr: 2053, seat: "Dove Creek", tax: { effRate: 0.24, medianTax: 558, medianHome: 231900 }, compPlan: { name: "Dolores County Plan", yearAdopted: 2008, status: "overdue", notes: "+18% 10yr." }, zoning: { codeName: "Land Use Regs", source: "Self-hosted", url: "https://dolorescounty.org", gisPortal: "ESRI", gisType: "ESRI" }, hearings: { bccSchedule: "1st & 3rd Mon", bccAgendaUrl: "https://dolorescounty.org", bccVideoSource: "", pcSchedule: "", pcName: "Planning & Zoning" }, assessor: { url: "https://dolorescounty.org/assessor", propertySearchUrl: "https://dolorescounty.org/assessor", treasurerUrl: "https://dolorescounty.org/treasurer", platform: "County website", hasOpenData: false } },
  { rank: 58, name: "Sedgwick", population: 2304, population5yr: 2249, population10yr: 2379, seat: "Julesburg", tax: { effRate: 0.47, medianTax: 671, medianHome: 142700 }, compPlan: { name: "Sedgwick County Plan", yearAdopted: 2010, status: "overdue", notes: "Declining pop." }, zoning: { codeName: "Zoning Regs", source: "Self-hosted", url: "https://sedgwickcountyco.gov", gisPortal: "Parcel", gisType: "Parcel" }, hearings: { bccSchedule: "1st & 3rd Tues", bccAgendaUrl: "https://sedgwickcountyco.gov", bccVideoSource: "", pcSchedule: "", pcName: "Planning & Zoning" }, assessor: { url: "https://sedgwickcountyco.gov/assessor", propertySearchUrl: "https://sedgwickcountyco.gov/assessor", treasurerUrl: "https://sedgwickcountyco.gov/treasurer", platform: "County website", hasOpenData: false } },
  { rank: 59, name: "Cheyenne", population: 1741, population5yr: 1831, population10yr: 1836, seat: "Cheyenne Wells", tax: { effRate: 0.46, medianTax: 863, medianHome: 187100 }, compPlan: { name: "Cheyenne County Plan", yearAdopted: 2010, status: "overdue", notes: "" }, zoning: { codeName: "Zoning Regs", source: "Self-hosted", url: "https://cheyennecounty.net", gisPortal: "ESRI", gisType: "ESRI" }, hearings: { bccSchedule: "1st & 3rd Wed", bccAgendaUrl: "https://cheyennecounty.net", bccVideoSource: "", pcSchedule: "", pcName: "Planning & Zoning" }, assessor: { url: "https://cheyennecounty.net/assessor", propertySearchUrl: "https://cheyennecounty.net/assessor", treasurerUrl: "https://cheyennecounty.net/treasurer", platform: "County website", hasOpenData: false } },
  { rank: 60, name: "Kiowa", population: 1376, population5yr: 1406, population10yr: 1440, seat: "Eads", tax: { effRate: 0.58, medianTax: 862, medianHome: 148600 }, compPlan: { name: "Kiowa County Plan", yearAdopted: 2009, status: "overdue", notes: "3rd highest eff rate." }, zoning: { codeName: "Zoning Regs", source: "Self-hosted", url: "https://kiowacountyco.gov", gisPortal: "Assessor", gisType: "Assessor" }, hearings: { bccSchedule: "1st & 3rd Mon", bccAgendaUrl: "https://kiowacountyco.gov", bccVideoSource: "", pcSchedule: "", pcName: "Planning & Zoning" }, assessor: { url: "https://kiowacountyco.gov/assessor", propertySearchUrl: "https://kiowacountyco.gov/assessor", treasurerUrl: "https://kiowacountyco.gov/treasurer", platform: "County website", hasOpenData: false } },
  { rank: 61, name: "Jackson", population: 1372, population5yr: 1392, population10yr: 1401, seat: "Walden", tax: { effRate: 0.21, medianTax: 513, medianHome: 250000 }, compPlan: { name: "Jackson County Plan", yearAdopted: 2008, status: "overdue", notes: "Lowest eff rate in state (0.21%)." }, zoning: { codeName: "Zoning Regs", source: "Self-hosted", url: "https://jacksoncountyco.gov", gisPortal: "Assessor", gisType: "Assessor" }, hearings: { bccSchedule: "1st & 3rd Mon", bccAgendaUrl: "https://jacksoncountyco.gov", bccVideoSource: "", pcSchedule: "", pcName: "Planning & Zoning" }, assessor: { url: "https://jacksoncountyco.gov/assessor", propertySearchUrl: "https://jacksoncountyco.gov/assessor", treasurerUrl: "https://jacksoncountyco.gov/treasurer", platform: "County website", hasOpenData: false } },
  { rank: 62, name: "Hinsdale", population: 1005, population5yr: 827, population10yr: 790, seat: "Lake City", tax: { effRate: 0.29, medianTax: 1286, medianHome: 438800 }, compPlan: { name: "Hinsdale County Plan", yearAdopted: 2012, status: "aging", notes: "+27% 10yr. Smallest county." }, zoning: { codeName: "Land Use Regs", source: "Self-hosted", url: "https://hinsdalecountycolorado.us", gisPortal: "Assessor", gisType: "Assessor" }, hearings: { bccSchedule: "1st & 3rd Wed", bccAgendaUrl: "https://hinsdalecountycolorado.us", bccVideoSource: "", pcSchedule: "", pcName: "Planning & Zoning" }, assessor: { url: "https://hinsdalecountycolorado.us/assessor", propertySearchUrl: "https://hinsdalecountycolorado.us/assessor", treasurerUrl: "https://hinsdalecountycolorado.us/treasurer", platform: "County website", hasOpenData: false } },
  { rank: 63, name: "Mineral", population: 729, population5yr: 803, population10yr: 712, seat: "Creede", tax: { effRate: 0.35, medianTax: 1462, medianHome: 413000 }, compPlan: { name: "Mineral County Plan", yearAdopted: 2010, status: "overdue", notes: "2nd smallest." }, zoning: { codeName: "Land Use Regs", source: "Self-hosted", url: "https://mineralcountycolorado.com", gisPortal: "ESRI", gisType: "ESRI" }, hearings: { bccSchedule: "1st & 3rd Wed", bccAgendaUrl: "https://mineralcountycolorado.com", bccVideoSource: "", pcSchedule: "", pcName: "Planning & Zoning" }, assessor: { url: "https://mineralcountycolorado.com/assessor", propertySearchUrl: "https://mineralcountycolorado.com/assessor", treasurerUrl: "https://mineralcountycolorado.com/treasurer", platform: "County website", hasOpenData: false } },
  { rank: 64, name: "San Juan", population: 724, population5yr: 728, population10yr: 699, seat: "Silverton", tax: { effRate: 0.29, medianTax: 1195, medianHome: 406900 }, compPlan: { name: "San Juan County Master Plan", yearAdopted: 2013, status: "aging", notes: "Smallest county." }, zoning: { codeName: "Land Use Code", source: "Self-hosted", url: "https://sanjuancountyco.gov", gisPortal: "ESRI", gisType: "ESRI" }, hearings: { bccSchedule: "1st & 3rd Wed", bccAgendaUrl: "https://sanjuancountyco.gov", bccVideoSource: "", pcSchedule: "", pcName: "Planning & Zoning" }, assessor: { url: "https://sanjuancountyco.gov/assessor", propertySearchUrl: "https://sanjuancountyco.gov/assessor", treasurerUrl: "https://sanjuancountyco.gov/treasurer", platform: "County website", hasOpenData: false } },
];

export const countiesByName: Record<string, County> = Object.fromEntries(
  counties.map((c) => [c.name.toLowerCase(), c])
);
