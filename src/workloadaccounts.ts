import { getOrganisationalUnits } from './helpers'
import { WorkloadAccount, WorkloadAccountAction } from './types'
import { Document, parseDocument, YAMLMap, YAMLSeq } from 'yaml'
import { readFileSync, writeFileSync } from 'fs'
import * as core from '@actions/core'

export const WorkloadAccounts = (
  file_path: string,
  organisation_units: string
): WorkloadAccountAction => {
  const deploymentEnvironments = getOrganisationalUnits(organisation_units)

  let fileParsed: Document.Parsed
  let workloadAccounts: YAMLSeq<YAMLMap>

  try {
    fileParsed = parseDocument(readFileSync(file_path, 'utf8'))
  } catch (error: unknown) {
    throw new Error(`Error reading workload accounts from file '${file_path}'`)
  }

  workloadAccounts = fileParsed.get('workloadAccounts') as YAMLSeq<YAMLMap>
  if (!workloadAccounts) {
    throw new Error(`Error parsing workload accounts from file '${file_path}', accounts section is null or undefined`)
  }

  core.info(
    `${workloadAccounts.items?.length} workload accounts loaded from file '${file_path}'`
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

    const conflictingAccount = workloadAccounts.items.find(
        account => account.get('email') === workloadEmail
    ) as WorkloadAccount | undefined
    if (conflictingAccount) {
      throw new Error(
        `Email already exists within file ${file_path}: ${conflictingAccount.toString()}`
      )
    }

    workloadAccounts.items.push(
      new WorkloadAccount(
        WorkloadAccount.getCustomerName(customerId, organisationUnit),
        WorkloadAccount.getDescription(customerId, organisationUnit),
        workloadEmail,
        organisationUnit
      )
    )

    // This ensures that the array is mapped correctly if initially empty.
    workloadAccounts.flow = false;
  }

  const writeAccounts = (): void => {
    try {
      core.info(
        `${workloadAccounts.items?.length} workload accounts written to file '${file_path}'`
      )
      writeFileSync(file_path, fileParsed.toString(), 'utf8')
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
