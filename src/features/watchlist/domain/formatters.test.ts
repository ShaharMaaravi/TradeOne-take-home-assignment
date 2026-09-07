// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { formatChange, formatPercent, formatPrice, formatVolume, getPriceUnitLabel } from './formatters'
import { createMockMarket } from '../mock/market'

describe('market formatting', () => {
  it('formats prices at the instrument precision', () => {
    expect(formatPrice(1234.5)).toBe('1,234.50')
    expect(formatPrice(7352, 0)).toBe('7,352')
    expect(formatPrice(0)).toBe('0.00')
  })
  it('shows explicit gain/loss signs without negative zero', () => {
    expect(formatChange(1.5)).toBe('+1.50')
    expect(formatChange(-1.5)).toBe('-1.50')
    expect(formatChange(-0.001)).toBe('0.00')
    expect(formatPrice(-0)).toBe('0.00')
  })
  it('accepts percentage points, not fractional ratios', () => {
    expect(formatPercent(1.25)).toBe('+1.25%')
    expect(formatPercent(-4.49)).toBe('-4.49%')
    expect(formatPercent(-0.001)).toBe('0.00%')
  })
  it('distinguishes missing values from zero', () => {
    for (const value of [null, Number.NaN, Infinity]) {
      expect(formatPrice(value)).toBe('—')
      expect(formatChange(value)).toBe('—')
      expect(formatPercent(value)).toBe('—')
      expect(formatVolume(value)).toBe('—')
    }
    expect(formatPercent(0)).toBe('0.00%')
    expect(formatVolume(0)).toBe('0')
  })
  it('uses compact traded-unit volumes', () => {
    expect(formatVolume(27_860_000)).toBe('27.86M')
    expect(formatVolume(822_870)).toBe('822.87K')
    expect(formatVolume(-1)).toBe('—')
  })
  it('keeps agorot distinct from shekels and dollars', () => {
    const instruments = createMockMarket().instruments
    expect(getPriceUnitLabel(instruments.find((item) => item.id === 'il-poalim')!)).toBe('אג׳')
    expect(getPriceUnitLabel(instruments.find((item) => item.id === 'us-msft')!)).toBe('$')
    expect(getPriceUnitLabel({ ...instruments[0]!, priceUnit: 'ILS' })).toBe('₪')
  })
})
