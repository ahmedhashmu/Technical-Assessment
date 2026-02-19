#!/bin/bash
set -e

echo "=== Railway Nixpacks Build ==="
python3 --version

echo "=== Installing backend requirements ==="
cd backend
python3 -m pip install --no-cache-dir -r requirements.txt

echo "=== Verifying psycopg2 ==="
python3 -c "import psycopg2; print('psycopg2 installed:', psycopg2.__version__)"

echo "=== Build complete ==="
