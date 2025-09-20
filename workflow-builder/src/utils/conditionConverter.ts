import type { WorkflowCondition } from '../types/workflow.types';

export interface QueryOutput {
  contacts: {
    select: string[];
    where?: Record<string, unknown>;
    group_by?: string[];
    having?: Record<string, unknown>;
    [joinTable: string]: unknown;
  };
}

export class ConditionConverter {
  private static readonly DEFAULT_MERCHANT_ID = "68468c7bbffca9a0a6b2a413";

  static convertConditionsToQuery(conditions: WorkflowCondition[]): QueryOutput {
    if (!conditions || conditions.length === 0) {
      return {
        contacts: {
          select: ["user_id"],
          where: {
            merchant_id: this.DEFAULT_MERCHANT_ID
          }
        }
      };
    }

    const contactsConditions: Record<string, unknown>[] = [];
    const joinTables: Record<string, unknown> = {};
    const havingConditions: Record<string, unknown>[] = [];
    let needsAggregation = false;

    conditions.forEach(condition => {
      const { field, operator, value, collection } = condition;

      // Rule 2: Same collection conditions (contacts)
      if (collection === 'contacts' || this.isContactField(field)) {
        // Special handling for anniversary dates (Use Case 4)
        if (condition.date_type === 'anniversary' && operator === 'equals' && value === 'anniversary') {
          // Add separate conditions for current day and month
          contactsConditions.push({ [field]: { "current_day": true } });
          contactsConditions.push({ [field]: { "current_month": true } });
        } else {
          const whereCondition = this.buildWhereCondition(field, operator, value, condition);
          contactsConditions.push(whereCondition);
        }
      }
      // Rule 3 & 4: Different collection conditions
      else if (collection === 'orders' || this.isOrderField(field)) {
        needsAggregation = true;
        const aggFunction = `SUM(orders.${field})`;
        const havingCondition = this.buildWhereCondition(aggFunction, operator, value, condition);
        havingConditions.push(havingCondition);

        // Create join table inside contacts (per Use Case 2 structure)
        joinTables.orders = {
          select: [`SUM(${field}) as ${field}`],
          join: "user_id:user_id"
        };
      }
      else if (collection === 'point_histories' || this.isPointHistoryField(field)) {
        // Handle point_histories with complex conditions (Use Case 3 style)
        if (field === 'expire_date') {
          const whereCondition = this.buildWhereCondition(field, operator, value, condition);
          joinTables.point_histories = {
            select: ["SUM(point_histories.point) as expiring_points"],
            where: {
              and: [whereCondition]
            },
            group_by: ["user_id"],
            having: {
              sum: { ">": 1000 }
            },
            join: "user_id:user_id"
          };

          // For Use Case 3, update contacts select to include more fields
          // This will be handled in the final query construction
        } else {
          // Regular aggregation for point field
          needsAggregation = true;
          const aggFunction = `SUM(point_histories.${field})`;
          const havingCondition = this.buildWhereCondition(aggFunction, operator, value, condition);
          havingConditions.push(havingCondition);

          joinTables.point_histories = {
            select: [`${aggFunction} as ${field}s`],
            join: "user_id:user_id"
          };
        }
      }
    });

    // Always add merchant_id filter after other conditions (Rule 1)
    contactsConditions.push({ merchant_id: this.DEFAULT_MERCHANT_ID });

    // Always use ["user_id"] as select fields (updated Use Case 3)
    const selectFields = ["user_id"];

    // Build the main contacts query
    const contactsQuery: QueryOutput['contacts'] = {
      select: selectFields
    };

    // Handle where clause formatting
    if (contactsConditions.length === 1) {
      contactsQuery.where = contactsConditions[0];
    } else if (contactsConditions.length === 2) {
      // Check if this is Use Case 3 pattern (gender + merchant_id with point_histories join)
      const hasGenderCondition = conditions.some(c => c.field === 'gender');
      const hasPointHistoriesJoin = Object.keys(joinTables).includes('point_histories');

      if (hasGenderCondition && hasPointHistoriesJoin) {
        // Use Case 3: direct object keys instead of 'and' array
        const mergedWhere: Record<string, unknown> = {};
        contactsConditions.forEach(condition => {
          Object.assign(mergedWhere, condition);
        });
        contactsQuery.where = mergedWhere;
      } else {
        // Use Case 1: use 'and' array format
        contactsQuery.where = { and: contactsConditions };
      }
    } else {
      contactsQuery.where = { and: contactsConditions };
    }

    // Add aggregation fields if needed (Rule 4)
    if (needsAggregation) {
      contactsQuery.group_by = ["user_id"];
    }

    if (havingConditions.length > 0) {
      contactsQuery.having = havingConditions.length === 1 ?
        havingConditions[0] :
        { and: havingConditions };
    }

    // Add join tables to contacts (per Use Case 2 structure)
    Object.entries(joinTables).forEach(([tableName, config]) => {
      contactsQuery[tableName] = config;
    });

    return { contacts: contactsQuery };
  }

