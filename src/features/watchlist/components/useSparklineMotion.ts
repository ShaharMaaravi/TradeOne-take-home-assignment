import { useLayoutEffect, useRef } from 'react'

export const CHART_TRANSITION_MS = 300

type Point = readonly [number, number]
const parsePoints = (points: string): Point[] =>
  points.split(' ').map((pair) => {
    const [x = 0, y = 0] = pair.split(',').map(Number)
    return [x, y]
  })

/** SVG-only frame updates: no React state updates or layout reads per frame. */
export function useSparklineMotion(points: string) {
  const lineRef = useRef<SVGPolylineElement>(null)
  const areaRef = useRef<SVGPathElement>(null)
  const current = useRef<readonly Point[] | null>(null)
  useLayoutEffect(() => {
    const target = parsePoints(points)
    const paint = (values: readonly Point[]) => {
      current.current = values
      const rendered = values.map(([x, y]) => `${x},${y}`).join(' ')
      lineRef.current?.setAttribute('points', rendered)
      areaRef.current?.setAttribute(
        'd',
        `M 2,40 L ${rendered.split(' ').join(' L ')} L 98,40 Z`,
      )
    }
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (
      !current.current ||
      !lineRef.current ||
      reduced?.matches ||
      document.hidden
    ) {
      paint(target)
      return
    }
    const previous = current.current
    // Resample the old shape only when a new observation changes point count.
    const from = target.map((_, index): Point => {
      const position =
        (index * (previous.length - 1)) / Math.max(1, target.length - 1)
      const left = Math.floor(position)
      const a = previous[left]!
      const b = previous[Math.min(left + 1, previous.length - 1)]!
      const fraction = position - left
      return [a[0] + (b[0] - a[0]) * fraction, a[1] + (b[1] - a[1]) * fraction]
    })
    paint(from)
    const start = performance.now()
    let frame = 0
    const finish = () => {
      cancelAnimationFrame(frame)
      paint(target)
    }
    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / CHART_TRANSITION_MS)
      const eased = 1 - (1 - progress) ** 3
      paint(
        target.map(
          (point, index): Point => [
            from[index]![0] + (point[0] - from[index]![0]) * eased,
            from[index]![1] + (point[1] - from[index]![1]) * eased,
          ],
        ),
      )
      if (progress < 1) frame = requestAnimationFrame(step)
    }
    const onVisibility = () => {
      if (document.hidden) finish()
    }
    const onMotion = () => {
      if (reduced?.matches) finish()
    }
    frame = requestAnimationFrame(step)
    document.addEventListener('visibilitychange', onVisibility)
    reduced?.addEventListener('change', onMotion)
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('visibilitychange', onVisibility)
      reduced?.removeEventListener('change', onMotion)
    }
  }, [points])
  return { lineRef, areaRef }
}
