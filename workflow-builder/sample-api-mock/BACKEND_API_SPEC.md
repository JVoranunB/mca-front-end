# Workflow Builder - Backend API Specification

## Overview

This document defines the backend API specification for the Workflow Builder application. The API is designed to separate frontend display information from core workflow logic, making it easier for the backend to process and store workflow data efficiently.

## Core Principles

1. **Separation of Concerns**: Frontend information (labels, descriptions, UI state) is stored separately from core workflow logic
2. **Clean Data Structure**: Backend receives structured data without UI-specific properties
3. **Backward Compatibility**: Support both old and new data formats during migration
4. **Type Safety**: Strong typing for all data structures

## Data Structure Design

### Node Data Structure

#### Current Frontend Structure (Legacy)
```json
{
  "id": "node-1",
  "type": "condition",
  "position": { "x": 100, "y": 200 },
  "data": {
    "label": "Check Customer Status",
    "type": "condition", 
    "description": "Validates customer eligibility",
    "status": "active",
    "conditions": [...],
    "config": {...}
  }
}
```

#### Proposed Backend-Friendly Structure
```json
{
  "id": "node-1",
  "type": "condition",
  "position": { "x": 100, "y": 200 },
  "data": {
    "type": "condition",
    "info": {
      "label": "Check Customer Status",
      "description": "Validates customer eligibility", 
      "status": "active",
      "icon": "condition-icon"
    },
    "conditions": [...],
    "config": {...}
  }
}
```

## API Endpoints

### 1. Workflow Management

#### GET /api/workflows
**Description**: Retrieve all workflows for a merchant

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "workflow-1",
      "name": "Customer Onboarding",
      "description": "Automated customer onboarding process",
      "triggerType": "event-based",
      "status": "active",
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-16T11:30:00Z",
      "nodeCount": 5,
      "lastTriggered": "2024-01-16T09:45:00Z"
    }
  ]
}
```

#### GET /api/workflows/{id}
**Description**: Retrieve a specific workflow with full node/edge data

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "workflow-1",
    "name": "Customer Onboarding",
    "description": "Automated customer onboarding process",
    "triggerType": "event-based",
    "status": "active",
    "nodes": [...],
    "edges": [...],
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-16T11:30:00Z"
  }
}
```

#### POST /api/workflows
**Description**: Create a new workflow

**Request Body**:
```json
{
  "name": "New Workflow",
  "description": "Workflow description",
  "triggerType": "event-based",
  "nodes": [...],
  "edges": [...]
}
```

#### PUT /api/workflows/{id}
**Description**: Update an existing workflow

**Request Body**: Same as POST

### 2. Node Types and Templates

#### GET /api/node-templates
**Description**: Get available node templates for the workflow builder

**Response**:
```json
{
  "success": true,
  "data": {
    "triggers": [
      {
        "type": "start",
        "info": {
          "label": "Workflow Start",
          "description": "Entry point for workflow execution",
          "icon": "play"
        },
        "template": {
          "config": {
            "dataSource": "CRM",
            "triggerCategory": "event"
          }
        }
      }
    ],
    "conditions": [...],
    "actions": [...],
    "steps": [...]
  }
}
```

## Node Type Specifications

### 1. Start Node
```typescript
interface StartNode {
  type: "start";
  info: {
    label: string;
    description?: string;
    status: "active" | "review" | "error" | "disabled";
  };
  config: {
    label: string;
    description?: string;
    merchantId?: string;
    dataSource: "CRM";
    triggerCategory?: "event" | "scheduled";
    eventType?: string;
    changeStreamEnabled?: boolean;
    collections?: string[];
  };
}
```

### 2. Condition Node
```typescript
interface ConditionNode {
  type: "condition";
  info: {
    label: string;
    description?: string;
    status: "active" | "review" | "error" | "disabled";
  };
  conditions: WorkflowCondition[];
  hasYesBranch?: boolean;
  hasNoBranch?: boolean;
}

interface WorkflowCondition {
  id: string;
  dataSource: "CRM";
  collection?: string;
  field: string;
  fieldType: "text" | "number" | "date" | "select";
  operator: string;
  value: string | number;
  logicalOperator?: "AND" | "OR";
}
```

### 3. Action Node
```typescript
interface ActionNode {
  type: "action";
  info: {
    label: string;
    description?: string;
    status: "active" | "review" | "error" | "disabled";
  };
  config: {
    actionType: "sms" | "email" | "line" | "webhook" | "tags";
    // Action-specific configuration
    message?: string;
    subject?: string;
    url?: string;
    headers?: Record<string, string>;
    tags?: string[];
  };
}
```

### 4. Step Node
```typescript
interface StepNode {
  type: "step";
  info: {
    label: string;
    description?: string;
    status: "active" | "review" | "error" | "disabled";
  };
  config: {
    stepType: "wait" | "log" | "transform";
    duration?: number;
    unit?: "seconds" | "minutes" | "hours" | "days";
    message?: string;
  };
}
```

## Edge Specifications

### Edge Structure
```typescript
interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: "output" | "yes" | "no";
  targetHandle?: "input";
  animated?: boolean;
  label?: string;
}
```

### Handle Types
- **output**: Standard output from most nodes
- **yes**: Positive condition outcome (condition nodes)
- **no**: Negative condition outcome (condition nodes) - **OPTIONAL**
- **input**: Standard input to all nodes

## Validation Rules

### Workflow Level
1. Must have exactly one start node
2. All nodes except start must have incoming connections
3. Condition nodes must have at least a "yes" branch connected
4. No circular dependencies

### Node Level
1. **Start Node**: Must have valid configuration with dataSource
2. **Condition Node**: Must have at least one condition defined
3. **Action Node**: Must have valid action configuration
4. **Step Node**: Must have valid step configuration

### Edge Level
1. Source handles must be valid for the source node type
2. Target handles must be "input" for all node types
3. No duplicate edges between same source/target with same handles

## Migration Strategy

### Phase 1: Backward Compatibility
- Support both old and new data structures
- Use helper functions to access node data
- Gradual migration of existing workflows

### Phase 2: New Structure Implementation
- Update all new workflows to use info object
- Provide migration tools for existing workflows
- Maintain API compatibility

### Phase 3: Legacy Deprecation
- Remove backward compatibility after full migration
- Clean up codebase to use only new structure
- Update documentation

## Error Handling

### Validation Errors
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "nodeId": "node-1",
      "field": "conditions",
      "message": "At least one condition is required",
      "severity": "error"
    }
  ]
}
```

### API Errors
```json
{
  "success": false,
  "error": "Workflow not found",
  "code": "WORKFLOW_NOT_FOUND",
  "message": "The requested workflow does not exist"
}
```

## Security Considerations

1. **Authentication**: All endpoints require valid merchant authentication
2. **Authorization**: Users can only access workflows for their merchant
3. **Input Validation**: All input data must be validated and sanitized
4. **Rate Limiting**: Implement rate limiting for API endpoints

## Performance Considerations

1. **Pagination**: Large workflow lists should be paginated
2. **Caching**: Frequently accessed workflows should be cached
3. **Lazy Loading**: Load node details only when needed
4. **Compression**: Use gzip compression for large payloads

## Future Enhancements

1. **Workflow Versioning**: Track workflow changes over time
2. **Execution History**: Store workflow execution logs
3. **Template Sharing**: Allow users to share workflow templates
4. **Real-time Updates**: WebSocket support for real-time collaboration
5. **Workflow Analytics**: Performance metrics and analytics

---

This specification provides a foundation for implementing a clean, scalable backend API that separates concerns and maintains flexibility for future enhancements.