import { ChevronDown, ListFilter, Plus } from 'lucide-react'
import { useWatchlist } from '../state/useWatchlist'
import { WatchlistTable } from './WatchlistTable'
import styles from './WatchlistPage.module.css'

export function WatchlistPage() {
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
      <WatchlistTable
        instruments={instruments}
        instrumentIds={activeList.instrumentIds}
      />
    </main>
  )
}
