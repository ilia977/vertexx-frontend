import { useState, useCallback, memo } from 'react'
import { C, MARKETS } from '@/utils/constants'
import type { Translations } from '@/utils/constants'
import type {
  TickerData, Kline, OrderBookDepth, Order,
  Balance, WSStatus, PanelTab, IndicatorType,
  OrderSide, OrderType,
} from '@/types'
import { TradingChart } from '@/components/chart/TradingChart'
import { ChartToolbar } from '@/components/chart/ChartToolbar'
import type { Interval } from '@/components/chart/ChartToolbar'
import { OrderBook } from '@/components/orderbook/OrderBook'
import { OrderPanel } from '@/components/orders/OrderPanel'
import { AIPanel, useAI } from '@/components/ai/AIPanel'
import { useIsMobile } from '@/hooks/useMediaQuery'

interface DashboardProps {
  sym: string
  onSymChange: (s: string) => void
  prices: Record<string, TickerData>
  klines: Kline[]
  depth: OrderBookDepth
  status: WSStatus
  balances: Balance[]
  hasKeys: boolean
  orders: Order[]
  onOrderPlaced: (o: Order) => void
  interval: Interval
  onIntervalChange: (i: Interval) => void
  flash: 'up' | 'down' | null
  t: Translations
}

function DashboardInner({
  sym, onSymChange, prices, klines, depth,
  balances, hasKeys, orders, onOrderPlaced,
  interval, onIntervalChange,
  flash, t,
}: DashboardProps) {
  const [panel, setPanel]       = useState<PanelTab>('chart')
  const [search, setSearch]     = useState('')
  const [indicator, setIndicator] = useState<IndicatorType>('NONE')
  const [chartMode, setChartMode] = useState<'candles' | 'area'>('candles')

  const isMobile = useIsMobile()

  const meta = MARKETS.find(m => m.sym === sym) ?? MARKETS[0]!
  const ticker = prices[sym]
  const px = ticker?.price
  const rawCh = ticker?.ch
  const ch = rawCh !== undefined && !isNaN(rawCh) ? rawCh : 0

  const { msgs: aiMsgs, loading: aiLoad, pendingOrder, send: aiSend, confirm: aiConfirm, cancel: aiCancel } = useAI(sym, px, ch)

  const filtered = MARKETS.filter(m =>
    m.display.toLowerCase().includes(search.toLowerCase()) ||
    m.base.toLowerCase().includes(search.toLowerCase())
  )

  const handleOrderPlaced = useCallback((info: {
    sym: string; side: OrderSide; type: OrderType
    qty: string; price: number | null; stopPrice: number | null
  }) => {
    const order: Order = {
      id:        `o${Date.now()}`,
      sym:       info.sym,
      side:      info.side,
      type:      info.type,
      size:      info.qty,
      qty:       info.qty,
      price:     info.price,
      stopPrice: info.stopPrice,
      status:    'filled',
      ts:        new Date().toLocaleTimeString(),
    }
    onOrderPlaced(order)
  }, [onOrderPlaced])

  // ── Mobile layout ────────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', paddingBottom: 56 }}>
        {/* Price header */}
        <div style={{ padding: '12px 16px', background: C.bg1, borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ color: C.t2, fontSize: 11, fontWeight: 700 }}>{meta.display}</div>
              <div className={`mono${flash === 'up' ? ' fu' : flash === 'down' ? ' fd' : ''}`}
                style={{ color: C.t1, fontSize: 22, fontWeight: 700 }}>
                {px ? `$${px.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
              </div>
            </div>
            <div style={{
              background: ch >= 0 ? C.greenDim : C.redDim,
              border: `1px solid ${ch >= 0 ? C.greenB : C.redB}`,
              borderRadius: 9, padding: '6px 12px',
              color: ch >= 0 ? C.green : C.red, fontSize: 13, fontWeight: 700,
            }}>
              {ch >= 0 ? '+' : ''}{ch.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Mobile panel tabs */}
        <div style={{ display: 'flex', gap: 0, background: C.bg1, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          {([['chart', t.chart, '📈'], ['orderbook', t.orderBook, '📊'], ['ai', t.aiAssistant, '🤖']] as [PanelTab, string, string][]).map(([id, lbl, ico]) => (
            <button key={id} onClick={() => setPanel(id)}
              style={{
                flex: 1, padding: '10px 4px', fontSize: 11, fontWeight: 700,
                border: 'none', borderBottom: `2px solid ${panel === id ? C.gold : 'transparent'}`,
                background: 'transparent', color: panel === id ? C.gold : C.t2,
              }}>
              {ico} {lbl}
            </button>
          ))}
        </div>

        {/* Panel content */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {panel === 'chart' && (
            <>
              <ChartToolbar interval={interval} indicator={indicator} chartMode={chartMode} onInterval={onIntervalChange} onIndicator={setIndicator} onChartMode={setChartMode} t={t} />
              <div style={{ flex: 1, minHeight: 0 }}>
                {klines.length > 5
                  ? <TradingChart klines={klines} sym={sym} indicator={indicator} chartMode={chartMode} />
                  : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: C.t3, gap: 10 }}>
                      <div className="spin" style={{ width: 20, height: 20, border: `2px solid ${C.border}`, borderTopColor: C.gold, borderRadius: '50%' }} />
                      Loading…
                    </div>}
              </div>
              {/* Order panel below chart on mobile */}
              <div style={{ background: C.bg1, borderTop: `1px solid ${C.border}`, padding: '12px', overflowY: 'auto', maxHeight: '40vh' }}>
                <OrderPanel
                  sym={sym} base={meta.base}
                  currentPrice={px} balances={balances}
                  hasKeys={hasKeys} t={t}
                  onOrderPlaced={handleOrderPlaced}
                />
              </div>
            </>
          )}

          {panel === 'orderbook' && (
            <div style={{ flex: 1, padding: '10px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {depth.bids.length > 0
                ? <OrderBook depth={depth} currentPrice={px} />
                : <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.t3, gap: 10 }}>
                    <div className="spin" style={{ width: 18, height: 18, border: `2px solid ${C.border}`, borderTopColor: C.t3, borderRadius: '50%' }} />
                    Loading…
                  </div>}
            </div>
          )}

          {panel === 'ai' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>🤖</span>
                <span style={{ color: C.t1, fontSize: 13, fontWeight: 700 }}>{t.aiAssistant}</span>
                <span style={{ marginLeft: 'auto', background: C.purpleDim, border: `1px solid ${C.purpleB}`, borderRadius: 6, padding: '2px 8px', color: C.purple, fontSize: 10, fontWeight: 700 }}>Claude</span>
              </div>
              <AIPanel
                msgs={aiMsgs} loading={aiLoad} pendingOrder={pendingOrder} t={t}
                currentSym={sym} currentPrice={px} change24h={ch}
                balances={balances} hasKeys={hasKeys}
                onSend={aiSend} onConfirm={aiConfirm} onCancel={aiCancel}
                onOrderPlaced={handleOrderPlaced}
              />
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── Desktop layout ───────────────────────────────────────────────────────────
  return (
    <div style={{ flex: 1, display: 'flex', gap: 0, overflow: 'hidden' }}>

      {/* LEFT — chart area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '14px 0 14px 14px', gap: 10 }}>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
          {([
            ['24h High', ticker?.high ? `$${ticker.high.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '—', true],
            ['24h Low',  ticker?.low  ? `$${ticker.low.toLocaleString(undefined, { maximumFractionDigits: 2 })}`  : '—', false],
            ['Volume',   ticker?.vol  ? `$${(ticker.vol / 1e6).toFixed(0)}M` : '—', true],
            ['Change',   `${ch >= 0 ? '+' : ''}${ch.toFixed(2)}%`, ch >= 0],
          ] as [string, string, boolean][]).map(([label, value, pos]) => (
            <div key={label} style={{ flex: 1, background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 16px' }}>
              <div style={{ color: C.t3, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 5 }}>{label}</div>
              <div className="mono" style={{ color: label === 'Change' ? (pos ? C.green : C.red) : C.t1, fontSize: 15, fontWeight: 700 }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Panel tabs */}
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          {([['chart', t.chart, '📈'], ['orderbook', t.orderBook, '📊'], ['ai', t.aiAssistant, '🤖']] as [PanelTab, string, string][]).map(([id, lbl, ico]) => (
            <button key={id} onClick={() => setPanel(id)}
              style={{
                padding: '6px 14px', fontSize: 12, fontWeight: 700, borderRadius: 8,
                border: `1px solid ${panel === id ? C.goldB : C.border}`,
                background: panel === id ? C.goldBg : 'transparent',
                color: panel === id ? C.gold : C.t2,
              }}>
              {ico} {lbl}
            </button>
          ))}
        </div>

        {/* Chart panel */}
        {panel === 'chart' && (
          <div style={{ flex: 1, background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }} className="si">
            {/* Price header */}
            <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div>
                <div style={{ color: C.t2, fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', marginBottom: 4 }}>{meta.display} · {interval} · Live</div>
                <div className={`mono${flash === 'up' ? ' fu' : flash === 'down' ? ' fd' : ''}`}
                  style={{ color: C.t1, fontSize: 26, fontWeight: 700 }}>
                  {px
                    ? `$${px.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : <span style={{ color: C.t3 }}>Connecting…</span>}
                </div>
              </div>
              <div style={{
                background: ch >= 0 ? C.greenDim : C.redDim,
                border: `1px solid ${ch >= 0 ? C.greenB : C.redB}`,
                borderRadius: 9, padding: '6px 14px',
                color: ch >= 0 ? C.green : C.red, fontSize: 14, fontWeight: 700,
              }}>
                {ch >= 0 ? '+' : ''}{ch.toFixed(2)}%
              </div>
            </div>
            <ChartToolbar interval={interval} indicator={indicator} chartMode={chartMode} onInterval={onIntervalChange} onIndicator={setIndicator} onChartMode={setChartMode} t={t} />
            <div style={{ flex: 1, minHeight: 0 }}>
              {klines.length > 5
                ? <TradingChart klines={klines} sym={sym} indicator={indicator} chartMode={chartMode} />
                : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: C.t3, gap: 10, fontSize: 13 }}>
                    <div className="spin" style={{ width: 20, height: 20, border: `2px solid ${C.border}`, borderTopColor: C.gold, borderRadius: '50%' }} />
                    Loading live data…
                  </div>}
            </div>
          </div>
        )}

        {/* Order Book panel */}
        {panel === 'orderbook' && (
          <div style={{ flex: 1, background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 16, padding: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }} className="si">
            <div style={{ color: C.t1, fontSize: 13, fontWeight: 700, marginBottom: 10, flexShrink: 0 }}>{t.orderBook} · {meta.display}</div>
            {depth.bids.length > 0
              ? <div style={{ flex: 1, minHeight: 0 }}><OrderBook depth={depth} currentPrice={px} /></div>
              : <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.t3, gap: 10, fontSize: 13 }}>
                  <div className="spin" style={{ width: 18, height: 18, border: `2px solid ${C.border}`, borderTopColor: C.t3, borderRadius: '50%' }} />
                  Loading…
                </div>}
          </div>
        )}

        {/* AI panel */}
        {panel === 'ai' && (
          <div style={{ flex: 1, background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }} className="si">
            <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <span style={{ fontSize: 14 }}>🤖</span>
              <span style={{ color: C.t1, fontSize: 13, fontWeight: 700 }}>{t.aiAssistant}</span>
              <span style={{ marginLeft: 'auto', background: C.purpleDim, border: `1px solid ${C.purpleB}`, borderRadius: 6, padding: '2px 8px', color: C.purple, fontSize: 10, fontWeight: 700 }}>
                Claude Sonnet
              </span>
            </div>
            <AIPanel
              msgs={aiMsgs} loading={aiLoad} pendingOrder={pendingOrder} t={t}
              currentSym={sym} currentPrice={px} change24h={ch}
              balances={balances} hasKeys={hasKeys}
              onSend={aiSend} onConfirm={aiConfirm} onCancel={aiCancel}
              onOrderPlaced={handleOrderPlaced}
            />
          </div>
        )}
      </div>

      {/* RIGHT — markets + order panel */}
      <div style={{ width: 272, display: 'flex', flexDirection: 'column', gap: 12, padding: '14px', overflow: 'hidden' }}>

        {/* Markets list */}
        <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0, height: '40%' }}>
          <div style={{ padding: '12px 12px 8px', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
            <div style={{ color: C.t1, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{t.markets}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: C.bg0, borderRadius: 8, padding: '6px 10px', border: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 11 }}>🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t.search}
                style={{ background: 'none', border: 'none', color: C.t1, fontSize: 12, width: '100%' }} />
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '4px 6px' }}>
            {filtered.map(m => {
              const d = prices[m.sym]
              const sel = sym === m.sym
              return (
                <div key={m.sym} onClick={() => onSymChange(m.sym)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 7px', borderRadius: 8, cursor: 'pointer', background: sel ? C.bg3 : 'transparent', marginBottom: 1, transition: 'background 0.12s' }}
                  onMouseEnter={e => { if (!sel) (e.currentTarget as HTMLDivElement).style.background = C.bg2 }}
                  onMouseLeave={e => { if (!sel) (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}>
                  <div style={{ width: 27, height: 27, borderRadius: 7, background: m.color + '1a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: m.color, fontSize: 11, fontWeight: 800 }}>{m.ico}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: C.t1, fontSize: 12, fontWeight: 600 }}>{m.display}</div>
                    <div className="mono" style={{ color: C.t3, fontSize: 9 }}>{d ? `Vol $${(d.vol / 1e6).toFixed(0)}M` : '—'}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="mono" style={{ color: C.t1, fontSize: 11, fontWeight: 600 }}>
                      {d ? (d.price > 100 ? `$${d.price.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : `$${d.price.toFixed(4)}`) : '—'}
                    </div>
                    <div style={{ color: d && d.ch >= 0 ? C.green : C.red, fontSize: 9, fontWeight: 700 }}>
                      {d ? `${d.ch >= 0 ? '+' : ''}${d.ch.toFixed(2)}%` : '—'}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Order panel */}
        <div style={{ flex: 1, background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 16, padding: '14px', overflowY: 'auto' }}>
          <div style={{ color: C.t1, fontSize: 13, fontWeight: 700, marginBottom: 10 }}>{t.placeOrder} · {meta.base}</div>
          {!hasKeys && (
            <div style={{ background: C.purpleDim, border: `1px solid ${C.purpleB}`, borderRadius: 8, padding: '8px 10px', marginBottom: 10 }}>
              <div style={{ color: C.purple, fontSize: 10, fontWeight: 700 }}>🔗 Connect Binance in Exchanges tab</div>
            </div>
          )}
          <OrderPanel
            sym={sym} base={meta.base}
            currentPrice={px} balances={balances}
            hasKeys={hasKeys} t={t}
            onOrderPlaced={handleOrderPlaced}
          />

          {/* Recent orders */}
          {orders.slice(0, 3).map(o => (
            <div key={o.id} className="si" style={{
              marginTop: 6,
              background: o.status === 'filled' ? C.greenDim : o.status === 'pending' ? C.goldBg : C.redDim,
              border: `1px solid ${o.status === 'filled' ? C.greenB : o.status === 'pending' ? C.goldB : C.redB}`,
              borderRadius: 8, padding: '7px 10px',
            }}>
              <div style={{ color: o.status === 'filled' ? C.green : o.status === 'pending' ? C.gold : C.red, fontSize: 10, fontWeight: 700, marginBottom: 2 }}>
                {o.status === 'filled' ? '✓ Filled' : o.status === 'pending' ? '⏳ Pending' : '✕ Rejected'} · {o.ts}
              </div>
              <div className="mono" style={{ color: C.t2, fontSize: 10 }}>{o.side} {o.sym} · {o.qty} · {o.type}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export const Dashboard = memo(DashboardInner)
