# Timezone Fix - Philippine Time Implementation

## Problem
All timestamps were being stored in UTC (Universal Coordinated Time) instead of Philippine Time (UTC+8), causing an 8-hour discrepancy in:
- Audit logs
- Order histories
- Voucher validity checks
- All other timestamp displays

## Solution
Created a centralized Philippine timezone utility and updated all timestamp generation throughout the codebase.

## Changes Made

### 1. Created Philippine Timezone Utility
**File**: `app/core/timezone.py`
- `PHILIPPINE_TZ`: Timezone constant for UTC+8
- `get_philippine_time()`: Returns current Philippine time as naive datetime
- `utc_to_philippine()`: Converts UTC datetime to Philippine time

### 2. Updated Model Timestamp Defaults
**File**: `app/models/__init__.py`

All model timestamp fields now use `default=get_philippine_time` instead of `datetime.utcnow`:

- **Order**: `created_at`, `updated_at`
- **OrderHistory**: `event_timestamp`
- **AuditLog**: `created_at`
- **Review**: `created_at`, `updated_at`
- **ReviewImage**: `created_at`
- **Voucher**: `created_at`, `updated_at`
- **VoucherUsage**: `used_at`
- **Address**: `created_at`

### 3. Updated Runtime Timestamp Code

**File**: `app/services/order_service.py`
- Added import: `from app.core.timezone import get_philippine_time`
- Replaced voucher validation time check (line 73)
- Replaced `order.updated_at` assignments (4 locations)

**File**: `app/routers/cart.py`
- Added import: `from app.core.timezone import get_philippine_time`
- Replaced voucher expiry check (line 247)

**File**: `app/routers/admin.py`
- Added import: `from app.core.timezone import get_philippine_time`
- Replaced `order.updated_at` on status update (line 560)

### 4. Kept UTC for JWT Tokens
**File**: `app/core/security.py`
- JWT token expiration timestamps remain in UTC (standard practice)
- No changes made to `create_access_token()` function

## Impact

### New Records
All new database records will automatically use Philippine Time for timestamps.

### Existing Records
Existing records in the database still have UTC timestamps. They will display correctly in the frontend which converts to Philippine Time for display.

### Voucher Validation
Vouchers are now validated against Philippine Time, fixing the 8-hour discrepancy that could cause valid vouchers to appear expired.

### Audit Logs
New audit log entries will show the correct Philippine Time when actions were performed.

## Frontend Changes
No changes needed in frontend. The AdminAudit.jsx component already converts timestamps to Philippine timezone for display using:
```javascript
toLocaleString('en-PH', { timeZone: 'Asia/Manila', ... })
```

## Testing Recommendations
1. Create a new order and verify timestamps are in Philippine Time
2. Update product stock/price and check audit log timestamps
3. Apply a voucher and verify expiry validation works correctly
4. Check order history timestamps for new status changes

## Migration Note
Existing database records still contain UTC timestamps. If you need to convert existing data, you would need to run a database migration script to add 8 hours to all existing timestamp fields. However, this is optional since the frontend already handles display conversion.
