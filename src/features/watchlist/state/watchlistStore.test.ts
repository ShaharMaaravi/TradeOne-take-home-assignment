// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { createWatchlistStore, FEED_INTERVAL_MS } from './watchlistStore'
import { DEFAULT_TIMESTAMP } from '../mock/market'

describe('live watchlist state', () => {
  it('replays the same feed sequence in independent stores', () => {
    const first = createWatchlistStore()
    const second = createWatchlistStore()
    for (let tick = 0; tick < 10; tick++) {
      first.getState().advance()
      second.getState().advance()
    }
    expect(first.getState().market).toEqual(second.getState().market)
    expect(first.getState().indices).toEqual(second.getState().indices)
    expect(first.getState().tickNumber).toBe(10)
    expect(
      Math.max(
        ...Object.values(first.getState().market.quotes).map(
          (q) => q.updatedAt,
        ),
      ),
    ).toBe(DEFAULT_TIMESTAMP + 10 * FEED_INTERVAL_MS)
  })
  it('preserves the entire snapshot while paused and continues on resume', () => {
    const store = createWatchlistStore(false)
    const paused = store.getState()
    store.getState().advance()
    expect(store.getState()).toBe(paused)
    store.getState().togglePlayback()
    store.getState().advance()
    expect(store.getState().tickNumber).toBe(1)
    expect(store.getState().market.quotes).not.toEqual(paused.market.quotes)
    expect(store.getState().market.watchlists).toBe(paused.market.watchlists)
    expect(store.getState().market.instruments).toBe(paused.market.instruments)
  })
  it('keeps ticker prices positive, correctly rounded, and history bounded', () => {
    const store = createWatchlistStore()
    const previousCloses = store
      .getState()
      .indices.map((index) => index.previousClose)
    for (let i = 0; i < 100; i++) store.getState().advance()
    expect(
      store.getState().indices.map((index) => index.previousClose),
    ).toEqual(previousCloses)
    for (const index of store.getState().indices) {
      expect(index.history).toHaveLength(30)
      expect(index.price).toBeGreaterThan(0)
      expect(index.price).toBe(Number(index.price.toFixed(index.decimals)))
      expect(index.history.at(-1)).toBe(index.price)
    }
  })
})
