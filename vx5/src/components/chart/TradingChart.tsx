import { useEffect, useRef, memo, useState, lazy, Suspense } from 'react'
import {
  createChart,
  ColorType,
  CrosshairMode,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type Time,
  type HistogramData,
  type LineData,
} from 'lightweight-charts'
import { C } from '@/utils/constants'
import { calcRSI, calcMACD } from '@/utils/indicators'
import type { Kline, IndicatorType } from '@/types'

// Lazy load recharts for Area chart mode
const AreaChartView = lazy(() => import('./AreaChartView'))

interface TradingChartProps {
  klines: Kline[]
  sym: string
  indicator: IndicatorType
  chartMode: 'candles' | 'area'
}

function CandleChart({ klines, sym, indicator }: Omit<TradingChartProps, 'chartMode'>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef     = useRef<IChartApi | null>(null)
  const candleRef    = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const volRef       = useRef<ISeriesApi<'Histogram'> | null>(null)
  const rsiRef       = useRef<ISeriesApi<'Line'> | null>(null)
  const macdRef      = useRef<ISeriesApi<'Line'> | null>(null)
  const signalRef    = useRef<ISeriesApi<'Line'> | null>(null)
  const histRef      = useRef<ISeriesApi<'Histogram'> | null>(null)
  const levelLines   = useRef<ISeriesApi<'Line'>[]>([])
  const [isDrawing, setIsDrawing] = useState(false)

  // Create chart
  useEffect(() => {
    if (!containerRef.current) return
    const chart = createChart(containerRef.current, {
      layout: { background: { type: ColorType.Solid, color: C.bg1 }, textColor: C.t2 },
      grid: { vertLines: { color: 'rgba(255,255,255,0.03)' }, horzLines: { color: 'rgba(255,255,255,0.03)' } },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: C.border },
      timeScale: { borderColor: C.border, timeVisible: true, secondsVisible: false },
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
    })
    chartRef.current = chart

    const candles = chart.addCandlestickSeries({
      upColor: C.green, downColor: C.red,
      borderUpColor: C.green, borderDownColor: C.red,
      wickUpColor: C.green, wickDownColor: C.red,
    })
    candleRef.current = candles

    const vol = chart.addHistogramSeries({ priceScaleId: 'vol' })
    chart.priceScale('vol').applyOptions({ scaleMargins: { top: 0.85, bottom: 0 } })
    volRef.current = vol

    const ro = new ResizeObserver(() => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        })
      }
    })
    ro.observe(containerRef.current)

    return () => {
      ro.disconnect()
      chart.remove()
      chartRef.current = null; candleRef.current = null; volRef.current = null
      rsiRef.current = null; macdRef.current = null; signalRef.current = null; histRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update candles + volume
  useEffect(() => {
    if (!candleRef.current || !volRef.current || klines.length < 2) return
    const candleData: CandlestickData<Time>[] = klines.map(k => ({
      time: k.time as Time, open: k.open, high: k.high, low: k.low, close: k.close,
    }))
    const volData: HistogramData<Time>[] = klines.map(k => ({
      time: k.time as Time, value: k.volume,
      color: k.close >= k.open ? 'rgba(14,207,151,0.4)' : 'rgba(244,63,94,0.4)',
    }))
    try {
      candleRef.current.setData(candleData)
      volRef.current.setData(volData)
      chartRef.current?.timeScale().fitContent()
    } catch (_) { /* ignore */ }
  }, [klines, sym])

  // RSI
  useEffect(() => {
    if (!chartRef.current) return
    if (rsiRef.current) { try { chartRef.current.removeSeries(rsiRef.current) } catch (_) {} ; rsiRef.current = null }
    if (indicator !== 'RSI' || klines.length < 20) return
    const s = chartRef.current.addLineSeries({ color: C.purple, lineWidth: 1, priceScaleId: 'rsi', title: 'RSI(14)' })
    chartRef.current.priceScale('rsi').applyOptions({ scaleMargins: { top: 0.1, bottom: 0.1 } })
    rsiRef.current = s
    const data: LineData<Time>[] = calcRSI(klines, 14).map(p => ({ time: p.time as Time, value: p.value }))
    try { s.setData(data) } catch (_) {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indicator, klines])

  // MACD
  useEffect(() => {
    if (!chartRef.current) return
    for (const s of [macdRef.current, signalRef.current, histRef.current]) {
      if (s) try { chartRef.current.removeSeries(s) } catch (_) {}
    }
    macdRef.current = null; signalRef.current = null; histRef.current = null
    if (indicator !== 'MACD' || klines.length < 40) return
    const macdData = calcMACD(klines)
    if (!macdData.length) return
    const ms = chartRef.current.addLineSeries({ color: C.blue, lineWidth: 1, priceScaleId: 'macd', title: 'MACD' })
    const ss = chartRef.current.addLineSeries({ color: C.gold, lineWidth: 1, priceScaleId: 'macd', title: 'Signal' })
    const hs = chartRef.current.addHistogramSeries({ priceScaleId: 'macd' })
    chartRef.current.priceScale('macd').applyOptions({ scaleMargins: { top: 0.1, bottom: 0.1 } })
    macdRef.current = ms; signalRef.current = ss; histRef.current = hs
    try {
      ms.setData(macdData.map(p => ({ time: p.time as Time, value: p.macd })))
      ss.setData(macdData.map(p => ({ time: p.time as Time, value: p.signal })))
      hs.setData(macdData.map(p => ({ time: p.time as Time, value: p.histogram, color: p.histogram >= 0 ? 'rgba(14,207,151,0.5)' : 'rgba(244,63,94,0.5)' })))
    } catch (_) {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indicator, klines])

  const drawLevel = (price: number) => {
    if (!chartRef.current || klines.length < 2) return
    const line = chartRef.current.addLineSeries({ color: C.gold, lineWidth: 1, lineStyle: 2, priceScaleId: 'right', lastValueVisible: true, priceLineVisible: false })
    const first = klines[0].time as Time
    const last  = klines[klines.length - 1].time as Time
    try { line.setData([{ time: first, value: price }, { time: last, value: price }]); levelLines.current.push(line) } catch (_) {}
  }

  const clearLevels = () => {
    if (!chartRef.current) return
    for (const l of levelLines.current) try { chartRef.current.removeSeries(l) } catch (_) {}
    levelLines.current = []
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 6, zIndex: 10 }}>
        <button onClick={() => setIsDrawing(d => !d)} style={{ background: isDrawing ? C.goldBg : C.bg2, border: `1px solid ${isDrawing ? C.goldB : C.border}`, borderRadius: 7, padding: '4px 10px', color: isDrawing ? C.gold : C.t2, fontSize: 10, fontWeight: 700 }}>─ Level</button>
        <button onClick={clearLevels} style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 7, padding: '4px 10px', color: C.t3, fontSize: 10, fontWeight: 700 }}>Clear</button>
      </div>
      {isDrawing && (
        <div style={{ position: 'absolute', inset: 0, cursor: 'crosshair', zIndex: 9 }}
          onClick={e => {
            if (!containerRef.current || !candleRef.current) return
            const rect = containerRef.current.getBoundingClientRect()
            const price = candleRef.current.coordinateToPrice(e.clientY - rect.top)
            if (price !== null) { drawLevel(price); setIsDrawing(false) }
          }} />
      )}
    </div>
  )
}

function TradingChartInner({ klines, sym, indicator, chartMode }: TradingChartProps) {
  if (chartMode === 'area') {
    return (
      <Suspense fallback={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: C.t3, gap: 10 }}>
          <div className="spin" style={{ width: 18, height: 18, border: `2px solid ${C.border}`, borderTopColor: C.gold, borderRadius: '50%' }} />
          Loading…
        </div>
      }>
        <AreaChartView klines={klines} />
      </Suspense>
    )
  }
  return <CandleChart klines={klines} sym={sym} indicator={indicator} />
}

export const TradingChart = memo(TradingChartInner)
