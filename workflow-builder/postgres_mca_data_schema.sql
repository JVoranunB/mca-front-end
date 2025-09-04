DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS point_histories;
DROP TABLE IF EXISTS daily_given_points;
DROP TABLE IF EXISTS contacts;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS stores;
DROP TABLE IF EXISTS merchants;

-- MCA Database Schema Design - PostgreSQL Implementation
-- Migration from MongoDB to BigQuery tables for marketing automation

-- =====================================================
-- STORES TABLE
-- Represents individual stores or sellers that use the platform
-- =====================================================

CREATE TABLE merchants (
    id VARCHAR PRIMARY KEY,
    code VARCHAR NOT NULL,
    name VARCHAR NOT NULL,
    line_access_token VARCHAR NULL,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR NOT NULL,
    updated_by VARCHAR NOT NULL
);
-- =====================================================
-- STORES TABLE
-- Represents individual stores or sellers that use the platform
-- =====================================================
CREATE TABLE stores (
    id VARCHAR PRIMARY KEY,
    merchant_id VARCHAR NOT NULL,
    code VARCHAR NOT NULL,
    name VARCHAR NOT NULL,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR NOT NULL,
    updated_by VARCHAR NOT NULL
);
ALTER TABLE stores
ADD CONSTRAINT fk_stores_merchants
FOREIGN KEY (merchant_id) REFERENCES merchants(id);

-- =====================================================
-- PRODUCTS TABLE
-- Stores product information for items sold by stores
-- =====================================================
CREATE TABLE products (
    id VARCHAR PRIMARY KEY,
    code VARCHAR NOT NULL,
    merchant_id VARCHAR NOT NULL,
    product_category_id VARCHAR,
    name VARCHAR NOT NULL,
    description TEXT,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR NOT NULL,
    updated_by VARCHAR NOT NULL
);

-- Add foreign key constraints for products
ALTER TABLE products 
ADD CONSTRAINT fk_products_merchants 
FOREIGN KEY (merchant_id) REFERENCES merchants(id);

-- Create indexes for products table
CREATE INDEX idx_products_merchant_id ON products(merchant_id);


-- =====================================================
-- CONTACTS TABLE
-- Stores comprehensive customer profile information including personal
-- details, loyalty status, and activity metrics
-- =====================================================
CREATE TABLE contacts (
    id VARCHAR PRIMARY KEY,
    user_id varchar(100) NOT NULL,
	email varchar(100) NULL,
	phone_number varchar(50) NULL,
	line_user_id varchar(100) NULL,
	id_card varchar(100) NULL,
	full_name varchar(100) NULL,
	gender varchar(20) NULL,
	date_of_birth timestamp NULL,
	point_balance int8 NULL,
	total_point_collect int8 NULL,
	total_point_used int8 NULL,
	total_order int8 NULL,
	total_sale_amount float8 NULL,
	avg_sale_amount_per_order float8 NULL,
	last_sale_date timestamp NULL,
	member_tier_id varchar(100) NULL,
	merchant_id varchar(100) NOT NULL,
	status varchar(100) NOT NULL,
	created_date timestamp NOT NULL,
	updated_date timestamp NULL,
	first_name varchar(100) NULL,
	last_name varchar(100) NULL
);


-- Add foreign key constraints for contacts
ALTER TABLE contacts 
ADD CONSTRAINT fk_contacts_merchant 
FOREIGN KEY (merchant_id) REFERENCES merchants(id);

-- Add unique constraint on user_id for foreign key references
ALTER TABLE contacts 
ADD CONSTRAINT uk_contacts_user_id 
UNIQUE (user_id);

-- Create indexes for contacts table
CREATE INDEX idx_contacts_merchant_id ON contacts(merchant_id);
CREATE INDEX idx_contacts_user_id ON contacts(user_id);

CREATE TABLE daily_given_points (
    date varchar(50) NOT NULL,
    user_id varchar(50) NOT NULL,
    merchant_id varchar(50) NOT NULL,
    points int8 NOT NULL,
    PRIMARY KEY ("date","user_id","merchant_id")
);

CREATE INDEX idx_daily_given_points_merchant_id ON daily_given_points(merchant_id);
CREATE INDEX idx_daily_given_points_user_id ON daily_given_points(user_id);

