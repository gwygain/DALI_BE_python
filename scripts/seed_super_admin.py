"""Seed or update a super-admin in the `admin_accounts` table.

Usage:
  python scripts/seed_super_admin.py

The script reads `SUPER_ADMIN_EMAIL` and `SUPER_ADMIN_PASSWORD` from the project's `.env`
via `app.core.config.settings`. It will create the admin if missing or update the
password/is_super_admin flag if present.
"""
import os
import sys

# Ensure project root is on sys.path so `import app` works when running this script
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from app.core.config import settings
from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models import AdminAccount
from sqlalchemy.exc import SQLAlchemyError


def seed_super_admin():
    email = settings.SUPER_ADMIN_EMAIL
    password = settings.SUPER_ADMIN_PASSWORD

    if not email or not password:
        print("SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD must be set in .env")
        return 1

    hashed = get_password_hash(password)
    db = SessionLocal()
    try:
        admin = db.query(AdminAccount).filter(AdminAccount.account_email == email).first()
        if admin:
            updated = False
            if not admin.is_super_admin:
                admin.is_super_admin = True
                updated = True
            # Always update password to the provided one (useful for dev seeding)
            if admin.password_hash != hashed:
                admin.password_hash = hashed
                updated = True

            if updated:
                db.add(admin)
                db.commit()
                print(f"Updated existing admin '{email}' (is_super_admin=True).")
            else:
                print(f"Admin '{email}' already exists and is up to date.")
        else:
            new_admin = AdminAccount(
                account_email=email,
                password_hash=hashed,
                is_super_admin=True
            )
            db.add(new_admin)
            db.commit()
            print(f"Created super admin '{email}'.")

    except SQLAlchemyError as exc:
        db.rollback()
        print("Database error:", exc)
        return 2
    finally:
        db.close()

    return 0


if __name__ == '__main__':
    raise SystemExit(seed_super_admin())
