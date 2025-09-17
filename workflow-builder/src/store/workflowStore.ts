import { create } from 'zustand';
import { applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import type { Connection, NodeChange, EdgeChange } from '@xyflow/react';
import type { WorkflowNode, WorkflowPeer, Workflow, ValidationError, WorkflowSummary, TriggerType, StartConfig, WorkflowCondition } from '../types/workflow.types';
import { workflowApiService } from '../services/workflowApi';
import { WorkflowTransformer } from '../utils/workflowTransformer';
import { sampleWorkflows } from '../data/sampleWorkflows';

interface WorkflowState {
  actions: WorkflowNode[];
  peers: WorkflowPeer[];
  selectedAction: WorkflowNode | null;
  selectedPeer: WorkflowPeer | null;
  workflows: Workflow[];
  currentWorkflow: Workflow | null;
  validationErrors: ValidationError[];
  isDirty: boolean;
  leftSidebarVisible: boolean;
  rightSidebarVisible: boolean;
  isSaving: boolean;
  saveError: string | null;
  toastActive: boolean;
  toastMessage: string;
  
  onActionsChange: (changes: NodeChange[]) => void;
  onPeersChange: (changes: EdgeChange[]) => void;
  onConnect: (params: Connection) => void;
  
  addAction: (action: WorkflowNode) => void;
  updateAction: (actionId: string, data: Partial<WorkflowNode['data']>) => void;
  deleteAction: (actionId: string) => void;
  
  addPeer: (peer: WorkflowPeer) => void;
  updatePeer: (peerId: string, data: Partial<WorkflowPeer>) => void;
  deletePeer: (peerId: string) => void;
  
  selectAction: (action: WorkflowNode | null) => void;
  selectPeer: (peer: WorkflowPeer | null) => void;
  
  saveWorkflow: (name: string, description?: string) => Promise<{ success: boolean; error?: string }>;
  loadWorkflow: (workflowId: string) => void;
  clearWorkflow: () => void;
  deleteWorkflow: (workflowId: string) => void;
  updateWorkflowName: (name: string) => void;
  updateTriggerType: (triggerType: TriggerType) => void;
  
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
  
  showToast: (message: string) => void;
  hideToast: () => void;
  
  // Backward compatibility methods for nodes → actions transition
  get nodes(): WorkflowNode[];
  addNode: (node: WorkflowNode) => void;
  updateNode: (nodeId: string, data: Partial<WorkflowNode['data']>) => void;
  deleteNode: (nodeId: string) => void;
  selectNode: (node: WorkflowNode | null) => void;
  selectedNode: WorkflowNode | null;
  onNodesChange: (changes: NodeChange[]) => void;
}

// Helper function to migrate workflow from camelCase to snake_case
const migrateWorkflow = (workflow: Record<string, unknown>): Workflow => {
  return {
    id: workflow.id as string,
    name: workflow.name as string,
    description: workflow.description as string | undefined,
    trigger_type: (workflow.trigger_type || workflow.triggerType) as TriggerType,
    actions: (workflow.actions || workflow.nodes) as WorkflowNode[],
    peers: workflow.peers as WorkflowPeer[],
    created_at: (workflow.created_at || workflow.createdAt) as string,
    updated_at: (workflow.updated_at || workflow.updatedAt) as string,
    status: workflow.status as 'active' | 'draft' | 'paused',
    last_triggered: (workflow.last_triggered || workflow.lastTriggered) as string | undefined
  };
};

// Helper function to initialize workflows with samples if localStorage is empty
const initializeWorkflows = (): Workflow[] => {
  const storedWorkflows = localStorage.getItem('workflows');
  if (!storedWorkflows || JSON.parse(storedWorkflows).length === 0) {
    // If no workflows in localStorage, use sample workflows as default
    localStorage.setItem('workflows', JSON.stringify(sampleWorkflows));
    return sampleWorkflows;
  }

  const parsed = JSON.parse(storedWorkflows);
  // Migrate any old format workflows to new snake_case format
  const migratedWorkflows = parsed.map(migrateWorkflow);

  // Save migrated workflows back to localStorage
  localStorage.setItem('workflows', JSON.stringify(migratedWorkflows));

  return migratedWorkflows;
};

const useWorkflowStore = create<WorkflowState>((set, get) => ({
  actions: [],
  peers: [],
  selectedAction: null,
  selectedPeer: null,
  workflows: initializeWorkflows(),
  currentWorkflow: null,
  validationErrors: [],
  isDirty: false,
  leftSidebarVisible: true,
  rightSidebarVisible: true,
  isSaving: false,
  saveError: null,
  toastActive: false,
  toastMessage: '',
  
  onActionsChange: (changes) => {
    set({
      actions: applyNodeChanges(changes, get().actions) as WorkflowNode[],
      isDirty: true
    });
  },
  
  onPeersChange: (changes) => {
    set({
      peers: applyEdgeChanges(changes, get().peers) as WorkflowPeer[],
      isDirty: true
    });
  },
  
  onConnect: (params) => {
    // Create unique peer ID that includes source handle to prevent duplicates
    const handleSuffix = params.sourceHandle ? `-${params.sourceHandle}` : '';
    const baseId = `p${params.source}-${params.target}${handleSuffix}`;
    
    // Ensure uniqueness by checking existing peers and adding a counter if needed
    const existingPeers = get().peers;
    let uniqueId = baseId;
    let counter = 1;
    while (existingPeers.some(peer => peer.id === uniqueId)) {
      uniqueId = `${baseId}-${counter}`;
      counter++;
    }
    
    const newPeer: WorkflowPeer = {
      id: uniqueId,
      source: params.source!,
      target: params.target!,
      source_handle: params.sourceHandle || undefined,
      target_handle: params.targetHandle || undefined,
      animated: true,
      label: params.sourceHandle === 'no' ? 'No' : params.sourceHandle === 'yes' ? 'Yes' : undefined,
    };
    
    set((state) => ({
      peers: [...state.peers, newPeer],
      isDirty: true
    }));
  },
  
  addAction: (action) => {
    set((state) => {
      // Check if action with same ID already exists
      const existingAction = state.actions.find(a => a.id === action.id);
      if (existingAction) {
        console.warn(`Action with id "${action.id}" already exists, skipping duplicate`);
        return state; // Return unchanged state
      }
      
      return {
        actions: [...state.actions, action],
        isDirty: true
      };
    });
  },
  
  updateAction: (actionId, data) => {
    set((state) => ({
      actions: state.actions.map((action) =>
        action.id === actionId ? { ...action, data: { ...action.data, ...data } } : action
      ),
      isDirty: true
    }));
  },
  
  deleteAction: (actionId) => {
    set((state) => {
      const actionToDelete = state.actions.find(action => action.id === actionId);
      
      // Prevent deletion of start actions
      if (actionToDelete?.type === 'start') {
        console.warn('Cannot delete start action');
        return state;
      }
      
      return {
        actions: state.actions.filter((action) => action.id !== actionId),
        peers: state.peers.filter((peer) => peer.source !== actionId && peer.target !== actionId),
        selectedAction: state.selectedAction?.id === actionId ? null : state.selectedAction,
        isDirty: true
      };
    });
  },
  
  addPeer: (peer) => {
    set((state) => {
      // Check if peer with same ID already exists
      const existingPeer = state.peers.find(p => p.id === peer.id);
      if (existingPeer) {
        console.warn(`Peer with ID '${peer.id}' already exists. Skipping duplicate.`);
        return state;
      }
      return {
        peers: [...state.peers, peer],
        isDirty: true
      };
    });
  },
  
  updatePeer: (peerId, data) => {
    set((state) => ({
      peers: state.peers.map((peer) =>
        peer.id === peerId ? { ...peer, ...data } : peer
      ),
      isDirty: true
    }));
  },
  
  deletePeer: (peerId) => {
    set((state) => ({
      peers: state.peers.filter((peer) => peer.id !== peerId),
      selectedPeer: state.selectedPeer?.id === peerId ? null : state.selectedPeer,
      isDirty: true
    }));
  },
  
  selectAction: (action) => {
    set({
      selectedAction: action,
      selectedPeer: null,
      rightSidebarVisible: action !== null
    });
  },
  
  selectPeer: (peer) => {
    set({ selectedPeer: peer, selectedAction: null });
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
        trigger_type: triggerType,
        actions: currentState.actions,
        peers: currentState.peers,
        created_at: currentState.currentWorkflow?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: currentState.currentWorkflow?.status || 'draft'
      };
      
      // Console log the workflow JSON when saving
      console.log('=== SAVING WORKFLOW ===');
      console.log('Workflow JSON:', JSON.stringify(workflow, null, 2));
      console.log('=======================');
      
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
          trigger_type: triggerType,
          actions: currentState.actions,
          peers: currentState.peers,
          created_at: currentState.currentWorkflow?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: currentState.currentWorkflow?.status || 'draft'
        };
        
        // Console log the workflow JSON when saving (fallback)
        console.log('=== SAVING WORKFLOW (FALLBACK) ===');
        console.log('Workflow JSON:', JSON.stringify(workflow, null, 2));
        console.log('=================================');
        
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
        actions: workflow.actions,
        peers: workflow.peers,
        currentWorkflow: workflow,
        selectedAction: null,
        selectedPeer: null,
        rightSidebarVisible: false,
        isDirty: false
      });
    }
  },
  
  clearWorkflow: () => {
    set({
      actions: [],
      peers: [],
      selectedAction: null,
      selectedPeer: null,
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
      updated_at: new Date().toISOString()
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

  updateTriggerType: (triggerType) => {
    const currentState = get();
    if (!currentState.currentWorkflow) return;

    const updatedWorkflow = {
      ...currentState.currentWorkflow,
      trigger_type: triggerType,
      updated_at: new Date().toISOString()
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
    const { actions, peers } = get();
    
    const startActions = actions.filter((a) => a.data.type === 'start');
    if (startActions.length === 0) {
      errors.push({
        message: 'Workflow must have a start action',
        severity: 'error'
      });
    } else if (startActions.length > 1) {
      errors.push({
        message: 'Workflow should have only one start action',
        severity: 'warning'
      });
    }
    
    // Validate start action configurations
    startActions.forEach((action) => {
      const config = action.data.config as StartConfig | undefined;
      
      if (!config) {
        errors.push({
          node_id: action.id,
          message: `Start action "${action.data.label}" is missing configuration`,
          severity: 'error'
        });
        return;
      }
      
      if (!config.data_source) {
        errors.push({
          node_id: action.id,
          message: `Start action "${action.data.label}" must specify a data source`,
          severity: 'error'
        });
      }
    });
    
    actions.forEach((action) => {
      const hasIncoming = peers.some((p) => p.target === action.id);
      
      if (action.data.type !== 'start' && !hasIncoming) {
        errors.push({
          node_id: action.id,
          message: `Action "${action.data.label}" has no incoming connections`,
          severity: 'warning'
        });
      }
      
      // Condition action validation
      if (action.data.type === 'condition') {
        const yesEdge = peers.find((p) => p.source === action.id && p.source_handle === 'yes');
        const noEdge = peers.find((p) => p.source === action.id && p.source_handle === 'no');
        
        // Only require the "yes" branch - "no" branch is optional
        if (!yesEdge) {
          errors.push({
            node_id: action.id,
            message: `Condition action "${action.data.label}" must have a Yes branch connected`,
            severity: 'error'
          });
        }
        
        // Optional warning when no "no" branch is connected
        if (!noEdge) {
          errors.push({
            node_id: action.id,
            message: `Condition action "${action.data.label}" has no No branch connected`,
            severity: 'warning'
          });
        }
        
        // Validate conditions
        const conditions = action.data.conditions || [];
        if (conditions.length === 0) {
          errors.push({
            node_id: action.id,
            message: `Condition action "${action.data.label}" must have at least one condition`,
            severity: 'error'
          });
        }
        
        conditions.forEach((condition: WorkflowCondition, index: number) => {
          if (!condition.data_source) {
            errors.push({
              node_id: action.id,
              message: `Condition ${index + 1} in "${action.data.label}" must specify a data source`,
              severity: 'error'
            });
          }
          
          if (!condition.field) {
            errors.push({
              node_id: action.id,
              message: `Condition ${index + 1} in "${action.data.label}" must specify a field`,
              severity: 'error'
            });
          }
          
          if (!['is_empty', 'is_not_empty'].includes(condition.operator) && 
              (condition.value === undefined || condition.value === '')) {
            errors.push({
              node_id: action.id,
              message: `Condition ${index + 1} in "${action.data.label}" must specify a value for operator "${condition.operator}"`,
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
      trigger_type: triggerType,
      actions: [],
      peers: [],
      created_at: now,
      updated_at: now,
      status: 'draft'
    };
    
    const workflows = [...get().workflows, workflow];
    localStorage.setItem('workflows', JSON.stringify(workflows));
    
    set({
      workflows,
      currentWorkflow: workflow,
      actions: [],
      peers: [],
      selectedAction: null,
      selectedPeer: null,
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
      created_at: now,
      updated_at: now,
      status: 'draft',
      last_triggered: undefined
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
          updated_at: new Date().toISOString()
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
      trigger_type: workflow.trigger_type,
      status: workflow.status,
      action_count: workflow.actions.length,
      last_modified: workflow.updated_at,
      last_triggered: workflow.last_triggered
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

  showToast: (message) => {
    set({ toastActive: true, toastMessage: message });
  },

  hideToast: () => {
    set({ toastActive: false, toastMessage: '' });
  },

  resetToSampleWorkflows: () => {
    // Manually load sample workflows (replaces current workflows)
    localStorage.setItem('workflows', JSON.stringify(sampleWorkflows));
    
    set({ 
      workflows: sampleWorkflows,
      currentWorkflow: null,
      actions: [],
      peers: [],
      selectedAction: null,
      selectedPeer: null,
      validationErrors: [],
      isDirty: false
    });
  },
  
  // Backward compatibility getters and methods for nodes → actions transition
  get nodes() {
    return get().actions;
  },
  
  get selectedNode() {
    return get().selectedAction;
  },
  
  addNode: (node) => get().addAction(node),
  updateNode: (nodeId, data) => get().updateAction(nodeId, data),
  deleteNode: (nodeId) => get().deleteAction(nodeId),
  selectNode: (node) => get().selectAction(node),
  onNodesChange: (changes) => get().onActionsChange(changes),
  
  // Utility methods for camelCase → snake_case compatibility
  convertToSnakeCase: (workflow: Record<string, unknown>): Workflow => {
    return {
      id: workflow.id as string,
      name: workflow.name as string,
      description: workflow.description as string | undefined,
      trigger_type: (workflow.triggerType || workflow.trigger_type) as TriggerType,
      actions: (workflow.actions || workflow.nodes) as WorkflowNode[],
      peers: workflow.peers as WorkflowPeer[],
      created_at: (workflow.createdAt || workflow.created_at) as string,
      updated_at: (workflow.updatedAt || workflow.updated_at) as string,
      status: workflow.status as 'active' | 'draft' | 'paused',
      last_triggered: (workflow.lastTriggered || workflow.last_triggered) as string | undefined
    };
  },
  
  convertToCamelCase: (workflow: Workflow): Record<string, unknown> => {
    return {
      id: workflow.id,
      name: workflow.name,
      description: workflow.description,
      triggerType: workflow.trigger_type,
      actions: workflow.actions,
      peers: workflow.peers,
      createdAt: workflow.created_at,
      updatedAt: workflow.updated_at,
      status: workflow.status,
      lastTriggered: workflow.last_triggered
    };
  }
}));

export default useWorkflowStore;