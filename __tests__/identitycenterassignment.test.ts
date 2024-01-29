import * as core from '@actions/core'
import fs from 'fs'
import { IdentityCenterAssignment } from '../src/identitycenterassignment'

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
      IdentityCenterAssignment(filePath)
    }).not.toThrow()

    expect(infoMock).toHaveBeenCalledWith(
      `0 assignments loaded from file '${filePath}'`
    )
  })

  it('throws an error if an invalid file is provided', async () => {
    expect(() => {
      IdentityCenterAssignment('./__tests__/files/invalid.yaml')
    }).toThrow()
  })

  it('throws an error if the file cannot be found', async () => {
    expect(() => {
      IdentityCenterAssignment('./__tests__/files/_.yaml')
    }).toThrow()
  })
})
