import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from '@shopify/polaris';
import '@shopify/polaris/build/esm/styles.css';
import '@xyflow/react/dist/style.css';
import './styles/reactflow-polaris.css';

import WorkflowListPage from './pages/WorkflowListPage';
import WorkflowBuilderPage from './pages/WorkflowBuilderPage';

// Import workflow reset utilities for development
import './utils/workflowReset';

function App() {
  return (
    <AppProvider i18n={{}}>
      <Router>
        <Routes>
          <Route path="/" element={<WorkflowListPage />} />
          <Route path="/workflow/new/:triggerType" element={<WorkflowBuilderPage />} />
          <Route path="/workflow/:workflowId/edit" element={<WorkflowBuilderPage />} />
          <Route path="/builder" element={<WorkflowBuilderPage />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App
