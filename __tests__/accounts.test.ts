/**
 * Unit tests for src/parser.ts
 */

import { expect } from '@jest/globals'

import * as core from '@actions/core'
import fs from 'fs'

import { compareTwoFiles } from './utils'
import { WorkloadAccounts } from '../src/workloadaccounts'

let infoMock: jest.SpyInstance

describe('accounts.test.ts', () => {
  let testFilePath: string

  beforeEach(() => {
    jest.clearAllMocks()

    infoMock = jest.spyOn(core, 'info').mockImplementation()

    testFilePath = `./__tests__/files/test-${Date.now()}.yaml`
    fs.copyFileSync('./__tests__/files/empty.yaml', testFilePath)
  })

  afterEach(() => {
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath)
    }
  })

  it('parses accounts successfully with one workload account present', async () => {
    const filePath = './__tests__/files/valid.yaml'

    expect(() => {
      WorkloadAccounts(filePath, 'Dev,Test,Prod')
    }).not.toThrow()

    expect(infoMock).toHaveBeenCalledWith(
      `1 workload accounts loaded from file '${filePath}'`
    )
  })

  it('parses accounts successfully with no workload account present', async () => {
    const filePath = './__tests__/files/empty.yaml'

    expect(() => {
      WorkloadAccounts(filePath, 'Dev,Test,Prod')
    }).not.toThrow()

    expect(infoMock).toHaveBeenCalledWith(
      `0 workload accounts loaded from file '${filePath}'`
    )
  })

  it('successfully add new workload account', async () => {
    expect(() => {
      WorkloadAccounts(testFilePath, 'Test').addAccounts(
        'Account',
        'user@example.com'
      )
    }).not.toThrow()

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
      WorkloadAccounts('./__tests__/files/invalid.yaml', 'Test')
    }).toThrow()
  })

  it('throws an error if the file cannot be found', async () => {
    expect(() => {
      WorkloadAccounts('./__tests__/files/_.yaml', 'Test')
    }).toThrow()
  })

  it('throws an error when account email already exists', async () => {
    expect(() => {
      WorkloadAccounts('./__tests__/files/valid.yaml', 'Test').addAccounts(
        'Account',
        'user@example.com'
      )
    }).toThrow()
  })
})
