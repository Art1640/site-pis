#!/bin/bash

echo "🌼 Démarrage du serveur de développement Pissenlits..."
echo

# Supprimer le cache Vite qui peut causer des problèmes
if [ -d "node_modules/.vite" ]; then
    echo "Nettoyage du cache Vite..."
    rm -rf node_modules/.vite
fi

# Démarrer le serveur de développement
echo "Démarrage du serveur..."
npm run dev
