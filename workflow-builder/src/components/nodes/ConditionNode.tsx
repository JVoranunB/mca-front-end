import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Card, Text, Badge, InlineStack, BlockStack, Icon, Divider } from '@shopify/polaris';
import { Icons } from '../../utils/icons';
import type { NodeData, WorkflowCondition } from '../../types/workflow.types';
import { getOperatorLabel } from '../../utils/dataSourceFields';
import { ConditionConverter } from '../../utils/conditionConverter';

// Helper function to format date values for display
const formatDateValue = (value: string | number, dateType?: 'today' | 'specific' | 'relative' | 'range' | 'anniversary', condition?: WorkflowCondition): string => {
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

  // Handle anniversary dates (dynamic)
  if (dateType === 'anniversary' && valueStr === 'anniversary') {
    return 'Anniversary (today\'s date)';
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


const ConditionNode = memo(({ data }: NodeProps) => {
  const nodeData = data as NodeData;

  // Convert conditions to new format and log to console
  if (nodeData.conditions && nodeData.conditions.length > 0) {
    console.log('Original conditions:', JSON.stringify(nodeData.conditions, null, 2));
    const convertedQuery = ConditionConverter.convertConditionsToQuery(nodeData.conditions);
    console.log('Converted condition query (New Rule Engine):', JSON.stringify(convertedQuery, null, 2));
  }

  // Demo: Run use case demonstrations once on component mount
  React.useEffect(() => {
    ConditionConverter.demonstrateUseCases();
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