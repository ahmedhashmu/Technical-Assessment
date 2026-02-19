#!/bin/bash
set -e

echo "=== Starting build process ==="
echo "Python version:"
python --version

echo "=== Upgrading pip ==="
pip install --upgrade pip

echo "=== Installing backend requirements ==="
cd backend
pip install --no-cache-dir -r requirements.txt

echo "=== Verifying psycopg2 installation ==="
python -c "import psycopg2; print(f'psycopg2 version: {psycopg2.__version__}')"

echo "=== Build complete ==="
