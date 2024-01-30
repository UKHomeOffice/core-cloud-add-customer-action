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
import { compareTwoFiles, testWithFiles } from './utils'
import path from 'node:path'

// Mock the action's main function
const runMock = jest.spyOn(main, 'run')

// Mock the GitHub Actions core library
let infoMock: jest.SpyInstance
let warningMock: jest.SpyInstance
let errorMock: jest.SpyInstance
let getInputMock: jest.SpyInstance
let setFailedMock: jest.SpyInstance

describe('action', () => {
  const testDirectory = `__tests__/files/tmp-${new Date().getTime()}`
  const expectedAccountFilePath = '__tests__/files/account/expected.yaml'
  const expectedIamFilePath = '__tests__/files/iam/expected.yaml'

  beforeAll(() => {
    if (!fs.existsSync(testDirectory)) {
      fs.mkdirSync(testDirectory)
    }
  })

  beforeEach(() => {
    jest.clearAllMocks()

    infoMock = jest.spyOn(core, 'info').mockImplementation()
    warningMock = jest.spyOn(core, 'warning').mockImplementation()
    errorMock = jest.spyOn(core, 'error').mockImplementation()
    getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
    setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
  })

  afterAll(() => {
    if (fs.existsSync(testDirectory)) {
      fs.rmSync(testDirectory, { recursive: true, force: true })
    }
  })

  it('adds three new accounts', async () => {
    testWithFiles(
      [
        {
          from: '__tests__/files/account/empty.yaml',
          to: path.join(testDirectory, 'accounts-config.yaml')
        },
        {
          from: '__tests__/files/iam/empty.yaml',
          to: path.join(testDirectory, 'iam-config.yaml')
        }
      ],
      ([accountFile, iamFile]) => {
        getInputMock.mockImplementation((name: string): string => {
          switch (name) {
            case 'folder_path':
              return testDirectory
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

        main.run()

        expect(runMock).toHaveReturned()
        expect(infoMock).toHaveBeenNthCalledWith(
          1,
          `0 workload accounts loaded from file '${accountFile}'`
        )
        expect(infoMock).toHaveBeenNthCalledWith(
          2,
          `3 workload accounts written to file '${accountFile}'`
        )
        expect(compareTwoFiles(accountFile, expectedAccountFilePath)).toBe(true)

        expect(infoMock).toHaveBeenNthCalledWith(
          3,
          `0 assignments loaded from file '${iamFile}'`
        )
        expect(infoMock).toHaveBeenNthCalledWith(
          4,
          `1 assignments written to file '${iamFile}'`
        )
        expect(compareTwoFiles(iamFile, expectedIamFilePath)).toBe(true)

        expect(errorMock).not.toHaveBeenCalled()
      }
    )
  })

  it('attempt to add one invalid organisation unit', async () => {
    testWithFiles(
      [
        {
          from: '__tests__/files/account/empty.yaml',
          to: path.join(testDirectory, 'accounts-config.yaml')
        },
        {
          from: '__tests__/files/iam/empty.yaml',
          to: path.join(testDirectory, 'iam-config.yaml')
        }
      ],
      ([accountFile]) => {
        // Set the action's inputs as return values from core.getInput()
        getInputMock.mockImplementation((name: string): string => {
          switch (name) {
            case 'folder_path':
              return testDirectory
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

        main.run()

        expect(runMock).toHaveReturned()
        expect(infoMock).toHaveBeenNthCalledWith(
          1,
          `0 workload accounts loaded from file '${accountFile}'`
        )
        expect(warningMock).toHaveBeenNthCalledWith(
          1,
          `Invalid environment string: INVALID`
        )
        expect(setFailedMock).toHaveBeenCalledWith(`No workload accounts added`)

        expect(compareTwoFiles(accountFile, expectedAccountFilePath)).toBe(
          false
        )

        expect(errorMock).not.toHaveBeenCalled()
      }
    )
  })

  it('sets a failed status on missing account input file', async () => {
    testWithFiles([], () => {
      getInputMock.mockImplementation((name: string): string => {
        switch (name) {
          case 'folder_path':
            return testDirectory
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

      main.run()
      expect(runMock).toHaveReturned()

      // Verify error message is propagated to setFailed()
      expect(setFailedMock).toHaveBeenCalledWith(
        `Error reading workload accounts from file '${path.join(testDirectory, 'accounts-config.yaml')}'`
      )

      expect(errorMock).not.toHaveBeenCalled()
    })
  })

  it('sets a failed status on missing iam input file', async () => {
    testWithFiles(
      [
        {
          from: '__tests__/files/account/empty.yaml',
          to: path.join(testDirectory, 'accounts-config.yaml')
        }
      ],
      ([accountFile]) => {
        getInputMock.mockImplementation((name: string): string => {
          switch (name) {
            case 'folder_path':
              return testDirectory
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

        main.run()
        expect(runMock).toHaveReturned()

        expect(infoMock).toHaveBeenNthCalledWith(
          1,
          `0 workload accounts loaded from file '${accountFile}'`
        )
        expect(infoMock).toHaveBeenNthCalledWith(
          2,
          `3 workload accounts written to file '${accountFile}'`
        )
        expect(compareTwoFiles(accountFile, expectedAccountFilePath)).toBe(true)

        // Verify error message is propagated to setFailed()
        expect(setFailedMock).toHaveBeenCalledWith(
          `Error reading assignments from file '${path.join(testDirectory, 'iam-config.yaml')}'`
        )

        expect(errorMock).not.toHaveBeenCalled()
      }
    )
  })

  it('sets a failed status on invalid yaml account file', async () => {
    testWithFiles(
      [
        {
          from: '__tests__/files/invalid.yaml',
          to: path.join(testDirectory, 'accounts-config.yaml')
        }
      ],
      ([accountFile]) => {
        // Set the action's inputs as return values from core.getInput()
        getInputMock.mockImplementation((name: string): string => {
          switch (name) {
            case 'folder_path':
              return testDirectory
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

        main.run()
        expect(runMock).toHaveReturned()

        // Verify error message is propagated to setFailed()
        expect(setFailedMock).toHaveBeenCalledWith(
          `Error parsing workload accounts from file '${accountFile}', accounts section is not present`
        )

        expect(errorMock).not.toHaveBeenCalled()
      }
    )
  })

  it('sets a failed status on invalid yaml iam file', async () => {
    testWithFiles(
      [
        {
          from: '__tests__/files/account/empty.yaml',
          to: path.join(testDirectory, 'accounts-config.yaml')
        },
        {
          from: '__tests__/files/invalid.yaml',
          to: path.join(testDirectory, 'iam-config.yaml')
        }
      ],
      ([, iamFile]) => {
        getInputMock.mockImplementation((name: string): string => {
          switch (name) {
            case 'folder_path':
              return testDirectory
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

        main.run()
        expect(runMock).toHaveReturned()

        // Verify error message is propagated to setFailed()
        expect(setFailedMock).toHaveBeenCalledWith(
          `Error parsing assignments from file '${iamFile}', assignments section is not present`
        )

        expect(errorMock).not.toHaveBeenCalled()
      }
    )
  })
})
