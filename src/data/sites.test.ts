import { describe, it, expect } from 'vitest'
import { SITES, SiteConfig } from './sites'

describe('SITES', () => {
  it('has exactly 5 entries', () => {
    expect(SITES).toHaveLength(5)
  })

  it('each entry has all required SiteConfig fields', () => {
    const requiredKeys: (keyof SiteConfig)[] = [
      'id',
      'name',
      'optOutUrl',
      'defaultDurationMonths',
      'description',
    ]
    for (const site of SITES) {
      for (const key of requiredKeys) {
        expect(site[key]).toBeDefined()
      }
    }
  })

  it('all ids are unique', () => {
    const ids = SITES.map((s) => s.id)
    expect(new Set(ids).size).toBe(SITES.length)
  })
})
