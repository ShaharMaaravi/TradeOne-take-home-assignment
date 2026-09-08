import { useId } from 'react'
import { useSparklineMotion } from './useSparklineMotion'
import type { CSSProperties } from 'react'
import type { Direction, Quote } from '../domain/types'
import { formatPrice } from '../domain/formatters'
import { getRangePosition } from '../domain/calculations'
import styles from './MarketVisuals.module.css'

interface SparklineProps {
  prices: readonly number[]
  direction: Direction
  label: string
  filled?: boolean
}

/** Prices progress left to right, regardless of the page's text direction. */
export function Sparkline({
  prices,
  direction,
  label,
  filled = true,
}: SparklineProps) {
  if (prices.length === 0 || prices.some((price) => !Number.isFinite(price))) {
    return (
      <span className={styles.unavailable} aria-label={`${label}: אין נתונים`}>
        —
      </span>
    )
  }
  return (
    <SparklineChart
      prices={prices}
      direction={direction}
      label={label}
      filled={filled}
    />
  )
}

function SparklineChart({ prices, direction, label, filled }: SparklineProps) {
  const gradientId = useId()
  const low = Math.min(...prices)
  const high = Math.max(...prices)
  const coordinates = prices.map((price, index) => [
    prices.length === 1 ? 50 : 2 + (index / (prices.length - 1)) * 96,
    high === low ? 20 : 35 - ((price - low) / (high - low)) * 30,
  ])
  const points = coordinates.map(([x, y]) => `${x},${y}`).join(' ')
  const { lineRef, areaRef } = useSparklineMotion(points)
  return (
    <svg
      viewBox="0 0 100 42"
      className={`${styles.sparkline} ${styles[direction]}`}
      role="img"
      aria-label={label}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.30" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.03" />
        </linearGradient>
      </defs>
      {filled && (
        <path
          ref={areaRef}
          d={`M 2,40 L ${coordinates.map(([x, y]) => `${x},${y}`).join(' L ')} L 98,40 Z`}
          fill={`url(#${gradientId})`}
        />
      )}
      <line
        x1="2"
        y1="40"
        x2="98"
        y2="40"
        stroke="currentColor"
        strokeOpacity="0.35"
        strokeDasharray="2 2"
      />
      {prices.length === 1 ? (
        <circle cx="50" cy="20" r="2" fill="currentColor" />
      ) : (
        <polyline
          ref={lineRef}
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}
    </svg>
  )
}

export function DailyRangeBar({
  quote,
  decimals,
}: {
  quote: Quote
  decimals: number
}) {
  const position = getRangePosition(quote.price, quote.dayLow, quote.dayHigh)
  return (
    <div
      className={styles.dailyRange}
      dir="ltr"
      role="img"
      aria-label={`טווח יומי: ${formatPrice(quote.dayLow, decimals)} עד ${formatPrice(quote.dayHigh, decimals)}`}
    >
      <div
        className={styles.rangeTrack}
        style={
          {
            '--position': `${(position ?? 0.5) * 100}%`,
            '--range-scale': position ?? 0.5,
          } as CSSProperties
        }
      >
        <span className={styles.rangeFill} />
        <span className={styles.rangeMarker} />
      </div>
      <div className={styles.rangeLabels}>
        <span>{formatPrice(quote.dayLow, decimals)}</span>
        <span>{formatPrice(quote.dayHigh, decimals)}</span>
      </div>
    </div>
  )
}

export function TrendBar({ trend }: { trend: readonly Direction[] }) {
  const up = trend.filter((direction) => direction === 'up').length
  const down = trend.filter((direction) => direction === 'down').length
  return (
    <div
      className={styles.trendBar}
      dir="ltr"
      role="img"
      aria-label={`מגמת ${trend.length} ימים: ${up} עליות, ${down} ירידות`}
    >
      {trend.map((direction, index) => (
        <span key={index} className={styles[direction]} />
      ))}
    </div>
  )
}
