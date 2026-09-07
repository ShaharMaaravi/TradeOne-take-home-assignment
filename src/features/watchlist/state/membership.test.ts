// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { createWatchlistStore } from './watchlistStore'

describe('list switching and membership', () => {
  it('switches only to valid lists and preserves filters and sort', () => {
    const store = createWatchlistStore(false)
    store.getState().setFilters({ query: 'aapl' })
    store.getState().cycleSort('price')
    const before = store.getState()
    store.getState().selectWatchlist('missing')
    expect(store.getState()).toBe(before)
    store.getState().selectWatchlist('general')
    expect(store.getState().isSwitching).toBe(true)
    expect(store.getState().market.activeWatchlistId).toBe('general')
    expect(store.getState().filters).toBe(before.filters)
    expect(store.getState().sort).toBe(before.sort)
    const switching = store.getState()
    store.getState().selectWatchlist('general')
    expect(store.getState()).toBe(switching)
  })
  it('ignores stale loading completions', () => {
    const store = createWatchlistStore(false)
    store.getState().selectWatchlist('general')
    const oldVersion = store.getState().listLoadVersion
    store.getState().selectWatchlist('empty')
    store.getState().completeListSwitch(oldVersion)
    expect(store.getState().isSwitching).toBe(true)
    store.getState().completeListSwitch(store.getState().listLoadVersion)
    expect(store.getState().isSwitching).toBe(false)
    expect(store.getState().market.activeWatchlistId).toBe('empty')
  })
  it('adds once at the top, preserves live quotes, and only changes the target list', () => {
    const store = createWatchlistStore()
    store.getState().advance()
    const before = store.getState()
    store.getState().setMembership('empty', 'us-nvda', true)
    const after = store.getState()
    expect(
      after.market.watchlists.find((list) => list.id === 'empty')!
        .instrumentIds,
    ).toEqual(['us-nvda'])
    expect(after.market.quotes).toBe(before.market.quotes)
    expect(after.market.watchlists.find((list) => list.id === 'general')).toBe(
      before.market.watchlists.find((list) => list.id === 'general'),
    )
    expect(
      before.market.watchlists.find((list) => list.id === 'empty')!
        .instrumentIds,
    ).toEqual([])
    expect(after.toast?.message).toContain('NVDA נוסף')
    store.getState().setMembership('empty', 'us-nvda', true)
    expect(store.getState()).toBe(after)
    store.getState().setMembership('empty', 'us-aapl', true)
    expect(
      store.getState().market.watchlists.find((list) => list.id === 'empty')!
        .instrumentIds,
    ).toEqual(['us-aapl', 'us-nvda'])
  })
  it('removes only from the explicitly targeted list, even after switching', () => {
    const store = createWatchlistStore(false)
    store.getState().selectWatchlist('empty')
    store.getState().setMembership('my-watchlist', 'us-aapl', false)
    expect(
      store
        .getState()
        .market.watchlists.find((list) => list.id === 'my-watchlist')!
        .instrumentIds,
    ).not.toContain('us-aapl')
    expect(
      store.getState().market.watchlists.find((list) => list.id === 'general')!
        .instrumentIds,
    ).toContain('us-aapl')
    expect(store.getState().toast?.message).toContain('My Watchlist 2')
  })
  it('rejects unknown IDs and ignores stale toast dismissals', () => {
    const store = createWatchlistStore(false)
    const initial = store.getState()
    store.getState().setMembership('missing', 'us-aapl', true)
    store.getState().setMembership('empty', 'missing', true)
    expect(store.getState()).toBe(initial)
    store.getState().setMembership('empty', 'us-aapl', true)
    const oldId = store.getState().toast!.id
    store.getState().setMembership('empty', 'us-nvda', true)
    store.getState().dismissToast(oldId)
    expect(store.getState().toast?.message).toContain('NVDA')
    store.getState().dismissToast(store.getState().toast!.id)
    expect(store.getState().toast).toBeNull()
  })
})
