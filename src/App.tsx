import { RenderErrorBoundary } from './components/ui/RenderErrorBoundary'
import { AppShell } from './components/layout/AppShell'
import { WatchlistPage } from './features/watchlist/components/WatchlistPage'
import { WatchlistProvider } from './features/watchlist/state/WatchlistProvider'

export default function App() {
  const initiallyPlaying =
    new URLSearchParams(window.location.search).get('live') !== '0'
  return (
    <WatchlistProvider
      initiallyPlaying={initiallyPlaying}
      failInitialLoad={
        new URLSearchParams(window.location.search).get('scenario') ===
        'load-error'
      }
    >
      <RenderErrorBoundary>
        <AppShell>
          <WatchlistPage />
        </AppShell>
      </RenderErrorBoundary>
    </WatchlistProvider>
  )
}
