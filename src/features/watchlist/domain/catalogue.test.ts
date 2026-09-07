// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { createMockMarket } from '../mock/market'
import { searchCatalogue } from './catalogue'
const instruments = createMockMarket().instruments

describe('catalogue search', () => {
  it('matches case-insensitive symbols and Hebrew/English descriptions', () => {
    expect(
      searchCatalogue(instruments, ' aApL apple ', 'all').map(
        (item) => item.id,
      ),
    ).toEqual(['us-aapl'])
    expect(
      searchCatalogue(instruments, 'בנק', 'all').map((item) => item.id),
    ).toEqual(['il-poalim', 'il-leumi'])
  })
  it('combines query and category without filtering by current membership', () => {
    expect(
      searchCatalogue(instruments, '', 'etf').map((item) => item.id),
    ).toEqual(['us-ivv'])
    expect(searchCatalogue(instruments, 'apple', 'etf')).toEqual([])
    expect(searchCatalogue(instruments, 'zzzz', 'all')).toEqual([])
  })
})
