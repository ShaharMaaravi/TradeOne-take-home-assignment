// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { getDirection, getPercentageChange, getQuoteMetrics, getRangePosition } from './calculations'
import { createMockMarket } from '../mock/market'

const quote = createMockMarket().quotes['us-msft']!

describe('quote metrics', () => {
  it('keeps daily gains separate from a downward latest tick', () => {
    const metrics = getQuoteMetrics({ ...quote, price: 105, previousClose: 100, previousTick: 106 })
    expect(metrics.change).toBe(5)
    expect(metrics.changePercent).toBe(5)
    expect(metrics.dailyDirection).toBe('up')
    expect(metrics.tickDirection).toBe('down')
  })

  it('derives 30-day returns and 13 trend segments from the same price history', () => {
    const dailyCloses = Array.from({ length: 30 }, (_, index) => 100 + index)
    const metrics = getQuoteMetrics({ ...quote, price: 110, dailyCloses })
    expect(metrics.return30DayPercent).toBe(10)
    expect(metrics.trend).toHaveLength(13)
    expect(metrics.trend.slice(0, -1)).toEqual(Array(12).fill('up'))
    expect(metrics.trend.at(-1)).toBe('down')
  })

  it('handles unavailable history without inventing a 30-day return', () => {
    const metrics = getQuoteMetrics({ ...quote, dailyCloses: [] })
    expect(metrics.return30DayPercent).toBeNull()
    expect(metrics.trend).toEqual([])
    expect(getQuoteMetrics({ ...quote, dailyCloses: [100] }).return30DayPercent).toBeNull()
  })

  it('represents flat prices without directional bias', () => {
    expect(getDirection(100, 100)).toBe('unchanged')
    expect(getPercentageChange(100, 100)).toBe(0)
    expect(getQuoteMetrics({ ...quote, price: 100, dailyCloses: Array(30).fill(100) }).trend)
      .toEqual(Array(13).fill('unchanged'))
  })

  it.each([0, -1, Number.NaN, Infinity])('rejects invalid return baseline %s', (baseline) => {
    expect(getPercentageChange(100, baseline)).toBeNull()
  })

  it('computes negative returns and rejects a non-finite current value', () => {
    expect(getPercentageChange(75, 100)).toBe(-25)
    expect(getPercentageChange(Infinity, 100)).toBeNull()
  })
})

describe('daily range', () => {
  it('normalizes and clamps the marker position', () => {
    expect(getRangePosition(105, 100, 120)).toBe(0.25)
    expect(getRangePosition(90, 100, 120)).toBe(0)
    expect(getRangePosition(130, 100, 120)).toBe(1)
  })
  it('centers a flat range and rejects invalid bounds', () => {
    expect(getRangePosition(100, 100, 100)).toBe(0.5)
    expect(getRangePosition(100, 120, 90)).toBeNull()
    expect(getRangePosition(Number.NaN, 100, 120)).toBeNull()
  })
})
