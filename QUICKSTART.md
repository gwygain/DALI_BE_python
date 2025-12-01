# Quick Start Guide - DALI FastAPI Backend

## Prerequisites

- **Python 3.10+** (tested with Python 3.14)
- **PostgreSQL** 
- **Git** (for cloning repository)

## Complete Setup Guide

### 1. Clone the Repository
```powershell
git clone https://github.com/Lannzo/DALI_BE_python.git
cd DALI_BE_python
```

### 2. Create Virtual Environment
```powershell
# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows PowerShell)
.\venv\Scripts\Activate.ps1

# If you get execution policy error, run:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 3. Install Python Dependencies
```powershell
# Make sure virtual environment is activated (you should see (venv) in terminal)
pip install --upgrade pip
pip install -r requirements.txt
```

### 4. Setup PostgreSQL Database

**Install PostgreSQL** (if not installed):
- Download from: https://www.postgresql.org/download/
- During installation, remember your postgres user password

**Create Database:**
```powershell
# Option 1: Using psql command
psql -U postgres -c "CREATE DATABASE dali_db;"

# Option 2: Using pgAdmin (GUI tool)
# - Open pgAdmin
# - Right-click Databases → Create → Database
# - Name: dali_db
```

**Run Schema & Data:**
```powershell
# Run schema (creates tables)
psql -U postgres -d dali_db -f schema.sql

# Load sample data (optional but recommended for testing)
psql -U postgres -d dali_db -f data.sql
```

### 5. Configure Environment Variables

**Create .env file:**
```powershell
# Copy example file
Copy-Item .env.example .env

# Or manually create .env file
New-Item .env
```

**Edit .env file with your settings:**
```ini
# Database Configuration
DATABASE_URL=postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/dali_db

# Security Keys (generate random strings)
SECRET_KEY=your-super-secret-key-here-make-it-long-and-random
SESSION_SECRET_KEY=another-random-secret-key-for-sessions

# Optional: Email Configuration (for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Optional: Admin Configuration
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123

# Server Configuration (defaults are fine)
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALGORITHM=HS256
```

**Generate Secure Random Keys:**
```powershell
# Generate SECRET_KEY
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Generate SESSION_SECRET_KEY
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 6. Run the Application

```powershell
# Make sure you're in the project directory with venv activated
python main.py

# Or use uvicorn directly
uvicorn main:app --reload
```

**Server will start at:**
- API: http://localhost:8000
- Interactive API Docs: http://localhost:8000/docs
- Alternative Docs: http://localhost:8000/redoc

### 7. Test the API

**Using the Browser:**
1. Open http://localhost:8000/docs (Swagger UI)
2. Try the `/health` endpoint to verify server is running
3. Test `/api/auth/register` to create an account

**Using Postman:**
1. Import the test scenarios from `POSTMAN_TEST_SCENARIOS.md`
2. Start with registration: `POST /api/auth/register`
3. Then login: `POST /api/auth/login`
4. Make sure cookies are enabled in Postman settings

## Project Structure Summary

```
DALI_BE_Python/
├── app/
│   ├── core/              # Core configuration
│   │   ├── config.py      # Settings & environment variables
│   │   ├── database.py    # Database connection & session
│   │   └── security.py    # Authentication & password hashing
│   ├── models/            # SQLAlchemy ORM models
│   │   └── __init__.py    # Database models (Account, Product, Order, etc.)
│   ├── schemas/           # Pydantic validation schemas
│   │   └── __init__.py    # Request/response schemas
│   ├── routers/           # API endpoint handlers
│   │   ├── auth.py        # Authentication endpoints
│   │   ├── products.py    # Product browsing
│   │   ├── cart.py        # Shopping cart
│   │   ├── checkout.py    # Checkout process
│   │   ├── orders.py      # Order management
│   │   ├── addresses.py   # Address management
│   │   ├── stores.py      # Store locations
│   │   ├── locations.py   # Provinces/cities/barangays
│   │   └── admin.py       # Admin panel
│   ├── services/          # Business logic layer
│   │   ├── account_service.py    # User account operations
│   │   ├── cart_service.py       # Cart operations
│   │   ├── order_service.py      # Order processing
│   │   ├── shipping_service.py   # Shipping calculations
│   │   ├── email_service.py      # Email notifications
│   │   └── maya_service.py       # Payment integration
│   └── utils/             # Helper functions
├── main.py                # Application entry point
├── requirements.txt       # Python dependencies
├── schema.sql             # Database schema
├── data.sql               # Sample data
├── .env                   # Environment config (DO NOT COMMIT)
├── .env.example           # Example environment config
├── .gitignore             # Git ignore rules
├── API_REFERENCE.md       # Complete API documentation
└── POSTMAN_TEST_SCENARIOS.md  # Testing guide

```

