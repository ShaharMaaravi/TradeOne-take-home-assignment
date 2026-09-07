import { ChevronDown, ListFilter, Plus } from 'lucide-react'
import { createMockMarket } from '../mock/market'
import { WatchlistTable } from './WatchlistTable'
import styles from './WatchlistPage.module.css'

// A frozen snapshot keeps this visual checkpoint reproducible. Live state comes next.
const market = createMockMarket()
const activeList = market.watchlists.find(
  (list) => list.id === market.activeWatchlistId,
)!

export function WatchlistPage() {
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
        instruments={market.instruments}
        quotes={market.quotes}
        instrumentIds={activeList.instrumentIds}
      />
    </main>
  )
}
