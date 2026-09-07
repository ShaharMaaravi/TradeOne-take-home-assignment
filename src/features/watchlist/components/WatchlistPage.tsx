import { useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { Plus, SlidersHorizontal } from 'lucide-react'
import { useWatchlist } from '../state/useWatchlist'
import { RecoveryMessage } from '../../../components/ui/RecoveryMessage'
import { ListActions } from './ListActions'
import { WatchlistSelector } from './WatchlistSelector'
import { AddSecurityDialog } from './AddSecurityDialog'
import { WatchlistSkeleton } from './WatchlistSkeleton'
import { WatchlistTable } from './WatchlistTable'
import { WatchlistFilters } from './WatchlistFilters'
import { WatchlistEmptyState } from './WatchlistEmptyState'
import { activeFilterCount, selectVisibleInstrumentIds } from '../domain/view'
import styles from './WatchlistPage.module.css'

export function WatchlistPage() {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const addButtonRef = useRef<HTMLButtonElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)
  const loadError = useWatchlist((state) => state.loadError)
  const retryListLoad = useWatchlist((state) => state.retryListLoad)
  const isSwitching = useWatchlist((state) => state.isSwitching)
  const openAdd = (trigger: HTMLElement) => {
    returnFocusRef.current = trigger
    setAddOpen(true)
  }
  const restoreFocus = () => {
    ;(returnFocusRef.current?.isConnected
      ? returnFocusRef.current
      : addButtonRef.current
    )?.focus()
  }
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
        <WatchlistSelector />
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
          <button
            ref={addButtonRef}
            className={styles.addButton}
            disabled={isSwitching || loadError}
            onClick={(event) => openAdd(event.currentTarget)}
          >
            <span>הוסף נייר</span>
            <Plus aria-hidden="true" />
          </button>
          <ListActions />
        </div>
      </div>
      {filtersOpen && <WatchlistFilters />}
      <div aria-busy={isSwitching}>
        {isSwitching ? (
          <WatchlistSkeleton />
        ) : loadError ? (
          <RecoveryMessage
            title="לא ניתן לטעון את רשימת המעקב"
            description="טעינת הנתונים נכשלה. אפשר לנסות שוב."
            onRetry={() => {
              retryListLoad()
              addButtonRef.current?.closest('main')?.focus()
            }}
          />
        ) : visibleIds.length > 0 ? (
          <WatchlistTable
            instruments={instruments}
            instrumentIds={visibleIds}
          />
        ) : (
          <WatchlistEmptyState
            isEmptyList={activeList.instrumentIds.length === 0}
            onReset={resetFilters}
            onAdd={openAdd}
          />
        )}
      </div>
      {addOpen && (
        <AddSecurityDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          listId={activeList.id}
          restoreFocus={restoreFocus}
        />
      )}
    </main>
  )
}
