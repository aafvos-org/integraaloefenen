import { describe, expect, it } from 'vitest'

import { kiesOefenvragen, type VraagRij } from './kies-vragen'

const RIJEN: VraagRij[] = [
  { id: 'a1', cluster_id: 'a', difficulty: 3, latex_body: 'a1' },
  { id: 'a2', cluster_id: 'a', difficulty: 1, latex_body: 'a2' },
  { id: 'b1', cluster_id: 'b', difficulty: 2, latex_body: 'b1' },
  { id: 'c1', cluster_id: 'c', difficulty: 1, latex_body: 'elders' },
]

describe('kiesOefenvragen', () => {
  it('pakt om de beurt uit elk cluster en zet de makkelijkste vooraan', () => {
    const gekozen = kiesOefenvragen(RIJEN, ['a', 'b'], 3, () => {})

    expect(gekozen.map((vraag) => vraag.id)).toEqual(['a2', 'b1', 'a1'])
  })

  it('stopt bij het gevraagde aantal en slaat onbekende clusters over', () => {
    const gekozen = kiesOefenvragen(RIJEN, ['a', 'b'], 1, () => {})

    expect(gekozen).toEqual([{ id: 'a2', latex_body: 'a2' }])
  })
})
