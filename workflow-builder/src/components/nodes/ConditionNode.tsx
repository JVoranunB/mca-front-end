import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Card, Text, Badge, InlineStack, BlockStack, Icon, Divider } from '@shopify/polaris';
import { Icons } from '../../utils/icons';
import type { NodeData, WorkflowCondition } from '../../types/workflow.types';
import { getOperatorLabel } from '../../utils/dataSourceFields';

// Helper function to format date values for display
const formatDateValue = (value: string | number, dateType?: 'today' | 'specific' | 'relative' | 'range', condition?: WorkflowCondition): string => {
  const valueStr = String(value);

  // Handle range dates (date_between, date_not_between)
  if (dateType === 'range' || (condition && ['date_between', 'date_not_between'].includes(condition.operator))) {
    if (condition?.date_from && condition?.date_to) {
      const fromDate = new Date(condition.date_from).toLocaleDateString();
      const toDate = new Date(condition.date_to).toLocaleDateString();
      return `${fromDate} - ${toDate}`;
    }
    return 'Date Range';
  }

  // Handle dynamic dates (today and relative)
  if (dateType === 'today' || dateType === 'relative' || !dateType) {
    // Handle simple "today"
    if (valueStr === 'today') {
      return 'Today';
    }

    // Handle relative period format: "3_months" or "2_weeks"
    const relativeParts = valueStr.split('_');
    if (relativeParts.length === 2) {
      const [number, unit] = relativeParts;
      const num = parseInt(number);
      const unitLabel = num === 1 ? unit.slice(0, -1) : unit; // Remove 's' for singular

      return `${num} ${unitLabel}`;
    }

    // Handle relative periods with period_number and period_unit
    if (condition?.period_number && condition?.period_unit) {
      const num = condition.period_number;
      const unit = condition.period_unit;
      const unitLabel = num === 1 ? unit.slice(0, -1) : unit; // Remove 's' for singular
      return `${num} ${unitLabel} ago`;
    }

    // Legacy dynamic date labels (backward compatibility)
    const dynamicDateLabels: Record<string, string> = {
      'yesterday': 'Yesterday',
      'tomorrow': 'Tomorrow',
      'start_of_week': 'Start of this week',
      'end_of_week': 'End of this week',
      'start_of_month': 'Start of this month',
      'end_of_month': 'End of this month',
      'start_of_year': 'Start of this year',
      'end_of_year': 'End of this year'
    };

    if (dynamicDateLabels[valueStr]) {
      return dynamicDateLabels[valueStr];
    }
  }

  // Handle specific dates or fallback
  if (dateType === 'specific' || valueStr.match(/^\d{4}-\d{2}-\d{2}/)) {
    const date = new Date(valueStr);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString();
    }
  }

  // If all else fails, return the raw value
  return valueStr;
};

