# 🌼 Pissenlits Fundraising Website - Projet 2025-2026

Un site web moderne et responsive pour suivre la collecte de fonds du projet Pissenlits 2025-2026. Le site affiche les données de collecte sous forme de graphiques interactifs et de tableaux, entièrement en français.

## 🚀 Fonctionnalités

- **Page d'accueil** :
  - Graphique linéaire montrant l'évolution cumulative des fonds collectés
  - Vue totale ou par personne avec boutons de basculement
  - Période complète de septembre 2025 à juin 2026
  - Évolution en temps réel jusqu'à aujourd'hui
- **Classement** : Podium des meilleurs contributeurs et graphique en barres horizontales
- **Activités** : Graphique circulaire des fonds par type d'activité et tableau récapitulatif
- **Toutes les collectes** : Tableau filtrable et triable de tous les enregistrements
- **Design responsive** : Optimisé pour desktop et mobile
- **Thème Pissenlits** : Couleurs blanc et bleu foncé adaptées à l'identité des Pissenlits

## 🛠️ Technologies utilisées

### Backend
- **Python 3.8+** avec **Flask**
- **Flask-CORS** pour les requêtes cross-origin
- Stockage des données en **JSON**
- API REST avec endpoints `/api/records` et `/api/summary`

### Frontend
- **React 18** avec **TypeScript**
- **Vite** pour le développement rapide avec HMR
- **Tailwind CSS** pour le styling responsive
- **Chart.js** avec **react-chartjs-2** pour les graphiques
- **React Router** pour la navigation
- **Axios** pour les appels API

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Python 3.8+** ([Télécharger Python](https://www.python.org/downloads/))
- **Node.js 16+** et **npm** ([Télécharger Node.js](https://nodejs.org/))
- **Git** ([Télécharger Git](https://git-scm.com/downloads))

### Vérification des prérequis

```bash
python3 --version  # Doit afficher Python 3.8+
node --version     # Doit afficher v16+
npm --version      # Doit afficher 8+
```

## 🚀 Installation et lancement

### Option 1 : Lancement automatique (Recommandé)

Le script `launch.sh` configure et lance automatiquement les deux serveurs :

```bash
# Cloner le projet
git clone <url-du-repo>
cd scouts-fundraising

# Lancer les deux serveurs
./launch.sh
```

Le script va :
- Créer l'environnement virtuel Python
- Installer les dépendances backend
- Installer les dépendances frontend
- Vérifier la disponibilité des ports (5000 pour backend, 3000 pour frontend)
- Lancer les deux serveurs simultanément

### Option 2 : Lancement manuel

#### Backend

```bash
# Naviguer vers le dossier backend
cd backend

# Créer l'environnement virtuel
python3 -m venv venv

# Activer l'environnement virtuel
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate     # Windows

# Installer les dépendances
pip install -r requirements.txt

# Lancer le serveur Flask
python app.py
```

Le backend sera accessible sur `http://localhost:5000`

#### Frontend

```bash
# Dans un nouveau terminal, naviguer vers le dossier frontend
cd frontend

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

Le frontend sera accessible sur `http://localhost:3000`

### Option 3 : Utilisation des tâches VS Code

Si vous utilisez VS Code, vous pouvez utiliser les tâches prédéfinies :

1. Ouvrir le projet dans VS Code
2. Appuyer sur `Ctrl+Shift+P` (ou `Cmd+Shift+P` sur Mac)
3. Taper "Tasks: Run Task"
4. Choisir une des tâches disponibles :
   - **Launch Project** : Lance le script automatique
   - **Start Both Servers** : Lance les deux serveurs en parallèle
   - **Start Backend** : Lance uniquement le backend
   - **Start Frontend** : Lance uniquement le frontend

## 📁 Structure du projet

```
scouts-fundraising/
├── backend/
│   ├── app.py              # Application Flask principale
│   ├── data.json           # Données de collecte (25 enregistrements)
│   ├── requirements.txt    # Dépendances Python
│   └── venv/               # Environnement virtuel (créé automatiquement)
├── frontend/
│   ├── src/
│   │   ├── components/     # Composants React réutilisables
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx
│   │   ├── pages/          # Pages de l'application
│   │   │   ├── HomePage.tsx
│   │   │   ├── LeaderboardPage.tsx
│   │   │   ├── ActivitiesPage.tsx
│   │   │   └── AllRecordsPage.tsx
│   │   ├── services/       # Services API
│   │   │   └── api.ts
│   │   ├── types/          # Types TypeScript
│   │   │   └── index.ts
│   │   ├── App.tsx         # Composant principal
│   │   ├── main.tsx        # Point d'entrée
│   │   └── index.css       # Styles globaux
│   ├── package.json        # Dépendances Node.js
│   ├── vite.config.ts      # Configuration Vite
│   ├── tailwind.config.js  # Configuration Tailwind
│   └── tsconfig.json       # Configuration TypeScript
├── .vscode/
│   └── tasks.json          # Tâches VS Code
├── launch.sh               # Script de lancement automatique
└── README.md               # Ce fichier
```

## 🔧 Configuration

### Ports par défaut

- **Backend** : `http://localhost:5000`
- **Frontend** : `http://localhost:3000`

Si ces ports sont occupés, le script `launch.sh` trouvera automatiquement des ports alternatifs.

### Données de test

Le fichier `backend/data.json` contient 25 enregistrements de test couvrant la période de septembre à novembre 2025, avec différents types d'activités et contributeurs.

## 🎨 Personnalisation

### Couleurs du thème Pissenlits

Les couleurs sont définies dans `frontend/tailwind.config.js` :

```javascript
colors: {
  scouts: {
    blue: '#1E3A8A',      // Bleu foncé principal
    'blue-dark': '#1E40AF', // Bleu plus foncé
    'blue-light': '#3B82F6', // Bleu plus clair
    white: '#FFFFFF',      // Blanc
    gray: '#6B7280',       // Gris pour le texte
  }
}
```

### Ajout de nouvelles données

Pour ajouter de nouveaux enregistrements, modifiez le fichier `backend/data.json` en respectant la structure :

```json
{
  "Date": "2025-12-01",
  "Nom": "Prénom Nom",
  "Activité": "Type d'activité",
  "Détails": "Description détaillée",
  "Montant": 123.45,
  "Qui": "Responsable de l'enregistrement"
}
```

## 🧪 Tests

### Backend

```bash
cd backend
source venv/bin/activate
pytest
```

### Frontend

```bash
cd frontend
npm run test
```

## 📦 Build de production

### Frontend

```bash
cd frontend
npm run build
```

Les fichiers de production seront générés dans le dossier `frontend/dist/`.

## 🚀 Déploiement

### Frontend (Vercel)

1. Connecter le repository à Vercel
2. Configurer le dossier de build : `frontend`
3. Configurer la commande de build : `npm run build`
4. Configurer le dossier de sortie : `dist`

### Backend (Render)

1. Créer un nouveau service web sur Render
2. Connecter le repository
3. Configurer le dossier racine : `backend`
4. Configurer la commande de build : `pip install -r requirements.txt`
5. Configurer la commande de démarrage : `python app.py`

## 🐛 Dépannage

### Problèmes courants

1. **Port déjà utilisé** : Le script `launch.sh` trouve automatiquement des ports alternatifs
2. **Erreur de dépendances Python** : Vérifiez que Python 3.8+ est installé
3. **Erreur de dépendances Node.js** : Supprimez `node_modules` et relancez `npm install`
4. **Problème de CORS** : Vérifiez que Flask-CORS est installé et configuré

### Logs

- **Backend** : Les logs s'affichent dans le terminal où Flask est lancé
- **Frontend** : Les logs s'affichent dans la console du navigateur (F12)

## 📞 Support

Pour toute question ou problème :

- **Email** : contact@scouts.fr
- **Issues** : Créer une issue sur le repository Git

## 📄 Licence

Ce projet est développé pour les Scouts de France. Tous droits réservés.

---

**Bonne collecte de fonds ! 🌼**
