import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Sparkline, TrendBar } from './MarketVisuals'

describe('static market visuals', () => {
  it.each([{ prices: [] }, { prices: [Number.NaN] }, { prices: [Infinity] }])(
    'shows missing-data text for unavailable prices $prices',
    ({ prices }) => {
      render(<Sparkline prices={prices} direction="up" label="גרף יומי" />)
      expect(screen.getByLabelText('גרף יומי: אין נתונים')).toHaveTextContent(
        '—',
      )
    },
  )
  it('renders a flat series without invalid SVG coordinates', () => {
    render(
      <Sparkline
        prices={[10, 10, 10]}
        direction="unchanged"
        label="גרף יומי"
      />,
    )
    const chart = screen.getByRole('img', { name: 'גרף יומי' })
    expect(chart.querySelector('polyline')).toHaveAttribute(
      'points',
      '2,20 50,20 98,20',
    )
  })
  it('renders a single observation as a visible point', () => {
    render(<Sparkline prices={[10]} direction="unchanged" label="גרף יומי" />)
    expect(screen.getByRole('img').querySelector('circle')).toHaveAttribute(
      'cx',
      '50',
    )
  })
  it('gives each SVG its own gradient reference', () => {
    render(
      <>
        <Sparkline prices={[10, 12]} direction="up" label="א" />
        <Sparkline prices={[12, 10]} direction="down" label="ב" />
      </>,
    )
    const ids = screen
      .getAllByRole('img')
      .map((chart) => chart.querySelector('linearGradient')!.id)
    expect(new Set(ids).size).toBe(2)
  })
  it('describes trend direction without relying on red/green alone', () => {
    render(<TrendBar trend={['up', 'down', 'up']} />)
    expect(screen.getByRole('img')).toHaveAccessibleName(
      'מגמת 3 ימים: 2 עליות, 1 ירידות',
    )
  })
})
