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
import * as path from 'node:path'

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
  const testAccountFile = path.join(testDirectory, 'accounts-config.yaml')
  const expectedAccountFilePath = '__tests__/files/account/expected.yaml'

  beforeAll(() => {
    if (!fs.existsSync(testDirectory)) {
      fs.mkdirSync(testDirectory, { recursive: true }) // creates testDirectory too
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
      fs.rmSync(testDirectory, { recursive: true, force: true }) // clears testTerrformDirectory too
    }
  })

  it('adds three new accounts', async () => {
    await testWithFiles(
      [
        {
          from: '__tests__/files/account/empty.yaml',
          to: testAccountFile
        }
      ],
      async ([accountFile]) => {
        getInputMock.mockImplementation((name: string): string => {
          switch (name) {
            case 'folder_path':
              return testDirectory
            case 'customer_id':
              return 'CUSTOMERID'
            case 'spoc_email':
              return 'account@example.com'
            case 'organisational_units':
              return 'Dev, Test,Prod '
            default:
              return ''
          }
        })

        await main.run()

        expect(infoMock).toHaveBeenNthCalledWith(
          1,
          `0 workload accounts loaded from file '${accountFile}'`
        )
        expect(infoMock).toHaveBeenNthCalledWith(
          2,
          `3 workload accounts written to file '${accountFile}'`
        )
        expect(compareTwoFiles(accountFile, expectedAccountFilePath)).toBe(true)
      }
    )
  })

  it('attempt to add one invalid organisation unit', () => {
    testWithFiles(
      [
        {
          from: '__tests__/files/account/empty.yaml',
          to: testAccountFile
        }
      ],
      async ([accountFile]) => {
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

        await main.run()

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
    await testWithFiles([], async () => {
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

      await main.run()
      expect(runMock).toHaveReturned()

      // Verify error message is propagated to setFailed()
      expect(setFailedMock).toHaveBeenCalledWith(
        `Error reading workload accounts from file '${path.join(testDirectory, 'accounts-config.yaml')}'`
      )

      expect(errorMock).not.toHaveBeenCalled()
    })
  })

  it('sets a failed status on invalid yaml account file', async () => {
    await testWithFiles(
      [
        {
          from: '__tests__/files/invalid.yaml',
          to: testAccountFile
        }
      ],
      async ([accountFile]) => {
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

        await main.run()
        expect(runMock).toHaveReturned()

        // Verify error message is propagated to setFailed()
        expect(setFailedMock).toHaveBeenCalledWith(
          `Error parsing workload accounts from file '${accountFile}', accounts section is not present`
        )

        expect(errorMock).not.toHaveBeenCalled()
      }
    )
  })
})
