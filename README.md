# ⚡ TradeBoard X —  Smart Trading Dashboard

> A production-ready full-stack SaaS platform for professional crypto, forex, and stock traders. Track, analyze, and optimize your trading performance.

![TradeBoard X](https://img.shields.io/badge/TradeBoard%20X-v1.0-00E5FF?style=for-the-badge&logo=trending-up)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone & Setup

```bash
git clone https://github.com/yourorg/tradeboard-x.git
cd tradeboard-x
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your values
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local
npm run dev
```

### 4. Seed Demo Data (Optional)

```bash
cd backend
npm run seed
```

**Demo credentials:**
- Admin: `admin@tradeboard.x` / `Admin123!`
- Trader: `demo@tradeboard.x` / `Demo123!`

---

## 🏗️ Architecture

```
tradeboard-x/
├── backend/                    # Node.js + Express API
│   ├── controllers/            # Business logic
│   │   ├── auth.controller.js  # Auth (register, login, refresh, logout)
│   │   ├── trade.controller.js # CRUD trade logs
│   │   ├── analytics.controller.js # Dashboard stats
│   │   └── user.controller.js  # Profile management
│   ├── routes/                 # Express route definitions
│   ├── middleware/             # Auth, validation, error handling
│   │   ├── auth.middleware.js  # JWT verification + RBAC
│   │   ├── validation.middleware.js # express-validator rules
│   │   └── error.middleware.js # Centralized error handler
│   ├── models/                 # Mongoose schemas
│   │   ├── User.model.js       # User with refresh tokens
│   │   └── Trade.model.js      # Trade logs with auto P&L
│   ├── utils/                  # Utilities
│   │   ├── jwt.utils.js        # Token generation/verification
│   │   ├── response.utils.js   # Standardized API responses
│   │   └── seed.js             # Database seeder
│   └── server.js               # App entry point
│
└── frontend/                   # Next.js 14 App Router
    ├── app/                    # App Router pages
    │   ├── page.tsx            # Landing page
    │   ├── auth/
    │   │   ├── login/page.tsx  # Login
    │   │   └── register/page.tsx # Register
    │   └── dashboard/          # Protected dashboard
    │       ├── layout.tsx      # Auth guard + sidebar layout
    │       ├── page.tsx        # Overview with charts
    │       ├── trades/page.tsx # Trade logs with full CRUD
    │       ├── analytics/page.tsx # Deep analytics
    │       └── profile/page.tsx # User settings
    ├── components/
    │   ├── layout/             # Sidebar, Header
    │   ├── dashboard/          # StatsCards, Charts, TradeTable, TradeForm
    │   └── ui/                 # Toaster, shared UI
    ├── context/AuthContext.tsx  # Global auth state
    ├── hooks/index.ts          # useTrades, useAnalytics, useDebounce
    ├── services/api.service.ts # Typed API service layer
    ├── types/index.ts          # TypeScript types
    └── lib/                    # utils, api client
```

---

## 🔐 Security Features

| Feature | Implementation |
|---------|---------------|
| Password Hashing | bcrypt with salt factor 12 |
| Access Tokens | JWT with 15m expiry, HS256 |
| Refresh Tokens | 7-day rotation with DB storage |
| HTTP-only Cookies | Refresh token stored securely |
| Rate Limiting | 100 req/15min global, 10 for auth |
| CORS | Strict origin whitelist |
| Security Headers | Helmet.js (CSP, HSTS, etc.) |
| Input Validation | Zod (frontend) + express-validator (backend) |
| RBAC | Role-based middleware (user/admin) |

---

## 📊 Trade Log Schema

```js
{
  assetName: String,          // BTC, ETH, etc.
  assetCategory: Enum,        // crypto, forex, stocks, commodities, indices
  positionType: Enum,         // long | short
  entryPrice: Number,
  exitPrice: Number | null,
  quantity: Number,
  leverage: Number,           // 1-125x
  stopLoss: Number | null,
  takeProfit: Number | null,
  fees: Number,
  status: Enum,               // open | closed | cancelled
  profitLoss: Number,         // AUTO-CALCULATED on save
  profitLossPercentage: Number,
  strategy: Enum,             // breakout | trend_following | ...
  exchange: String,
  sentiment: Enum,            // bullish | bearish | neutral
  tradeNotes: String,
  tradeDate: Date,
  closedAt: Date | null,
}
```

---

## 📈 API Reference

### Auth Endpoints
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Create account |
| POST | `/api/auth/login` | ❌ | Get tokens |
| POST | `/api/auth/logout` | ✅ | Invalidate tokens |
| POST | `/api/auth/refresh` | Cookie | Rotate refresh token |
| GET | `/api/auth/me` | ✅ | Get current user |

### Trade Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/trades?page=1&limit=10&status=open&search=BTC` | List with filters |
| POST | `/api/trades` | Create trade |
| GET | `/api/trades/:id` | Get single trade |
| PUT | `/api/trades/:id` | Full update |
| PATCH | `/api/trades/:id` | Partial update |
| DELETE | `/api/trades/:id` | Delete trade |
| DELETE | `/api/trades/bulk` | Bulk delete |

### Analytics Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/dashboard?period=30d` | Full dashboard stats |

---

## 🐳 Docker Deployment

### docker-compose.yml

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/tradeboard_x
      - JWT_SECRET=${JWT_SECRET}
      - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
      - CLIENT_URL=${CLIENT_URL}
    depends_on:
      - mongo

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=${API_URL}

  mongo:
    image: mongo:7
    volumes:
      - mongo_data:/data/db
    ports:
      - "27017:27017"

volumes:
  mongo_data:
```

### Backend Dockerfile

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

### Frontend Dockerfile

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

---

## ☁️ Cloud Deployment

### Frontend → Vercel
```bash
vercel --prod
# Set env vars in Vercel dashboard:
# NEXT_PUBLIC_API_URL=https://your-api.railway.app/api
```

### Backend → Railway / Render
```bash
# Railway
railway login
railway init
railway up

# Set environment variables in dashboard
```

### Backend → AWS (EC2 + PM2)
```bash
# On EC2 instance
npm install -g pm2
pm2 start server.js --name tradeboard-api
pm2 save
pm2 startup
```

### Database → MongoDB Atlas
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/tradeboard_x?retryWrites=true&w=majority
```

---

## 🚀 Scaling to Microservices

When traffic grows, decompose into:

```
api-gateway (nginx/kong)
    ├── auth-service       (JWT + user mgmt)
    ├── trade-service      (trade CRUD)
    ├── analytics-service  (aggregations)
    └── notification-service (alerts)
```

Each service:
- Owns its MongoDB collection/database
- Communicates via REST or message queue (RabbitMQ/Kafka)
- Independently deployable with Docker + K8s

---

## ⚡ Redis Caching Strategy

```js
// Cache analytics results (expensive aggregations)
const CACHE_TTL = 300; // 5 minutes

async function getDashboardAnalytics(userId, period) {
  const cacheKey = `analytics:${userId}:${period}`;
  
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);
  
  const data = await runExpensiveAggregation(userId, period);
  await redis.setEx(cacheKey, CACHE_TTL, JSON.stringify(data));
  
  return data;
}

// Invalidate on trade write
async function createTrade(userId, tradeData) {
  const trade = await Trade.create(tradeData);
  await redis.del(`analytics:${userId}:*`); // Bust cache
  return trade;
}
```

Use Redis for:
- Analytics caching (expensive MongoDB aggregations)
- Session store for refresh tokens (faster lookup)
- Rate limiting counters
- Real-time price feed caching

---

## 📝 Environment Variables

### Backend (.env)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=min_32_char_secret_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=different_min_32_char_secret
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL=https://your-frontend.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://your-api.com/api
```

---

## 🧪 Testing

```bash
# Backend - run with Jest
cd backend && npm test

# Frontend - run with Playwright  
cd frontend && npm run test:e2e
```

---

## 📦 Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | TailwindCSS + custom CSS |
| Forms | React Hook Form + Zod |
| HTTP Client | Axios with interceptors |
| Charts | Recharts |
| State | Context API + useReducer |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (access + refresh) |
| Password | bcryptjs (salt 12) |
| Security | Helmet, CORS, Rate limiting |
| Validation | express-validator |

---

Built with ❤️ for the trading community — TradeBoard X
