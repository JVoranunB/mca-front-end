import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Card, Text, Badge, InlineStack, BlockStack, Icon, Divider } from '@shopify/polaris';
import { Icons } from '../../utils/icons';
import type { NodeData } from '../../types/workflow.types';
import { getOperatorLabel } from '../../utils/dataSourceFields';

const ConditionNode = memo(({ data }: NodeProps) => {
  const nodeData = data as NodeData;
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
                  {index > 0 && condition.logicalOperator && (
                    <InlineStack gap="100">
                      <Badge tone="info" size="small">
                        {condition.logicalOperator}
                      </Badge>
                    </InlineStack>
                  )}
                  <Card padding="100">
                    <BlockStack gap="100">
                      {condition.dataSource && (
                        <InlineStack gap="100" align="start">
                          <Badge size="small">
                            {condition.dataSource.toUpperCase()}
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
                          {condition.fieldType === 'number' && (
                            <Icon source={Icons.Default} tone="subdued" />
                          )}
                          {condition.fieldType === 'date' && (
                            <Icon source={Icons.Timer} tone="subdued" />
                          )}
                          {condition.fieldType === 'select' && (
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
                            {condition.fieldType === 'date' 
                              ? new Date(String(condition.value)).toLocaleDateString()
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
        id="then"
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
        Then
      </div>
      
      <Handle
        id="otherwise"
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
        right: -85,
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
        Otherwise
      </div>
    </div>
  );
});

ConditionNode.displayName = 'ConditionNode';

export default ConditionNode;