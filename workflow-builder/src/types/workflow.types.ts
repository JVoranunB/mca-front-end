export type NodeType = 'start' | 'trigger' | 'condition' | 'action' | 'step';

export type TriggerType = 'event-based' | 'schedule-based';

export interface WorkflowCondition {
  id: string;
  data_source: 'CRM';
  collection?: string;
  field: string;
  field_type: 'text' | 'number' | 'date' | 'select';
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'greater_equal' | 'less_equal' | 'contains' | 'not_contains' | 'date_before' | 'date_after' | 'date_between' | 'date_not_between' | 'is_empty' | 'is_not_empty';
  value: string | number;
  select_options?: string[];
  logical_operator?: 'AND' | 'OR';
  date_type?: 'today' | 'specific' | 'relative' | 'range';
  period_number?: number;
  period_unit?: 'days' | 'weeks' | 'months' | 'years';
  date_from?: string;
  date_to?: string;

  // Enhanced query support
  group_by?: string[];
  having?: Record<string, unknown>;
  joins?: {
    [table: string]: {
      select: string[];
      join: string;
    };
  };
  aggregations?: {
    field: string;
    function: 'SUM' | 'COUNT' | 'AVG' | 'MIN' | 'MAX';
    alias?: string;
  }[];
}

export interface StartConfig {
  label: string;
  description?: string;
  merchant_id?: string;
  data_source: 'CRM';
}

export interface TriggerConfig {
  trigger_category: 'event-based' | 'scheduled';
  data_source: 'CRM';
  merchant_id?: string;
  
  // Event-based specific
  change_stream_enabled?: boolean;
  collections?: string[];
  
  // Scheduled specific
  schedule_time?: string;
  timezone?: string;
  recurrence_pattern?: 'one-time' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  schedule_date?: string; // for one-time schedules
  schedule_type?: 'one-time' | 'recurring';
  day_of_week?: number; // 0-6 for weekly
  day_of_month?: number; // 1-31 for monthly
}

export interface NodeData {
  label: string;
  type: NodeType;
  description?: string;
  icon?: string;
  status?: 'active' | 'review' | 'error' | 'disabled';
  config?: TriggerConfig | {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
  conditions?: WorkflowCondition[];
  hasYesBranch?: boolean;
  hasNoBranch?: boolean;
  [key: string]: unknown; // Index signature for ReactFlow compatibility
}

export interface WorkflowNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: NodeData;
}

export interface WorkflowPeer {
  id: string;
  source: string;
  target: string;
  source_handle?: string;
  target_handle?: string;
  sourceHandle?: string; // React Flow compatibility
  targetHandle?: string; // React Flow compatibility
  label?: string;
  animated?: boolean;
}

// Keep WorkflowEdge as alias for backward compatibility
export type WorkflowEdge = WorkflowPeer;

// Backward compatibility for nodes → actions transition
export interface WorkflowWithNodes extends Omit<Workflow, 'actions'> {
  nodes: WorkflowNode[];
}

// Backward compatibility for camelCase → snake_case transition
export interface WorkflowCamelCase {
  id: string;
  name: string;
  description?: string;
  triggerType: TriggerType;
  actions: WorkflowNode[];
  peers: WorkflowPeer[];
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'active' | 'paused';
  lastTriggered?: string;
}

export interface WorkflowSummaryCamelCase {
  id: string;
  name: string;
  triggerType: TriggerType;
  status: 'draft' | 'active' | 'paused';
  actionCount: number;
  lastModified: string;
  lastTriggered?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  trigger_type: TriggerType;
  actions: WorkflowNode[];
  peers: WorkflowPeer[];
  created_at: string;
  updated_at: string;
  status: 'draft' | 'active' | 'paused';
  last_triggered?: string;
}

export interface WorkflowSummary {
  id: string;
  name: string;
  trigger_type: TriggerType;
  status: 'draft' | 'active' | 'paused';
  action_count: number;
  last_modified: string;
  last_triggered?: string;
}

export interface NodeTemplate {
  type: NodeType;
  label: string;
  description: string;
  icon: string;
  default_config?: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
  category: 'triggers' | 'conditions' | 'actions' | 'utilities';
}

export interface ValidationError {
  node_id?: string;
  edge_id?: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface WorkflowValidationResult {
  is_valid: boolean;
  errors: ValidationError[];
}