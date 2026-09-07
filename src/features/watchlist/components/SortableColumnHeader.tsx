import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react'
import type { SortKey } from '../domain/view'
import { useWatchlist } from '../state/useWatchlist'
import styles from './WatchlistTable.module.css'

export function SortableColumnHeader({
  sortKey,
  children,
  hint,
  className,
}: {
  sortKey: SortKey
  children: string
  hint?: string
  className?: string
}) {
  const direction = useWatchlist((state) =>
    state.sort?.key === sortKey ? state.sort.direction : undefined,
  )
  const cycleSort = useWatchlist((state) => state.cycleSort)
  const Icon =
    direction === 'ascending'
      ? ArrowUp
      : direction === 'descending'
        ? ArrowDown
        : ChevronsUpDown
  return (
    <th scope="col" aria-sort={direction ?? 'none'} className={className}>
      <button
        className={styles.sortButton}
        data-active={Boolean(direction)}
        onClick={() => cycleSort(sortKey)}
        aria-label={`מיון לפי ${children}`}
        title={hint}
      >
        <span>{children}</span>
        <Icon aria-hidden="true" />
      </button>
    </th>
  )
}