-- =====================================================
-- POINT_HISTORIES TABLE
-- Tracks detailed point transaction history and balance changes
-- =====================================================
CREATE TABLE point_histories (
    id VARCHAR PRIMARY KEY,
    note VARCHAR,
    point DECIMAL(10,2) NOT NULL,
    user_id VARCHAR NOT NULL,
    balance DECIMAL(10,2) NOT NULL DEFAULT 0,
    merchant_id VARCHAR NOT NULL,
    give_from VARCHAR,
    expire_date DATE,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraints for point_histories
ALTER TABLE point_histories 
ADD CONSTRAINT fk_point_histories_user 
FOREIGN KEY (user_id) REFERENCES contacts(user_id);

ALTER TABLE point_histories 
ADD CONSTRAINT fk_point_histories_merchant 
FOREIGN KEY (merchant_id) REFERENCES merchants(id);

-- Create indexes for point_histories table
CREATE INDEX idx_point_histories_user_id ON point_histories(user_id);
CREATE INDEX idx_point_histories_merchant_id ON point_histories(merchant_id);

-- =====================================================
-- ORDERS TABLE
-- Records customer transactions including purchases and refunds
-- =====================================================
CREATE TABLE orders (
    id VARCHAR PRIMARY KEY,
    merchant_id VARCHAR NOT NULL,
    store_id VARCHAR NULL,
    store_code VARCHAR NULL,
    store_name VARCHAR NULL,
    user_id VARCHAR NOT NULL,
    order_code VARCHAR NOT NULL,
    status VARCHAR NOT NULL,
    transaction_type VARCHAR NOT NULL DEFAULT 'normal',
    refund_type VARCHAR,
    refund_of VARCHAR, -- Reference to original order ID for refunds
    channel_type VARCHAR,
    channel_id VARCHAR,
    channel_name VARCHAR,
    total_price DECIMAL(12,2) NOT NULL,
    total_discount DECIMAL(12,2) DEFAULT 0,
    service_charges DECIMAL(12,2) DEFAULT 0,
    net_amount DECIMAL(12,2) NOT NULL,
    total_before_vat DECIMAL(12,2) NOT NULL,
    total_vat DECIMAL(12,2) DEFAULT 0,
    grand_total DECIMAL(12,2) NOT NULL,
    points_earned INTEGER DEFAULT 0,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR NOT NULL,
    updated_by VARCHAR NOT NULL
);

-- Add foreign key constraints for orders
ALTER TABLE orders 
ADD CONSTRAINT fk_orders_merchant
FOREIGN KEY (merchant_id) REFERENCES merchants(id);

ALTER TABLE orders 
ADD CONSTRAINT fk_orders_store
FOREIGN KEY (store_id) REFERENCES stores(id);

ALTER TABLE orders 
ADD CONSTRAINT fk_orders_user 
FOREIGN KEY (user_id) REFERENCES contacts(user_id);

-- Create indexes for orders table
CREATE INDEX idx_orders_merchant_id ON orders(merchant_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);

-- =====================================================
-- ORDER_ITEMS TABLE
-- Individual line items within customer orders with detailed product information
-- =====================================================
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR NOT NULL,
    product_id VARCHAR NOT NULL,
    product_code VARCHAR NOT NULL,
    product_name VARCHAR NOT NULL,
    product_category_id VARCHAR,
    product_category_code VARCHAR,
    product_category_name VARCHAR,
    brand_id VARCHAR,
    brand_name VARCHAR,
    variant_id VARCHAR,
    variant_code VARCHAR,
    variant_name VARCHAR,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0,
    total_price DECIMAL(12,2) NOT NULL,
    review_rate INTEGER,
    is_freebie BOOLEAN DEFAULT FALSE,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR NOT NULL,
    updated_by VARCHAR NOT NULL
);

-- Add foreign key constraints for order_items
ALTER TABLE order_items 
ADD CONSTRAINT fk_order_items_order 
FOREIGN KEY (order_id) REFERENCES orders(id);

ALTER TABLE order_items 
ADD CONSTRAINT fk_order_items_product 
FOREIGN KEY (product_id) REFERENCES products(id);

-- Create indexes for order_items table
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- =====================================================
-- COMMENTS ON TABLES AND COLUMNS
-- =====================================================

COMMENT ON TABLE stores IS 'Represents individual stores or sellers that use the platform';
COMMENT ON TABLE products IS 'Stores product information for items sold by stores';
COMMENT ON TABLE contacts IS 'Comprehensive customer profile information including personal details, loyalty status, and activity metrics';
COMMENT ON TABLE orders IS 'Records customer transactions including purchases and refunds';
COMMENT ON TABLE order_items IS 'Individual line items within customer orders with detailed product information';

-- Add some column comments for clarity
COMMENT ON COLUMN orders.refund_of IS 'Reference to original order ID for refund transactions';
COMMENT ON COLUMN contacts.date_of_birth IS 'Customer date of birth for age calculation and targeting';
COMMENT ON COLUMN order_items.id IS 'Auto-increment primary key for order items (MongoDB basket_items do not have reliable IDs)';
COMMENT ON COLUMN order_items.is_freebie IS 'Indicates if the item was given for free (promotional/gift)';