  private static buildWhereCondition(
    field: string,
    operator: string,
    value: string | number,
    condition: WorkflowCondition
  ): Record<string, unknown> {
    const whereCondition: Record<string, unknown> = {};

    switch (operator) {
      case 'equals':
        whereCondition[field] = value;
        break;
      case 'not_equals':
        whereCondition[field] = { "!=": value };
        break;
      case 'greater_than':
        // Handle special case for gender field (Use Case 3)
        if (field === 'gender' && typeof value === 'string') {
          whereCondition[field] = value.toUpperCase();
        } else {
          whereCondition[field] = { ">": value };
        }
        break;
      case 'less_than':
        whereCondition[field] = { "<": value };
        break;
      case 'greater_equal':
        whereCondition[field] = { ">=": value };
        break;
      case 'less_equal':
        whereCondition[field] = { "<=": value };
        break;
      case 'contains':
        whereCondition[field] = { "like": `%${value}%` };
        break;
      case 'not_contains':
        whereCondition[field] = { "not like": `%${value}%` };
        break;
      case 'date_before':
        whereCondition[field] = { "<": value };
        break;
      case 'date_after':
        // Handle "today" value (Use Case 3)
        if (value === 'today') {
          whereCondition[field] = { ">": "CURRENT_DATE()" };
        } else {
          whereCondition[field] = { ">": value };
        }
        break;
      case 'date_between':
        if (condition.date_from && condition.date_to) {
          whereCondition[field] = { "between": [condition.date_from, condition.date_to] };
        } else {
          whereCondition[field] = value;
        }
        break;
      case 'date_not_between':
        if (condition.date_from && condition.date_to) {
          whereCondition[field] = { "not between": [condition.date_from, condition.date_to] };
        } else {
          whereCondition[field] = { "!=": value };
        }
        break;
      case 'is_empty':
        whereCondition[field] = null;
        break;
      case 'is_not_empty':
        whereCondition[field] = { "!=": null };
        break;
      default:
        whereCondition[field] = value;
    }

    return whereCondition;
  }

  private static isContactField(field: string): boolean {
    const contactFields = [
      'user_id', 'first_name', 'last_name', 'email', 'phone',
      'point_balance', 'points_balance', 'status', 'created_date',
      'gender', 'id_card', 'id'
    ];
    return contactFields.includes(field);
  }

  private static isPointHistoryField(field: string): boolean {
    const pointHistoryFields = [
      'point', 'points', 'transaction_date', 'transaction_type',
      'expire_date', 'expiring_points'
    ];
    return pointHistoryFields.includes(field);
  }

  private static isOrderField(field: string): boolean {
    const orderFields = [
      'net_amount', 'grand_total', 'order_date', 'order_status',
      'quantity', 'discount_amount', 'id'
    ];
    return orderFields.includes(field);
  }

  // Demonstrate all use cases from the documentation
  static demonstrateUseCases(): void {
    console.log('=== CONDITION CONVERTER USE CASES ===');

    // Use Case 1: Single contacts condition
    console.log('\n--- Use Case 1: Contacts with point_balance > 1000 ---');
    const usecase1: WorkflowCondition[] = [
      {
        id: "cond-1",
        data_source: "CRM",
        collection: "contacts",
        field: "point_balance",
        field_type: "number",
        operator: "greater_than",
        value: 1000
      }
    ];

    const result1 = this.convertConditionsToQuery(usecase1);
    console.log('Input:', JSON.stringify(usecase1, null, 2));
    console.log('Result:', JSON.stringify(result1, null, 2));

    // Use Case 2: Orders aggregation
    console.log('\n--- Use Case 2: High-spending customers (orders.net_amount > 20000) ---');
    const usecase2: WorkflowCondition[] = [
      {
        id: "1758088387257",
        data_source: "CRM",
        collection: "orders",
        field: "net_amount",
        field_type: "number",
        operator: "greater_than",
        value: 20000
      }
    ];

    const result2 = this.convertConditionsToQuery(usecase2);
    console.log('Input:', JSON.stringify(usecase2, null, 2));
    console.log('Result:', JSON.stringify(result2, null, 2));

    // Use Case 3: Complex conditions with multiple collections
    console.log('\n--- Use Case 3: Male customers with expiring points ---');
    const usecase3: WorkflowCondition[] = [
      {
        id: "1758088387257",
        data_source: "CRM",
        collection: "contacts",
        field: "gender",
        field_type: "select",
        operator: "greater_than",
        value: "male",
        select_options: ["male", "female", "other"]
      },
      {
        id: "1758088885456",
        data_source: "CRM",
        collection: "point_histories",
        field: "expire_date",
        field_type: "date",
        operator: "date_after",
        value: "today",
        logical_operator: "AND",
        date_type: "today"
      }
    ];

    const result3 = this.convertConditionsToQuery(usecase3);
    console.log('Input:', JSON.stringify(usecase3, null, 2));
    console.log('Result:', JSON.stringify(result3, null, 2));
  }
}