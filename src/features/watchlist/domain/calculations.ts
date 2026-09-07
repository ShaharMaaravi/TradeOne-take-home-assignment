import type { Direction, Quote } from './types'

export function getDirection(current: number, previous: number): Direction {
  if (current === previous) return 'unchanged'
  return current > previous ? 'up' : 'down'
}

export function getPercentageChange(current: number, baseline: number): number | null {
  if (!Number.isFinite(current) || !Number.isFinite(baseline) || baseline <= 0) return null
  return ((current - baseline) / baseline) * 100
}

/** null means unavailable; a flat range is centered instead of dividing by zero. */
export function getRangePosition(price: number, low: number, high: number): number | null {
  if (![price, low, high].every(Number.isFinite) || high < low) return null
  if (high === low) return 0.5
  return Math.max(0, Math.min(1, (price - low) / (high - low)))
}

export function getQuoteMetrics(quote: Quote) {
  const baseline = quote.dailyCloses.length >= 30 ? quote.dailyCloses.at(-30) : undefined
  const latestDailyPrices = [...quote.dailyCloses.slice(-13), quote.price]

  return {
    change: quote.price - quote.previousClose,
    changePercent: getPercentageChange(quote.price, quote.previousClose),
    dailyDirection: getDirection(quote.price, quote.previousClose),
    tickDirection: getDirection(quote.price, quote.previousTick),
    rangePosition: getRangePosition(quote.price, quote.dayLow, quote.dayHigh),
    return30DayPercent: baseline === undefined ? null : getPercentageChange(quote.price, baseline),
    // Each segment represents the move from one close to the next (last = today).
    trend: latestDailyPrices.slice(1).map((price, index) =>
      getDirection(price, latestDailyPrices[index]!),
    ),
  }
}
