# DAMOCLES Production Tasks - Modular Breakdown
## Budget: $500 (16.5 hours @ $30/hour)

---

## 📊 TASK PRIORITY SYSTEM
- 🔴 **CRITICAL** - Must complete for MVP launch
- 🟡 **HIGH** - Important but can be simplified
- 🟢 **MEDIUM** - Nice to have
- ⚫ **LOW** - Can skip for MVP

---

## 🔴 CRITICAL PATH (8 hours - $240)

### 1. QUICK ENVIRONMENT SETUP (1 hour)
```bash
cd /Users/king/Desktop/damocles-platform
```

**Create Single Master Environment File:**
```bash
# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
DATABASE_URL=postgresql://postgres:password@localhost:5432/damocles
JWT_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
```

**Tasks:**
- [ ] Copy `.env.example` to `.env.local`
- [ ] Set DATABASE_URL to local/Supabase
- [ ] Generate secrets with `openssl rand -base64 32`
- [ ] Test environment loads

---

### 2. DATABASE QUICK START (1 hour)

**Option A: Use Supabase (FREE & INSTANT)**
```bash
# 1. Create account at supabase.com
# 2. Get connection string
# 3. Add to .env.local
```

**Option B: Local PostgreSQL**
```bash
# Install PostgreSQL
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb damocles

# Run migrations
cd services/user-service
npx prisma migrate dev --name init
```

**Tasks:**
- [ ] Choose database option (Supabase recommended)
- [ ] Update DATABASE_URL
- [ ] Run `npx prisma generate`
- [ ] Run `npx prisma migrate deploy`
- [ ] Verify with `npx prisma studio`

---

### 3. MINIMAL API CONNECTION (2 hours)

**Create Basic API Client:**
```typescript
// apps/web/lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = {
  async request(endpoint: string, options = {}) {
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    if (!res.ok) throw new Error('API Error');
    return res.json();
  },

  // Minimal endpoints needed
  auth: {
    login: (data) => api.request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    register: (data) => api.request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  },
  pdi: {
    calculate: (data) => api.request('/pdi/calculate', { method: 'POST', body: JSON.stringify(data) }),
  },
  debt: {
    create: (data) => api.request('/debts', { method: 'POST', body: JSON.stringify(data) }),
    list: () => api.request('/debts'),
  }
};
```

**Wire Critical Pages:**
- [ ] Connect login/register forms
- [ ] Wire PDI calculator (`/dashboard/pdi`)
- [ ] Connect debt creation form
- [ ] Add basic error handling

---

### 4. SIMPLE AUTH WITH NEXTAUTH (2 hours)

**Quick NextAuth Setup:**
```bash
npm install next-auth
```

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Simple auth - improve later
        if (credentials?.email && credentials?.password) {
          return { id: '1', email: credentials.email, name: 'User' }
        }
        return null
      }
    })
  ],
  pages: {
    signIn: '/login',
  }
})

export { handler as GET, handler as POST }
```

**Tasks:**
- [ ] Install NextAuth
- [ ] Create auth route
- [ ] Add session provider to layout
- [ ] Create simple login page
- [ ] Add middleware for /dashboard protection

---

### 5. STRIPE TEST MODE SETUP (2 hours)

**Minimal Stripe Integration:**
```typescript
// app/api/create-checkout/route.ts
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_TEST!);

