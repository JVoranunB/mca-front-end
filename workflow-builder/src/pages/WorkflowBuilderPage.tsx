import React, { useCallback, useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppProvider, Frame, Loading } from '@shopify/polaris';
import { ReactFlowProvider } from '@xyflow/react';
import type { ReactFlowInstance } from '@xyflow/react';
import '@shopify/polaris/build/esm/styles.css';
import '@xyflow/react/dist/style.css';
import '../styles/reactflow-polaris.css';

import TopBar from '../components/TopBar';
import NodeSidebar from '../components/NodeSidebar';
import PropertiesSidebar from '../components/PropertiesSidebar';
import WorkflowCanvas from '../components/WorkflowCanvas';
import useWorkflowStore from '../store/workflowStore';
import type { NodeTemplate, WorkflowNode, TriggerType } from '../types/workflow.types';
import { sampleWorkflows } from '../data/sampleWorkflows';

const WorkflowBuilderPage = () => {
  const { workflowId, triggerType } = useParams<{ workflowId?: string; triggerType?: TriggerType }>();
  const navigate = useNavigate();
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addNode, loadWorkflow, createWorkflowFromType, leftSidebarVisible, rightSidebarVisible, setLeftSidebarVisible } = useWorkflowStore();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const initializeWorkflow = () => {
      const store = useWorkflowStore.getState();
      
      // Auto-open left sidebar when coming from workflow list page
      setLeftSidebarVisible(true);
      
      if (workflowId) {
        // Edit existing workflow
        if (workflowId === 'new') {
          // New workflow with trigger type from URL
          if (triggerType) {
            const newWorkflowId = createWorkflowFromType(triggerType);
            navigate(`/workflow/${newWorkflowId}/edit`, { replace: true });
            return;
          } else {
            // Fallback to event-based if no type specified
            const newWorkflowId = createWorkflowFromType('event-based');
            navigate(`/workflow/${newWorkflowId}/edit`, { replace: true });
            return;
          }
        } else {
          // Load existing workflow
          loadWorkflow(workflowId);
        }
      } else {
        // Legacy route - load sample if no nodes exist
        if (store.nodes.length === 0 && store.edges.length === 0) {
          const firstSample = sampleWorkflows[0];
          if (firstSample) {
            firstSample.nodes.forEach((node: WorkflowNode) => store.addNode(node));
            firstSample.edges.forEach((edge) => store.addEdge(edge));
          }
        }
      }
      
      setIsLoading(false);
    };

    initializeWorkflow();
  }, [workflowId, triggerType, loadWorkflow, createWorkflowFromType, addNode, navigate, setLeftSidebarVisible]);
  
  const onDragStart = (event: React.DragEvent, nodeTemplate: NodeTemplate) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeTemplate));
    event.dataTransfer.effectAllowed = 'move';
  };
  
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);
  
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      
      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const nodeTemplateData = event.dataTransfer.getData('application/reactflow');
      
      if (!nodeTemplateData || !reactFlowBounds || !reactFlowInstance) {
        return;
      }
      
      const nodeTemplate = JSON.parse(nodeTemplateData) as NodeTemplate;
      
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      
      const newNode: WorkflowNode = {
        id: `node-${Date.now()}`,
        type: nodeTemplate.type,
        position,
        data: {
          label: nodeTemplate.label,
          type: nodeTemplate.type,
          description: nodeTemplate.description,
          icon: nodeTemplate.icon,
          config: nodeTemplate.defaultConfig || {},
          conditions: nodeTemplate.type === 'condition' ? [] : undefined,
        },
      };
      
      addNode(newNode);
    },
    [reactFlowInstance, addNode]
  );

  const handleBackToList = () => {
    navigate('/');
  };
  
  if (isLoading) {
    return (
      <AppProvider i18n={{}}>
        <Frame>
          <Loading />
        </Frame>
      </AppProvider>
    );
  }
  
  return (
    <AppProvider i18n={{}}>
      <Frame>
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
          <TopBar onBackToList={handleBackToList} />
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            {(leftSidebarVisible || !leftSidebarVisible) && <NodeSidebar onDragStart={onDragStart} />}
            <div ref={reactFlowWrapper} style={{ flex: 1 }}>
              <ReactFlowProvider>
                <WorkflowCanvas
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  setReactFlowInstance={setReactFlowInstance}
                />
              </ReactFlowProvider>
            </div>
            {(rightSidebarVisible || !rightSidebarVisible) && <PropertiesSidebar />}
          </div>
        </div>
      </Frame>
    </AppProvider>
  );
};

export default WorkflowBuilderPage;