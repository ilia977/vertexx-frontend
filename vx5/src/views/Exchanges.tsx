import { useState, memo } from 'react'
import { C } from '@/utils/constants'
import type { Translations } from '@/utils/constants'
import { apiSaveKeys } from '@/utils/api'

interface ExchangesProps {
  hasKeys: boolean
  onKeysConnected: () => void
  onDisconnect: () => void
  t: Translations
}

function ExchangesInner({ hasKeys, onKeysConnected, onDisconnect, t }: ExchangesProps) {
  const [apiKey, setApiKey]   = useState('')
  const [secret, setSecret]   = useState('')
  const [agreed, setAgreed]   = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [showSec, setShowSec] = useState(false)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg]         = useState('')

  const handleSave = async () => {
    if (!apiKey.trim() || !secret.trim()) { setMsg('Please fill both fields'); return }
    if (!agreed) { setMsg('Please accept the risk disclaimer'); return }
    setLoading(true); setMsg('')
    try {
      const r = await apiSaveKeys(apiKey.trim(), secret.trim())
      if (r.success) {
        setMsg('✅ Keys saved and encrypted!')
        setApiKey(''); setSecret(''); setAgreed(false)
        onKeysConnected()
      } else {
        setMsg(r.error ?? 'Failed to save keys')
      }
    } catch {
      setMsg('Connection error. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
      <h2 style={{ color: C.t1, fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 6 }}>
        {t.connectExchange}
      </h2>
      <p style={{ color: C.t2, fontSize: 14, marginBottom: 24 }}>
        Your keys are encrypted with AES-256 on the server and never stored in the browser.
      </p>

      <div style={{ maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Binance card */}
        <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(243,186,47,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f3ba2f', fontSize: 16, fontWeight: 900 }}>
                BN
              </div>
              <div>
                <div style={{ color: C.t1, fontSize: 16, fontWeight: 700 }}>Binance</div>
                <div style={{ color: hasKeys ? C.green : C.t3, fontSize: 12, fontWeight: 600 }}>
                  {hasKeys ? `● ${t.connected}` : '○ Not connected'}
                </div>
              </div>
            </div>

            {hasKeys ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ background: C.greenDim, border: `1px solid ${C.greenB}`, borderRadius: 10, padding: '14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 20 }}>✅</span>
                  <div>
                    <div style={{ color: C.green, fontSize: 14, fontWeight: 700 }}>Binance Connected</div>
                    <div style={{ color: C.t2, fontSize: 12 }}>API keys encrypted and stored securely</div>
                  </div>
                </div>
                <button onClick={onDisconnect}
                  style={{ background: C.redDim, border: `1px solid ${C.redB}`, borderRadius: 10, padding: '10px', fontSize: 13, fontWeight: 700, color: C.red }}>
                  {t.disconnect}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* API Key field */}
                {([
                  { label: t.apiKey,    value: apiKey,  show: showKey, onShow: () => setShowKey(s => !s), onChange: setApiKey  },
                  { label: t.secretKey, value: secret,  show: showSec, onShow: () => setShowSec(s => !s), onChange: setSecret  },
                ] as const).map(({ label, value, show, onShow, onChange }) => (
                  <div key={label}>
                    <div style={{ color: C.t3, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 7 }}>{label}</div>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={show ? 'text' : 'password'}
                        placeholder="Enter your key…"
                        value={value}
                        onChange={e => onChange(e.target.value)}
                        style={{ width: '100%', background: C.bg0, border: `1px solid ${C.border}`, borderRadius: 9, padding: '11px 42px 11px 14px', color: C.t1, fontSize: 13 }}
                        onFocus={e => { e.target.style.borderColor = C.goldB }}
                        onBlur={e => { e.target.style.borderColor = C.border }}
                      />
                      <button onClick={onShow}
                        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: C.t3, padding: 0 }}>
                        {show ? '🙈' : '👁'}
                      </button>
                    </div>
                  </div>
                ))}

                {/* Warning box */}
                <div style={{ background: C.goldBg, border: `1px solid ${C.goldB}`, borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ color: C.gold, fontSize: 12, marginBottom: 10 }}>
                    ⚠️ {t.keysWarning}
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                      style={{ width: 15, height: 15, cursor: 'pointer' }} />
                    <span style={{ color: C.t2, fontSize: 12 }}>I understand and accept the risks</span>
                  </label>
                </div>

                {/* Steps guide */}
                <div style={{ background: C.bg2, borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ color: C.t2, fontSize: 11, fontWeight: 700, marginBottom: 8 }}>HOW TO GET YOUR KEYS</div>
                  {[
                    'Go to Binance → Profile → API Management',
                    'Create API → enable Read Info + Spot & Margin Trading',
                    'Disable Withdrawals for safety',
                    'Copy API Key and Secret Key here',
                  ].map((step, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                      <span style={{ color: C.gold, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                      <span style={{ color: C.t2, fontSize: 11 }}>{step}</span>
                    </div>
                  ))}
                </div>

                <button onClick={() => void handleSave()} disabled={loading}
                  style={{ background: `linear-gradient(135deg,${C.gold},${C.goldD})`, border: 'none', borderRadius: 11, padding: '13px', fontSize: 13, fontWeight: 700, color: '#06080f', opacity: loading ? 0.7 : 1 }}>
                  {loading ? '…' : t.saveKeys}
                </button>

                {msg && (
                  <div style={{ color: msg.includes('✅') ? C.green : C.red, fontSize: 12, textAlign: 'center', padding: '4px 0' }}>
                    {msg}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bybit — coming soon */}
          <div style={{ padding: '20px 24px', opacity: 0.4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(247,166,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f7a600', fontSize: 14, fontWeight: 900 }}>By</div>
              <div>
                <div style={{ color: C.t1, fontSize: 16, fontWeight: 700 }}>Bybit</div>
                <div style={{ color: C.t3, fontSize: 12 }}>Coming soon</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const Exchanges = memo(ExchangesInner)
