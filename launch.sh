#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🏕️  Scouts Fundraising Project Launcher${NC}"
echo "========================================"

# Function to check if port is available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 1  # Port is in use
    else
        return 0  # Port is available
    fi
}

# Function to find available port
find_available_port() {
    local start_port=$1
    local port=$start_port
    while [ $port -lt $((start_port + 100)) ]; do
        if check_port $port; then
            echo $port
            return
        fi
        port=$((port + 1))
    done
    echo ""
}

# Check backend port
BACKEND_PORT=5000
if ! check_port $BACKEND_PORT; then
    echo -e "${YELLOW}⚠️  Port $BACKEND_PORT is in use, finding alternative...${NC}"
    BACKEND_PORT=$(find_available_port 5000)
    if [ -z "$BACKEND_PORT" ]; then
        echo -e "${RED}❌ No available ports found for backend!${NC}"
        exit 1
    fi
    echo -e "${YELLOW}📡 Using port $BACKEND_PORT for backend${NC}"
fi

# Check frontend port
FRONTEND_PORT=3000
if ! check_port $FRONTEND_PORT; then
    echo -e "${YELLOW}⚠️  Port $FRONTEND_PORT is in use, finding alternative...${NC}"
    FRONTEND_PORT=$(find_available_port 3000)
    if [ -z "$FRONTEND_PORT" ]; then
        echo -e "${RED}❌ No available ports found for frontend!${NC}"
        exit 1
    fi
    echo -e "${YELLOW}🌐 Using port $FRONTEND_PORT for frontend${NC}"
fi

echo ""
echo -e "${BLUE}🔧 Setting up backend...${NC}"

# Navigate to backend directory
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}📦 Creating virtual environment...${NC}"
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to create virtual environment!${NC}"
        exit 1
    fi
fi

# Activate virtual environment
echo -e "${YELLOW}🔌 Activating virtual environment...${NC}"
source venv/bin/activate

# Install dependencies
echo -e "${YELLOW}📥 Installing Python dependencies...${NC}"
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install Python dependencies!${NC}"
    exit 1
fi

# Start backend server in background
echo -e "${GREEN}🚀 Starting Flask backend on port $BACKEND_PORT...${NC}"
export FLASK_ENV=development
python app.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Check if backend started successfully
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${RED}❌ Backend failed to start!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Backend running on http://localhost:$BACKEND_PORT${NC}"

# Navigate to frontend directory
cd ../frontend

echo ""
echo -e "${BLUE}🔧 Setting up frontend...${NC}"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing Node.js dependencies...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install Node.js dependencies!${NC}"
        kill $BACKEND_PID
        exit 1
    fi
fi

# Start frontend server
echo -e "${GREEN}🚀 Starting Vite frontend on port $FRONTEND_PORT...${NC}"
npm run dev -- --port $FRONTEND_PORT &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 5

echo ""
echo -e "${GREEN}🎉 Both servers are running!${NC}"
echo -e "${GREEN}📡 Backend: http://localhost:$BACKEND_PORT${NC}"
echo -e "${GREEN}🌐 Frontend: http://localhost:$FRONTEND_PORT${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Stopping servers...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}✅ Servers stopped${NC}"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for user to stop
wait
