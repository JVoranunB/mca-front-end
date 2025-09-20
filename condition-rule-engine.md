# Marketing Automation Condition Rule Engine

## Overview

This document outlines the implementation of a condition rule engine for the Marketing Automation System that automatically structures MCA-query JSON with `contacts` as the default main table, always filtered by merchant_id, and intelligently handles joins when conditions span multiple collections.

## Core Rules

### Rule 1: Default Structure
- Always use `contacts` as the main table
- Always include `merchant_id` filter in contacts WHERE clause
- Default select includes `user_id` from contacts

```json
{
  "contacts": {
    "select": [
      "user_id"
    ],
    "where": {
      "merchant_id": "68468c7bbffca9a0a6b2a413"      
    }
  }
}
```

### Rule 2: Same Collection Conditions
- If condition targets `contacts` collection → Add to main WHERE clause
- Combine with existing merchant_id filter using AND logic

### Rule 3: Different Collection Conditions
- If condition targets other collections → Create join relationship
- Join via `user_id` field (contacts.user_id = other_table.user_id)
- Apply conditions to the joined table

### Rule 3: Different Collection Conditions
- If condition targets other collections → Create join relationship
- Join via `user_id` field (contacts.user_id = other_table.user_id)
- Apply conditions to the joined table

### Rule 4: Aggregate Conditions (Advanced)
- When using aggregate functions (SUM, COUNT, AVG, etc.) → Use `group_by` and `having` clauses
- `group_by`: Always group by `user_id` to aggregate per customer
- `having`: Apply aggregate conditions using format `"FUNCTION(table.field)": {"operator": value}`
- `select`: Include aggregate functions in joined table select with alias
- Still maintains contacts as main table with merchant_id filtering

**Aggregate Function Examples:**
- `"SUM(orders.net_amount)": {">": 20000}` - Total spending greater than 20000
- `"COUNT(orders.id)": {">=": 5}` - At least 5 orders
- `"AVG(orders.rating)": {">": 4.5}` - Average rating above 4.5