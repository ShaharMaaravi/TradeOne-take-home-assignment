import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { ReactNode, RefObject } from 'react'
import styles from './Modal.module.css'

interface ModalProps {
  className?: string
  onEscapeKeyDown?: (event: KeyboardEvent) => void
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  children: ReactNode
  initialFocusRef?: RefObject<HTMLElement | null>
  restoreFocus?: () => void
}

export function Modal({
  className,
  onEscapeKeyDown,
  open,
  onOpenChange,
  title,
  description,
  children,
  initialFocusRef,
  restoreFocus,
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content
          className={[styles.content, className].filter(Boolean).join(' ')}
          onEscapeKeyDown={onEscapeKeyDown}
          dir="rtl"
          onOpenAutoFocus={(event) => {
            if (initialFocusRef?.current) {
              event.preventDefault()
              initialFocusRef.current.focus()
            }
          }}
          onCloseAutoFocus={(event) => {
            if (restoreFocus) {
              event.preventDefault()
              restoreFocus()
            }
          }}
        >
          <Dialog.Title className="sr-only">{title}</Dialog.Title>
          <Dialog.Description className="sr-only">
            {description}
          </Dialog.Description>
          <Dialog.Close className={styles.close} aria-label="סגירה">
            <X aria-hidden="true" />
          </Dialog.Close>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
