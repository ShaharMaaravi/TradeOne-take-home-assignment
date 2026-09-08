import { memo, useId } from 'react'
import {
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  ChevronDown,
} from 'lucide-react'
import type { Instrument } from '../domain/types'
import type { SortKey } from '../domain/view'
import { getQuoteMetrics } from '../domain/calculations'
import { formatChange, formatPercent, formatVolume } from '../domain/formatters'
import { useWatchlist } from '../state/useWatchlist'
import { SecurityLogo } from './SecurityLogo'
import { PriceCell } from './PriceCell'
import { DailyRangeBar, Sparkline, TrendBar } from './MarketVisuals'
import styles from './MobileWatchlist.module.css'

const sortOptions: readonly { key: SortKey; label: string }[] = [
  { key: 'identity', label: 'שם נייר' },
  { key: 'price', label: 'שער אחרון' },
  { key: 'change', label: 'שינוי' },
  { key: 'changePercent', label: '% שינוי' },
  { key: 'volume', label: 'מחזור' },
  { key: 'range', label: 'טווח יומי' },
  { key: 'intraday', label: 'גרף יומי' },
  { key: 'trend', label: 'בר מגמה' },
  { key: 'return30Day', label: 'תשואת 30 ימים' },
]

export function MobileSortControls() {
  const sort = useWatchlist((state) => state.sort)
  const setSort = useWatchlist((state) => state.setSort)
  const descending = sort?.direction === 'descending'
  const Icon = descending ? ArrowDownWideNarrow : ArrowUpNarrowWide
  return (
    <div className={styles.sort}>
      <label>
        מיון לפי
        <select
          value={sort?.key ?? ''}
          onChange={(event) =>
            setSort(
              event.target.value
                ? {
                    key: event.target.value as SortKey,
                    direction: sort?.direction ?? 'ascending',
                  }
                : null,
            )
          }
        >
          <option value="">סדר הרשימה</option>
          {sortOptions.map((option) => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <button
        disabled={!sort}
        onClick={() =>
          sort &&
          setSort({
            ...sort,
            direction: descending ? 'ascending' : 'descending',
          })
        }
        aria-label={
          descending ? 'סדר יורד — שנה לסדר עולה' : 'סדר עולה — שנה לסדר יורד'
        }
      >
        <Icon aria-hidden="true" />
        <span>{descending ? 'יורד' : 'עולה'}</span>
      </button>
    </div>
  )
}

const StockCard = memo(function StockCard({
  instrument,
}: {
  instrument: Instrument
}) {
  const quote = useWatchlist((state) => state.market.quotes[instrument.id])
  const titleId = useId()
  if (!quote) return null
  const metrics = getQuoteMetrics(quote)
  return (
    <article className={styles.card} aria-labelledby={titleId}>
      <div className={styles.cardHeader}>
        <div className={styles.identity}>
          <SecurityLogo instrument={instrument} />
          <div>
            <h2 id={titleId}>
              <bdi>{instrument.symbol}</bdi>
            </h2>
            <p>
              <bdi>{instrument.name}</bdi>
            </p>
          </div>
        </div>
        <div className={styles.price}>
          <span className="sr-only">שער אחרון</span>
          <PriceCell price={quote.price} instrument={instrument} />
          <span className={styles[metrics.dailyDirection]}>
            <span className="sr-only">שינוי יומי </span>
            <bdi dir="ltr">{formatPercent(metrics.changePercent)}</bdi>
          </span>
        </div>
      </div>
      <div className={styles.chart}>
        <Sparkline
          stretch
          prices={quote.intraday.map((point) => point.price)}
          direction={metrics.dailyDirection}
          label={`גרף יומי ${instrument.symbol}`}
        />
      </div>
      <details className={styles.details}>
        <summary>
          נתונים נוספים
          <span className="sr-only"> עבור {instrument.symbol}</span>
          <ChevronDown aria-hidden="true" />
        </summary>
        <dl className={styles.metrics}>
          <div>
            <dt>שינוי בערך</dt>
            <dd className={styles[metrics.dailyDirection]}>
              <bdi dir="ltr">
                {formatChange(metrics.change, instrument.priceDecimals)}
              </bdi>
            </dd>
          </div>
          <div>
            <dt>מחזור</dt>
            <dd>
              <bdi dir="ltr">{formatVolume(quote.volume)}</bdi>
            </dd>
          </div>
          <div className={styles.wide}>
            <dt>גבוה/נמוך יומי</dt>
            <dd>
              <DailyRangeBar
                quote={quote}
                decimals={instrument.priceDecimals}
              />
            </dd>
          </div>
          <div>
            <dt>בר מגמה</dt>
            <dd>
              <TrendBar trend={metrics.trend} />
            </dd>
          </div>
          <div>
            <dt>תשואת 30 ימים</dt>
            <dd
              className={
                metrics.return30DayPercent === null ||
                metrics.return30DayPercent === 0
                  ? styles.unchanged
                  : metrics.return30DayPercent > 0
                    ? styles.up
                    : styles.down
              }
            >
              <bdi dir="ltr">{formatPercent(metrics.return30DayPercent)}</bdi>
            </dd>
          </div>
        </dl>
      </details>
    </article>
  )
})

export function MobileWatchlist({
  instruments,
  instrumentIds,
}: {
  instruments: readonly Instrument[]
  instrumentIds: readonly string[]
}) {
  const catalogue = new Map(
    instruments.map((instrument) => [instrument.id, instrument]),
  )
  return (
    <section className={styles.cards} aria-label="ניירות ברשימת המעקב">
      {instrumentIds.map((id) => {
        const instrument = catalogue.get(id)
        return instrument ? (
          <StockCard key={id} instrument={instrument} />
        ) : null
      })}
    </section>
  )
}
