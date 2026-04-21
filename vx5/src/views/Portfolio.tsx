import { memo, useMemo } from 'react'
import { C, MARKETS } from '@/utils/constants'
import type { Translations } from '@/utils/constants'
import type { Balance, AppView } from '@/types'

interface PortfolioProps {
  balances: Balance[]
  prices: Record<string, { price: number }>
  hasKeys: boolean
  onView: (v: AppView) => void
  onSymChange: (s: string) => void
  t: Translations
}

function PortfolioInner({ balances, prices, hasKeys, onView, onSymChange, t }: PortfolioProps) {
  const rows = useMemo(() => {
    return balances
      .filter(b => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0)
      .map(b => {
        const mkt   = MARKETS.find(m => m.base === b.asset)
        const price = mkt ? (prices[mkt.sym]?.price ?? 0) : (b.asset === 'USDT' ? 1 : 0)
        const free  = parseFloat(b.free)
        const locked = parseFloat(b.locked)
        return {
          asset:  b.asset,
          free,
          locked,
          price,
          value:  (free + locked) * price,
          color:  mkt?.color ?? '#26a17b',
          wsKey:  mkt?.sym ?? null,
        }
      })
      .sort((a, b) => b.value - a.value)
  }, [balances, prices])

  const totalValue = useMemo(() => rows.reduce((s, r) => s + r.value, 0), [rows])

  if (!hasKeys) {
    return (
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
        <h2 style={{ color: C.t1, fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 18 }}>{t.portfolio}</h2>
        <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 16, padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔗</div>
          <div style={{ color: C.t2, fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Connect your Binance account</div>
          <div style={{ color: C.t3, fontSize: 13, marginBottom: 20 }}>to see your real portfolio balances</div>
          <button onClick={() => onView('exchanges')}
            style={{ background: C.goldBg, border: `1px solid ${C.goldB}`, borderRadius: 10, padding: '10px 24px', color: C.gold, fontSize: 13, fontWeight: 700 }}>
            {t.connectExchange}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
      <h2 style={{ color: C.t1, fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 18 }}>{t.portfolio}</h2>

      {/* Summary */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
        <div style={{ flex: 1, background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ color: C.t3, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 7 }}>{t.totalBalance}</div>
          <div className="mono" style={{ color: C.t1, fontSize: 22, fontWeight: 700 }}>
            ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>
        <div style={{ flex: 1, background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ color: C.t3, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 7 }}>{t.holdings}</div>
          <div className="mono" style={{ color: C.t1, fontSize: 22, fontWeight: 700 }}>{rows.length} assets</div>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {[t.asset, t.amount, 'Price', t.value, ''].map(h => (
                <th key={h} style={{ textAlign: 'left', color: C.t3, fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', padding: '14px 18px 10px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.asset} style={{ borderTop: `1px solid ${C.border}` }}>
                <td style={{ padding: '14px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: r.color + '1a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: r.color, fontSize: 11, fontWeight: 800 }}>
                      {r.asset.slice(0, 2)}
                    </div>
                    <div>
                      <div style={{ color: C.t1, fontSize: 13, fontWeight: 600 }}>{r.asset}</div>
                      {r.locked > 0 && (
                        <div style={{ color: C.t3, fontSize: 10 }}>🔒 {r.locked.toFixed(4)} locked</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="mono" style={{ padding: '14px 18px', color: C.t2, fontSize: 12 }}>
                  {r.free.toFixed(r.asset === 'USDT' ? 2 : 6)}
                </td>
                <td className="mono" style={{ padding: '14px 18px', color: C.t2, fontSize: 12 }}>
                  {r.price > 0 ? `$${r.price.toLocaleString(undefined, { maximumFractionDigits: r.price > 1 ? 2 : 6 })}` : '—'}
                </td>
                <td className="mono" style={{ padding: '14px 18px', color: C.t1, fontSize: 13, fontWeight: 600 }}>
                  ${r.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </td>
                <td style={{ padding: '14px 18px' }}>
                  {r.wsKey && (
                    <button onClick={() => { onSymChange(r.wsKey!); onView('dashboard') }}
                      style={{ background: C.greenDim, border: `1px solid ${C.greenB}`, borderRadius: 8, padding: '6px 14px', color: C.green, fontSize: 11, fontWeight: 700 }}>
                      Trade
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export const Portfolio = memo(PortfolioInner)
