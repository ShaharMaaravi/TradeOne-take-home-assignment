import type { MockMarket, PricePoint, Quote } from '../domain/types'
import { instrumentFixtures } from './fixtures'
import { createSeededRandom } from './random'

export const DEFAULT_SEED = 42
export const DEFAULT_TIMESTAMP = Date.UTC(2026, 8, 1, 10, 30)
export const MAX_INTRADAY_POINTS = 60
const INITIAL_INTRADAY_POINTS = 32
const HISTORY_INTERVAL_MS = 60_000

function roundPrice(value: number, decimals: number): number {
  return Math.max(10 ** -decimals, Number(value.toFixed(decimals)))
}

function assertTimestamp(timestamp: number): void {
  if (!Number.isSafeInteger(timestamp) || timestamp < 0) {
    throw new RangeError('Timestamp must be a non-negative safe integer')
  }
}

export function createMockMarket(seed = DEFAULT_SEED, now = DEFAULT_TIMESTAMP): MockMarket {
  assertTimestamp(now)
  if (now < (INITIAL_INTRADAY_POINTS - 1) * HISTORY_INTERVAL_MS) {
    throw new RangeError('Timestamp must allow space for initial history')
  }
  const random = createSeededRandom(seed)
  const quotes: Record<string, Quote> = {}

  for (const fixture of instrumentFixtures) {
    const { instrument, previousClose, initialVolume, openingChangePercent } = fixture
    const round = (price: number) => roundPrice(price, instrument.priceDecimals)
    const price = round(previousClose * (1 + openingChangePercent / 100))
    const intraday: PricePoint[] = []
    const dayOpen = round(previousClose * (1 + (random() - 0.5) * 0.01))
    for (let index = 0; index < INITIAL_INTRADAY_POINTS; index++) {
      const progress = index / (INITIAL_INTRADAY_POINTS - 1)
      const noise = (random() - 0.5) * previousClose * 0.006 * Math.sin(progress * Math.PI)
      intraday.push({
        timestamp: now - (INITIAL_INTRADAY_POINTS - 1 - index) * HISTORY_INTERVAL_MS,
        price: index === INITIAL_INTRADAY_POINTS - 1 ? price : round(dayOpen + (price - dayOpen) * progress + noise),
      })
    }
    // Build backwards from the actual prior close, then reverse chronologically.
    const dailyCloses = [previousClose]
    for (let day = 1; day < 30; day++) {
      dailyCloses.push(round(dailyCloses[day - 1]! / (1 + (random() - 0.5) * 0.04)))
    }
    dailyCloses.reverse()
    quotes[instrument.id] = {
      instrumentId: instrument.id, price, previousTick: intraday.at(-2)!.price,
      previousClose, dayOpen,
      dayLow: Math.min(...intraday.map((point) => point.price)),
      dayHigh: Math.max(...intraday.map((point) => point.price)),
      volume: initialVolume, updatedAt: now, intraday, dailyCloses,
    }
  }

  return {
    instruments: instrumentFixtures.map(({ instrument }) => ({ ...instrument })),
    quotes,
    watchlists: [
      { id: 'general', name: 'כללי', instrumentIds: ['us-aapl', 'us-abev', 'us-ivv', 'us-pltr', 'us-msft', 'us-nflx', 'us-nvda'] },
      { id: 'my-watchlist', name: 'My Watchlist 2', instrumentIds: instrumentFixtures.slice(0, 11).map(({ instrument }) => instrument.id) },
      { id: 'israel', name: 'ישראל', instrumentIds: instrumentFixtures.filter(({ instrument }) => instrument.market === 'IL').map(({ instrument }) => instrument.id) },
      { id: 'empty', name: 'רשימה חדשה', instrumentIds: [] },
    ],
    activeWatchlistId: 'my-watchlist', defaultWatchlistId: 'my-watchlist',
  }
}

interface TickOptions {
  readonly seed: number
  readonly timestamp: number
  /** Fraction of catalogue entries selected per tick; default 0.35. */
  readonly updateProbability?: number
}

/** Pure tick: explicit seed/clock, no timers or React state, no input mutation. */
export function advanceMockMarket(market: MockMarket, options: TickOptions): MockMarket {
  const { seed, timestamp, updateProbability = 0.35 } = options
  assertTimestamp(timestamp)
  if (!Number.isFinite(updateProbability) || updateProbability < 0 || updateProbability > 1) {
    throw new RangeError('Update probability must be between 0 and 1')
  }
  for (const quote of Object.values(market.quotes)) {
    if (timestamp <= quote.updatedAt) throw new RangeError('Tick must be newer than existing quotes')
  }
  const random = createSeededRandom(seed)
  const quotes = { ...market.quotes }
  let changed = false
  for (const instrument of market.instruments) {
    const quote = market.quotes[instrument.id]
    if (!quote || random() >= updateProbability) continue
    const price = roundPrice(quote.price * (1 + (random() - 0.5) * 0.004), instrument.priceDecimals)
    const intraday = [...quote.intraday, { timestamp, price }].slice(-MAX_INTRADAY_POINTS)
    quotes[instrument.id] = {
      ...quote, price, previousTick: quote.price, updatedAt: timestamp,
      dayLow: Math.min(quote.dayLow, price), dayHigh: Math.max(quote.dayHigh, price),
      volume: quote.volume + 1 + Math.floor(random() * 2_000), intraday,
    }
    changed = true
  }
  return changed ? { ...market, quotes } : market
}
