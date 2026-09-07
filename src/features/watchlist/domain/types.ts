export type InstrumentId = string
export type Market = 'US' | 'IL'
export type InstrumentType = 'stock' | 'etf'
export type PriceUnit = 'USD' | 'ILS' | 'ILA'
export type Direction = 'up' | 'down' | 'unchanged'

export interface Instrument {
  readonly id: InstrumentId
  readonly symbol: string
  readonly name: string
  readonly market: Market
  readonly type: InstrumentType
  /** ILA means agorot. Every price in a quote uses this same unit. */
  readonly priceUnit: PriceUnit
  readonly priceDecimals: number
  readonly logoUrl?: string
}

export interface PricePoint {
  readonly timestamp: number
  readonly price: number
}

export interface Quote {
  readonly instrumentId: InstrumentId
  readonly price: number
  readonly previousTick: number
  readonly previousClose: number
  readonly dayOpen: number
  readonly dayLow: number
  readonly dayHigh: number
  /** Traded units, not monetary turnover. */
  readonly volume: number
  readonly updatedAt: number
  readonly intraday: readonly PricePoint[]
  /** Oldest to newest: 30 prior daily closes, ending at previousClose. */
  readonly dailyCloses: readonly number[]
}

export interface Watchlist {
  readonly id: string
  readonly name: string
  readonly instrumentIds: readonly InstrumentId[]
}

export interface MockMarket {
  readonly instruments: readonly Instrument[]
  readonly quotes: Readonly<Record<InstrumentId, Quote>>
  readonly watchlists: readonly Watchlist[]
  readonly activeWatchlistId: string
  readonly defaultWatchlistId: string
}
