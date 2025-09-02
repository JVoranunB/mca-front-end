import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Card, Text, Badge, InlineStack, BlockStack, Icon } from '@shopify/polaris';
import { Icons } from '../../utils/icons';
import type { NodeData } from '../../types/workflow.types';

const ActionNode = memo(({ data }: NodeProps) => {
  const nodeData = data as NodeData;
  return (
    <div style={{ minWidth: '280px' }}>
      <Handle
        id="input"
        type="target"
        position={Position.Left}
        style={{
          background: '#00848E',
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
                background: '#00848E', 
                borderRadius: '4px', 
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Icon source={Icons.Action} tone="base" />
              </div>
              <Text as="h3" variant="headingMd" fontWeight="semibold">
                Do this...
              </Text>
            </InlineStack>
            {nodeData.status === 'review' && (
              <Badge tone="attention">Review</Badge>
            )}
            {nodeData.status === 'error' && (
              <Badge tone="critical">Error</Badge>
            )}
          </InlineStack>
          
          <Text as="p" variant="bodyMd" fontWeight="medium">
            {nodeData.label}
          </Text>
          
          {nodeData.description && (
            <Text as="p" variant="bodySm" tone="subdued">
              {nodeData.description}
            </Text>
          )}
          
          {nodeData.config && Object.keys(nodeData.config).length > 0 && (
            <BlockStack gap="100">
              {Object.entries(nodeData.config).slice(0, 3).map(([key, value]) => (
                <InlineStack key={key} gap="100">
                  <Text as="span" variant="bodySm" tone="subdued">
                    {key}:
                  </Text>
                  <Text as="span" variant="bodySm">
                    {String(value).length > 30 
                      ? `${String(value).substring(0, 30)}...` 
                      : String(value)}
                  </Text>
                </InlineStack>
              ))}
              {Object.keys(nodeData.config).length > 3 && (
                <Text as="span" variant="bodySm" tone="subdued">
                  +{Object.keys(nodeData.config).length - 3} more properties
                </Text>
              )}
            </BlockStack>
          )}
        </BlockStack>
      </Card>
      
      <Handle
        id="output"
        type="source"
        position={Position.Right}
        style={{
          background: '#00848E',
          width: 16,
          height: 16,
          border: '2px solid #fff',
          right: -8,
          transform: 'translate(0, -50%)',
          top: '50%'
        }}
      />
    </div>
  );
});

ActionNode.displayName = 'ActionNode';

export default ActionNode;