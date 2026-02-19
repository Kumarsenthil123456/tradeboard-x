# 🚀 Deployment Guide: TradeBoard X

Since your code is already on GitHub, follow these exact steps to get your full platform live.

---

## 1. 🎨 Frontend Deployment (Vercel - Recommended)
The fastest way to deploy a Next.js app is via [Vercel](https://vercel.com).

1.  **Sign up/Login** to Vercel and click **"Add New"** > **"Project"**.
2.  **Import** your `tradeboard-x` repository.
3.  **Project Configuration**:
    *   **Root Directory**: Select `frontend` (This is very important).
    *   **Framework Preset**: Next.js.
4.  **Environment Variables**:
    *   Add `NEXT_PUBLIC_API_URL`: `https://tradeboard-x-2.onrender.com/api`
5.  **Deploy**: Click Deploy.
6.  **Copy the URL**: Once finished, Vercel will give you a link (e.g., `https://tradeboard-x.vercel.app`). **Copy this link.**

---

## 2. ⚙️ Final Backend Setup (Render)
You already have the backend on Render, but you **MUST** update the CORS settings so it accepts requests from your new Vercel link.

1.  Go to your **Render Dashboard** and select your `tradeboard-x` backend service.
2.  Go to the **Environment** tab.
3.  **Update/Add** these variables:
    *   `CLIENT_URL`: Paste your Vercel URL here (e.g., `https://tradeboard-x.vercel.app`).
    *   `JWT_SECRET`: (Should already be there).
    *   `JWT_REFRESH_SECRET`: (Should already be there).
    *   `MONGODB_URI`: (Should already be there).
    *   `NODE_ENV`: `production`
4.  **Save Changes**: Render will restart your backend automatically.

---

## 3. ✅ Verification
Once both are deployed:
1.  Open your Vercel frontend link.
2.  Try to log in with `demo@tradeboard.com` / `Demo123!`.
3.  Open the Browser Console (`F12`) to check for any errors.

### **Common Troubleshooting**
*   **"Cannot connect to server"**: Check if your Render backend has gone to "sleep" (free tier). Refresh the health link: `https://tradeboard-x-2.onrender.com/health`.
*   **CORS Error**: Ensure the `CLIENT_URL` in Render matches your Vercel URL **exactly** (no trailing slash).
