import type { Instrument } from './types'

const missingValue = '—'
const numberFormatters = new Map<number, Intl.NumberFormat>()
const percentFormatter = new Intl.NumberFormat('en-US', {
  style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2, signDisplay: 'exceptZero',
})
const changeFormatters = new Map<number, Intl.NumberFormat>()
const volumeFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact', maximumFractionDigits: 2,
})

function fixedFormatter(decimals: number, signed = false): Intl.NumberFormat {
  const cache = signed ? changeFormatters : numberFormatters
  let formatter = cache.get(decimals)
  if (!formatter) {
    formatter = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals, maximumFractionDigits: decimals,
      signDisplay: signed ? 'exceptZero' : 'auto',
    })
    cache.set(decimals, formatter)
  }
  return formatter
}

function isAvailable(value: number | null): value is number {
  return value !== null && Number.isFinite(value)
}

// Suppress a misleading minus sign when a small negative number rounds to zero.
function normalizeZero(value: number, decimals: number): number {
  return Number(value.toFixed(decimals)) === 0 ? 0 : value
}

export function formatPrice(value: number | null, decimals = 2): string {
  return isAvailable(value) ? fixedFormatter(decimals).format(normalizeZero(value, decimals)) : missingValue
}

export function formatChange(value: number | null, decimals = 2): string {
  return isAvailable(value) ? fixedFormatter(decimals, true).format(normalizeZero(value, decimals)) : missingValue
}

/** Input is percentage points (1.25 means +1.25%). */
export function formatPercent(value: number | null): string {
  return isAvailable(value) ? percentFormatter.format(normalizeZero(value, 2) / 100) : missingValue
}

export function formatVolume(value: number | null): string {
  return isAvailable(value) && value >= 0 ? volumeFormatter.format(value) : missingValue
}

export function getPriceUnitLabel(instrument: Instrument): string {
  return { USD: '$', ILS: '₪', ILA: 'אג׳' }[instrument.priceUnit]
}
