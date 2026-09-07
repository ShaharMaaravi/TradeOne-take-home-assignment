import { useRef, useState } from 'react'
import * as Menu from '@radix-ui/react-dropdown-menu'
import { ListFilter, Pencil, Star, Trash2 } from 'lucide-react'
import { useWatchlist } from '../state/useWatchlist'
import { Modal } from '../../../components/ui/Modal'
import { EditListDialog } from './EditListDialog'
import toolbar from './WatchlistPage.module.css'
import menu from './WatchlistSelector.module.css'
import styles from './ListEditing.module.css'

export function ListActions() {
  const [dialog, setDialog] = useState<'edit' | 'rename' | 'delete' | null>(
    null,
  )
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const trigger = useRef<HTMLButtonElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const cancel = useRef<HTMLButtonElement>(null)
  const lists = useWatchlist((s) => s.market.watchlists)
  const activeId = useWatchlist((s) => s.market.activeWatchlistId)
  const defaultId = useWatchlist((s) => s.market.defaultWatchlistId)
  const switching = useWatchlist((s) => s.isSwitching)
  const rename = useWatchlist((s) => s.renameList)
  const remove = useWatchlist((s) => s.deleteList)
  const setDefault = useWatchlist((s) => s.setDefaultList)
  const list = lists.find((item) => item.id === activeId)!
  const close = () => setDialog(null)
  const restoreFocus = () => trigger.current?.focus()
  return (
    <>
      <Menu.Root dir="rtl">
        <Menu.Trigger
          ref={trigger}
          className={toolbar.listActions}
          disabled={switching}
          aria-label="פעולות רשימה"
        >
          <ListFilter aria-hidden="true" />
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Content
            className={menu.menu}
            sideOffset={6}
            collisionPadding={12}
            onCloseAutoFocus={(event) => {
              if (dialog) event.preventDefault()
            }}
          >
            <Menu.Item className={menu.item} onSelect={() => setDialog('edit')}>
              <Pencil size={16} />
              עריכת רשימה
            </Menu.Item>
            <Menu.Item
              className={menu.item}
              disabled={defaultId === activeId}
              onSelect={() => setDefault(activeId)}
            >
              <Star size={16} />
              {defaultId === activeId ? 'רשימת ברירת המחדל' : 'קבע כברירת מחדל'}
            </Menu.Item>
            <Menu.Item
              className={menu.item}
              onSelect={() => {
                setName(list.name)
                setError('')
                setDialog('rename')
              }}
            >
              <Pencil size={16} />
              שינוי שם
            </Menu.Item>
            <Menu.Item
              className={`${menu.item} ${styles.danger}`}
              disabled={lists.length === 1}
              onSelect={() => setDialog('delete')}
            >
              <Trash2 size={16} />
              מחיקת רשימה
            </Menu.Item>
          </Menu.Content>
        </Menu.Portal>
      </Menu.Root>
      {dialog === 'edit' && (
        <EditListDialog
          list={list}
          onClose={close}
          restoreFocus={restoreFocus}
        />
      )}
      {dialog === 'rename' && (
        <Modal
          open
          onOpenChange={close}
          title="שינוי שם רשימה"
          description="בחרו שם ייחודי לרשימה, עד 40 תווים"
          initialFocusRef={input}
          restoreFocus={restoreFocus}
        >
          <form
            onSubmit={(event) => {
              event.preventDefault()
              if (rename(activeId, name)) close()
              else setError('יש להזין שם ייחודי באורך 1–40 תווים')
            }}
          >
            <h2 className={styles.title}>שינוי שם רשימה</h2>
            <label className={styles.label}>
              שם הרשימה
              <input
                ref={input}
                value={name}
                maxLength={40}
                onChange={(event) => {
                  setName(event.target.value)
                  setError('')
                }}
                aria-invalid={!!error}
                aria-describedby={error ? 'rename-error' : undefined}
              />
            </label>
            {error && (
              <p id="rename-error" role="alert" className={styles.danger}>
                {error}
              </p>
            )}
            <div className={styles.footer}>
              <button className={styles.primary} type="submit">
                שמירה
              </button>
              <button type="button" onClick={close}>
                ביטול
              </button>
            </div>
          </form>
        </Modal>
      )}
      {dialog === 'delete' && (
        <Modal
          open
          onOpenChange={close}
          title="מחיקת רשימה"
          description={`מחיקת הרשימה ${list.name}`}
          initialFocusRef={cancel}
          restoreFocus={restoreFocus}
        >
          <h2 className={styles.title}>מחיקת רשימה</h2>
          <p>
            למחוק את הרשימה ״<bdi>{list.name}</bdi>״?
          </p>
          <p>הניירות ברשימות האחרות לא יושפעו.</p>
          <div className={styles.footer}>
            <button
              className={styles.delete}
              onClick={() => {
                remove(activeId)
                close()
              }}
            >
              מחיקה
            </button>
            <button ref={cancel} onClick={close}>
              ביטול
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}
