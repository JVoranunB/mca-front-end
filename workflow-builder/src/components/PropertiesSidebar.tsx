import React, { useState, useEffect } from 'react';
import {
  Card,
  Text,
  TextField,
  Select,
  Button,
  BlockStack,
  InlineStack,
  Badge,
  FormLayout,
  Divider,
  EmptyState
} from '@shopify/polaris';
import { ChevronLeftIcon, ChevronRightIcon } from '@shopify/polaris-icons';
import { Icons } from '../utils/icons';
import useWorkflowStore from '../store/workflowStore';
import type { WorkflowCondition, StartConfig, TriggerConfig } from '../types/workflow.types';
import { getDataSourcesForConditions, getCollectionsForDataSource, getFieldsForCollection, type DataSourceField } from '../utils/dataSourceFields';

const PropertiesSidebar: React.FC = () => {
  const { selectedNode, updateNode, deleteNode, rightSidebarVisible, toggleRightSidebar, currentWorkflow } = useWorkflowStore();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [localConfig, setLocalConfig] = useState<Record<string, any>>({});
  const [conditions, setConditions] = useState<WorkflowCondition[]>([]);
  
  useEffect(() => {
    if (selectedNode) {
      setLocalConfig(selectedNode.data.config || {});
      setConditions(selectedNode.data.conditions || []);
    } else {
      // Clear local config when no node is selected
      setLocalConfig({});
      setConditions([]);
    }
  }, [selectedNode, currentWorkflow?.id]);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleConfigChange = (key: string, value: any) => {
    const newConfig = { ...localConfig, [key]: value };
    setLocalConfig(newConfig);
    if (selectedNode) {
      updateNode(selectedNode.id, { config: newConfig });
    }
  };
  
  const handleLabelChange = (value: string) => {
    if (selectedNode) {
      updateNode(selectedNode.id, { label: value });
    }
  };
  
  const handleDescriptionChange = (value: string) => {
    if (selectedNode) {
      updateNode(selectedNode.id, { description: value });
    }
  };
  
  const addCondition = () => {
    const newCondition: WorkflowCondition = {
      id: Date.now().toString(),
      dataSource: 'CRM',
      field: '',
      fieldType: 'text',
      operator: 'equals',
      value: '',
      logicalOperator: conditions.length > 0 ? 'AND' : undefined
    };
    const newConditions = [...conditions, newCondition];
    setConditions(newConditions);
    if (selectedNode) {
      updateNode(selectedNode.id, { conditions: newConditions });
    }
  };
  
  const updateCondition = (id: string, updates: Partial<WorkflowCondition>) => {
    const newConditions = conditions.map(c =>
      c.id === id ? { ...c, ...updates } : c
    );
    setConditions(newConditions);
    if (selectedNode) {
      updateNode(selectedNode.id, { conditions: newConditions });
    }
  };
  
  const removeCondition = (id: string) => {
    const newConditions = conditions.filter(c => c.id !== id);
    setConditions(newConditions);
    if (selectedNode) {
      updateNode(selectedNode.id, { conditions: newConditions });
    }
  };
  
  if (!selectedNode) {
    return (
      <div style={{ 
        width: rightSidebarVisible ? '360px' : '48px', 
        height: '100%', 
        borderLeft: '1px solid #e1e3e5',
        transition: 'width 0.3s ease',
        position: 'relative'
      }}>
        {rightSidebarVisible ? (
          <div style={{ padding: '16px' }}>
            <BlockStack gap="400">
              <InlineStack align="space-between" blockAlign="center">
                <Text as="h2" variant="headingLg">
                  Properties
                </Text>
                <Button
                  icon={ChevronRightIcon}
                  variant="tertiary"
                  size="slim"
                  onClick={toggleRightSidebar}
                  accessibilityLabel="Collapse sidebar"
                />
              </InlineStack>
              <Card>
                <EmptyState
                  heading="No node selected"
                  image="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cpath fill='%23DDD' d='M30 58C45.464 58 58 45.464 58 30S45.464 2 30 2 2 14.536 2 30s12.536 28 28 28z'/%3E%3Cpath fill='%23FFF' d='M30 54C43.255 54 54 43.255 54 30S43.255 6 30 6 6 16.745 6 30s10.745 24 24 24z'/%3E%3Cpath fill='%23DDD' d='M30 50C41.046 50 50 41.046 50 30S41.046 10 30 10 10 18.954 10 30s8.954 20 20 20z'/%3E%3Cpath fill='%23FFF' d='M24 26h12v8H24z'/%3E%3C/g%3E%3C/svg%3E"
                >
                  <p>Select a node to view and edit its properties</p>
                </EmptyState>
              </Card>
            </BlockStack>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            paddingTop: '16px'
          }}>
            <Button
              icon={ChevronLeftIcon}
              variant="tertiary"
              size="slim"
              onClick={toggleRightSidebar}
              accessibilityLabel="Expand sidebar"
            />
          </div>
        )}
      </div>
    );
  }
  
  const renderConfigFields = () => {
    if (selectedNode.data.type === 'start') {
      const config = localConfig as StartConfig & TriggerConfig;
      return (
        <>
          <TextField
            label="Merchant ID"
            value={String(config.merchantId || '')}
            onChange={(value) => handleConfigChange('merchantId', value)}
            autoComplete="off"
            helpText="Unique identifier for the merchant account"
          />
          <Select
            label="Data Source"
            options={[
              { label: 'CRM', value: 'CRM' }
            ]}
            value={config.dataSource || 'CRM'}
            onChange={(value) => handleConfigChange('dataSource', value)}
            disabled
            helpText="Primary data source for workflow execution"
          />
          
          
          {/* Schedule Configuration - show only for schedule-based workflows */}
          {currentWorkflow?.triggerType === 'schedule-based' && 
            renderScheduleConfiguration(config)
          }
        </>
      );
    }
    
    if (selectedNode.data.type === 'trigger') {
      return (
        <Text as="p" variant="bodySm" tone="subdued">
          Trigger configuration (legacy support)
        </Text>
      );
    }
    
    if (selectedNode.data.type === 'action') {
      // SMS notification configuration
      if (selectedNode.data.label.includes('SMS')) {
        return (
          <>
            <TextField
              label="SMS Message"
              value={String(localConfig.message || '')}
              onChange={(value) => handleConfigChange('message', value)}
              multiline={4}
              autoComplete="off"
              helpText="Enter the SMS message to send. You can use variables like {{customer_name}}"
            />
            <TextField
              label="Phone Number Field"
              value={String(localConfig.phoneField || 'phone_number')}
              onChange={(value) => handleConfigChange('phoneField', value)}
              autoComplete="off"
              helpText="Field name containing the recipient's phone number"
            />
            {renderScheduleConfiguration(localConfig)}
          </>
        );
      }
      
      // Email notification configuration
      if (selectedNode.data.label.includes('email')) {
        return (
          <>
            <TextField
              label="Email Subject"
              value={String(localConfig.subject || '')}
              onChange={(value) => handleConfigChange('subject', value)}
              autoComplete="off"
              helpText="Email subject line"
            />
            <TextField
              label="Email Body"
              value={String(localConfig.body || '')}
              onChange={(value) => handleConfigChange('body', value)}
              multiline={6}
              autoComplete="off"
              helpText="Email message body. HTML is supported. Use {{variables}} for dynamic content"
            />
            <TextField
              label="Email Field"
              value={String(localConfig.emailField || 'email')}
              onChange={(value) => handleConfigChange('emailField', value)}
              autoComplete="off"
              helpText="Field name containing the recipient's email address"
            />
            {renderScheduleConfiguration(localConfig)}
          </>
        );
      }
      
      // LINE notification configuration
      if (selectedNode.data.label.includes('LINE')) {
        return (
          <>
            <TextField
              label="LINE Message"
              value={String(localConfig.message || '')}
              onChange={(value) => handleConfigChange('message', value)}
              multiline={4}
              autoComplete="off"
              helpText="Message to send via LINE. Use {{variables}} for dynamic content"
            />
            <TextField
              label="LINE User ID Field"
              value={String(localConfig.lineUserId || 'line_user_id')}
              onChange={(value) => handleConfigChange('lineUserId', value)}
              autoComplete="off"
              helpText="Field name containing the recipient's LINE user ID"
            />
            <TextField
              label="Image URL (Optional)"
              value={String(localConfig.imageUrl || '')}
              onChange={(value) => handleConfigChange('imageUrl', value)}
              autoComplete="off"
              helpText="Optional image URL to include in the LINE message"
            />
            {renderScheduleConfiguration(localConfig)}
          </>
        );
      }
      
      if (selectedNode.data.label.includes('HTTP')) {
        return (
          <>
            <TextField
              label="URL"
              value={String(localConfig.url || '')}
              onChange={(value) => handleConfigChange('url', value)}
              autoComplete="off"
            />
            <Select
              label="Method"
              options={[
                { label: 'GET', value: 'GET' },
                { label: 'POST', value: 'POST' },
                { label: 'PUT', value: 'PUT' },
                { label: 'DELETE', value: 'DELETE' }
              ]}
              value={String(localConfig.method || 'POST')}
              onChange={(value) => handleConfigChange('method', value)}
            />
            <TextField
              label="Headers (JSON)"
              value={localConfig.headers ? JSON.stringify(localConfig.headers) : '{}'}
              onChange={(value) => {
                try {
                  handleConfigChange('headers', JSON.parse(value));
                } catch {
                  // Ignore JSON parse errors
                }
              }}
              multiline={3}
              autoComplete="off"
            />
            {renderScheduleConfiguration(localConfig)}
          </>
        );
      }
      
      // Webhook configuration
      if (selectedNode.data.label.includes('webhook')) {
        return (
          <>
            <TextField
              label="Webhook URL"
              value={String(localConfig.url || '')}
              onChange={(value) => handleConfigChange('url', value)}
              autoComplete="off"
              helpText="The URL endpoint to send the webhook request"
            />
            <Select
              label="HTTP Method"
              options={[
                { label: 'GET', value: 'GET' },
                { label: 'POST', value: 'POST' },
                { label: 'PUT', value: 'PUT' },
                { label: 'DELETE', value: 'DELETE' }
              ]}
              value={String(localConfig.method || 'POST')}
              onChange={(value) => handleConfigChange('method', value)}
            />
            <TextField
              label="Headers (JSON)"
              value={localConfig.headers ? JSON.stringify(localConfig.headers) : '{}'}
              onChange={(value) => {
                try {
                  handleConfigChange('headers', JSON.parse(value));
                } catch {
                  // Ignore JSON parse errors
                }
              }}
              multiline={3}
              autoComplete="off"
              helpText="Optional HTTP headers in JSON format"
            />
            {renderScheduleConfiguration(localConfig)}
          </>
        );
      }
      
      if (selectedNode.data.label.includes('tags')) {
        return (
          <>
            <TextField
              label="Tags (comma-separated)"
              value={Array.isArray(localConfig.tags) ? localConfig.tags.join(', ') : ''}
              onChange={(value) => handleConfigChange('tags', value.split(',').map(t => t.trim()))}
              autoComplete="off"
            />
            {renderScheduleConfiguration(localConfig)}
          </>
        );
      }
      
      if (selectedNode.data.label.includes('line item')) {
        return (
          <>
            <TextField
              label="Product ID"
              value={String(localConfig.product_id || '')}
              onChange={(value) => handleConfigChange('product_id', value)}
              autoComplete="off"
            />
            <TextField
              label="Quantity"
              type="number"
              value={String(localConfig.quantity || 1)}
              onChange={(value) => handleConfigChange('quantity', parseInt(value) || 1)}
              autoComplete="off"
            />
            {renderScheduleConfiguration(localConfig)}
          </>
        );
      }
    }
    
    // Step/Utility node configurations
    if (selectedNode.data.type === 'step') {
      // Wait configuration
      if (selectedNode.data.label.includes('Wait')) {
        return (
          <>
            <TextField
              label="Duration"
              type="number"
              value={String(localConfig.duration || 60)}
              onChange={(value) => handleConfigChange('duration', parseInt(value) || 60)}
              autoComplete="off"
              helpText="How long to wait"
            />
            <Select
              label="Unit"
              options={[
                { label: 'Seconds', value: 'seconds' },
                { label: 'Minutes', value: 'minutes' },
                { label: 'Hours', value: 'hours' },
                { label: 'Days', value: 'days' }
              ]}
              value={String(localConfig.unit || 'seconds')}
              onChange={(value) => handleConfigChange('unit', value)}
            />
            {renderScheduleConfiguration(localConfig)}
          </>
        );
      }
      
      // Log message configuration
      if (selectedNode.data.label.includes('Log')) {
        return (
          <>
            <TextField
              label="Log Message"
              value={String(localConfig.message || '')}
              onChange={(value) => handleConfigChange('message', value)}
              multiline={3}
              autoComplete="off"
              helpText="Message to add to the workflow log"
            />
            <Select
              label="Log Level"
              options={[
                { label: 'Info', value: 'info' },
                { label: 'Warning', value: 'warning' },
                { label: 'Error', value: 'error' },
                { label: 'Debug', value: 'debug' }
              ]}
              value={String(localConfig.level || 'info')}
              onChange={(value) => handleConfigChange('level', value)}
            />
            {renderScheduleConfiguration(localConfig)}
          </>
        );
      }
    }
    
    return null;
  };
  
  const renderScheduleConfiguration = (config: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    return (
      <>
        <Divider />
        <BlockStack gap="300">
          <Text as="h3" variant="headingMd">Schedule Configuration</Text>
          
          <Select
            label="Schedule Type"
            options={[
              { label: 'One-time', value: 'one-time' },
              { label: 'Recurring', value: 'recurring' }
            ]}
            value={config.scheduleType || 'recurring'}
            onChange={(value) => handleConfigChange('scheduleType', value)}
          />
          
          <TextField
            label="Schedule Time"
            value={String(config.scheduleTime || '')}
            onChange={(value) => handleConfigChange('scheduleTime', value)}
            autoComplete="off"
            placeholder="14:00"
            helpText="Time in 24-hour format (e.g., 14:00 for 2 PM)"
          />
          
          {config.scheduleType === 'recurring' && (
            <Select
                label="Recurrence Pattern"
                options={[
                  { label: 'Daily', value: 'daily' },
                  { label: 'Weekly', value: 'weekly' },
                  { label: 'Monthly', value: 'monthly' },
                  { label: 'Yearly', value: 'yearly' }
                ]}
                value={config.recurrencePattern || 'daily'}
                onChange={(value) => handleConfigChange('recurrencePattern', value)}
              />
          )}
          
          {config.scheduleType === 'one-time' && (
            <TextField
              label="Schedule Date"
              type="date"
              value={String(config.scheduleDate || '')}
              onChange={(value) => handleConfigChange('scheduleDate', value)}
              autoComplete="off"
              helpText="Date for one-time execution"
            />
          )}
          
          {config.recurrencePattern === 'weekly' && (
            <Select
              label="Day of Week"
              options={[
                { label: 'Sunday', value: '0' },
                { label: 'Monday', value: '1' },
                { label: 'Tuesday', value: '2' },
                { label: 'Wednesday', value: '3' },
                { label: 'Thursday', value: '4' },
                { label: 'Friday', value: '5' },
                { label: 'Saturday', value: '6' }
              ]}
              value={String(config.dayOfWeek || '1')}
              onChange={(value) => handleConfigChange('dayOfWeek', parseInt(value))}
            />
          )}
          
          {config.recurrencePattern === 'monthly' && (
            <TextField
              label="Day of Month"
              type="number"
              min="1"
              max="31"
              value={String(config.dayOfMonth || '1')}
              onChange={(value) => handleConfigChange('dayOfMonth', parseInt(value) || 1)}
              autoComplete="off"
              helpText="Day of the month (1-31)"
            />
          )}
          
          {config.recurrencePattern === 'yearly' && (
            <>
              <Select
                label="Month"
                options={[
                  { label: 'January', value: '1' },
                  { label: 'February', value: '2' },
                  { label: 'March', value: '3' },
                  { label: 'April', value: '4' },
                  { label: 'May', value: '5' },
                  { label: 'June', value: '6' },
                  { label: 'July', value: '7' },
                  { label: 'August', value: '8' },
                  { label: 'September', value: '9' },
                  { label: 'October', value: '10' },
                  { label: 'November', value: '11' },
                  { label: 'December', value: '12' }
                ]}
                value={String(config.month || '1')}
                onChange={(value) => handleConfigChange('month', parseInt(value))}
              />
              <TextField
                label="Day of Month"
                type="number"
                min="1"
                max="31"
                value={String(config.dayOfMonth || '1')}
                onChange={(value) => handleConfigChange('dayOfMonth', parseInt(value) || 1)}
                autoComplete="off"
                helpText="Day of the month (1-31)"
              />
            </>
          )}
        </BlockStack>
      </>
    );
  };
  
  const getOperatorOptions = (fieldType?: string) => {
    const baseOptions = [
      { label: 'Equals', value: 'equals' },
      { label: 'Not equals', value: 'not_equals' },
      { label: 'Is empty', value: 'is_empty' },
      { label: 'Is not empty', value: 'is_not_empty' }
    ];
    
    if (fieldType === 'number') {
      return [
        ...baseOptions,
        { label: 'Greater than', value: 'greater_than' },
        { label: 'Less than', value: 'less_than' },
        { label: 'Greater or equal', value: 'greater_equal' },
        { label: 'Less or equal', value: 'less_equal' }
      ];
    }
    
    if (fieldType === 'text') {
      return [
        ...baseOptions,
        { label: 'Contains', value: 'contains' },
        { label: 'Does not contain', value: 'not_contains' }
      ];
    }
    
    if (fieldType === 'date') {
      return [
        ...baseOptions,
        { label: 'Before', value: 'date_before' },
        { label: 'After', value: 'date_after' }
      ];
    }
    
    return baseOptions;
  };
  
  return (
    <div style={{ 
      width: rightSidebarVisible ? '360px' : '48px', 
      height: '100%', 
      borderLeft: '1px solid #e1e3e5', 
      overflowY: rightSidebarVisible ? 'auto' : 'hidden',
      transition: 'width 0.3s ease',
      position: 'relative'
    }}>
      {rightSidebarVisible ? (
        <div style={{ padding: '16px' }}>
          <BlockStack gap="400">
            <InlineStack align="space-between" blockAlign="center">
              <InlineStack gap="200" blockAlign="center">
                <Text as="h2" variant="headingLg">
                  Properties
                </Text>
                <Badge tone="info">{selectedNode.data.type}</Badge>
              </InlineStack>
              <Button
                icon={ChevronRightIcon}
                variant="tertiary"
                size="slim"
                onClick={toggleRightSidebar}
                accessibilityLabel="Collapse sidebar"
              />
            </InlineStack>
          
          <Card>
            <BlockStack gap="400">
              <FormLayout>
                <TextField
                  label="Label"
                  value={selectedNode.data.label}
                  onChange={handleLabelChange}
                  autoComplete="off"
                />
                <TextField
                  label="Description"
                  value={selectedNode.data.description || ''}
                  onChange={handleDescriptionChange}
                  multiline={2}
                  autoComplete="off"
                />
                
                {selectedNode.data.type === 'condition' && (
                  <>
                    <Divider />
                    <BlockStack gap="300">
                      <InlineStack align="space-between" blockAlign="center">
                        <Text as="h3" variant="headingMd">
                          Conditions
                        </Text>
                        <Button
                          icon={Icons.Add}
                          onClick={addCondition}
                          size="slim"
                        >
                          Add
                        </Button>
                      </InlineStack>
                      
                      {conditions.map((condition, index) => {
                        const collections = getCollectionsForDataSource(condition.dataSource);
                        const fields = condition.collection 
                          ? getFieldsForCollection(condition.dataSource, condition.collection)
                          : [];
                        const selectedField = fields.find((f: DataSourceField) => f.key === condition.field);
                        
                        return (
                          <Card key={condition.id} padding="200">
                            <BlockStack gap="200">
                              {index > 0 && (
                                <Select
                                  label="Logical Operator"
                                  options={[
                                    { label: 'AND', value: 'AND' },
                                    { label: 'OR', value: 'OR' }
                                  ]}
                                  value={condition.logicalOperator || 'AND'}
                                  onChange={(value) => updateCondition(condition.id, { 
                                    logicalOperator: value as 'AND' | 'OR' 
                                  })}
                                />
                              )}
                              
                              <Select
                                label="Data Source"
                                options={getDataSourcesForConditions()}
                                value={condition.dataSource}
                                onChange={(value) => updateCondition(condition.id, { 
                                  dataSource: value as 'CRM',
                                  collection: undefined,
                                  field: '',
                                  value: ''
                                })}
                              />
                              
                              {collections.length > 0 && (
                                <Select
                                  label="Collection"
                                  options={collections.map(c => ({ label: c.charAt(0).toUpperCase() + c.slice(1), value: c }))}
                                  value={condition.collection || ''}
                                  onChange={(value) => updateCondition(condition.id, { 
                                    collection: value,
                                    field: '',
                                    value: ''
                                  })}
                                  placeholder="Select collection"
                                />
                              )}
                              
                              {fields.length > 0 && (
                                <Select
                                  label="Field"
                                  options={fields.map((f: DataSourceField) => ({ label: f.label, value: f.key }))}
                                  value={condition.field}
                                  onChange={(value) => {
                                    const field = fields.find((f: DataSourceField) => f.key === value);
                                    updateCondition(condition.id, { 
                                      field: value,
                                      fieldType: field?.type || 'text',
                                      selectOptions: field?.options,
                                      value: ''
                                    });
                                  }}
                                  placeholder="Select field"
                                />
                              )}
                              
                              {condition.field && (
                                <Select
                                  label="Operator"
                                  options={getOperatorOptions(selectedField?.type)}
                                  value={condition.operator}
                                  onChange={(value) => updateCondition(condition.id, { 
                                    operator: value as WorkflowCondition['operator']
                                  })}
                                />
                              )}
                              
                              {condition.field && !['is_empty', 'is_not_empty'].includes(condition.operator) && (
                                <>
                                  {selectedField?.type === 'select' && selectedField.options ? (
                                    <Select
                                      label="Value"
                                      options={selectedField.options.map((opt: string) => ({ label: opt, value: opt }))}
                                      value={String(condition.value)}
                                      onChange={(value) => updateCondition(condition.id, { value })}
                                      placeholder="Select value"
                                    />
                                  ) : selectedField?.type === 'date' ? (
                                    <TextField
                                      label="Value"
                                      type="date"
                                      value={String(condition.value)}
                                      onChange={(value) => updateCondition(condition.id, { value })}
                                      autoComplete="off"
                                    />
                                  ) : selectedField?.type === 'number' ? (
                                    <TextField
                                      label="Value"
                                      type="number"
                                      value={String(condition.value)}
                                      onChange={(value) => updateCondition(condition.id, { value: Number(value) })}
                                      autoComplete="off"
                                    />
                                  ) : (
                                    <TextField
                                      label="Value"
                                      value={String(condition.value)}
                                      onChange={(value) => updateCondition(condition.id, { value })}
                                      autoComplete="off"
                                      placeholder="Enter value"
                                    />
                                  )}
                                </>
                              )}
                              
                              <Button
                                icon={Icons.Delete}
                                onClick={() => removeCondition(condition.id)}
                                variant="plain"
                                tone="critical"
                                size="slim"
                              >
                                Remove condition
                              </Button>
                            </BlockStack>
                          </Card>
                        );
                      })}
                    </BlockStack>
                  </>
                )}
                
                {renderConfigFields()}
              </FormLayout>
              
              <Divider />
              
              {selectedNode.data.type !== 'start' && (
                <Button
                  tone="critical"
                  icon={Icons.Delete}
                  onClick={() => deleteNode(selectedNode.id)}
                  fullWidth
                >
                  Delete Node
                </Button>
              )}
            </BlockStack>
          </Card>
        </BlockStack>
      </div>
      ) : (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          paddingTop: '16px'
        }}>
          <Button
            icon={ChevronLeftIcon}
            variant="tertiary"
            size="slim"
            onClick={toggleRightSidebar}
            accessibilityLabel="Expand sidebar"
          />
        </div>
      )}
    </div>
  );
};

export default PropertiesSidebar;