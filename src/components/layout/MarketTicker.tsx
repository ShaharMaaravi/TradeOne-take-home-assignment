import { ChevronLeft, ChevronRight, Sun } from 'lucide-react'
import { Sparkline } from '../../features/watchlist/components/MarketVisuals'
import styles from './AppShell.module.css'

const indices = [
  {
    name: 'ת״א־35',
    value: '4,147.05',
    change: '-14.70 (-0.35%)',
    down: true,
    points: [12, 11, 13, 9, 8, 9, 6, 7, 4, 3, 4, 2],
  },
  {
    name: 'ת״א־125',
    value: '3,854.31',
    change: '-4.01 (-0.10%)',
    down: true,
    points: [10, 11, 10, 7, 6, 8, 5, 6, 5, 4, 4, 3],
  },
  {
    name: 'ת״א־90',
    value: '6,419.02',
    change: '+5.44 (+0.08%)',
    down: false,
    points: [2, 3, 2, 5, 4, 5, 5, 8, 7, 9, 8, 11],
  },
  {
    name: 'דולר / שקל',
    value: '3.354',
    change: '+0.007 (+0.21%)',
    down: false,
    points: [1, 2, 1, 3, 4, 3, 4, 7, 6, 8, 10, 11],
  },
]

export function MarketTicker() {
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
                  className={index.down ? styles.negative : styles.positive}
                >
                  {index.change}
                </span>
                <strong>{index.value}</strong>
              </div>
            </div>
            <Sparkline
              prices={index.points}
              direction={index.down ? 'down' : 'up'}
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
