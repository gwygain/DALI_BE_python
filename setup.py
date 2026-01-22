"""
DALI E-Commerce Platform - Automated Setup Script

This script automates the initial setup process for the DALI platform.
It will:
1. Check for required dependencies (Python, Node.js, PostgreSQL)
2. Create and configure the database
3. Install Python dependencies
4. Install frontend dependencies
5. Create necessary directories
6. Generate .env file template if not exists

Usage:
    python setup.py
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path

class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_header(message):
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*70}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{message.center(70)}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'='*70}{Colors.ENDC}\n")

def print_success(message):
    print(f"{Colors.OKGREEN}✓ {message}{Colors.ENDC}")

def print_error(message):
    print(f"{Colors.FAIL}✗ {message}{Colors.ENDC}")

def print_warning(message):
    print(f"{Colors.WARNING}⚠ {message}{Colors.ENDC}")

def print_info(message):
    print(f"{Colors.OKBLUE}ℹ {message}{Colors.ENDC}")

def check_command(command, name):
    """Check if a command exists in the system."""
    try:
        subprocess.run([command, "--version"], capture_output=True, check=True)
        print_success(f"{name} is installed")
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        print_error(f"{name} is NOT installed")
        return False

def check_prerequisites():
    """Check if all required software is installed."""
    print_header("Checking Prerequisites")
    
    all_ok = True
    
    # Check Python
    if sys.version_info >= (3, 10):
        print_success(f"Python {sys.version.split()[0]} is installed")
    else:
        print_error(f"Python 3.10+ required. Current version: {sys.version.split()[0]}")
        all_ok = False
    
    # Check Node.js
    if not check_command("node", "Node.js"):
        all_ok = False
    
    # Check npm
    if not check_command("npm", "npm"):
        all_ok = False
    
    # Check PostgreSQL
    if not check_command("psql", "PostgreSQL"):
        print_warning("PostgreSQL psql command not found in PATH")
        print_info("Make sure PostgreSQL is installed and accessible")
        all_ok = False
    
    # Check Git
    check_command("git", "Git")  # Optional, not critical
    
    return all_ok

def create_env_file():
    """Create .env file from template if it doesn't exist."""
    print_header("Environment Configuration")
    
    env_path = Path(".env")
    env_example = """# Database Configuration
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/dali_db

# Session Secret (Generate a random string)
SECRET_KEY=your-secret-key-here-change-this-to-random-string

# Email Configuration (Gmail SMTP)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_FROM_NAME=DALI Grocery

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Warehouse Location (for shipping calculation)
WAREHOUSE_LAT=14.5995
WAREHOUSE_LON=120.9842

# Maya (PayMaya) Configuration - Sandbox
MAYA_PUBLIC_KEY=your-maya-public-key
MAYA_SECRET_KEY=your-maya-secret-key
MAYA_BASE_URL=https://pg-sandbox.paymaya.com

# Admin Email (for super admin account)
SUPER_ADMIN_EMAIL=admin@dali.com
SUPER_ADMIN_PASSWORD=Admin@123
"""
    
    if env_path.exists():
        print_info(".env file already exists")
        print_warning("Please ensure it's properly configured")
    else:
        with open(env_path, 'w') as f:
            f.write(env_example)
        print_success(".env file created")
        print_warning("⚠ IMPORTANT: Edit .env file and update all values!")
        print_info("  - Set your PostgreSQL password")
        print_info("  - Generate a random SECRET_KEY")
        print_info("  - Configure email settings (optional for testing)")
        print_info("  - Add Maya API keys (optional for payment testing)")

def create_directories():
    """Create necessary directories for the application."""
    print_header("Creating Directories")
    
    directories = [
        "frontend/public/images/products",
        "frontend/public/images/reviews",
        "frontend/public/images/profiles",
    ]
    
    for dir_path in directories:
        Path(dir_path).mkdir(parents=True, exist_ok=True)
        print_success(f"Created: {dir_path}")

def install_python_dependencies():
    """Install Python dependencies."""
    print_header("Installing Python Dependencies")
    
    try:
        # Create virtual environment if it doesn't exist
        if not Path("venv").exists():
            print_info("Creating virtual environment...")
            subprocess.run([sys.executable, "-m", "venv", "venv"], check=True)
            print_success("Virtual environment created")
        else:
            print_info("Virtual environment already exists")
        
        # Determine pip path based on OS
        if sys.platform == "win32":
            pip_path = "venv\\Scripts\\pip.exe"
        else:
            pip_path = "venv/bin/pip"
        
        # Install dependencies
        print_info("Installing dependencies from requirements.txt...")
        subprocess.run([pip_path, "install", "-r", "requirements.txt"], check=True)
        print_success("Python dependencies installed")
        
    except subprocess.CalledProcessError as e:
        print_error(f"Failed to install Python dependencies: {e}")
        return False
    
    return True

