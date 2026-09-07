import { useEffect, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Menu, X } from 'lucide-react'
import { NavigationSidebar } from './NavigationSidebar'
import styles from './AppShell.module.css'

export function MobileNavigation() {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const query = window.matchMedia('(min-width: 761px)')
    const closeOnDesktop = () => {
      if (query.matches) setOpen(false)
    }
    query.addEventListener('change', closeOnDesktop)
    return () => query.removeEventListener('change', closeOnDesktop)
  }, [])
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        className={styles.mobileMenuButton}
        aria-label="פתיחת תפריט ניווט"
      >
        <Menu aria-hidden="true" />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.drawerOverlay} />
        <Dialog.Content
          className={styles.drawer}
          dir="rtl"
          onCloseAutoFocus={(event) => {
            if (window.matchMedia('(min-width: 761px)').matches) {
              event.preventDefault()
              document.getElementById('watchlist')?.focus()
            }
          }}
        >
          <Dialog.Title className="sr-only">תפריט ניווט</Dialog.Title>
          <Dialog.Description className="sr-only">
            ניווט בפסגות טרייד
          </Dialog.Description>
          <Dialog.Close
            className={styles.drawerClose}
            aria-label="סגירת תפריט ניווט"
          >
            <X aria-hidden="true" />
          </Dialog.Close>
          <NavigationSidebar mobile onNavigate={() => setOpen(false)} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
