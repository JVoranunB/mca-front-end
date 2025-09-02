// CRM data source fields based on PostgreSQL schema
export const DATA_SOURCE_FIELDS = {
  CRM: {
    merchants: [
      { key: 'merchant_id', label: 'Merchant ID', type: 'text' as const },
      { key: 'code', label: 'Merchant Code', type: 'text' as const },
      { key: 'name', label: 'Merchant Name', type: 'text' as const },
      { key: 'created_date', label: 'Registration Date', type: 'date' as const },
      { key: 'updated_date', label: 'Last Updated', type: 'date' as const }
    ],
    stores: [
      { key: 'code', label: 'Store Code', type: 'text' as const },
      { key: 'name', label: 'Store Name', type: 'text' as const },
      { key: 'merchant_id', label: 'Merchant ID', type: 'text' as const },
      { key: 'created_date', label: 'Store Created Date', type: 'date' as const },
      { key: 'updated_date', label: 'Last Updated', type: 'date' as const }
    ],
    products: [
      { key: 'code', label: 'Product Code', type: 'text' as const },
      { key: 'name', label: 'Product Name', type: 'text' as const },
      { key: 'product_category_id', label: 'Category ID', type: 'text' as const },
      { key: 'description', label: 'Product Description', type: 'text' as const },
      { key: 'merchant_id', label: 'Merchant ID', type: 'text' as const },
      { key: 'created_date', label: 'Product Created Date', type: 'date' as const },
      { key: 'updated_date', label: 'Last Updated', type: 'date' as const }
    ],
    contacts: [
      { key: 'user_id', label: 'User ID', type: 'text' as const },
      { key: 'email', label: 'Email Address', type: 'text' as const },
      { key: 'phone_number', label: 'Phone Number', type: 'text' as const },
      { key: 'line_user_id', label: 'LINE User ID', type: 'text' as const },
      { key: 'full_name', label: 'Full Name', type: 'text' as const },
      { key: 'first_name', label: 'First Name', type: 'text' as const },
      { key: 'last_name', label: 'Last Name', type: 'text' as const },
      { key: 'gender', label: 'Gender', type: 'select' as const, options: ['male', 'female', 'other'] },
      { key: 'date_of_birth', label: 'Date of Birth', type: 'date' as const },
      { key: 'point_balance', label: 'Point Balance', type: 'number' as const },
      { key: 'total_point_collect', label: 'Total Points Collected', type: 'number' as const },
      { key: 'total_point_used', label: 'Total Points Used', type: 'number' as const },
      { key: 'total_order', label: 'Total Orders', type: 'number' as const },
      { key: 'total_sale_amount', label: 'Total Sales Amount', type: 'number' as const },
      { key: 'avg_sale_amount_per_order', label: 'Average Order Value', type: 'number' as const },
      { key: 'last_sale_date', label: 'Last Purchase Date', type: 'date' as const },
      { key: 'member_tier_id', label: 'Member Tier', type: 'text' as const },
      { key: 'status', label: 'Customer Status', type: 'select' as const, options: ['active', 'inactive', 'suspended'] },
      { key: 'created_date', label: 'Registration Date', type: 'date' as const },
      { key: 'updated_date', label: 'Last Updated', type: 'date' as const }
    ],
    orders: [
      { key: 'order_code', label: 'Order Code', type: 'text' as const },
      { key: 'status', label: 'Order Status', type: 'select' as const, options: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] },
      { key: 'transaction_type', label: 'Transaction Type', type: 'select' as const, options: ['normal', 'refund'] },
      { key: 'refund_type', label: 'Refund Type', type: 'text' as const },
      { key: 'channel_type', label: 'Channel Type', type: 'text' as const },
      { key: 'channel_name', label: 'Channel Name', type: 'text' as const },
      { key: 'total_price', label: 'Total Price', type: 'number' as const },
      { key: 'total_discount', label: 'Total Discount', type: 'number' as const },
      { key: 'service_charges', label: 'Service Charges', type: 'number' as const },
      { key: 'net_amount', label: 'Net Amount', type: 'number' as const },
      { key: 'grand_total', label: 'Grand Total', type: 'number' as const },
      { key: 'points_earned', label: 'Points Earned', type: 'number' as const },
      { key: 'user_id', label: 'Customer ID', type: 'text' as const },
      { key: 'store_code', label: 'Store Code', type: 'text' as const },
      { key: 'store_name', label: 'Store Name', type: 'text' as const },
      { key: 'created_date', label: 'Order Date', type: 'date' as const },
      { key: 'updated_date', label: 'Last Updated', type: 'date' as const }
    ],
    order_items: [
      { key: 'product_code', label: 'Product Code', type: 'text' as const },
      { key: 'product_name', label: 'Product Name', type: 'text' as const },
      { key: 'product_category_name', label: 'Category', type: 'text' as const },
      { key: 'brand_name', label: 'Brand', type: 'text' as const },
      { key: 'variant_name', label: 'Product Variant', type: 'text' as const },
      { key: 'quantity', label: 'Quantity', type: 'number' as const },
      { key: 'unit_price', label: 'Unit Price', type: 'number' as const },
      { key: 'discount', label: 'Item Discount', type: 'number' as const },
      { key: 'total_price', label: 'Item Total', type: 'number' as const },
      { key: 'review_rate', label: 'Review Rating', type: 'number' as const },
      { key: 'is_freebie', label: 'Is Freebie', type: 'select' as const, options: ['true', 'false'] }
    ],
    point_histories: [
      { key: 'note', label: 'Transaction Note', type: 'text' as const },
      { key: 'point', label: 'Points', type: 'number' as const },
      { key: 'balance', label: 'Balance After', type: 'number' as const },
      { key: 'give_from', label: 'Point Source', type: 'text' as const },
      { key: 'expire_date', label: 'Expiration Date', type: 'date' as const },
      { key: 'user_id', label: 'Customer ID', type: 'text' as const },
      { key: 'created_date', label: 'Transaction Date', type: 'date' as const }
    ]
  }
};

