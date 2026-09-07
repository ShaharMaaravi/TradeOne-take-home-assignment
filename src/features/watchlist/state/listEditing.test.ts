import { describe, expect, it } from 'vitest'
import { createWatchlistStore } from './watchlistStore'

describe('list management', () => {
  it('saves a draft subset in manual order without overwriting live quotes', () => {
    const store = createWatchlistStore()
    const list = store.getState().market.watchlists[1]!
    const draft = [...list.instrumentIds].reverse().slice(1)
    store.getState().cycleSort('price')
    store.getState().advance()
    const quotes = store.getState().market.quotes
    store.getState().saveList(list.id, draft)
    expect(store.getState().market.watchlists[1]!.instrumentIds).toEqual(draft)
    expect(store.getState().market.quotes).toBe(quotes)
    expect(store.getState().sort).toBeNull()
  })
  it('rejects invalid and duplicate draft members', () => {
    const store = createWatchlistStore(false)
    const before = store.getState()
    const list = before.market.watchlists[1]!
    store.getState().saveList(list.id, ['missing'])
    store
      .getState()
      .saveList(list.id, [list.instrumentIds[0]!, list.instrumentIds[0]!])
    expect(store.getState()).toBe(before)
    store.getState().saveList(list.id, [])
    expect(store.getState().market.watchlists[1]!.instrumentIds).toEqual([])
  })
  it('validates and trims names without changing identity', () => {
    const store = createWatchlistStore(false)
    const rename = store.getState().renameList
    expect(rename('general', '  ')).toBe(false)
    expect(rename('general', 'x'.repeat(41))).toBe(false)
    expect(rename('general', 'ישראל')).toBe(false)
    expect(rename('missing', 'test')).toBe(false)
    expect(rename('general', '  תיק אישי  ')).toBe(true)
    expect(store.getState().market.watchlists[0]!.name).toBe('תיק אישי')
  })
  it('keeps active and default IDs valid through deletion and protects the final list', () => {
    const store = createWatchlistStore(false)
    store.getState().setDefaultList('israel')
    store.getState().deleteList('my-watchlist')
    expect(store.getState().market.activeWatchlistId).toBe('israel')
    store.getState().deleteList('israel')
    expect(store.getState().market.defaultWatchlistId).toBe('general')
    expect(store.getState().market.activeWatchlistId).toBe('general')
    store.getState().deleteList('empty')
    store.getState().deleteList('general')
    expect(store.getState().market.watchlists).toHaveLength(1)
  })
})
