/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * These should be run as if the action was called from a workflow.
 * Specifically, the inputs listed in `action.yml` should be set as environment
 * variables following the pattern `INPUT_<INPUT_NAME>`.
 */

import * as core from '@actions/core'
import * as main from '../src/main'

// Mock the action's main function
const runMock = jest.spyOn(main, 'run')

// Mock the GitHub Actions core library
let infoMock: jest.SpyInstance
let errorMock: jest.SpyInstance
let getInputMock: jest.SpyInstance
let setFailedMock: jest.SpyInstance

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    infoMock = jest.spyOn(core, 'info').mockImplementation()
    errorMock = jest.spyOn(core, 'error').mockImplementation()
    getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
    setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
  })

  it('adds three new accounts', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'file_path':
          return './__tests__/files/empty.yaml'
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
      `0 workload accounts loaded from file './__tests__/files/empty.yaml'`
    )

    expect(infoMock).toHaveBeenNthCalledWith(
      2,
      `3 workload accounts written to file './__tests__/files/empty.yaml'`
    )

    expect(errorMock).not.toHaveBeenCalled()
  })

  it('runs with no existing accounts', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'file_path':
          return './__tests__/files/empty.yaml'
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

    expect(infoMock).toHaveBeenCalledWith(
      `0 workload accounts loaded from file './__tests__/files/empty.yaml'`
    )

    expect(errorMock).not.toHaveBeenCalled()
  })

  it('sets a failed status on missing file', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'file_path':
          return './__tests__/files/_.yaml'
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
      `Error reading workload accounts from file './__tests__/files/_.yaml'`
    )

    expect(errorMock).not.toHaveBeenCalled()
  })

  it('sets a failed status on invalid file', async () => {
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
