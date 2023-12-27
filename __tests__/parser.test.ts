/**
 * Unit tests for src/parser.ts
 */

import { loadAccounts } from '../src/parser'
import { expect } from '@jest/globals'
import { AccountDoc } from '../src/types'

describe('parser.ts', () => {
  it('parses workload accounts successfully with on present', async () => {
    const accounts: AccountDoc = loadAccounts('./__tests__/files/test.yaml')
    expect(accounts).toBeDefined()
    expect(accounts.workloadAccounts).toBeDefined()
  })

  it('returns an empty array when no workload accounts are present', async () => {
    const accounts: AccountDoc = loadAccounts('./__tests__/files/empty.yaml')
    expect(accounts).toBeDefined()
    expect(accounts.workloadAccounts).toBeDefined()
    expect(accounts.workloadAccounts.length).toBe(0)
  })

  it('thows an error if an invalid file is provided', async () => {
    expect(() => {
      loadAccounts('./__tests__/files/invalid.yaml')
    }).toThrow()
  })

  it('throws an error if the file cannot be found', async () => {
    expect(() => {
      loadAccounts('./__tests__/files/_.yaml')
    }).toThrow()
  })
})
