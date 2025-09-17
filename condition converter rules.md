# The all Result will have contacts as default main and always where by merchant id. this sample. 
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
# If the condition is same contacts collection it will include to the same one.
# If the condition is not same contacts collection it will be join to others with user_id.


# Usecase 1

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
    "select": [
      "user_id"
    ],
    "where": {
      "point_balance": {
        ">": 1000
      }
    }
  }
}
```

---

# Usecase 2

## Input
```json
[
  {
    "id": "cond-1",
    "data_source": "CRM",
    "collection": "contacts",
    "field": "user_id",
    "field_type": "text",
    "operator": "greater_than",
    "value": "684bc1b694537bbbc606660a"
  },
  {
    "id": "1758014984446",
    "data_source": "CRM",
    "collection": "point_histories",
    "field": "point",
    "field_type": "number",
    "operator": "greater_than",
    "value": 10000,
    "logical_operator": "AND"
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
        {
          "user_id": "684bc1b694537bbbc606660a"
        }
      ]
    }
  },
  "point_histories": {
    "select": [
      "SUM(point_histories.point) as points"
    ],
    "join": "user_id:user_id"
  },
  "group_by": [
    "user_id"
  ],
  "having": {
    "SUM(point_histories.point)": {
      ">": 10000
    }
  }
}
```

---

# Usecase 3

## Input
```json
[
  {
    "id": "1758015714312",
    "data_source": "CRM",
    "collection": "contacts",
    "field": "point_balance",
    "field_type": "number",
    "operator": "greater_than",
    "value": 10000
  },
  {
    "id": "1758015846570",
    "data_source": "CRM",
    "collection": "orders",
    "field": "net_amount",
    "field_type": "number",
    "operator": "less_than",
    "value": 10000,
    "logical_operator": "AND"
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
        {
          "user_id": "684bc1b694537bbbc606660a"
        },
        {
          "point_balance": {
            ">": 10000
          }
        }
      ]
    }
  },
  "orders": {
    "select": [
      "SUM(orders.net_amount) as net_amount"
    ],
    "join": "user_id:user_id"
  },
  "group_by": [
    "user_id"
  ],
  "having": {
    "SUM(orders.net_amount)": {
      "<": 10000
    }
  }
}
```

# Usecase 4