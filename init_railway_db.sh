#!/bin/bash
# Initialize database on Railway deployment

echo "Initializing database..."
cd backend && python -m app.db.init_db
echo "Database initialization complete!"
