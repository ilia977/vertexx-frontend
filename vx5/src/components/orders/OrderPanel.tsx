import { useState, useCallback, memo } from 'react'
import { C } from '@/utils/constants'
import type { Translations } from '@/utils/constants'
import type { OrderFormState, OrderSide, OrderType, TimeInForce, Balance } from '@/types'
import { apiPlaceOrder } from '@/utils/api'

interface OrderPanelProps {
  sym: string
  base: string
  currentPrice: number | undefined
  balances: Balance[]
  hasKeys: boolean
  t: Translations
  onOrderPlaced: (order: {
    sym: string; side: OrderSide; type: OrderType
    qty: string; price: number | null; stopPrice: number | null
  }) => void
}

const ORDER_TYPES: { key: OrderType; label: string }[] = [
  { key: 'MARKET',             label: 'Market'   },
  { key: 'LIMIT',              label: 'Limit'    },
  { key: 'STOP_LOSS_LIMIT',    label: 'Stop Loss'},
  { key: 'TAKE_PROFIT_LIMIT',  label: 'Take Profit'},
  { key: 'TRAILING_STOP_MARKET', label: 'Trailing'},
]

const TIF_OPTIONS: TimeInForce[] = ['GTC', 'IOC', 'FOK']

function OrderPanelInner({ sym, base, currentPrice, balances, hasKeys, t, onOrderPlaced }: OrderPanelProps) {
  const [form, setForm] = useState<OrderFormState>({
    side: 'BUY', type: 'MARKET', size: '',
    limitPrice: '', stopPrice: '', trailingDelta: '', timeInForce: 'GTC',
  })
  const [loading, setLoading] = useState(false)
  const [err, setErr]   = useState('')
  const [ok, setOk]     = useState('')

  const usdtFree = parseFloat(
    balances.find(b => b.asset === 'USDT')?.free ?? '0'
  )

  const setField = useCallback(<K extends keyof OrderFormState>(
    key: K, value: OrderFormState[K]
  ) => {
    setForm(f => ({ ...f, [key]: value }))
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!form.size || loading) return
    if (!hasKeys) { setErr('Add Binance API keys in Exchanges tab first'); return }
    if (!currentPrice) { setErr('Price not loaded yet'); return }

    const sizeNum = parseFloat(form.size)
    if (isNaN(sizeNum) || sizeNum <= 0) { setErr('Enter a valid size'); return }
    if (form.side === 'BUY' && sizeNum > usdtFree) {
      setErr(`Insufficient USDT (${usdtFree.toFixed(2)} available)`)
      return
    }

    setLoading(true); setErr(''); setOk('')

    try {
      const qty = (sizeNum / currentPrice).toFixed(6)

      const r = await apiPlaceOrder({
        symbol:   sym,
        side:     form.side,
        type:     form.type,
        quantity: qty,
        price:        form.limitPrice  || undefined,
        stopPrice:    form.stopPrice   || undefined,
        trailingDelta: form.trailingDelta || undefined,
        timeInForce: ['LIMIT','STOP_LOSS_LIMIT','TAKE_PROFIT_LIMIT'].includes(form.type)
          ? form.timeInForce
          : undefined,
      })

      if (r.error) { setErr(r.error); return }

      onOrderPlaced({
        sym, side: form.side, type: form.type, qty,
        price:     form.limitPrice ? parseFloat(form.limitPrice) : null,
        stopPrice: form.stopPrice  ? parseFloat(form.stopPrice)  : null,
      })

      const verb = form.side === 'BUY' ? t.buy : t.sell
      setOk(`✓ ${verb} ${base} order placed!`)
      setForm(f => ({ ...f, size: '', limitPrice: '', stopPrice: '', trailingDelta: '' }))
      setTimeout(() => setOk(''), 3500)
    } catch {
      setErr('Order failed. Check your API keys.')
    } finally {
      setLoading(false)
    }
  }, [form, loading, hasKeys, currentPrice, usdtFree, sym, base, t, onOrderPlaced])

  const needsLimit    = ['LIMIT', 'STOP_LOSS_LIMIT', 'TAKE_PROFIT_LIMIT'].includes(form.type)
  const needsStop     = ['STOP_LOSS_LIMIT', 'TAKE_PROFIT_LIMIT'].includes(form.type)
  const needsTrailing = form.type === 'TRAILING_STOP_MARKET'

  const btnBg = !form.size
    ? C.bg3
    : form.side === 'BUY'
    ? `linear-gradient(135deg,${C.green},#0a9e73)`
    : `linear-gradient(135deg,${C.red},#b8173d)`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Side toggle */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderRadius: 9, overflow: 'hidden', border: `1px solid ${C.border}` }}>
        {(['BUY', 'SELL'] as OrderSide[]).map(s => (
          <button key={s} onClick={() => setField('side', s)}
            style={{
              padding: '9px', fontSize: 12, fontWeight: 700, border: 'none',
              background: form.side === s ? (s === 'BUY' ? C.green : C.red) : C.bg2,
              color: form.side === s ? '#06080f' : C.t2,
              transition: 'all 0.15s',
            }}>
            {s === 'BUY' ? `▲ ${t.buy}` : `▼ ${t.sell}`}
          </button>
        ))}
      </div>

      {/* Order type tabs */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {ORDER_TYPES.map(({ key, label }) => (
          <button key={key} onClick={() => setField('type', key)}
            style={{
              padding: '4px 9px', fontSize: 9, fontWeight: 700, borderRadius: 6,
              border: `1px solid ${form.type === key ? C.goldB : C.border}`,
              background: form.type === key ? C.goldBg : 'transparent',
              color: form.type === key ? C.gold : C.t3,
              letterSpacing: '0.03em',
            }}>
            {label}
          </button>
        ))}
      </div>

      {/* Size (USDT) */}
      <div>
        <div style={{ color: C.t3, fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 5 }}>{t.size}</div>
        <input className="mono" type="number" placeholder="0.00" value={form.size}
          onChange={e => setField('size', e.target.value)}
          style={{ width: '100%', background: C.bg0, border: `1px solid ${C.border}`, borderRadius: 9, padding: '9px 12px', color: C.t1, fontSize: 13 }}
          onFocus={e => { e.target.style.borderColor = C.goldB }}
          onBlur={e => { e.target.style.borderColor = C.border }}
        />
        {currentPrice && form.size && (
          <div style={{ color: C.t3, fontSize: 10, marginTop: 3 }}>
            ≈ {(parseFloat(form.size) / currentPrice).toFixed(6)} {base}
          </div>
        )}
      </div>

      {/* Quick % */}
      <div style={{ display: 'flex', gap: 4 }}>
        {[25, 50, 75, 100].map(pct => (
          <button key={pct}
            onClick={() => setField('size', (usdtFree * pct / 100).toFixed(2))}
            style={{ flex: 1, padding: '5px 2px', fontSize: 9, fontWeight: 700, borderRadius: 6, border: `1px solid ${C.border}`, background: 'transparent', color: C.t3 }}>
            {pct}%
          </button>
        ))}
      </div>

      {/* Limit price */}
      {needsLimit && (
        <div>
          <div style={{ color: C.t3, fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 5 }}>{t.limitPrice}</div>
          <input className="mono" type="number" placeholder={currentPrice?.toFixed(2)} value={form.limitPrice}
            onChange={e => setField('limitPrice', e.target.value)}
            style={{ width: '100%', background: C.bg0, border: `1px solid ${C.border}`, borderRadius: 9, padding: '9px 12px', color: C.t1, fontSize: 13 }}
            onFocus={e => { e.target.style.borderColor = C.goldB }}
            onBlur={e => { e.target.style.borderColor = C.border }}
          />
        </div>
      )}

      {/* Stop price */}
      {needsStop && (
        <div>
          <div style={{ color: C.t3, fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 5 }}>{t.stopPrice}</div>
          <input className="mono" type="number" placeholder={currentPrice?.toFixed(2)} value={form.stopPrice}
            onChange={e => setField('stopPrice', e.target.value)}
            style={{ width: '100%', background: C.bg0, border: `1px solid ${C.border}`, borderRadius: 9, padding: '9px 12px', color: C.t1, fontSize: 13 }}
            onFocus={e => { e.target.style.borderColor = C.goldB }}
            onBlur={e => { e.target.style.borderColor = C.border }}
          />
        </div>
      )}

      {/* Trailing delta */}
      {needsTrailing && (
        <div>
          <div style={{ color: C.t3, fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 5 }}>{t.trailingDelta}</div>
          <input className="mono" type="number" placeholder="1.0" value={form.trailingDelta}
            onChange={e => setField('trailingDelta', e.target.value)}
            style={{ width: '100%', background: C.bg0, border: `1px solid ${C.border}`, borderRadius: 9, padding: '9px 12px', color: C.t1, fontSize: 13 }}
            onFocus={e => { e.target.style.borderColor = C.goldB }}
            onBlur={e => { e.target.style.borderColor = C.border }}
          />
          <div style={{ color: C.t3, fontSize: 10, marginTop: 3 }}>e.g. 1.0 = 1% trailing stop</div>
        </div>
      )}

      {/* Time In Force — only for limit-based orders */}
      {needsLimit && (
        <div>
          <div style={{ color: C.t3, fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 5 }}>{t.timeInForce}</div>
          <div style={{ display: 'flex', gap: 5 }}>
            {TIF_OPTIONS.map(tif => (
              <button key={tif} onClick={() => setField('timeInForce', tif)}
                style={{
                  flex: 1, padding: '5px', fontSize: 10, fontWeight: 700, borderRadius: 7,
                  border: `1px solid ${form.timeInForce === tif ? C.border : 'transparent'}`,
                  background: form.timeInForce === tif ? C.bg3 : 'transparent',
                  color: form.timeInForce === tif ? C.t1 : C.t3,
                }}>
                {tif}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Submit */}
      <button
        onClick={() => void handleSubmit()}
        disabled={!form.size || loading}
        style={{
          width: '100%', padding: '11px', fontSize: 13, fontWeight: 700,
          borderRadius: 10, border: 'none', background: btnBg,
          color: !form.size ? C.t3 : '#fff',
          transition: 'all 0.2s', display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: 8,
        }}>
        {loading
          ? <><div className="spin" style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }}/> Placing…</>
          : `${form.side === 'BUY' ? '▲ ' + t.buy : '▼ ' + t.sell} ${base}`}
      </button>

      {/* Available balance */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 6, borderTop: `1px solid ${C.border}` }}>
        <span style={{ color: C.t3, fontSize: 11 }}>{t.available}</span>
        <span className="mono" style={{ color: C.t1, fontSize: 12, fontWeight: 600 }}>
          ${usdtFree.toLocaleString(undefined, { maximumFractionDigits: 2 })} USDT
        </span>
      </div>

      {err && <div className="si" style={{ background: C.redDim, border: `1px solid ${C.redB}`, borderRadius: 8, padding: '7px 10px', color: C.red, fontSize: 11 }}>✕ {err}</div>}
      {ok  && <div className="si" style={{ background: C.greenDim, border: `1px solid ${C.greenB}`, borderRadius: 8, padding: '7px 10px', color: C.green, fontSize: 11 }}>{ok}</div>}
    </div>
  )
}

export const OrderPanel = memo(OrderPanelInner)
