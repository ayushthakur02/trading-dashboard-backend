# trading-dashboard-backend

Node.js + Express backend for the real-time trading dashboard. Simulates a live market data feed using Geometric Brownian Motion and streams price ticks over WebSocket. Exposes a REST API for ticker data and mocked historical OHLCV prices.

> Last updated: 5 June 2026, 01:58 AM IST

---

## Tech Stack

- Node.js + TypeScript
- Express — REST API
- ws — WebSocket server
- jsonwebtoken — JWT auth
- Jest + ts-jest — unit tests
- Docker — containerisation

---

## Prerequisites

- Node.js 20+ and npm
- Docker + Docker Compose (optional, for containerised setup)

---

## Setup & Running

### Local development

```bash
# 1. Clone the repo
git clone https://github.com/ayushthakur02/trading-dashboard-backend.git
cd trading-dashboard-backend

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env

# 4. Start the dev server (hot-reloads on file change)
npm run dev
```

Server starts on `http://localhost:4000`. You should see:
```
[server] http://localhost:4000
[server] ws://localhost:4000/ws
```

### Production build

```bash
npm run build    # compiles TypeScript to dist/
npm start        # runs the compiled output
```

### Environment Variables

```
PORT=4000
JWT_SECRET=trading-dashboard-secret
```

---

## API Reference

All `/api/tickers` routes require a Bearer token in the `Authorization` header.

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Returns JWT token |
| POST | `/api/auth/logout` | Stateless — client discards token |

**Login request body**
```json
{ "username": "trader", "password": "trade123" }
```

**Login response**
```json
{
  "token": "eyJ...",
  "user": { "id": "1", "username": "trader", "name": "Alex Carter", "role": "trader" }
}
```

Demo credentials: `trader / trade123` or `admin / admin123`

### Tickers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tickers` | All tickers with current live price |
| GET | `/api/tickers/:symbol/history?limit=100` | OHLCV candles (max 500, cached 30s) |
| GET | `/api/health` | Health check |

History responses include `X-Cache: HIT` or `X-Cache: MISS` headers.

### WebSocket

Connect to `ws://localhost:4000/ws?token=<jwt>`

**Subscribe**
```json
{ "action": "subscribe", "symbols": ["AAPL", "BTC-USD"] }
```

**Tick message (server → client)**
```json
{
  "type": "tick",
  "symbol": "AAPL",
  "price": 183.42,
  "change": 1.42,
  "changePercent": 0.78,
  "volume": 34200,
  "timestamp": 1748976000000
}
```

Connections without a valid token are closed immediately with code `1008`.

---

## Supported Tickers

| Symbol | Name | Type |
|--------|------|------|
| AAPL | Apple Inc. | Stock |
| TSLA | Tesla Inc. | Stock |
| MSFT | Microsoft Corp. | Stock |
| GOOGL | Alphabet Inc. | Stock |
| NVDA | NVIDIA Corp. | Stock |
| AMZN | Amazon.com Inc. | Stock |
| BTC-USD | Bitcoin USD | Crypto |
| ETH-USD | Ethereum USD | Crypto |

---

## Price Simulation

Prices are generated using **Geometric Brownian Motion**:

```
P(t+1) = P(t) * exp(σ * Z)
```

where `Z ~ N(0,1)` (Box-Muller transform) and `σ` is a per-ticker volatility parameter. Crypto tickers have higher volatility than equities. 200 historical 1-minute candles are pre-generated on startup.

---

## Running Tests

```bash
npm test
```

Output you should see:
```
PASS src/__tests__/marketSimulator.test.ts
  MarketSimulator
    ✓ initializes all 8 tickers
    ✓ each ticker has a positive price
    ✓ returns history for a known symbol
    ✓ history candles have valid OHLCV values
    ✓ returns null for an unknown symbol
    ✓ respects the limit parameter
    ✓ fires onTick listeners when running

Tests: 7 passed, 7 total
```

Tests cover price engine initialisation, OHLCV candle validity, history limit capping, unknown symbol handling, and tick listener behaviour.

---

## Docker

```bash
# Backend only
docker build -t trading-backend .
docker run -p 4000:4000 trading-backend
```

### Running the full stack with Docker Compose

Clone both repos into the same parent directory:

```
projects/
├── trading-dashboard-backend/   ← you are here
└── trading-dashboard-frontend/
```

Then from the backend directory:

```bash
docker-compose up --build
```

This builds and starts both containers. Frontend is served at `http://localhost:3000`, backend at `http://localhost:4000`. The nginx container inside the frontend image proxies `/api` and `/ws` to the backend automatically.

---

## Project Structure

```
src/
├── server.ts                  # Entry point
├── config.ts                  # Ticker definitions and constants
├── types/
│   ├── market.ts
│   └── auth.ts
├── data/
│   └── users.ts               # Hardcoded mock users
├── middleware/
│   └── auth.ts                # JWT verification
├── routes/
│   ├── tickers.route.ts
│   └── auth.route.ts
└── services/
    ├── marketSimulator.ts     # GBM price engine
    ├── broadcastService.ts    # WebSocket client manager
    └── historyCache.ts        # In-memory TTL cache
```
