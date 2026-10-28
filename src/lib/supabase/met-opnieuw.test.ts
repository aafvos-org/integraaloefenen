import { describe, expect, it, vi } from 'vitest'

import { metOpnieuw } from './met-opnieuw'

describe('metOpnieuw', () => {
  it('geeft het resultaat van de eerste poging als die meteen lukt', async () => {
    const roep = vi.fn().mockResolvedValue('ok')

    await expect(metOpnieuw(roep)).resolves.toBe('ok')
    expect(roep).toHaveBeenCalledTimes(1)
  })

  it('vangt een eenmalige fout op en probeert het nog één keer', async () => {
    const roep = vi
      .fn()
      .mockRejectedValueOnce(new Error('tijdelijk stuk'))
      .mockResolvedValueOnce('ok')

    await expect(metOpnieuw(roep)).resolves.toBe('ok')
    expect(roep).toHaveBeenCalledTimes(2)
  })

  it('gooit de fout alsnog door als het ook de tweede keer misgaat', async () => {
    const roep = vi.fn().mockRejectedValue(new Error('blijvend stuk'))

    await expect(metOpnieuw(roep)).rejects.toThrow('blijvend stuk')
    expect(roep).toHaveBeenCalledTimes(2)
  })
})
