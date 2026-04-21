import { useState, memo } from 'react'
import { C, MARKETS, T } from '@/utils/constants'
import type { User, Lang, AuthMode } from '@/types'
import { apiLogin, apiRegister } from '@/utils/api'

interface AuthScreenProps {
  prices: Record<string, { price: number; ch: number }>
  status: string
  lang: Lang
  onLang: (l: Lang) => void
  onLogin: (user: User) => void
}

const LANGS: Lang[] = ['EN', 'RU', 'UA']

function AuthScreenInner({ prices, lang, onLang, onLogin }: AuthScreenProps) {
  const [mode, setMode]     = useState<AuthMode>('signin')
  const [email, setEmail]   = useState('')
  const [pw, setPw]         = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [err, setErr]         = useState('')

  const t = T[lang]

  const handleSubmit = async () => {
    if (!email.trim() || !pw.trim()) { setErr('Please fill all fields'); return }
    setLoading(true); setErr('')
    try {
      const fn   = mode === 'signin' ? apiLogin : apiRegister
      const data = await fn(email.trim(), pw)
      if (data.error) { setErr(data.error); return }
      if (!data.token || !data.user) { setErr('Invalid server response'); return }
      localStorage.setItem('vx_token', data.token)
      onLogin({
        name:  data.user.email.split('@')[0],
        email: data.user.email,
      })
    } catch {
      setErr('Connection error. Is the backend running on port 4000?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg0, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>

      {/* Grid background */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(59,130,246,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.02) 1px,transparent 1px)`, backgroundSize: '44px 44px' }} />
      <div style={{ position: 'absolute', top: '8%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 300, background: 'radial-gradient(ellipse,rgba(240,180,41,0.07) 0%,transparent 70%)', pointerEvents: 'none' }} />

      {/* Top bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: `linear-gradient(135deg,${C.gold},${C.goldD})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#06080f', fontSize: 15, fontWeight: 900 }}>V</span>
          </div>
          <span style={{ color: C.t1, fontSize: 18, fontWeight: 800 }}>
            Vertex<span style={{ color: C.gold }}>X</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {LANGS.map(l => (
            <button key={l} onClick={() => onLang(l)}
              style={{ background: lang === l ? C.goldBg : 'transparent', border: `1px solid ${lang === l ? C.goldB : C.border}`, borderRadius: 8, padding: '4px 10px', color: lang === l ? C.gold : C.t2, fontSize: 12, fontWeight: 600 }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Auth card */}
      <div className="fi" style={{ width: 420, background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 22, padding: '40px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{ color: C.t1, fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8 }}>
            {mode === 'signin' ? t.welcome : t.createAccount}
          </h1>
          <p style={{ color: C.t2, fontSize: 14 }}>{t.tagline}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
          {/* Email */}
          <div>
            <div style={{ color: C.t3, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 7 }}>{t.email}</div>
            <input type="email" placeholder="email@example.com" value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') void handleSubmit() }}
              style={{ width: '100%', background: C.bg0, border: `1px solid ${C.border}`, borderRadius: 9, padding: '11px 14px', color: C.t1, fontSize: 13 }}
              onFocus={e => { e.target.style.borderColor = C.goldB }}
              onBlur={e => { e.target.style.borderColor = C.border }}
            />
          </div>

          {/* Password */}
          <div>
            <div style={{ color: C.t3, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 7 }}>{t.password}</div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={pw}
                onChange={e => setPw(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') void handleSubmit() }}
                style={{ width: '100%', background: C.bg0, border: `1px solid ${C.border}`, borderRadius: 9, padding: '11px 42px 11px 14px', color: C.t1, fontSize: 13 }}
                onFocus={e => { e.target.style.borderColor = C.goldB }}
                onBlur={e => { e.target.style.borderColor = C.border }}
              />
              <button onClick={() => setShowPw(s => !s)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: C.t3, padding: 0, display: 'flex' }}>
                {showPw ? '🙈' : '👁'}
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {err && (
          <div style={{ background: C.redDim, border: `1px solid ${C.redB}`, borderRadius: 9, padding: '8px 12px', color: C.red, fontSize: 12, marginBottom: 14 }}>
            {err}
          </div>
        )}

        {/* Submit */}
        <button onClick={() => void handleSubmit()} disabled={loading}
          style={{ width: '100%', background: `linear-gradient(135deg,${C.gold},${C.goldD})`, border: 'none', borderRadius: 13, padding: '14px', fontSize: 15, fontWeight: 700, color: '#06080f', boxShadow: '0 6px 28px rgba(240,180,41,0.2)', opacity: loading ? 0.7 : 1 }}>
          {loading ? '…' : mode === 'signin' ? t.signIn : t.signUp}
        </button>

        <div style={{ textAlign: 'center', marginTop: 18 }}>
          <span style={{ color: C.t3, fontSize: 13 }}>{mode === 'signin' ? t.noAccount : t.haveAccount} </span>
          <button onClick={() => { setMode(m => m === 'signin' ? 'signup' : 'signin'); setErr('') }}
            style={{ background: 'none', border: 'none', color: C.gold, fontSize: 13, fontWeight: 700 }}>
            {mode === 'signin' ? t.signUp : t.signIn}
          </button>
        </div>

        {/* Live ticker preview */}
        <div style={{ marginTop: 28, paddingTop: 20, borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-around' }}>
          {MARKETS.slice(0, 3).map(m => {
            const d = prices[m.sym]
            return (
              <div key={m.sym} style={{ textAlign: 'center' }}>
                <div style={{ color: m.color, fontSize: 15, marginBottom: 2 }}>{m.ico}</div>
                <div className="mono" style={{ color: C.t1, fontSize: 12, fontWeight: 600 }}>
                  {d ? `$${d.price > 1000 ? (d.price / 1000).toFixed(1) + 'k' : d.price.toFixed(4)}` : '—'}
                </div>
                <div style={{ color: d && d.ch >= 0 ? C.green : C.red, fontSize: 10, fontWeight: 700 }}>
                  {d ? `${d.ch >= 0 ? '+' : ''}${d.ch.toFixed(2)}%` : '…'}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export const AuthScreen = memo(AuthScreenInner)
