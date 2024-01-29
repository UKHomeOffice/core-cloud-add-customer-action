/**
 * Unit tests for src/parser.ts
 */

import { expect } from '@jest/globals'

import * as core from '@actions/core'
import fs from 'fs'

import { compareTwoFiles } from './utils'
import { WorkloadAccounts, WorkloadAccount } from '../src/workloadaccounts'

let infoMock: jest.SpyInstance

describe('workloadaccounts.test.ts', () => {
  describe('getOrganisationalUnits', () => {
    let testFilePath: string

    beforeEach(() => {
      jest.clearAllMocks()

      infoMock = jest.spyOn(core, 'info').mockImplementation()

      testFilePath = `./__tests__/files/account/test-${Date.now()}.yaml`
      fs.copyFileSync('./__tests__/files/account/empty.yaml', testFilePath)
    })

    afterEach(() => {
      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath)
      }
    })

    it('parses accounts successfully with one workload account present', async () => {
      const filePath = './__tests__/files/account/valid.yaml'

      expect(() => {
        WorkloadAccounts(filePath, 'Dev,Test,Prod')
      }).not.toThrow()

      expect(infoMock).toHaveBeenCalledWith(
        `1 workload accounts loaded from file '${filePath}'`
      )
    })

    it('parses accounts successfully with no workload account present', async () => {
      const filePath = './__tests__/files/account/empty.yaml'

      expect(() => {
        WorkloadAccounts(filePath, 'Dev,Test,Prod')
      }).not.toThrow()

      expect(infoMock).toHaveBeenCalledWith(
        `0 workload accounts loaded from file '${filePath}'`
      )
    })

    it('successfully add new workload account', async () => {
      expect(() => {
        WorkloadAccounts(testFilePath, 'Test').addAccounts(
          'Account',
          'user@example.com'
        )
      }).not.toThrow()

      expect(infoMock).toHaveBeenNthCalledWith(
        1,
        `0 workload accounts loaded from file '${testFilePath}'`
      )
      expect(infoMock).toHaveBeenNthCalledWith(
        2,
        `1 workload accounts written to file '${testFilePath}'`
      )
      expect(
        compareTwoFiles(testFilePath, './__tests__/files/account/valid.yaml')
      ).toBe(true)
    })

    it('throws an error if an invalid file is provided', async () => {
      expect(() => {
        WorkloadAccounts('./__tests__/files/invalid.yaml', 'Test')
      }).toThrow()
    })

    it('throws an error if the file cannot be found', async () => {
      expect(() => {
        WorkloadAccounts('./__tests__/files/_.yaml', 'Test')
      }).toThrow()
    })

    it('throws an error when account email already exists', async () => {
      expect(() => {
        WorkloadAccounts(
          './__tests__/files/account/valid.yaml',
          'Test'
        ).addAccounts('Account', 'user@example.com')
      }).toThrow()
    })
  })

  describe('types.ts', () => {
    it('creates WorkloadAccount customer correctly from lower', async () => {
      const customerId = 'projectname'
      const orgUnitName = 'dev'

      const account = new WorkloadAccount(customerId, '', orgUnitName)

      expect(account.getName()).toBe('ProjectnameDev')
    })
    it('creates WorkloadAccount customer correctly from upper', async () => {
      const customerId = 'PROJECTNAME'
      const orgUnitName = 'DEV'

      const account = new WorkloadAccount(customerId, '', orgUnitName)

      expect(account.getName()).toBe('PROJECTNAMEDev')
    })
    it('creates WorkloadAccount description correctly lower', async () => {
      const customerId = 'projectname'
      const orgUnitName = 'dev'

      const account = new WorkloadAccount(customerId, '', orgUnitName)

      expect(account.getDescription()).toBe(`The Projectname Dev Account`)
    })
    it('creates WorkloadAccount description correctly upper', async () => {
      const customerId = 'PROJECTNAME'
      const orgUnitName = 'DEV'

      const account = new WorkloadAccount(customerId, '', orgUnitName)

      expect(account.getDescription()).toBe(`The Projectname Dev Account`)
    })
    it('creates WorkloadAccount email correctly lower', async () => {
      const email = 'user@example.com'
      const customerId = 'projectname'
      const orgUnitName = 'dev'

      const account = new WorkloadAccount(customerId, email, orgUnitName)

      expect(account.getEmail()).toBe(`user+projectname-dev@example.com`)
    })
    it('creates WorkloadAccount email correctly upper', async () => {
      const email = 'USER@EXAMPLE.COM'
      const customerId = 'PROJECTNAME'
      const orgUnitName = 'DEV'

      const account = new WorkloadAccount(customerId, email, orgUnitName)

      expect(account.getEmail()).toBe(`user+projectname-dev@example.com`)
    })
    it('throws error when email prefix greater than 64 length', async () => {
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
