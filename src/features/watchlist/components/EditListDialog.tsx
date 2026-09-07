import { useState } from 'react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, MinusCircle } from 'lucide-react'
import type { Instrument, Watchlist } from '../domain/types'
import { useWatchlist } from '../state/useWatchlist'
import { Modal } from '../../../components/ui/Modal'
import styles from './ListEditing.module.css'

function EditableRow({
  instrument,
  onRemove,
}: {
  instrument: Instrument
  onRemove: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: instrument.id })
  return (
    <li
      ref={setNodeRef}
      className={styles.row}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 1 : undefined,
        opacity: isDragging ? 0.7 : 1,
      }}
    >
      <button
        className={styles.remove}
        onClick={onRemove}
        aria-label={`הסר ${instrument.symbol}`}
      >
        <MinusCircle size={17} aria-hidden="true" />
      </button>
      <span className={styles.identity}>
        <bdi>{instrument.symbol}</bdi>
        <small>{instrument.name}</small>
      </span>
      <button
        ref={setActivatorNodeRef}
        className={styles.handle}
        {...attributes}
        {...listeners}
        aria-label={`שנה מיקום ${instrument.symbol}`}
      >
        <GripVertical size={18} aria-hidden="true" />
      </button>
    </li>
  )
}

export function EditListDialog({
  list,
  onClose,
  restoreFocus,
}: {
  list: Watchlist
  onClose: () => void
  restoreFocus: () => void
}) {
  const [dragging, setDragging] = useState(false)
  const [ids, setIds] = useState([...list.instrumentIds])
  const instruments = useWatchlist((s) => s.market.instruments)
  const save = useWatchlist((s) => s.saveList)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )
  const dirty =
    ids.length !== list.instrumentIds.length ||
    ids.some((id, index) => id !== list.instrumentIds[index])
  return (
    <Modal
      className={styles.editor}
      onEscapeKeyDown={(event) => {
        if (dragging) event.preventDefault()
      }}
      open
      onOpenChange={onClose}
      title="עריכת רשימה"
      description="גררו ניירות לשינוי סדר. במקלדת: רווח לבחירה, חצים להזזה ורווח לסיום. השינויים יוחלו בשמירה."
      restoreFocus={restoreFocus}
    >
      <h2 className={styles.title}>עריכת רשימה</h2>
      <p className={styles.hint}>
        גררו לשינוי סדר או הסירו ניירות. השינויים יוחלו בשמירה.
      </p>
      <DndContext
        onDragStart={() => setDragging(true)}
        onDragCancel={() => setDragging(false)}
        sensors={sensors}
        collisionDetection={closestCenter}
        accessibility={{
          screenReaderInstructions: {
            draggable:
              'לחצו רווח לבחירה, חצים לשינוי מיקום ורווח לסיום. Escape לביטול.',
          },
          announcements: {
            onDragStart: () => 'הנייר נבחר להזזה',
            onDragOver: ({ over }) =>
              over ? `מיקום ${ids.indexOf(String(over.id)) + 1}` : undefined,
            onDragEnd: () => 'שינוי המיקום הסתיים',
            onDragCancel: () => 'ההזזה בוטלה',
          },
        }}
        onDragEnd={({ active, over }) => {
          setDragging(false)
          if (over && active.id !== over.id)
            setIds((current) =>
              arrayMove(
                current,
                current.indexOf(String(active.id)),
                current.indexOf(String(over.id)),
              ),
            )
        }}
      >
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <ul className={styles.rows} aria-label="ניירות לעריכה">
            {ids.map((id) => (
              <EditableRow
                key={id}
                instrument={instruments.find((item) => item.id === id)!}
                onRemove={() =>
                  setIds((current) => current.filter((key) => key !== id))
                }
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
      {ids.length === 0 && <p>אין ניירות ברשימה</p>}
      <div className={styles.footer}>
        <button
          className={styles.primary}
          disabled={!dirty}
          onClick={() => {
            save(list.id, ids)
            onClose()
          }}
        >
          שמירה
        </button>
        <button onClick={onClose}>ביטול</button>
      </div>
    </Modal>
  )
}
