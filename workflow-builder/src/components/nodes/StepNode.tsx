import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Card, Text, InlineStack, BlockStack, Icon } from '@shopify/polaris';
import { Icons } from '../../utils/icons';
import type { NodeData } from '../../types/workflow.types';

const StepNode = memo(({ data }: NodeProps) => {
  const nodeData = data as NodeData;
  return (
    <div style={{ minWidth: '200px' }}>
      <Handle
        id="input"
        type="target"
        position={Position.Left}
        style={{
          background: '#6C71C5',
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
          <InlineStack gap="200" blockAlign="center">
            <div style={{ 
              background: '#6C71C5', 
              borderRadius: '4px', 
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Icon source={Icons.Step} tone="base" />
            </div>
            <Text as="h3" variant="headingMd" fontWeight="semibold">
              Step
            </Text>
          </InlineStack>
          
          <Text as="p" variant="bodyMd" fontWeight="medium">
            {nodeData.label}
          </Text>
          
          {nodeData.description && (
            <Text as="p" variant="bodySm" tone="subdued">
              {nodeData.description}
            </Text>
          )}
        </BlockStack>
      </Card>
      
      <Handle
        id="output"
        type="source"
        position={Position.Right}
        style={{
          background: '#6C71C5',
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

StepNode.displayName = 'StepNode';

export default StepNode;