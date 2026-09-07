import { useRef, useState } from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import { Heart, Search } from 'lucide-react'
import { Modal } from '../../../components/ui/Modal'
import { useWatchlist } from '../state/useWatchlist'
import { searchCatalogue } from '../domain/catalogue'
import type { CatalogueCategory } from '../domain/catalogue'
import styles from './AddSecurityDialog.module.css'

const categories: { value: CatalogueCategory; label: string }[] = [
  { value: 'all', label: 'הכל' },
  { value: 'stock', label: 'מניות' },
  { value: 'etf', label: 'קרנות סל' },
]

export function AddSecurityDialog({
  open,
  onOpenChange,
  listId,
  restoreFocus,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  listId: string
  restoreFocus: () => void
}) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<CatalogueCategory>('all')
  const searchRef = useRef<HTMLInputElement>(null)
  const instruments = useWatchlist((state) => state.market.instruments)
  const list = useWatchlist((state) =>
    state.market.watchlists.find((item) => item.id === listId),
  )
  const setMembership = useWatchlist((state) => state.setMembership)
  const toast = useWatchlist((state) => state.toast)
  if (!list) return null
  const results = searchCatalogue(instruments, query, category)
  const membership = new Set(list.instrumentIds)
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="הוספת נייר לרשימה"
      description={`חיפוש ניירות ערך והוספתם לרשימת ${list.name}`}
      initialFocusRef={searchRef}
      restoreFocus={restoreFocus}
    >
      <label className={styles.search}>
        <Search aria-hidden="true" />
        <span className="sr-only">חיפוש ניירות ערך</span>
        <input
          ref={searchRef}
          type="search"
          placeholder="חיפוש נייר ערך, סימבול או שם נייר"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      <Tabs.Root
        dir="rtl"
        value={category}
        onValueChange={(value) => setCategory(value as CatalogueCategory)}
        className={styles.tabs}
      >
        <Tabs.List className={styles.tabList} aria-label="סוג נייר ערך">
          {categories.map((item) => (
            <Tabs.Trigger
              key={item.value}
              value={item.value}
              className={styles.tab}
            >
              {item.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        <Tabs.Content value={category} className={styles.panel}>
          <p className={styles.resultsHeading}>
            ניירות ערך זמינים <span>{results.length}</span>
          </p>
          <div className={styles.results}>
            {results.length > 0 ? (
              <ul className={styles.list}>
                {results.map((instrument) => {
                  const included = membership.has(instrument.id)
                  return (
                    <li key={instrument.id} className={styles.row}>
                      <div className={styles.identity}>
                        <bdi>{instrument.symbol}</bdi>
                        <bdi className={styles.description}>
                          {instrument.name}
                        </bdi>
                      </div>
                      <span
                        className={styles.market}
                        role="img"
                        aria-label={
                          instrument.market === 'IL' ? 'ישראל' : 'ארצות הברית'
                        }
                      >
                        {instrument.market === 'IL' ? '🇮🇱' : '🇺🇸'}
                      </span>
                      <button
                        className={styles.heart}
                        aria-label={`מעקב אחר ${instrument.symbol}`}
                        aria-pressed={included}
                        title={
                          included ? 'הסר מרשימת המעקב' : 'הוסף לרשימת המעקב'
                        }
                        onClick={() =>
                          setMembership(listId, instrument.id, !included)
                        }
                      >
                        <Heart
                          aria-hidden="true"
                          fill={included ? 'currentColor' : 'none'}
                        />
                      </button>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <div className={styles.noResults}>
                <Search aria-hidden="true" />
                <p role="status">לא נמצאו ניירות ערך לחיפוש זה</p>
                <button
                  onClick={() => {
                    setQuery('')
                    setCategory('all')
                  }}
                >
                  נקה חיפוש
                </button>
              </div>
            )}
          </div>
        </Tabs.Content>
      </Tabs.Root>
      <span className="sr-only" role="status" aria-live="polite">
        {toast?.message}
      </span>
    </Modal>
  )
}
