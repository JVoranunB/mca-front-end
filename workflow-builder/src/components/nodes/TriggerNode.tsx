import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Card, Text, Badge, InlineStack, BlockStack, Icon } from '@shopify/polaris';
import { Icons } from '../../utils/icons';
import type { NodeData, TriggerConfig } from '../../types/workflow.types';

const TriggerNode = memo(({ data }: NodeProps) => {
  const nodeData = data as NodeData;
  const triggerConfig = nodeData.config as TriggerConfig;
  const isEventBased = triggerConfig?.triggerCategory === 'event-based';
  const isScheduled = triggerConfig?.triggerCategory === 'scheduled';
  
  return (
    <div style={{ minWidth: '280px' }}>
      <Card padding="300">
        <BlockStack gap="200">
          <InlineStack align="space-between" blockAlign="center">
            <InlineStack gap="200" blockAlign="center">
              <div style={{ 
                background: '#5C6AC4', 
                borderRadius: '4px', 
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Icon 
                  source={isScheduled ? Icons.Timer : Icons.Trigger} 
                  tone="base" 
                />
              </div>
              <Text as="h3" variant="headingMd" fontWeight="semibold">
                {isEventBased ? 'When data changes...' : 
                 isScheduled ? 'On schedule...' : 
                 'Start when...'}
              </Text>
            </InlineStack>
            <BlockStack gap="100">
              {isEventBased && (
                <Badge tone="info">Event-based</Badge>
              )}
              {isScheduled && (
                <Badge tone="success">Scheduled</Badge>
              )}
              {nodeData.status === 'review' && (
                <Badge tone="attention">Review</Badge>
              )}
            </BlockStack>
          </InlineStack>
          
          <Text as="p" variant="bodyMd" fontWeight="medium">
            {nodeData.label}
          </Text>
          
          {nodeData.description && (
            <Text as="p" variant="bodySm" tone="subdued">
              {nodeData.description}
            </Text>
          )}
          
          {triggerConfig && (
            <BlockStack gap="100">
              {triggerConfig.dataSource && (
                <InlineStack gap="100">
                  <Text as="span" variant="bodySm" tone="subdued">
                    Data Source:
                  </Text>
                  <Badge size="small">
                    {triggerConfig.dataSource.toUpperCase()}
                  </Badge>
                </InlineStack>
              )}
              
              {isEventBased && triggerConfig.collections && triggerConfig.collections.length > 0 && (
                <InlineStack gap="100" wrap>
                  <Text as="span" variant="bodySm" tone="subdued">
                    Monitoring:
                  </Text>
                  {triggerConfig.collections.map(collection => (
                    <Badge key={collection} size="small" tone="success">
                      {collection}
                    </Badge>
                  ))}
                </InlineStack>
              )}
              
              {isScheduled && triggerConfig.recurrencePattern && (
                <InlineStack gap="100">
                  <Text as="span" variant="bodySm" tone="subdued">
                    Schedule:
                  </Text>
                  <Text as="span" variant="bodySm" fontWeight="medium">
                    {triggerConfig.recurrencePattern === 'daily' ? 'Daily' :
                     triggerConfig.recurrencePattern === 'weekly' ? 'Weekly' :
                     triggerConfig.recurrencePattern === 'monthly' ? 'Monthly' :
                     triggerConfig.recurrencePattern === 'yearly' ? 'Yearly' :
                     'One-time'} at {triggerConfig.scheduleTime || '09:00'}
                  </Text>
                </InlineStack>
              )}
              
              {triggerConfig.timezone && isScheduled && (
                <InlineStack gap="100">
                  <Text as="span" variant="bodySm" tone="subdued">
                    Timezone:
                  </Text>
                  <Text as="span" variant="bodySm">
                    {triggerConfig.timezone}
                  </Text>
                </InlineStack>
              )}
              
              {triggerConfig.merchantId && (
                <InlineStack gap="100">
                  <Text as="span" variant="bodySm" tone="subdued">
                    Merchant:
                  </Text>
                  <Badge size="small" tone="warning">
                    {triggerConfig.merchantId}
                  </Badge>
                </InlineStack>
              )}
            </BlockStack>
          )}
        </BlockStack>
      </Card>
      
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: '#5C6AC4',
          width: 10,
          height: 10,
          border: '2px solid #fff',
          right: -5
        }}
      />
    </div>
  );
});

TriggerNode.displayName = 'TriggerNode';

export default TriggerNode;