export interface DataSourceField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select';
  options?: string[];
}

export const getFieldsForDataSource = (dataSource: string, collection?: string): DataSourceField[] => {
  if (dataSource === 'CRM' && collection) {
    return DATA_SOURCE_FIELDS.CRM[collection as keyof typeof DATA_SOURCE_FIELDS.CRM] || [];
  }
  return [];
};

export const getCollectionsForDataSource = (dataSource: string): string[] => {
  if (dataSource === 'CRM') {
    return Object.keys(DATA_SOURCE_FIELDS.CRM);
  }
  return [];
};

export const getOperatorsForFieldType = (fieldType: 'text' | 'number' | 'date' | 'select'): string[] => {
  switch (fieldType) {
    case 'text':
      return ['equals', 'not_equals', 'contains', 'not_contains', 'is_empty', 'is_not_empty'];
    case 'number':
      return ['equals', 'not_equals', 'greater_than', 'less_than', 'greater_equal', 'less_equal', 'is_empty', 'is_not_empty'];
    case 'date':
      return ['equals', 'not_equals', 'date_before', 'date_after', 'is_empty', 'is_not_empty'];
    case 'select':
      return ['equals', 'not_equals', 'is_empty', 'is_not_empty'];
    default:
      return ['equals', 'not_equals'];
  }
};

export const getDataSourcesForConditions = () => [
  { label: 'CRM', value: 'CRM' }
];

export const getFieldsForCollection = (dataSource: 'CRM', collection: string): DataSourceField[] => {
  if (dataSource === 'CRM') {
    return DATA_SOURCE_FIELDS.CRM[collection as keyof typeof DATA_SOURCE_FIELDS.CRM] || [];
  }
  return [];
};

export const getOperatorLabel = (operator: string): string => {
  const labels: Record<string, string> = {
    'equals': 'Equals',
    'not_equals': 'Not Equals',
    'greater_than': 'Greater Than',
    'less_than': 'Less Than',
    'greater_equal': 'Greater or Equal',
    'less_equal': 'Less or Equal',
    'contains': 'Contains',
    'not_contains': 'Does Not Contain',
    'date_before': 'Before',
    'date_after': 'After',
    'is_empty': 'Is Empty',
    'is_not_empty': 'Is Not Empty'
  };
  return labels[operator] || operator;
};