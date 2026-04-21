import type {
  AuthResponse, KeysCheckResponse, BalanceResponse, OrderResponse,
} from '@/types'

const getToken = (): string => localStorage.getItem('vx_token') ?? ''

const authHeaders = (): Record<string, string> => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
})

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  return res.json() as Promise<T>
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const apiRegister = (email: string, password: string): Promise<AuthResponse> =>
  request<AuthResponse>('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

export const apiLogin = (email: string, password: string): Promise<AuthResponse> =>
  request<AuthResponse>('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

// ─── Keys ─────────────────────────────────────────────────────────────────────
export const apiSaveKeys = (api_key: string, api_secret: string): Promise<{ success: boolean; error?: string }> =>
  request('/api/keys/save', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ api_key, api_secret }),
  })

export const apiCheckKeys = (): Promise<KeysCheckResponse> =>
  request<KeysCheckResponse>('/api/keys/check', { headers: authHeaders() })

// ─── Account ──────────────────────────────────────────────────────────────────
export const apiGetBalance = (): Promise<BalanceResponse> =>
  request<BalanceResponse>('/api/account/balance', { headers: authHeaders() })

// ─── Orders ───────────────────────────────────────────────────────────────────
export interface PlaceOrderPayload {
  symbol: string
  side: string
  type: string
  quantity: string
  price?: string
  stopPrice?: string
  trailingDelta?: string
  timeInForce?: string
}

export const apiPlaceOrder = (payload: PlaceOrderPayload): Promise<OrderResponse> =>
  request<OrderResponse>('/api/orders/place', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })

export const apiGetOpenOrders = (): Promise<OrderResponse[]> =>
  request<OrderResponse[]>('/api/orders/open', { headers: authHeaders() })

export const apiCancelOrder = (symbol: string, orderId: string): Promise<OrderResponse> =>
  request<OrderResponse>('/api/orders/cancel', {
    method: 'DELETE',
    headers: authHeaders(),
    body: JSON.stringify({ symbol, orderId }),
  })
