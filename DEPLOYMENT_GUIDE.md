# 🚀 Deployment Guide - Pissenlits Fundraising

This guide explains how to deploy your application with a PostgreSQL database backend.

## 📋 Overview

Your application now has two deployment modes:

1. **Frontend-only** (current): GitHub Pages with localStorage
2. **Full-stack** (new): GitHub Pages + Backend API + PostgreSQL Database

---

## 🎯 Option 1: Deploy Backend to Render (Recommended - FREE)

### Step 1: Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up with your GitHub account (easiest)

### Step 2: Deploy from GitHub

1. Push your code to GitHub (if not already done)
2. In Render dashboard, click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository
4. Render will automatically detect `render.yaml` and create:
   - ✅ PostgreSQL database
   - ✅ Backend API service
   - ✅ Automatic connection between them

### Step 3: Wait for Deployment

- Database creation: ~2-3 minutes
- Backend deployment: ~3-5 minutes
- You'll get a URL like: `https://pissenlits-backend.onrender.com`

### Step 4: Migrate Data to Database

Once deployed, you need to populate the database with your existing data:

```bash
# Option A: Use the migration script locally (pointing to production DB)
# First, get the DATABASE_URL from Render dashboard
# Then run:
cd backend
export DATABASE_URL="postgresql://user:pass@host/db"  # From Render
python migrate_data.py
```

**OR**

```bash
# Option B: SSH into Render and run migration
# In Render dashboard, go to your service → Shell tab
cd backend
python migrate_data.py
```

### Step 5: Update Frontend Configuration

Create `frontend/.env.production`:

```bash
VITE_API_URL=https://pissenlits-backend.onrender.com
VITE_USE_BACKEND=true
```

### Step 6: Rebuild and Deploy Frontend

```bash
cd frontend
npm run build
# Deploy to GitHub Pages as usual
```

---

## 🏠 Local Development with Database

### Option A: SQLite (Easiest)

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python migrate_data.py  # Load data into SQLite
python app.py

# Frontend (in another terminal)
cd frontend
cp .env.example .env
# Edit .env and set:
# VITE_USE_BACKEND=true
# VITE_API_URL=http://localhost:5000
npm run dev
```

### Option B: PostgreSQL (Production-like)

```bash
# Install PostgreSQL locally first
# Then create database:
createdb fundraising

# Set environment variable
export DATABASE_URL="postgresql://localhost/fundraising"

# Run migration
cd backend
python migrate_data.py
python app.py
```

---

## 🔄 Switching Between Modes

### Use Backend API:
```bash
# frontend/.env
VITE_USE_BACKEND=true
VITE_API_URL=https://your-backend.onrender.com
```

### Use localStorage (current mode):
```bash
# frontend/.env
VITE_USE_BACKEND=false
```

---

## 💰 Cost Breakdown

### Render Free Tier:
- ✅ PostgreSQL: 90 days free, then $7/month
- ✅ Web Service: Free forever (spins down after 15min inactivity)
- ⚠️ First request after spin-down takes ~30 seconds

### Alternative Free Options:

#### Railway:
- $5 free credit per month
- PostgreSQL + Backend included
- No spin-down delay

#### Supabase (Different approach):
- PostgreSQL: 500MB free forever
- No backend needed (direct database access)
- Built-in authentication

---

## 🔧 Troubleshooting

### Backend won't start:
```bash
# Check logs in Render dashboard
# Common issues:
# 1. Missing environment variables
# 2. Database not connected
# 3. Port configuration
```

### Frontend can't connect to backend:
```bash
# Check CORS settings in backend/app.py
# Make sure VITE_API_URL is correct
# Check browser console for errors
```

### Database migration fails:
```bash
# Make sure DATABASE_URL is set correctly
# Check that JSON file path is correct in migrate_data.py
# Verify database is accessible
```

---

## 📊 Database Schema

Your PostgreSQL database has one table:

```sql
CREATE TABLE fundraising_records (
    id SERIAL PRIMARY KEY,
    date VARCHAR(10) NOT NULL,
    qui VARCHAR(500) NOT NULL,
    type VARCHAR(100) NOT NULL,
    activite VARCHAR(200) NOT NULL,
    details TEXT,
    montant TEXT NOT NULL  -- JSON string for arrays
);
```

---

## 🎓 Next Steps

1. **Deploy backend to Render** (5-10 minutes)
2. **Migrate your data** (2 minutes)
3. **Update frontend .env** (1 minute)
4. **Test locally** before deploying frontend
5. **Deploy frontend** to GitHub Pages

---

## ❓ Questions?

- Backend not working? Check Render logs
- Database issues? Verify DATABASE_URL
- Frontend errors? Check browser console
- CORS errors? Verify backend CORS settings

Good luck! 🍀

