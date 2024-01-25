import { getOrganisationalUnits } from './helpers'
import { AccountDoc, WorkloadAccount, WorkloadAccountAction } from './types'
import { parse, stringify } from 'yaml'
import { readFileSync, writeFileSync } from 'fs'
import * as core from '@actions/core'

export const WorkloadAccounts = (
  file_path: string,
  organisation_units: string
): WorkloadAccountAction => {
  const deploymentEnvironments = getOrganisationalUnits(organisation_units)
  let accounts: AccountDoc

  try {
    accounts = parse(readFileSync(file_path, 'utf8'))
  } catch (error: unknown) {
    throw new Error(`Error reading workload accounts from file '${file_path}'`)
  }

  if (accounts === null || accounts === undefined) {
    throw new Error(
      `Error parsing workload accounts from file '${file_path}', accounts section is null or undefined`
    )
  }

  core.info(
    `${accounts.workloadAccounts?.length} workload accounts loaded from file '${file_path}'`
  )

  const addWorkloadAccount = (
    customerId: string,
    email: string,
    organisationUnit: string
  ): void => {
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
        `Email already exists within file ${file_path}: ${conflictingAccount}`
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
  }

  const writeAccounts = (): void => {
    try {
      core.info(
        `${accounts.workloadAccounts?.length} workload accounts written to file '${file_path}'`
      )
      writeFileSync(file_path, stringify(accounts), 'utf8')
    } catch (error: unknown) {
      throw new Error(`Error writing workload accounts to file '${file_path}'`)
    }
  }

  return {
    addAccounts(customer_id: string, spoc_email: string) {
      for (const orgUnitName of deploymentEnvironments) {
        addWorkloadAccount(customer_id, spoc_email, orgUnitName)
      }
      writeAccounts()
    }
  }
}
