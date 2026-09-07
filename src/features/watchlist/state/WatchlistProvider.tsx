import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useStore } from 'zustand'
import { createWatchlistStore, FEED_INTERVAL_MS } from './watchlistStore'
import type { WatchlistStore } from './watchlistStore'

import { WatchlistContext } from './useWatchlist'

function useMockFeed(store: WatchlistStore) {
  const isPlaying = useStore(store, (state) => state.isPlaying)
  useEffect(() => {
    if (!isPlaying) return
    let interval: ReturnType<typeof setInterval> | undefined
    const syncVisibility = () => {
      clearInterval(interval)
      interval = undefined
      if (!document.hidden)
        interval = setInterval(
          () => store.getState().advance(),
          FEED_INTERVAL_MS,
        )
    }
    syncVisibility()
    document.addEventListener('visibilitychange', syncVisibility)
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', syncVisibility)
    }
  }, [store, isPlaying])
}

export function WatchlistProvider({
  children,
  store: suppliedStore,
  initiallyPlaying = true,
}: {
  children: ReactNode
  store?: WatchlistStore
  initiallyPlaying?: boolean
}) {
  const [store] = useState(
    () => suppliedStore ?? createWatchlistStore(initiallyPlaying),
  )
  useMockFeed(store)
  return (
    <WatchlistContext.Provider value={store}>
      {children}
    </WatchlistContext.Provider>
  )
}
