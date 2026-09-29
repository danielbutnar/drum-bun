import {describe, expect, it} from 'vitest'

import {detectLanguage} from './agent'

describe('detectLanguage', () => {
  it('recognises the four languages of the route', () => {
    expect(detectLanguage('Cât costă rovinieta de 12 luni pentru un diesel Euro 5?')).toBe('ro')
    expect(detectLanguage('Reichen M+S-Reifen im Winter in Deutschland?')).toBe('de')
    expect(detectLanguage('Mennyi a megyei matrica és hogy kell megvenni?')).toBe('hu')
    expect(detectLanguage('I drive from Brașov to Munich on 20 December. What do I need?')).toBe('en')
  })
})
