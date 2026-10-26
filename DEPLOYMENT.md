# EV ChargeHub — Deployment Guide

## Architecture

```
┌─────────────────────┐        ┌──────────────────────────┐
│  React + Vite       │  HTTP  │  Node.js + Express       │
│  Cloudflare Pages   │◄──────►│  Render.com              │
│  (Frontend)         │        │  (Backend + OCPP)        │
└─────────────────────┘        └──────────┬───────────────┘
                                           │ WebSocket (wss://)
                                ┌──────────▼───────────────┐
                                │  MongoDB Atlas           │
                                │  (Free M0 cluster)       │
                                └──────────────────────────┘
```

- Frontend: React 18, Vite, Tailwind CSS v4, Recharts, Leaflet
- Backend: Node.js 22, Express, Mongoose, ws (OCPP 1.6)
- Protocol: OCPP 1.6 over WebSocket — same port as HTTP (no separate server)
- Auth: JWT (jsonwebtoken + bcryptjs)

---

## Prerequisites

- Node.js 18+ installed locally
- MongoDB Atlas account (free M0 tier)
- GitHub account
- Render.com account (free tier)
- Cloudflare Pages account (free) — OR Vercel (free)

---

## Local Setup

```bash
# 1. Clone the repo
git clone https://github.com/<your-username>/ev-chargehub.git
cd ev-chargehub

# 2. Backend setup
cd server
cp .env.example .env
# Fill in your real values in .env
npm install
npm run dev

# 3. Frontend setup (new terminal)
cd client
cp .env.example .env
# Leave VITE_API_URL empty for local dev
npm install
npm run dev
```

Frontend: http://localhost:5173
Backend:  http://localhost:5000/api/health
OCPP:     ws://localhost:5000/EVCHARGER-001

---

## Environment Variables

### Backend (`server/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port (Render sets automatically) | `5000` |
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/evchargehub` |
| `JWT_SECRET` | Secret for signing JWT tokens | `a_long_random_string_here` |
| `OCM_API_KEY` | Open Charge Map API key | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| `FRONTEND_URL` | Deployed frontend URL for CORS | `https://ev-chargehub.pages.dev` |

### Frontend (`client/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Deployed backend base URL | `https://ev-chargehub-api.onrender.com` |

> Leave `VITE_API_URL` **empty** for local development — Vite proxy handles it.

---

## GitHub Setup

```bash
# From the project root c:\ev-chargehub
git init
git add .
git status
# Verify .env files are NOT listed in staged files before continuing

git commit -m "Initial commit: EV ChargeHub MERN + OCPP"

# Create an empty repo on GitHub (no README, no .gitignore)
# Then:
git remote add origin https://github.com/<your-username>/ev-chargehub.git
git branch -M main
git push -u origin main
```

> IMPORTANT: Run `git status` after `git add .` and confirm no `.env` files appear.

---

## Deploy Backend to Render

1. Go to https://render.com → New → Web Service
2. Connect your GitHub repo
3. Configure:
   - **Root Directory**: `server`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
4. Add Environment Variables (in Render dashboard → Environment):
   ```
   MONGODB_URI     = <your Atlas connection string>
   JWT_SECRET      = <your secret>
   OCM_API_KEY     = <your OCM key>
   FRONTEND_URL    = https://<your-cloudflare-pages-domain>
   ```
   > Do NOT set PORT — Render injects it automatically.
5. Deploy. Note your backend URL: `https://ev-chargehub-api.onrender.com`

---

## Deploy Frontend to Cloudflare Pages

1. Go to https://pages.cloudflare.com → Create application → Pages → Connect to Git
2. Select your repo
3. Configure:
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Build Output Directory**: `dist`
4. Add Environment Variable:
   ```
   VITE_API_URL = https://ev-chargehub-api.onrender.com
   ```
5. Deploy.

### Alternative: Vercel

1. Go to https://vercel.com → New Project → Import repo
2. Configure:
   - **Root Directory**: `client`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add Environment Variable:
   ```
   VITE_API_URL = https://ev-chargehub-api.onrender.com
   ```
4. Deploy. `vercel.json` in `client/` handles SPA routing.

---

## MongoDB Atlas Network Access

1. Go to Atlas → Network Access → Add IP Address
2. For development: add your local IP
3. For production: add `0.0.0.0/0` (allow all) — acceptable for this project tier
   - Or add Render's outbound IPs (available in Render docs for paid plans)

---

## Connecting Frontend to Backend

After both are deployed:
1. Copy your Render backend URL
2. In Cloudflare Pages (or Vercel) → Settings → Environment Variables
3. Set `VITE_API_URL` = `https://ev-chargehub-api.onrender.com`
4. Redeploy the frontend (trigger a new build)

---

## OCPP WebSocket in Production

The OCPP server runs on the **same port** as the Express HTTP server.

- Local:      `ws://localhost:5000/EVCHARGER-001`
- Production: `wss://ev-chargehub-api.onrender.com/EVCHARGER-001`

Render automatically handles TLS termination — your `ws://` server becomes `wss://` in production without any code changes.

To test production OCPP, update `chargerSimulator.js` temporarily:
```js
const ws = new WebSocket("wss://ev-chargehub-api.onrender.com/EVCHARGER-001", "ocpp1.6");
```

---

## Troubleshooting

### CORS errors in browser console
- Check `FRONTEND_URL` env var on Render matches your exact frontend domain (no trailing slash)
- Redeploy backend after changing env vars

### MongoDB connection failed on Render
- Verify `MONGODB_URI` is set correctly in Render environment
- Check Atlas Network Access — add `0.0.0.0/0`
- Check Atlas user has `readWrite` permissions on the `evchargehub` database

### API requests returning 404 in production
- Confirm `VITE_API_URL` is set in frontend deployment env vars
- Confirm it does NOT have a trailing slash
- Redeploy frontend after setting the variable

### WebSocket connection failing in production
- Use `wss://` not `ws://` for HTTPS-hosted backends
- Render free tier may sleep after inactivity — first connection may take ~30s to wake

### Frontend shows blank page after deploy
- Check browser console for errors
- Verify `_redirects` (Cloudflare) or `vercel.json` is in `client/public/` or `client/` respectively
- Ensure build output directory is set to `dist`

### Build errors on Render/Vercel
- Ensure Node version is 18+ (set in Render: Environment → Node Version = `18`)
- Run `npm run build` locally first to catch errors before deploying
