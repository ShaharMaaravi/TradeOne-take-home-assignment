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
export const LIST_SWITCH_MS = 450
export const TOAST_DURATION_MS = 4_000

export interface WatchlistState {
  loadError: boolean
  retryListLoad: () => void
  isSwitching: boolean
  listLoadVersion: number
  toast: { id: number; message: string } | null
  toastVersion: number
  selectWatchlist: (id: string) => void
  completeListSwitch: (version: number) => void
  setMembership: (
    listId: string,
    instrumentId: string,
    included: boolean,
  ) => void
  saveList: (id: string, instrumentIds: readonly string[]) => void
  renameList: (id: string, name: string) => boolean
  setDefaultList: (id: string) => void
  deleteList: (id: string) => void
  dismissToast: (id: number) => void
  filters: WatchlistFilters
  sort: SortDescriptor
  setFilters: (filters: Partial<WatchlistFilters>) => void
  resetFilters: () => void
  cycleSort: (key: SortKey) => void
  setSort: (sort: SortDescriptor) => void
  market: MockMarket
  indices: readonly MarketIndex[]
  tickNumber: number
  isPlaying: boolean
  advance: () => void
  togglePlayback: () => void
}

/** Each app/test owns a store. There are no global timers or mutable singletons. */
export function createWatchlistStore(
  isPlaying = true,
  failInitialLoad = false,
) {
  let pendingFailure = failInitialLoad
  return createStore<WatchlistState>()((set) => ({
    loadError: false,
    isSwitching: failInitialLoad,
    listLoadVersion: 0,
    retryListLoad: () =>
      set((state) =>
        state.loadError
          ? {
              loadError: false,
              isSwitching: true,
              listLoadVersion: state.listLoadVersion + 1,
            }
          : state,
      ),
    toast: null,
    toastVersion: 0,
    selectWatchlist: (id) =>
      set((state) => {
        if (
          id === state.market.activeWatchlistId ||
          !state.market.watchlists.some((list) => list.id === id)
        )
          return state
        return {
          market: { ...state.market, activeWatchlistId: id },
          loadError: false,
          isSwitching: true,
          listLoadVersion: state.listLoadVersion + 1,
        }
      }),
    completeListSwitch: (version) =>
      set((state) => {
        if (version !== state.listLoadVersion || !state.isSwitching)
          return state
        const loadError = pendingFailure
        pendingFailure = false
        return { isSwitching: false, loadError }
      }),
    dismissToast: (id) =>
      set((state) => (state.toast?.id === id ? { toast: null } : state)),
    setMembership: (listId, instrumentId, included) =>
      set((state) => {
        const list = state.market.watchlists.find((item) => item.id === listId)
        const instrument = state.market.instruments.find(
          (item) => item.id === instrumentId,
        )
        if (
          !list ||
          !instrument ||
          list.instrumentIds.includes(instrumentId) === included
        )
          return state
        const instrumentIds = included
          ? [instrumentId, ...list.instrumentIds]
          : list.instrumentIds.filter((id) => id !== instrumentId)
        const toastVersion = state.toastVersion + 1
        return {
          market: {
            ...state.market,
            watchlists: state.market.watchlists.map((item) =>
              item.id === listId ? { ...item, instrumentIds } : item,
            ),
          },
          toastVersion,
          toast: {
            id: toastVersion,
            message: `${instrument.symbol} ${included ? 'נוסף לרשימת' : 'הוסר מרשימת'} המעקב ״${list.name}״`,
          },
        }
      }),
    saveList: (id, instrumentIds) =>
      set((state) => {
        const list = state.market.watchlists.find((item) => item.id === id)
        if (
          !list ||
          new Set(instrumentIds).size !== instrumentIds.length ||
          instrumentIds.some((key) => !list.instrumentIds.includes(key))
        )
          return state
        const version = state.toastVersion + 1
        return {
          market: {
            ...state.market,
            watchlists: state.market.watchlists.map((item) =>
              item.id === id
                ? { ...item, instrumentIds: [...instrumentIds] }
                : item,
            ),
          },
          sort: null,
          toastVersion: version,
          toast: { id: version, message: 'הרשימה נשמרה' },
        }
      }),
    renameList: (id, value) => {
      let accepted = false
      set((state) => {
        const name = value.trim()
        if (
          !name ||
          name.length > 40 ||
          !state.market.watchlists.some((item) => item.id === id) ||
          state.market.watchlists.some(
            (item) =>
              item.id !== id &&
              item.name.toLocaleLowerCase() === name.toLocaleLowerCase(),
          )
        )
          return state
        accepted = true
        const version = state.toastVersion + 1
        return {
          market: {
            ...state.market,
            watchlists: state.market.watchlists.map((item) =>
              item.id === id ? { ...item, name } : item,
            ),
          },
          toastVersion: version,
          toast: { id: version, message: 'שם הרשימה עודכן' },
        }
      })
      return accepted
    },
    setDefaultList: (id) =>
      set((state) => {
        if (
          state.market.defaultWatchlistId === id ||
          !state.market.watchlists.some((item) => item.id === id)
        )
          return state
        const version = state.toastVersion + 1
        return {
          market: { ...state.market, defaultWatchlistId: id },
          toastVersion: version,
          toast: { id: version, message: 'רשימת ברירת המחדל עודכנה' },
        }
      }),
    deleteList: (id) =>
      set((state) => {
        if (
          state.market.watchlists.length <= 1 ||
          !state.market.watchlists.some((item) => item.id === id)
        )
          return state
        const watchlists = state.market.watchlists.filter(
          (item) => item.id !== id,
        )
        const defaultWatchlistId =
          state.market.defaultWatchlistId === id
            ? watchlists[0]!.id
            : state.market.defaultWatchlistId
        const version = state.toastVersion + 1
        return {
          market: {
            ...state.market,
            watchlists,
            defaultWatchlistId,
            activeWatchlistId:
              state.market.activeWatchlistId === id
                ? defaultWatchlistId
                : state.market.activeWatchlistId,
          },
          loadError: false,
          isSwitching: false,
          listLoadVersion: state.listLoadVersion + 1,
          toastVersion: version,
          toast: { id: version, message: 'הרשימה נמחקה' },
        }
      }),
    filters: { ...DEFAULT_FILTERS },
    sort: null,
    setSort: (sort) => set({ sort }),
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
