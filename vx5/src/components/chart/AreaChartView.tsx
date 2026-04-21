import { memo } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { C } from '@/utils/constants'
import type { Kline } from '@/types'

interface AreaChartViewProps {
  klines: Kline[]
}

interface TooltipPayload {
  value: number
  payload: { t: string }
}

function ChartTip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px' }}>
      <div className="mono" style={{ color: C.gold, fontSize: 13, fontWeight: 700 }}>
        ${payload[0].value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
      <div style={{ color: C.t2, fontSize: 11 }}>{payload[0].payload.t}</div>
    </div>
  )
}

function AreaChartViewInner({ klines }: AreaChartViewProps) {
  const data = klines.map(k => ({
    t: new Date(k.time * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    p: k.close,
    v: k.volume,
  }))

  if (data.length < 2) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: C.t3, gap: 10, fontSize: 13 }}>
        <div className="spin" style={{ width: 20, height: 20, border: `2px solid ${C.border}`, borderTopColor: C.gold, borderRadius: '50%' }} />
        Loading…
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={C.gold} stopOpacity={0.22} />
            <stop offset="95%" stopColor={C.gold} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="t" tick={{ fill: C.t3, fontSize: 10 }} tickLine={false} axisLine={false} interval={Math.floor(data.length / 8)} />
        <YAxis
          tick={{ fill: C.t3, fontSize: 10 }} tickLine={false} axisLine={false}
          tickFormatter={(v: number) => `$${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v.toFixed(2)}`}
          domain={['auto', 'auto']} width={60}
        />
        <Tooltip content={<ChartTip />} />
        <Area type="monotone" dataKey="p" stroke={C.gold} strokeWidth={2} fill="url(#areaGrad)" dot={false} activeDot={{ r: 4, fill: C.gold, strokeWidth: 0 }} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export default memo(AreaChartViewInner)
