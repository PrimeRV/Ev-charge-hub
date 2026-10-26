# EV ChargeHub

A MERN-based EV charging station management and analytics dashboard developed as an MCA mini project.

## Features

- Premium dark dashboard UI
- Responsive layout
- Charging analytics and revenue visualization
- Charger status monitoring
- Pune EV charging station map using Leaflet
- Active charging session monitoring
- EV station and connector management
- Booking and charging session management
- MongoDB integration
- OCPP 1.6 WebSocket integration
- REST API using Node.js and Express

## Tech Stack

**Frontend**
- React
- Vite
- Tailwind CSS
- Leaflet

**Backend**
- Node.js
- Express.js
- REST APIs
- WebSockets

**Database**
- MongoDB Atlas
- Mongoose

**Charging Protocol**
- OCPP 1.6

## Project Structure

```text
ev-chargehub/
├── client/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── ocpp/
│   ├── routes/
│   ├── services/
│   ├── package.json
│   └── server.js
├── .gitignore
├── DEPLOYMENT.md
└── README.md
```

## Prerequisites

- Node.js and npm
- MongoDB Atlas account or another configured MongoDB instance
- Git

## Run the Frontend

Open a terminal in the project root:

```bash
cd client
npm install
npm run dev
```

Frontend development URL: `http://localhost:5173`

## Run the Backend

Open another terminal in the project root:

```bash
cd server
npm install
npm run dev
```

Backend API base URL: `http://localhost:5000`

## Environment Configuration

Configure the required environment variables using the project's `.env.example` files.

- Backend configuration: `server/.env`
- Frontend configuration: `client/.env`

Use the actual variable names documented in the example files. Never commit real credentials, MongoDB connection strings, or private API keys.

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for deployment preparation and hosting instructions.

## Project Purpose

EV ChargeHub aims to provide a centralized interface for monitoring EV charging stations, managing bookings and charging sessions, and viewing charging analytics.

---

Developed as an MCA mini project.