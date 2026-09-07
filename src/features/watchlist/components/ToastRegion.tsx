import { createPortal } from 'react-dom'
import { Check } from 'lucide-react'
import { useWatchlist } from '../state/useWatchlist'
import styles from './ToastRegion.module.css'

export function ToastRegion() {
  const toast = useWatchlist((state) => state.toast)
  return createPortal(
    <div
      className={styles.region}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {toast && (
        <div className={styles.toast} key={toast.id}>
          <Check aria-hidden="true" />
          <span>{toast.message}</span>
        </div>
      )}
    </div>,
    document.body,
  )
}
