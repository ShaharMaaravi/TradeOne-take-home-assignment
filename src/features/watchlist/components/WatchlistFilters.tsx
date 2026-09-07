import { Search, X } from 'lucide-react'
import { useWatchlist } from '../state/useWatchlist'
import { activeFilterCount } from '../domain/view'
import type { WatchlistFilters as Filters } from '../domain/view'
import styles from './WatchlistFilters.module.css'

export function WatchlistFilters() {
  const filters = useWatchlist((state) => state.filters)
  const setFilters = useWatchlist((state) => state.setFilters)
  const resetFilters = useWatchlist((state) => state.resetFilters)
  return (
    <section
      id="watchlist-filters"
      className={styles.filters}
      aria-label="סינון רשימת מעקב"
    >
      <label className={styles.search}>
        <span className="sr-only">חיפוש ברשימה</span>
        <Search aria-hidden="true" />
        <input
          type="search"
          value={filters.query}
          onChange={(event) => setFilters({ query: event.target.value })}
          placeholder="חיפוש שם או סימבול ברשימה"
        />
      </label>
      <label>
        שוק
        <select
          value={filters.market}
          onChange={(event) =>
            setFilters({ market: event.target.value as Filters['market'] })
          }
        >
          <option value="all">כל השווקים</option>
          <option value="IL">ישראל</option>
          <option value="US">ארה״ב</option>
        </select>
      </label>
      <label>
        סוג נייר
        <select
          value={filters.type}
          onChange={(event) =>
            setFilters({ type: event.target.value as Filters['type'] })
          }
        >
          <option value="all">כל הסוגים</option>
          <option value="stock">מניות</option>
          <option value="etf">קרנות סל</option>
        </select>
      </label>
      <label>
        שינוי יומי
        <select
          value={filters.performance}
          onChange={(event) =>
            setFilters({
              performance: event.target.value as Filters['performance'],
            })
          }
        >
          <option value="all">כל השינויים</option>
          <option value="gainers">עולות</option>
          <option value="losers">יורדות</option>
          <option value="unchanged">ללא שינוי</option>
        </select>
      </label>
      <button
        onClick={resetFilters}
        disabled={activeFilterCount(filters) === 0}
        className={styles.reset}
      >
        <X aria-hidden="true" />
        נקה סינון
      </button>
    </section>
  )
}
