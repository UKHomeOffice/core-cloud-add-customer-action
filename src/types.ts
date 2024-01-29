import { capitaliseFirstLetter, toSentenceCase } from './helpers'
import { YAMLMap } from 'yaml'

type ActionInputKey =
  | 'accounts_file_path'
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

export class WorkloadAccount extends YAMLMap<string, string> {
  constructor(
    name: string,
    description: string,
    email: string,
    orgUnit: string
  ) {
    super()
    this.set('name', name)
    this.set('description', description)
    this.set('email', email)
    this.set('organizationalUnit', orgUnit)
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

export type WorkloadAccountAction = {
  addAccounts(customer_id: string, spoc_email: string): void
}