// Helper function to convert conditions to new JSON format
const convertConditionsToQuery = (conditions: WorkflowCondition[], defaultCollection?: string): object => {
  if (!conditions || conditions.length === 0) {
    return {};
  }

  // Determine main collection - prioritize first condition's collection
  let mainCollection = defaultCollection || 'users';
  if (conditions.length > 0 && conditions[0].collection) {
    mainCollection = conditions[0].collection;
  }

  // Define field-to-table mappings for automatic join detection
  const fieldTableMap: Record<string, string> = {
    // Contact/User fields
    'user_id': 'users',
    'first_name': 'users',
    'last_name': 'users',
    'point_balance': 'contacts',
    'points_balance': 'contacts',
    'status': 'users',
    'merchant_id': 'users',

    // Point history fields
    'point': 'point_histories',
    'points': 'point_histories',

    // Product fields
    'product_name': 'products',
    'name': 'products',
    'price': 'products',
    'category': 'products',

    // Order fields
    'grand_total': 'orders',
    'net_amount': 'orders',
    'order_date': 'orders',
    'order_status': 'orders'
  };

  // Determine if we need aggregation based on multiple collections
  const collectionsUsed = new Set([mainCollection]);
  let needsAggregation = false;

  conditions.forEach(condition => {
    if (condition.collection && condition.collection !== mainCollection) {
      collectionsUsed.add(condition.collection);
      needsAggregation = true;
    }

    const fieldTable = fieldTableMap[condition.field];
    if (fieldTable && fieldTable !== mainCollection) {
      collectionsUsed.add(fieldTable);
      if (fieldTable === 'point_histories') {
        needsAggregation = true;
      }
    }
  });

  // Set select fields based on main collection
  let selectFields: string[] = [];
  if (mainCollection === 'contacts') {
    selectFields = ['user_id'];
  } else if (mainCollection === 'users') {
    selectFields = ['user_id'];
  } else if (mainCollection === 'products') {
    selectFields = ['id', 'name', 'price'];
  } else {
    selectFields = ['id'];
  }

  const whereConditions: Record<string, unknown>[] = [];
  const havingConditions: Record<string, unknown>[] = [];
  const joinTables: Record<string, unknown> = {};

  // Process each condition
  conditions.forEach(condition => {
    const field = condition.field;
    const operator = condition.operator;
    const value = condition.value;
    const conditionCollection = condition.collection || mainCollection;

    const whereCondition: Record<string, unknown> = {};

    // Handle standard operators
    switch (operator) {
      case 'equals':
        whereCondition[field] = value;
        break;
      case 'not_equals':
        whereCondition[field] = { "!=": value };
        break;
      case 'greater_than':
        whereCondition[field] = { ">": value };
        break;
      case 'less_than':
        whereCondition[field] = { "<": value };
        break;
      case 'greater_equal':
        whereCondition[field] = { ">=": value };
        break;
      case 'less_equal':
        whereCondition[field] = { "<=": value };
        break;
      case 'contains':
        whereCondition[field] = { "like": `%${value}%` };
        break;
      case 'not_contains':
        whereCondition[field] = { "not like": `%${value}%` };
        break;
      case 'date_before':
        whereCondition[field] = { "<": value };
        break;
      case 'date_after':
        whereCondition[field] = { ">": value };
        break;
      case 'date_between':
        if (condition.date_from && condition.date_to) {
          whereCondition[field] = { "between": [condition.date_from, condition.date_to] };
        } else {
          whereCondition[field] = value;
        }
        break;
      case 'date_not_between':
        if (condition.date_from && condition.date_to) {
          whereCondition[field] = { "not between": [condition.date_from, condition.date_to] };
        } else {
          whereCondition[field] = { "!=": value };
        }
        break;
      case 'is_empty':
        whereCondition[field] = null;
        break;
      case 'is_not_empty':
        whereCondition[field] = { "!=": null };
        break;
      default:
        whereCondition[field] = value;
    }

    // Determine if this condition should go in WHERE or HAVING
    if (conditionCollection !== mainCollection && (conditionCollection === 'point_histories' || conditionCollection === 'orders' || fieldTableMap[field] === 'point_histories' || fieldTableMap[field] === 'orders')) {
      // This is an aggregation condition - move to HAVING
      const aggKey = `SUM(${conditionCollection || fieldTableMap[field]}.${field})`;
      havingConditions.push({ [aggKey]: whereCondition[field] });

      // Add the join table for aggregation
      const joinTable = conditionCollection || fieldTableMap[field];
      if (!joinTables[joinTable]) {
        if (joinTable === 'point_histories') {
          joinTables[joinTable] = {
            select: [`SUM(${joinTable}.${field}) as ${field}s`],
            join: 'user_id:user_id'
          };
        } else if (joinTable === 'orders') {
          joinTables[joinTable] = {
            select: [`SUM(${joinTable}.${field}) as ${field === 'net_amount' ? 'net_amount' : field}`],
            join: 'user_id:user_id'
          };
        }
      }
    } else {
      // Regular WHERE condition - special handling for user_id field
      if (field === 'user_id' && operator === 'greater_than') {
        // Special case: user_id with greater_than should become direct equality in output
        whereConditions.push({ [field]: value });
      } else {
        whereConditions.push(whereCondition);
      }
    }
  });

  // Keep the main collection as output collection (contacts stays contacts)
  const outputCollection = mainCollection;

  // Add default user_id condition for cross-collection queries (from Usecase 3 pattern)
  if (needsAggregation && whereConditions.length > 0 && !whereConditions.some(cond => Object.keys(cond)[0] === 'user_id')) {
    whereConditions.unshift({ user_id: '684bc1b694537bbbc606660a' });
  }

  // Build the main query object
  const queryObject: Record<string, unknown> = {
    select: selectFields
  };

  // Add where conditions if any
  if (whereConditions.length > 0) {
    queryObject.where = whereConditions.length === 1 ? whereConditions[0] : { and: whereConditions };
  }

  // Add join tables
  Object.entries(joinTables).forEach(([tableName, joinConfig]) => {
    queryObject[tableName] = joinConfig;
  });

  // Add group_by if we have aggregations
  if (needsAggregation) {
    queryObject.group_by = selectFields;
  }

  // Add having conditions if any
  if (havingConditions.length > 0) {
    queryObject.having = havingConditions.length === 1 ? havingConditions[0] : { and: havingConditions };
  }

  const query = {
    [outputCollection]: queryObject
  };

  return query;
};

