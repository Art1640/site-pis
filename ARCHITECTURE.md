# 🏗️ Architecture Overview

## Current Setup (localStorage Mode)

```
┌─────────────────────────────────────────┐
│         GitHub Pages                     │
│  ┌───────────────────────────────────┐  │
│  │   React Frontend (Vite)           │  │
│  │                                   │  │
│  │  ├─ HomePage                      │  │
│  │  ├─ LeaderboardPage               │  │
│  │  ├─ AllRecordsPage                │  │
│  │  └─ PhotoGalleryPage              │  │
│  │                                   │  │
│  │  Services:                        │  │
│  │  └─ api.ts (localStorage)         │  │
│  └───────────────────────────────────┘  │
│              ↓                           │
│  ┌───────────────────────────────────┐  │
│  │   Browser localStorage            │  │
│  │   (fundraising-data.json)         │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

**Pros:**
- ✅ Simple deployment
- ✅ Free hosting
- ✅ Fast (no network calls)
- ✅ Works offline

**Cons:**
- ❌ Data only in browser
- ❌ Can't share between users
- ❌ Lost if cache cleared

---

## New Setup (Database Mode)

```
┌─────────────────────────────────────────┐
│         GitHub Pages                     │
│  ┌───────────────────────────────────┐  │
│  │   React Frontend (Vite)           │  │
│  │                                   │  │
│  │  ├─ HomePage                      │  │
│  │  ├─ LeaderboardPage               │  │
│  │  ├─ AllRecordsPage                │  │
│  │  └─ PhotoGalleryPage              │  │
│  │                                   │  │
│  │  Services:                        │  │
│  │  └─ backendApi.ts                 │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
              ↓ HTTP/HTTPS
              ↓ (fetch API)
┌─────────────────────────────────────────┐
│         Render.com                       │
│  ┌───────────────────────────────────┐  │
│  │   Flask Backend (Python)          │  │
│  │                                   │  │
│  │  Routes:                          │  │
│  │  ├─ GET  /api/records             │  │
│  │  ├─ POST /api/records             │  │
│  │  ├─ POST /api/records/delete      │  │
│  │  └─ GET  /api/health              │  │
│  │                                   │  │
│  │  Models:                          │  │
│  │  └─ FundraisingRecord             │  │
│  └───────────────────────────────────┘  │
│              ↓                           │
│              ↓ SQLAlchemy ORM            │
│  ┌───────────────────────────────────┐  │
│  │   PostgreSQL Database             │  │
│  │                                   │  │
│  │  Table: fundraising_records       │  │
│  │  ├─ id (PRIMARY KEY)              │  │
│  │  ├─ date                          │  │
│  │  ├─ qui                           │  │
│  │  ├─ type                          │  │
│  │  ├─ activite                      │  │
│  │  ├─ details                       │  │
│  │  └─ montant                       │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

**Pros:**
- ✅ Centralized data
- ✅ Multi-user support
- ✅ Data persistence
- ✅ Scalable
- ✅ Can add authentication

**Cons:**
- ❌ Requires backend hosting
- ❌ Network latency
- ❌ More complex deployment

---

## Hybrid Mode (Flexible)

The app supports **both modes** with a simple environment variable:

```typescript
// frontend/.env
VITE_USE_BACKEND=true   // Use database
VITE_USE_BACKEND=false  // Use localStorage
```

This allows you to:
- 🧪 Test locally with localStorage
- 🚀 Deploy with database
- 🔄 Switch back if needed
- 📱 Use localStorage as fallback

---

## Data Flow

### localStorage Mode:
```
User Action
    ↓
React Component
    ↓
api.ts (localStorageService)
    ↓
sessionStorage
    ↓
Browser Storage
```

### Database Mode:
```
User Action
    ↓
React Component
    ↓
api.ts → backendApi.ts
    ↓
HTTP Request (fetch)
    ↓
Flask Backend
    ↓
SQLAlchemy ORM
    ↓
PostgreSQL Database
```

---

## API Endpoints

### GET /api/records
Returns all fundraising records.

**Response:**
```json
[
  {
    "Date": "2025-09-19",
    "Qui": "Groupe",
    "Type": "Bar Pi",
    "Activité": "Bar Pi #1",
    "Détails": "Tout le monde présent",
    "Montant": 150.03
  }
]
```

### POST /api/records
Add a new record.

**Request:**
```json
{
  "Date": "2026-01-24",
  "Qui": "Dorcopsis",
  "Type": "Vente",
  "Activité": "Cookies",
  "Détails": "Dans quartier",
  "Montant": 50
}
```

### POST /api/records/delete
Delete a record.

**Request:**
```json
{
  "Date": "2026-01-24",
  "Qui": "Dorcopsis",
  "Activité": "Cookies"
}
```

### GET /api/health
Health check.

**Response:**
```json
{
  "status": "healthy",
  "database": "connected"
}
```

---

## Technology Stack

### Frontend:
- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Chart.js** - Data visualization

### Backend:
- **Flask** - Web framework
- **SQLAlchemy** - ORM
- **PostgreSQL** - Database
- **Flask-CORS** - Cross-origin support

### Deployment:
- **GitHub Pages** - Frontend hosting
- **Render** - Backend + Database hosting

---

## Security Considerations

### Current Implementation:
- ⚠️ No authentication (as requested)
- ⚠️ CORS open to all origins
- ⚠️ No rate limiting

### Future Improvements:
- 🔐 Add password protection
- 🔐 Restrict CORS to specific domain
- 🔐 Add rate limiting
- 🔐 Add input validation
- 🔐 Add HTTPS enforcement

---

## Scalability

### Current Capacity:
- **Frontend**: Unlimited (static files)
- **Backend**: ~100 concurrent users (Render free tier)
- **Database**: 1GB storage (Render free tier)

### Upgrade Path:
1. Add caching (Redis)
2. Add CDN for frontend
3. Scale backend horizontally
4. Upgrade database tier
5. Add load balancer

---

## Monitoring

### Health Checks:
- `/api/health` endpoint
- Render automatic health monitoring
- Database connection status

### Logging:
- Flask console logs
- Render log aggregation
- Error tracking (can add Sentry)

---

## Backup Strategy

### localStorage Mode:
- Export/import functionality in UI
- Manual JSON backups

### Database Mode:
- Render automatic daily backups
- Point-in-time recovery (paid tier)
- Manual export via migration script

---

## Development Workflow

### Local Development:
```bash
# Backend
cd backend
./start-local.sh

# Frontend
cd frontend
npm run dev
```

### Testing:
```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

### Deployment:
```bash
# Backend (automatic via Render)
git push origin main

# Frontend
cd frontend
npm run build
# Deploy to GitHub Pages
```

