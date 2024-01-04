import { Account, AccountDoc, WorkloadAccount } from './types'
import { parse, stringify } from 'yaml'
import { readFileSync, writeFileSync } from 'fs'
import * as core from '@actions/core'

export const loadAccounts = (filePath: string): Account => {
  let accounts: AccountDoc
  try {
    accounts = parse(readFileSync(filePath, 'utf8'))
  } catch (error: unknown) {
    throw new Error(`Error reading workload accounts from file '${filePath}'`)
  }

  if (accounts === null || accounts === undefined) {
    throw new Error(
      `Error parsing workload accounts from file '${filePath}', accounts section is null or undefined`
    )
  }

  core.info(
    `${accounts.workloadAccounts?.length} workload accounts loaded from file '${filePath}'`
  )

  return {
    addWorkloadAccount: (
      customerId: string,
      email: string,
      organisationUnit: string
    ) => {
      const workloadEmail = WorkloadAccount.getEmail(
        email,
        customerId,
        organisationUnit
      )

      const conflictingAccount = accounts.workloadAccounts?.find(
        account => account.email === workloadEmail
      )
      if (conflictingAccount) {
        throw new Error(
          `Email already exists within file ${filePath}: ${conflictingAccount}`
        )
      }

      accounts.workloadAccounts.push(
        new WorkloadAccount(
          WorkloadAccount.getCustomerName(customerId, organisationUnit),
          WorkloadAccount.getDescription(customerId, organisationUnit),
          workloadEmail,
          organisationUnit
        )
      )
    },
    writeAccounts: () => {
      try {
        core.info(
          `${accounts.workloadAccounts?.length} workload accounts written to file '${filePath}'`
        )
        writeFileSync(filePath, stringify(accounts), 'utf8')
      } catch (error: unknown) {
        throw new Error(`Error writing workload accounts to file '${filePath}'`)
      }
    }
  }
}
