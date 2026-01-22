# AI Coding Assistant Instructions - DALI E-Commerce Backend

## Project Overview
DALI is a full-stack e-commerce platform with a **FastAPI backend** (PostgreSQL database) and **React frontend** (Vite). The system handles user accounts, product browsing, shopping carts, checkout, orders, and admin operations with payment integration (Maya sandbox).

## Architecture & Key Components

### Backend Stack
- **Framework**: FastAPI (Python 3.10+)
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: Session-based (cookies) with bcrypt password hashing
- **Payment**: Maya API integration (sandbox environment)
- **Email**: SMTP via aiosmtplib

### Folder Structure
```
app/
├── core/          # Config, database session, security utilities
├── models/        # SQLAlchemy models (Account, Order, Product, etc.)
├── routers/       # API endpoints (auth, products, cart, checkout, orders, admin)
├── schemas/       # Pydantic request/response models
└── services/      # Business logic (CartService, OrderService, ShippingService, etc.)
```

### Data Flow for Core Operations

**Authentication**:
- User registers → email verification token sent → user verifies → login sets `request.session["user_email"]`
- Session used by routers via `get_current_user_required()` dependency

**Shopping Cart** (hybrid session + database):
- **Anonymous**: Products stored in `request.session["cart"]` as dict `{product_id: quantity}`
- **Logged-in**: Stored in `CartItem` table linked to `Account`
- On login: session cart merged into database cart via `CartService.merge_session_cart_with_db_cart()`

**Order Creation**:
- User selects address, delivery method, payment → OrderService.create_order() called
- Checkout details stored in `request.session["checkoutDetails"]` as intermediate state
- Cart → OrderItems, vouchers applied, shipping calculated, OrderHistory logged
- Payment method (`COD`, `Maya`) determines subsequent flow

**Shipping Calculation**:
- **Metro Manila Service Area**: All delivery and pickup restricted to Metro Manila only
- If address delivery: geodesic distance (warehouse to address) × rate = fee (`ShippingService`)
  - Address validation: province_id=1 AND city_id in Metro Manila cities list
- If pickup: Store must be within Metro Manila boundaries (lat/lng validation)
- Frontend auto-filters to Metro Manila addresses/stores during checkout

## Critical Patterns & Conventions

### Service Layer Pattern
Business logic lives in `app/services/*.py`, not routers. Routers handle HTTP/session, services handle data operations:
```python
# In router (checkout.py):
order = OrderService.create_order(db, request, user_email, checkout_details)

# In service (order_service.py):
@staticmethod
def create_order(db, request, user_email, checkout_details):
    # Validate, calculate, create Order + OrderItems + OrderHistory
    # Returns Order object
```

### Authentication Dependency Pattern
Two levels of auth in `app/core/security.py`:
- `get_current_user()`: Returns user or `None` (optional auth)
- `get_current_user_required()`: Raises 401 if not authenticated (required auth)

Use in routers: `current_user = Depends(get_current_user_required)`

### Session State Management
Checkout uses session for multi-step workflow:
```python
request.session["checkoutDetails"] = {
    "addressId": int,
    "deliveryMethod": str,
    "shippingFee": float,
    "storeId": int (optional),
    "paymentMethod": str
}
request.session["applied_voucher"] = {"voucher_code": str, "discount_amount": float}
```

### Admin Role Checking
```python
def get_current_admin(request, db) -> AdminAccount:
    # In auth.py: checks if current_user has admin_account record
    # Raises 403 if not admin
```

### Price Logic
Always check `product.is_on_sale` before applying `product_discount_price`:
```python
if product.is_on_sale and product.product_discount_price is not None:
    price = float(product.product_discount_price)
else:
    price = float(product.product_price)
```

## Key External Dependencies

| Service | Config | Notes |
|---------|--------|-------|
| **PostgreSQL** | `DATABASE_URL` in `.env` | Pool size: 10, max overflow: 20 |
| **Gmail SMTP** | `SMTP_*` settings | For password reset + order confirmation emails |
| **Maya API** | `MAYA_*` settings | Sandbox URL: `https://pg-sandbox.paymaya.com` |
| **Frontend URL** | `FRONTEND_URL` | Used for CORS + payment redirects |

All settings load from `.env` via `app/core/config.py` (Pydantic BaseSettings).

## Developer Workflows

### Local Backend Setup
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Create PostgreSQL database
psql -U postgres -c "CREATE DATABASE dali_db;"
psql -U postgres -d dali_db -f schema.sql

# Create .env with DATABASE_URL and other secrets
# Run
uvicorn main:app --reload
```

### Frontend Setup
```powershell
cd frontend
npm install
npm run dev  # Runs on port 5173
```

### Testing
- Use Postman scenarios: see `POSTMAN_TEST_SCENARIOS.md`
- API docs auto-generated: `http://localhost:8000/docs`
- Database reset: run `COMPLETE_DATABASE_RESET.sql` then `schema.sql` + `data.sql`

## Common Patterns to Follow

1. **Always validate user ownership**: When fetching user's Address/CartItem/Order, filter by `account_id`
   ```python
   address = db.query(Address).filter(
       Address.address_id == id,
       Address.account_id == current_user.account_id  # Always add this
   ).first()
   ```

2. **Return proper HTTP status codes**: 400 (bad request), 401 (auth), 403 (forbidden), 404 (not found)

3. **Email verification**: Before login, user must verify email; tokens sent via `EmailService.send_verification_email()`

4. **Voucher validation**: Check expiry dates, usage limits, and user's prior redemptions before applying discounts

5. **Order state machine**: Orders progress: PENDING → PROCESSING → SHIPPED → DELIVERED (tracked in OrderHistory)

6. **Session vs Database**: Session for ephemeral checkout state, database for persistent user data

## Frontend Integration Points

**API Base**: `http://localhost:8000/api/` (configurable in `frontend/src/api/api.js`)

**Key Endpoints for Frontend**:
- `POST /api/auth/login` → returns Account, sets session cookie
- `GET /api/products` → paginated product listing with filters
- `GET /api/checkout/details` → current checkout state
- `POST /api/checkout/payment` → initiates Maya payment or COD
- `GET /api/orders` → user's order history

**CORS**: Configured in `main.py` to allow `FRONTEND_URL` origin.

## When Adding Features

1. **New route?** Create in appropriate router file (e.g., `app/routers/new_feature.py`), register in `main.py`
2. **New business logic?** Extract to service in `app/services/`
3. **New database model?** Add to `app/models/`, update `schema.sql`, run migration
4. **Needs authentication?** Use `Depends(get_current_user_required)` on the endpoint
5. **User-specific data?** Always validate ownership via account_id

## Quick Reference

- **Config file**: `app/core/config.py` (Settings class with all env vars)
- **Database models**: `app/models/` (all SQLAlchemy tables)
- **Schemas**: `app/schemas/` (Pydantic for request/response validation)
- **Service tests**: Use pytest with `pytest-asyncio` (see `requirements.txt`)
- **API documentation**: Auto-generated Swagger UI at `/docs` when running locally
