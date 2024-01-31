import path from 'node:path'
import { compareTwoFiles, testWithFiles } from '../utils'
import { Groups } from '../../src/terraform/groups'
import fs from 'fs'
import * as core from '@actions/core'

describe('groups.ts', () => {
  const testFilesDirectory = `__tests__/terraform/files/groups`
  const outputTestDirectory = `__tests__/terraform/files/tmp-${new Date().getTime()}`
  const outputFileLocationDirectory = `${outputTestDirectory}/terraform`

  const emptyGroupsFilePath = path.join(testFilesDirectory, 'empty.yaml')
  const expectedGroupsFilePath = path.join(testFilesDirectory, 'expected.yaml')
  const outputGroupsFilePath = path.join(
    outputFileLocationDirectory,
    'groups.yaml'
  )

  let infoMock: jest.SpyInstance

  beforeAll(() => {
    if (!fs.existsSync(outputFileLocationDirectory)) {
      fs.mkdirSync(outputFileLocationDirectory, { recursive: true })
    }
  })

  beforeEach(() => {
    jest.clearAllMocks()

    infoMock = jest.spyOn(core, 'info').mockImplementation()
  })

  afterAll(() => {
    if (fs.existsSync(outputFileLocationDirectory)) {
      fs.rmSync(outputFileLocationDirectory, { recursive: true, force: true })
    }
  })

  it('parses accounts successfully with no groups present', async () => {
    await testWithFiles(
      [{ from: emptyGroupsFilePath, to: outputGroupsFilePath }],
      async groupFile => {
        expect(() => {
          Groups(outputTestDirectory)
        }).not.toThrow()

        expect(infoMock).toHaveBeenCalledWith(
          `0 groups loaded from file '${groupFile}'`
        )
      }
    )
  })

  it('parses accounts successfully with group present', async () => {
    await testWithFiles(
      [{ from: expectedGroupsFilePath, to: outputGroupsFilePath }],
      async groupFile => {
        expect(() => {
          Groups(outputTestDirectory)
        }).not.toThrow()

        expect(infoMock).toHaveBeenCalledWith(
          `1 groups loaded from file '${groupFile}'`
        )
      }
    )
  })

  it('successfully save group file', async () => {
    await testWithFiles(
      [{ from: emptyGroupsFilePath, to: outputGroupsFilePath }],
      async ([groupFile]) => {
        expect(() => {
          Groups(outputTestDirectory).addGroup()
        }).not.toThrow()

        expect(infoMock).toHaveBeenCalledWith(
          `0 groups loaded from file '${groupFile}'`
        )

        expect(infoMock).toHaveBeenCalledWith(
          `0 groups written to file '${groupFile}'`
        )

        expect(compareTwoFiles(emptyGroupsFilePath, groupFile)).toBe(true)
      }
    )
  })

  it('throws an error if the file cannot be found', async () => {
    expect(() => {
      Groups(outputTestDirectory)
    }).toThrow()
  })
})
