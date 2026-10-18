import { describe, expect, it } from 'vitest'

import { nakijkenMetVangnet } from './vangnet'

describe('vangnet rond het nakijken', () => {
  it('geeft de uitslag door als het nakijken lukt', async () => {
    const uitslag = await nakijkenMetVangnet(async () => ({
      kind: 'correct' as const,
    }))
    expect(uitslag).toEqual({ kind: 'correct' })
  })

  it('geeft null als de aanroep onderuit gaat', async () => {
    const uitslag = await nakijkenMetVangnet(async () => {
      throw new Error('netwerk weg')
    })
    expect(uitslag).toBeNull()
  })

  it('geeft null als de aanroep meteen gooit', async () => {
    const uitslag = await nakijkenMetVangnet(() => {
      throw new Error('server stuk')
    })
    expect(uitslag).toBeNull()
  })
})
