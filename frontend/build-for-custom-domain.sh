#!/bin/bash

# Build script for custom domain deployment (moulah-pi.fr)
echo "🌼 Building for custom domain (moulah-pi.fr)..."

# Ensure we're using root path for custom domain
export VITE_BASE_PATH="/"

# Build the project
npm run build

echo "✅ Build complete!"
echo "📁 Files are ready in dist/ folder"
echo "🌐 Deploy the dist/ folder contents to moulah-pi.fr"
echo ""
echo "Generated paths in index.html:"
grep -E "(href|src)=" dist/index.html | head -3
