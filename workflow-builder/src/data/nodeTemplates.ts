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
    default_config: {}
  },
  
  // Actions - Marketing Automation
  {
    type: 'action',
    label: 'Send SMS notification',
    description: 'Send SMS with dynamic content based on trigger data',
    icon: 'MobileIcon',
    category: 'actions',
    default_config: {
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
    default_config: {
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
    default_config: {
      message: '',
      lineUserId: '',
      includeCustomerData: true,
      imageUrl: ''
    }
  },
  {
    type: 'action',
    label: 'Send Slack notification',
    description: 'Send message to Slack channel or user',
    icon: 'ChatIcon',
    category: 'actions',
    default_config: {
      message: '',
      channel: '',
      username: 'Workflow Bot',
      includeCustomerData: true,
      attachments: []
    }
  },
  {
    type: 'action',
    label: 'Trigger webhook',
    description: 'Call external API with customer and trigger data',
    icon: 'ExportIcon',
    category: 'actions',
    default_config: {
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
    default_config: {
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
    default_config: {
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
    default_config: {
      message: '',
      level: 'info'
    }
  }
];
