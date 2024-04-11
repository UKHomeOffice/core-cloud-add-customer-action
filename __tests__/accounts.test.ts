/**
 * Unit tests for src/workloadaccounts.ts
 */

import { expect } from '@jest/globals'

import * as core from '@actions/core'
import fs from 'fs'

import { compareTwoFiles, testWithFiles } from './utils'
import { WorkloadAccounts, WorkloadAccount } from '../src/workloadaccounts'
import path from 'node:path'

describe('workloadaccounts.test.ts', () => {
  describe('getOrganisationalUnits', () => {
    const testDirectory = `__tests__/files/tmp-${new Date().getTime()}`
    const expectedFilePath = path.join(testDirectory, 'accounts-config.yaml')

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

    it('parses accounts successfully with one workload account present', async () => {
      await testWithFiles(
        [
          {
            from: '__tests__/files/account/valid.yaml',
            to: expectedFilePath
          }
        ],
        async () => {
          expect(() => {
            WorkloadAccounts(testDirectory, 'Dev,Test,Prod')
          }).not.toThrow()

          expect(infoMock).toHaveBeenCalledWith(
            `1 workload accounts loaded from file '${expectedFilePath}'`
          )
        }
      )
    })

    it('parses accounts successfully with no workload account present', async () => {
      await testWithFiles(
        [{ from: '__tests__/files/account/empty.yaml', to: expectedFilePath }],
        async () => {
          expect(() => {
            WorkloadAccounts(testDirectory, 'Dev,Test,Prod')
          }).not.toThrow()

          expect(infoMock).toHaveBeenCalledWith(
            `0 workload accounts loaded from file '${expectedFilePath}'`
          )
        }
      )
    })

    it('successfully add new workload account', async () => {
      await testWithFiles(
        [{ from: '__tests__/files/account/empty.yaml', to: expectedFilePath }],
        async () => {
          expect(() => {
            WorkloadAccounts(testDirectory, 'Test').addAccounts(
              'Account',
              'user@example.com'
            )
          }).not.toThrow()

          expect(infoMock).toHaveBeenNthCalledWith(
            1,
            `0 workload accounts loaded from file '${expectedFilePath}'`
          )
          expect(infoMock).toHaveBeenNthCalledWith(
            2,
            `1 workload accounts written to file '${expectedFilePath}'`
          )
          expect(
            compareTwoFiles(
              expectedFilePath,
              '__tests__/files/account/valid.yaml'
            )
          ).toBe(true)
        }
      )
    })

    it('throws an error if an invalid file is provided', async () => {
      await testWithFiles(
        [{ from: '__tests__/files/invalid.yaml', to: expectedFilePath }],
        async () => {
          expect(() => {
            WorkloadAccounts(testDirectory, 'Test')
          }).toThrow()
        }
      )
    })

    it('throws an error if the file cannot be found', () => {
      expect(() => {
        WorkloadAccounts(testDirectory, 'Test')
      }).toThrow()
    })

    it('throws an error when account email already exists', async () => {
      await testWithFiles(
        [{ from: '__tests__/files/account/valid.yaml', to: expectedFilePath }],
        async () => {
          expect(() => {
            WorkloadAccounts(testDirectory, 'Test').addAccounts(
              'Account',
              'user@example.com'
            )
          }).toThrow()
        }
      )
    })
  })

  describe('types.ts', () => {
    it('creates WorkloadAccount customer correctly from lower', () => {
      const customerId = 'projectname'
      const orgUnitName = 'dev'

      const account = new WorkloadAccount(customerId, '', orgUnitName)

      expect(account.getName()).toBe('ProjectnameDev')
    })

    it('creates WorkloadAccount customer correctly from upper', () => {
      const customerId = 'PROJECTNAME'
      const orgUnitName = 'DEV'

      const account = new WorkloadAccount(customerId, '', orgUnitName)

      expect(account.getName()).toBe('PROJECTNAMEDev')
    })

    it('creates WorkloadAccount description correctly lower', () => {
      const customerId = 'projectname'
      const orgUnitName = 'dev'

      const account = new WorkloadAccount(customerId, '', orgUnitName)

      expect(account.getDescription()).toBe(`The Projectname Dev Account`)
    })

    it('creates WorkloadAccount description correctly upper', () => {
      const customerId = 'PROJECTNAME'
      const orgUnitName = 'DEV'

      const account = new WorkloadAccount(customerId, '', orgUnitName)

      expect(account.getDescription()).toBe(`The Projectname Dev Account`)
    })

    it('creates WorkloadAccount email correctly lower', () => {
      const email = 'user@example.com'
      const customerId = 'projectname'
      const orgUnitName = 'dev'

      const account = new WorkloadAccount(customerId, email, orgUnitName)

      expect(account.getEmail()).toBe(`user+projectname-dev@example.com`)
    })

    it('creates WorkloadAccount email correctly upper', () => {
      const email = 'USER@EXAMPLE.COM'
      const customerId = 'PROJECTNAME'
      const orgUnitName = 'DEV'

      const account = new WorkloadAccount(customerId, email, orgUnitName)

      expect(account.getEmail()).toBe(`user+projectname-dev@example.com`)
    })

    it('creates WorkloadAccount email correctly with additional characters', () => {
      const email = 'USER@EXAMPLE.COM'
      const customerId = 'PROJECTNAME'
      const orgUnitName = 'DEV (ISOLATED)'

      const account = new WorkloadAccount(customerId, email, orgUnitName)

      expect(account.getEmail()).toBe(
        `user+projectname-dev-isolated@example.com`
      )
    })

    it('throws error when email prefix greater than 64 length', () => {
      const email = `${'x'.repeat(61)}@EXAMPLE.com`
      const customerId = 'PROJECTNAME'
      const orgUnitName = 'DEV'
      // Result prefix is 65 characters, from {prefix}{+customerId-orgUnitName}
      expect(
        () => new WorkloadAccount(email, customerId, orgUnitName)
      ).toThrow()
    })
  })
})
