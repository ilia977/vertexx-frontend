// ─── Market ──────────────────────────────────────────────────────────────────
export interface Market {
  sym: string
  display: string
  ico: string
  color: string
  base: string
}

export interface TickerData {
  price: number
  ch: number    // 24h % change
  vol: number   // 24h volume USDT
  high: number
  low: number
}

export interface Kline {
  time: number  // unix seconds — required by lightweight-charts
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface DepthLevel {
  price: number
  qty: number
}

export interface OrderBookDepth {
  bids: DepthLevel[]
  asks: DepthLevel[]
}

export type WSStatus = 'connecting' | 'live' | 'stale' | 'error'

// ─── Orders ──────────────────────────────────────────────────────────────────
export type OrderSide = 'BUY' | 'SELL'
export type OrderType = 'MARKET' | 'LIMIT' | 'STOP_LOSS_LIMIT' | 'TAKE_PROFIT_LIMIT' | 'TRAILING_STOP_MARKET'
export type OrderStatus = 'filled' | 'pending' | 'rejected' | 'cancelled'
export type TimeInForce = 'GTC' | 'IOC' | 'FOK'

export interface OrderFormState {
  side: OrderSide
  type: OrderType
  size: string          // USDT amount
  limitPrice: string    // for LIMIT orders
  stopPrice: string     // for STOP_LOSS / TAKE_PROFIT
  trailingDelta: string // for TRAILING_STOP (in basis points, e.g. "100" = 1%)
  timeInForce: TimeInForce
}

export interface Order {
  id: string
  sym: string
  side: OrderSide
  type: OrderType
  size: string
  qty: string
  price: number | null
  stopPrice: number | null
  status: OrderStatus
  ts: string
}

// ─── Portfolio ───────────────────────────────────────────────────────────────
export interface Balance {
  asset: string
  free: string
  locked: string
}

export interface PortfolioRow {
  asset: string
  free: number
  locked: number
  price: number
  value: number
  color: string
  wsKey: string | null
}

// ─── AI / Smart Orders ───────────────────────────────────────────────────────
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface SmartOrder {
  sym: string
  base: string
  side: OrderSide
  sizeUSDT: number
  triggerPrice: number | undefined
  type: 'MARKET' | 'LIMIT'
  raw: string
}

// ─── Auth ────────────────────────────────────────────────────────────────────
export interface User {
  name: string
  email: string
}

// ─── App navigation ──────────────────────────────────────────────────────────
export type AppView = 'dashboard' | 'exchanges' | 'portfolio' | 'orders' | 'settings'
export type PanelTab = 'chart' | 'orderbook' | 'ai'
export type AuthMode = 'signin' | 'signup'
export type Lang = 'EN' | 'RU' | 'UA'

// ─── Chart indicators ────────────────────────────────────────────────────────
export type IndicatorType = 'RSI' | 'MACD' | 'NONE'

export interface RSIPoint {
  time: number
  value: number
}

export interface MACDPoint {
  time: number
  macd: number
  signal: number
  histogram: number
}

// ─── API responses ───────────────────────────────────────────────────────────
export interface AuthResponse {
  token?: string
  user?: { id: number; email: string }
  error?: string
}

export interface KeysCheckResponse {
  hasKeys: boolean
}

export interface BalanceResponse {
  balances?: Balance[]
  error?: string
}

export interface OrderResponse {
  orderId?: number
  symbol?: string
  side?: string
  type?: string
  origQty?: string
  price?: string
  status?: string
  time?: number
  error?: string
}
