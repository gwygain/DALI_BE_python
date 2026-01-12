-- =====================================================================
-- VOUCHER SYSTEM DATABASE SCHEMA
-- =====================================================================
-- This script creates the voucher/discount code system for the cart
-- =====================================================================

-- Create vouchers table
CREATE TABLE IF NOT EXISTS vouchers (
    voucher_code VARCHAR(50) PRIMARY KEY,
    description TEXT NOT NULL,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
    discount_value DECIMAL(10, 2) NOT NULL CHECK (discount_value > 0),
    min_purchase_amount DECIMAL(10, 2),
    max_discount_amount DECIMAL(10, 2),
    valid_from TIMESTAMP NOT NULL,
    valid_until TIMESTAMP NOT NULL,
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_dates CHECK (valid_until > valid_from),
    CONSTRAINT usage_check CHECK (usage_count >= 0),
    CONSTRAINT limit_check CHECK (usage_limit IS NULL OR usage_limit > 0)
);

-- Create voucher_usage table to track individual user usage
CREATE TABLE IF NOT EXISTS voucher_usage (
    usage_id SERIAL PRIMARY KEY,
    voucher_code VARCHAR(50) NOT NULL,
    account_id INTEGER NOT NULL,
    order_id INTEGER,
    discount_amount DECIMAL(10, 2) NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (voucher_code) REFERENCES vouchers(voucher_code) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE SET NULL,
    CONSTRAINT unique_user_voucher UNIQUE (voucher_code, account_id)
);

-- Add voucher columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS voucher_code VARCHAR(50),
ADD COLUMN IF NOT EXISTS voucher_discount DECIMAL(10, 2) DEFAULT 0;

-- Add foreign key constraint for voucher_code in orders
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'fk_orders_voucher'
    ) THEN
        ALTER TABLE orders
        ADD CONSTRAINT fk_orders_voucher 
        FOREIGN KEY (voucher_code) REFERENCES vouchers(voucher_code) ON DELETE SET NULL;
    END IF;
END $$;

-- Create index for faster voucher lookups
CREATE INDEX IF NOT EXISTS idx_vouchers_active ON vouchers(is_active, valid_from, valid_until);
CREATE INDEX IF NOT EXISTS idx_voucher_usage_account ON voucher_usage(account_id);
CREATE INDEX IF NOT EXISTS idx_voucher_usage_code ON voucher_usage(voucher_code);
CREATE INDEX IF NOT EXISTS idx_orders_voucher ON orders(voucher_code);

-- Create function to update voucher updated_at timestamp
CREATE OR REPLACE FUNCTION update_voucher_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for voucher updates
DROP TRIGGER IF EXISTS trigger_update_voucher_timestamp ON vouchers;
CREATE TRIGGER trigger_update_voucher_timestamp
    BEFORE UPDATE ON vouchers
    FOR EACH ROW
    EXECUTE FUNCTION update_voucher_timestamp();

-- Insert sample vouchers for testing
INSERT INTO vouchers (voucher_code, description, discount_type, discount_value, min_purchase_amount, max_discount_amount, valid_from, valid_until, usage_limit, is_active)
VALUES 
    ('WELCOME10', '10% off for new customers', 'percentage', 10.00, 500.00, 100.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', NULL, TRUE),
    ('SAVE20', '20% off on orders above ₱1000', 'percentage', 20.00, 1000.00, 500.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '60 days', NULL, TRUE),
    ('FLAT100', '₱100 off on any order', 'fixed_amount', 100.00, 300.00, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '90 days', NULL, TRUE),
    ('SUMMERSALE', '25% off summer sale', 'percentage', 25.00, 800.00, 1000.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '45 days', 100, TRUE),
    ('FREESHIP', 'Free shipping voucher', 'fixed_amount', 50.00, 200.00, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '120 days', NULL, TRUE),
    ('VIP500', '₱500 off for VIP customers', 'fixed_amount', 500.00, 2000.00, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '180 days', 50, TRUE)
ON CONFLICT (voucher_code) DO NOTHING;

-- Display created vouchers
SELECT 
    voucher_code,
    description,
    discount_type,
    discount_value,
    COALESCE(min_purchase_amount, 0) as min_purchase,
    valid_until::date as expires,
    COALESCE(usage_limit, 999999) as limit,
    usage_count,
    is_active
FROM vouchers
ORDER BY created_at DESC;

COMMENT ON TABLE vouchers IS 'Stores discount voucher codes for cart checkout';
COMMENT ON TABLE voucher_usage IS 'Tracks which users have used which vouchers';
COMMENT ON COLUMN vouchers.discount_type IS 'percentage or fixed_amount';
COMMENT ON COLUMN vouchers.discount_value IS 'Percentage (e.g., 20 for 20%) or fixed amount (e.g., 100 for ₱100)';
COMMENT ON COLUMN vouchers.min_purchase_amount IS 'Minimum cart total required to use this voucher';
COMMENT ON COLUMN vouchers.max_discount_amount IS 'Maximum discount cap for percentage type vouchers';
COMMENT ON COLUMN vouchers.usage_limit IS 'Total number of times voucher can be used (NULL = unlimited)';
COMMENT ON COLUMN vouchers.usage_count IS 'Current number of times voucher has been used';