def install_frontend_dependencies():
    """Install frontend dependencies."""
    print_header("Installing Frontend Dependencies")
    
    try:
        os.chdir("frontend")
        print_info("Installing npm packages...")
        subprocess.run(["npm", "install"], check=True)
        os.chdir("..")
        print_success("Frontend dependencies installed")
    except subprocess.CalledProcessError as e:
        print_error(f"Failed to install frontend dependencies: {e}")
        os.chdir("..")
        return False
    
    return True

def setup_database():
    """Setup PostgreSQL database."""
    print_header("Database Setup")
    
    print_info("Database setup requires manual steps:")
    print("")
    print("1. Open pgAdmin or psql command line")
    print("2. Create database:")
    print(f"   {Colors.OKCYAN}CREATE DATABASE dali_db;{Colors.ENDC}")
    print("")
    print("3. Run the database initialization script:")
    print(f"   {Colors.OKCYAN}psql -U postgres -d dali_db -f UNIFIED_DATABASE_INIT.sql{Colors.ENDC}")
    print("")
    print("4. Load initial data:")
    print(f"   {Colors.OKCYAN}psql -U postgres -d dali_db -f data.sql{Colors.ENDC}")
    print("")
    
    response = input(f"\n{Colors.BOLD}Have you completed the database setup? (y/n): {Colors.ENDC}").lower()
    return response == 'y'

def print_next_steps():
    """Print instructions for running the application."""
    print_header("Setup Complete!")
    
    print(f"{Colors.OKGREEN}✓ All dependencies installed{Colors.ENDC}\n")
    
    print(f"{Colors.BOLD}Next Steps:{Colors.ENDC}\n")
    
    print(f"{Colors.OKCYAN}1. Configure Environment Variables:{Colors.ENDC}")
    print(f"   Edit the .env file and update:")
    print(f"   - DATABASE_URL (set your PostgreSQL password)")
    print(f"   - SECRET_KEY (generate a random string)")
    print(f"   - Email settings (for notifications)")
    print("")
    
    print(f"{Colors.OKCYAN}2. Start the Backend:{Colors.ENDC}")
    if sys.platform == "win32":
        print(f"   venv\\Scripts\\activate")
    else:
        print(f"   source venv/bin/activate")
    print(f"   uvicorn main:app --reload")
    print(f"   Backend will run on: http://localhost:8000")
    print("")
    
    print(f"{Colors.OKCYAN}3. Start the Frontend (in new terminal):{Colors.ENDC}")
    print(f"   cd frontend")
    print(f"   npm run dev")
    print(f"   Frontend will run on: http://localhost:5173")
    print("")
    
    print(f"{Colors.OKCYAN}4. Access the Application:{Colors.ENDC}")
    print(f"   Frontend: http://localhost:5173")
    print(f"   API Docs: http://localhost:8000/docs")
    print(f"   Admin Panel: http://localhost:5173/admin")
    print("")
    
    print(f"{Colors.WARNING}Default Admin Login:{Colors.ENDC}")
    print(f"   Email: admin@dali.com")
    print(f"   Password: Admin@123")
    print(f"   {Colors.WARNING}(Change these in production!){Colors.ENDC}")
    print("")

def main():
    """Main setup function."""
    print(f"\n{Colors.HEADER}{Colors.BOLD}")
    print("╔════════════════════════════════════════════════════════════════════╗")
    print("║          DALI E-Commerce Platform - Setup Wizard                  ║")
    print("╚════════════════════════════════════════════════════════════════════╝")
    print(f"{Colors.ENDC}")
    
    # Check prerequisites
    if not check_prerequisites():
        print_error("\n❌ Missing prerequisites. Please install required software and try again.")
        print_info("\nRequired:")
        print_info("  - Python 3.10+: https://www.python.org/downloads/")
        print_info("  - Node.js 18+: https://nodejs.org/")
        print_info("  - PostgreSQL 14+: https://www.postgresql.org/download/")
        sys.exit(1)
    
    # Create .env file
    create_env_file()
    
    # Create directories
    create_directories()
    
    # Install Python dependencies
    if not install_python_dependencies():
        print_error("\n❌ Failed to install Python dependencies")
        sys.exit(1)
    
    # Install frontend dependencies
    if not install_frontend_dependencies():
        print_error("\n❌ Failed to install frontend dependencies")
        sys.exit(1)
    
    # Database setup
    if not setup_database():
        print_warning("\n⚠ Database setup incomplete")
        print_info("Please complete database setup manually and re-run this script")
        sys.exit(1)
    
    # Print next steps
    print_next_steps()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n\n{Colors.WARNING}Setup cancelled by user{Colors.ENDC}")
        sys.exit(1)
    except Exception as e:
        print_error(f"\n❌ Setup failed with error: {e}")
        sys.exit(1)
