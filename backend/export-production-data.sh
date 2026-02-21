#!/bin/bash
# Export script to download all data from production PostgreSQL database
# Usage: ./export-production-data.sh

echo "🌼 Pissenlits Fundraising - Export Production Data"
echo "========================================================"
echo ""

# Load environment variables from .env file
if [ -f ".env" ]; then
    echo "🔧 Loading environment variables from .env..."
    export $(grep -v '^#' .env | xargs)
else
    echo "⚠️  Warning: .env file not found!"
    echo "    Please create a .env file with DATABASE_URL"
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

echo ""

# Run the export script
python3 export_data.py

echo ""
echo "✅ Done!"

