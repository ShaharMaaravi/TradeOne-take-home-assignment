import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useStore } from 'zustand'
import {
  createWatchlistStore,
  FEED_INTERVAL_MS,
  LIST_SWITCH_MS,
  TOAST_DURATION_MS,
} from './watchlistStore'
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

function useTransientStates(store: WatchlistStore) {
  const isSwitching = useStore(store, (state) => state.isSwitching)
  const loadVersion = useStore(store, (state) => state.listLoadVersion)
  const toastId = useStore(store, (state) => state.toast?.id)
  useEffect(() => {
    if (!isSwitching) return
    const timeout = setTimeout(
      () => store.getState().completeListSwitch(loadVersion),
      LIST_SWITCH_MS,
    )
    return () => clearTimeout(timeout)
  }, [store, isSwitching, loadVersion])
  useEffect(() => {
    if (toastId === undefined) return
    const timeout = setTimeout(
      () => store.getState().dismissToast(toastId),
      TOAST_DURATION_MS,
    )
    return () => clearTimeout(timeout)
  }, [store, toastId])
}

export function WatchlistProvider({
  children,
  store: suppliedStore,
  initiallyPlaying = true,
  failInitialLoad = false,
}: {
  children: ReactNode
  store?: WatchlistStore
  initiallyPlaying?: boolean
  failInitialLoad?: boolean
}) {
  const [store] = useState(
    () =>
      suppliedStore ?? createWatchlistStore(initiallyPlaying, failInitialLoad),
  )
  useMockFeed(store)
  useTransientStates(store)
  return (
    <WatchlistContext.Provider value={store}>
      {children}
    </WatchlistContext.Provider>
  )
}
