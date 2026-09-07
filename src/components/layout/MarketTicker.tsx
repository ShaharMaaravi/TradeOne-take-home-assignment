import { ChevronLeft, ChevronRight, Sun } from 'lucide-react'
import { Sparkline } from '../../features/watchlist/components/MarketVisuals'
import styles from './AppShell.module.css'
import { useWatchlist } from '../../features/watchlist/state/useWatchlist'
import {
  getDirection,
  getPercentageChange,
} from '../../features/watchlist/domain/calculations'
import {
  formatChange,
  formatPercent,
  formatPrice,
} from '../../features/watchlist/domain/formatters'

export function MarketTicker() {
  const indices = useWatchlist((state) => state.indices)
  return (
    <footer className={styles.footer} aria-label="מדדי שוק — נתוני הדגמה">
      <div className={styles.marketPicker}>
        <button aria-label="שוק קודם" disabled>
          <ChevronRight aria-hidden="true" />
        </button>
        <span>ישראל</span>
        <button aria-label="שוק הבא" disabled>
          <ChevronLeft aria-hidden="true" />
        </button>
      </div>
      <div className={styles.tickerTrack}>
        {indices.map((index) => (
          <div className={styles.tickerItem} key={index.name}>
            <span className={styles.indexLogo} aria-hidden="true">
              תא
            </span>
            <div className={styles.indexNumbers}>
              <span>{index.name}</span>
              <div dir="ltr">
                <span
                  className={
                    index.price < index.previousClose
                      ? styles.negative
                      : index.price > index.previousClose
                        ? styles.positive
                        : undefined
                  }
                >
                  {formatChange(
                    index.price - index.previousClose,
                    index.decimals,
                  )}{' '}
                  (
                  {formatPercent(
                    getPercentageChange(index.price, index.previousClose),
                  )}
                  )
                </span>
                <strong>{formatPrice(index.price, index.decimals)}</strong>
              </div>
            </div>
            <Sparkline
              prices={index.history}
              direction={getDirection(index.price, index.previousClose)}
              label={`מגמת ${index.name}`}
              filled={false}
            />
          </div>
        ))}
      </div>
      <Sun className={styles.themeIcon} aria-label="תצוגה בהירה" />
    </footer>
  )
}
