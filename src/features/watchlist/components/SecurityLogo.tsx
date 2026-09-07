import { useState } from 'react'
import type { Instrument } from '../domain/types'
import styles from './SecurityLogo.module.css'

const artwork: Record<
  string,
  { file?: string; label?: string; color: string; background?: string }
> = {
  'us-aapl': { file: 'apple', color: '#989b9c' },
  'us-meta': { file: 'meta', color: '#087fc1' },
  'us-shop': { file: 'shopify', color: '#89b438' },
  'il-doral': { label: 'דוראל', color: '#fff', background: '#173780' },
  'il-dalia': { label: '✦', color: '#fff', background: '#73a747' },
  'us-d': { label: 'D', color: '#fff', background: '#1687bb' },
  'il-poalim': { label: '◆', color: '#e31c39' },
  'il-yuval': { label: 'יובלים', color: '#9a313d' },
  'us-a': { label: 'A', color: '#fff', background: '#009bda' },
  'il-amot': { label: 'א', color: '#526e89', background: '#edf2f5' },
}

export function SecurityLogo({ instrument }: { instrument: Instrument }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const mark = artwork[instrument.id]
  const src =
    instrument.logoUrl ?? (mark?.file ? `/logos/${mark.file}.svg` : undefined)
  if (src && failedUrl !== src) {
    return (
      <img
        className={styles.logo}
        src={src}
        alt=""
        width="26"
        height="26"
        onError={() => setFailedUrl(src)}
      />
    )
  }
  if (instrument.id === 'us-msft') {
    return (
      <span className={`${styles.logo} ${styles.microsoft}`} aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
    )
  }
  return (
    <span
      className={`${styles.logo} ${styles.fallback}`}
      style={{ color: mark?.color, background: mark?.background }}
      aria-hidden="true"
    >
      {mark?.label ?? instrument.symbol.slice(0, 2)}
    </span>
  )
}