export async function POST() {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'nok',
        product_data: { name: 'DAMOCLES Premium' },
        unit_amount: 9900, // 99 NOK
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${process.env.NEXTAUTH_URL}/dashboard?payment=success`,
    cancel_url: `${process.env.NEXTAUTH_URL}/dashboard?payment=cancelled`,
  });

  return Response.json({ url: session.url });
}
```

**Tasks:**
- [ ] Get Stripe test keys
- [ ] Create checkout endpoint
- [ ] Add payment button to dashboard
- [ ] Handle success redirect
- [ ] Test with card: 4242 4242 4242 4242

---

## 🟡 HIGH PRIORITY (4 hours - $120)

### 6. BACKEND SERVICE STARTUP (1 hour)

**Start Essential Services Only:**
```bash
# Start user-service
cd services/user-service
npm install
npm run dev

# Start payment-service (if time)
cd services/payment-service
npm install
npm run dev
```

**Tasks:**
- [ ] Install dependencies for user-service
- [ ] Create basic Express server
- [ ] Add `/health` endpoint
- [ ] Connect to database
- [ ] Test with Postman/curl

---

### 7. DOCKER MINIMAL SETUP (1 hour)

**Simple Docker Compose:**
```yaml
# docker-compose.yml
version: '3.8'
services:
  web:
    build: ./apps/web
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
    depends_on:
      - postgres

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: damocles
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
```

**Tasks:**
- [ ] Create minimal Dockerfiles
- [ ] Create docker-compose.yml
- [ ] Test with `docker-compose up`
- [ ] Document commands

---

### 8. BASIC TESTING (1 hour)

**Critical Path Testing:**
```bash
# Manual test checklist
1. Can user register? ✓/✗
2. Can user login? ✓/✗
3. Can calculate PDI? ✓/✗
4. Can add debt? ✓/✗
5. Does payment work? ✓/✗
6. Mobile responsive? ✓/✗
```

**Tasks:**
- [ ] Test registration flow
- [ ] Test login flow
- [ ] Test PDI calculation
- [ ] Test payment (test mode)
- [ ] Check mobile view
- [ ] Fix critical bugs only

---

### 9. DEPLOYMENT PREP (1 hour)

**Vercel + Railway Quick Deploy:**
```bash
# Frontend (Vercel - FREE)
1. Push to GitHub
2. Import to Vercel
3. Add env variables
4. Deploy

# Backend (Railway - $5/month)
1. Create Railway project
2. Add PostgreSQL
3. Deploy from GitHub
4. Get public URL
```

**Tasks:**
- [ ] Create Vercel account
- [ ] Deploy frontend to Vercel
- [ ] Create Railway account (if backend needed)
- [ ] Update API URLs
- [ ] Test production build

---

## 🟢 MEDIUM PRIORITY (3 hours - $90)

### 10. ERROR HANDLING (1 hour)
- [ ] Add try-catch to API calls
- [ ] Create error boundary component
- [ ] Add toast notifications
- [ ] Create 404/500 pages
- [ ] Add form validation messages

### 11. PERFORMANCE BASICS (1 hour)
- [ ] Add loading states
- [ ] Implement basic caching
- [ ] Optimize images
- [ ] Enable Next.js optimizations
- [ ] Check Lighthouse score

### 12. MONITORING SETUP (1 hour)
- [ ] Add Sentry (free tier)
- [ ] Set up Vercel Analytics
- [ ] Add basic logging
- [ ] Create health check endpoint
- [ ] Document error tracking

---

## ⚫ LOW PRIORITY (Skip for MVP)

### 13. ADVANCED FEATURES
- Email notifications
- Password reset
- Two-factor auth
- Advanced PDI analytics
- Document management
- Admin dashboard
- API rate limiting
- Webhook processing
- Data export
- Multi-language support

---

## ⚡ EMERGENCY SHORTCUTS

### If Running Out of Time:
1. **Skip backend entirely** - Use Supabase for everything
2. **Skip Docker** - Deploy directly to platforms
3. **Skip Stripe webhooks** - Manual payment verification
4. **Use mock data** - Hardcode some responses
5. **Deploy frontend only** - Show working UI

### Quick Win Services:
- **Database**: Supabase (instant setup)
- **Auth**: Clerk.dev (drop-in auth)
- **Payments**: Stripe Payment Links (no code)
- **Email**: EmailJS (client-side)
- **Deploy**: Vercel (one-click)

---

## 🚀 FASTEST PATH TO LAUNCH (6 hours - $180)

If you need absolute minimum viable:

1. **Hour 1**: Supabase setup + env vars
2. **Hour 2**: Connect PDI calculator to Supabase
3. **Hour 3**: Add Clerk.dev for instant auth
4. **Hour 4**: Create Stripe Payment Link
5. **Hour 5**: Deploy to Vercel
6. **Hour 6**: Test and fix critical bugs

**Result**: Working app with auth, PDI, and payments

---

## 📋 DEVELOPER HANDOFF CHECKLIST

Before starting:
- [ ] Access to GitHub repo
- [ ] Access to deployment platforms
- [ ] Stripe test account credentials
- [ ] Database connection details
- [ ] Domain/DNS access (if applicable)

After completion:
- [ ] All passwords documented
- [ ] Deployment instructions written
- [ ] Environment variables documented
- [ ] Critical flows tested
- [ ] Backup strategy in place

---

## 💰 BUDGET TRACKING

Track time spent:
```
| Task | Estimated | Actual | Cost |
|------|-----------|--------|------|
| Environment | 1h | ___ | $30 |
| Database | 1h | ___ | $30 |
| API Connection | 2h | ___ | $60 |
| Auth | 2h | ___ | $60 |
| Payments | 2h | ___ | $60 |
| Backend | 1h | ___ | $30 |
| Docker | 1h | ___ | $30 |
| Testing | 1h | ___ | $30 |
| Deployment | 1h | ___ | $30 |
| TOTAL | 12h | ___ | $360 |
| BUFFER | 4.5h | ___ | $135 |
```

---

## 🎯 SUCCESS CRITERIA

MVP is ready when:
✅ User can create account
✅ User can login
✅ PDI calculator works
✅ Site is deployed and accessible
✅ Basic payment flow works (test mode OK)

Everything else can be added post-launch!

---

**Remember: Perfect is the enemy of done. Ship it!**