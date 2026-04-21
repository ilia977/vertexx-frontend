# VertexX Trading Platform v5.0

> Professional crypto trading platform — Vite + React 18 + TypeScript · Real-time Binance data · AI Smart Orders · PWA

---

## ✨ Features

| Feature | Details |
|---|---|
| 📈 **TradingView-grade charts** | `lightweight-charts` v4 — candlestick, volume, RSI, MACD, custom levels |
| ⚡ **5 order types** | Market, Limit, Stop Loss, Take Profit, Trailing Stop |
| 🤖 **AI Smart Orders** | Natural language → Claude parses → confirms → executes real order |
| 📡 **Real-time WebSocket** | Binance public streams — prices, candles, order book depth |
| 🔐 **AES-256 key storage** | API keys encrypted server-side, never in browser |
| 📱 **Mobile First + PWA** | Responsive layout, bottom navigation, installable on iOS/Android |
| 🌐 **3 languages** | EN / RU / UA |
| ⚡ **Performance** | `React.memo` per component, virtualized order book, exponential WS backoff |
| 🟦 **100% TypeScript** | Strict mode, zero `any`, all API responses typed |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Backend running on port 4000 (`vertexx-backend/`)

### Run

```bash
unzip vertexx-v5.zip
cd vertexx-v5
npm install
npm run dev
# → http://localhost:3000
```

### Type check
```bash
npm run type-check
```

### Production build
```bash
npm run build
# Output: dist/
```

---

## 🏗️ Project Structure

```
src/
├── types/
│   └── index.ts              # All TypeScript interfaces — single source of truth
├── utils/
│   ├── constants.ts          # MARKETS, palette, translations (EN/RU/UA)
│   ├── api.ts                # Typed fetch wrappers for backend
│   ├── smartOrder.ts         # NLP parser: text → SmartOrder
│   └── indicators.ts         # RSI + MACD calculations (pure functions)
├── hooks/
│   ├── useBinanceWS.ts       # WebSocket + exponential backoff + stale detection
│   └── useMediaQuery.ts      # Mobile detection hook
├── components/
│   ├── chart/
│   │   ├── TradingChart.tsx  # lightweight-charts — candles, volume, RSI, MACD, levels
│   │   └── ChartToolbar.tsx  # Interval + indicator switcher
│   ├── orderbook/
│   │   └── OrderBook.tsx     # React.memo per row — no full re-render on tick
│   ├── orders/
│   │   └── OrderPanel.tsx    # All 5 order types — Market/Limit/SL/TP/Trailing
│   ├── layout/
│   │   ├── Sidebar.tsx       # Desktop navigation
│   │   ├── Topbar.tsx        # Price chip, balance, WS status, language
│   │   └── MobileNav.tsx     # Bottom tab bar for mobile
│   └── ai/
│       └── AIPanel.tsx       # Chat UI + Smart Order confirmation card + useAI hook
├── views/
│   ├── AuthScreen.tsx        # Login / Register
│   ├── Dashboard.tsx         # Main trading view (desktop + mobile layouts)
│   ├── Exchanges.tsx         # Binance API key management
│   ├── Portfolio.tsx         # Real balances from Binance
│   ├── Orders.tsx            # Order history + cancel
│   └── Settings.tsx          # Language, indicators guide, order types guide
└── App.tsx                   # Root: routing, global state (~120 lines)
```

---

## 📊 Chart Features

### Indicators
- **RSI(14)** — Relative Strength Index, purple line, separate price scale
- **MACD(12,26,9)** — MACD line (blue) + Signal (gold) + Histogram, separate scale

### Drawing
- Click `─ Level` in chart toolbar → click on price → draws dashed horizontal line
- Click `Clear` to remove all drawn levels

### Intervals
`1m · 3m · 5m · 15m · 30m · 1h · 4h · 1d`

---

## ⚡ Order Types

| Type | Description | Required fields |
|---|---|---|
| **Market** | Execute at current price | Size |
| **Limit** | Execute at specified price or better | Size + Limit Price |
| **Stop Loss** | Triggered when price drops to stop level | Size + Limit Price + Stop Price |
| **Take Profit** | Triggered when price rises to target | Size + Limit Price + Stop Price |
| **Trailing Stop** | Stop follows price by % delta | Size + Trailing Delta (%) |

---

## 🤖 AI Smart Orders

Say anything natural in the AI Assistant tab:

```
"Buy BTC for $100 if price drops to 60000"
→ LIMIT BUY BTCUSDT · $100 · trigger @ $60,000

"Sell ETH for $50 at market price"  
→ MARKET SELL ETHUSDT · $50 · immediate

"Buy SOL for $200 when price reaches 120"
→ LIMIT BUY SOLUSDT · $200 · trigger @ $120
```

The AI shows a confirmation card with all order details before executing.

---

## 🔐 Security Architecture

```
Browser                    Backend (Node.js)          Binance
  │                              │                        │
  │  POST /api/keys/save         │                        │
  │  { api_key, api_secret } ───▶│  AES-256 encrypt       │
  │                              │  Store in PostgreSQL   │
  │                              │                        │
  │  POST /api/orders/place ────▶│  Decrypt keys          │
  │                              │  Sign with HMAC-SHA256 │
  │                              │──────────────────────▶ │
  │◀──────────────── response ───│◀────────────────────── │
```

**API keys never touch the browser after saving.**

---

## 📱 PWA — Install on Mobile

1. Open `http://your-server/` in Chrome (Android) or Safari (iOS)
2. Android: tap menu → **"Add to Home Screen"**
3. iOS: tap Share → **"Add to Home Screen"**

The app works offline for cached assets. Live prices require internet.

---

## 🔧 Backend Connection

The frontend proxies all `/api/*` requests to `http://localhost:4000` via Vite dev server (`vite.config.ts`).

For production, point the proxy to your deployed backend URL.

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Bundler | Vite 5 |
| UI | React 18 + TypeScript (strict) |
| Charts | lightweight-charts v4 |
| State | React hooks (useState, useCallback, useMemo, memo) |
| Data | Binance WebSocket (public streams) |
| AI | Anthropic Claude Sonnet |
| Mobile | CSS media queries + PWA |
| PWA | vite-plugin-pwa + Workbox |
