import { act, cleanup, render } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { StrictMode } from 'react'
import { createWatchlistStore, LIST_SWITCH_MS } from './watchlistStore'
import { WatchlistProvider } from './WatchlistProvider'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})
it('fails once and retries without replacing session data under StrictMode', () => {
  vi.useFakeTimers()
  const store = createWatchlistStore(false, true)
  render(
    <StrictMode>
      <WatchlistProvider store={store}>
        <div />
      </WatchlistProvider>
    </StrictMode>,
  )
  act(() => vi.advanceTimersByTime(LIST_SWITCH_MS))
  expect(store.getState().loadError).toBe(true)
  act(() => {
    store.getState().setMembership('empty', 'us-nvda', true)
    store.getState().setFilters({ query: 'MSFT' })
    store.getState().cycleSort('price')
  })
  const before = store.getState()
  act(() => store.getState().retryListLoad())
  expect(store.getState().isSwitching).toBe(true)
  act(() => vi.advanceTimersByTime(LIST_SWITCH_MS))
  expect(store.getState().loadError).toBe(false)
  expect(store.getState().market).toBe(before.market)
  expect(store.getState().filters).toBe(before.filters)
  expect(store.getState().sort).toBe(before.sort)
})
it('ignores stale completions and allows choosing another list after failure', () => {
  const store = createWatchlistStore(false, true)
  store.getState().completeListSwitch(99)
  expect(store.getState().isSwitching).toBe(true)
  store.getState().completeListSwitch(0)
  expect(store.getState().loadError).toBe(true)
  store.getState().selectWatchlist('general')
  expect(store.getState().loadError).toBe(false)
  store.getState().completeListSwitch(0)
  expect(store.getState().isSwitching).toBe(true)
  store.getState().completeListSwitch(1)
  expect(store.getState().isSwitching).toBe(false)
  expect(store.getState().market.activeWatchlistId).toBe('general')
})
