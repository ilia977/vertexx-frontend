import { memo } from 'react'
import { C } from '@/utils/constants'
import type { Translations } from '@/utils/constants'
import type { User, WSStatus, Lang } from '@/types'

interface SettingsProps {
  user: User
  status: WSStatus
  lang: Lang
  onLang: (l: Lang) => void
  t: Translations
}

const LANGS: { code: Lang; label: string }[] = [
  { code: 'EN', label: 'English'      },
  { code: 'RU', label: 'Русский'      },
  { code: 'UA', label: 'Українська'   },
]

const statusColor = (s: WSStatus): string => ({
  live: C.green, connecting: C.gold, stale: C.red, error: C.red,
})[s]

function SettingsInner({ user, status, lang, onLang, t }: SettingsProps) {
  return (
    <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
      <h2 style={{ color: C.t1, fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 18 }}>
        {t.settings}
      </h2>

      <div style={{ maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>

          {/* Profile */}
          <div style={{ padding: '20px 22px', borderBottom: `1px solid ${C.border}` }}>
            <div style={{ color: C.t2, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>
              {t.profile}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 50, height: 50, borderRadius: 14, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20, fontWeight: 700 }}>
                {user.name[0].toUpperCase()}
              </div>
              <div>
                <div style={{ color: C.t1, fontSize: 16, fontWeight: 700 }}>{user.name}</div>
                <div style={{ color: C.t3, fontSize: 13 }}>{user.email}</div>
              </div>
            </div>
          </div>

          {/* Language */}
          <div style={{ padding: '20px 22px', borderBottom: `1px solid ${C.border}` }}>
            <div style={{ color: C.t2, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
              {t.language}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {LANGS.map(({ code, label }) => (
                <button key={code} onClick={() => onLang(code)}
                  style={{
                    background: lang === code ? C.goldBg : C.bg2,
                    border: `1px solid ${lang === code ? C.goldB : C.border}`,
                    borderRadius: 10, padding: '10px 20px',
                    color: lang === code ? C.gold : C.t2,
                    fontSize: 13, fontWeight: lang === code ? 700 : 400,
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Market data */}
          <div style={{ padding: '20px 22px', borderBottom: `1px solid ${C.border}` }}>
            <div style={{ color: C.t2, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
              Market Data
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: C.bg2, borderRadius: 10, padding: '14px 16px', border: `1px solid ${C.border}` }}>
              <div>
                <div style={{ color: C.t1, fontSize: 13, fontWeight: 600 }}>Binance WebSocket</div>
                <div style={{ color: C.t3, fontSize: 12 }}>wss://stream.binance.com:9443 · Real-time public streams</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor(status) }} className={status === 'live' ? 'pu' : undefined} />
                <span style={{ color: statusColor(status), fontSize: 10, fontWeight: 700 }}>{status}</span>
              </div>
            </div>
          </div>

          {/* Indicators info */}
          <div style={{ padding: '20px 22px', borderBottom: `1px solid ${C.border}` }}>
            <div style={{ color: C.t2, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
              {t.indicators}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                ['RSI(14)', 'Relative Strength Index — momentum oscillator, overbought/oversold levels'],
                ['MACD(12,26,9)', 'Moving Average Convergence Divergence — trend + momentum'],
                ['Price Levels', 'Click "─ Level" on chart toolbar to draw custom support/resistance lines'],
              ].map(([name, desc]) => (
                <div key={name} style={{ background: C.bg2, borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ color: C.purple, fontSize: 12, fontWeight: 700, marginBottom: 3 }}>{name}</div>
                  <div style={{ color: C.t3, fontSize: 11 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Order types */}
          <div style={{ padding: '20px 22px' }}>
            <div style={{ color: C.t2, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
              Order Types
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                ['Market',         'Execute immediately at current market price'],
                ['Limit',          'Execute only at specified price or better'],
                ['Stop Loss',      'Sell when price drops to stop level to limit losses'],
                ['Take Profit',    'Sell when price rises to target to lock in gains'],
                ['Trailing Stop',  'Stop price follows market by a % delta — locks in profits on the way up'],
              ].map(([name, desc]) => (
                <div key={name} style={{ background: C.bg2, borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ color: C.gold, fontSize: 12, fontWeight: 700, marginBottom: 3 }}>{name}</div>
                  <div style={{ color: C.t3, fontSize: 11 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const Settings = memo(SettingsInner)
