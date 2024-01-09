/**
 * Unit tests for src/types.ts
 */

import { WorkloadAccount } from '../src/types'

describe('types.ts', () => {
  it('creates WorkloadAccount customer correctly from lower', async () => {
    const customerId = 'projectname'
    const orgUnitName = 'dev'
    expect(WorkloadAccount.getCustomerName(customerId, orgUnitName)).toBe(
      'ProjectnameDev'
    )
  })
  it('creates WorkloadAccount customer correctly from upper', async () => {
    const customerId = 'PROJECTNAME'
    const orgUnitName = 'DEV'
    expect(WorkloadAccount.getCustomerName(customerId, orgUnitName)).toBe(
      'ProjectnameDev'
    )
  })
  it('creates WorkloadAccount description correctly lower', async () => {
    const customerId = 'projectname'
    const orgUnitName = 'dev'
    expect(WorkloadAccount.getDescription(customerId, orgUnitName)).toBe(
      `The Projectname Dev Account`
    )
  })
  it('creates WorkloadAccount description correctly upper', async () => {
    const customerId = 'PROJECTNAME'
    const orgUnitName = 'DEV'
    expect(WorkloadAccount.getDescription(customerId, orgUnitName)).toBe(
      `The Projectname Dev Account`
    )
  })
  it('creates WorkloadAccount email correctly lower', async () => {
    const email = 'user@example.com'
    const customerId = 'projectname'
    const orgUnitName = 'dev'
    expect(WorkloadAccount.getEmail(email, customerId, orgUnitName)).toBe(
      `user+projectname-dev@example.com`
    )
  })
  it('creates WorkloadAccount email correctly upper', async () => {
    const email = 'USER@EXAMPLE.COM'
    const customerId = 'PROJECTNAME'
    const orgUnitName = 'DEV'
    expect(WorkloadAccount.getEmail(email, customerId, orgUnitName)).toBe(
      `user+projectname-dev@example.com`
    )
  })
  it('throws error when email prefix greater than 64 length', async () => {
    const email = `${'x'.repeat(61)}@EXAMPLE.com`
    const customerId = 'PROJECTNAME'
    const orgUnitName = 'DEV'
    // Result prefix is 65 characters, from {prefix}{+customerId-orgUnitName}
    expect(() =>
      WorkloadAccount.getEmail(email, customerId, orgUnitName)
    ).toThrow()
  })
})
