/**
 * Unit tests for src/parser.ts
 */

import { loadWorkloadAccounts } from '../src/parser'
import { expect } from '@jest/globals'
import { WorkloadAccount } from "../src/types";

describe('parser.ts', () => {
  it('parses workload accounts successfully with on present', async () => {
    const accounts: WorkloadAccount[] = loadWorkloadAccounts('./__tests__/files/test.yaml')
    expect(accounts).toBeDefined()
  })

  it('returns an empty array when no workload accounts are present', async () => {
    const accounts: WorkloadAccount[] = loadWorkloadAccounts('./__tests__/files/empty.yaml')
    expect(accounts).toBeDefined()
    expect(accounts.length).toBe(0)
  })

  it('returns an empty array when no workload accounts are present', async () => {
    const accounts: WorkloadAccount[] = loadWorkloadAccounts('./__tests__/files/non-existent.yaml')
    expect(accounts).toBeDefined()
    expect(accounts.length).toBe(0)
  })

  it('throws an error if the file cannot be found', async () => {
    expect(() => { loadWorkloadAccounts('./__tests__/files/_.yaml') }).toThrowError()
  })
})
