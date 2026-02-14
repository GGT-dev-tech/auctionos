#! /usr/bin/env bash
set -e

# Run migrations
echo "Running database migrations..."
alembic upgrade head

# Ensure admin user has permissions
# Ensure admin user has permissions
python3 scripts/ensure_admin.py

# Start application
echo "Starting application..."
uvicorn app.main:app --host 0.0.0.0 --port 8000
