import { describe, expect, it } from 'vitest'

import {
  MACHTSREGEL_BLOK,
  eersteSomVoorLegeLeerling,
  makkelijksteSomInBlok,
} from './eerste-som'

const blocks = [
  { id: 'b0b', slug: 'k0b' },
  { id: 'b1a', slug: 'k1a' },
]
const topics = [
  { id: 't-machten', theory_block_id: 'b0b', order_index: 1 },
  { id: 't-lineair', theory_block_id: 'b0b', order_index: 2 },
  { id: 't-ketting', theory_block_id: 'b1a', order_index: 1 },
]
const clusters = [
  { id: 'c-machten', topic_id: 't-machten', order_index: 1 },
  { id: 'c-exp', topic_id: 't-machten', order_index: 2 },
  { id: 'c-lineair', topic_id: 't-lineair', order_index: 1 },
  { id: 'c-ketting', topic_id: 't-ketting', order_index: 1 },
]

describe('makkelijkste som in het blok van de machtsregel', () => {
  it('pakt de laagste moeilijkheid, ook als die later in het blok staat', () => {
    const id = makkelijksteSomInBlok(MACHTSREGEL_BLOK, blocks, topics, clusters, [
      { questionId: 'moeilijk-eerst', clusterId: 'c-machten', difficulty: 2 },
      { questionId: 'makkelijk-later', clusterId: 'c-lineair', difficulty: 1 },
      { questionId: 'buiten-blok', clusterId: 'c-ketting', difficulty: 1 },
    ])
    expect(id).toBe('makkelijk-later')
  })

  it('pakt bij gelijke moeilijkheid de eerste som in het blok', () => {
    const id = makkelijksteSomInBlok(MACHTSREGEL_BLOK, blocks, topics, clusters, [
      { questionId: 'eerste', clusterId: 'c-machten', difficulty: 1 },
      { questionId: 'tweede', clusterId: 'c-machten', difficulty: 1 },
      { questionId: 'andere-groep', clusterId: 'c-exp', difficulty: 1 },
    ])
    expect(id).toBe('eerste')
  })

  it('geeft niets terug als het blok geen sommen heeft', () => {
    expect(makkelijksteSomInBlok(MACHTSREGEL_BLOK, blocks, topics, clusters, [])).toBeNull()
    expect(
      makkelijksteSomInBlok('bestaat-niet', blocks, topics, clusters, [
        { questionId: 'x', clusterId: 'c-machten', difficulty: 1 },
      ]),
    ).toBeNull()
  })
})

describe('leerling zonder antwoord', () => {
  const makkelijkste = makkelijksteSomInBlok(MACHTSREGEL_BLOK, blocks, topics, clusters, [
    { questionId: 'som-2', clusterId: 'c-machten', difficulty: 2 },
    { questionId: 'som-1', clusterId: 'c-machten', difficulty: 1 },
  ])

  it('opent meteen de makkelijkste som van de machtsregel', () => {
    expect(
      eersteSomVoorLegeLeerling({
        heeftAntwoord: false,
        zelfGekozen: false,
        vraagId: makkelijkste,
        blokSlug: MACHTSREGEL_BLOK,
      }),
    ).toEqual({ blok: 'k0b', vraagId: 'som-1' })
  })

  it('laat het scherm zoals het is als er al een antwoord is', () => {
    expect(
      eersteSomVoorLegeLeerling({
        heeftAntwoord: true,
        zelfGekozen: false,
        vraagId: makkelijkste,
        blokSlug: MACHTSREGEL_BLOK,
      }),
    ).toBeNull()
  })

  it('laat een zelf gekozen onderdeel met rust', () => {
    expect(
      eersteSomVoorLegeLeerling({
        heeftAntwoord: false,
        zelfGekozen: true,
        vraagId: makkelijkste,
        blokSlug: MACHTSREGEL_BLOK,
      }),
    ).toBeNull()
  })
})