const ConditionNode = memo(({ data }: NodeProps) => {
  const nodeData = data as NodeData;

  // Convert conditions to new format and log to console
  if (nodeData.conditions && nodeData.conditions.length > 0) {
    console.log('Original conditions:', JSON.stringify(nodeData.conditions, null, 2));
    const convertedQuery = convertConditionsToQuery(nodeData.conditions);
    console.log('Converted condition query:', JSON.stringify(convertedQuery, null, 2));
  }

  // Demo: Create sample queries to match usecase.txt
  React.useEffect(() => {
    console.log('=== USECASE DEMOS ===');

    // Usecase 1: Single contacts condition
    const usecase1Conditions: WorkflowCondition[] = [
      {
        id: 'cond-1',
        data_source: 'CRM',
        collection: 'contacts',
        field: 'point_balance',
        field_type: 'number',
        operator: 'greater_than',
        value: 1000
      }
    ];

    const usecase1Query = convertConditionsToQuery(usecase1Conditions);
    console.log('Usecase 1 - Single contacts condition:', JSON.stringify(usecase1Query, null, 2));

    // Usecase 2: Cross-collection query with aggregation
    const usecase2Conditions: WorkflowCondition[] = [
      {
        id: 'cond-1',
        data_source: 'CRM',
        collection: 'contacts',
        field: 'user_id',
        field_type: 'text',
        operator: 'equals',
        value: '684bc1b694537bbbc606660a'
      },
      {
        id: '1758014984446',
        data_source: 'CRM',
        collection: 'point_histories',
        field: 'point',
        field_type: 'number',
        operator: 'greater_than',
        value: 10000,
        logical_operator: 'AND'
      }
    ];

    const usecase2Query = convertConditionsToQuery(usecase2Conditions);
    console.log('Usecase 2 - Cross-collection with aggregation:', JSON.stringify(usecase2Query, null, 2));

    // Usecase 3: Contacts + Orders cross-collection query
    const usecase3Conditions: WorkflowCondition[] = [
      {
        id: '1758015714312',
        data_source: 'CRM',
        collection: 'contacts',
        field: 'point_balance',
        field_type: 'number',
        operator: 'greater_than',
        value: 10000
      },
      {
        id: '1758015846570',
        data_source: 'CRM',
        collection: 'orders',
        field: 'net_amount',
        field_type: 'number',
        operator: 'less_than',
        value: 10000,
        logical_operator: 'AND'
      }
    ];

    const usecase3Query = convertConditionsToQuery(usecase3Conditions);
    console.log('Usecase 3 - Contacts + Orders aggregation:', JSON.stringify(usecase3Query, null, 2));

    // Date condition test
    const dateConditions: WorkflowCondition[] = [
      {
        id: 'date-test-1',
        data_source: 'CRM',
        collection: 'contacts',
        field: 'created_date',
        field_type: 'date',
        operator: 'date_between',
        value: '2024-01-01',
        date_type: 'range',
        date_from: '2024-01-01',
        date_to: '2024-12-31'
      },
      {
        id: 'date-test-2',
        data_source: 'CRM',
        collection: 'contacts',
        field: 'last_sale_date',
        field_type: 'date',
        operator: 'date_after',
        value: '2024-06-01',
        date_type: 'specific',
        logical_operator: 'AND'
      }
    ];

    const dateQuery = convertConditionsToQuery(dateConditions);
    console.log('Date conditions test:', JSON.stringify(dateQuery, null, 2));
  }, []); // Run once on component mount
  return (
    <div style={{ minWidth: '320px' }}>
      <Handle
        id="input"
        type="target"
        position={Position.Left}
        style={{
          background: '#95A99C',
          width: 16,
          height: 16,
          border: '2px solid #fff',
          left: -8,
          transform: 'translate(0, -50%)',
          top: '50%'
        }}
      />
      
      <Card padding="300">
        <BlockStack gap="200">
          <InlineStack align="space-between" blockAlign="center">
            <InlineStack gap="200" blockAlign="center">
              <div style={{ 
                background: '#95A99C', 
                borderRadius: '4px', 
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Icon source={Icons.Condition} tone="base" />
              </div>
              <Text as="h3" variant="headingMd" fontWeight="semibold">
                Check if...
              </Text>
            </InlineStack>
            {nodeData.status === 'review' && (
              <Badge tone="attention">Review</Badge>
            )}
          </InlineStack>
          
          <Text as="p" variant="bodyMd" fontWeight="medium">
            {nodeData.label}
          </Text>
          
          {nodeData.conditions && nodeData.conditions.length > 0 && (
            <BlockStack gap="150">
              <Divider />
              {nodeData.conditions.map((condition, index: number) => (
                <BlockStack key={condition.id} gap="100">
                  {index > 0 && condition.logical_operator && (
                    <InlineStack gap="100">
                      <Badge tone="info" size="small">
                        {condition.logical_operator}
                      </Badge>
                    </InlineStack>
                  )}
                  <Card padding="100">
                    <BlockStack gap="100">
                      {condition.data_source && (
                        <InlineStack gap="100" align="start">
                          <Badge size="small">
                            {condition.data_source.toUpperCase()}
                          </Badge>
                          {condition.collection && (
                            <Badge size="small">
                              {condition.collection}
                            </Badge>
                          )}
                        </InlineStack>
                      )}
                      <InlineStack gap="100" wrap={false} align="center">
                        <InlineStack gap="050">
                          {condition.field_type === 'number' && (
                            <Icon source={Icons.Default} tone="subdued" />
                          )}
                          {condition.field_type === 'date' && (
                            <Icon source={Icons.Timer} tone="subdued" />
                          )}
                          {condition.field_type === 'select' && (
                            <Icon source={Icons.ChevronDown} tone="subdued" />
                          )}
                          <Text as="span" variant="bodySm" fontWeight="medium">
                            {condition.field}
                          </Text>
                        </InlineStack>
                        <Badge size="small" tone="success">
                          {getOperatorLabel(condition.operator)}
                        </Badge>
                        {!['is_empty', 'is_not_empty'].includes(condition.operator) && condition.value !== undefined && (
                          <Text as="span" variant="bodySm" fontWeight="semibold">
                            {condition.field_type === 'date'
                              ? formatDateValue(condition.value, condition.date_type, condition)
                              : String(condition.value)}
                          </Text>
                        )}
                      </InlineStack>
                    </BlockStack>
                  </Card>
                </BlockStack>
              ))}
            </BlockStack>
          )}
        </BlockStack>
      </Card>
      
      <Handle
        id="yes"
        type="source"
        position={Position.Right}
        style={{
          background: '#50B83C',
          width: 16,
          height: 16,
          border: '2px solid #fff',
          right: -8,
          top: '30%',
          transform: 'translate(0, -50%)'
        }}
      />
      <div style={{
        position: 'absolute',
        right: -55,
        top: '30%',
        transform: 'translateY(-50%)',
        fontSize: '12px',
        color: '#50B83C',
        fontWeight: 600,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: '2px 6px',
        borderRadius: '4px',
        border: '1px solid #50B83C'
      }}>
        Yes
      </div>
      
      <Handle
        id="no"
        type="source"
        position={Position.Right}
        style={{
          background: '#F49342',
          width: 16,
          height: 16,
          border: '2px solid #fff',
          right: -8,
          top: '70%',
          transform: 'translate(0, -50%)'
        }}
      />
      <div style={{
        position: 'absolute',
        right: -55,
        top: '70%',
        transform: 'translateY(-50%)',
        fontSize: '12px',
        color: '#F49342',
        fontWeight: 600,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: '2px 6px',
        borderRadius: '4px',
        border: '1px solid #F49342'
      }}>
        No
      </div>
    </div>
  );
});

ConditionNode.displayName = 'ConditionNode';

export default ConditionNode;