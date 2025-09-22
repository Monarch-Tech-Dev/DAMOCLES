# DAMOCLES Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Prerequisites
- Node.js 18+
- Docker (optional)
- PostgreSQL or Supabase account

### Option 1: Docker Quick Start (Recommended)
```bash
# Clone and start everything
git clone [your-repo]
cd damocles-platform

# Copy environment file
cp apps/web/.env.example apps/web/.env.local

# Start with Docker
docker-compose -f docker-compose.simple.yml up -d
```

**That's it!** Open http://localhost:3000

### Option 2: Manual Setup
```bash
# 1. Install dependencies
cd apps/web && npm install
cd ../../services/user-service && npm install

# 2. Set up database (choose one):

# Option A: Use Supabase (FREE)
# - Go to supabase.com
# - Create account and new project
# - Get connection string
# - Add to .env.local

# Option B: Local PostgreSQL
brew install postgresql
brew services start postgresql
createdb damocles

# 3. Configure environment
cp apps/web/.env.example apps/web/.env.local
# Edit .env.local with your values

# 4. Run migrations
cd services/user-service
npx prisma migrate deploy

# 5. Start services
cd apps/web && npm run dev &
cd services/user-service && npm run dev &
```

## 🔧 Environment Variables

Copy from `.env.example` and fill these **required** values:

```env
# Database (required)
DATABASE_URL="postgresql://user:pass@host:5432/damocles"

# API URL (required)
NEXT_PUBLIC_API_URL="http://localhost:3001"

# Auth (required)
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
JWT_SECRET="another-secret-for-jwt"

# Stripe (for payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
```

## 🧪 Test the Setup

1. **Frontend**: http://localhost:3000
2. **API Health**: http://localhost:3001/health
3. **Database**: http://localhost:3001/api/test-db

## 📋 What Works Out of the Box

✅ **Frontend Pages**
- Landing page with marketing
- Founding members campaign
- PDI calculator (UI only)
- Debt management (UI only)
- User dashboard
- Media widgets page
- Regional leaderboard

✅ **Backend Services**
- User service structure
- Database schema
- API endpoints defined
- Docker configuration

## ❗ What Still Needs Developer Work

🔧 **Critical (Required for MVP)**
1. **API Connections** - Wire frontend forms to backend
2. **Authentication** - Set up NextAuth.js or similar
3. **Database** - Connect and test all endpoints
4. **Payments** - Implement Stripe checkout

🔧 **Important (Nice to Have)**
1. **Error Handling** - Production error boundaries
2. **Loading States** - Better UX during API calls
3. **Form Validation** - Client and server-side
4. **Email** - Notifications and confirmations

## 🛠️ Common Issues & Solutions

### Database Connection Failed
```bash
# Check if PostgreSQL is running
brew services list | grep postgresql

# Or use Supabase (easier)
# Get connection string from your Supabase dashboard
```

### Port Already in Use
```bash
# Kill processes on ports 3000/3001
npx kill-port 3000
npx kill-port 3001

# Or use different ports in .env.local
```

### API Errors
```bash
# Check if user-service is running
curl http://localhost:3001/health

# Check logs
cd services/user-service && npm run dev
```

## 📁 Project Structure

```
damocles-platform/
├── apps/web/                 # Next.js frontend
│   ├── app/                  # App router pages
│   ├── components/           # React components
│   ├── lib/                  # Utilities (API client)
│   └── .env.example          # Environment template
├── services/                 # Backend microservices
│   ├── user-service/         # Main API service
│   ├── payment-service/      # Stripe integration
│   └── gdpr-engine/          # GDPR automation
├── docker-compose.simple.yml # Quick Docker setup
└── QUICK_START.md           # This file
```

## 🔐 Security Notes

- **Never commit** `.env.local` or `.env` files
- Use **test mode** for Stripe until production
- Change **default secrets** in production
- Enable **HTTPS** in production

## 🚀 Deploy to Production

### Fastest: Vercel + Supabase
```bash
# 1. Deploy frontend to Vercel
vercel --prod

# 2. Use Supabase for database (free tier)
# 3. Add environment variables in Vercel dashboard
```

### Alternative: DigitalOcean App Platform
```bash
# 1. Push to GitHub
# 2. Connect to DO App Platform
# 3. Auto-deploy from main branch
```

## 📞 Need Help?

1. Check the detailed guides:
   - `DEVELOPER_TODO_PRODUCTION.md` - Complete task list
   - `PRODUCTION_TASKS_MODULAR.md` - Prioritized breakdown

2. Test the PDI calculator:
   - Go to `/dashboard/pdi`
   - Fill out the form (frontend only works)

3. Check API endpoints:
   - All defined in `apps/web/lib/api.ts`
   - Backend endpoints in `services/user-service/`

## 🎯 Success Checklist

Ready for production when:
- [ ] User can register/login
- [ ] PDI calculator returns results
- [ ] Database stores user data
- [ ] Payments work (test mode OK)
- [ ] Site deployed and accessible
- [ ] No console errors in production

**Goal**: MVP in 2-3 days of focused development!