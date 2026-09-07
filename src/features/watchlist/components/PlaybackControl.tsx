import { Pause, Play } from 'lucide-react'
import { useWatchlist } from '../state/useWatchlist'
import styles from './PlaybackControl.module.css'

export function PlaybackControl() {
  const isPlaying = useWatchlist((state) => state.isPlaying)
  const togglePlayback = useWatchlist((state) => state.togglePlayback)
  const Icon = isPlaying ? Pause : Play
  return (
    <button
      className={styles.control}
      onClick={togglePlayback}
      aria-label={isPlaying ? 'השהה עדכוני מחירים' : 'המשך עדכוני מחירים'}
    >
      <span
        className={styles.dot}
        data-playing={isPlaying}
        aria-hidden="true"
      />
      <span>
        {isPlaying
          ? 'נתוני הדגמה · עדכונים חיים'
          : 'נתוני הדגמה · עדכונים מושהים'}
      </span>
      <Icon aria-hidden="true" />
    </button>
  )
}
