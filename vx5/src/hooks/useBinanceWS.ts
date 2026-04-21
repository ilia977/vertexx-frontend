import { useState, useEffect, useRef, useCallback } from 'react'
import type { TickerData, Kline, OrderBookDepth, WSStatus } from '@/types'

const STALE_MS = 6000
const BACKOFF_MAX = 30000

interface UseBinanceWSReturn {
  prices: Record<string, TickerData>
  klines: Kline[]
  depth: OrderBookDepth
  status: WSStatus
}

async function fetchInitialKlines(sym: string, interval: string, limit = 200): Promise<Kline[]> {
  try {
    const url = `https://api.binance.com/api/v3/klines?symbol=${sym}&interval=${interval}&limit=${limit}`
    const res = await fetch(url)
    if (!res.ok) return []
    const data = await res.json() as Array<[number, string, string, string, string, string]>
    return data.map(k => ({
      time:   Math.floor(k[0] / 1000),
      open:   parseFloat(k[1]),
      high:   parseFloat(k[2]),
      low:    parseFloat(k[3]),
      close:  parseFloat(k[4]),
      volume: parseFloat(k[5]),
    }))
  } catch {
    return []
  }
}

export function useBinanceWS(sym: string, interval = '1m'): UseBinanceWSReturn {
  const [prices, setPrices] = useState<Record<string, TickerData>>({})
  const [klines, setKlines] = useState<Kline[]>([])
  const [depth, setDepth]   = useState<OrderBookDepth>({ bids: [], asks: [] })
  const [status, setStatus] = useState<WSStatus>('connecting')

  const ws1Ref      = useRef<WebSocket | null>(null)
  const ws2Ref      = useRef<WebSocket | null>(null)
  const reconnRef   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const staleRef    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tickerTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const depthTimer  = useRef<ReturnType<typeof setInterval> | null>(null)
  const attemptRef  = useRef(0)

  const resetStale = useCallback(() => {
    setStatus('live')
    if (staleRef.current) clearTimeout(staleRef.current)
    staleRef.current = setTimeout(() => setStatus('stale'), STALE_MS)
  }, [])

  const connect = useCallback(() => {
    if (ws1Ref.current) {
      ws1Ref.current.onclose = null
      try { ws1Ref.current.close() } catch (_) {}
      ws1Ref.current = null
    }
    setStatus('connecting')
  }, [])

  useEffect(() => {
    setKlines([])
    setDepth({ bids: [], asks: [] })
    attemptRef.current = 0

    // 1. Fetch initial candles via REST
    void fetchInitialKlines(sym, interval).then(initial => {
      if (initial.length > 0) setKlines(initial)
    })

    // 2. WebSocket for klines only
    const s = sym.toLowerCase()
    const ws1 = new WebSocket(
      `wss://stream.binance.com:9443/ws/${s}@kline_${interval}`
    )
    ws1Ref.current = ws1

    ws1.onopen = () => { attemptRef.current = 0; resetStale() }

    ws1.onmessage = (ev: MessageEvent<string>) => {
      resetStale()
      let msg: unknown
      try { msg = JSON.parse(ev.data) } catch { return }
      const m = msg as Record<string, unknown>
      if (m['e'] === 'kline') {
        const k = m['k'] as Record<string, unknown>
        const candle: Kline = {
          time:   Math.floor((k['t'] as number) / 1000),
          open:   parseFloat(k['o'] as string),
          high:   parseFloat(k['h'] as string),
          low:    parseFloat(k['l'] as string),
          close:  parseFloat(k['c'] as string),
          volume: parseFloat(k['v'] as string),
        }
        setKlines(prev => {
          const nx = [...prev]
          const last = nx[nx.length - 1]
          if (!last || last.time !== candle.time) {
            nx.push(candle)
            if (nx.length > 500) nx.shift()
          } else {
            nx[nx.length - 1] = candle
          }
          return nx
        })
      }
    }

    ws1.onerror = () => setStatus('error')
    ws1.onclose = () => {
      setStatus('stale')
      const delay = Math.min(1000 * Math.pow(2, attemptRef.current), BACKOFF_MAX)
      attemptRef.current += 1
      reconnRef.current = setTimeout(connect, delay)
    }

    // 3. Poll depth via REST every 1 second
    if (depthTimer.current) clearInterval(depthTimer.current)
    depthTimer.current = setInterval(() => {
      void fetch(`https://api.binance.com/api/v3/depth?symbol=${sym}&limit=20`)
        .then(r => r.json())
        .then((d: { bids: [string, string][]; asks: [string, string][] }) => {
          setDepth({
            bids: d.bids.slice(0, 16).map(([p, q]) => ({ price: parseFloat(p), qty: parseFloat(q) })),
            asks: d.asks.slice(0, 16).map(([p, q]) => ({ price: parseFloat(p), qty: parseFloat(q) })),
          })
        })
        .catch(() => {})
    }, 1000)

    // 4. miniTicker via WebSocket with delay
    if (tickerTimer.current) clearTimeout(tickerTimer.current)
    tickerTimer.current = setTimeout(() => {
      if (ws2Ref.current) return
      const ws2 = new WebSocket('wss://stream.binance.com:9443/ws/!miniTicker@arr')
      ws2Ref.current = ws2
      ws2.onmessage = (ev: MessageEvent<string>) => {
        let msg: unknown
        try { msg = JSON.parse(ev.data) } catch { return }
        if (!Array.isArray(msg)) return
        const update: Record<string, TickerData> = {}
        ;(msg as Array<Record<string, string>>).forEach(t => {
          const open  = parseFloat(t['o'])
          const close = parseFloat(t['c'])
          update[t['s']] = {
            price: close,
            ch:    open > 0 ? ((close - open) / open) * 100 : 0,
            vol:   parseFloat(t['q']),
            high:  parseFloat(t['h']),
            low:   parseFloat(t['l']),
          }
        })
        setPrices(prev => ({ ...prev, ...update }))
      }
      ws2.onerror = () => {}
      ws2.onclose = () => {}
    }, 1500)

    return () => {
      if (depthTimer.current) clearInterval(depthTimer.current)
      if (reconnRef.current) clearTimeout(reconnRef.current)
      if (staleRef.current) clearTimeout(staleRef.current)
      if (tickerTimer.current) clearTimeout(tickerTimer.current)
      if (ws1Ref.current) {
        ws1Ref.current.onclose = null
        try { ws1Ref.current.close() } catch (_) {}
        ws1Ref.current = null
      }
      if (ws2Ref.current) {
        ws2Ref.current.onclose = null
        try { ws2Ref.current.close() } catch (_) {}
        ws2Ref.current = null
      }
    }
  }, [sym, interval, connect, resetStale])

  return { prices, klines, depth, status }
}