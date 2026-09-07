import type { ReactNode } from 'react'
import { Info } from 'lucide-react'
import { ToastRegion } from '../../features/watchlist/components/ToastRegion'
import { PlaybackControl } from '../../features/watchlist/components/PlaybackControl'
import { NavigationSidebar } from './NavigationSidebar'
import { TopBar } from './TopBar'
import { MarketTicker } from './MarketTicker'
import styles from './AppShell.module.css'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <a className={styles.skipLink} href="#watchlist">
        דלג לרשימת המעקב
      </a>
      <NavigationSidebar />
      <div className={styles.workspace}>
        <TopBar />
        {children}
      </div>
      <div className={styles.statusBar}>
        <PlaybackControl />
        <span className={styles.poweredBy}>
          <span className={styles.providerMark} aria-hidden="true">
            ↗
          </span>
          נתוני שוק מוצגים להמחשה בלבד <Info aria-hidden="true" />
        </span>
      </div>
      <MarketTicker />
      <ToastRegion />
    </div>
  )
}
