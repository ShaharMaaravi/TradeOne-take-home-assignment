import type {
  Instrument,
  InstrumentType,
  Market,
  MockMarket,
  Quote,
} from './types'
import { getPercentageChange, getQuoteMetrics } from './calculations'
import { matchesInstrumentQuery } from './catalogue'

export type SortKey =
  | 'identity'
  | 'price'
  | 'change'
  | 'changePercent'
  | 'volume'
  | 'range'
  | 'intraday'
  | 'trend'
  | 'return30Day'
export type SortDescriptor = {
  readonly key: SortKey
  readonly direction: 'ascending' | 'descending'
} | null
export interface WatchlistFilters {
  readonly query: string
  readonly market: Market | 'all'
  readonly type: InstrumentType | 'all'
  readonly performance: 'all' | 'gainers' | 'losers' | 'unchanged'
}
export const DEFAULT_FILTERS: WatchlistFilters = {
  query: '',
  market: 'all',
  type: 'all',
  performance: 'all',
}
const collator = new Intl.Collator('he', { numeric: true, sensitivity: 'base' })

export function cycleSort(
  current: SortDescriptor,
  key: SortKey,
): SortDescriptor {
  if (current?.key !== key) return { key, direction: 'ascending' }
  return current.direction === 'ascending'
    ? { key, direction: 'descending' }
    : null
}

export function activeFilterCount(filters: WatchlistFilters): number {
  return (
    Number(Boolean(filters.query.trim())) +
    Number(filters.market !== 'all') +
    Number(filters.type !== 'all') +
    Number(filters.performance !== 'all')
  )
}

function matchesFilters(
  instrument: Instrument,
  quote: Quote,
  filters: WatchlistFilters,
): boolean {
  if (!matchesInstrumentQuery(instrument, filters.query)) return false
  if (filters.market !== 'all' && instrument.market !== filters.market)
    return false
  if (filters.type !== 'all' && instrument.type !== filters.type) return false
  const change = quote.price - quote.previousClose
  return (
    filters.performance === 'all' ||
    (filters.performance === 'gainers' && change > 0) ||
    (filters.performance === 'losers' && change < 0) ||
    (filters.performance === 'unchanged' && change === 0)
  )
}

function sortValue(
  key: SortKey,
  instrument: Instrument,
  quote: Quote,
): string | number | null {
  const metrics = getQuoteMetrics(quote)
  switch (key) {
    case 'identity':
      return instrument.symbol
    case 'price':
      return quote.price
    case 'change':
      return metrics.change
    case 'changePercent':
      return metrics.changePercent
    case 'volume':
      return quote.volume
    case 'range':
      return metrics.rangePosition
    case 'intraday':
      return getPercentageChange(quote.price, quote.dayOpen)
    case 'return30Day':
      return metrics.return30DayPercent
    case 'trend':
      return metrics.trend.length === 0
        ? null
        : metrics.trend.reduce(
            (total, direction) =>
              total + (direction === 'up' ? 1 : direction === 'down' ? -1 : 0),
            0,
          )
  }
}

/** Missing metrics sort last in both directions; ties preserve saved manual order. */
export function selectVisibleInstrumentIds(
  market: MockMarket,
  filters: WatchlistFilters,
  sort: SortDescriptor,
): readonly string[] {
  const list = market.watchlists.find(
    (item) => item.id === market.activeWatchlistId,
  )
  const catalogue = new Map(
    market.instruments.map((instrument) => [instrument.id, instrument]),
  )
  const rows = (list?.instrumentIds ?? []).flatMap((id, position) => {
    const instrument = catalogue.get(id)
    const quote = market.quotes[id]
    if (!instrument || !quote || !matchesFilters(instrument, quote, filters))
      return []
    const value = sort ? sortValue(sort.key, instrument, quote) : null
    return [
      {
        id,
        position,
        value:
          typeof value === 'number' && !Number.isFinite(value) ? null : value,
      },
    ]
  })
  if (sort)
    rows.sort((a, b) => {
      if (a.value === null || b.value === null) {
        return a.value === b.value
          ? a.position - b.position
          : a.value === null
            ? 1
            : -1
      }
      const comparison =
        typeof a.value === 'string' && typeof b.value === 'string'
          ? collator.compare(a.value, b.value)
          : Number(a.value) - Number(b.value)
      return comparison === 0
        ? a.position - b.position
        : comparison * (sort.direction === 'ascending' ? 1 : -1)
    })
  return rows.map((row) => row.id)
}
