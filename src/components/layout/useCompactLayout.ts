import { useSyncExternalStore } from 'react'

export const COMPACT_LAYOUT_QUERY = '(max-width: 1199px)'
function subscribe(onChange: () => void) {
  const query = window.matchMedia?.(COMPACT_LAYOUT_QUERY)
  query?.addEventListener('change', onChange)
  return () => query?.removeEventListener('change', onChange)
}
const getSnapshot = () =>
  window.matchMedia?.(COMPACT_LAYOUT_QUERY).matches ?? false

/** Render one presentation at a time; both presentations share the same store. */
export function useCompactLayout() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
