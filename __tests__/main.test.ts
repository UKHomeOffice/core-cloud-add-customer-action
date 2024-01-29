/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * These should be run as if the action was called from a workflow.
 * Specifically, the inputs listed in `action.yml` should be set as environment
 * variables following the pattern `INPUT_<INPUT_NAME>`.
 */

import * as core from '@actions/core'
import * as main from '../src/main'
import * as fs from 'fs'
import { compareTwoFiles } from './utils'

// Mock the action's main function
const runMock = jest.spyOn(main, 'run')

// Mock the GitHub Actions core library
let infoMock: jest.SpyInstance
let warningMock: jest.SpyInstance
let errorMock: jest.SpyInstance
let getInputMock: jest.SpyInstance
let setFailedMock: jest.SpyInstance

describe('action', () => {
  let testFilePath: string

  beforeEach(() => {
    jest.clearAllMocks()

    infoMock = jest.spyOn(core, 'info').mockImplementation()
    warningMock = jest.spyOn(core, 'warning').mockImplementation()
    errorMock = jest.spyOn(core, 'error').mockImplementation()
    getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
    setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()

    // copy the './__tests__/files/account/empty.yaml' for testing
    testFilePath = `./__tests__/files/account/test-${Date.now()}.yaml`
    fs.copyFileSync('./__tests__/files/account/empty.yaml', testFilePath)
  })

  afterEach(() => {
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath)
    }
  })

  it('adds three new accounts', async () => {
    const expectedFilePath = './__tests__/files/account/expected.yaml'

    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'file_path':
          return testFilePath
        case 'customer_id':
          return 'CUSTOMERID'
        case 'spoc_email':
          return 'account@example.com'
        case 'organisational_units':
          return 'Dev,Test,Prod'
        default:
          return ''
      }
    })

    await main.run()

    expect(runMock).toHaveReturned()
    expect(infoMock).toHaveBeenNthCalledWith(
      1,
      `0 workload accounts loaded from file '${testFilePath}'`
    )
    expect(infoMock).toHaveBeenNthCalledWith(
      2,
      `3 workload accounts written to file '${testFilePath}'`
    )
    expect(compareTwoFiles(testFilePath, expectedFilePath)).toBe(true)

    expect(errorMock).not.toHaveBeenCalled()
  })

  it('attempt to add one invalid organisation unit', async () => {
    const expectedFilePath = './__tests__/files/account/empty.yaml'

    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'file_path':
          return testFilePath
        case 'customer_id':
          return 'CUSTOMERID'
        case 'spoc_email':
          return 'account@example.com'
        case 'organisational_units':
          return 'INVALID'
        default:
          return ''
      }
    })

    await main.run()

    expect(runMock).toHaveReturned()
    expect(infoMock).toHaveBeenNthCalledWith(
      1,
      `0 workload accounts loaded from file '${testFilePath}'`
    )
    expect(infoMock).toHaveBeenNthCalledWith(
      2,
      `0 workload accounts written to file '${testFilePath}'`
    )
    expect(warningMock).toHaveBeenNthCalledWith(
      1,
      `Invalid environment string: INVALID`
    )
    expect(compareTwoFiles(testFilePath, expectedFilePath)).toBe(true)

    expect(errorMock).not.toHaveBeenCalled()
  })

  it('sets a failed status on missing input file', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'file_path':
          return './__tests__/files/account/_.yaml'
        case 'customer_id':
          return 'CUSTOMERID'
        case 'spoc_email':
          return 'SPOC_EMAIL'
        case 'organisational_units':
          return 'Dev,Test,Prod'
        default:
          return ''
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify error message is propagated to setFailed()
    expect(setFailedMock).toHaveBeenCalledWith(
      `Error reading workload accounts from file './__tests__/files/account/_.yaml'`
    )

    expect(errorMock).not.toHaveBeenCalled()
  })

  it('sets a failed status on invalid input file', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'file_path':
          return './__tests__/files/invalid.yaml'
        case 'customer_id':
          return 'CUSTOMERID'
        case 'spoc_email':
          return 'SPOC_EMAIL'
        case 'organisational_units':
          return 'Dev,Test,Prod'
        default:
          return ''
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify error message is propagated to setFailed()
    expect(setFailedMock).toHaveBeenCalledWith(
      `Error parsing workload accounts from file './__tests__/files/invalid.yaml', accounts section is null or undefined`
    )

    expect(errorMock).not.toHaveBeenCalled()
  })
})