## API Architecture

This is a **pure JSON REST API** designed for React frontend integration.

**Key Features:**
- ✅ RESTful JSON endpoints (no HTML templates)
- ✅ Session-based authentication with secure cookies
- ✅ CORS enabled for cross-origin requests
- ✅ Pydantic validation for all requests/responses
- ✅ Auto-generated API documentation at `/docs`
- ✅ PostgreSQL database with SQLAlchemy ORM
- ✅ bcrypt password hashing
- ✅ Comprehensive error handling

## Available API Endpoints

**Authentication:**
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user info
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

**Products:**
- `GET /api/products` - Browse products (with filters)
- `GET /api/products/{id}` - Get product details

**Shopping Cart:**
- `GET /api/cart` - Get cart items
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/items/{id}` - Update quantity
- `DELETE /api/cart/items/{id}` - Remove item
- `DELETE /api/cart/clear` - Clear cart

**Checkout & Orders:**
- `GET /api/checkout` - Get checkout details
- `POST /api/checkout` - Create order
- `POST /api/checkout/maya` - Create Maya payment
- `GET /api/orders` - Get user's orders
- `GET /api/orders/{id}` - Get order details

**Addresses:**
- `GET /api/addresses` - Get user addresses
- `POST /api/addresses` - Create address
- `PUT /api/addresses/{id}` - Update address
- `DELETE /api/addresses/{id}` - Delete address
- `POST /api/addresses/{id}/set-default` - Set default address

**Locations:**
- `GET /api/locations/provinces` - Get all provinces
- `GET /api/locations/provinces/{id}/cities` - Get cities in province
- `GET /api/locations/cities/{id}/barangays` - Get barangays in city

**Stores:**
- `GET /api/stores` - Get all store locations
- `GET /api/stores/nearest` - Find nearest store

**Admin:**
- `POST /api/admin/login` - Admin login
- `GET /api/admin/orders` - Get all orders
- `PUT /api/admin/orders/{id}/status` - Update order status

## Troubleshooting

**"Module not found" errors:**
```powershell
# Make sure venv is activated
.\venv\Scripts\Activate.ps1

# Reinstall dependencies
pip install -r requirements.txt
```

**Database connection error:**
```powershell
# Check PostgreSQL is running
Get-Service postgresql*

# Test connection
psql -U postgres -c "SELECT version();"

# Verify DATABASE_URL in .env matches your setup
```

**"Not authenticated" errors in Postman:**
- Enable cookies in Postman settings
- Login first to get session cookie
- Cookie should auto-attach to subsequent requests

**bcrypt password errors:**
- Password must be 6-72 characters
- Don't use extremely long passwords (>72 bytes when UTF-8 encoded)

**Server won't start:**
```powershell
# Check if port 8000 is in use
netstat -ano | findstr :8000

# Kill process if needed (replace PID)
taskkill /PID <process_id> /F
```

## Development Workflow

**Making Changes:**
1. Edit code files
2. Server auto-reloads (if using `--reload`)
3. Test changes via `/docs` or Postman
4. Commit changes: `git add .` → `git commit -m "message"`
5. Push to GitHub: `git push`

**Database Changes:**
1. Update `schema.sql`
2. Drop and recreate database OR use migrations
3. Re-run schema: `psql -U postgres -d dali_db -f schema.sql`

## Next Steps

1. ✅ **Setup Complete** - Server running at http://localhost:8000
2. 📖 **Read API Docs** - Check `API_REFERENCE.md` for endpoint details
3. 🧪 **Test Endpoints** - Use `/docs` or follow `POSTMAN_TEST_SCENARIOS.md`
4. ⚛️ **Build React Frontend** - Connect using `fetch` or `axios` with `credentials: 'include'`
5. 🚀 **Deploy** - Consider Heroku, Railway, or AWS for production

## Important Notes

- **DO NOT commit .env** - Contains sensitive keys and passwords
- **Session cookies required** - Frontend must use `credentials: 'include'`
- **Password constraints** - 6-72 characters due to bcrypt limitation
- **CORS enabled** - Currently allows all origins (restrict in production)

## Support & Documentation

- **API Reference**: See `API_REFERENCE.md`
- **Test Scenarios**: See `POSTMAN_TEST_SCENARIOS.md`
- **FastAPI Docs**: http://localhost:8000/docs (when server is running)
- **FastAPI Guide**: https://fastapi.tiangolo.com/

---

