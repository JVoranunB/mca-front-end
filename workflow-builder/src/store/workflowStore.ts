import { create } from 'zustand';
import { applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import type { Connection, NodeChange, EdgeChange } from '@xyflow/react';
import type { WorkflowNode, WorkflowEdge, Workflow, ValidationError, WorkflowSummary, TriggerType, StartConfig } from '../types/workflow.types';
import { workflowApiService } from '../services/workflowApi';
import { WorkflowTransformer } from '../utils/workflowTransformer';
import { sampleWorkflows } from '../data/sampleWorkflows';

interface WorkflowState {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNode: WorkflowNode | null;
  selectedEdge: WorkflowEdge | null;
  workflows: Workflow[];
  currentWorkflow: Workflow | null;
  validationErrors: ValidationError[];
  isDirty: boolean;
  leftSidebarVisible: boolean;
  rightSidebarVisible: boolean;
  isSaving: boolean;
  saveError: string | null;
  
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (params: Connection) => void;
  
  addNode: (node: WorkflowNode) => void;
  updateNode: (nodeId: string, data: Partial<WorkflowNode['data']>) => void;
  deleteNode: (nodeId: string) => void;
  
  addEdge: (edge: WorkflowEdge) => void;
  updateEdge: (edgeId: string, data: Partial<WorkflowEdge>) => void;
  deleteEdge: (edgeId: string) => void;
  
  selectNode: (node: WorkflowNode | null) => void;
  selectEdge: (edge: WorkflowEdge | null) => void;
  
  saveWorkflow: (name: string, description?: string) => Promise<{ success: boolean; error?: string }>;
  loadWorkflow: (workflowId: string) => void;
  clearWorkflow: () => void;
  deleteWorkflow: (workflowId: string) => void;
  updateWorkflowName: (name: string) => void;
  
  getAllWorkflows: () => WorkflowSummary[];
  createWorkflowFromType: (triggerType: TriggerType) => string;
  duplicateWorkflow: (id: string) => string;
  toggleWorkflowStatus: (id: string) => void;
  getWorkflowSummary: (workflow: Workflow) => WorkflowSummary;
  resetToSampleWorkflows: () => void;
  
  validateWorkflow: () => boolean;
  setValidationErrors: (errors: ValidationError[]) => void;
  
  setDirty: (isDirty: boolean) => void;
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
  setLeftSidebarVisible: (visible: boolean) => void;
  setRightSidebarVisible: (visible: boolean) => void;
  
  setSaving: (isSaving: boolean) => void;
  setSaveError: (error: string | null) => void;
}

// Helper function to initialize workflows with samples if localStorage is empty
const initializeWorkflows = (): Workflow[] => {
  const storedWorkflows = localStorage.getItem('workflows');
  if (!storedWorkflows || JSON.parse(storedWorkflows).length === 0) {
    // If no workflows in localStorage, use sample workflows as default
    localStorage.setItem('workflows', JSON.stringify(sampleWorkflows));
    return sampleWorkflows;
  }
  return JSON.parse(storedWorkflows);
};

const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNode: null,
  selectedEdge: null,
  workflows: initializeWorkflows(),
  currentWorkflow: null,
  validationErrors: [],
  isDirty: false,
  leftSidebarVisible: true,
  rightSidebarVisible: true,
  isSaving: false,
  saveError: null,
  
  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes) as WorkflowNode[],
      isDirty: true
    });
  },
  
  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges) as WorkflowEdge[],
      isDirty: true
    });
  },
  
  onConnect: (params) => {
    // Create unique edge ID that includes source handle to prevent duplicates
    const handleSuffix = params.sourceHandle ? `-${params.sourceHandle}` : '';
    const baseId = `e${params.source}-${params.target}${handleSuffix}`;
    
    // Ensure uniqueness by checking existing edges and adding a counter if needed
    const existingEdges = get().edges;
    let uniqueId = baseId;
    let counter = 1;
    while (existingEdges.some(edge => edge.id === uniqueId)) {
      uniqueId = `${baseId}-${counter}`;
      counter++;
    }
    
    const newEdge: WorkflowEdge = {
      id: uniqueId,
      source: params.source!,
      target: params.target!,
      sourceHandle: params.sourceHandle || undefined,
      targetHandle: params.targetHandle || undefined,
      animated: true,
      label: params.sourceHandle === 'otherwise' ? 'Otherwise' : params.sourceHandle === 'then' ? 'Then' : undefined,
    };
    
    set((state) => ({
      edges: [...state.edges, newEdge],
      isDirty: true
    }));
  },
  
  addNode: (node) => {
    set((state) => {
      // Check if node with same ID already exists
      const existingNode = state.nodes.find(n => n.id === node.id);
      if (existingNode) {
        console.warn(`Node with id "${node.id}" already exists, skipping duplicate`);
        return state; // Return unchanged state
      }
      
      return {
        nodes: [...state.nodes, node],
        isDirty: true
      };
    });
  },
  
  updateNode: (nodeId, data) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
      ),
      isDirty: true
    }));
  },
  
  deleteNode: (nodeId) => {
    set((state) => {
      const nodeToDelete = state.nodes.find(node => node.id === nodeId);
      
      // Prevent deletion of start nodes
      if (nodeToDelete?.type === 'start') {
        console.warn('Cannot delete start node');
        return state;
      }
      
      return {
        nodes: state.nodes.filter((node) => node.id !== nodeId),
        edges: state.edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
        selectedNode: state.selectedNode?.id === nodeId ? null : state.selectedNode,
        isDirty: true
      };
    });
  },
  
  addEdge: (edge) => {
    set((state) => {
      // Check if edge with same ID already exists
      const existingEdge = state.edges.find(e => e.id === edge.id);
      if (existingEdge) {
        console.warn(`Edge with ID '${edge.id}' already exists. Skipping duplicate.`);
        return state;
      }
      return {
        edges: [...state.edges, edge],
        isDirty: true
      };
    });
  },
  
  updateEdge: (edgeId, data) => {
    set((state) => ({
      edges: state.edges.map((edge) =>
        edge.id === edgeId ? { ...edge, ...data } : edge
      ),
      isDirty: true
    }));
  },
  
  deleteEdge: (edgeId) => {
    set((state) => ({
      edges: state.edges.filter((edge) => edge.id !== edgeId),
      selectedEdge: state.selectedEdge?.id === edgeId ? null : state.selectedEdge,
      isDirty: true
    }));
  },
  
  selectNode: (node) => {
    set({ selectedNode: node, selectedEdge: null });
  },
  
  selectEdge: (edge) => {
    set({ selectedEdge: edge, selectedNode: null });
  },
  
  saveWorkflow: async (name, description) => {
    const currentState = get();
    
    // Set saving state
    set({ isSaving: true, saveError: null });
    
    try {
      // For start node workflows, default to event-based
      const triggerType: TriggerType = 'event-based';
      
      const workflow: Workflow = {
        id: currentState.currentWorkflow?.id || Date.now().toString(),
        name,
        description: description || '',
        triggerType,
        nodes: currentState.nodes,
        edges: currentState.edges,
        createdAt: currentState.currentWorkflow?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: currentState.currentWorkflow?.status || 'draft'
      };
      
      // Transform workflow to backend format
      const backendWorkflow = WorkflowTransformer.transformToBackend(workflow);
      
      // Validate transformed workflow
      const validation = WorkflowTransformer.validateBackendWorkflow(backendWorkflow);
      if (!validation.valid) {
        console.warn('Backend workflow validation warnings:', validation.errors);
      }
      
      // Save to backend API
      const existingWorkflow = currentState.workflows.find(w => w.id === workflow.id);
      const apiResult = existingWorkflow 
        ? await workflowApiService.updateWorkflow(workflow.id, backendWorkflow)
        : await workflowApiService.saveWorkflow(backendWorkflow);
      
      if (!apiResult.success) {
        throw new Error(apiResult.error || 'Failed to save workflow to backend');
      }
      
      // Save to localStorage as backup
      const existingIndex = currentState.workflows.findIndex(w => w.id === workflow.id);
      let workflows;
      
      if (existingIndex >= 0) {
        workflows = [...currentState.workflows];
        workflows[existingIndex] = workflow;
      } else {
        workflows = [...currentState.workflows, workflow];
      }
      
      localStorage.setItem('workflows', JSON.stringify(workflows));
      
      set({
        workflows,
        currentWorkflow: workflow,
        isDirty: false,
        isSaving: false,
        saveError: null
      });
      
      return { success: true };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save workflow';
      console.error('Save workflow error:', error);
      
      set({
        isSaving: false,
        saveError: errorMessage
      });
      
      // Fallback to localStorage only
      try {
        const triggerType: TriggerType = 'event-based';
        
        const workflow: Workflow = {
          id: currentState.currentWorkflow?.id || Date.now().toString(),
          name,
          description: description || '',
          triggerType,
          nodes: currentState.nodes,
          edges: currentState.edges,
          createdAt: currentState.currentWorkflow?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: currentState.currentWorkflow?.status || 'draft'
        };
        
        const existingIndex = currentState.workflows.findIndex(w => w.id === workflow.id);
        let workflows;
        
        if (existingIndex >= 0) {
          workflows = [...currentState.workflows];
          workflows[existingIndex] = workflow;
        } else {
          workflows = [...currentState.workflows, workflow];
        }
        
        localStorage.setItem('workflows', JSON.stringify(workflows));
        
        set({
          workflows,
          currentWorkflow: workflow,
          isDirty: false
        });
        
        return { success: false, error: `${errorMessage} (saved locally only)` };
      } catch {
        return { success: false, error: errorMessage };
      }
    }
  },
  
  loadWorkflow: (workflowId) => {
    const workflow = get().workflows.find((w) => w.id === workflowId);
    if (workflow) {
      set({
        nodes: workflow.nodes,
        edges: workflow.edges,
        currentWorkflow: workflow,
        selectedNode: null,
        selectedEdge: null,
        rightSidebarVisible: false,
        isDirty: false
      });
    }
  },
  
  clearWorkflow: () => {
    set({
      nodes: [],
      edges: [],
      selectedNode: null,
      selectedEdge: null,
      currentWorkflow: null,
      validationErrors: [],
      isDirty: false
    });
  },
  
  deleteWorkflow: (workflowId) => {
    const workflows = get().workflows.filter((w) => w.id !== workflowId);
    localStorage.setItem('workflows', JSON.stringify(workflows));
    
    set({
      workflows,
      currentWorkflow: get().currentWorkflow?.id === workflowId ? null : get().currentWorkflow
    });
  },

  updateWorkflowName: (name) => {
    const currentState = get();
    if (!currentState.currentWorkflow) return;

    const updatedWorkflow = {
      ...currentState.currentWorkflow,
      name,
      updatedAt: new Date().toISOString()
    };

    const workflows = currentState.workflows.map(w => 
      w.id === updatedWorkflow.id ? updatedWorkflow : w
    );

    localStorage.setItem('workflows', JSON.stringify(workflows));
    
    set({
      workflows,
      currentWorkflow: updatedWorkflow,
      isDirty: true
    });
  },
  
  validateWorkflow: () => {
    const errors: ValidationError[] = [];
    const { nodes, edges } = get();
    
    const startNodes = nodes.filter((n) => n.data.type === 'start');
    if (startNodes.length === 0) {
      errors.push({
        message: 'Workflow must have a start node',
        severity: 'error'
      });
    } else if (startNodes.length > 1) {
      errors.push({
        message: 'Workflow should have only one start node',
        severity: 'warning'
      });
    }
    
    // Validate start node configurations
    startNodes.forEach((node) => {
      const config = node.data.config as StartConfig | undefined;
      
      if (!config) {
        errors.push({
          nodeId: node.id,
          message: `Start node "${node.data.label}" is missing configuration`,
          severity: 'error'
        });
        return;
      }
      
      if (!config.dataSource) {
        errors.push({
          nodeId: node.id,
          message: `Start node "${node.data.label}" must specify a data source`,
          severity: 'error'
        });
      }
    });
    
    nodes.forEach((node) => {
      const hasIncoming = edges.some((e) => e.target === node.id);
      
      if (node.data.type !== 'start' && !hasIncoming) {
        errors.push({
          nodeId: node.id,
          message: `Node "${node.data.label}" has no incoming connections`,
          severity: 'warning'
        });
      }
      
      // Condition node validation
      if (node.data.type === 'condition') {
        const thenEdge = edges.find((e) => e.source === node.id && e.sourceHandle === 'then');
        const otherwiseEdge = edges.find((e) => e.source === node.id && e.sourceHandle === 'otherwise');
        
        if (!thenEdge || !otherwiseEdge) {
          errors.push({
            nodeId: node.id,
            message: `Condition node "${node.data.label}" must have both Then and Otherwise branches`,
            severity: 'error'
          });
        }
        
        // Validate conditions
        const conditions = node.data.conditions || [];
        if (conditions.length === 0) {
          errors.push({
            nodeId: node.id,
            message: `Condition node "${node.data.label}" must have at least one condition`,
            severity: 'error'
          });
        }
        
        conditions.forEach((condition, index) => {
          if (!condition.dataSource) {
            errors.push({
              nodeId: node.id,
              message: `Condition ${index + 1} in "${node.data.label}" must specify a data source`,
              severity: 'error'
            });
          }
          
          if (!condition.field) {
            errors.push({
              nodeId: node.id,
              message: `Condition ${index + 1} in "${node.data.label}" must specify a field`,
              severity: 'error'
            });
          }
          
          if (!['is_empty', 'is_not_empty'].includes(condition.operator) && 
              (condition.value === undefined || condition.value === '')) {
            errors.push({
              nodeId: node.id,
              message: `Condition ${index + 1} in "${node.data.label}" must specify a value for operator "${condition.operator}"`,
              severity: 'error'
            });
          }
        });
      }
    });
    
    set({ validationErrors: errors });
    return errors.filter((e) => e.severity === 'error').length === 0;
  },
  
  setValidationErrors: (errors) => {
    set({ validationErrors: errors });
  },
  
  setDirty: (isDirty) => {
    set({ isDirty });
  },
  
  getAllWorkflows: () => {
    return get().workflows.map(workflow => get().getWorkflowSummary(workflow));
  },
  
  createWorkflowFromType: (triggerType: TriggerType) => {
    const now = new Date().toISOString();
    const workflow: Workflow = {
      id: Date.now().toString(),
      name: `New ${triggerType === 'event-based' ? 'Event-Based' : 'Schedule-Based'} Workflow`,
      description: '',
      triggerType,
      nodes: [],
      edges: [],
      createdAt: now,
      updatedAt: now,
      status: 'draft'
    };
    
    const workflows = [...get().workflows, workflow];
    localStorage.setItem('workflows', JSON.stringify(workflows));
    
    set({
      workflows,
      currentWorkflow: workflow,
      nodes: [],
      edges: [],
      selectedNode: null,
      selectedEdge: null,
      rightSidebarVisible: false,
      validationErrors: [],
      isDirty: false
    });
    
    return workflow.id;
  },
  
  duplicateWorkflow: (id: string) => {
    const originalWorkflow = get().workflows.find(w => w.id === id);
    if (!originalWorkflow) return '';
    
    const now = new Date().toISOString();
    const duplicatedWorkflow: Workflow = {
      ...originalWorkflow,
      id: Date.now().toString(),
      name: `${originalWorkflow.name} (Copy)`,
      createdAt: now,
      updatedAt: now,
      status: 'draft',
      lastTriggered: undefined
    };
    
    const workflows = [...get().workflows, duplicatedWorkflow];
    localStorage.setItem('workflows', JSON.stringify(workflows));
    
    set({ workflows });
    
    return duplicatedWorkflow.id;
  },
  
  toggleWorkflowStatus: (id: string) => {
    const workflows = get().workflows.map(workflow => {
      if (workflow.id === id) {
        const newStatus = workflow.status === 'active' ? 'paused' : 
                         workflow.status === 'paused' ? 'active' : 'active';
        return {
          ...workflow,
          status: newStatus as 'draft' | 'active' | 'paused',
          updatedAt: new Date().toISOString()
        };
      }
      return workflow;
    });
    
    localStorage.setItem('workflows', JSON.stringify(workflows));
    
    set({ workflows });
  },
  
  getWorkflowSummary: (workflow: Workflow): WorkflowSummary => {
    return {
      id: workflow.id,
      name: workflow.name,
      triggerType: workflow.triggerType,
      status: workflow.status,
      nodeCount: workflow.nodes.length,
      lastModified: workflow.updatedAt,
      lastTriggered: workflow.lastTriggered
    };
  },
  
  toggleLeftSidebar: () => {
    set((state) => ({ leftSidebarVisible: !state.leftSidebarVisible }));
  },
  
  toggleRightSidebar: () => {
    set((state) => ({ rightSidebarVisible: !state.rightSidebarVisible }));
  },
  
  setLeftSidebarVisible: (visible) => {
    set({ leftSidebarVisible: visible });
  },
  
  setRightSidebarVisible: (visible) => {
    set({ rightSidebarVisible: visible });
  },
  
  setSaving: (isSaving) => {
    set({ isSaving });
  },
  
  setSaveError: (error) => {
    set({ saveError: error });
  },

  resetToSampleWorkflows: () => {
    // Manually load sample workflows (replaces current workflows)
    localStorage.setItem('workflows', JSON.stringify(sampleWorkflows));
    
    set({ 
      workflows: sampleWorkflows,
      currentWorkflow: null,
      nodes: [],
      edges: [],
      selectedNode: null,
      selectedEdge: null,
      validationErrors: [],
      isDirty: false
    });
  }
}));

export default useWorkflowStore;