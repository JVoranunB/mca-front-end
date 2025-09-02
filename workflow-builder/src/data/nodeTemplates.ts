import type { NodeTemplate } from '../types/workflow.types';

// Node templates (excluding start node which is auto-created)
export const nodeTemplates: NodeTemplate[] = [
  // Conditions
  {
    type: 'condition',
    label: 'Condition',
    description: 'Check data conditions with customizable rules',
    icon: 'HelpIcon',
    category: 'conditions',
    defaultConfig: {}
  },
  
  // Actions - Marketing Automation
  {
    type: 'action',
    label: 'Send SMS notification',
    description: 'Send SMS with dynamic content based on trigger data',
    icon: 'MobileIcon',
    category: 'actions',
    defaultConfig: {
      template: '',
      phoneField: 'phone_number',
      includeCustomerData: true
    }
  },
  {
    type: 'action',
    label: 'Send email notification',
    description: 'Send personalized email with campaign templates',
    icon: 'EmailIcon',
    category: 'actions',
    defaultConfig: {
      campaignTemplate: '',
      emailField: 'email',
      subject: '',
      includeCustomerData: true
    }
  },
  {
    type: 'action',
    label: 'Send LINE notification',
    description: 'Send message via LINE messaging platform',
    icon: 'NotificationIcon',
    category: 'actions',
    defaultConfig: {
      message: '',
      lineUserId: '',
      includeCustomerData: true,
      imageUrl: ''
    }
  },
  {
    type: 'action',
    label: 'Trigger webhook',
    description: 'Call external API with customer and trigger data',
    icon: 'ExportIcon',
    category: 'actions',
    defaultConfig: {
      url: '',
      method: 'POST',
      includeCustomerData: true,
      headers: {}
    }
  },
  {
    type: 'action',
    label: 'Add tags',
    description: 'Add tags to customer profile',
    icon: 'HashtagIcon',
    category: 'actions',
    defaultConfig: {
      tags: [],
      dataSource: 'crm'
    }
  },
  
  // Utilities
  {
    type: 'step',
    label: 'Wait',
    description: 'Pause workflow execution',
    icon: 'ClockIcon',
    category: 'utilities',
    defaultConfig: {
      duration: 60,
      unit: 'seconds'
    }
  },
  {
    type: 'step',
    label: 'Log message',
    description: 'Add entry to workflow log',
    icon: 'NoteIcon',
    category: 'utilities',
    defaultConfig: {
      message: '',
      level: 'info'
    }
  }
];
