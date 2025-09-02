import type { Workflow, WorkflowNode, WorkflowEdge } from '../types/workflow.types';
import type { BackendWorkflow, BackendWorkflowAction, BackendWorkflowPeer } from '../services/workflowApi';
import { DATA_SOURCE_FIELDS } from './dataSourceFields';

interface NodeMapping {
  [nodeId: string]: string; // Maps frontend node IDs to backend action keys
}

export class WorkflowTransformer {
  /**
   * Transform a frontend workflow to backend format
   */
  static transformToBackend(workflow: Workflow): BackendWorkflow {
    const nodeMapping: NodeMapping = {};
    let actionCounter = 1;

    // Create mapping from node IDs to action keys
    workflow.nodes.forEach((node) => {
      nodeMapping[node.id] = `a${actionCounter}`;
      actionCounter++;
    });

    // Transform nodes to actions
    const actions: BackendWorkflowAction[] = workflow.nodes.map((node) => {
      return this.transformNodeToAction(node, nodeMapping);
    });

    // Transform edges to peers
    const peers: BackendWorkflowPeer[] = workflow.edges.map((edge) => {
      return this.transformEdgeToPeer(edge, nodeMapping);
    });

    return {
      workflow_id: workflow.id,
      name: workflow.name,
      version: '1.0',
      status: workflow.status,
      actions,
      peers,
    };
  }

  /**
   * Transform a frontend node to backend action
   */
  private static transformNodeToAction(node: WorkflowNode, nodeMapping: NodeMapping): BackendWorkflowAction {
    const actionKey = nodeMapping[node.id];
    
    // Base action structure
    const action: BackendWorkflowAction = {
      action_id: this.mapNodeToActionId(node),
      key: actionKey,
      type: this.mapNodeTypeToActionType(node.data.type),
      config: this.transformNodeConfig(node),
      mapper: this.createMapper(node),
    };

    return action;
  }

  /**
   * Map node to standardized action_id
   */
  private static mapNodeToActionId(node: WorkflowNode): string {
    const nodeType = node.data.type;
    const label = node.data.label.toLowerCase();
    
    // Map based on node type and label patterns
    switch (nodeType) {
      case 'start':
        return 'contact-enrollment-trigger';
        
      case 'trigger':
        // Legacy trigger support
        if (label.includes('cron') || label.includes('schedule')) {
          return 'cron-trigger-action';
        }
        return 'contact-enrollment-trigger';
        
      case 'condition':
        return 'pg-action'; // PostgreSQL condition check
        
      case 'action':
        if (label.includes('sms') || label.includes('phone')) {
          return 'sms-action';
        }
        if (label.includes('email') || label.includes('mail')) {
          return 'email-action';
        }
        if (label.includes('line') || label.includes('LINE')) {
          return 'line-action';
        }
        if (label.includes('slack')) {
          return 'slack-action';
        }
        if (label.includes('webhook') || label.includes('http') || label.includes('api')) {
          return 'webhook-action';
        }
        if (label.includes('tag')) {
          return 'tag-action';
        }
        return 'webhook-action'; // Default for actions
        
      case 'step':
        if (label.includes('wait') || label.includes('delay')) {
          return 'wait-action';
        }
        if (label.includes('log') || label.includes('debug')) {
          return 'log-action';
        }
        return 'pg-action';
        
      default:
        return 'webhook-action'; // Safe default
    }
  }

  /**
   * Map frontend node types to backend action types
   */
  private static mapNodeTypeToActionType(nodeType: string): 'trigger' | 'action' | 'condition' | 'step' {
    switch (nodeType) {
      case 'start':
        return 'trigger';
      case 'trigger':
        return 'trigger';
      case 'condition':
        return 'condition';
      case 'action':
        return 'action';
      case 'step':
        return 'step';
      default:
        return 'action';
    }
  }

