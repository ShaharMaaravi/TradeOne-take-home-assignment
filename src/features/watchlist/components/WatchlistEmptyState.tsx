import { ListX, SearchX } from 'lucide-react'
import styles from './WatchlistEmptyState.module.css'

export function WatchlistEmptyState({
  isEmptyList,
  onReset,
}: {
  isEmptyList: boolean
  onReset: () => void
}) {
  const Icon = isEmptyList ? ListX : SearchX
  return (
    <section className={styles.empty} aria-labelledby="empty-title">
      <Icon aria-hidden="true" />
      <h2 id="empty-title">
        {isEmptyList ? 'רשימת המעקב ריקה' : 'לא נמצאו ניירות ערך'}
      </h2>
      <p>
        {isEmptyList
          ? 'ניירות ערך שתוסיפו לרשימה יופיעו כאן.'
          : 'נסו לשנות את החיפוש או לנקות את הסינון.'}
      </p>
      {!isEmptyList && <button onClick={onReset}>נקה סינון</button>}
    </section>
  )
}
