// @vitest-environment node
import { describe, expect, it } from 'vitest'
import type { MockMarket } from '../domain/types'
import { advanceMockMarket, createMockMarket, DEFAULT_TIMESTAMP, MAX_INTRADAY_POINTS } from './market'
import { createSeededRandom } from './random'

function freezeDeep<T>(value: T): T {
  if (value !== null && typeof value === 'object') {
    Object.values(value).forEach(freezeDeep)
    Object.freeze(value)
  }
  return value
}

function expectConsistentMarket(market: MockMarket) {
  const ids = new Set(market.instruments.map((item) => item.id))
  expect(ids.size).toBe(market.instruments.length)
  expect(Object.keys(market.quotes).sort()).toEqual([...ids].sort())
  expect(market.watchlists.some((list) => list.id === market.activeWatchlistId)).toBe(true)
  expect(market.watchlists.some((list) => list.id === market.defaultWatchlistId)).toBe(true)
  for (const list of market.watchlists) {
    expect(new Set(list.instrumentIds).size).toBe(list.instrumentIds.length)
    expect(list.instrumentIds.every((id) => ids.has(id))).toBe(true)
  }
  for (const instrument of market.instruments) {
    const quote = market.quotes[instrument.id]!
    expect(quote.instrumentId).toBe(instrument.id)
    expect(quote.price).toBeGreaterThan(0)
    expect(Number.isFinite(quote.price)).toBe(true)
    expect(quote.price).toBe(Number(quote.price.toFixed(instrument.priceDecimals)))
    expect(quote.dayLow).toBeLessThanOrEqual(quote.price)
    expect(quote.dayHigh).toBeGreaterThanOrEqual(quote.price)
    expect(quote.volume).toBeGreaterThanOrEqual(0)
    expect(Number.isSafeInteger(quote.volume)).toBe(true)
    expect(quote.intraday.length).toBeLessThanOrEqual(MAX_INTRADAY_POINTS)
    expect(quote.intraday.at(-1)).toEqual({ timestamp: quote.updatedAt, price: quote.price })
    expect(quote.dailyCloses).toHaveLength(30)
    expect(quote.dailyCloses.at(-1)).toBe(quote.previousClose)
    for (const [index, point] of quote.intraday.entries()) {
      expect(point.price).toBeGreaterThanOrEqual(quote.dayLow)
      expect(point.price).toBeLessThanOrEqual(quote.dayHigh)
      if (index > 0) expect(point.timestamp).toBeGreaterThan(quote.intraday[index - 1]!.timestamp)
    }
  }
}

describe('initial mock market', () => {
  it('is repeatable for a fixed seed and clock, with no shared mutable fixtures', () => {
    const first = createMockMarket(7)
    const second = createMockMarket(7)
    expect(first).toEqual(second)
    expect(first.quotes['us-msft']).not.toBe(second.quotes['us-msft'])
    expect(first.instruments[0]).not.toBe(second.instruments[0])
    expect(createMockMarket(8).quotes).not.toEqual(first.quotes)
  })
  it('provides consistent mixed-market fixtures and an empty list', () => {
    const market = createMockMarket()
    expectConsistentMarket(market)
    expect(new Set(market.instruments.map((item) => item.market))).toEqual(new Set(['US', 'IL']))
    expect(market.watchlists.some((list) => list.instrumentIds.length === 0)).toBe(true)
    expect(Object.values(market.quotes).some((q) => q.price > q.previousClose)).toBe(true)
    expect(Object.values(market.quotes).some((q) => q.price < q.previousClose)).toBe(true)
  })
  it('honors an explicit clock for every quote and history endpoint', () => {
    const now = DEFAULT_TIMESTAMP + 100_000
    expect(Object.values(createMockMarket(42, now).quotes).every((q) => q.updatedAt === now)).toBe(true)
  })
  it('rejects clocks that cannot produce valid initial history', () => {
    expect(() => createMockMarket(42, 0)).toThrow(RangeError)
    expect(() => createMockMarket(42, Number.NaN)).toThrow(RangeError)
  })
})