  /**
   * Transform node configuration for backend
   */
  private static transformNodeConfig(node: WorkflowNode): Record<string, unknown> {
    const config: Record<string, unknown> = {};

    switch (node.data.type) {
      case 'start':
        config.event = 'workflow_start';
        config.merchantId = node.data.config?.merchantId || '';
        config.dataSource = node.data.config?.dataSource || 'CRM';
        break;

      case 'condition':
        if (node.data.conditions && node.data.conditions.length > 0) {
          const conditionStrings = node.data.conditions.map((condition) => {
            const field = this.mapFieldToContextPath(condition.dataSource, condition.collection, condition.field);
            const operator = this.mapOperatorToExpression(condition.operator);
            const value = typeof condition.value === 'string' ? `'${condition.value}'` : condition.value;
            
            switch (condition.operator) {
              case 'is_empty':
                return `!${field}`;
              case 'is_not_empty':
                return `${field}`;
              default:
                return `${field} ${operator} ${value}`;
            }
          });

          // Combine conditions with logical operators
          config.conditions = conditionStrings.reduce((acc, condition, index) => {
            if (index === 0) return condition;
            const logicalOp = node.data.conditions?.[index]?.logicalOperator === 'OR' ? '||' : '&&';
            return `${acc} ${logicalOp} ${condition}`;
          });
        }
        break;

      case 'action':
        config.actionType = this.getActionType(node.data.label);
        Object.assign(config, node.data.config || {});
        break;

      case 'step':
        config.stepType = this.getStepType(node.data.label);
        Object.assign(config, node.data.config || {});
        break;
    }

    return config;
  }

  /**
   * Create mapper for actions that need data transformation
   */
  private static createMapper(node: WorkflowNode): BackendWorkflowAction['mapper'] {
    if (node.data.type === 'action') {
      // For notification actions, create dynamic content mapping
      if (node.data.label.includes('SMS') || node.data.label.includes('email') || node.data.label.includes('LINE')) {
        const config = node.data.config as Record<string, unknown>;
        const message = String(config?.message || config?.body || '');
        if (message) {
          return {
            value: {
              mode: 'expression',
              value: this.transformMessageTemplate(message),
            },
          };
        }
      }

      // For webhook actions
      if (node.data.label.includes('webhook')) {
        return {
          value: {
            mode: 'expression',
            value: 'ctx.triggerData', // Pass trigger data to webhook
          },
        };
      }
    }

    return null;
  }

  /**
   * Get all available collection names from DATA_SOURCE_FIELDS
   */
  private static getAvailableCollections(): string[] {
    return Object.keys(DATA_SOURCE_FIELDS.CRM);
  }

  /**
   * Get the preferred collection for a field type (smart defaults)
   */
  private static getPreferredCollectionForField(field: string): string {
    const availableCollections = this.getAvailableCollections();
    
    // Smart mapping based on field name patterns
    const fieldLowerCase = field.toLowerCase();
    
    // User/Contact related fields
    if (fieldLowerCase.includes('name') || fieldLowerCase.includes('email') || 
        fieldLowerCase.includes('phone') || fieldLowerCase.includes('user') ||
        fieldLowerCase.includes('customer') || fieldLowerCase.includes('contact')) {
      return availableCollections.find(col => col.includes('contact')) || availableCollections[0] || 'data';
    }
    
    // Order related fields
    if (fieldLowerCase.includes('order') || fieldLowerCase.includes('purchase') || 
        fieldLowerCase.includes('price') || fieldLowerCase.includes('total') ||
        fieldLowerCase.includes('amount') || fieldLowerCase.includes('payment')) {
      return availableCollections.find(col => col.includes('order')) || availableCollections[0] || 'data';
    }
    
    // Merchant related fields
    if (fieldLowerCase.includes('merchant') || fieldLowerCase.includes('store') ||
        fieldLowerCase.includes('shop') || fieldLowerCase.includes('business')) {
      return availableCollections.find(col => col.includes('merchant') || col.includes('store')) || availableCollections[0] || 'data';
    }
    
    // Product related fields
    if (fieldLowerCase.includes('product') || fieldLowerCase.includes('item') ||
        fieldLowerCase.includes('sku') || fieldLowerCase.includes('category')) {
      return availableCollections.find(col => col.includes('product') || col.includes('item')) || availableCollections[0] || 'data';
    }
    
    // Default to first collection
    return availableCollections[0] || 'data';
  }

