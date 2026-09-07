import { createContext, useContext } from 'react'
import { useStore } from 'zustand'
import type { WatchlistState, WatchlistStore } from './watchlistStore'

export const WatchlistContext = createContext<WatchlistStore | null>(null)

export function useWatchlist<T>(selector: (state: WatchlistState) => T): T {
  const store = useContext(WatchlistContext)
  if (!store)
    throw new Error('useWatchlist must be used within WatchlistProvider')
  return useStore(store, selector)
}
