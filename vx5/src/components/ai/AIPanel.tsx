import { useState, useRef, useEffect, memo, useCallback } from 'react'
import { C } from '@/utils/constants'
import type { Translations } from '@/utils/constants'
import type { ChatMessage, SmartOrder, OrderSide, OrderType, Balance } from '@/types'
import { parseSmartOrder, formatSmartOrder } from '@/utils/smartOrder'
import { apiPlaceOrder } from '@/utils/api'

interface AIPanelProps {
  msgs: ChatMessage[]
  loading: boolean
  pendingOrder: SmartOrder | null
  t: Translations
  currentSym: string
  currentPrice: number | undefined
  change24h: number
  balances: Balance[]
  hasKeys: boolean
  onSend: (text: string) => Promise<void>
  onConfirm: (order: SmartOrder) => void
  onCancel: () => void
  onOrderPlaced: (info: { sym: string; side: OrderSide; type: OrderType; qty: string; price: number | null; stopPrice: number | null }) => void
}

const QUICK_PROMPTS = [
  'What is the market sentiment for BTC?',
  'Buy BTC for $100 if price drops to 60000',
  'Sell ETH for $50 at market price',
  'Analyze current portfolio risk',
]

function AIPanelInner({
  msgs, loading, pendingOrder, t,
  currentSym: _cs, currentPrice, change24h,
  balances, hasKeys,
  onSend, onConfirm, onCancel, onOrderPlaced,
}: AIPanelProps) {
  const [input, setInput] = useState('')
  const endRef = useRef<HTMLDivElement>(null)
  const [confirmLoading, setConfirmLoading] = useState(false)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs, pendingOrder])

  const handleSend = useCallback(() => {
    const txt = input.trim()
    if (!txt || loading) return
    setInput('')
    void onSend(txt)
  }, [input, loading, onSend])

  const handleConfirm = useCallback(async (order: SmartOrder) => {
    if (!hasKeys) {
      onCancel()
      return
    }
    setConfirmLoading(true)
    try {
      const price = currentPrice ?? 0
      if (price === 0) return
      const qty = (order.sizeUSDT / price).toFixed(6)

      const r = await apiPlaceOrder({
        symbol:   order.sym,
        side:     order.side,
        type:     order.type,
        quantity: qty,
        price:    order.triggerPrice?.toString(),
      })

      if (!r.error) {
        onOrderPlaced({
          sym: order.sym,
          side: order.side,
          type: order.type,
          qty,
          price: order.triggerPrice ?? null,
          stopPrice: null,
        })
        onConfirm(order)
      }
    } catch {
      // confirm anyway — show feedback via parent
      onConfirm(order)
    } finally {
      setConfirmLoading(false)
    }
  }, [hasKeys, currentPrice, onOrderPlaced, onConfirm, onCancel])

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>

      {/* Quick prompts */}
      <div style={{
        padding: '8px 14px', borderBottom: `1px solid ${C.border}`,
        display: 'flex', gap: 5, flexWrap: 'wrap', flexShrink: 0,
      }}>
        {QUICK_PROMPTS.map(q => (
          <button key={q} onClick={() => setInput(q)}
            style={{
              background: C.bg2, border: `1px solid ${C.border}`,
              borderRadius: 20, padding: '3px 10px',
              color: C.t2, fontSize: 10, fontWeight: 600,
            }}>
            {q.length > 34 ? q.slice(0, 34) + '…' : q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '14px 16px',
        display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0,
      }}>
        {msgs.map((m, i) => (
          <div key={i} className="si" style={{
            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '82%',
            background: m.role === 'user' ? C.goldBg : C.bg2,
            border: `1px solid ${m.role === 'user' ? C.goldB : C.border}`,
            borderRadius: 12, padding: '10px 14px',
            color: m.role === 'user' ? C.gold : C.t1,
            fontSize: 13, lineHeight: 1.6,
          }}>
            {m.content}
          </div>
        ))}

        {/* Thinking spinner */}
        {loading && (
          <div style={{
            alignSelf: 'flex-start', background: C.bg2,
            border: `1px solid ${C.border}`, borderRadius: 12,
            padding: '10px 14px', display: 'flex', gap: 8, alignItems: 'center',
          }}>
            <div className="spin" style={{ width: 12, height: 12, border: `2px solid ${C.border}`, borderTopColor: C.purple, borderRadius: '50%' }} />
            <span style={{ color: C.t3, fontSize: 12 }}>Thinking…</span>
          </div>
        )}

        {/* Smart Order confirmation card */}
        {pendingOrder && (
          <div className="si" style={{
            alignSelf: 'flex-start', width: '100%', maxWidth: 360,
            background: C.bg2, border: `1px solid ${C.gold}`,
            borderRadius: 14, padding: '14px 16px',
          }}>
            <div style={{
              color: C.gold, fontSize: 11, fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10,
            }}>
              ⚡ Smart Order — {t.confirmOrder}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 14px', marginBottom: 10 }}>
              {([
                ['Action',  pendingOrder.side],
                ['Asset',   pendingOrder.base],
                ['Size',    `$${pendingOrder.sizeUSDT}`],
                ['Type',    pendingOrder.type],
                pendingOrder.triggerPrice !== undefined
                  ? ['Trigger', `$${pendingOrder.triggerPrice.toLocaleString()}`]
                  : ['Execute', 'Market Price'],
              ] as [string, string][]).map(([label, val]) => (
                <div key={label}>
                  <div style={{ color: C.t3, fontSize: 10, fontWeight: 700, marginBottom: 2 }}>{label}</div>
                  <div className="mono" style={{ color: C.t1, fontSize: 12, fontWeight: 600 }}>{val}</div>
                </div>
              ))}
            </div>

            <div style={{ color: C.t2, fontSize: 11, marginBottom: 12 }}>
              {formatSmartOrder(pendingOrder)}
            </div>

            {!hasKeys && (
              <div style={{ color: C.red, fontSize: 11, marginBottom: 8 }}>
                ⚠ Add Binance API keys in Exchanges tab first
              </div>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => void handleConfirm(pendingOrder)}
                disabled={confirmLoading || !hasKeys}
                style={{
                  flex: 1, padding: '8px', borderRadius: 9, border: 'none',
                  background: pendingOrder.side === 'BUY' ? C.green : C.red,
                  color: '#06080f', fontSize: 12, fontWeight: 700,
                  opacity: confirmLoading || !hasKeys ? 0.6 : 1,
                }}>
                {confirmLoading ? '…' : `✓ ${pendingOrder.side === 'BUY' ? t.buy : t.sell}`}
              </button>
              <button onClick={onCancel}
                style={{
                  flex: 1, padding: '8px', borderRadius: 9,
                  border: `1px solid ${C.border}`, background: 'transparent',
                  color: C.t2, fontSize: 12, fontWeight: 700,
                }}>
                ✕ {t.cancel}
              </button>
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '10px 14px', borderTop: `1px solid ${C.border}`,
        display: 'flex', gap: 8, flexShrink: 0,
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSend() }}
          placeholder={t.askAnything}
          style={{
            flex: 1, background: C.bg0, border: `1px solid ${C.border}`,
            borderRadius: 9, padding: '9px 13px', color: C.t1, fontSize: 12,
          }}
          onFocus={e => { e.target.style.borderColor = C.purpleB }}
          onBlur={e => { e.target.style.borderColor = C.border }}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          style={{
            background: loading || !input.trim() ? C.bg3 : C.purple,
            border: 'none', borderRadius: 9, padding: '9px 16px',
            color: '#fff', fontSize: 13, fontWeight: 700,
            opacity: loading || !input.trim() ? 0.5 : 1,
          }}>
          →
        </button>
      </div>
    </div>
  )
}

export const AIPanel = memo(AIPanelInner)

// ─── AI hook — lives outside component to avoid re-creation ──────────────────
export function useAI(sym: string, price: number | undefined, ch: number) {
  const [msgs, setMsgs] = useState<ChatMessage[]>([{
    role: 'assistant',
    content: '👋 Hi! I\'m your VertexX AI assistant. Ask me about crypto markets or say "Buy BTC for $100 if price drops to 60000" and I\'ll set up the order for you.',
  }])
  const [loading, setLoading] = useState(false)
  const [pendingOrder, setPendingOrder] = useState<SmartOrder | null>(null)

  const send = useCallback(async (text: string) => {
    setMsgs(p => [...p, { role: 'user', content: text }])
    setLoading(true)

    const localParsed = parseSmartOrder(text)

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 400,
          system: `You are a professional crypto trading AI for VertexX platform. Be concise (under 120 words). Context: symbol=${sym}, price=$${price ?? 'unknown'}, 24h change=${ch.toFixed(2)}%. If user asks to trade, confirm clearly what order you will place.`,
          messages: [{ role: 'user', content: text }],
        }),
      })

      const data = await res.json() as { content?: Array<{ text: string }> }
      const reply = data.content?.[0]?.text ?? 'Sorry, I could not process that.'

      setMsgs(p => [...p, { role: 'assistant', content: reply }])
      if (localParsed) setPendingOrder(localParsed)
    } catch {
      if (localParsed) {
        setPendingOrder(localParsed)
        setMsgs(p => [...p, {
          role: 'assistant',
          content: `I detected a trade command: ${formatSmartOrder(localParsed)}. Confirm below to execute.`,
        }])
      } else {
        setMsgs(p => [...p, { role: 'assistant', content: 'Connection error. Please try again.' }])
      }
    } finally {
      setLoading(false)
    }
  }, [sym, price, ch])

  const confirm = useCallback((order: SmartOrder) => {
    setMsgs(p => [...p, {
      role: 'assistant',
      content: `✅ ${formatSmartOrder(order)}`,
    }])
    setPendingOrder(null)
  }, [])

  const cancel = useCallback(() => {
    setMsgs(p => [...p, { role: 'assistant', content: '❌ Order cancelled.' }])
    setPendingOrder(null)
  }, [])

  return { msgs, loading, pendingOrder, send, confirm, cancel }
}