  /**
   * Map field to correct context path using DATA_SOURCE_FIELDS dynamically
   */
  private static mapFieldToContextPath(dataSource?: string, collection?: string, field?: string): string {
    if (!field) return 'ctx.data.unknown';
    
    // Use DATA_SOURCE_FIELDS to determine the correct context path
    if (dataSource === 'CRM' && collection) {
      // Get the collection from DATA_SOURCE_FIELDS to ensure field exists
      const collectionFields = DATA_SOURCE_FIELDS.CRM[collection as keyof typeof DATA_SOURCE_FIELDS.CRM];
      const fieldExists = collectionFields?.some(f => f.key === field);
      
      if (fieldExists) {
        return `ctx.${collection}.${field}`;
      }
    }
    
    // Fallback mapping using dynamic collection names from DATA_SOURCE_FIELDS
    if (dataSource?.toLowerCase() === 'crm') {
      // Try to find the field in any CRM collection using dynamic names
      for (const [collectionName, fields] of Object.entries(DATA_SOURCE_FIELDS.CRM)) {
        if (fields.some(f => f.key === field)) {
          return `ctx.${collectionName}.${field}`;
        }
      }
      
      // If not found in any collection, use smart preferred collection
      const defaultCollection = this.getPreferredCollectionForField(field);
      return `ctx.${defaultCollection}.${field}`;
    }
    
    // For direct collection specification, use dynamic names if they exist in DATA_SOURCE_FIELDS
    const availableCollections = this.getAvailableCollections();
    const collectionName = dataSource?.toLowerCase();
    
    if (collectionName && availableCollections.includes(collectionName)) {
      return `ctx.${collectionName}.${field}`;
    }
    
    // Final fallback
    return `ctx.data.${field}`;
  }

  /**
   * Get context path for a field from DATA_SOURCE_FIELDS dynamically
   */
  private static getContextPathForField(field: string): string {
    // Search through DATA_SOURCE_FIELDS to find the correct context
    for (const [collectionName, fields] of Object.entries(DATA_SOURCE_FIELDS.CRM)) {
      if (fields.some(f => f.key === field)) {
        return `ctx.${collectionName}.${field}`;
      }
    }
    
    // Use smart preferred collection instead of hardcoded fallback
    const defaultCollection = this.getPreferredCollectionForField(field);
    return `ctx.${defaultCollection}.${field}`;
  }

  /**
   * Transform message template with variables to expression
   */
  private static transformMessageTemplate(template: string): string {
    // Replace {{variable_name}} with the correct context path from DATA_SOURCE_FIELDS
    return template.replace(/\{\{(\w+)\}\}/g, (_, fieldName) => {
      const contextPath = this.getContextPathForField(fieldName);
      return `' + ${contextPath} + '`;
    });
  }

  /**
   * Map condition operators to JavaScript expressions
   */
  private static mapOperatorToExpression(operator: string): string {
    const operatorMap: Record<string, string> = {
      equals: '==',
      not_equals: '!=',
      greater_than: '>',
      less_than: '<',
      greater_equal: '>=',
      less_equal: '<=',
      contains: '.includes',
      not_contains: '!.includes',
    };

    return operatorMap[operator] || '==';
  }

  /**
   * Get action type from node label
   */
  private static getActionType(label: string): string {
    if (label.includes('SMS')) return 'sms';
    if (label.includes('email')) return 'email';
    if (label.includes('LINE')) return 'line';
    if (label.includes('webhook')) return 'webhook';
    if (label.includes('tags')) return 'tags';
    return 'generic';
  }

  /**
   * Get step type from node label
   */
  private static getStepType(label: string): string {
    if (label.includes('Wait')) return 'wait';
    if (label.includes('Log')) return 'log';
    return 'generic';
  }

  /**
   * Transform edge to peer relationship
   */
  private static transformEdgeToPeer(edge: WorkflowEdge, nodeMapping: NodeMapping): BackendWorkflowPeer {
    const peer: BackendWorkflowPeer = {
      parent_key: nodeMapping[edge.source],
      child_key: nodeMapping[edge.target],
    };

    // Add meta_output for condition branches
    if (edge.sourceHandle) {
      peer.meta_output = edge.sourceHandle;
    } else {
      peer.meta_output = 'triggered';
    }

    return peer;
  }

  /**
   * Validate transformed workflow
   */
  static validateBackendWorkflow(workflow: BackendWorkflow): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required fields
    if (!workflow.workflow_id) errors.push('Missing workflow_id');
    if (!workflow.name) errors.push('Missing workflow name');
    if (!workflow.actions || workflow.actions.length === 0) errors.push('No actions defined');

    // Check for trigger action
    const hasTrigger = workflow.actions.some(action => action.type === 'trigger');
    if (!hasTrigger) errors.push('Workflow must have at least one trigger');

    // Validate peers reference existing actions
    const actionKeys = new Set(workflow.actions.map(action => action.key));
    workflow.peers.forEach(peer => {
      if (!actionKeys.has(peer.parent_key)) {
        errors.push(`Peer references non-existent parent action: ${peer.parent_key}`);
      }
      if (!actionKeys.has(peer.child_key)) {
        errors.push(`Peer references non-existent child action: ${peer.child_key}`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}