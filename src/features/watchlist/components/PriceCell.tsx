import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { formatPrice, getPriceUnitLabel } from '../domain/formatters'
import type { Instrument } from '../domain/types'
import styles from './PriceCell.module.css'

export const PRICE_FLASH_MS = 650

export function PriceCell({
  price,
  instrument,
}: {
  price: number
  instrument: Instrument
}) {
  const previousPrice = useRef(price)
  const [flash, setFlash] = useState<{
    direction: 'up' | 'down'
    sequence: number
  } | null>(null)
  const sequence = useRef(0)

  useEffect(() => {
    if (price === previousPrice.current) return
    const direction = price > previousPrice.current ? 'up' : 'down'
    previousPrice.current = price
    setFlash({ direction, sequence: ++sequence.current })
    const timeout = setTimeout(() => setFlash(null), PRICE_FLASH_MS)
    return () => clearTimeout(timeout)
  }, [price])

  const Arrow = flash?.direction === 'down' ? ArrowDown : ArrowUp
  return (
    <span
      className={styles.price}
      data-direction={flash?.direction ?? 'unchanged'}
    >
      <span key={flash?.sequence ?? 'idle'} className={styles.value}>
        <bdi dir="ltr">{formatPrice(price, instrument.priceDecimals)}</bdi>
        <span className={styles.unit}>{getPriceUnitLabel(instrument)}</span>
      </span>
      <Arrow className={styles.arrow} aria-hidden="true" />
      {flash && (
        <span className="sr-only">
          {flash.direction === 'up' ? 'עלה בעדכון האחרון' : 'ירד בעדכון האחרון'}
        </span>
      )}
    </span>
  )
}
