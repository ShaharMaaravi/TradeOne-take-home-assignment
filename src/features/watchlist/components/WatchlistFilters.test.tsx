import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { WatchlistPage } from './WatchlistPage'
import { WatchlistProvider } from '../state/WatchlistProvider'
import { createWatchlistStore } from '../state/watchlistStore'

describe('watchlist filtering states', () => {
  it('shows an empty-list state independently of active filters', () => {
    const store = createWatchlistStore(false)
    store.setState((state) => ({
      market: { ...state.market, activeWatchlistId: 'empty' },
    }))
    store.getState().setFilters({ query: 'nothing' })
    render(
      <WatchlistProvider store={store}>
        <WatchlistPage />
      </WatchlistProvider>,
    )
    expect(
      screen.getByRole('heading', { name: 'רשימת המעקב ריקה' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'נקה סינון' }),
    ).not.toBeInTheDocument()
  })
  it('can recover from no matches while retaining the selected sort', async () => {
    const user = userEvent.setup()
    const store = createWatchlistStore(false)
    store.getState().cycleSort('price')
    store.getState().setFilters({ query: 'not-a-security' })
    render(
      <WatchlistProvider store={store}>
        <WatchlistPage />
      </WatchlistProvider>,
    )
    expect(
      screen.getByRole('heading', { name: 'לא נמצאו ניירות ערך' }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'נקה סינון' }))
    expect(screen.getAllByRole('row')).toHaveLength(12)
    expect(store.getState().sort).toEqual({
      key: 'price',
      direction: 'ascending',
    })
  })
})
