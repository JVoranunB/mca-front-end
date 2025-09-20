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
          value={config.merchant_id || ''}
          onChange={(value) => handleChange('merchant_id', value)}
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
          value={config.data_source}
          onChange={(value) => handleChange('data_source', value)}
        />
        
        <BlockStack gap="200">
          <Text as="h3" variant="headingSm">
            Schedule Type
          </Text>
          <Stack gap="200">
            <RadioButton
              label="One-time Schedule"
              checked={config.schedule_type === 'one-time'}
              id="one-time"
              name="scheduleType"
              onChange={() => handleChange('schedule_type', 'one-time')}
            />
            <RadioButton
              label="Recurring Schedule"
              checked={config.schedule_type === 'recurring'}
              id="recurring"
              name="scheduleType"
              onChange={() => handleChange('schedule_type', 'recurring')}
            />
          </Stack>
        </BlockStack>
        
        {config.schedule_type === 'one-time' && (
          <TextField
            label="Schedule Date"
            type="date"
            value={config.schedule_date || ''}
            onChange={(value) => handleChange('schedule_date', value)}
            autoComplete="off"
            helpText="Select the date when this trigger should fire"
          />
        )}
        
        {config.schedule_type === 'recurring' && (
          <Select
            label="Recurrence Pattern"
            options={[
              { label: 'Daily', value: 'daily' },
              { label: 'Weekly', value: 'weekly' },
              { label: 'Monthly', value: 'monthly' },
              { label: 'Yearly', value: 'yearly' }
            ]}
            value={config.recurrence_pattern || 'daily'}
            onChange={(value) => handleChange('recurrence_pattern', value)}
          />
        )}
        
        {config.recurrence_pattern === 'weekly' && (
          <Select
            label="Day of Week"
            options={daysOfWeek}
            value={String(config.day_of_week || '1')}
            onChange={(value) => handleChange('day_of_week', parseInt(value))}
          />
        )}
        
        {config.recurrence_pattern === 'monthly' && (
          <TextField
            label="Day of Month"
            type="number"
            value={String(config.day_of_month || '1')}
            onChange={(value) => handleChange('day_of_month', parseInt(value) || 1)}
            min="1"
            max="31"
            autoComplete="off"
            helpText="Enter day of month (1-31)"
          />
        )}
        
        <TextField
          label="Schedule Time"
          type="time"
          value={config.schedule_time || '09:00'}
          onChange={(value) => handleChange('schedule_time', value)}
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
          {config.schedule_type === 'one-time' ? (
            <Badge tone="attention">
              {`Once on ${config.schedule_date || 'TBD'} at ${config.schedule_time || '09:00'} ${config.timezone || 'UTC'}`}
            </Badge>
          ) : (
            <Badge tone="success">
              {config.recurrence_pattern === 'daily' ? `Daily at ${config.schedule_time || '09:00'} ${config.timezone || 'UTC'}` :
               config.recurrence_pattern === 'weekly' ? `Weekly on ${daysOfWeek.find(d => d.value === String(config.day_of_week))?.label || 'Monday'} at ${config.schedule_time || '09:00'} ${config.timezone || 'UTC'}` :
               config.recurrence_pattern === 'monthly' ? `Monthly on day ${config.day_of_month || '1'} at ${config.schedule_time || '09:00'} ${config.timezone || 'UTC'}` :
               config.recurrence_pattern === 'yearly' ? `Yearly at ${config.schedule_time || '09:00'} ${config.timezone || 'UTC'}` :
               'Configure schedule'}
            </Badge>
          )}
        </InlineStack>
      </BlockStack>
    </BlockStack>
  );
};

export default ScheduledConfig;