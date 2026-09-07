import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PriceCell, PRICE_FLASH_MS } from './PriceCell'
import { createMockMarket } from '../mock/market'

const instrument = createMockMarket().instruments[0]!
beforeEach(() => vi.useFakeTimers())
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('price feedback', () => {
  it('does not flash on initial mount or unchanged prices', () => {
    const { rerender } = render(
      <PriceCell instrument={instrument} price={100} />,
    )
    rerender(<PriceCell instrument={instrument} price={100} />)
    expect(vi.getTimerCount()).toBe(0)
    expect(screen.queryByText('עלה בעדכון האחרון')).not.toBeInTheDocument()
  })
  it('shows downward tick feedback then clears it', () => {
    const { rerender } = render(
      <PriceCell instrument={instrument} price={106} />,
    )
    rerender(<PriceCell instrument={instrument} price={105} />)
    expect(screen.getByText('ירד בעדכון האחרון')).toBeInTheDocument()
    expect(screen.getByText('105.00')).toBeInTheDocument()
    act(() => vi.advanceTimersByTime(PRICE_FLASH_MS))
    expect(screen.queryByText('ירד בעדכון האחרון')).not.toBeInTheDocument()
  })
  it('restarts feedback for rapid updates without an older timeout clearing it', () => {
    const { rerender, unmount } = render(
      <PriceCell instrument={instrument} price={100} />,
    )
    rerender(<PriceCell instrument={instrument} price={101} />)
    act(() => vi.advanceTimersByTime(500))
    rerender(<PriceCell instrument={instrument} price={102} />)
    act(() => vi.advanceTimersByTime(500))
    expect(screen.getByText('עלה בעדכון האחרון')).toBeInTheDocument()
    expect(vi.getTimerCount()).toBe(1)
    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})
