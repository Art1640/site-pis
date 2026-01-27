#!/bin/bash
# Migration script to load data from JSON to Render PostgreSQL database
# Usage: ./migrate-to-render.sh

echo "🌼 Pissenlits Fundraising - Migrate to Render Database"
echo "========================================================"
echo ""

# Load environment variables from .env file
if [ -f ".env" ]; then
    echo "🔧 Loading environment variables from .env..."
    export $(grep -v '^#' .env | xargs)
else
    echo "⚠️  Warning: .env file not found!"
    echo "    Please create a .env file with DATABASE_URL"
    echo "    See .env.example for reference"
    exit 1
fi

# Activate virtual environment
if [ -d "venv" ]; then
    echo "🔧 Activating virtual environment..."
    source venv/bin/activate
else
    echo "⚠️  Warning: venv not found, using system Python"
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL not set in .env file"
    exit 1
fi

# Extract database host from URL for display (without credentials)
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^/]*\).*/\1/p')

echo "🔗 Connecting to Render PostgreSQL database..."
echo "📊 Database: $DB_HOST"
echo ""

# Run the migration script
python3 migrate_data.py

echo ""
echo "✅ Migration complete!"

