import { memo } from 'react'
import { C } from '@/utils/constants'
import type { Translations } from '@/utils/constants'
import type { Order, AppView } from '@/types'
import { apiCancelOrder } from '@/utils/api'

interface OrdersProps {
  orders: Order[]
  onView: (v: AppView) => void
  onOrderCancelled: (id: string) => void
  t: Translations
}

function OrdersInner({ orders, onView, onOrderCancelled, t }: OrdersProps) {
  const handleCancel = async (o: Order) => {
    if (o.status !== 'pending') return
    try {
      await apiCancelOrder(o.sym, o.id)
      onOrderCancelled(o.id)
    } catch {
      // ignore — order may already be filled
    }
  }

  return (
    <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
      <h2 style={{ color: C.t1, fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 18 }}>
        {t.orderHistory}
      </h2>

      {orders.length === 0 ? (
        <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 16, padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
          <div style={{ color: C.t3, fontSize: 14, marginBottom: 16 }}>{t.noOrders}</div>
          <button onClick={() => onView('dashboard')}
            style={{ background: C.goldBg, border: `1px solid ${C.goldB}`, borderRadius: 9, padding: '8px 20px', color: C.gold, fontSize: 13, fontWeight: 700 }}>
            {t.startTrading}
          </button>
        </div>
      ) : (
        <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Time', 'Pair', 'Side', 'Type', 'Qty', 'Price', 'Stop', 'Status', ''].map(h => (
                  <th key={h} style={{ textAlign: 'left', color: C.t3, fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', padding: '14px 12px 10px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} style={{ borderTop: `1px solid ${C.border}` }}>
                  <td className="mono" style={{ padding: '12px', color: C.t3, fontSize: 11 }}>{o.ts}</td>
                  <td className="mono" style={{ padding: '12px', color: C.t1, fontSize: 12, fontWeight: 600 }}>{o.sym}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      background: o.side === 'BUY' ? C.greenDim : C.redDim,
                      border: `1px solid ${o.side === 'BUY' ? C.greenB : C.redB}`,
                      borderRadius: 6, padding: '3px 8px',
                      color: o.side === 'BUY' ? C.green : C.red,
                      fontSize: 10, fontWeight: 700,
                    }}>
                      {o.side}
                    </span>
                  </td>
                  <td className="mono" style={{ padding: '12px', color: C.t2, fontSize: 10 }}>{o.type}</td>
                  <td className="mono" style={{ padding: '12px', color: C.t1, fontSize: 12 }}>{o.qty}</td>
                  <td className="mono" style={{ padding: '12px', color: C.t2, fontSize: 12 }}>
                    {o.price ? `$${o.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '—'}
                  </td>
                  <td className="mono" style={{ padding: '12px', color: C.t2, fontSize: 12 }}>
                    {o.stopPrice ? `$${o.stopPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '—'}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      background: o.status === 'filled' ? C.greenDim : o.status === 'pending' ? C.goldBg : C.redDim,
                      borderRadius: 6, padding: '3px 8px',
                      color: o.status === 'filled' ? C.green : o.status === 'pending' ? C.gold : C.red,
                      fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                    }}>
                      {o.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {o.status === 'pending' && (
                      <button onClick={() => void handleCancel(o)}
                        style={{ background: C.redDim, border: `1px solid ${C.redB}`, borderRadius: 7, padding: '4px 10px', color: C.red, fontSize: 10, fontWeight: 700 }}>
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export const Orders = memo(OrdersInner)
