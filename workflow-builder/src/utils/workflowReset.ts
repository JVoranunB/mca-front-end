// Utility functions for resetting workflows in development
// These can be called from the browser console for testing

import type { Workflow } from '../types/workflow.types';

export const clearAllWorkflows = () => {
  localStorage.removeItem('workflows');
  console.log('✅ Cleared all workflows from localStorage!');
  console.log('🔄 Reload the page - sample workflows will auto-load.');
};

export const loadSampleWorkflows = () => {
  // Load sample workflows manually
  import('../data/sampleWorkflows').then(({ sampleWorkflows }) => {
    localStorage.setItem('workflows', JSON.stringify(sampleWorkflows));
    console.log('✅ Loaded sample workflows manually!');
    console.log('🔄 Reload the page to see the sample workflows.');
    window.location.reload();
  }).catch((error) => {
    console.error('Failed to load sample workflows:', error);
  });
};

export const checkCurrentWorkflows = () => {
  const workflows = localStorage.getItem('workflows');
  if (workflows) {
    const parsed = JSON.parse(workflows);
    console.log(`Found ${parsed.length} workflows:`, parsed.map((w: Workflow) => ({ 
      name: w.name, 
      type: w.triggerType, 
      nodes: w.nodes.length,
      id: w.id 
    })));
    return parsed;
  } else {
    console.log('No workflows found in localStorage');
    return [];
  }
};

// Make functions globally available for console access
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).clearAllWorkflows = clearAllWorkflows;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).loadSampleWorkflows = loadSampleWorkflows;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).checkCurrentWorkflows = checkCurrentWorkflows;
}