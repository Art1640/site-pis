#!/bin/bash

# Build script for GitHub Pages deployment
echo "🌼 Building for GitHub Pages (art1640.github.io/site-pis)..."

# Ensure we're using subdirectory path for GitHub Pages
export VITE_GITHUB_PAGES="true"

# Build the project
npm run build

echo "✅ Build complete!"
echo "📁 Files are ready in dist/ folder"
echo "🌐 Deploy via GitHub Actions or manually to gh-pages branch"
echo ""
echo "Generated paths in index.html:"
grep -E "(href|src)=" dist/index.html | head -3
