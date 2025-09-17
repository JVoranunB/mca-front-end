import { ConditionConverter } from './conditionConverter';
import type { WorkflowCondition } from '../types/workflow.types';

// Test Use Case 1: Single contacts condition
console.log('=== TESTING USE CASE 1 ===');
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

const result1 = ConditionConverter.convertConditionsToQuery(usecase1);
console.log('Use Case 1 Input:', JSON.stringify(usecase1, null, 2));
console.log('Use Case 1 Result:', JSON.stringify(result1, null, 2));

// Expected result should match:
const expected1 = {
  "contacts": {
    "select": ["user_id"],
    "where": {
      "and": [
        {"point_balance": {">": 1000}},
        {"merchant_id":"68468c7bbffca9a0a6b2a413"}
      ]
    }
  }
};

console.log('Use Case 1 Expected:', JSON.stringify(expected1, null, 2));
console.log('Use Case 1 Matches Expected:', JSON.stringify(result1) === JSON.stringify(expected1));

// Test Use Case 2: Orders aggregation
console.log('\n=== TESTING USE CASE 2 ===');
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

const result2 = ConditionConverter.convertConditionsToQuery(usecase2);
console.log('Use Case 2 Input:', JSON.stringify(usecase2, null, 2));
console.log('Use Case 2 Result:', JSON.stringify(result2, null, 2));

// Test Use Case 3: Complex conditions with multiple collections
console.log('\n=== TESTING USE CASE 3 ===');
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

const result3 = ConditionConverter.convertConditionsToQuery(usecase3);
console.log('Use Case 3 Input:', JSON.stringify(usecase3, null, 2));
console.log('Use Case 3 Result:', JSON.stringify(result3, null, 2));

// Expected result should match updated Use Case 3:
const expected3 = {
  "contacts": {
    "select": ["user_id"],
    "where": {
      "gender": "MALE",
      "merchant_id": "68468c7bbffca9a0a6b2a413"
    },
    "point_histories": {
      "select": ["SUM(point_histories.point) as expiring_points"],
      "where": {
        "and": [
          {"expire_date": {">": "CURRENT_DATE()"}}
        ]
      },
      "group_by": ["user_id"],
      "having": {
        "sum": {">": 1000}
      },
      "join": "user_id:user_id"
    }
  }
};

console.log('Use Case 3 Expected:', JSON.stringify(expected3, null, 2));

console.log('\n=== ALL TESTS COMPLETED ===');