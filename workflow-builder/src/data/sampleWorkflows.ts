import type { Workflow } from '../types/workflow.types';

export const sampleWorkflows: Workflow[] = [
  {
    id: 'sample-7',
    name: 'Simple Points Milestone Notification',
    description: 'Send LINE notification when customer points exceed 1000',
    trigger_type: 'event-based',
    status: 'active',
    created_at: '2024-01-16T11:00:00Z',
    updated_at: '2024-01-16T11:00:00Z',
    actions: [
      {
        id: 'start-7',
        type: 'start',
        position: { x: 100, y: 300 },
        data: {
          label: 'Points Update Trigger',
          type: 'start',
          description: 'Triggers when customer points balance changes',
          status: 'active',
          config: {
            label: 'Points Update Trigger',
            description: 'Monitor points balance updates',
            merchant_id: 'SHOP001',
            data_source: 'CRM',
            trigger_category: 'event',
            event_type: 'points_updated',
            change_stream_enabled: true,
            collections: ['contacts']
          }
        }
      },
      {
        id: 'condition-7',
        type: 'condition',
        position: { x: 700, y: 300 },
        data: {
          label: 'Points > 1000',
          type: 'condition',
          description: 'Check if points balance exceeds 1000',
          status: 'active',
          conditions: [
            {
              id: 'cond-7',
              data_source: 'CRM',
              collection: 'contacts',
              field: 'point_balance',
              field_type: 'number',
              operator: 'greater_than',
              value: 1000
            }
          ]
        }
      },
      {
        id: 'action-26',
        type: 'action',
        position: { x: 1300, y: 200 },
        data: {
          label: 'Send LINE notification',
          type: 'action',
          description: 'Notify customer via LINE about points milestone',
          status: 'active',
          config: {
            message: 'Congratulations! You now have ${points_balance} points. Redeem them for exclusive rewards in our store!',
            line_user_id: 'line_user_id',
            include_customer_data: true
          }
        }
      },
      {
        id: 'log-7',
        type: 'step',
        position: { x: 1300, y: 400 },
        data: {
          label: 'Log condition not met',
          type: 'step',
          description: 'Log when points balance does not exceed threshold',
          status: 'active',
          config: {
            message: 'Points balance ${points_balance} does not exceed 1000 threshold',
            level: 'info'
          }
        }
      }
    ],
    peers: [
      {
        id: 'e45',
        source: 'start-7',
        target: 'condition-7',
        animated: true
      },
      {
        id: 'e46-yes',
        source: 'condition-7',
        target: 'action-26',
        source_handle: 'yes',
        animated: true,
        label: 'Yes'
      },
      {
        id: 'e47-no',
        source: 'condition-7',
        target: 'log-7',
        source_handle: 'no',
        animated: true,
        label: 'No'
      }
    ]
  },
  {
    id: 'sample-1',
    name: 'High Value Customer Follow-up',
    description: 'Automatically send SMS to customers who place orders over $500',
    trigger_type: 'event-based',
    status: 'draft',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    actions: [
      {
        id: 'start-1',
        type: 'start',
        position: { x: 100, y: 300 },
        data: {
          label: 'Order Processing Start',
          type: 'start',
          description: 'Starting point for order processing workflow',
          status: 'active',
          config: {
            label: 'Order Processing Start',
            description: 'Starting point for order processing workflow',
            merchant_id: 'SHOP001',
            data_source: 'CRM'
          }
        }
      },
      {
        id: 'condition-1',
        type: 'condition',
        position: { x: 700, y: 300 },
        data: {
          label: 'Order value > $500',
          type: 'condition',
          description: 'Check if order total is greater than $500',
          status: 'active',
          conditions: [
            {
              id: 'cond-1',
              data_source: 'CRM',
              collection: 'orders',
              field: 'grand_total',
              field_type: 'number',
              operator: 'greater_than',
              value: 500
            }
          ]
        }
      },
      {
        id: 'action-1',
        type: 'action',
        position: { x: 1300, y: 200 },
        data: {
          label: 'Send thank you SMS',
          type: 'action',
          description: 'Send personalized SMS to high-value customers',
          status: 'active',
          config: {
            sms_template: 'Thank you for your ${order_total} order! As a valued customer, enjoy 10% off your next purchase.',
            delay_minutes: 0
          }
        }
      },
      {
        id: 'action-2',
        type: 'action',
        position: { x: 1300, y: 380 },
        data: {
          label: 'Send Slack notification',
          type: 'action',
          description: 'Notify team about high-value customer order',
          status: 'active',
          config: {
            message: '🎉 High-value customer alert! ${customer_name} just placed a ${order_total} order. Consider reaching out for personalized service.',
            channel: '#customer-success',
            username: 'Order Bot',
            include_customer_data: true,
            attachments: []
          }
        }
      },
      {
        id: 'log-1',
        type: 'step',
        position: { x: 1300, y: 600 },
        data: {
          label: 'Log standard order',
          type: 'step',
          description: 'Log when order value is not above VIP threshold',
          status: 'active',
          config: {
            message: 'Order ${order_id} with value ${order_total} processed as standard order',
            level: 'info'
          }
        }
      }
    ],
    peers: [
      {
        id: 'e1',
        source: 'start-1',
        target: 'condition-1',
        animated: true
      },
      {
        id: 'e2-yes',
        source: 'condition-1',
        target: 'action-1',
        source_handle: 'yes',
        animated: true,
        label: 'Yes'
      },
      {
        id: 'e3-yes',
        source: 'condition-1',
        target: 'action-2',
        source_handle: 'yes',
        animated: true,
        label: 'Yes'
      },
      {
        id: 'e4-no',
        source: 'condition-1',
        target: 'log-1',
        source_handle: 'no',
        animated: true,
        label: 'No'
      }
    ]
  }, 
 {
    id: 'sample-10',
    name: 'User Birthday Celebration',
    description: 'Send birthday greetings and special offers to customers on their birthday',
    trigger_type: 'schedule-based',
    status: 'active',
    created_at: '2024-01-16T09:00:00Z',
    updated_at: '2024-01-16T09:00:00Z',
    actions: [
      {
        id: 'start-10',
        type: 'start',
        position: { x: 100, y: 300 },
        data: {
          label: 'Daily Birthday Check',
          type: 'start',
          description: 'Check for customer birthdays every day at 9 AM',
          status: 'active',
          config: {
            label: 'Daily Birthday Check',
            description: 'Runs daily to check for customer birthdays',
            merchant_id: 'SHOP001',
            data_source: 'CRM',
            trigger_category: 'scheduled',
            schedule_time: '09:00',
            timezone: 'Asia/Bangkok',
            recurrence_pattern: 'daily',
            schedule_type: 'recurring',
            change_stream_enabled: false,
            collections: ['contacts']
          }
        }
      },
      {
        id: 'condition-10',
        type: 'condition',
        position: { x: 700, y: 300 },
        data: {
          label: 'Is birthday today?',
          type: 'condition',
          description: 'Check if customer birthday is today',
          status: 'active',
          conditions: [
            {
              id: 'cond-10',
              data_source: 'CRM',
              collection: 'contacts',
              field: 'date_of_birth',
              field_type: 'date',
              operator: 'equals',
              value: 'today'
            }
          ]
        }
      },
      {
        id: 'action-31',
        type: 'action',
        position: { x: 1300, y: 150 },
        data: {
          label: 'Send birthday email',
          type: 'action',
          description: 'Send birthday wishes with special discount',
          status: 'active',
          config: {
            email_template: 'birthday-wishes',
            subject: 'Happy Birthday ${customer_name}! 🎂',
            email_field: 'email',
            body: 'Dear ${customer_name}, wishing you a wonderful birthday! Enjoy 30% off with code BDAY30 - valid for 7 days.',
            discount_code: 'BDAY30',
            include_customer_data: true
          }
        }
      },
      {
        id: 'action-32',
        type: 'action',
        position: { x: 1300, y: 350 },
        data: {
          label: 'Send LINE birthday message',
          type: 'action',
          description: 'LINE notification with birthday greeting',
          status: 'active',
          config: {
            message: '🎉 Happy Birthday ${customer_name}! 🎂 Celebrate with 30% off - use code BDAY30. Valid for 7 days!',
            line_user_id: 'line_user_id',
            include_customer_data: true,
            image_url: 'https://example.com/images/birthday-celebration.png'
          }
        }
      },
      {
        id: 'action-33',
        type: 'action',
        position: { x: 1300, y: 550 },
        data: {
          label: 'Add birthday tag',
          type: 'action',
          description: 'Tag customer for birthday campaign tracking',
          status: 'active',
          config: {
            tags: ['Birthday 2024', 'Birthday Campaign'],
            update_customer_profile: true
          }
        }
      },
      {
        id: 'log-10',
        type: 'step',
        position: { x: 1300, y: 700 },
        data: {
          label: 'Log non-birthday',
          type: 'step',
          description: 'Log when customer birthday is not today',
          status: 'active',
          config: {
            message: 'Customer ${customer_name} birthday is not today - no birthday campaign triggered',
            level: 'info'
          }
        }
      }
    ],
    peers: [
      {
        id: 'e53',
        source: 'start-10',
        target: 'condition-10',
        animated: true
      },
      {
        id: 'e54-yes',
        source: 'condition-10',
        target: 'action-31',
        source_handle: 'yes',
        animated: true,
        label: 'Yes'
      },
      {
        id: 'e55-yes',
        source: 'condition-10',
        target: 'action-32',
        source_handle: 'yes',
        animated: true,
        label: 'Yes'
      },
      {
        id: 'e56-yes',
        source: 'condition-10',
        target: 'action-33',
        source_handle: 'yes',
        animated: true,
        label: 'Yes'
      },
      {
        id: 'e57-no',
        source: 'condition-10',
        target: 'log-10',
        source_handle: 'no',
        animated: true,
        label: 'No'
      }
    ]
  },
   {
    id: 'sample-4',
    name: 'Weekly Inventory Low Stock Alert',
    description: 'Monitor inventory levels and notify staff of low stock items',
    trigger_type: 'schedule-based',
    status: 'draft',
    created_at: '2024-01-15T13:00:00Z',
    updated_at: '2024-01-15T13:00:00Z',
    actions: [
      {
        id: 'start-4',
        type: 'start',
        position: { x: 100, y: 300 },
        data: {
          label: 'Inventory Check Start',
          type: 'start',
          description: 'Starting point for inventory monitoring workflow',
          status: 'active',
          config: {
            label: 'Inventory Check Start',
            description: 'Starting point for inventory monitoring workflow',
            merchant_id: 'SHOP001',
            data_source: 'CRM',
            trigger_category: 'scheduled',
            schedule_time: '08:00',
            timezone: 'America/New_York',
            recurrence_pattern: 'weekly',
            schedule_type: 'recurring',
            day_of_week: 1,
            change_stream_enabled: false,
            collections: ['products']
          }
        }
      },
      {
        id: 'condition-4',
        type: 'condition',
        position: { x: 700, y: 300 },
        data: {
          label: 'Stock below threshold',
          type: 'condition',
          description: 'Items with inventory count less than 10 units',
          status: 'active',
          conditions: [
            {
              id: 'cond-4',
              data_source: 'CRM',
              collection: 'products',
              field: 'created_date',
              field_type: 'date',
              operator: 'date_before',
              value: '2024-01-01'
            }
          ]
        }
      },
      {
        id: 'action-7',
        type: 'action',
        position: { x: 1300, y: 200 },
        data: {
          label: 'Send webhook to inventory system',
          type: 'action',
          description: 'Notify external inventory management system',
          status: 'active',
          config: {
            webhook_url: 'https://inventory.example.com/api/low-stock',
            method: 'POST',
            include_product_details: true
          }
        }
      },
      {
        id: 'action-8',
        type: 'action',
        position: { x: 1300, y: 450 },
        data: {
          label: 'Email inventory manager',
          type: 'action',
          description: 'Weekly low stock report to operations team',
          status: 'active',
          config: {
            email_template: 'low-stock-report',
            recipients: ['inventory@company.com', 'operations@company.com']
          }
        }
      },
      {
        id: 'log-4',
        type: 'step',
        position: { x: 1300, y: 600 },
        data: {
          label: 'Log stock levels normal',
          type: 'step',
          description: 'Log when inventory levels are within acceptable range',
          status: 'active',
          config: {
            message: 'Weekly inventory check completed - all products have adequate stock levels',
            level: 'info'
          }
        }
      }
    ],
    peers: [
      {
        id: 'e10',
        source: 'start-4',
        target: 'condition-4',
        animated: true
      },
      {
        id: 'e11-yes',
        source: 'condition-4',
        target: 'action-7',
        source_handle: 'yes',
        animated: true,
        label: 'Yes'
      },
      {
        id: 'e12-yes',
        source: 'condition-4',
        target: 'action-8',
        source_handle: 'yes',
        animated: true,
        label: 'Yes'
      },
      {
        id: 'e13-no',
        source: 'condition-4',
        target: 'log-4',
        source_handle: 'no',
        animated: true,
        label: 'No'
      }
    ]
  },
  {
    id: 'sample-11',
    name: 'Customer Product Purchase Follow-up',
    description: 'Target customers who  bought specific product in past 30 days',
    trigger_type: 'event-based',
    status: 'active',
    created_at: '2024-01-16T14:00:00Z',
    updated_at: '2024-01-16T14:00:00Z',
    actions: [
      {
        id: 'start-11',
        type: 'start',
        position: { x: 100, y: 300 },
        data: {
          label: 'Order Processing Trigger',
          type: 'start',
          description: 'Triggers when a new order is processed',
          status: 'active',
          config: {
            label: 'Order Processing Trigger',
            description: 'Monitor new order events from CRM',
            merchant_id: 'SHOP001',
            data_source: 'CRM',
            trigger_category: 'event',
            event_type: 'order_created',
            change_stream_enabled: true,
            collections: ['orders', 'order_items', 'contacts']
          }
        }
      },
      {
        id: 'condition-11',
        type: 'condition',
        position: { x: 700, y: 300 },
        data: {
          label: 'Product PROD-XX123 in past 30 days',
          type: 'condition',
          description: 'Check if purchased specific product in past 30 days',
          status: 'active',
          conditions: [
            {
              id: 'cond-11a',
              data_source: 'CRM',
              collection: 'orders',
              field: 'created_date',
              field_type: 'date',
              operator: 'date_before',
              value: '30_days',
              date_type: 'relative',
              period_number: 30,
              period_unit: 'days',
              logical_operator: 'AND'
            },
            {
              id: 'cond-11b',
              data_source: 'CRM',
              collection: 'order_items',
              field: 'product_name',
              field_type: 'text',
              operator: 'equals',
              value: 'PROD-XX123'
            }
          ]
        }
      },
      {
        id: 'action-35',
        type: 'action',
        position: { x: 1300, y: 250 },
        data: {
          label: 'Send VIP email',
          type: 'action',
          description: 'Send detailed VIP program information email',
          status: 'active',
          config: {
            email_template: 'vip-program',
            subject: 'Welcome to VIP Program - Exclusive Benefits Await!',
            email_field: 'email',
            body: 'Dear ${customer_name}, congratulations on reaching VIP status with ${total_sales_30days} in purchases! You now have access to: priority support, exclusive discounts, early product access, and a dedicated account manager.',
            include_customer_data: true
          }
        }
      },        
      {
        id: 'log-11',
        type: 'step',
        position: { x: 1300, y: 700 },
        data: {
          label: 'Log conditions not met',
          type: 'step',
          description: 'Log when customer does not meet VIP criteria',
          status: 'active',
          config: {
            message: 'Customer ${customer_name} does not meet VIP criteria - Sales: ${total_sales_30days}, Product PROD-XX123 purchased: false',
            level: 'info'
          }
        }
      }
    ],
    peers: [
      {
        id: 'e58',
        source: 'start-11',
        target: 'condition-11',
        animated: true
      },
      {
        id: 'e60-yes',
        source: 'condition-11',
        target: 'action-35',
        source_handle: 'yes',
        animated: true,
        label: 'Yes'
      },  
      {
        id: 'e63-no',
        source: 'condition-11',
        target: 'log-11',
        source_handle: 'no',
        animated: true,
        label: 'No'
      }
    ]
  }  
];