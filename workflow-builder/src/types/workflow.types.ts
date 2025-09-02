export type NodeType = 'start' | 'trigger' | 'condition' | 'action' | 'step';

export type TriggerType = 'event-based' | 'schedule-based';

export interface WorkflowCondition {
  id: string;
  dataSource: 'CRM';
  collection?: string;
  field: string;
  fieldType: 'text' | 'number' | 'date' | 'select';
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'greater_equal' | 'less_equal' | 'contains' | 'not_contains' | 'date_before' | 'date_after' | 'is_empty' | 'is_not_empty';
  value: string | number;
  selectOptions?: string[];
  logicalOperator?: 'AND' | 'OR';
}

export interface StartConfig {
  label: string;
  description?: string;
  merchantId?: string;
  dataSource: 'CRM';
}

export interface TriggerConfig {
  triggerCategory: 'event-based' | 'scheduled';
  dataSource: 'CRM';
  merchantId?: string;
  
  // Event-based specific
  changeStreamEnabled?: boolean;
  collections?: string[];
  
  // Scheduled specific
  scheduleTime?: string;
  timezone?: string;
  recurrencePattern?: 'one-time' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  scheduleDate?: string; // for one-time schedules
  scheduleType?: 'one-time' | 'recurring';
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
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
  hasThenBranch?: boolean;
  hasOtherwiseBranch?: boolean;
  [key: string]: unknown; // Index signature for ReactFlow compatibility
}

export interface WorkflowNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: NodeData;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
  animated?: boolean;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  triggerType: TriggerType;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'active' | 'paused';
  lastTriggered?: string;
}

export interface WorkflowSummary {
  id: string;
  name: string;
  triggerType: TriggerType;
  status: 'draft' | 'active' | 'paused';
  nodeCount: number;
  lastModified: string;
  lastTriggered?: string;
}

export interface NodeTemplate {
  type: NodeType;
  label: string;
  description: string;
  icon: string;
  defaultConfig?: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
  category: 'triggers' | 'conditions' | 'actions' | 'utilities';
}

export interface ValidationError {
  nodeId?: string;
  edgeId?: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface WorkflowValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}