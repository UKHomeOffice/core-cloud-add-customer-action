import {
  capitaliseFirstLetter,
  getOrganisationalUnits,
  toSentenceCase
} from './helpers'
import { Document, parseDocument, YAMLMap, YAMLSeq } from 'yaml'
import { readFileSync, writeFileSync } from 'fs'
import * as core from '@actions/core'

export const WorkloadAccounts = (
  file_path: string,
  organisation_units: string
): WorkloadAccountAction => {
  const deploymentEnvironments = getOrganisationalUnits(organisation_units)

  let fileParsed: Document.Parsed

  try {
    fileParsed = parseDocument(readFileSync(file_path, 'utf8'))
  } catch (error: unknown) {
    throw new Error(`Error reading workload accounts from file '${file_path}'`)
  }

  const workloadAccounts: YAMLSeq<YAMLMap> = fileParsed.get(
    'workloadAccounts'
  ) as YAMLSeq<YAMLMap>
  if (!workloadAccounts) {
    throw new Error(
      `Error parsing workload accounts from file '${file_path}', accounts section is null or undefined`
    )
  }

  core.info(
    `${workloadAccounts.items?.length} workload accounts loaded from file '${file_path}'`
  )

  const addWorkloadAccount = (
    customerId: string,
    email: string,
    organisationUnit: string
  ): void => {
    const workloadAccount = new WorkloadAccount(
      customerId,
      email,
      organisationUnit
    )

    const conflictingAccount = workloadAccounts.items.find(
      account => account.get('email') === workloadAccount.getEmail()
    ) as WorkloadAccount | undefined
    if (conflictingAccount) {
      throw new Error(
        `Email already exists within file ${file_path}: ${conflictingAccount.toString()}`
      )
    }

    workloadAccounts.items.push(workloadAccount)

    // This ensures that the array is mapped correctly if initially empty.
    workloadAccounts.flow = false
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

export class WorkloadAccount extends YAMLMap<string, string> {
  constructor(name: string, email: string, orgUnit: string) {
    super()
    this.set('name', WorkloadAccount.getCustomerName(name, orgUnit))
    this.set('description', WorkloadAccount.getDescription(name, orgUnit))
    this.set('email', WorkloadAccount.getEmail(email, name, orgUnit))
    this.set('organizationalUnit', orgUnit)
  }

  getName(): string {
    return this.get('name') as string
  }

  getDescription(): string {
    return this.get('description') as string
  }

  getEmail(): string {
    return this.get('email') as string
  }

  private static getCustomerName = (
    customerId: string,
    orgUnitName: string
  ): string => {
    return `${capitaliseFirstLetter(customerId)}${toSentenceCase(orgUnitName)}`
  }

  private static getDescription = (
    customerId: string,
    orgUnitName: string
  ): string => {
    return `The ${toSentenceCase(customerId)} ${toSentenceCase(
      orgUnitName
    )} Account`
  }

  private static getEmail = (
    email: string,
    customerId: string,
    orgUnitName: string
  ): string => {
    const emailSplit = email.split('@')
    const emailPrefix = `${emailSplit[0]}+${customerId}-${orgUnitName}`
    if (emailPrefix.length > 64) {
      throw new Error(
        `Email prefix '${emailPrefix}' is too long, must be 64 characters or less`
      )
    }
    return `${emailPrefix}@${emailSplit[1]}`.toLowerCase()
  }
}

export type WorkloadAccountAction = {
  addAccounts(customer_id: string, spoc_email: string): void
}
