# ForecastGuard AI — AAPL AI Reliability & Forecasting System

A full-stack fintech application that predicts next-day AAPL stock movement and quantifies how trustworthy each prediction is.

**Live Demo:** [forecastguardai.vercel.app](https://forecastguardai.vercel.app)

---

## The Core Idea

Most forecasting systems tell you *what* they predict. This system also tells you *whether to trust it*.

Three engines work together:
- **Engine A** — LSTM classifies direction (UP / DOWN)
- **Engine B** — LSTM estimates next-day price
- **Engine C** — XGBoost scores prediction reliability (0–100)

When both models agree and confidence is high → Low Risk, trade signal.
When models disagree or confidence is low → High Risk, no trade.

---

## Architecture

```
React Dashboard
      │
      ▼
Node / Express ──────► FastAPI (ML Service)
  Auth (JWT + OAuth)      Engine A: LSTM Direction
  WebSocket Server         Engine B: LSTM Price
  Rate Limiting            Engine C: XGBoost Reliability
  Redis Cache              Live data via yfinance
      │
      ▼
PostgreSQL + Redis
```

---

## Features

- **Next-day forecast** — direction, predicted price, reliability score, risk level
- **Live price ticker** — WebSocket pushes current AAPL price every 5 seconds
- **Prediction history** — every prediction saved to PostgreSQL per user
- **Redis caching** — repeat predictions served in <5ms, no redundant model inference
- **Rate limiting** — 7 predictions per user per minute via Redis
- **Auth** — email/password + Google OAuth, JWT-based

---

## Stack

| Layer | Technology |
|---|---|
| ML Service | Python, FastAPI, TensorFlow, XGBoost |
| Backend | Node.js, Express |
| Frontend | React, Vite |
| Database | PostgreSQL |
| Cache / Realtime | Redis, WebSockets |
| Auth | JWT, Google OAuth 2.0 |
| Deployment | Render (API + Backend), Vercel (Frontend) |

---

## Local Setup

```bash
# FastAPI ML service
cd fastapi
pip install --no-cache-dir fastapi uvicorn scikit-learn pandas numpy python-multipart yfinance tensorflow xgboost
uvicorn main:app --reload --port 8000

# Node backend
cd server
npm install && cp .env.example .env
npm run dev

# React frontend
cd client
npm install && cp .env.example .env
npm run dev
```

### Required Environment Variables

```bash
# backend/.env
DATABASE_URL=
JWT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=
REDIS_URL=
FASTAPI_URL=
SESSION_SECRET=
```

---

## API

```
POST /predict          Next-day AAPL forecast
GET  /profile          User profile + prediction history
POST /auth/signup      Register
POST /auth/login       Login
GET  /auth/google      Google OAuth
```

**Prediction response:**
```json
{
  "ticker": "AAPL",
  "current_price": 298.01,
  "predicted_price": 299.45,
  "direction": "UP",
  "direction_probability": 0.5612,
  "models_agree": true,
  "reliability_score": 63.20,
  "reliability_label": "High",
  "risk_level": "LOW",
  "risk_message": "Order approved",
  "timestamp": "2026-06-21T14:30:00Z"
}
```

---

## Disclaimer

Price data has a 15-minute delay via Yahoo Finance. Not financial advice. Built for educational and portfolio purposes.

