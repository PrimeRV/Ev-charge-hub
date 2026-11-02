# EV ChargeHub ⚡

A full-stack EV charging station management and analytics dashboard built with the MERN stack and OCPP 1.6 protocol.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

---

## Features

- JWT-based authentication (login / signup)
- Real-time active charging session monitoring
- Booking and cancellation system
- Revenue and utilization analytics charts
- Pune EV station map (Leaflet + Open Charge Map API)
- OCPP 1.6 WebSocket integration
- Alerts, reports, settings, and user management
- Dark / light theme toggle

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS v4, Recharts, Leaflet |
| Backend | Node.js 22, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Auth | JWT, bcryptjs |
| Protocol | OCPP 1.6 over WebSocket |
| Deployment | Vercel (frontend) · Render (backend) |

---

## Project Structure

```
ev-chargehub/
├── client/                  # React + Vite frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── apiFetch.js
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   ├── .env.example
│   ├── vercel.json
│   └── vite.config.js
├── server/                  # Node.js + Express backend
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── ocpp/
│   ├── routes/
│   ├── services/
│   ├── .env.example
│   └── server.js
├── .gitignore
├── vercel.json              # Vercel build config
├── DEPLOYMENT.md
└── README.md
```

---

## Local Development

### 1. Clone the repo

```bash
git clone https://github.com/<your-username>/ev-chargehub.git
cd ev-chargehub
```

### 2. Backend setup

```bash
cd server
cp .env.example .env
# Fill in your values in .env
npm install
npm run dev
```

Backend runs at: `http://localhost:5000`

### 3. Frontend setup

```bash
cd client
cp .env.example .env
# Leave VITE_API_URL empty for local dev
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## Environment Variables

### Backend — `server/.env`

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/evchargehub
JWT_SECRET=your_jwt_secret_here
OCM_API_KEY=your_ocm_api_key_here
FRONTEND_URL=http://localhost:5173
```

### Frontend — `client/.env`

```env
# Leave empty for local dev (Vite proxy handles it)
# Set to your Render backend URL for production
VITE_API_URL=
```

---

## Deploy to Vercel (Frontend)

> Make sure your backend is already deployed on Render first so you have the backend URL ready.

### Step 1 — Push to GitHub

```bash
git init
git add .
git status
# Confirm server/.env is NOT listed before continuing
git commit -m "Initial commit"
git remote add origin https://github.com/<your-username>/ev-chargehub.git
git branch -M main
git push -u origin main
```

### Step 2 — Import project on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Click **Import** on your `ev-chargehub` repo
3. On the configuration screen:
   - **Root Directory** → leave **blank** (empty)
   - **Framework Preset** → **Other**
   - **Build Command** → `cd client && npm install && npm run build`
   - **Output Directory** → `client/dist`

### Step 3 — Add environment variable

In the same screen under **Environment Variables**:

```
VITE_API_URL = https://your-render-backend.onrender.com
```

### Step 4 — Deploy

Click **Deploy**. Vercel will build and give you a live URL like `https://ev-chargehub.vercel.app`.

---

## Deploy Backend to Render

1. Go to [render.com](https://render.com) → **New Web Service**
2. Connect your GitHub repo
3. Settings:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add environment variables:
   ```
   MONGODB_URI   = <your Atlas URI>
   JWT_SECRET    = <your secret>
   OCM_API_KEY   = <your key>
   FRONTEND_URL  = https://ev-chargehub.vercel.app
   ```
5. Deploy and copy the backend URL

---

## OCPP WebSocket

| Environment | URL |
|-------------|-----|
| Local | `ws://localhost:5000/EVCHARGER-001` |
| Production | `wss://your-render-backend.onrender.com/EVCHARGER-001` |

The OCPP server runs on the same port as the HTTP server — no separate configuration needed.

---

## API Health Check

```
GET /api/health
```

Returns `{ "success": true, "message": "EV ChargeHub API is running 🚗⚡" }`

---

## License

Developed as an MCA mini project.
