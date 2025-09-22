# 🚀 DAMOCLES Developer Setup

## Quick Start (5 minutes)

### Prerequisites
- Node.js 18+
- Git

### 1. Clone & Install
```bash
git clone https://github.com/Monarch-Tech-Dev/DAMOCLES.git
cd DAMOCLES
cd apps/web
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:
```env
# Required for basic functionality
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXTAUTH_SECRET="your-secret-here"

# Database (optional for frontend testing)
DATABASE_URL="postgresql://user:pass@localhost:5432/damocles"
```

### 3. Start Development
```bash
npm run dev
```

**Result:** Frontend runs on http://localhost:3000

---

## Project Structure

```
DAMOCLES/
├── apps/web/                  # Next.js Frontend (MAIN)
│   ├── app/                   # Pages (App Router)
│   ├── components/            # UI Components
│   ├── lib/                   # API client & utilities
│   ├── .env.example           # Environment template
│   └── package.json           # Dependencies
│
├── services/                  # Backend Services
│   ├── user-service/          # Main API (not connected yet)
│   └── payment-service/       # Stripe integration
│
├── docker-compose.simple.yml  # Docker setup (optional)
└── QUICK_START.md            # Detailed guide
```

---

## What Works Right Now

✅ **Frontend Pages:** All UI complete
✅ **Components:** Toast, loading, error handling
✅ **Responsive:** Mobile & desktop ready
❌ **API:** Not connected (needs backend work)
❌ **Database:** Not connected
❌ **Auth:** Not implemented

---

## Common Issues

### Port 3000 in use
```bash
npx kill-port 3000
npm run dev
```

### Missing dependencies
```bash
cd apps/web
rm -rf node_modules package-lock.json
npm install
```

### Environment errors
Make sure `.env.local` exists in `apps/web/` folder

---

## Next Steps for Developer

1. **Test Frontend:** Visit all pages at localhost:3000
2. **Set up Database:** Connect PostgreSQL or Supabase
3. **Add Authentication:** Implement NextAuth.js
4. **Connect APIs:** Link frontend to backend services

**Estimated work:** 8-12 hours ($240-360)