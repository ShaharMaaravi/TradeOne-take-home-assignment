import { StrictMode } from 'react'
import { act, cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { WatchlistProvider } from './WatchlistProvider'
import {
  createWatchlistStore,
  LIST_SWITCH_MS,
  TOAST_DURATION_MS,
} from './watchlistStore'

beforeEach(() => vi.useFakeTimers())
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('transient state timers', () => {
  it('restarts loading for a newer selection and cleans up on unmount', () => {
    const store = createWatchlistStore(false)
    const { unmount } = render(
      <StrictMode>
        <WatchlistProvider store={store}>
          <div />
        </WatchlistProvider>
      </StrictMode>,
    )
    act(() => store.getState().selectWatchlist('general'))
    act(() => vi.advanceTimersByTime(200))
    act(() => store.getState().selectWatchlist('empty'))
    expect(vi.getTimerCount()).toBe(1)
    act(() => vi.advanceTimersByTime(LIST_SWITCH_MS - 200))
    expect(store.getState().isSwitching).toBe(true)
    act(() => vi.advanceTimersByTime(200))
    expect(store.getState().isSwitching).toBe(false)
    act(() => store.getState().setMembership('empty', 'us-nvda', true))
    expect(vi.getTimerCount()).toBe(1)
    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
  it('keeps a newer toast visible for its own full duration', () => {
    const store = createWatchlistStore(false)
    render(
      <WatchlistProvider store={store}>
        <div />
      </WatchlistProvider>,
    )
    act(() => store.getState().setMembership('empty', 'us-aapl', true))
    act(() => vi.advanceTimersByTime(TOAST_DURATION_MS - 100))
    act(() => store.getState().setMembership('empty', 'us-nvda', true))
    act(() => vi.advanceTimersByTime(100))
    expect(store.getState().toast?.message).toContain('NVDA')
    act(() => vi.advanceTimersByTime(TOAST_DURATION_MS - 100))
    expect(store.getState().toast).toBeNull()
    expect(vi.getTimerCount()).toBe(0)
  })
})
