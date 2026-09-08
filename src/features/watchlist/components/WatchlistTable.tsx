import { Ellipsis } from 'lucide-react'
import type { CSSProperties } from 'react'
import type { Instrument, InstrumentId } from '../domain/types'
import { getQuoteMetrics } from '../domain/calculations'
import { formatPercent, formatVolume } from '../domain/formatters'
import { DailyRangeBar, Sparkline, TrendBar } from './MarketVisuals'
import { memo } from 'react'
import { SortableColumnHeader } from './SortableColumnHeader'
import { SecurityLogo } from './SecurityLogo'
import { PriceCell } from './PriceCell'
import { useWatchlist } from '../state/useWatchlist'
import styles from './WatchlistTable.module.css'

interface WatchlistTableProps {
  instruments: readonly Instrument[]
  instrumentIds: readonly InstrumentId[]
}

const SecurityRow = memo(function SecurityRow({
  instrument,
}: {
  instrument: Instrument
}) {
  const quote = useWatchlist((state) => state.market.quotes[instrument.id])
  if (!quote) return null
  const metrics = getQuoteMetrics(quote)
  const changeClass = styles[metrics.dailyDirection]
  const returnClass =
    metrics.return30DayPercent === null || metrics.return30DayPercent === 0
      ? styles.unchanged
      : metrics.return30DayPercent > 0
        ? styles.up
        : styles.down
  return (
    <tr>
      <th scope="row" className={styles.identityCell}>
        <div className={styles.identity}>
          <SecurityLogo instrument={instrument} />
          <div className={styles.securityText}>
            <bdi className={styles.symbol}>{instrument.symbol}</bdi>
            <bdi className={styles.description}>{instrument.name}</bdi>
          </div>
        </div>
      </th>
      <td>
        <PriceCell price={quote.price} instrument={instrument} />
      </td>
      <td className={changeClass}>
        <bdi dir="ltr">{formatPercent(metrics.changePercent)}</bdi>
      </td>
      <td className={styles.desktopOnly}>
        <bdi dir="ltr">{formatVolume(quote.volume)}</bdi>
      </td>
      <td className={styles.desktopOnly}>
        <DailyRangeBar quote={quote} decimals={instrument.priceDecimals} />
      </td>
      <td>
        <Sparkline
          prices={quote.intraday.map((point) => point.price)}
          direction={metrics.dailyDirection}
          label={`גרף יומי ${instrument.symbol}`}
        />
      </td>
      <td className={styles.desktopOnly}>
        <TrendBar trend={metrics.trend} />
      </td>
      <td className={styles.desktopOnly}>
        <bdi dir="ltr" className={`${styles.returnBadge} ${returnClass}`}>
          {formatPercent(metrics.return30DayPercent)}
        </bdi>
      </td>
      <td className={styles.desktopOnly}>
        <button
          className={styles.rowActions}
          disabled
          aria-label={`פעולות ${instrument.symbol}`}
        >
          <Ellipsis aria-hidden="true" />
        </button>
      </td>
    </tr>
  )
})

export function WatchlistTable({
  instruments,
  instrumentIds,
}: WatchlistTableProps) {
  const instrumentsById = new Map(
    instruments.map((instrument) => [instrument.id, instrument]),
  )
  return (
    <div
      className={styles.tableScroll}
      role="region"
      aria-label="טבלת רשימת מעקב"
      tabIndex={0}
    >
      <table
        className={styles.table}
        data-fill={instrumentIds.length >= 6}
        style={{ '--row-count': instrumentIds.length } as CSSProperties}
      >
        <caption className="sr-only">
          ניירות הערך ברשימת המעקב — נתוני הדגמה
        </caption>
        <colgroup>
          <col className={styles.identityColumn} />
          <col className={styles.priceColumn} />
          <col className={styles.percentColumn} />
          <col className={`${styles.volumeColumn} ${styles.desktopOnly}`} />
          <col className={`${styles.rangeColumn} ${styles.desktopOnly}`} />
          <col className={styles.chartColumn} />
          <col className={`${styles.trendColumn} ${styles.desktopOnly}`} />
          <col className={`${styles.returnColumn} ${styles.desktopOnly}`} />
          <col className={`${styles.actionsColumn} ${styles.desktopOnly}`} />
        </colgroup>
        <thead>
          <tr>
            <SortableColumnHeader
              sortKey="identity"
              className={styles.identityCell}
            >
              שם (סימבול נייר/תיאור)
            </SortableColumnHeader>
            <SortableColumnHeader sortKey="price">
              שער אחרון
            </SortableColumnHeader>
            <SortableColumnHeader sortKey="changePercent">
              % שינוי
            </SortableColumnHeader>
            <SortableColumnHeader sortKey="volume" className={styles.desktopOnly}>מחזור</SortableColumnHeader>
            <SortableColumnHeader
              sortKey="range"
              className={styles.desktopOnly}
              hint="מיון לפי מיקום השער בטווח היומי"
            >
              גבוה/נמוך יומי
            </SortableColumnHeader>
            <SortableColumnHeader
              sortKey="intraday"
              hint="מיון לפי התשואה משער הפתיחה"
            >
              גרף יומי
            </SortableColumnHeader>
            <SortableColumnHeader
              sortKey="trend"
              className={styles.desktopOnly}
              hint="מיון לפי מספר העליות פחות מספר הירידות"
            >
              בר מגמה
            </SortableColumnHeader>
            <SortableColumnHeader sortKey="return30Day" className={styles.desktopOnly}>
              תשואת 30 ימים
            </SortableColumnHeader>
            <th scope="col" className={styles.desktopOnly}>
              <span className="sr-only">פעולות</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {instrumentIds.map((id) => {
            const instrument = instrumentsById.get(id)
            return instrument ? (
              <SecurityRow key={id} instrument={instrument} />
            ) : null
          })}
        </tbody>
      </table>
    </div>
  )
}
