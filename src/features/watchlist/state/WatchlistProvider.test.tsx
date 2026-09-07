import { StrictMode } from 'react'
import { act, cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { WatchlistProvider } from './WatchlistProvider'
import { useWatchlist } from './useWatchlist'
import { createWatchlistStore, FEED_INTERVAL_MS } from './watchlistStore'

beforeEach(() => vi.useFakeTimers())
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe('feed lifecycle', () => {
  it('runs only one timer under StrictMode and removes it on unmount', () => {
    const store = createWatchlistStore()
    const { unmount } = render(
      <StrictMode>
        <WatchlistProvider store={store}>
          <div />
        </WatchlistProvider>
      </StrictMode>,
    )
    expect(vi.getTimerCount()).toBe(1)
    act(() => vi.advanceTimersByTime(FEED_INTERVAL_MS * 3))
    expect(store.getState().tickNumber).toBe(3)
    unmount()
    expect(vi.getTimerCount()).toBe(0)
    act(() => vi.advanceTimersByTime(FEED_INTERVAL_MS * 3))
    expect(store.getState().tickNumber).toBe(3)
  })
  it('stops immediately on pause and resumes without a backlog', () => {
    const store = createWatchlistStore()
    render(
      <WatchlistProvider store={store}>
        <div />
      </WatchlistProvider>,
    )
    act(() => vi.advanceTimersByTime(FEED_INTERVAL_MS))
    act(() => store.getState().togglePlayback())
    expect(vi.getTimerCount()).toBe(0)
    act(() => vi.advanceTimersByTime(FEED_INTERVAL_MS * 10))
    expect(store.getState().tickNumber).toBe(1)
    act(() => store.getState().togglePlayback())
    act(() => vi.advanceTimersByTime(FEED_INTERVAL_MS))
    expect(store.getState().tickNumber).toBe(2)
  })
  it('suspends hidden tabs, resumes visible tabs, and removes its listener', () => {
    const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(true)
    const store = createWatchlistStore()
    const { unmount } = render(
      <WatchlistProvider store={store}>
        <div />
      </WatchlistProvider>,
    )
    expect(vi.getTimerCount()).toBe(0)
    hidden.mockReturnValue(false)
    act(() => document.dispatchEvent(new Event('visibilitychange')))
    act(() => vi.advanceTimersByTime(FEED_INTERVAL_MS))
    expect(store.getState().tickNumber).toBe(1)
    hidden.mockReturnValue(true)
    act(() => document.dispatchEvent(new Event('visibilitychange')))
    act(() => vi.advanceTimersByTime(FEED_INTERVAL_MS * 10))
    expect(store.getState().tickNumber).toBe(1)
    unmount()
    hidden.mockReturnValue(false)
    act(() => document.dispatchEvent(new Event('visibilitychange')))
    expect(vi.getTimerCount()).toBe(0)
  })
  it('does not rerender an untouched quote subscriber', () => {
    const store = createWatchlistStore(false)
    const renders = vi.fn()
    function QuoteProbe() {
      const quote = useWatchlist((state) => state.market.quotes['us-msft'])
      renders(quote)
      return null
    }
    render(
      <WatchlistProvider store={store}>
        <QuoteProbe />
      </WatchlistProvider>,
    )
    act(() =>
      store.setState((state) => ({
        market: {
          ...state.market,
          quotes: {
            ...state.market.quotes,
            'us-aapl': { ...state.market.quotes['us-aapl']!, price: 400 },
          },
        },
      })),
    )
    expect(renders).toHaveBeenCalledTimes(1)
  })
})
