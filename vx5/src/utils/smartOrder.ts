import { MARKETS } from './constants'
import type { SmartOrder } from '@/types'

export function parseSmartOrder(text: string): SmartOrder | null {
  const t = text.toLowerCase()

  const side = t.includes('buy') || t.includes('купи') || t.includes('купити')
    ? 'BUY' as const
    : t.includes('sell') || t.includes('продай') || t.includes('продати')
    ? 'SELL' as const
    : null

  if (!side) return null

  const mkt = MARKETS.find(
    m => t.includes(m.base.toLowerCase()) || t.includes(m.sym.toLowerCase())
  )
  if (!mkt) return null

  const sizeMatch = t.match(/\$\s*([\d,]+(?:\.\d+)?)/)
  if (!sizeMatch) return null
  const sizeUSDT = parseFloat(sizeMatch[1].replace(',', ''))
  if (isNaN(sizeUSDT) || sizeUSDT <= 0) return null

  const trigMatch = t.match(
    /(?:if|when|якщо|коли|если)\s+price\s+(?:drops?|falls?|reaches?|hits?|до|to|is)\s+(?:\$\s*)?([\d,]+(?:\.\d+)?)/
  )
  const triggerPrice = trigMatch ? parseFloat(trigMatch[1].replace(',', '')) : undefined

  return {
    sym: mkt.sym,
    base: mkt.base,
    side,
    sizeUSDT,
    triggerPrice,
    type: triggerPrice !== undefined ? 'LIMIT' : 'MARKET',
    raw: text,
  }
}

export function formatSmartOrder(order: SmartOrder): string {
  const verb = order.side === 'BUY' ? 'Buy' : 'Sell'
  const base = `${verb} ${order.base} for $${order.sizeUSDT}`
  if (order.triggerPrice !== undefined) {
    return `${base} — limit order triggers when price reaches $${order.triggerPrice.toLocaleString()}`
  }
  return `${base} — market order, executes immediately`
}
