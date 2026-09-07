import { useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { ChevronDown, ListFilter, Plus, SlidersHorizontal } from 'lucide-react'
import { useWatchlist } from '../state/useWatchlist'
import { WatchlistTable } from './WatchlistTable'
import { WatchlistFilters } from './WatchlistFilters'
import { WatchlistEmptyState } from './WatchlistEmptyState'
import { activeFilterCount, selectVisibleInstrumentIds } from '../domain/view'
import styles from './WatchlistPage.module.css'

export function WatchlistPage() {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const filterCount = useWatchlist((state) => activeFilterCount(state.filters))
  const resetFilters = useWatchlist((state) => state.resetFilters)
  const visibleIds = useWatchlist(
    useShallow((state) =>
      selectVisibleInstrumentIds(state.market, state.filters, state.sort),
    ),
  )
  const instruments = useWatchlist((state) => state.market.instruments)
  const activeList = useWatchlist(
    (state) =>
      state.market.watchlists.find(
        (list) => list.id === state.market.activeWatchlistId,
      )!,
  )
  return (
    <main id="watchlist" tabIndex={-1} aria-labelledby="watchlist-title">
      <div className={styles.toolbar}>
        <button
          className={styles.listSelector}
          disabled
          aria-label={`רשימת מעקב: ${activeList.name}`}
        >
          <bdi>{activeList.name}</bdi>
          <ChevronDown aria-hidden="true" />
        </button>
        <div className={styles.toolbarActions}>
          <button
            className={styles.listActions}
            aria-label="סינון רשימת מעקב"
            aria-expanded={filtersOpen}
            aria-description={`${filterCount} מסננים פעילים`}
            aria-controls="watchlist-filters"
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            <SlidersHorizontal aria-hidden="true" />
            {filterCount > 0 && (
              <span className={styles.filterBadge} aria-hidden="true">
                {filterCount}
              </span>
            )}
          </button>
          <button className={styles.addButton} disabled>
            <span>הוסף נייר</span>
            <Plus aria-hidden="true" />
          </button>
          <button
            className={styles.listActions}
            disabled
            aria-label="פעולות רשימה"
          >
            <ListFilter aria-hidden="true" />
          </button>
        </div>
      </div>
      {filtersOpen && <WatchlistFilters />}
      {visibleIds.length > 0 ? (
        <WatchlistTable instruments={instruments} instrumentIds={visibleIds} />
      ) : (
        <WatchlistEmptyState
          isEmptyList={activeList.instrumentIds.length === 0}
          onReset={resetFilters}
        />
      )}
    </main>
  )
}
