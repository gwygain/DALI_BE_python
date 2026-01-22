-- Migration script to separate voucher usage limits into per-user and total global limits
-- This script adds two new columns to the vouchers table and migrates existing data

-- Check current schema to see if columns exist
-- Backup the existing data (OPTIONAL - uncomment if you want to be extra safe)
-- CREATE TABLE voucher_backup AS SELECT * FROM vouchers;

-- Add the new columns if they don't already exist
DO $$
BEGIN
    -- Check if usage_limit_per_user column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vouchers' AND column_name = 'usage_limit_per_user'
    ) THEN
        ALTER TABLE vouchers ADD COLUMN usage_limit_per_user INTEGER NULL;
    END IF;
    
    -- Check if total_usage_limit column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vouchers' AND column_name = 'total_usage_limit'
    ) THEN
        ALTER TABLE vouchers ADD COLUMN total_usage_limit INTEGER NULL;
    END IF;
END $$;

-- Migrate existing data from usage_limit to usage_limit_per_user
-- (This assumes existing usage_limit was meant to be per-user limit)
UPDATE vouchers 
SET usage_limit_per_user = usage_limit 
WHERE usage_limit IS NOT NULL 
  AND usage_limit_per_user IS NULL;

-- Optional: You can set a default total_usage_limit based on current usage_count
-- Uncomment if you want to set it based on usage stats
-- UPDATE vouchers 
-- SET total_usage_limit = CEIL(usage_count * 1.5)  -- Set to 1.5x current usage
-- WHERE total_usage_limit IS NULL AND usage_count > 0;

-- Drop the old usage_limit column (OPTIONAL - only uncomment after verifying migration)
-- ALTER TABLE vouchers DROP COLUMN usage_limit;

-- Verify the migration
SELECT 
    voucher_code,
    usage_limit_per_user,
    total_usage_limit,
    usage_count,
    description
FROM vouchers
ORDER BY created_at DESC
LIMIT 10;
