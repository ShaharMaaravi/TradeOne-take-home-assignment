import { ChevronDown, Search, UserRound } from 'lucide-react'
import { MobileNavigation } from './MobileNavigation'
import styles from './AppShell.module.css'

export function TopBar() {
  return (
    <header className={styles.topbar}>
      <div className={styles.headingGroup}>
        <MobileNavigation />
        <h1 id="watchlist-title">רשימות מעקב</h1>
      </div>
      <div className={styles.globalSearch}>
        <Search aria-hidden="true" />
        <input
          aria-label="חיפוש נייר ערך"
          placeholder="חיפוש נייר ערך, סימבול או שם נייר"
          disabled
        />
        <kbd aria-hidden="true">/</kbd>
      </div>
      <button className={styles.account} disabled aria-label="חשבון הדגמה">
        <span className={styles.avatar}>
          <UserRound aria-hidden="true" />
        </span>
        <span>
          <strong>הדגמה</strong>
          <small dir="ltr">155-1440</small>
        </span>
        <ChevronDown aria-hidden="true" />
      </button>
    </header>
  )
}
