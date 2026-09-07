import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Check, ChevronDown } from 'lucide-react'
import { useWatchlist } from '../state/useWatchlist'
import { SecurityLogo } from './SecurityLogo'
import toolbarStyles from './WatchlistPage.module.css'
import styles from './WatchlistSelector.module.css'

export function WatchlistSelector() {
  const lists = useWatchlist((state) => state.market.watchlists)
  const activeId = useWatchlist((state) => state.market.activeWatchlistId)
  const instruments = useWatchlist((state) => state.market.instruments)
  const selectWatchlist = useWatchlist((state) => state.selectWatchlist)
  const currentList = lists.find((list) => list.id === activeId)!
  const catalogue = new Map(
    instruments.map((instrument) => [instrument.id, instrument]),
  )
  return (
    <DropdownMenu.Root dir="rtl">
      <DropdownMenu.Trigger
        className={toolbarStyles.listSelector}
        aria-label={`רשימת מעקב: ${currentList.name}`}
      >
        <bdi>{currentList.name}</bdi>
        <ChevronDown aria-hidden="true" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={styles.menu}
          align="start"
          sideOffset={6}
          collisionPadding={12}
          aria-label="בחירת רשימת מעקב"
        >
          <DropdownMenu.RadioGroup
            value={activeId}
            onValueChange={selectWatchlist}
          >
            {lists.map((list) => (
              <DropdownMenu.RadioItem
                key={list.id}
                value={list.id}
                className={styles.item}
                textValue={list.name}
              >
                <span className={styles.name}>
                  <bdi>{list.name}</bdi>
                </span>
                <span className={styles.preview} aria-hidden="true">
                  {list.instrumentIds.slice(0, 3).map((id) => {
                    const instrument = catalogue.get(id)
                    return instrument ? (
                      <SecurityLogo key={id} instrument={instrument} />
                    ) : null
                  })}
                  {list.instrumentIds.length > 3 && (
                    <span className={styles.more}>
                      +{list.instrumentIds.length - 3}
                    </span>
                  )}
                </span>
                <DropdownMenu.ItemIndicator className={styles.check}>
                  <Check aria-hidden="true" />
                </DropdownMenu.ItemIndicator>
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
