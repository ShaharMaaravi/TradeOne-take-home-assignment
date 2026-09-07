// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { createMockMarket } from '../mock/market'
import type { MockMarket } from './types'
import { cycleSort, DEFAULT_FILTERS, selectVisibleInstrumentIds } from './view'
import type { SortKey } from './view'

function exampleMarket(): MockMarket {
  const original = createMockMarket()
  const ids = ['us-msft', 'il-doral', 'il-dalia']
  const instruments = ids.map((id, i) => ({
    ...original.instruments.find((item) => item.id === id)!,
    symbol: ['B', 'A', 'C'][i]!,
    name: ['Alpha', 'Beta', 'Gamma'][i]!,
    type: i === 2 ? ('etf' as const) : ('stock' as const),
  }))
  const prices = [10, 2, 30],
    closes = [8, 4, 15],
    volumes = [900, 10000, 50]
  const quotes = Object.fromEntries(
    ids.map((id, i) => [
      id,
      {
        ...original.quotes[id]!,
        price: prices[i]!,
        previousClose: closes[i]!,
        dayOpen: [8, 4, 10][i]!,
        dayLow: [0, 0, 10][i]!,
        dayHigh: [20, 10, 30][i]!,
        volume: volumes[i]!,
        dailyCloses: Array(30).fill(closes[i]!),
      },
    ]),
  )
  return {
    ...original,
    instruments,
    quotes,
    activeWatchlistId: 'test',
    watchlists: [{ id: 'test', name: 'Test', instrumentIds: ids }],
  }
}
const [a, b, c] = ['us-msft', 'il-doral', 'il-dalia'] as const

describe('sorting', () => {
  it.each<SortKey>([
    'identity',
    'price',
    'change',
    'changePercent',
    'range',
    'intraday',
    'trend',
    'return30Day',
  ])('sorts %s by its underlying value', (key) => {
    expect(
      selectVisibleInstrumentIds(exampleMarket(), DEFAULT_FILTERS, {
        key,
        direction: 'ascending',
      }),
    ).toEqual([b, a, c])
  })
  it('sorts numeric volume, not formatted strings', () => {
    expect(
      selectVisibleInstrumentIds(exampleMarket(), DEFAULT_FILTERS, {
        key: 'volume',
        direction: 'ascending',
      }),
    ).toEqual([c, a, b])
  })
  it('reverses non-equal values and preserves saved order for ties', () => {
    expect(
      selectVisibleInstrumentIds(exampleMarket(), DEFAULT_FILTERS, {
        key: 'price',
        direction: 'descending',
      }),
    ).toEqual([c, a, b])
    expect(
      selectVisibleInstrumentIds(exampleMarket(), DEFAULT_FILTERS, {
        key: 'trend',
        direction: 'descending',
      }),
    ).toEqual([a, c, b])
  })
  it('cycles back to saved order without modifying the list', () => {
    const market = exampleMarket(),
      copy = structuredClone(market)
    const ascending = cycleSort(null, 'price')
    const descending = cycleSort(ascending, 'price')
    expect(ascending?.direction).toBe('ascending')
    expect(descending?.direction).toBe('descending')
    expect(cycleSort(descending, 'price')).toBeNull()
    expect(
      selectVisibleInstrumentIds(
        market,
        DEFAULT_FILTERS,
        cycleSort(descending, 'price'),
      ),
    ).toEqual([a, b, c])
    expect(cycleSort(descending, 'volume')).toEqual({
      key: 'volume',
      direction: 'ascending',
    })
    expect(market).toEqual(copy)
  })
  it('puts unavailable chart metrics last in either direction', () => {
    const original = exampleMarket()
    const market = {
      ...original,
      quotes: {
        ...original.quotes,
        [a]: { ...original.quotes[a]!, dailyCloses: [] },
      },
    }
    expect(
      selectVisibleInstrumentIds(market, DEFAULT_FILTERS, {
        key: 'return30Day',
        direction: 'ascending',
      }),
    ).toEqual([b, c, a])
    expect(
      selectVisibleInstrumentIds(market, DEFAULT_FILTERS, {
        key: 'return30Day',
        direction: 'descending',
      }),
    ).toEqual([c, b, a])
  })
})

describe('combined filters', () => {
  it('searches symbols and names without case/whitespace sensitivity', () => {
    expect(
      selectVisibleInstrumentIds(
        exampleMarket(),
        { ...DEFAULT_FILTERS, query: '  aLPHa  b ' },
        null,
      ),
    ).toEqual([a])
    expect(
      selectVisibleInstrumentIds(
        createMockMarket(),
        { ...DEFAULT_FILTERS, query: 'בנק' },
        null,
      ),
    ).toEqual(['il-poalim'])
  })
  it('combines market, type, performance and text using AND semantics', () => {
    expect(
      selectVisibleInstrumentIds(
        exampleMarket(),
        { query: 'gamma', market: 'IL', type: 'etf', performance: 'gainers' },
        null,
      ),
    ).toEqual([c])
    expect(
      selectVisibleInstrumentIds(
        exampleMarket(),
        { query: 'gamma', market: 'US', type: 'etf', performance: 'gainers' },
        null,
      ),
    ).toEqual([])
  })
  it('keeps flat quotes separate from gainers and losers', () => {
    const original = exampleMarket()
    const market = {
      ...original,
      quotes: { ...original.quotes, [a]: { ...original.quotes[a]!, price: 8 } },
    }
    expect(
      selectVisibleInstrumentIds(
        market,
        { ...DEFAULT_FILTERS, performance: 'unchanged' },
        null,
      ),
    ).toEqual([a])
    expect(
      selectVisibleInstrumentIds(
        market,
        { ...DEFAULT_FILTERS, performance: 'losers' },
        null,
      ),
    ).toEqual([b])
    expect(
      selectVisibleInstrumentIds(
        market,
        { ...DEFAULT_FILTERS, performance: 'gainers' },
        null,
      ),
    ).toEqual([c])
  })
  it('recomputes live performance filters and ordering from the latest quote', () => {
    const original = exampleMarket()
    const filters = { ...DEFAULT_FILTERS, performance: 'gainers' as const }
    const sort = { key: 'price' as const, direction: 'ascending' as const }
    expect(selectVisibleInstrumentIds(original, filters, sort)).toEqual([a, c])
    const updated = {
      ...original,
      quotes: {
        ...original.quotes,
        [b]: { ...original.quotes[b]!, price: 40 },
      },
    }
    expect(selectVisibleInstrumentIds(updated, filters, sort)).toEqual([
      a,
      c,
      b,
    ])
    expect(updated.watchlists[0]!.instrumentIds).toEqual([a, b, c])
  })
  it('returns no rows for an empty list or invalid catalogue references', () => {
    const original = exampleMarket()
    expect(
      selectVisibleInstrumentIds(
        { ...original, activeWatchlistId: 'absent' },
        DEFAULT_FILTERS,
        null,
      ),
    ).toEqual([])
    expect(
      selectVisibleInstrumentIds(
        { ...original, instruments: [] },
        DEFAULT_FILTERS,
        null,
      ),
    ).toEqual([])
  })
})
