import { createSeededRandom } from './random'

export interface MarketIndex {
  readonly id: string
  readonly name: string
  readonly price: number
  readonly previousClose: number
  readonly decimals: number
  readonly history: readonly number[]
}

export function createMockIndices(): readonly MarketIndex[] {
  return [
    {
      id: 'ta35',
      name: 'ת״א־35',
      price: 4147.05,
      previousClose: 4161.75,
      decimals: 2,
    },
    {
      id: 'ta125',
      name: 'ת״א־125',
      price: 3854.31,
      previousClose: 3858.32,
      decimals: 2,
    },
    {
      id: 'ta90',
      name: 'ת״א־90',
      price: 6419.02,
      previousClose: 6413.58,
      decimals: 2,
    },
    {
      id: 'usd-ils',
      name: 'דולר / שקל',
      price: 3.354,
      previousClose: 3.347,
      decimals: 3,
    },
  ].map((index) => ({
    ...index,
    history: Array.from(
      { length: 12 },
      (_, i) =>
        index.previousClose + ((index.price - index.previousClose) * i) / 11,
    ),
  }))
}

export function advanceMockIndices(
  indices: readonly MarketIndex[],
  seed: number,
): readonly MarketIndex[] {
  const random = createSeededRandom(seed)
  return indices.map((index) => {
    const price = Math.max(
      10 ** -index.decimals,
      Number(
        (index.price * (1 + (random() - 0.5) * 0.001)).toFixed(index.decimals),
      ),
    )
    return { ...index, price, history: [...index.history, price].slice(-30) }
  })
}
