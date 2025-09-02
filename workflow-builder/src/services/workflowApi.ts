// import type { Workflow } from '../types/workflow.types'; // Not used in this file

export interface BackendWorkflowAction {
  action_id: string;
  key: string;
  type: 'trigger' | 'action' | 'condition' | 'step';
  config?: Record<string, unknown>;
  mapper?: {
    value?: {
      mode: string;
      value: string;
    };
    [key: string]: unknown;
  } | null;
}

export interface BackendWorkflowPeer {
  parent_key: string;
  child_key: string;
  meta_output?: string;
}

export interface BackendWorkflow {
  workflow_id: string;
  name: string;
  version: string;
  status: 'active' | 'paused' | 'draft';
  actions: BackendWorkflowAction[];
  peers: BackendWorkflowPeer[];
}

class WorkflowApiService {
  private baseUrl: string;

  constructor() {
    // Default to localhost for development, can be overridden by environment variable
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
  }

  async saveWorkflow(workflow: BackendWorkflow): Promise<{ success: boolean; data?: unknown; error?: string }> {
    console.log('🚀 FAKE API CALL - POST /workflows');
    console.log('📤 Request URL:', `${this.baseUrl}/workflows`);
    console.log('📤 Request Headers:', {
      'Content-Type': 'application/json',
    });
    console.log('📤 Request Body:', JSON.stringify(workflow, null, 2));
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate successful response
    const fakeResponse = {
      id: workflow.workflow_id,
      status: 'saved',
      timestamp: new Date().toISOString(),
      message: 'Workflow saved successfully (FAKE RESPONSE)'
    };
    
    console.log('📥 Response Data:', fakeResponse);
    
    return { 
      success: true, 
      data: fakeResponse 
    };
  }

  async updateWorkflow(workflowId: string, workflow: BackendWorkflow): Promise<{ success: boolean; data?: unknown; error?: string }> {
    console.log('🚀 FAKE API CALL - PUT /workflows/' + workflowId);
    console.log('📤 Request URL:', `${this.baseUrl}/workflows/${workflowId}`);
    console.log('📤 Request Headers:', {
      'Content-Type': 'application/json',
    });
    console.log('📤 Request Body:', JSON.stringify(workflow, null, 2));
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Simulate successful response
    const fakeResponse = {
      id: workflowId,
      status: 'updated',
      timestamp: new Date().toISOString(),
      message: 'Workflow updated successfully (FAKE RESPONSE)'
    };
    
    console.log('📥 Response Data:', fakeResponse);
    
    return { 
      success: true, 
      data: fakeResponse 
    };
  }

  async deleteWorkflow(workflowId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/workflows/${workflowId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to delete workflow from backend:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  async getWorkflows(): Promise<{ success: boolean; data?: BackendWorkflow[]; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/workflows`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Failed to fetch workflows from backend:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }
}

export const workflowApiService = new WorkflowApiService();