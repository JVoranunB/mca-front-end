import React from 'react';
import {
  FormLayout,
  TextField,
  Select,
  BlockStack,
  InlineStack,
  Text,
  Badge,
  RadioButton,
  BlockStack as Stack
} from '@shopify/polaris';
import type { TriggerConfig } from '../../types/workflow.types';

interface ScheduledConfigProps {
  config: TriggerConfig;
  onChange: (config: TriggerConfig) => void;
}

const ScheduledConfig: React.FC<ScheduledConfigProps> = ({ config, onChange }) => {
  const handleChange = (key: keyof TriggerConfig, value: string | number) => {
    onChange({
      ...config,
      [key]: value
    });
  };

  const timezones = [
    { label: 'UTC', value: 'UTC' },
    { label: 'Eastern Time (ET)', value: 'America/New_York' },
    { label: 'Central Time (CT)', value: 'America/Chicago' },
    { label: 'Mountain Time (MT)', value: 'America/Denver' },
    { label: 'Pacific Time (PT)', value: 'America/Los_Angeles' },
    { label: 'London (GMT)', value: 'Europe/London' },
    { label: 'Paris (CET)', value: 'Europe/Paris' },
    { label: 'Tokyo (JST)', value: 'Asia/Tokyo' },
    { label: 'Sydney (AEDT)', value: 'Australia/Sydney' }
  ];

  const daysOfWeek = [
    { label: 'Sunday', value: '0' },
    { label: 'Monday', value: '1' },
    { label: 'Tuesday', value: '2' },
    { label: 'Wednesday', value: '3' },
    { label: 'Thursday', value: '4' },
    { label: 'Friday', value: '5' },
    { label: 'Saturday', value: '6' }
  ];

  return (
    <BlockStack gap="400">
      <FormLayout>
        <TextField
          label="Merchant ID"
          value={config.merchantId || ''}
          onChange={(value) => handleChange('merchantId', value)}
          placeholder="Enter merchant ID for isolation"
          autoComplete="off"
          helpText="Leave empty to process all merchants"
        />
        
        <Select
          label="Data Source"
          options={[
            { label: 'CRM (Customer Data)', value: 'crm' },
            { label: 'MongoDB (Batch Processing)', value: 'mongodb' }
          ]}
          value={config.dataSource}
          onChange={(value) => handleChange('dataSource', value)}
        />
        
        <BlockStack gap="200">
          <Text as="h3" variant="headingSm">
            Schedule Type
          </Text>
          <Stack gap="200">
            <RadioButton
              label="One-time Schedule"
              checked={config.scheduleType === 'one-time'}
              id="one-time"
              name="scheduleType"
              onChange={() => handleChange('scheduleType', 'one-time')}
            />
            <RadioButton
              label="Recurring Schedule"
              checked={config.scheduleType === 'recurring'}
              id="recurring"
              name="scheduleType"
              onChange={() => handleChange('scheduleType', 'recurring')}
            />
          </Stack>
        </BlockStack>
        
        {config.scheduleType === 'one-time' && (
          <TextField
            label="Schedule Date"
            type="date"
            value={config.scheduleDate || ''}
            onChange={(value) => handleChange('scheduleDate', value)}
            autoComplete="off"
            helpText="Select the date when this trigger should fire"
          />
        )}
        
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
            onChange={(value) => handleChange('recurrencePattern', value)}
          />
        )}
        
        {config.recurrencePattern === 'weekly' && (
          <Select
            label="Day of Week"
            options={daysOfWeek}
            value={String(config.dayOfWeek || '1')}
            onChange={(value) => handleChange('dayOfWeek', parseInt(value))}
          />
        )}
        
        {config.recurrencePattern === 'monthly' && (
          <TextField
            label="Day of Month"
            type="number"
            value={String(config.dayOfMonth || '1')}
            onChange={(value) => handleChange('dayOfMonth', parseInt(value) || 1)}
            min="1"
            max="31"
            autoComplete="off"
            helpText="Enter day of month (1-31)"
          />
        )}
        
        <TextField
          label="Schedule Time"
          type="time"
          value={config.scheduleTime || '09:00'}
          onChange={(value) => handleChange('scheduleTime', value)}
          autoComplete="off"
          helpText="Time when the trigger should fire"
        />
        
        <Select
          label="Timezone"
          options={timezones}
          value={config.timezone || 'UTC'}
          onChange={(value) => handleChange('timezone', value)}
        />
      </FormLayout>
      
      <BlockStack gap="200">
        <InlineStack gap="200">
          <Text as="p" variant="bodySm" fontWeight="semibold">
            Schedule Summary:
          </Text>
          {config.scheduleType === 'one-time' ? (
            <Badge tone="attention">
              {`Once on ${config.scheduleDate || 'TBD'} at ${config.scheduleTime || '09:00'} ${config.timezone || 'UTC'}`}
            </Badge>
          ) : (
            <Badge tone="success">
              {config.recurrencePattern === 'daily' ? `Daily at ${config.scheduleTime || '09:00'} ${config.timezone || 'UTC'}` :
               config.recurrencePattern === 'weekly' ? `Weekly on ${daysOfWeek.find(d => d.value === String(config.dayOfWeek))?.label || 'Monday'} at ${config.scheduleTime || '09:00'} ${config.timezone || 'UTC'}` :
               config.recurrencePattern === 'monthly' ? `Monthly on day ${config.dayOfMonth || '1'} at ${config.scheduleTime || '09:00'} ${config.timezone || 'UTC'}` :
               config.recurrencePattern === 'yearly' ? `Yearly at ${config.scheduleTime || '09:00'} ${config.timezone || 'UTC'}` :
               'Configure schedule'}
            </Badge>
          )}
        </InlineStack>
      </BlockStack>
    </BlockStack>
  );
};

export default ScheduledConfig;