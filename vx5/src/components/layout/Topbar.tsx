import { memo } from 'react'
import { C } from '@/utils/constants'
import type { Lang } from '@/types'
import type { WSStatus, TickerData } from '@/types'

interface TopbarProps {
  mini: boolean
  onToggleMini: () => void
  sym: string
  metaIco: string
  metaColor: string
  ticker: TickerData | undefined
  flash: 'up' | 'down' | null
  status: WSStatus
  usdtBalance: number
  lang: Lang
  onLang: (l: Lang) => void
  userName: string
}

const LANGS: Lang[] = ['EN', 'RU', 'UA']

const statusColor = (s: WSStatus): string => ({
  live: C.green, connecting: C.gold, stale: C.red, error: C.red,
})[s]

export const Topbar = memo(function Topbar({
  mini, onToggleMini, metaIco, metaColor, ticker, flash,
  status, usdtBalance, lang, onLang, userName,
}: TopbarProps) {
  const price = ticker?.price
  const rawCh = ticker?.ch
  const ch    = rawCh !== undefined && !isNaN(rawCh) ? rawCh : 0

  return (
    <div style={{
      height: 56, background: C.bg1, borderBottom: `1px solid ${C.border}`,
      display: 'flex', alignItems: 'center', padding: '0 20px', gap: 12, flexShrink: 0,
    }}>
      {/* Hamburger */}
      <button onClick={onToggleMini} style={{ background: 'none', border: 'none', color: C.t2, display: 'flex', padding: 4, borderRadius: 6, fontSize: 16 }}>
        ☰
      </button>
      <div style={{ flex: 1 }} />

      {/* Price chip */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: C.bg2, borderRadius: 9, padding: '6px 14px', border: `1px solid ${C.border}`,
      }}>
        <span style={{ color: metaColor, fontSize: 13 }}>{metaIco}</span>
        <span
          className={`mono${flash === 'up' ? ' fu' : flash === 'down' ? ' fd' : ''}`}
          style={{ color: C.t1, fontSize: 13, fontWeight: 700 }}
        >
          {price
            ? `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : '—'}
        </span>
        <span style={{ color: ch >= 0 ? C.green : C.red, fontSize: 11, fontWeight: 700 }}>
          {ch >= 0 ? '+' : ''}{ch.toFixed(2)}%
        </span>
        {/* WS dot */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div
            style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor(status) }}
            className={status === 'live' ? 'pu' : undefined}
          />
          <span style={{ color: statusColor(status), fontSize: 10, fontWeight: 700 }}>
            {status === 'live' ? 'Live' : status === 'connecting' ? '…' : 'Stale'}
          </span>
        </div>
      </div>

      {/* Balance chip */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: C.bg2, borderRadius: 9, padding: '6px 14px', border: `1px solid ${C.border}`,
      }}>
        <span style={{ color: C.t3, fontSize: 11 }}>USDT</span>
        <span className="mono" style={{ color: C.gold, fontSize: 13, fontWeight: 700 }}>
          {usdtBalance > 0
            ? `$${usdtBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
            : '—'}
        </span>
      </div>

      {/* Language switcher */}
      {!mini && (
        <div style={{ display: 'flex', gap: 4 }}>
          {LANGS.map(l => (
            <button key={l} onClick={() => onLang(l)}
              style={{
                background: lang === l ? C.goldBg : 'transparent',
                border: `1px solid ${lang === l ? C.goldB : C.border}`,
                borderRadius: 7, padding: '3px 8px',
                color: lang === l ? C.gold : C.t3,
                fontSize: 10, fontWeight: 700,
              }}>
              {l}
            </button>
          ))}
        </div>
      )}

      {/* Avatar */}
      <div style={{
        width: 32, height: 32, borderRadius: 9,
        background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontSize: 12, fontWeight: 700, flexShrink: 0,
      }}>
        {userName[0].toUpperCase()}
      </div>
    </div>
  )
})
