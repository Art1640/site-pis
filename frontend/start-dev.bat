@echo off
echo 🌼 Démarrage du serveur de développement Pissenlits...
echo.

REM Supprimer le cache Vite qui peut causer des problèmes sur Windows
if exist "node_modules\.vite" (
    echo Nettoyage du cache Vite...
    rmdir /s /q "node_modules\.vite" 2>nul
)

REM Démarrer le serveur de développement
echo Démarrage du serveur...
npm run dev

pause
