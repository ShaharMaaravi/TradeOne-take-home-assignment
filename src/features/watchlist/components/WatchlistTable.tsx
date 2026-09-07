import { CircleHelp, Ellipsis } from 'lucide-react'
import type { Instrument, InstrumentId, Quote } from '../domain/types'
import { getQuoteMetrics } from '../domain/calculations'
import {
  formatChange,
  formatPercent,
  formatPrice,
  formatVolume,
  getPriceUnitLabel,
} from '../domain/formatters'
import { DailyRangeBar, Sparkline, TrendBar } from './MarketVisuals'
import { SecurityLogo } from './SecurityLogo'
import styles from './WatchlistTable.module.css'

interface WatchlistTableProps {
  instruments: readonly Instrument[]
  quotes: Readonly<Record<InstrumentId, Quote>>
  instrumentIds: readonly InstrumentId[]
}

function SecurityRow({
  instrument,
  quote,
}: {
  instrument: Instrument
  quote: Quote
}) {
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
        <span className={styles.price}>
          <bdi dir="ltr">
            {formatPrice(quote.price, instrument.priceDecimals)}
          </bdi>
          <span className={styles.unit}>{getPriceUnitLabel(instrument)}</span>
        </span>
      </td>
      <td className={changeClass}>
        <bdi dir="ltr">
          {formatChange(metrics.change, instrument.priceDecimals)}
        </bdi>
      </td>
      <td className={changeClass}>
        <bdi dir="ltr">{formatPercent(metrics.changePercent)}</bdi>
      </td>
      <td>
        <bdi dir="ltr">{formatVolume(quote.volume)}</bdi>
      </td>
      <td>
        <DailyRangeBar quote={quote} decimals={instrument.priceDecimals} />
      </td>
      <td>
        <Sparkline
          prices={quote.intraday.map((point) => point.price)}
          direction={metrics.dailyDirection}
          label={`גרף יומי ${instrument.symbol}`}
        />
      </td>
      <td>
        <TrendBar trend={metrics.trend} />
      </td>
      <td>
        <bdi dir="ltr" className={`${styles.returnBadge} ${returnClass}`}>
          {formatPercent(metrics.return30DayPercent)}
        </bdi>
      </td>
      <td>
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
}

export function WatchlistTable({
  instruments,
  quotes,
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
      <table className={styles.table}>
        <caption className="sr-only">
          ניירות הערך ברשימת המעקב — נתוני הדגמה
        </caption>
        <colgroup>
          <col className={styles.identityColumn} />
          <col className={styles.priceColumn} />
          <col className={styles.changeColumn} />
          <col className={styles.percentColumn} />
          <col className={styles.volumeColumn} />
          <col className={styles.rangeColumn} />
          <col className={styles.chartColumn} />
          <col className={styles.trendColumn} />
          <col className={styles.returnColumn} />
          <col className={styles.actionsColumn} />
        </colgroup>
        <thead>
          <tr>
            <th scope="col" className={styles.identityCell}>
              שם (סימבול נייר/תיאור)
            </th>
            <th scope="col">שער אחרון</th>
            <th scope="col">שינוי</th>
            <th scope="col">% שינוי</th>
            <th scope="col">מחזור</th>
            <th scope="col">גבוה/נמוך יומי</th>
            <th scope="col">גרף יומי</th>
            <th scope="col">
              <span className={styles.trendHeading}>
                בר מגמה <CircleHelp aria-hidden="true" />
              </span>
            </th>
            <th scope="col">תשואת 30 ימים</th>
            <th scope="col">
              <span className="sr-only">פעולות</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {instrumentIds.map((id) => {
            const instrument = instrumentsById.get(id)
            const quote = quotes[id]
            return instrument && quote ? (
              <SecurityRow key={id} instrument={instrument} quote={quote} />
            ) : null
          })}
        </tbody>
      </table>
    </div>
  )
}
