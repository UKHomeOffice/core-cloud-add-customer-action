/**
 * Unit tests for src/parser.ts
 */

import { loadAccounts } from '../src/parser'
import { expect } from '@jest/globals'

import * as core from '@actions/core'
import fs from 'fs'

import { compareTwoFiles } from './utils'

let infoMock: jest.SpyInstance

describe('parser.ts', () => {
  let testFilePath: string

  beforeEach(() => {
    jest.clearAllMocks()

    infoMock = jest.spyOn(core, 'info').mockImplementation()

    testFilePath = `./__tests__/files/test-${Date.now()}.yaml`
    fs.copyFileSync('./__tests__/files/empty.yaml', testFilePath)
  })

  afterEach(() => {
    fs.unlinkSync(testFilePath)
  })

  it('parses accounts successfully with one workload account present', async () => {
    const filePath = './__tests__/files/valid.yaml'

    const accounts = loadAccounts(filePath)
    expect(accounts).toBeDefined()

    expect(infoMock).toHaveBeenCalledWith(
      `1 workload accounts loaded from file '${filePath}'`
    )
  })

  it('parses accounts successfully with no workload account present', async () => {
    const filePath = './__tests__/files/empty.yaml'

    const accounts = loadAccounts(filePath)
    expect(accounts).toBeDefined()

    expect(infoMock).toHaveBeenCalledWith(
      `0 workload accounts loaded from file '${filePath}'`
    )
  })

  it('successfully add new workload account', async () => {
    const accounts = loadAccounts(testFilePath)
    expect(accounts).toBeDefined()

    accounts.addWorkloadAccount('Account', 'user@example.com', 'Test')
    accounts.writeAccounts()

    expect(infoMock).toHaveBeenNthCalledWith(
      1,
      `0 workload accounts loaded from file '${testFilePath}'`
    )
    expect(infoMock).toHaveBeenNthCalledWith(
      2,
      `1 workload accounts written to file '${testFilePath}'`
    )
    expect(compareTwoFiles(testFilePath, './__tests__/files/valid.yaml')).toBe(
      true
    )
  })

  it('throws an error if an invalid file is provided', async () => {
    expect(() => {
      loadAccounts('./__tests__/files/invalid.yaml')
    }).toThrow()
  })

  it('throws an error if the file cannot be found', async () => {
    expect(() => {
      loadAccounts('./__tests__/files/_.yaml')
    }).toThrow()
  })

  it('throws an error when account email already exists', async () => {
    expect(() => {
      const accounts = loadAccounts('./__tests__/files/valid.yaml')
      accounts.addWorkloadAccount('Account', 'user@example.com', 'Test')
    }).toThrow()
  })
})
