import { memo, useMemo } from 'react'
import { C } from '@/utils/constants'
import type { OrderBookDepth, DepthLevel } from '@/types'

interface OrderBookProps {
  depth: OrderBookDepth
  currentPrice: number | undefined
}

// Each row is memoized to prevent re-render of all rows when only one changes
const DepthRow = memo(function DepthRow({
  item, side, maxQ,
}: { item: DepthLevel; side: 'bid' | 'ask'; maxQ: number }) {
  const pct = maxQ > 0 ? (item.qty / maxQ) * 100 : 0
  return (
    <div style={{ position: 'relative', padding: '2px 10px', marginBottom: 1 }}>
      <div style={{
        position: 'absolute',
        [side === 'ask' ? 'right' : 'left']: 0,
        top: 0, bottom: 0,
        width: `${pct}%`,
        background: side === 'ask' ? 'rgba(244,63,94,0.07)' : 'rgba(14,207,151,0.07)',
        borderRadius: 2,
      }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', position: 'relative' }}>
        <span className="mono" style={{
          color: side === 'ask' ? C.red : C.green,
          fontSize: 10.5,
        }}>
          {item.price.toLocaleString(undefined, {
            minimumFractionDigits: 2, maximumFractionDigits: 2,
          })}
        </span>
        <span className="mono" style={{ color: C.t2, fontSize: 10.5, textAlign: 'right' }}>
          {item.qty.toFixed(4)}
        </span>
      </div>
    </div>
  )
})

function OrderBookInner({ depth, currentPrice }: OrderBookProps) {
  const maxQ = useMemo(() => {
    const all = [...depth.bids, ...depth.asks].map(x => x.qty)
    return all.length ? Math.max(...all) : 1
  }, [depth])

  const spread = useMemo(() => {
    const ask = depth.asks[0]?.price ?? 0
    const bid = depth.bids[0]?.price ?? 0
    return ask - bid
  }, [depth])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        padding: '0 10px 8px', color: C.t3, fontSize: 9,
        fontWeight: 700, letterSpacing: '0.08em', flexShrink: 0,
      }}>
        <span>PRICE</span>
        <span style={{ textAlign: 'right' }}>QTY</span>
      </div>

      {/* Asks (reversed — highest at top) */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {[...depth.asks].reverse().map(a => (
          <DepthRow key={a.price} item={a} side="ask" maxQ={maxQ} />
        ))}
      </div>

      {/* Mid-price */}
      {currentPrice !== undefined && depth.asks.length > 0 && depth.bids.length > 0 && (
        <div style={{
          textAlign: 'center', padding: '6px',
          borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`,
          flexShrink: 0,
        }}>
          <span className="mono" style={{ color: C.gold, fontSize: 13, fontWeight: 700 }}>
            ${currentPrice.toLocaleString(undefined, {
              minimumFractionDigits: 2, maximumFractionDigits: 2,
            })}
          </span>
          <span style={{ color: C.t3, fontSize: 9, marginLeft: 8 }}>
            spread ${spread.toFixed(2)}
          </span>
        </div>
      )}

      {/* Bids */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {depth.bids.map(b => (
          <DepthRow key={b.price} item={b} side="bid" maxQ={maxQ} />
        ))}
      </div>
    </div>
  )
}

export const OrderBook = memo(OrderBookInner)
