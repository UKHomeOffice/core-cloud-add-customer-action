import * as core from '@actions/core'
import fs from 'fs'
import { IdentityCenterAssignments } from '../src/identitycenterassignment'
import { compareTwoFiles, testWithFiles } from './utils'
import { WorkloadAccount } from '../src/workloadaccounts'
import * as path from 'node:path'

describe('identitycenterassignment.test.ts', () => {
  const testDirectory = `__tests__/files/tmp-${new Date().getTime()}`
  const expectedFilePath = path.join(testDirectory, 'iam-config.yaml')

  let infoMock: jest.SpyInstance

  beforeAll(() => {
    if (!fs.existsSync(testDirectory)) {
      fs.mkdirSync(testDirectory)
    }
  })

  beforeEach(() => {
    jest.clearAllMocks()

    infoMock = jest.spyOn(core, 'info').mockImplementation()
  })

  afterAll(() => {
    if (fs.existsSync(testDirectory)) {
      fs.rmSync(testDirectory, { recursive: true, force: true })
    }
  })

  it('parses accounts successfully with no workload account present', async () => {
    await testWithFiles(
      [{ from: '__tests__/files/iam/empty.yaml', to: expectedFilePath }],
      async () => {
        expect(() => {
          IdentityCenterAssignments(testDirectory)
        }).not.toThrow()

        expect(infoMock).toHaveBeenCalledWith(
          `0 assignments loaded from file '${expectedFilePath}'`
        )
      }
    )
  })

  it('successfully add assignment', async () => {
    await testWithFiles(
      [{ from: '__tests__/files/iam/empty.yaml', to: expectedFilePath }],
      async () => {
        expect(() => {
          IdentityCenterAssignments(testDirectory).addAssignments(
            'CUSTOMERID',
            [
              new WorkloadAccount('CUSTOMERID', 'test@example.com', 'Dev'),
              new WorkloadAccount('CUSTOMERID', 'test@example.com', 'Test'),
              new WorkloadAccount('CUSTOMERID', 'test@example.com', 'Prod')
            ]
          )
        }).not.toThrow()

        expect(infoMock).toHaveBeenNthCalledWith(
          1,
          `0 assignments loaded from file '${expectedFilePath}'`
        )
        expect(infoMock).toHaveBeenNthCalledWith(
          2,
          `1 assignments written to file '${expectedFilePath}'`
        )
        expect(
          compareTwoFiles(expectedFilePath, '__tests__/files/iam/expected.yaml')
        ).toBe(true)
      }
    )
  })

  it('throws an error if an invalid file is provided', async () => {
    await testWithFiles(
      [{ from: '__tests__/files/invalid.yaml', to: expectedFilePath }],
      async () => {
        expect(() => {
          IdentityCenterAssignments(testDirectory)
        }).toThrow()
      }
    )
  })

  it('throws an error if the file cannot be found', async () => {
    expect(() => {
      IdentityCenterAssignments(testDirectory)
    }).toThrow()
  })
})
