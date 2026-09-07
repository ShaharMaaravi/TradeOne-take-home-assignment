import type { Instrument } from '../domain/types'

interface InstrumentFixture {
  readonly instrument: Instrument
  readonly previousClose: number
  readonly initialVolume: number
  readonly openingChangePercent: number
}

// Illustrative values inspired by the recording, not historical/live market data.
// Israeli quotes explicitly use agorot; no currency conversion is implied.
export const instrumentFixtures: readonly InstrumentFixture[] = [
  { instrument: { id: 'us-msft', symbol: 'MSFT', name: 'MICROSOFT CORP', market: 'US', type: 'stock', priceUnit: 'USD', priceDecimals: 2 }, previousClose: 387.02, initialVolume: 27_860_000, openingChangePercent: 0.54 },
  { instrument: { id: 'il-doral', symbol: 'דוראל', name: 'דוראל אנרגיה', market: 'IL', type: 'stock', priceUnit: 'ILA', priceDecimals: 0 }, previousClose: 44_650, initialVolume: 822_870, openingChangePercent: -0.45 },
  { instrument: { id: 'il-dalia', symbol: 'דליה', name: 'דליה אנרגיות', market: 'IL', type: 'stock', priceUnit: 'ILA', priceDecimals: 0 }, previousClose: 12_745, initialVolume: 109_580, openingChangePercent: 0.35 },
  { instrument: { id: 'us-d', symbol: 'D', name: 'DOMINION ENERGY INC', market: 'US', type: 'stock', priceUnit: 'USD', priceDecimals: 2 }, previousClose: 70.50, initialVolume: 2_910_000, openingChangePercent: -0.33 },
  { instrument: { id: 'il-poalim', symbol: 'פועלים', name: 'בנק הפועלים', market: 'IL', type: 'stock', priceUnit: 'ILA', priceDecimals: 0 }, previousClose: 7_352, initialVolume: 897_330, openingChangePercent: -0.19 },
  { instrument: { id: 'il-yuval', symbol: 'יובלים', name: 'יובלים השקעות', market: 'IL', type: 'stock', priceUnit: 'ILA', priceDecimals: 0 }, previousClose: 24_880, initialVolume: 66_780, openingChangePercent: 0.40 },
  { instrument: { id: 'us-a', symbol: 'A', name: 'AGILENT TECHNOLOGIES INC', market: 'US', type: 'stock', priceUnit: 'USD', priceDecimals: 2 }, previousClose: 143.53, initialVolume: 1_530_000, openingChangePercent: -4.49 },
  { instrument: { id: 'us-aapl', symbol: 'AAPL', name: 'APPLE INC', market: 'US', type: 'stock', priceUnit: 'USD', priceDecimals: 2 }, previousClose: 332.03, initialVolume: 69_600_000, openingChangePercent: 1.17 },
  { instrument: { id: 'us-meta', symbol: 'META', name: 'META PLATFORMS INC CLASS A', market: 'US', type: 'stock', priceUnit: 'USD', priceDecimals: 2 }, previousClose: 592.47, initialVolume: 11_200_000, openingChangePercent: -0.22 },
  { instrument: { id: 'us-shop', symbol: 'SHOP', name: 'SHOPIFY INC CLASS A', market: 'US', type: 'stock', priceUnit: 'USD', priceDecimals: 2 }, previousClose: 124.76, initialVolume: 11_350_000, openingChangePercent: 1.52 },
  { instrument: { id: 'us-abev', symbol: 'ABEV', name: 'AMBEV SA ADR', market: 'US', type: 'stock', priceUnit: 'USD', priceDecimals: 2 }, previousClose: 3.06, initialVolume: 9_240_000, openingChangePercent: 0.33 },
  { instrument: { id: 'us-ivv', symbol: 'IVV', name: 'ISHARES CORE S&P 500 ETF', market: 'US', type: 'etf', priceUnit: 'USD', priceDecimals: 2 }, previousClose: 539.55, initialVolume: 4_560_000, openingChangePercent: 0.60 },
  { instrument: { id: 'us-pltr', symbol: 'PLTR', name: 'PALANTIR TECHNOLOGIES INC', market: 'US', type: 'stock', priceUnit: 'USD', priceDecimals: 2 }, previousClose: 124.83, initialVolume: 38_190_000, openingChangePercent: 7.00 },
  { instrument: { id: 'us-nflx', symbol: 'NFLX', name: 'NETFLIX INC', market: 'US', type: 'stock', priceUnit: 'USD', priceDecimals: 2 }, previousClose: 78.02, initialVolume: 33_090_000, openingChangePercent: 0.48 },
  { instrument: { id: 'us-nvda', symbol: 'NVDA', name: 'NVIDIA CORP', market: 'US', type: 'stock', priceUnit: 'USD', priceDecimals: 2 }, previousClose: 191.24, initialVolume: 114_350_000, openingChangePercent: -4.39 },
  { instrument: { id: 'il-leumi', symbol: 'לאומי', name: 'בנק לאומי', market: 'IL', type: 'stock', priceUnit: 'ILA', priceDecimals: 0 }, previousClose: 7_150, initialVolume: 833_490, openingChangePercent: -0.21 },
]
