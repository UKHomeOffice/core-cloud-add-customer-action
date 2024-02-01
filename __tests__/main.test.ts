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
  const testTerraformDirectory = path.join(testDirectory, 'terraform')
  const testAccountFile = path.join(testDirectory, 'accounts-config.yaml')
  const testIamFile = path.join(testDirectory, 'iam-config.yaml')
  const testTerraformGroupsFile = path.join(
    testTerraformDirectory,
    'groups.yaml'
  )

  const expectedAccountFilePath = '__tests__/files/account/expected.yaml'
  const expectedIamFilePath = '__tests__/files/iam/expected.yaml'
  const expectedTerraformGroupsFilePath =
    '__tests__/terraform/files/groups/expected.yaml'

  beforeAll(() => {
    if (!fs.existsSync(testTerraformDirectory)) {
      fs.mkdirSync(testTerraformDirectory, { recursive: true }) // creates testDirectory too
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
        },
        {
          from: '__tests__/files/iam/empty.yaml',
          to: testIamFile
        },
        {
          from: '__tests__/terraform/files/groups/empty.yaml',
          to: testTerraformGroupsFile
        }
      ],
      async ([accountFile, iamFile, groupFile]) => {
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

        expect(infoMock).toHaveBeenNthCalledWith(
          5,
          `0 groups loaded from file '${groupFile}'`
        )
        expect(infoMock).toHaveBeenNthCalledWith(
          6,
          `1 groups written to file '${groupFile}'`
        )
        expect(
          compareTwoFiles(groupFile, expectedTerraformGroupsFilePath)
        ).toBe(true)

        expect(errorMock).not.toHaveBeenCalled()
      }
    )
  })

  it('attempt to add one invalid organisation unit', () => {
    testWithFiles(
      [
        {
          from: '__tests__/files/account/empty.yaml',
          to: testAccountFile
        },
        {
          from: '__tests__/files/iam/empty.yaml',
          to: testIamFile
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

  it('sets a failed status on missing iam input file', async () => {
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
              return 'Dev,Test,Prod'
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

  it('sets a failed status on missing groups terraform input file', async () => {
    await testWithFiles(
      [
        {
          from: '__tests__/files/account/empty.yaml',
          to: testAccountFile
        },
        {
          from: '__tests__/files/iam/empty.yaml',
          to: testIamFile
        }
      ],
      async ([accountFile, iamFile]) => {
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

        // Verify error message is propagated to setFailed()
        expect(setFailedMock).toHaveBeenCalledWith(
          `Error reading groups from file '${testTerraformGroupsFile}'`
        )

        expect(errorMock).not.toHaveBeenCalled()
      }
    )
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

  it('sets a failed status on invalid yaml iam file', async () => {
    await testWithFiles(
      [
        {
          from: '__tests__/files/account/empty.yaml',
          to: testAccountFile
        },
        {
          from: '__tests__/files/invalid.yaml',
          to: testIamFile
        }
      ],
      async ([, iamFile]) => {
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
          `Error parsing assignments from file '${iamFile}', assignments section is not present`
        )

        expect(errorMock).not.toHaveBeenCalled()
      }
    )
  })

  it('sets a failed status on invalid yaml terraform groups file', async () => {
    await testWithFiles(
      [
        {
          from: '__tests__/files/account/empty.yaml',
          to: testAccountFile
        },
        {
          from: '__tests__/files/iam/empty.yaml',
          to: testIamFile
        },
        {
          from: '__tests__/terraform/files/groups/invalid.yaml',
          to: testTerraformGroupsFile
        }
      ],
      async ([accountFile, iamFile, groupFile]) => {
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

        expect(setFailedMock).toHaveBeenCalledWith(
          `Error parsing groups from file '${groupFile}'`
        )

        expect(errorMock).not.toHaveBeenCalled()
      }
    )
  })
})
