# 🌼 Pissenlits Backend API

Flask backend with PostgreSQL database for the Pissenlits fundraising tracker.

## 🚀 Quick Start

### Local Development (SQLite)

```bash
./start-local.sh
```

This will:
1. Create a virtual environment
2. Install dependencies
3. Optionally migrate data from JSON
4. Start the Flask server on http://localhost:5000

### Local Development (PostgreSQL)

```bash
# Install PostgreSQL first, then:
createdb fundraising

# Set environment variable
export DATABASE_URL="postgresql://localhost/fundraising"

# Install dependencies
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Migrate data
python migrate_data.py

# Start server
python app.py
```

## 📡 API Endpoints

### GET /api/records
Get all fundraising records.

**Response:**
```json
[
  {
    "Date": "2025-09-19",
    "Qui": "Groupe",
    "Type": "Bar Pi",
    "Activité": "Bar Pi #1",
    "Détails": "Tout le monde présent",
    "Montant": 150.03
  }
]
```

### POST /api/records
Add a new fundraising record.

**Request Body:**
```json
{
  "Date": "2026-01-24",
  "Qui": "Dorcopsis",
  "Type": "Vente",
  "Activité": "Cookies",
  "Détails": "Dans quartier",
  "Montant": 50
}
```

### POST /api/records/delete
Delete a record by matching Date, Qui, and Activité.

**Request Body:**
```json
{
  "Date": "2026-01-24",
  "Qui": "Dorcopsis",
  "Activité": "Cookies"
}
```

### GET /api/health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "database": "connected"
}
```

## 🗄️ Database

### Schema

```sql
CREATE TABLE fundraising_records (
    id SERIAL PRIMARY KEY,
    date VARCHAR(10) NOT NULL,
    qui VARCHAR(500) NOT NULL,
    type VARCHAR(100) NOT NULL,
    activite VARCHAR(200) NOT NULL,
    details TEXT,
    montant TEXT NOT NULL
);
```

### Migration

To migrate existing JSON data to the database:

```bash
python migrate_data.py
```

This will:
- Load data from `../frontend/src/data/fundraising-data.json`
- Create database tables
- Insert all records
- Verify the migration

## 🌍 Environment Variables

Create a `.env` file (see `.env.example`):

```bash
# Development
FLASK_ENV=development
PORT=5000

# Database (optional, defaults to SQLite)
DATABASE_URL=postgresql://user:password@localhost:5432/fundraising
```

## 🧪 Testing

```bash
pytest
```

## 📦 Dependencies

- Flask 3.0.0 - Web framework
- Flask-CORS 4.0.0 - CORS support
- Flask-SQLAlchemy 3.1.1 - Database ORM
- psycopg2-binary 2.9.9 - PostgreSQL adapter
- python-dotenv 1.0.0 - Environment variables

## 🔧 Development

### Database Modes

The app automatically detects the database type:

- **No DATABASE_URL**: Uses SQLite (`fundraising.db`)
- **DATABASE_URL set**: Uses PostgreSQL

### CORS

CORS is enabled for all origins. In production, you may want to restrict this:

```python
CORS(app, origins=["https://your-frontend-domain.com"])
```

## 🚀 Deployment

See [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md) for full deployment instructions.

### Render

The app is configured for Render deployment via `render.yaml` in the root directory.

### Manual Deployment

1. Set `DATABASE_URL` environment variable
2. Set `PORT` environment variable (Render does this automatically)
3. Run `python app.py`

## 📝 Notes

- The `montant` field can store either a number or an array (for split amounts)
- Records are identified by the combination of Date, Qui, and Activité
- The database uses UTF-8 encoding for French characters

