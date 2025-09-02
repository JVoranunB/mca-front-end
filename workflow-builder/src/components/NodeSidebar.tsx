import React from 'react';
import { Card, Text, BlockStack, InlineStack, Icon, Tabs, Button } from '@shopify/polaris';
import { ChevronLeftIcon, ChevronRightIcon } from '@shopify/polaris-icons';
import { Icons } from '../utils/icons';
import useWorkflowStore from '../store/workflowStore';
import { nodeTemplates } from '../data/nodeTemplates';
import type { NodeTemplate } from '../types/workflow.types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const iconMap: Record<string, any> = {
  CollectionIcon: Icons.Default,
  OrderIcon: Icons.Default,
  CustomerIcon: Icons.Default,
  ProductIcon: Icons.Default,
  CartIcon: Icons.Default,
  PaymentIcon: Icons.Default,
  MobileIcon: Icons.Default,
  EmailIcon: Icons.Default,
  GiftIcon: Icons.Default,
  HelpIcon: Icons.Question,
  PlusMinorIcon: Icons.Add,
  ExportIcon: Icons.Default,
  HashtagIcon: Icons.Tag,
  NotificationIcon: Icons.Info,
  InventoryIcon: Icons.Default,
  DiscountIcon: Icons.Default,
  ClockIcon: Icons.Timer,
  NoteIcon: Icons.Default,
  CalendarIcon: Icons.Default,
  PlayIcon: Icons.Trigger,
  CheckIcon: Icons.Check
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const categoryIcons: Record<string, any> = {
  triggers: Icons.Trigger,
  conditions: Icons.Condition,
  actions: Icons.Action,
  utilities: Icons.Step
};

const categoryColors: Record<string, string> = {
  triggers: '#5C6AC4',
  conditions: '#95A99C',
  actions: '#00848E',
  utilities: '#6C71C5'
};

interface NodeSidebarProps {
  onDragStart: (event: React.DragEvent, nodeTemplate: NodeTemplate) => void;
}

const NodeSidebar: React.FC<NodeSidebarProps> = ({ onDragStart }) => {
  const [selectedTab, setSelectedTab] = React.useState(0);
  const { leftSidebarVisible, toggleLeftSidebar } = useWorkflowStore();
  
  // Get templates (start node is auto-created, so no triggers in sidebar)
  const availableTemplates = nodeTemplates;
  
  const categories = [
    { id: 'conditions', label: 'Conditions', nodes: availableTemplates.filter((n: NodeTemplate) => n.category === 'conditions') },
    { id: 'actions', label: 'Actions', nodes: availableTemplates.filter((n: NodeTemplate) => n.category === 'actions') },
    { id: 'utilities', label: 'Utilities', nodes: availableTemplates.filter((n: NodeTemplate) => n.category === 'utilities') }
  ];
  
  const tabs = categories.map((category) => ({
    id: category.id,
    content: category.label,
    accessibilityLabel: category.label,
    panelID: `${category.id}-panel`
  }));
  
  const currentCategory = categories[selectedTab];
  
  return (
    <div style={{ 
      width: leftSidebarVisible ? '320px' : '48px', 
      height: '100%', 
      borderRight: '1px solid #e1e3e5',
      transition: 'width 0.3s ease',
      position: 'relative'
    }}>
      {leftSidebarVisible ? (
        <>
          <div style={{ 
            padding: '16px', 
            borderBottom: '1px solid #e1e3e5',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Text as="h2" variant="headingLg">
              Workflow Nodes
            </Text>
            <Button
              icon={ChevronLeftIcon}
              variant="tertiary"
              size="slim"
              onClick={toggleLeftSidebar}
              accessibilityLabel="Collapse sidebar"
            />
          </div>
      
      <Tabs tabs={tabs} selected={selectedTab} onSelect={setSelectedTab}>
        <div style={{ height: 'calc(100vh - 200px)', overflowY: 'auto', padding: '16px' }}>
          <BlockStack gap="300">
            {currentCategory.nodes.map((template: NodeTemplate) => (
              <div
                key={`${template.type}-${template.label}`}
                draggable
                onDragStart={(e) => onDragStart(e, template)}
                style={{ cursor: 'grab' }}
              >
                <Card padding="300">
                  <InlineStack gap="200" blockAlign="start">
                    <div style={{
                      background: categoryColors[template.category],
                      borderRadius: '4px',
                      padding: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Icon 
                        source={iconMap[template.icon] || categoryIcons[template.category]} 
                        tone="base"
                      />
                    </div>
                    <BlockStack gap="100">
                      <Text as="p" variant="bodyMd" fontWeight="medium">
                        {template.label}
                      </Text>
                      <Text as="p" variant="bodySm" tone="subdued">
                        {template.description}
                      </Text>
                    </BlockStack>
                  </InlineStack>
                </Card>
              </div>
            ))}
          </BlockStack>
        </div>
      </Tabs>
        </>
      ) : (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          paddingTop: '16px'
        }}>
          <Button
            icon={ChevronRightIcon}
            variant="tertiary"
            size="slim"
            onClick={toggleLeftSidebar}
            accessibilityLabel="Expand sidebar"
          />
        </div>
      )}
    </div>
  );
};

export default NodeSidebar;