import type { Workflow } from '../types/workflow.types';

export const sampleWorkflows: Workflow[] = [
  {
    id: 'sample-10',
    name: 'User Birthday Celebration',
    description: 'Send birthday greetings and special offers to customers on their birthday',
    triggerType: 'schedule-based',
    status: 'active',
    createdAt: '2024-01-16T09:00:00Z',
    updatedAt: '2024-01-16T09:00:00Z',
    nodes: [
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
            merchantId: 'SHOP001',
            dataSource: 'CRM',
            triggerCategory: 'scheduled',
            scheduleTime: '09:00',
            timezone: 'Asia/Bangkok',
            recurrencePattern: 'daily',
            scheduleType: 'recurring',
            changeStreamEnabled: false,
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
              dataSource: 'CRM',
              collection: 'contacts',
              field: 'birthday',
              fieldType: 'date',
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
            emailTemplate: 'birthday-wishes',
            subject: 'Happy Birthday ${customer_name}! 🎂',
            emailField: 'email',
            body: 'Dear ${customer_name}, wishing you a wonderful birthday! Enjoy 30% off with code BDAY30 - valid for 7 days.',
            discountCode: 'BDAY30',
            includeCustomerData: true
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
            lineUserId: 'line_user_id',
            includeCustomerData: true,
            imageUrl: 'https://example.com/images/birthday-celebration.png'
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
            updateCustomerProfile: true
          }
        }
      }
    ],
    edges: [
      {
        id: 'e53',
        source: 'start-10',
        target: 'condition-10',
        animated: true
      },
      {
        id: 'e54-then',
        source: 'condition-10',
        target: 'action-31',
        sourceHandle: 'then',
        animated: true,
        label: 'Then'
      },
      {
        id: 'e55-then',
        source: 'condition-10',
        target: 'action-32',
        sourceHandle: 'then',
        animated: true,
        label: 'Then'
      },
      {
        id: 'e56-then',
        source: 'condition-10',
        target: 'action-33',
        sourceHandle: 'then',
        animated: true,
        label: 'Then'
      }
    ]
  },
  {
    id: 'sample-7',
    name: 'Simple Points Milestone Notification',
    description: 'Send LINE notification when customer points exceed 1000',
    triggerType: 'event-based',
    status: 'active',
    createdAt: '2024-01-16T11:00:00Z',
    updatedAt: '2024-01-16T11:00:00Z',
    nodes: [
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
            merchantId: 'SHOP001',
            dataSource: 'CRM',
            triggerCategory: 'event',
            eventType: 'points_updated',
            changeStreamEnabled: true,
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
              dataSource: 'CRM',
              collection: 'contacts',
              field: 'points_balance',
              fieldType: 'number',
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
            lineUserId: 'line_user_id',
            includeCustomerData: true
          }
        }
      }
    ],
    edges: [
      {
        id: 'e45',
        source: 'start-7',
        target: 'condition-7',
        animated: true
      },
      {
        id: 'e46-then',
        source: 'condition-7',
        target: 'action-26',
        sourceHandle: 'then',
        animated: true,
        label: 'Then'
      }
    ]
  },
  {
    id: 'sample-6',
    name: 'Points Balance Exceeds Threshold',
    description: 'Automatically trigger rewards and notifications when customer points balance exceeds defined thresholds',
    triggerType: 'event-based',
    status: 'active',
    createdAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-01-16T10:00:00Z',
    nodes: [
      {
        id: 'start-6',
        type: 'start',
        position: { x: 100, y: 400 },
        data: {
          label: 'Points Balance Monitor',
          type: 'start',
          description: 'Monitor customer points balance changes in real-time',
          status: 'active',
          config: {
            label: 'Points Balance Monitor',
            description: 'Triggers when customer points balance is updated',
            merchantId: 'SHOP001',
            dataSource: 'CRM',
            triggerCategory: 'event',
            eventType: 'points_updated',
            changeStreamEnabled: true,
            collections: ['contacts', 'loyalty_points']
          }
        }
      },
      {
        id: 'condition-6a',
        type: 'condition',
        position: { x: 700, y: 200 },
        data: {
          label: 'Points >= 1000 (Silver)',
          type: 'condition',
          description: 'Check if points balance reached Silver tier (1000 points)',
          status: 'active',
          conditions: [
            {
              id: 'cond-6a1',
              dataSource: 'CRM',
              collection: 'contacts',
              field: 'points_balance',
              fieldType: 'number',
              operator: 'greater_equal',
              value: 1000
            },
            {
              id: 'cond-6a2',
              dataSource: 'CRM',
              collection: 'contacts',
              field: 'points_balance',
              fieldType: 'number',
              operator: 'less_than',
              value: 5000,
              logicalOperator: 'AND'
            }
          ]
        }
      },
      {
        id: 'condition-6b',
        type: 'condition',
        position: { x: 700, y: 400 },
        data: {
          label: 'Points >= 5000 (Gold)',
          type: 'condition',
          description: 'Check if points balance reached Gold tier (5000 points)',
          status: 'active',
          conditions: [
            {
              id: 'cond-6b1',
              dataSource: 'CRM',
              collection: 'contacts',
              field: 'points_balance',
              fieldType: 'number',
              operator: 'greater_equal',
              value: 5000
            },
            {
              id: 'cond-6b2',
              dataSource: 'CRM',
              collection: 'contacts',
              field: 'points_balance',
              fieldType: 'number',
              operator: 'less_than',
              value: 10000,
              logicalOperator: 'AND'
            }
          ]
        }
      },
      {
        id: 'condition-6c',
        type: 'condition',
        position: { x: 700, y: 600 },
        data: {
          label: 'Points >= 10000 (Platinum)',
          type: 'condition',
          description: 'Check if points balance reached Platinum tier (10000 points)',
          status: 'active',
          conditions: [
            {
              id: 'cond-6c1',
              dataSource: 'CRM',
              collection: 'contacts',
              field: 'points_balance',
              fieldType: 'number',
              operator: 'greater_equal',
              value: 10000
            }
          ]
        }
      },
      {
        id: 'action-15',
        type: 'action',
        position: { x: 1300, y: 50 },
        data: {
          label: 'Send Silver tier email',
          type: 'action',
          description: 'Congratulate customer on reaching Silver tier',
          status: 'active',
          config: {
            emailTemplate: 'silver-tier-achievement',
            subject: 'Congratulations! You\'ve reached Silver status',
            emailField: 'email',
            includeCustomerData: true,
            body: 'Hi ${customer_name}, you now have ${points_balance} points! Enjoy 10% off your next purchase with code SILVER10.'
          }
        }
      },
      {
        id: 'action-16',
        type: 'action',
        position: { x: 1300, y: 200 },
        data: {
          label: 'Add Silver tier tags',
          type: 'action',
          description: 'Update customer profile with Silver tier status',
          status: 'active',
          config: {
            tags: ['Silver Tier', 'Loyalty Member', 'Points Milestone 1K'],
            updateCustomerProfile: true,
            removeOldTierTags: true
          }
        }
      },
      {
        id: 'action-17',
        type: 'action',
        position: { x: 1300, y: 300 },
        data: {
          label: 'Send Gold tier email',
          type: 'action',
          description: 'Congratulate customer on reaching Gold tier',
          status: 'active',
          config: {
            emailTemplate: 'gold-tier-achievement',
            subject: 'Amazing! You\'ve reached Gold status',
            emailField: 'email',
            includeCustomerData: true,
            body: 'Hi ${customer_name}, with ${points_balance} points, you\'re now a Gold member! Enjoy 15% off and free shipping with code GOLD15.'
          }
        }
      },
      {
        id: 'action-18',
        type: 'action',
        position: { x: 1300, y: 450 },
        data: {
          label: 'Send Gold SMS notification',
          type: 'action',
          description: 'SMS notification for Gold tier achievement',
          status: 'active',
          config: {
            template: '🎉 ${customer_name}, you\'ve reached GOLD status with ${points_balance} points! Use GOLD15 for 15% off + free shipping.',
            phoneField: 'phone_number',
            includeCustomerData: true
          }
        }
      },
      {
        id: 'action-19',
        type: 'action',
        position: { x: 1300, y: 550 },
        data: {
          label: 'Send Platinum tier email',
          type: 'action',
          description: 'VIP congratulations for Platinum tier',
          status: 'active',
          config: {
            emailTemplate: 'platinum-tier-achievement',
            subject: 'Welcome to Platinum - Our VIP tier!',
            emailField: 'email',
            includeCustomerData: true,
            body: 'Dear ${customer_name}, with ${points_balance} points, you\'re now a Platinum VIP member! Enjoy 20% off, free express shipping, and exclusive early access.',
            priority: 'high'
          }
        }
      },
      {
        id: 'action-20',
        type: 'action',
        position: { x: 1300, y: 700 },
        data: {
          label: 'Send LINE VIP notification',
          type: 'action',
          description: 'Exclusive LINE message for Platinum members',
          status: 'active',
          config: {
            message: '👑 ${customer_name}, welcome to PLATINUM VIP! You have ${points_balance} points. Enjoy exclusive benefits: 20% off everything, free express shipping, early access to sales!',
            lineUserId: 'line_user_id',
            includeCustomerData: true,
            imageUrl: 'https://example.com/images/platinum-vip.png',
            richMenu: 'platinum-benefits'
          }
        }
      },
      {
        id: 'action-21',
        type: 'action',
        position: { x: 1300, y: 850 },
        data: {
          label: 'Trigger VIP webhook',
          type: 'action',
          description: 'Notify CRM and fulfillment systems of VIP status',
          status: 'active',
          config: {
            url: 'https://api.company.com/loyalty/vip-status',
            method: 'POST',
            headers: {
              'Authorization': 'Bearer ${api_token}',
              'Content-Type': 'application/json'
            },
            payload: {
              customerId: '${customer_id}',
              tier: 'platinum',
              points: '${points_balance}',
              benefits: ['20_percent_discount', 'free_express_shipping', 'early_access'],
              timestamp: '${current_timestamp}'
            }
          }
        }
      },
      {
        id: 'step-3',
        type: 'step',
        position: { x: 1700, y: 125 },
        data: {
          label: 'Log tier achievement',
          type: 'step',
          description: 'Record tier achievement in system logs',
          status: 'active',
          config: {
            message: 'Customer ${customer_id} reached ${tier_name} tier with ${points_balance} points',
            level: 'info',
            includeTimestamp: true,
            category: 'loyalty-milestones'
          }
        }
      },
      {
        id: 'action-22',
        type: 'action',
        position: { x: 1700, y: 375 },
        data: {
          label: 'Add Gold tier tags',
          type: 'action',
          description: 'Update customer profile with Gold tier status',
          status: 'active',
          config: {
            tags: ['Gold Tier', 'Loyalty Member', 'Points Milestone 5K', 'Free Shipping Eligible'],
            updateCustomerProfile: true,
            removeOldTierTags: true
          }
        }
      },
      {
        id: 'action-23',
        type: 'action',
        position: { x: 1700, y: 700 },
        data: {
          label: 'Add Platinum VIP tags',
          type: 'action',
          description: 'Update customer profile with Platinum VIP status',
          status: 'active',
          config: {
            tags: ['Platinum VIP', 'Top Tier', 'Points Milestone 10K', 'Priority Support', 'Early Access'],
            updateCustomerProfile: true,
            removeOldTierTags: true,
            vipFlag: true
          }
        }
      },
      {
        id: 'condition-6d',
        type: 'condition',
        position: { x: 2100, y: 400 },
        data: {
          label: 'First time reaching tier?',
          type: 'condition',
          description: 'Check if this is the first time customer reached this tier',
          status: 'active',
          conditions: [
            {
              id: 'cond-6d1',
              dataSource: 'CRM',
              collection: 'contacts',
              field: 'tier_achievement_count',
              fieldType: 'number',
              operator: 'equals',
              value: 1
            }
          ]
        }
      },
      {
        id: 'action-24',
        type: 'action',
        position: { x: 2500, y: 250 },
        data: {
          label: 'Send special bonus reward',
          type: 'action',
          description: 'One-time bonus for first tier achievement',
          status: 'active',
          config: {
            emailTemplate: 'first-tier-bonus',
            subject: 'Special bonus reward for your achievement!',
            bonusPoints: 500,
            couponCode: 'FIRSTTIER',
            validityDays: 30
          }
        }
      },
      {
        id: 'step-4',
        type: 'step',
        position: { x: 2500, y: 550 },
        data: {
          label: 'Wait 24 hours',
          type: 'step',
          description: 'Wait before sending follow-up engagement',
          status: 'active',
          config: {
            duration: 24,
            unit: 'hours'
          }
        }
      },
      {
        id: 'action-25',
        type: 'action',
        position: { x: 2900, y: 400 },
        data: {
          label: 'Send tier benefits guide',
          type: 'action',
          description: 'Educational email about tier benefits and how to use them',
          status: 'active',
          config: {
            emailTemplate: 'tier-benefits-guide',
            subject: 'How to make the most of your ${tier_name} benefits',
            includeCustomerData: true,
            attachPDF: true,
            pdfUrl: 'https://example.com/benefits/${tier_name}-guide.pdf'
          }
        }
      }
    ],
    edges: [
      {
        id: 'e25',
        source: 'start-6',
        target: 'condition-6a',
        animated: true
      },
      {
        id: 'e26',
        source: 'start-6',
        target: 'condition-6b',
        animated: true
      },
      {
        id: 'e27',
        source: 'start-6',
        target: 'condition-6c',
        animated: true
      },
      {
        id: 'e28-then',
        source: 'condition-6a',
        target: 'action-15',
        sourceHandle: 'then',
        animated: true,
        label: 'Then'
      },
      {
        id: 'e29-then',
        source: 'condition-6a',
        target: 'action-16',
        sourceHandle: 'then',
        animated: true,
        label: 'Then'
      },
      {
        id: 'e30-then',
        source: 'condition-6b',
        target: 'action-17',
        sourceHandle: 'then',
        animated: true,
        label: 'Then'
      },
      {
        id: 'e31-then',
        source: 'condition-6b',
        target: 'action-18',
        sourceHandle: 'then',
        animated: true,
        label: 'Then'
      },
      {
        id: 'e32-then',
        source: 'condition-6c',
        target: 'action-19',
        sourceHandle: 'then',
        animated: true,
        label: 'Then'
      },
      {
        id: 'e33-then',
        source: 'condition-6c',
        target: 'action-20',
        sourceHandle: 'then',
        animated: true,
        label: 'Then'
      },
      {
        id: 'e34-then',
        source: 'condition-6c',
        target: 'action-21',
        sourceHandle: 'then',
        animated: true,
        label: 'Then'
      },
      {
        id: 'e35',
        source: 'action-16',
        target: 'step-3',
        animated: true
      },
      {
        id: 'e36',
        source: 'action-18',
        target: 'action-22',
        animated: true
      },
      {
        id: 'e37',
        source: 'action-22',
        target: 'step-3',
        animated: true
      },
      {
        id: 'e38',
        source: 'action-21',
        target: 'action-23',
        animated: true
      },
      {
        id: 'e39',
        source: 'action-23',
        target: 'step-3',
        animated: true
      },
      {
        id: 'e40',
        source: 'step-3',
        target: 'condition-6d',
        animated: true
      },
      {
        id: 'e41-then',
        source: 'condition-6d',
        target: 'action-24',
        sourceHandle: 'then',
        animated: true,
        label: 'Then'
      },
      {
        id: 'e42-otherwise',
        source: 'condition-6d',
        target: 'step-4',
        sourceHandle: 'otherwise',
        animated: true,
        label: 'Otherwise'
      },
      {
        id: 'e43',
        source: 'action-24',
        target: 'step-4',
        animated: true
      },
      {
        id: 'e44',
        source: 'step-4',
        target: 'action-25',
        animated: true
      }
    ]
  },
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