# Local Setup Instructions

## Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Initialize database
python -m app.db.init_db

# Start backend server
uvicorn app.main:app --reload --port 8000
```

## Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## Environment Variables

Make sure `.env` files are configured:
- `backend/.env` - Database, LLM API keys
- `frontend/.env.local` - API URL

## Access

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Troubleshooting

If psycopg installation fails, install PostgreSQL development files:
```bash
# macOS
brew install postgresql

# Ubuntu/Debian
sudo apt-get install libpq-dev

# Or use SQLite for local development
```
