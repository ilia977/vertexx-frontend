import { useState, useEffect, useRef, useCallback } from 'react'
import { GLOBAL_CSS, T, MARKETS } from '@/utils/constants'
import { useBinanceWS } from '@/hooks/useBinanceWS'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { apiCheckKeys, apiGetBalance, apiGetOpenOrders } from '@/utils/api'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { MobileNav } from '@/components/layout/MobileNav'
import { AuthScreen } from '@/views/AuthScreen'
import { Dashboard } from '@/views/Dashboard'
import { Exchanges } from '@/views/Exchanges'
import { Portfolio } from '@/views/Portfolio'
import { Orders } from '@/views/Orders'
import { Settings } from '@/views/Settings'
import type { User, AppView, Lang, Order, Balance, OrderSide, OrderType, OrderResponse } from '@/types'
import type { Interval } from '@/components/chart/ChartToolbar'

export default function App() {
  useEffect(() => {
    const s = document.createElement('style')
    s.textContent = GLOBAL_CSS
    document.head.appendChild(s)
    return () => { document.head.removeChild(s) }
  }, [])

  const [user, setUser]         = useState<User | null>(null)
  const [lang, setLang]         = useState<Lang>('EN')
  const [view, setView]         = useState<AppView>('dashboard')
  const [mini, setMini]         = useState(false)
  const [sym, setSym]           = useState('BTCUSDT')
  const [interval, setInterval] = useState<Interval>('1m')
  const [flash, setFlash]       = useState<'up' | 'down' | null>(null)
  const [hasKeys, setHasKeys]   = useState(false)
  const [balances, setBalances] = useState<Balance[]>([])
  const [orders, setOrders]     = useState<Order[]>([])
  const prevPx = useRef<Record<string, number>>({})

  const isMobile   = useIsMobile()
  const { prices, klines, depth, status } = useBinanceWS(sym, interval)
  const ticker     = prices[sym]
  const t          = T[lang] ?? T['EN']!
  const marketMeta = MARKETS.find(m => m.sym === sym) ?? MARKETS[0]!

  useEffect(() => {
    const px = ticker?.price
    if (!px) return
    const prev = prevPx.current[sym]
    if (prev !== undefined && prev !== px) {
      setFlash(px > prev ? 'up' : 'down')
      setTimeout(() => setFlash(null), 650)
    }
    prevPx.current[sym] = px
  }, [ticker?.price, sym])

  useEffect(() => {
    if (!user) return
    void apiCheckKeys().then(r => setHasKeys(r.hasKeys)).catch(() => {})
  }, [user])

  const loadAccountData = useCallback(() => {
    void apiGetBalance()
      .then(r => { if (r.balances) setBalances(r.balances) })
      .catch(() => {})
    void apiGetOpenOrders()
      .then((raw: OrderResponse[]) => {
        if (!Array.isArray(raw)) return
        setOrders(raw.map((o: OrderResponse) => ({
          id:        String(o.orderId ?? Date.now()),
          sym:       String(o.symbol ?? ''),
          side:      (String(o.side ?? 'BUY').toUpperCase()) as OrderSide,
          type:      (String(o.type ?? 'MARKET').toUpperCase()) as OrderType,
          size:      String(o.origQty ?? '0'),
          qty:       String(o.origQty ?? '0'),
          price:     o.price ? parseFloat(o.price) : null,
          stopPrice: null,
          status:    'pending' as const,
          ts:        o.time ? new Date(o.time).toLocaleTimeString() : '',
        })))
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (user && hasKeys) loadAccountData()
  }, [user, hasKeys, loadAccountData])

  const handleLogin          = useCallback((u: User) => { setUser(u); setView('dashboard') }, [])
  const handleLogout         = useCallback(() => {
    localStorage.removeItem('vx_token')
    setUser(null); setHasKeys(false); setBalances([]); setOrders([])
  }, [])
  const handleOrderPlaced    = useCallback((o: Order) => { setOrders(p => [o, ...p].slice(0, 100)) }, [])
  const handleOrderCancelled = useCallback((id: string) => {
    setOrders(p => p.map(o => o.id === id ? { ...o, status: 'cancelled' as const } : o))
  }, [])

  const usdtBal = parseFloat(balances.find(b => b.asset === 'USDT')?.free ?? '0')

  if (!user) {
    return <AuthScreen prices={prices} status={status} lang={lang} onLang={setLang} onLogin={handleLogin} />
  }

  return (
    <div style={{ display: 'flex', height: '100%', background: '#06080f', overflow: 'hidden' }}>
      {!isMobile && (
        <Sidebar view={view} user={user} mini={mini} hasKeys={hasKeys}
          onView={setView} onLogout={handleLogout} onToggle={() => setMini(m => !m)} />
      )}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar mini={mini} onToggleMini={() => setMini(m => !m)}
          sym={sym} metaIco={marketMeta.ico} metaColor={marketMeta.color}
          ticker={ticker} flash={flash} status={status}
          usdtBalance={usdtBal} lang={lang} onLang={setLang} userName={user.name} />
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
          {view === 'dashboard' && (
            <Dashboard
              sym={sym} onSymChange={setSym}
              interval={interval} onIntervalChange={setInterval}
              prices={prices} klines={klines} depth={depth} status={status}
              balances={balances} hasKeys={hasKeys}
              orders={orders} onOrderPlaced={handleOrderPlaced}
              flash={flash} t={t}
            />
          )}
          {view === 'exchanges' && (
            <Exchanges hasKeys={hasKeys}
              onKeysConnected={() => { setHasKeys(true); loadAccountData() }}
              onDisconnect={() => { setHasKeys(false); setBalances([]) }}
              t={t} />
          )}
          {view === 'portfolio' && (
            <Portfolio balances={balances} prices={prices}
              hasKeys={hasKeys} onView={setView} onSymChange={setSym} t={t} />
          )}
          {view === 'orders' && (
            <Orders orders={orders} onView={setView}
              onOrderCancelled={handleOrderCancelled} t={t} />
          )}
          {view === 'settings' && (
            <Settings user={user} status={status} lang={lang} onLang={setLang} t={t} />
          )}
        </div>
      </div>
      {isMobile && <MobileNav view={view} onView={setView} />}
    </div>
  )
}
