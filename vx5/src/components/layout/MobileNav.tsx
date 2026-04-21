import { memo } from 'react'
import { C } from '@/utils/constants'
import type { AppView } from '@/types'

interface MobileNavProps {
  view: AppView
  onView: (v: AppView) => void
}

const TABS: { id: AppView; icon: string; label: string }[] = [
  { id: 'dashboard', icon: '📊', label: 'Trade'     },
  { id: 'portfolio', icon: '💼', label: 'Portfolio' },
  { id: 'orders',    icon: '📋', label: 'Orders'    },
  { id: 'exchanges', icon: '🔗', label: 'Exchange'  },
  { id: 'settings',  icon: '⚙️', label: 'Settings'  },
]

export const MobileNav = memo(function MobileNav({ view, onView }: MobileNavProps) {
  return (
    <div
      className="safe-bottom"
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: C.bg1, borderTop: `1px solid ${C.border}`,
        display: 'flex', zIndex: 100,
      }}
    >
      {TABS.map(({ id, icon, label }) => {
        const active = view === id
        return (
          <button
            key={id}
            onClick={() => onView(id)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 3, padding: '10px 4px',
              background: 'none', border: 'none',
              color: active ? C.gold : C.t3,
              fontSize: 9, fontWeight: active ? 700 : 400,
              transition: 'color 0.15s',
            }}
          >
            <span style={{ fontSize: 18 }}>{icon}</span>
            <span>{label}</span>
            {active && (
              <div style={{
                position: 'absolute', top: 0,
                width: 24, height: 2,
                background: C.gold, borderRadius: 1,
              }} />
            )}
          </button>
        )
      })}
    </div>
  )
})