describe('mock ticks', () => {
  it('is deterministic and does not mutate frozen input', () => {
    const market = freezeDeep(createMockMarket())
    const options = { seed: 99, timestamp: DEFAULT_TIMESTAMP + 1_000, updateProbability: 1 }
    const next = advanceMockMarket(market, options)
    expect(next).toEqual(advanceMockMarket(market, options))
    expect(next.instruments).toBe(market.instruments)
    expect(next.watchlists).toBe(market.watchlists)
    for (const id of Object.keys(market.quotes)) {
      const previous = market.quotes[id]!
      const updated = next.quotes[id]!
      expect(updated.previousTick).toBe(previous.price)
      expect(updated.previousClose).toBe(previous.previousClose)
      expect(updated.dayOpen).toBe(previous.dayOpen)
      expect(updated.dailyCloses).toBe(previous.dailyCloses)
      expect(updated.volume).toBeGreaterThan(previous.volume)
    }
    expectConsistentMarket(next)
  })
  it('preserves object identity on no-op ticks and for untouched quotes', () => {
    const market = createMockMarket()
    expect(advanceMockMarket(market, { seed: 1, timestamp: DEFAULT_TIMESTAMP + 1, updateProbability: 0 })).toBe(market)
    const next = advanceMockMarket(market, { seed: 42, timestamp: DEFAULT_TIMESTAMP + 1 })
    const changed = Object.keys(market.quotes).filter((id) => next.quotes[id] !== market.quotes[id])
    expect(changed.length).toBeGreaterThan(0)
    expect(changed.length).toBeLessThan(market.instruments.length)
  })
  it('bounds history and preserves session extremes across 500 ticks', () => {
    let market = createMockMarket()
    for (let tick = 1; tick <= 500; tick++) {
      const next = advanceMockMarket(market, { seed: tick, timestamp: DEFAULT_TIMESTAMP + tick * 1_000, updateProbability: 1 })
      for (const id of Object.keys(market.quotes)) {
        expect(next.quotes[id]!.dayLow).toBeLessThanOrEqual(market.quotes[id]!.dayLow)
        expect(next.quotes[id]!.dayHigh).toBeGreaterThanOrEqual(market.quotes[id]!.dayHigh)
        expect(next.quotes[id]!.volume).toBeGreaterThan(market.quotes[id]!.volume)
      }
      market = next
    }
    expectConsistentMarket(market)
    expect(Object.values(market.quotes).every((q) => q.intraday.length === MAX_INTRADAY_POINTS)).toBe(true)
  })
  it('floors a falling minimum-price security at its supported price increment', () => {
    const original = createMockMarket()
    const instrument = original.instruments.find((item) => item.id === 'us-abev')!
    const market: MockMarket = { ...original, instruments: [instrument], quotes: {
      [instrument.id]: { ...original.quotes[instrument.id]!, price: 0.01, dayLow: 0.01 },
    } }
    const next = advanceMockMarket(market, { seed: 99, timestamp: DEFAULT_TIMESTAMP + 1, updateProbability: 1 })
    expect(next.quotes[instrument.id]!.price).toBe(0.01)
  })
  it('rejects stale or invalid tick timestamps', () => {
    const market = createMockMarket()
    for (const timestamp of [DEFAULT_TIMESTAMP, DEFAULT_TIMESTAMP - 1, -1, Infinity, Number.NaN]) {
      expect(() => advanceMockMarket(market, { seed: 1, timestamp })).toThrow(RangeError)
    }
  })
  it.each([-0.1, 1.1, Number.NaN])('rejects invalid selection probability %s', (updateProbability) => {
    expect(() => advanceMockMarket(createMockMarket(), { seed: 1, timestamp: DEFAULT_TIMESTAMP + 1, updateProbability })).toThrow(RangeError)
  })
})

describe('seeded randomness', () => {
  it('replays a sequence within [0, 1), including a zero seed', () => {
    const first = createSeededRandom(0)
    const second = createSeededRandom(0)
    for (let index = 0; index < 100; index++) {
      const value = first()
      expect(value).toBe(second())
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })
  it('rejects non-integer seeds', () => {
    expect(() => createSeededRandom(1.5)).toThrow(RangeError)
    expect(() => createSeededRandom(Infinity)).toThrow(RangeError)
  })
})
