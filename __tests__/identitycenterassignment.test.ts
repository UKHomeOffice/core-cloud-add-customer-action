import * as core from '@actions/core'
import fs from 'fs'
import { IdentityCenterAssignments } from '../src/identitycenterassignment'
import { compareTwoFiles } from './utils'
import { WorkloadAccount } from '../src/workloadaccounts'

let infoMock: jest.SpyInstance

describe('identitycenterassignment.test.ts', () => {
  let testFilePath: string

  beforeEach(() => {
    jest.clearAllMocks()

    infoMock = jest.spyOn(core, 'info').mockImplementation()

    testFilePath = `./__tests__/files/iam/test-${Date.now()}.yaml`
    fs.copyFileSync('./__tests__/files/iam/empty.yaml', testFilePath)
  })

  afterEach(() => {
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath)
    }
  })

  it('parses accounts successfully with no workload account present', async () => {
    const filePath = './__tests__/files/iam/empty.yaml'

    expect(() => {
      IdentityCenterAssignments(filePath)
    }).not.toThrow()

    expect(infoMock).toHaveBeenCalledWith(
      `0 assignments loaded from file '${filePath}'`
    )
  })

  it('successfully add assignment', async () => {
    const filePath = './__tests__/files/iam/expected.yaml'

    expect(() => {
      IdentityCenterAssignments(testFilePath).addAssignments('TestAccount', [
        new WorkloadAccount('TestAccount', 'test@example.com', 'Dev'),
        new WorkloadAccount('TestAccount', 'test@example.com', 'Test')
      ])
    }).not.toThrow()

    expect(infoMock).toHaveBeenNthCalledWith(
      1,
      `0 assignments loaded from file '${testFilePath}'`
    )
    expect(infoMock).toHaveBeenNthCalledWith(
      2,
      `1 assignments written to file '${testFilePath}'`
    )
    expect(compareTwoFiles(testFilePath, filePath)).toBe(true)
  })

  it('throws an error if an invalid file is provided', async () => {
    expect(() => {
      IdentityCenterAssignments('./__tests__/files/invalid.yaml')
    }).toThrow()
  })

  it('throws an error if the file cannot be found', async () => {
    expect(() => {
      IdentityCenterAssignments('./__tests__/files/_.yaml')
    }).toThrow()
  })
})
