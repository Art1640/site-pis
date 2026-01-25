# 🌍 Environment Variables Setup Guide

This guide explains how environment variables work in this project and how to set them up correctly.

## 📋 Overview

This project uses **different environment variables** for different environments:

| Environment | Frontend | Backend | Database |
|-------------|----------|---------|----------|
| **Local Development** | `localhost:5173` | `localhost:5000` | SQLite (local file) |
| **Production** | `moulah-pi.fr` | `site-pis.onrender.com` | PostgreSQL (Render) |

## 🔧 Local Development Setup

### 1️⃣ **Frontend Setup**

Copy the example file and customize:

```bash
cd frontend
cp .env.example .env
```

Your `frontend/.env` should contain:
```env
VITE_USE_BACKEND=true
VITE_API_URL=http://localhost:5000
```

### 2️⃣ **Backend Setup**

Copy the example file:

```bash
cd backend
cp .env.example .env
```

Your `backend/.env` should contain:
```env
FLASK_ENV=development
PORT=5000
```

**Note**: `DATABASE_URL` is intentionally not set, so the app defaults to SQLite (`backend/instance/fundraising.db`)

### 3️⃣ **Start Development Servers**

**Option A: Using VS Code Tasks**
- Press `Ctrl+Shift+P` → "Tasks: Run Task" → "Start Full Stack (Frontend + Backend)"

**Option B: Manual**
```bash
# Terminal 1 - Backend
cd backend
source venv/bin/activate
python app.py

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 4️⃣ **Verify Local Setup**

Open `http://localhost:5173` and check the console:
```
🔗 API Base URL: http://localhost:5000
🔧 API Mode: Backend API
```

✅ **Correct**: Using local backend  
❌ **Wrong**: Using `https://site-pis.onrender.com` (production)

---

## 🚀 Production Deployment

### **Frontend (GitHub Pages)**

Environment variables are **injected during build** by GitHub Actions.

See `.github/workflows/deploy.yml`:
```yaml
- name: Build
  env:
    VITE_USE_BACKEND: true
    VITE_API_URL: https://site-pis.onrender.com
  run: |
    cd frontend
    npm run build
```

**How it works**:
1. You push code to `main` branch
2. GitHub Actions runs the workflow
3. Vite build **bakes** the environment variables into the JavaScript bundle
4. Static files are deployed to GitHub Pages
5. Users see the production site at `moulah-pi.fr`

### **Backend (Render)**

Environment variables are **auto-injected** by Render.

See `render.yaml`:
```yaml
envVars:
  - key: DATABASE_URL
    fromDatabase:
      name: pissenlits-db
      property: connectionString
```

**How it works**:
1. You push code to `main` branch
2. Render detects the push and rebuilds
3. Render injects `DATABASE_URL` from the PostgreSQL database
4. Flask app reads `DATABASE_URL` and connects to PostgreSQL
5. Backend is live at `https://site-pis.onrender.com`

---

## 🔐 Security Best Practices

### ✅ **DO:**
- Keep `.env` files in `.gitignore`
- Use `.env.example` as templates (tracked in git)
- Use different values for local vs production
- Inject production secrets via CI/CD (GitHub Actions, Render)

### ❌ **DON'T:**
- Commit `.env` files to git
- Hardcode secrets in source code
- Use production credentials locally
- Share `.env` files publicly

---

## 📁 File Structure

```
site-pis/
├── frontend/
│   ├── .env                 # ❌ NOT tracked in git (local settings)
│   └── .env.example         # ✅ Tracked in git (template)
├── backend/
│   ├── .env                 # ❌ NOT tracked in git (local settings)
│   └── .env.example         # ✅ Tracked in git (template)
├── .github/workflows/
│   └── deploy.yml           # ✅ Production env vars for frontend
└── render.yaml              # ✅ Production env vars for backend
```

---

## 🐛 Troubleshooting

### **Problem**: Local frontend connects to production backend

**Symptoms**:
```
🔗 API Base URL: https://site-pis.onrender.com  ❌
```

**Solution**:
1. Check `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:5000
   ```
2. Restart the frontend dev server (`Ctrl+C` and `npm run dev`)
3. Hard refresh browser (`Ctrl+Shift+R`)

### **Problem**: Production site uses localhost

**Symptoms**:
```
🔗 API Base URL: http://localhost:5000  ❌
```

**Solution**:
1. Check `.github/workflows/deploy.yml` has correct env vars (lines 42-44)
2. Push to `main` branch to trigger rebuild
3. Wait for GitHub Actions to complete
4. Hard refresh browser (`Ctrl+Shift+R`)

### **Problem**: Backend can't connect to database

**Local Development**:
- SQLite file should be at `backend/instance/fundraising.db`
- Run `python migrate_data.py` to populate it

**Production**:
- Check Render dashboard → Database → Connection String
- Verify `render.yaml` links database correctly

---

## 📚 Additional Resources

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [GitHub Actions Environment Variables](https://docs.github.com/en/actions/learn-github-actions/variables)
- [Render Environment Variables](https://render.com/docs/environment-variables)

