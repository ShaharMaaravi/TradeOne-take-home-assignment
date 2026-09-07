import { createStore } from 'zustand/vanilla'
import type { MockMarket } from '../domain/types'
import {
  advanceMockMarket,
  createMockMarket,
  DEFAULT_SEED,
  DEFAULT_TIMESTAMP,
} from '../mock/market'
import { advanceMockIndices, createMockIndices } from '../mock/indices'
import type { MarketIndex } from '../mock/indices'

export const FEED_INTERVAL_MS = 1_500

export interface WatchlistState {
  market: MockMarket
  indices: readonly MarketIndex[]
  tickNumber: number
  isPlaying: boolean
  advance: () => void
  togglePlayback: () => void
}

/** Each app/test owns a store. There are no global timers or mutable singletons. */
export function createWatchlistStore(isPlaying = true) {
  return createStore<WatchlistState>()((set) => ({
    market: createMockMarket(),
    indices: createMockIndices(),
    tickNumber: 0,
    isPlaying,
    togglePlayback: () => set((state) => ({ isPlaying: !state.isPlaying })),
    advance: () =>
      set((state) => {
        if (!state.isPlaying) return state
        const tickNumber = state.tickNumber + 1
        const seed = DEFAULT_SEED + tickNumber
        return {
          tickNumber,
          market: advanceMockMarket(state.market, {
            seed,
            timestamp: DEFAULT_TIMESTAMP + tickNumber * FEED_INTERVAL_MS,
          }),
          indices: advanceMockIndices(state.indices, seed),
        }
      }),
  }))
}

export type WatchlistStore = ReturnType<typeof createWatchlistStore>
