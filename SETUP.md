# ⚡ TradeBoard X — Setup & Login Fix Guide

## 🚀 Quick Start (3 steps)

### Step 1 — Backend setup
```bash
cd backend
npm install

# Create your .env file
cp .env.example .env
```

Now **open `backend/.env`** and set real values:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tradeboard_x
JWT_SECRET=any_random_string_at_least_32_characters_long
JWT_REFRESH_SECRET=a_DIFFERENT_random_string_32_chars_long
CLIENT_URL=http://localhost:3000
```

```bash
# Start backend
npm run dev
```

You should see:
```
✅ Environment variables loaded:
   JWT_SECRET         = [SET ✓]
   JWT_REFRESH_SECRET = [SET ✓]
✅ MongoDB Connected: localhost
🚀 TradeBoard X API → http://localhost:5000
```

### Step 2 — Frontend setup
```bash
cd frontend
npm install

# Create your .env.local file
cp .env.example .env.local
```

`frontend/.env.local` should contain:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

```bash
npm run dev
```

### Step 3 — Create your account
Go to http://localhost:3000/auth/register and create an account.

**OR** seed demo accounts:
```bash
cd backend
npm run seed
# Creates: demo@tradeboard.x / Demo123!
#          admin@tradeboard.x / Admin123!
```

---

## 🔧 Diagnosing "Login failed"

### Run the auto-checker first:
```bash
cd backend
node debug-login.js
```

### Then check:

**1. Is the backend running?**
Visit http://localhost:5000/health — you should see JSON with `"status": "ok"`

**2. Is your .env file correct?**
```bash
# Make sure this file exists:
ls backend/.env

# Check there are no spaces or quotes:
cat backend/.env
```

**3. Did you run npm install?**
```bash
cd backend && npm install
cd frontend && npm install
```

**4. Does the user account exist?**
Run `npm run seed` in the backend folder to create demo accounts.

---

## ❌ Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `secretOrPrivateKey must have a value` | JWT_SECRET missing in .env | Add JWT_SECRET to backend/.env |
| `Login failed` (network error) | Backend not running | Run `npm run dev` in backend/ |
| `Login failed` (CORS error) | CLIENT_URL mismatch | Set CLIENT_URL=http://localhost:3000 in backend/.env |
| `Invalid credentials` | User not registered | Register first or run `npm run seed` |
| `Cannot GET /api/auth/login` | Wrong API URL | Set NEXT_PUBLIC_API_URL=http://localhost:5000/api in frontend/.env.local |

