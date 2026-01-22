# DALI E-Commerce - Quick Start Guide

Get DALI up and running on your local machine in minutes!

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.10+** - [Download](https://www.python.org/downloads/)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **PostgreSQL 14+** - [Download](https://www.postgresql.org/download/)
- **Git** (optional) - [Download](https://git-scm.com/)

### Verify Installations

```bash
python --version    # Should be 3.10 or higher
node --version      # Should be 18 or higher
npm --version       # Comes with Node.js
psql --version      # PostgreSQL client
```

---

## 🚀 Automated Setup (Recommended)

### Step 1: Run Setup Script

```bash
python setup.py
```

The script will:
- ✅ Check all prerequisites
- ✅ Create virtual environment
- ✅ Install Python dependencies
- ✅ Install frontend dependencies
- ✅ Create necessary directories
- ✅ Generate `.env` template file

### Step 2: Configure Environment

Edit the `.env` file created in the root directory:

```env
# Update these values:
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/dali_db
SECRET_KEY=generate-a-random-secret-key-here
```

**Generate a random SECRET_KEY** (Python):
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Step 3: Setup Database

#### Option A: Using psql (Command Line)

```bash
# Create database
psql -U postgres -c "CREATE DATABASE dali_db;"

# Initialize schema and load data
psql -U postgres -d dali_db -f UNIFIED_DATABASE_INIT.sql
psql -U postgres -d dali_db -f data.sql
```

#### Option B: Using pgAdmin (GUI)

1. Open pgAdmin
2. Right-click on "Databases" → Create → Database
3. Name it `dali_db`
4. Right-click on `dali_db` → Query Tool
5. Open and execute `UNIFIED_DATABASE_INIT.sql`
6. Then open and execute `data.sql`

### Step 4: Start the Application

**Terminal 1 - Backend:**
```bash
# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

# Start server
uvicorn main:app --reload
```

Backend runs on: http://localhost:8000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Frontend runs on: http://localhost:5173

### Step 5: Access the Application

- **Frontend**: http://localhost:5173
- **API Docs**: http://localhost:8000/docs
- **Admin Panel**: http://localhost:5173/admin

**Default Admin Credentials:**
- Email: `admin@dali.com`
- Password: `Admin@123`

---

## 🔧 Manual Setup (Alternative)

If you prefer to set up manually or the automated script fails:

### 1. Install Python Dependencies

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

### 3. Create Directories

```bash
# Windows PowerShell
New-Item -ItemType Directory -Force frontend/public/images/products
New-Item -ItemType Directory -Force frontend/public/images/reviews
New-Item -ItemType Directory -Force frontend/public/images/profiles

# Mac/Linux
mkdir -p frontend/public/images/{products,reviews,profiles}
```

### 4. Configure Environment

Create `.env` file in root directory with this content:

```env
# Database
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/dali_db

# Security
SECRET_KEY=your-random-secret-key-change-this

# Email (Optional for testing)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_FROM_NAME=DALI Grocery

# Frontend
FRONTEND_URL=http://localhost:5173

# Warehouse Location
WAREHOUSE_LAT=14.5995
WAREHOUSE_LON=120.9842

# Maya Payment (Optional - Sandbox)
MAYA_PUBLIC_KEY=your-key
MAYA_SECRET_KEY=your-key
MAYA_BASE_URL=https://pg-sandbox.paymaya.com

# Super Admin
SUPER_ADMIN_EMAIL=admin@dali.com
SUPER_ADMIN_PASSWORD=Admin@123
```

### 5. Setup Database

```bash
# Create database
psql -U postgres -c "CREATE DATABASE dali_db;"

# Run schema
psql -U postgres -d dali_db -f UNIFIED_DATABASE_INIT.sql

# Load data
psql -U postgres -d dali_db -f data.sql
```

### 6. Run Application

**Backend:**
```bash
uvicorn main:app --reload
```

**Frontend (new terminal):**
```bash
cd frontend
npm run dev
```

---

## 🧪 Testing the Setup

### 1. Test Backend
Visit http://localhost:8000/docs to see the API documentation

### 2. Test Frontend
Visit http://localhost:5173 to see the homepage

### 3. Test Admin Login
1. Go to http://localhost:5173/admin/login
2. Login with `admin@dali.com` / `Admin@123`

### 4. Create Test Customer Account
1. Click "Register" on homepage
2. Fill in details
3. Check console for verification email (if email not configured, check backend logs for verification URL)

---

## 📁 Project Structure

```
DALI_BE_Python/
├── app/                    # Backend application
│   ├── core/              # Config, database, security
│   ├── models/            # Database models
│   ├── routers/           # API endpoints
│   ├── schemas/           # Pydantic models
│   └── services/          # Business logic
├── frontend/              # React frontend
│   ├── public/           # Static files
│   └── src/              # Source code
├── scripts/              # Utility scripts
├── main.py              # FastAPI entry point
├── requirements.txt     # Python dependencies
├── .env                 # Environment variables
├── setup.py            # Setup automation script
└── *.sql               # Database scripts
```

---

## 🛠️ Common Issues

### Database Connection Error

**Error:** `could not connect to server`

**Solution:**
1. Ensure PostgreSQL service is running
2. Check username/password in `.env`
3. Verify database exists: `psql -U postgres -l`

### Port Already in Use

**Error:** `Address already in use: 8000` or `5173`

**Solution:**
```bash
# Windows - Kill process on port
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:8000 | xargs kill -9
```

### Import Errors

**Error:** `ModuleNotFoundError`

**Solution:**
```bash
# Ensure virtual environment is activated
# Then reinstall dependencies
pip install -r requirements.txt
```

### Frontend Won't Start

**Error:** `Cannot find module`

**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json  # or del on Windows
npm install
```

---

## 📚 Next Steps

- ✅ Read the [User Manual](USER_MANUAL.md) for feature details
- ✅ Check [README.md](README.md) for architecture info
- ✅ See [DOCUMENTATION.md](DOCUMENTATION.md) for technical details
- ✅ Configure email settings for order notifications
- ✅ Set up Maya payment integration for testing

---

## 🆘 Getting Help

If you encounter issues:

1. Check the error message carefully
2. Review the Common Issues section above
3. Ensure all prerequisites are installed correctly
4. Verify `.env` file is properly configured
5. Check that database is running and accessible

---

## 🔐 Security Notes

**Important for Production:**

- ✅ Change default admin credentials immediately
- ✅ Generate a strong SECRET_KEY
- ✅ Use strong database password
- ✅ Never commit `.env` file to version control
- ✅ Enable HTTPS in production
- ✅ Configure CORS properly
- ✅ Update Maya keys to production keys

---

**🎉 You're all set! Happy coding with DALI!**
