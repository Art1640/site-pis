# ⚡ Quick Start Guide

## 🎯 Choose Your Path

### Path A: Keep Using localStorage (No Changes)
```bash
cd frontend
npm run dev
```
✅ **Done!** Your app works exactly as before.

---

### Path B: Test Backend Locally (5 minutes)

**Step 1: Start Backend**
```bash
cd backend
./start-local.sh
# Answer 'yes' when asked to migrate data
```

**Step 2: Configure Frontend**
```bash
cd frontend
echo "VITE_USE_BACKEND=true" > .env
echo "VITE_API_URL=http://localhost:5000" >> .env
```

**Step 3: Start Frontend**
```bash
npm run dev
```

**Step 4: Test**
- Open http://localhost:5173
- Your data should load from the database!
- Try adding/deleting records

---

### Path C: Deploy to Production (15 minutes)

**Step 1: Deploy Backend to Render**
1. Go to [render.com](https://render.com) and sign up
2. Click "New +" → "Blueprint"
3. Connect your GitHub repo
4. Render will auto-deploy from `render.yaml`
5. Wait 5-10 minutes for deployment
6. Copy your backend URL (e.g., `https://pissenlits-backend.onrender.com`)

**Step 2: Migrate Data**
```bash
cd backend
# Get DATABASE_URL from Render dashboard → Environment
export DATABASE_URL="postgresql://..."
python migrate_data.py
```

**Step 3: Update Frontend**
```bash
cd frontend
echo "VITE_USE_BACKEND=true" > .env.production
echo "VITE_API_URL=https://your-backend.onrender.com" >> .env.production
```

**Step 4: Deploy Frontend**
```bash
npm run build
# Deploy to GitHub Pages as usual
```

✅ **Done!** Your app now uses a real database.

---

## 🔧 Common Commands

### Backend
```bash
# Start local backend
cd backend && ./start-local.sh

# Migrate data
cd backend && python migrate_data.py

# Run tests
cd backend && pytest

# Install dependencies
cd backend && pip install -r requirements.txt
```

### Frontend
```bash
# Start dev server
cd frontend && npm run dev

# Build for production
cd frontend && npm run build

# Run tests
cd frontend && npm test

# Install dependencies
cd frontend && npm install
```

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check Python version (need 3.8+)
python3 --version

# Recreate virtual environment
cd backend
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Frontend can't connect to backend
```bash
# Check .env file
cat frontend/.env

# Should have:
# VITE_USE_BACKEND=true
# VITE_API_URL=http://localhost:5000

# Check backend is running
curl http://localhost:5000/api/health
```

### Database migration fails
```bash
# Check JSON file exists
ls frontend/src/data/fundraising-data.json

# Check database connection
cd backend
python -c "from app import app, db; app.app_context().push(); db.create_all(); print('OK')"
```

### CORS errors in browser
```bash
# Make sure backend is running
# Check browser console for exact error
# Verify VITE_API_URL matches backend URL
```

---

## 📚 Documentation

- **Full deployment guide**: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **Architecture overview**: [ARCHITECTURE.md](ARCHITECTURE.md)
- **Setup summary**: [DATABASE_SETUP_SUMMARY.md](DATABASE_SETUP_SUMMARY.md)
- **Backend docs**: [backend/README.md](backend/README.md)

---

## 💡 Tips

### Switching Modes
```bash
# Use backend
echo "VITE_USE_BACKEND=true" > frontend/.env

# Use localStorage
echo "VITE_USE_BACKEND=false" > frontend/.env
```

### Check Backend Status
```bash
curl http://localhost:5000/api/health
# or
curl https://your-backend.onrender.com/api/health
```

### View Database Records
```bash
cd backend
python -c "from app import app, db, FundraisingRecord; app.app_context().push(); print(FundraisingRecord.query.count(), 'records')"
```

### Export Data from Database
```bash
cd backend
python -c "from app import app, db, FundraisingRecord; import json; app.app_context().push(); records = [r.to_dict() for r in FundraisingRecord.query.all()]; print(json.dumps(records, indent=2, ensure_ascii=False))" > export.json
```

---

## ❓ FAQ

**Q: Do I have to use the database?**  
A: No! Your app still works with localStorage.

**Q: Can I switch back to localStorage?**  
A: Yes! Just change `VITE_USE_BACKEND=false`

**Q: Is the database free?**  
A: Yes! Render offers 90 days free PostgreSQL, then $7/month.

**Q: Will my data be lost?**  
A: No. Your JSON file is still there. The database is a copy.

**Q: Can I use both modes?**  
A: Yes! Use localStorage for local dev, database for production.

---

## 🆘 Need Help?

1. Check the error message in browser console
2. Check backend logs in terminal or Render dashboard
3. Read the full guides in the documentation
4. Check that all environment variables are set correctly

---

**Ready to start? Pick a path above and go!** 🚀

