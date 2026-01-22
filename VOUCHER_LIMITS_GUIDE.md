# Voucher Usage Limits - Implementation Guide

## Overview

The voucher system has been updated to separate usage limits into two distinct categories:

1. **Per-User Limit** (`usage_limit_per_user`): Maximum number of times a single user can redeem this voucher
2. **Total Global Limit** (`total_usage_limit`): Maximum total uses across all users (like "only first 50 customers")

## Changes Made

### Backend Changes

#### 1. Database Model (`app/models/__init__.py`)
- Changed `usage_limit` → `usage_limit_per_user` (per-user limit)
- Added `total_usage_limit` (global limit)
- Kept `usage_count` to track total uses across all users

```python
class Voucher(Base):
    # ... other fields ...
    usage_limit_per_user = Column(Integer, nullable=True)  # Max uses per user
    total_usage_limit = Column(Integer, nullable=True)      # Max total uses globally
    usage_count = Column(Integer, default=0)                # Current total uses
```

#### 2. Request/Response Schemas (`app/routers/admin.py`)
- `VoucherCreateRequest`: Now accepts both `usage_limit_per_user` and `total_usage_limit`
- `VoucherUpdateRequest`: Now accepts both new fields
- `get_all_vouchers()`: Returns both limits in response

```python
class VoucherCreateRequest(BaseModel):
    # ... other fields ...
    usage_limit_per_user: Optional[int] = None      # Max times a single user can use
    total_usage_limit: Optional[int] = None         # Max total uses across all users
```

#### 3. Voucher Validation (`app/routers/cart.py`)
The `apply_voucher()` endpoint now checks **both** limits:

```python
# Check global usage limit
if voucher.total_usage_limit:
    if voucher.usage_count >= voucher.total_usage_limit:
        raise HTTPException(status_code=400, detail="This voucher has reached its maximum total uses")

# Check per-user usage limit
if current_user and voucher.usage_limit_per_user:
    user_usage_count = db.query(VoucherUsage).filter(
        VoucherUsage.voucher_code == voucher_code,
        VoucherUsage.account_id == current_user.account_id
    ).count()
    
    if user_usage_count >= voucher.usage_limit_per_user:
        raise HTTPException(status_code=400, detail=f"You have already used this voucher {voucher.usage_limit_per_user} time(s)")
```

### Frontend Changes

#### AdminVouchers Component (`frontend/src/pages/admin/AdminVouchers.jsx`)

**Form Fields** (now separated into two inputs):
- "Max Uses Per User" → maps to `usage_limit_per_user`
- "Total Global Uses" → maps to `total_usage_limit`

**Table Display** (new column added):
- Shows both limits separately
- "Per User Limit" column: Displays per-user limit or "Unlimited"
- "Total Limit" column: Displays global limit or "Unlimited"

```jsx
// Example: voucher with 5 per-user and 50 total limit
<td>{voucher.usage_limit_per_user ? `${voucher.usage_limit_per_user}` : 'Unlimited'}</td>
<td>{voucher.total_usage_limit ? `${voucher.total_usage_limit}` : 'Unlimited'}</td>
```

## Database Migration

A migration script has been provided: `migrate_voucher_limits.sql`

### Steps to Apply:

1. **Backup your database** (recommended):
   ```sql
   CREATE TABLE voucher_backup AS SELECT * FROM "Voucher";
   ```

2. **Run the migration script**:
   ```bash
   psql -U postgres -d dali_db -f migrate_voucher_limits.sql
   ```

3. **Verify the migration**:
   ```sql
   SELECT voucher_code, usage_limit_per_user, total_usage_limit, usage_count 
   FROM "Voucher" 
   LIMIT 5;
   ```

### What the Migration Does:

- Adds `usage_limit_per_user` column to Voucher table
- Adds `total_usage_limit` column to Voucher table
- Automatically migrates existing `usage_limit` values to `usage_limit_per_user`
- (Optional) Set `total_usage_limit` based on current usage statistics

### Important Notes:

- The old `usage_limit` column is NOT automatically dropped (safe migration)
- You can safely uncomment the final DROP statement after verifying data integrity
- If you have NULL values in `usage_limit`, they'll become NULL in `usage_limit_per_user` (unlimited)

## API Endpoint Updates

### Create Voucher
**POST** `/api/admin/vouchers`

```json
{
  "voucher_code": "SUMMER2024",
  "description": "Summer sale discount",
  "discount_type": "percentage",
  "discount_value": 20,
  "usage_limit_per_user": 5,        // Each user can use max 5 times
  "total_usage_limit": 100,         // Only 100 total uses allowed
  "valid_from": "2024-06-01T00:00:00",
  "valid_until": "2024-08-31T23:59:59",
  "is_active": true
}
```

### Update Voucher
**PUT** `/api/admin/vouchers/{voucher_code}`

```json
{
  "usage_limit_per_user": 10,       // Update per-user limit
  "total_usage_limit": 500          // Update total limit
}
```

### Get All Vouchers
**GET** `/api/admin/vouchers`

Response now includes both fields:
```json
{
  "vouchers": [
    {
      "voucher_code": "SUMMER2024",
      "usage_limit_per_user": 5,
      "total_usage_limit": 100,
      "usage_count": 45,
      ...
    }
  ]
}
```

## Business Logic Examples

### Example 1: Flash Sale Voucher
- **Per-User**: 2 uses (prevent hoarding)
- **Total**: 1000 uses (limited stock)
- User gets max 2 uses, but only 1000 total units available

### Example 2: Loyalty Reward
- **Per-User**: NULL (unlimited per user)
- **Total**: 500 uses (limited monthly rewards)
- Loyal customers can use as many times as they want, but only 500 total uses

### Example 3: Birthday Discount
- **Per-User**: 1 use (one-time only)
- **Total**: NULL (unlimited, one per customer)
- Each customer gets exactly one birthday discount

## Testing Checklist

- [ ] Create voucher with both limits set
- [ ] Create voucher with only per-user limit
- [ ] Create voucher with only total limit
- [ ] Create voucher with no limits (unlimited)
- [ ] Test per-user limit enforcement (same user applies multiple times)
- [ ] Test total limit enforcement (different users hit the limit)
- [ ] Test edit voucher to change limits
- [ ] Verify admin dashboard shows both limits
- [ ] Check Postman test scenarios if available

## Rollback Instructions

If you need to rollback:

```sql
-- Rollback migration (if old usage_limit column still exists)
UPDATE "Voucher" 
SET usage_limit = usage_limit_per_user 
WHERE usage_limit_per_user IS NOT NULL;

-- Drop new columns
ALTER TABLE "Voucher" DROP COLUMN usage_limit_per_user;
ALTER TABLE "Voucher" DROP COLUMN total_usage_limit;
```

## Related Files Modified

- `app/models/__init__.py` - Voucher model
- `app/routers/admin.py` - Create/update voucher endpoints
- `app/routers/cart.py` - Voucher validation logic
- `frontend/src/pages/admin/AdminVouchers.jsx` - Admin UI
- `migrate_voucher_limits.sql` - Database migration (new)

## Next Steps

1. Run the migration script on your database
2. Restart the backend server
3. Test voucher creation and application
4. Verify both limits are enforced correctly
5. Update any integration/test scenarios with new field names
