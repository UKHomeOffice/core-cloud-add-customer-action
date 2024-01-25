import { capitaliseFirstLetter, toSentenceCase } from './helpers'

type ActionInputKey =
  | 'file_path'
  | 'customer_id'
  | 'spoc_email'
  | 'organisational_units'

export type ActionInputParam = {
  name: ActionInputKey
  options: { required: boolean }
}

export type ActionInput = Record<ActionInputKey, string>

export enum DeploymentEnvironment {
  dev = 'Dev',
  test = 'Test',
  prod = 'Prod'
}

export class WorkloadAccount {
  name: string
  description: string
  email: string
  organizationalUnit: string

  constructor(
    name: string,
    description: string,
    email: string,
    orgUnit: string
  ) {
    this.name = name
    this.description = description
    this.email = email
    this.organizationalUnit = orgUnit
  }

  static getCustomerName = (
    customerId: string,
    orgUnitName: string
  ): string => {
    return `${capitaliseFirstLetter(customerId)}${toSentenceCase(orgUnitName)}`
  }

  static getDescription = (customerId: string, orgUnitName: string): string => {
    return `The ${toSentenceCase(customerId)} ${toSentenceCase(
      orgUnitName
    )} Account`
  }

  static getEmail = (
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

export type AccountDoc = {
  workloadAccounts: WorkloadAccount[]
}

export type WorkloadAccountAction = {
  addAccounts(customer_id: string, spoc_email: string): void
}
