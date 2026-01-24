#!/bin/bash

# 🌼 Pissenlits Backend - Local Development Startup Script

echo "🌼 Starting Pissenlits Backend (Local Development)"
echo "=================================================="

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo "❌ Failed to create virtual environment!"
        exit 1
    fi
fi

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies!"
    exit 1
fi

# Check if database exists and has data
if [ ! -f "instance/fundraising.db" ]; then
    echo ""
    echo "📊 No database found. Would you like to migrate data from JSON? (yes/no)"
    read -r response
    if [ "$response" = "yes" ]; then
        echo "🔄 Running migration..."
        python migrate_data.py
    fi
fi

# Set environment for development
export FLASK_ENV=development

echo ""
echo "✅ Setup complete!"
echo "🚀 Starting Flask backend..."
echo ""

# Start the backend
python app.py

