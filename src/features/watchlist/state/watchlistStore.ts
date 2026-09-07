import { createStore } from 'zustand/vanilla'
import { DEFAULT_FILTERS, cycleSort } from '../domain/view'
import type { SortDescriptor, SortKey, WatchlistFilters } from '../domain/view'
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
  filters: WatchlistFilters
  sort: SortDescriptor
  setFilters: (filters: Partial<WatchlistFilters>) => void
  resetFilters: () => void
  cycleSort: (key: SortKey) => void
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
    filters: { ...DEFAULT_FILTERS },
    sort: null,
    setFilters: (filters) =>
      set((state) => ({ filters: { ...state.filters, ...filters } })),
    resetFilters: () => set({ filters: { ...DEFAULT_FILTERS } }),
    cycleSort: (key) => set((state) => ({ sort: cycleSort(state.sort, key) })),
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
