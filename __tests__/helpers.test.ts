/**
 * Unit tests for src/helpers.test.ts
 */

import {
  capitaliseFirstLetter,
  getOrganisationalUnits,
  toSentenceCase
} from '../src/helpers'
import { describe } from 'node:test'

describe('helpers', () => {
  describe('getOrganisationalUnits', () => {
    it('returns an array of organisational units with single value', () => {
      const expected = ['Dev']
      const actual = getOrganisationalUnits('Dev')
      expect(actual).toEqual(expected)
    })

    it('returns an array of organisational units with multiple values', () => {
      const expected = ['Dev', 'Test', 'Prod']
      const actual = getOrganisationalUnits('Dev,Test,Prod')
      expect(actual).toEqual(expected)
    })

    it('returns an empty array if the string is empty', () => {
      const expected: string[] = []
      const actual = getOrganisationalUnits('')
      expect(actual).toEqual(expected)
    })
  })

  describe('toSentenceCase', () => {
    it('capitalises only the first letter of a string', () => {
      const expected = 'Test'
      const actual = toSentenceCase('TEST')
      expect(actual).toBe(expected)
    })

    it('returns empty if the input string is empty', () => {
      const expected = ''
      const actual = toSentenceCase('')
      expect(actual).toBe(expected)
    })
  })

  describe('capitaliseFirstLetter', () => {
    it('capitalises the first letter of a string', () => {
      const expected = 'Test'
      const actual = capitaliseFirstLetter('test')
      expect(actual).toBe(expected)
    })

    it('does not change a string that is already capitalised', () => {
      const expected = 'TeST'
      const actual = capitaliseFirstLetter('TeST')
      expect(actual).toBe(expected)
    })

    it('returns itself if the string is empty', () => {
      const expected = ''
      const actual = capitaliseFirstLetter('')
      expect(actual).toBe(expected)
    })
  })
})
