import styles from './WatchlistSkeleton.module.css'

export function WatchlistSkeleton() {
  return (
    <div role="status" aria-label="טוען רשימת מעקב" className={styles.skeleton}>
      <span className="sr-only">טוען רשימת מעקב…</span>
      <div className={styles.header} aria-hidden="true" />
      {Array.from({ length: 8 }, (_, row) => (
        <div className={styles.row} key={row} aria-hidden="true">
          {Array.from({ length: 9 }, (_, cell) => (
            <span key={cell} />
          ))}
        </div>
      ))}
    </div>
  )
}
