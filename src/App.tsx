import { AppShell } from './components/layout/AppShell'
import { WatchlistPage } from './features/watchlist/components/WatchlistPage'
import { WatchlistProvider } from './features/watchlist/state/WatchlistProvider'

export default function App() {
  const initiallyPlaying =
    new URLSearchParams(window.location.search).get('live') !== '0'
  return (
    <WatchlistProvider initiallyPlaying={initiallyPlaying}>
      <AppShell>
        <WatchlistPage />
      </AppShell>
    </WatchlistProvider>
  )
}
