#!/bin/bash
# Migration script to load data from JSON to Render PostgreSQL database
# Usage: ./migrate-to-render.sh

echo "🌼 Pissenlits Fundraising - Migrate to Render Database"
echo "========================================================"
echo ""

# Activate virtual environment
if [ -d "venv" ]; then
    echo "🔧 Activating virtual environment..."
    source venv/bin/activate
else
    echo "⚠️  Warning: venv not found, using system Python"
fi

# Render PostgreSQL connection URL (External)
# Note: Use the EXTERNAL hostname, not the internal one
export DATABASE_URL="postgresql://fundraising_6qql_user:GfV7AkHA9YDfhPUvSxaxBQ16xniJ6J2X@dpg-d5qht56r433s7383q740-a.oregon-postgres.render.com/fundraising_6qql"

echo "🔗 Connecting to Render PostgreSQL database..."
echo "📊 Database: dpg-d5qht56r433s7383q740-a.oregon-postgres.render.com"
echo ""

# Run the migration script
python3 migrate_data.py

echo ""
echo "✅ Migration complete!"

