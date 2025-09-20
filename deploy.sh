#!/bin/bash

# 🌼 Pissenlits Fundraising - Deployment Script
# This script builds and deploys the frontend-only app to GitHub Pages

echo "🌼 Déploiement de l'application Pissenlits..."

# Check if we're in the right directory
if [ ! -f "frontend/package.json" ]; then
    echo "❌ Erreur: Ce script doit être exécuté depuis la racine du projet"
    exit 1
fi

# Navigate to frontend directory
cd frontend

echo "📦 Installation des dépendances..."
npm install

echo "🏗️ Construction de l'application..."
npm run build

echo "✅ Construction terminée!"
echo ""
echo "📁 Les fichiers sont prêts dans frontend/dist/"
echo ""
echo "🚀 Pour déployer sur GitHub Pages:"
echo "1. Créez un repository sur GitHub"
echo "2. Poussez votre code"
echo "3. Allez dans Settings > Pages"
echo "4. Sélectionnez 'GitHub Actions' comme source"
echo "5. Créez le fichier .github/workflows/deploy.yml avec le contenu fourni"
echo ""
echo "🌐 Votre site sera disponible sur: https://[username].github.io/[repository-name]"
