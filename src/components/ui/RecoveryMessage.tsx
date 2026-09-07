import { CircleAlert } from 'lucide-react'
import styles from './RecoveryMessage.module.css'

export function RecoveryMessage({
  title,
  description,
  onRetry,
}: {
  title: string
  description: string
  onRetry: () => void
}) {
  return (
    <section className={styles.message}>
      <CircleAlert aria-hidden="true" />
      <div role="alert">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <button onClick={onRetry}>נסה שוב</button>
    </section>
  )
}
