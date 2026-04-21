import { memo, useState } from 'react'
import { C } from '@/utils/constants'
import type { AppView, User } from '@/types'

interface SidebarProps {
  view: AppView
  user: User
  mini: boolean
  hasKeys: boolean
  onView: (v: AppView) => void
  onLogout: () => void
  onToggle: () => void
}

const NAV: { id: AppView; icon: string }[] = [
  { id: 'dashboard', icon: '📊' },
  { id: 'exchanges', icon: '🔗' },
  { id: 'portfolio', icon: '💼' },
  { id: 'orders',    icon: '📋' },
  { id: 'settings',  icon: '⚙️' },
]

interface NavItemProps {
  id: AppView
  icon: string
  label: string
  active: boolean
  mini: boolean
  onClick: () => void
}

const NavItem = memo(function NavItem({ id: _id, icon, label, active, mini, onClick }: NavItemProps) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      title={mini ? label : undefined}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: mini ? '12px 0' : '10px 12px',
        justifyContent: mini ? 'center' : 'flex-start',
        borderRadius: 10, cursor: 'pointer', marginBottom: 2,
        background: active ? C.goldBg : hov ? C.bg3 : 'transparent',
        color: active ? C.gold : hov ? C.t1 : C.t2,
        fontWeight: active ? 600 : 400, fontSize: 14,
        transition: 'all 0.15s',
      }}
    >
      <span style={{ flexShrink: 0 }}>{icon}</span>
      {!mini && <span style={{ whiteSpace: 'nowrap' }}>{label}</span>}
      {active && !mini && (
        <div style={{ marginLeft: 'auto', width: 5, height: 5, borderRadius: '50%', background: C.gold }} />
      )}
    </div>
  )
})

export const Sidebar = memo(function Sidebar({
  view, user, mini, hasKeys, onView, onLogout,
}: SidebarProps) {
  // We need translations to show labels, but Sidebar receives them from parent
  // Labels map — hardcoded English, parent passes t for other langs
  const LABELS: Record<AppView, string> = {
    dashboard: 'Dashboard',
    exchanges: 'Exchanges',
    portfolio: 'Portfolio',
    orders:    'Orders',
    settings:  'Settings',
  }

  const SW = mini ? 60 : 218

  return (
    <div style={{
      width: SW, flexShrink: 0,
      background: C.bg1, borderRight: `1px solid ${C.border}`,
      display: 'flex', flexDirection: 'column',
      padding: '18px 10px',
      transition: 'width 0.22s ease', overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 28, padding: '0 4px' }}>
        <div style={{
          width: 33, height: 33, flexShrink: 0,
          borderRadius: 9, background: `linear-gradient(135deg,${C.gold},${C.goldD})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ color: '#06080f', fontSize: 14, fontWeight: 900 }}>V</span>
        </div>
        {!mini && (
          <span style={{ color: C.t1, fontSize: 16, fontWeight: 800, whiteSpace: 'nowrap' }}>
            Vertex<span style={{ color: C.gold }}>X</span>
          </span>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1 }}>
        {NAV.map(({ id, icon }) => (
          <NavItem
            key={id} id={id} icon={icon}
            label={LABELS[id]}
            active={view === id} mini={mini}
            onClick={() => onView(id)}
          />
        ))}
      </nav>

      {/* Status badge */}
      {!mini && (
        <div style={{
          background: hasKeys ? C.greenDim : C.purpleDim,
          border: `1px solid ${hasKeys ? C.greenB : C.purpleB}`,
          borderRadius: 10, padding: '10px 12px', marginBottom: 12,
        }}>
          <div style={{ color: hasKeys ? C.green : C.purple, fontSize: 11, fontWeight: 700 }}>
            {hasKeys ? '⚡ Live Trading' : '🔗 Connect Exchange'}
          </div>
          <div style={{ color: C.t3, fontSize: 10 }}>
            {hasKeys ? 'Binance connected' : 'Add API keys to trade'}
          </div>
        </div>
      )}

      {/* User row */}
      <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
        {!mini ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 33, height: 33, borderRadius: 9,
              background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0,
            }}>
              {user.name[0].toUpperCase()}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ color: C.t1, fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.name}
              </div>
              <div style={{ color: C.t3, fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.email}
              </div>
            </div>
            <button onClick={onLogout} style={{ background: 'none', border: 'none', color: C.t3, padding: 4, borderRadius: 6 }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = C.red }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = C.t3 }}>
              →
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button onClick={onLogout} style={{ background: 'none', border: 'none', color: C.t3, padding: '6px 0' }}>→</button>
          </div>
        )}
      </div>
    </div>
  )
})
