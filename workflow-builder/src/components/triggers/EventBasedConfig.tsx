import React from 'react';
import {
  FormLayout,
  TextField,
  Select,
  Checkbox,
  BlockStack,
  InlineStack,
  Text,
  Badge
} from '@shopify/polaris';
import { getCollectionsForDataSource } from '../../utils/dataSourceFields';
import type { TriggerConfig } from '../../types/workflow.types';

interface EventBasedConfigProps {
  config: TriggerConfig;
  onChange: (config: TriggerConfig) => void;
}

const EventBasedConfig: React.FC<EventBasedConfigProps> = ({ config, onChange }) => {
  const collections = getCollectionsForDataSource('mongodb');
  
  const handleChange = (key: keyof TriggerConfig, value: string | boolean | string[]) => {
    onChange({
      ...config,
      [key]: value
    });
  };

  const handleCollectionToggle = (collection: string) => {
    const currentCollections = config.collections || [];
    const newCollections = currentCollections.includes(collection)
      ? currentCollections.filter(c => c !== collection)
      : [...currentCollections, collection];
    
    handleChange('collections', newCollections);
  };

  return (
    <BlockStack gap="400">
      <FormLayout>
        <TextField
          label="Merchant ID"
          value={config.merchantId || ''}
          onChange={(value) => handleChange('merchantId', value)}
          placeholder="Enter merchant ID for isolation"
          autoComplete="off"
          helpText="Leave empty to monitor all merchants"
        />
        
        <Select
          label="Data Source"
          options={[
            { label: 'MongoDB (Real-time)', value: 'mongodb' },
            { label: 'CRM (Customer Data)', value: 'crm' }
          ]}
          value={config.dataSource}
          onChange={(value) => handleChange('dataSource', value)}
        />
        
        {config.dataSource === 'CRM' && (
          <>
            <Checkbox
              label="Enable MongoDB Change Streams"
              checked={config.changeStreamEnabled || false}
              onChange={(value) => handleChange('changeStreamEnabled', value)}
              helpText="Monitor real-time changes in selected collections"
            />
            
            <BlockStack gap="200">
              <Text as="h3" variant="headingSm">
                Monitor Collections
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                Select which collections to monitor for changes
              </Text>
              
              <BlockStack gap="100">
                {collections.map((collection) => (
                  <Checkbox
                    key={collection}
                    label={
                      <InlineStack gap="200" align="start">
                        <span>{collection.charAt(0).toUpperCase() + collection.slice(1)}</span>
                        <Badge size="small" tone="info">
                          {collection === 'orders' ? 'High Volume' : 
                           collection === 'customers' ? 'Medium Volume' : 'Low Volume'}
                        </Badge>
                      </InlineStack>
                    }
                    checked={(config.collections || []).includes(collection)}
                    onChange={() => handleCollectionToggle(collection)}
                  />
                ))}
              </BlockStack>
            </BlockStack>
          </>
        )}
      </FormLayout>
      
      {config.collections && config.collections.length > 0 && (
        <InlineStack gap="200">
          <Text as="p" variant="bodySm" fontWeight="semibold">
            Monitoring:
          </Text>
          {config.collections.map((collection) => (
            <Badge key={collection} tone="success">
              {collection}
            </Badge>
          ))}
        </InlineStack>
      )}
    </BlockStack>
  );
};

export default EventBasedConfig;