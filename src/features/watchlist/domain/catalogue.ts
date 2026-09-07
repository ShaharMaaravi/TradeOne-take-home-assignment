import type { Instrument, InstrumentType } from './types'

export type CatalogueCategory = InstrumentType | 'all'
const normalize = (text: string) =>
  text.normalize('NFKC').toLocaleLowerCase('he').trim()

export function matchesInstrumentQuery(
  instrument: Instrument,
  query: string,
): boolean {
  const words = normalize(query).split(/\s+/).filter(Boolean)
  const text = normalize(`${instrument.symbol} ${instrument.name}`)
  return words.every((word) => text.includes(word))
}

export function searchCatalogue(
  instruments: readonly Instrument[],
  query: string,
  category: CatalogueCategory,
): readonly Instrument[] {
  return instruments.filter(
    (instrument) =>
      (category === 'all' || instrument.type === category) &&
      matchesInstrumentQuery(instrument, query),
  )
}
