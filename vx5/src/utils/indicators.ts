import type { Kline, RSIPoint, MACDPoint } from '@/types'

// ─── RSI ─────────────────────────────────────────────────────────────────────
export function calcRSI(klines: Kline[], period = 14): RSIPoint[] {
  if (klines.length < period + 1) return []

  const gains: number[] = []
  const losses: number[] = []

  for (let i = 1; i < klines.length; i++) {
    const diff = klines[i].close - klines[i - 1].close
    gains.push(diff > 0 ? diff : 0)
    losses.push(diff < 0 ? Math.abs(diff) : 0)
  }

  const result: RSIPoint[] = []
  let avgGain = gains.slice(0, period).reduce((s, v) => s + v, 0) / period
  let avgLoss = losses.slice(0, period).reduce((s, v) => s + v, 0) / period

  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss
    const rsi = 100 - 100 / (1 + rs)
    result.push({ time: klines[i + 1].time, value: parseFloat(rsi.toFixed(2)) })
  }

  return result
}

// ─── EMA helper ──────────────────────────────────────────────────────────────
function ema(data: number[], period: number): number[] {
  const k = 2 / (period + 1)
  const result: number[] = []
  let prev = data.slice(0, period).reduce((s, v) => s + v, 0) / period
  result.push(...new Array(period - 1).fill(NaN))
  result.push(prev)
  for (let i = period; i < data.length; i++) {
    prev = data[i] * k + prev * (1 - k)
    result.push(prev)
  }
  return result
}

// ─── MACD ─────────────────────────────────────────────────────────────────────
export function calcMACD(
  klines: Kline[],
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9,
): MACDPoint[] {
  if (klines.length < slowPeriod + signalPeriod) return []

  const closes = klines.map(k => k.close)
  const fastEMA = ema(closes, fastPeriod)
  const slowEMA = ema(closes, slowPeriod)

  const macdLine: number[] = []
  const times: number[] = []

  for (let i = slowPeriod - 1; i < closes.length; i++) {
    const fast = fastEMA[i]
    const slow = slowEMA[i]
    if (fast !== undefined && slow !== undefined && !isNaN(fast) && !isNaN(slow)) {
      macdLine.push(fast - slow)
      times.push(klines[i].time)
    }
  }

  const signalLine = ema(macdLine, signalPeriod)

  return macdLine
    .slice(signalPeriod - 1)
    .map((macd, i) => {
      const signal = signalLine[i + signalPeriod - 1] ?? 0
      return {
        time: times[i + signalPeriod - 1] ?? 0,
        macd: parseFloat(macd.toFixed(2)),
        signal: parseFloat(signal.toFixed(2)),
        histogram: parseFloat((macd - signal).toFixed(2)),
      }
    })
    .filter(p => p.time > 0)
}
