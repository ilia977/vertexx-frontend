import { memo } from 'react'
import { C } from '@/utils/constants'
import type { Translations } from '@/utils/constants'
import type { IndicatorType } from '@/types'

export const INTERVALS = ['1m', '3m', '5m', '15m', '30m', '1h', '4h', '1d'] as const
export type Interval = typeof INTERVALS[number]

interface ChartToolbarProps {
  interval: Interval
  indicator: IndicatorType
  chartMode: 'candles' | 'area'
  onInterval: (i: Interval) => void
  onIndicator: (i: IndicatorType) => void
  onChartMode: (m: 'candles' | 'area') => void
  t: Translations
}

export const ChartToolbar = memo(function ChartToolbar({
  interval, indicator, chartMode, onInterval, onIndicator, onChartMode, t,
}: ChartToolbarProps) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '8px 14px', borderBottom: `1px solid ${C.border}`,
      flexShrink: 0, flexWrap: 'wrap', background: C.bg1,
    }}>
      {/* Chart mode switcher */}
      <div style={{ display: 'flex', background: C.bg0, borderRadius: 8, border: `1px solid ${C.border}`, overflow: 'hidden', flexShrink: 0 }}>
        {(['candles', 'area'] as const).map(mode => (
          <button key={mode} onClick={() => onChartMode(mode)}
            style={{
              padding: '4px 10px', fontSize: 10, fontWeight: 700, border: 'none',
              background: chartMode === mode ? C.goldBg : 'transparent',
              color: chartMode === mode ? C.gold : C.t3,
              transition: 'all 0.15s',
            }}>
            {mode === 'candles' ? '🕯 Candles' : '📈 Area'}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 16, background: C.border }} />

      {/* Intervals */}
      <div style={{ display: 'flex', gap: 2 }}>
        {INTERVALS.map(iv => (
          <button key={iv} onClick={() => onInterval(iv)}
            style={{
              padding: '3px 7px', fontSize: 10, fontWeight: 700, borderRadius: 5,
              border: `1px solid ${interval === iv ? C.goldB : 'transparent'}`,
              background: interval === iv ? C.goldBg : 'transparent',
              color: interval === iv ? C.gold : C.t3,
            }}>
            {iv}
          </button>
        ))}
      </div>

      <div style={{ flex: 1 }} />

      {/* Indicators — only for candle mode */}
      {chartMode === 'candles' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ color: C.t3, fontSize: 10, fontWeight: 700 }}>{t.indicators}:</span>
          {(['NONE', 'RSI', 'MACD'] as IndicatorType[]).map(ind => (
            <button key={ind} onClick={() => onIndicator(ind)}
              style={{
                padding: '3px 8px', fontSize: 10, fontWeight: 700, borderRadius: 6,
                border: `1px solid ${indicator === ind ? C.purpleB : 'transparent'}`,
                background: indicator === ind ? C.purpleDim : 'transparent',
                color: indicator === ind ? C.purple : C.t3,
              }}>
              {ind === 'NONE' ? t.none : ind}
            </button>
          ))}
        </div>
      )}
    </div>
  )
})
