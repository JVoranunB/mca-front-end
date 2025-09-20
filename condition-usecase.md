
# Usecase 1
This use case targets customers who have accumulated significant points in their loyalty program.
Business Logic: Target contacts with points_balance > 100 and Always includes merchant filtering for data isolation

## Input
```json
{
  "id": "cond-1",
  "data_source": "CRM",
  "collection": "contacts",
  "field": "point_balance",
  "field_type": "number",
  "operator": "greater_than",
  "value": 1000
}
```

## Result
```json
{
    "contacts": {
    "select": ["user_id"],
    "where": {
        "and": [
        {"point_balance": {">": 100}},           
        {"merchant_id":"68468c7bbffca9a0a6b2a413"}
        ]
    }
    }
}
```
# Usecase 2
This use case targets high-spending customers based on their total purchase amount across all orders. 
## Input
```json
[
  {
    "id": "1758088387257",
    "data_source": "CRM",
    "collection": "orders",
    "field": "net_amount",
    "field_type": "number",
    "operator": "greater_than",
    "value": 20000
  }
]
```
## Result
```json
{
  "contacts": {
    "select": [
      "user_id"
    ],
    "where": {
      "and": [
        {"merchant_id":"68468c7bbffca9a0a6b2a413"}
      ]
    },
    "group_by": ["user_id"],
    "having": {
      "SUM(orders.net_amount)": {">": 20000}
    },
    "orders": {
      "select": ["SUM(net_amount) as net_amount"],     
      "join": "user_id:user_id"      
    }
  }
}
```

# Usecase 3
Male Customers with Expiring Points > 1000
This use case combines customer demographics with time-sensitive loyalty data to target male customers who have significant points expiring soon.
## Input
```json
[
  {
    "id": "1758088387257",
    "data_source": "CRM",
    "collection": "contacts",
    "field": "gender",
    "field_type": "select",
    "operator": "greater_than",
    "value": "male",
    "select_options": [
      "male",
      "female",
      "other"
    ]
  },
  {
    "id": "1758088885456",
    "data_source": "CRM",
    "collection": "point_histories",
    "field": "expire_date",
    "field_type": "date",
    "operator": "date_after",
    "value": "today",
    "logical_operator": "AND",
    "date_type": "today"
  }
]
```
## Result
```json
{
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
}
```

# Usecase 4
This use case targets customers celebrating their birthday today by matching both the current day and month with their date of birth. This is a time-sensitive campaign
## Input
```json
[
  {
    "id": "cond-10",
    "data_source": "CRM",
    "collection": "contacts",
    "field": "date_of_birth",
    "field_type": "date",
    "operator": "equals",
    "value": "anniversary",
    "date_type": "anniversary"
  }
]
```
## Result
```json
{
  "contacts": {
    "select": ["user_id"],
    "where": {
      "and": [
        {"date_of_birth": {"current_day": true}},
        {"date_of_birth": {"current_month": true}},
        {"merchant_id": "68468c7bbffca9a0a6b2a413"}
      ]
    }
  }
}

```

# Usecase 5
## Input
```json
```
## Result
```json
```