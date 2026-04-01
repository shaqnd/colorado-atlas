import { useState } from 'react';
import { Layout } from './components/Layout';
import { ParcelMap } from './components/ParcelMap';
import { OverviewDashboard } from './components/OverviewDashboard';
import { ZoningAnalyzer } from './components/ZoningAnalyzer';
import { TaxCalculator } from './components/TaxCalculator';
import { AssessmentRates } from './components/AssessmentRates';
import { CountyTable } from './components/CountyTable';
import { CompPlanHealth } from './components/CompPlanHealth';
import { Templates } from './components/Templates';
import { SchemaView } from './components/SchemaView';
import { SourcesView } from './components/SourcesView';
import { CommunitiesExplorer } from './components/CommunitiesExplorer';
import type { TabId } from './components/Layout';

export default function App() {
  const [tab, setTab] = useState<TabId>('map');

  return (
    <Layout activeTab={tab} onTabChange={setTab} fullBleed={tab === 'map'}>
      {tab === 'map'       && <ParcelMap />}
      {tab === 'overview'  && <OverviewDashboard />}
      {tab === 'zoning'    && <ZoningAnalyzer />}
      {tab === 'tax'       && <TaxCalculator />}
      {tab === 'rates'     && <AssessmentRates />}
      {tab === 'counties'     && <CountyTable />}
      {tab === 'communities'  && <CommunitiesExplorer />}
      {tab === 'compplan'     && <CompPlanHealth />}
      {tab === 'templates' && <Templates />}
      {tab === 'schema'    && <SchemaView />}
      {tab === 'sources'   && <SourcesView />}
    </Layout>
  );
}
