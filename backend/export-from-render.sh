#!/bin/bash
# Export script to download all data from Render PostgreSQL database
# This script uses the production database URL directly
# Usage: ./export-from-render.sh

echo "🌼 Pissenlits Fundraising - Export from Render PostgreSQL"
echo "========================================================"
echo ""

# Activate virtual environment
if [ -d "venv" ]; then
    echo "🔧 Activating virtual environment..."
    source venv/bin/activate
else
    echo "⚠️  Warning: venv not found, using system Python"
fi

# Set the production database URL directly
# This overrides any DATABASE_URL in .env
export DATABASE_URL="postgresql://fundraising_6qql_user:GfV7AkHA9YDfhPUvSxaxBQ16xniJ6J2X@dpg-d5qht56r433s7383q740-a.oregon-postgres.render.com/fundraising_6qql"

echo "🔗 Connecting to Render PostgreSQL database..."
echo ""

# Run the export script
python3 export_data.py

echo ""
echo "✅ Done!"

