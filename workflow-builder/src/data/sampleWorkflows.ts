import type { Workflow } from '../types/workflow.types';

export const sampleWorkflows: Workflow[] = [
  {
    id: 'sample-1',
    name: 'High Value Customer Follow-up',
    description: 'Automatically send SMS to customers who place orders over $500',
    triggerType: 'event-based',
    status: 'draft',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    nodes: [
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
            merchantId: 'SHOP001',
            dataSource: 'CRM'
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
              dataSource: 'CRM',
              collection: 'orders',
              field: 'grand_total',
              fieldType: 'number',
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
            smsTemplate: 'Thank you for your ${order_total} order! As a valued customer, enjoy 10% off your next purchase.',
            delayMinutes: 0
          }
        }
      },
      {
        id: 'action-2',
        type: 'action',
        position: { x: 1300, y: 450 },
        data: {
          label: 'Add to VIP segment',
          type: 'action',
          description: 'Tag customer as VIP for future campaigns',
          status: 'active',
          config: {
            tags: ['VIP', 'High Value Customer'],
            updateCustomerProfile: true
          }
        }
      }
    ],
    edges: [
      {
        id: 'e1',
        source: 'start-1',
        target: 'condition-1',
        animated: true
      },
      {
        id: 'e2-then',
        source: 'condition-1',
        target: 'action-1',
        sourceHandle: 'then',
        animated: true,
        label: 'Then'
      },
      {
        id: 'e3-then',
        source: 'condition-1',
        target: 'action-2',
        sourceHandle: 'then',
        animated: true,
        label: 'Then'
      }
    ]
  },
  {
    id: 'sample-2',
    name: 'Daily Abandoned Cart Recovery',
    description: 'Send email reminders for abandoned carts every day at 2 PM',
    triggerType: 'schedule-based',
    status: 'draft',
    createdAt: '2024-01-15T11:00:00Z',
    updatedAt: '2024-01-15T11:00:00Z',
    nodes: [
      {
        id: 'start-2',
        type: 'start',
        position: { x: 100, y: 300 },
        data: {
          label: 'Cart Recovery Start',
          type: 'start',
          description: 'Starting point for cart recovery campaign',
          status: 'active',
          config: {
            label: 'Cart Recovery Start',
            description: 'Starting point for cart recovery campaign',
            merchantId: 'SHOP001',
            dataSource: 'CRM',
            triggerCategory: 'scheduled',
            scheduleTime: '14:00',
            timezone: 'America/New_York',
            recurrencePattern: 'daily',
            scheduleType: 'recurring',
            changeStreamEnabled: false,
            collections: ['orders']
          }
        }
      },
      {
        id: 'condition-2',
        type: 'condition',
        position: { x: 700, y: 300 },
        data: {
          label: 'Cart abandoned > 24 hours',
          type: 'condition',
          description: 'Find carts abandoned more than 24 hours ago',
          status: 'active',
          conditions: [
            {
              id: 'cond-2a',
              dataSource: 'CRM',
              collection: 'orders',
              field: 'status',
              fieldType: 'select',
              operator: 'equals',
              value: 'cancelled',
              selectOptions: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
            },
            {
              id: 'cond-2b',
              dataSource: 'CRM',
              collection: 'orders',
              field: 'updated_date',
              fieldType: 'date',
              operator: 'date_before',
              value: '2024-01-14',
              logicalOperator: 'AND'
            }
          ]
        }
      },
      {
        id: 'action-3',
        type: 'action',
        position: { x: 1300, y: 300 },
        data: {
          label: 'Send recovery email',
          type: 'action',
          description: 'Email with cart contents and discount code',
          status: 'active',
          config: {
            emailTemplate: 'cart-recovery',
            subject: 'Complete your purchase and save 15%',
            discountCode: 'SAVE15'
          }
        }
      }
    ],
    edges: [
      {
        id: 'e4',
        source: 'start-2',
        target: 'condition-2',
        animated: true
      },
      {
        id: 'e5-then',
        source: 'condition-2',
        target: 'action-3',
        sourceHandle: 'then',
        animated: true,
        label: 'Then'
      }
    ]
  },
  {
    id: 'sample-3',
    name: 'New Customer Welcome Series',
    description: 'Multi-step onboarding for first-time customers',
    triggerType: 'event-based',
    status: 'draft',
    createdAt: '2024-01-15T12:00:00Z',
    updatedAt: '2024-01-15T12:00:00Z',
    nodes: [
      {
        id: 'start-3',
        type: 'start',
        position: { x: 100, y: 400 },
        data: {
          label: 'Customer Onboarding Start',
          type: 'start',
          description: 'Starting point for new customer welcome series',
          status: 'active',
          config: {
            label: 'Customer Onboarding Start',
            description: 'Starting point for new customer welcome series',
            merchantId: 'SHOP001',
            dataSource: 'CRM'
          }
        }
      },
      {
        id: 'condition-3',
        type: 'condition',
        position: { x: 700, y: 400 },
        data: {
          label: 'First-time customer',
          type: 'condition',
          description: 'Check if this is their first account creation',
          status: 'active',
          conditions: [
            {
              id: 'cond-3',
              dataSource: 'CRM',
              collection: 'contacts',
              field: 'total_order',
              fieldType: 'number',
              operator: 'equals',
              value: 0
            }
          ]
        }
      },
      {
        id: 'action-4',
        type: 'action',
        position: { x: 1300, y: 250 },
        data: {
          label: 'Send welcome email',
          type: 'action',
          description: 'Immediate welcome message with brand introduction',
          status: 'active',
          config: {
            emailTemplate: 'welcome-new-customer',
            delayMinutes: 0
          }
        }
      },
      {
        id: 'action-5',
        type: 'action',
        position: { x: 1300, y: 400 },
        data: {
          label: 'Send discount code',
          type: 'action',
          description: '20% off first order (sent 2 hours later)',
          status: 'active',
          config: {
            emailTemplate: 'first-order-discount',
            discountCode: 'WELCOME20',
            delayMinutes: 120
          }
        }
      },
      {
        id: 'action-6',
        type: 'action',
        position: { x: 1300, y: 600 },
        data: {
          label: 'Add welcome tags',
          type: 'action',
          description: 'Tag for segmentation and follow-up campaigns',
          status: 'active',
          config: {
            tags: ['New Customer', 'Welcome Series'],
            updateCustomerProfile: true
          }
        }
      }
    ],
    edges: [
      {
        id: 'e6',
        source: 'start-3',
        target: 'condition-3',
        animated: true
      },
      {
        id: 'e7-then',
        source: 'condition-3',
        target: 'action-4',
        sourceHandle: 'then',
        animated: true,
        label: 'Then'
      },
      {
        id: 'e8-then',
        source: 'condition-3',
        target: 'action-5',
        sourceHandle: 'then',
        animated: true,
        label: 'Then'
      },
      {
        id: 'e9-then',
        source: 'condition-3',
        target: 'action-6',
        sourceHandle: 'then',
        animated: true,
        label: 'Then'
      }
    ]
  },
  {
    id: 'sample-4',
    name: 'Weekly Inventory Low Stock Alert',
    description: 'Monitor inventory levels and notify staff of low stock items',
    triggerType: 'schedule-based',
    status: 'draft',
    createdAt: '2024-01-15T13:00:00Z',
    updatedAt: '2024-01-15T13:00:00Z',
    nodes: [
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
            merchantId: 'SHOP001',
            dataSource: 'CRM',
            triggerCategory: 'scheduled',
            scheduleTime: '08:00',
            timezone: 'America/New_York',
            recurrencePattern: 'weekly',
            scheduleType: 'recurring',
            dayOfWeek: 1,
            changeStreamEnabled: false,
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
              dataSource: 'CRM',
              collection: 'products',
              field: 'created_date',
              fieldType: 'date',
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
            webhookUrl: 'https://inventory.example.com/api/low-stock',
            method: 'POST',
            includeProductDetails: true
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
            emailTemplate: 'low-stock-report',
            recipients: ['inventory@company.com', 'operations@company.com']
          }
        }
      }
    ],
    edges: [
      {
        id: 'e10',
        source: 'start-4',
        target: 'condition-4',
        animated: true
      },
      {
        id: 'e11-then',
        source: 'condition-4',
        target: 'action-7',
        sourceHandle: 'then',
        animated: true,
        label: 'Then'
      },
      {
        id: 'e12-then',
        source: 'condition-4',
        target: 'action-8',
        sourceHandle: 'then',
        animated: true,
        label: 'Then'
      }
    ]
  },
  {
    id: 'sample-5',
    name: 'Customer Engagement Weekly Review',
    description: 'Comprehensive weekly customer engagement analysis and follow-up actions - runs every Monday at 9:00 AM',
    triggerType: 'schedule-based',
    status: 'active',
    createdAt: '2024-01-15T14:00:00Z',
    updatedAt: '2024-01-15T14:00:00Z',
    nodes: [
      {
        id: 'start-5',
        type: 'start',
        position: { x: 100, y: 400 },
        data: {
          label: 'Weekly Review Scheduler',
          type: 'start',
          description: 'Scheduled weekly customer engagement analysis',
          status: 'active',
          config: {
            label: 'Weekly Review Scheduler',
            description: 'Automated weekly customer engagement analysis and follow-up',
            merchantId: 'SHOP001',
            dataSource: 'CRM',
            triggerCategory: 'scheduled',
            scheduleTime: '09:00',
            timezone: 'America/New_York',
            recurrencePattern: 'weekly',
            scheduleType: 'recurring',
            dayOfWeek: 1,
            changeStreamEnabled: false,
            collections: ['customers', 'orders', 'products']
          }
        }
      },
      {
        id: 'condition-5a',
        type: 'condition',
        position: { x: 700, y: 200 },
        data: {
          label: 'High-value inactive customers',
          type: 'condition',
          description: 'Customers with >$1000 lifetime value but no orders in 30 days',
          status: 'active',
          conditions: [
            {
              id: 'cond-5a1',
              dataSource: 'CRM',
              collection: 'contacts',
              field: 'review_rate',
              fieldType: 'number',
              operator: 'greater_than',
              value: 1000
            },
            {
              id: 'cond-5a2',
              dataSource: 'CRM',
              collection: 'contacts',
              field: 'last_order_date',
              fieldType: 'date',
              operator: 'date_before',
              value: '2024-01-15',
              logicalOperator: 'AND'
            }
          ]
        }
      },
      {
        id: 'condition-5b',
        type: 'condition',
        position: { x: 700, y: 600 },
        data: {
          label: 'Recent customers without reviews',
          type: 'condition',
          description: 'Customers who made purchases in last 14 days but haven\'t left reviews',
          status: 'active',
          conditions: [
            {
              id: 'cond-5b1',
              dataSource: 'CRM',
              collection: 'orders',
              field: 'created_date',
              fieldType: 'date',
              operator: 'date_after',
              value: '2024-01-01'
            },
            {
              id: 'cond-5b2',
              dataSource: 'CRM',
              collection: 'contacts',
              field: 'review_count',
              fieldType: 'number',
              operator: 'equals',
              value: 0,
              logicalOperator: 'AND'
            }
          ]
        }
      },
      {
        id: 'action-9',
        type: 'action',
        position: { x: 1400, y: 50 },
        data: {
          label: 'Send VIP re-engagement email',
          type: 'action',
          description: 'Personalized email with exclusive offers for high-value customers',
          status: 'active',
          config: {
            emailTemplate: 'vip-reengagement',
            subject: 'We miss you! Here\'s 25% off your next order',
            campaignTemplate: 'high-value-winback',
            emailField: 'email',
            includeCustomerData: true,
            discountCode: 'VIP25',
            validUntil: '2024-02-15'
          }
        }
      },
      {
        id: 'action-10',
        type: 'action',
        position: { x: 1400, y: 250 },
        data: {
          label: 'Create personalized SMS campaign',
          type: 'action',
          description: 'SMS with product recommendations based on purchase history',
          status: 'active',
          config: {
            template: 'Hi ${customer_name}! We\'ve curated some products just for you based on your ${last_category} purchases. Check them out with 25% off: ${discount_link}',
            phoneField: 'phone_number',
            includeCustomerData: true,
            delayMinutes: 60
          }
        }
      },
      {
        id: 'step-1',
        type: 'step',
        position: { x: 1900, y: 150 },
        data: {
          label: 'Wait for engagement',
          type: 'step',
          description: 'Wait 48 hours to see if customer engages with campaigns',
          status: 'active',
          config: {
            duration: 48,
            unit: 'hours'
          }
        }
      },
      {
        id: 'action-11',
        type: 'action',
        position: { x: 1400, y: 500 },
        data: {
          label: 'Send review request email',
          type: 'action',
          description: 'Follow-up email requesting product reviews with incentive',
          status: 'active',
          config: {
            emailTemplate: 'review-request',
            subject: 'How was your recent purchase? Get 10% off your next order',
            campaignTemplate: 'review-incentive',
            emailField: 'email',
            includeCustomerData: true,
            discountCode: 'REVIEW10'
          }
        }
      },
      {
        id: 'action-12',
        type: 'action',
        position: { x: 1400, y: 700 },
        data: {
          label: 'Send LINE review reminder',
          type: 'action',
          description: 'Friendly LINE message with direct link to review page',
          status: 'active',
          config: {
            message: 'Hi ${customer_name}! 😊 We hope you\'re loving your recent purchase. Would you mind sharing a quick review? Here\'s your personal review link: ${review_link}',
            lineUserId: 'line_user_id',
            includeCustomerData: true,
            imageUrl: 'https://example.com/images/review-reminder.png'
          }
        }
      },
      {
        id: 'action-13',
        type: 'action',
        position: { x: 1900, y: 550 },
        data: {
          label: 'Update customer segments',
          type: 'action',
          description: 'Add appropriate tags based on campaign responses',
          status: 'active',
          config: {
            tags: ['Weekly Review', 'Engagement Campaign', '2024-Q1'],
            dataSource: 'crm',
            updateCustomerProfile: true,
            segmentLogic: 'dynamic'
          }
        }
      },
      {
        id: 'action-14',
        type: 'action',
        position: { x: 2400, y: 150 },
        data: {
          label: 'Send report webhook',
          type: 'action',
          description: 'Send campaign results to external analytics system',
          status: 'active',
          config: {
            url: 'https://analytics.company.com/api/campaign-results',
            method: 'POST',
            includeCustomerData: false,
            headers: {
              'Authorization': 'Bearer ${api_token}',
              'Content-Type': 'application/json',
              'X-Campaign-Type': 'weekly-engagement-review'
            },
            payload: {
              campaignId: 'weekly-review-${date}',
              metrics: true,
              summary: true
            }
          }
        }
      },
      {
        id: 'step-2',
        type: 'step',
        position: { x: 2400, y: 550 },
        data: {
          label: 'Log campaign completion',
          type: 'step',
          description: 'Record completion in system logs for audit trail',
          status: 'active',
          config: {
            message: 'Weekly customer engagement review completed successfully. High-value customers: ${high_value_count}, Review requests: ${review_request_count}, Total processed: ${total_customers}',
            level: 'info',
            includeTimestamp: true,
            includeMetrics: true
          }
        }
      }
    ],
    edges: [
      {
        id: 'e13',
        source: 'start-5',
        target: 'condition-5a',
        animated: true
      },
      {
        id: 'e14',
        source: 'start-5',
        target: 'condition-5b',
        animated: true
      },
      {
        id: 'e15-then',
        source: 'condition-5a',
        target: 'action-9',
        sourceHandle: 'then',
        animated: true,
        label: 'Then'
      },
      {
        id: 'e16-then',
        source: 'condition-5a',
        target: 'action-10',
        sourceHandle: 'then',
        animated: true,
        label: 'Then'
      },
      {
        id: 'e17',
        source: 'action-9',
        target: 'step-1',
        animated: true
      },
      {
        id: 'e18',
        source: 'action-10',
        target: 'step-1',
        animated: true
      },
      {
        id: 'e19-then',
        source: 'condition-5b',
        target: 'action-11',
        sourceHandle: 'then',
        animated: true,
        label: 'Then'
      },
      {
        id: 'e20-then',
        source: 'condition-5b',
        target: 'action-12',
        sourceHandle: 'then',
        animated: true,
        label: 'Then'
      },
      {
        id: 'e21',
        source: 'action-11',
        target: 'action-13',
        animated: true
      },
      {
        id: 'e22',
        source: 'action-12',
        target: 'action-13',
        animated: true
      },
      {
        id: 'e23',
        source: 'step-1',
        target: 'action-14',
        animated: true
      },
      {
        id: 'e24',
        source: 'action-13',
        target: 'step-2',
        animated: true
      }
    ]
  }
];