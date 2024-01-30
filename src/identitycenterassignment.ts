import { Document, parseDocument, YAMLMap, YAMLSeq } from 'yaml'
import { readFileSync, writeFileSync } from 'fs'
import * as core from '@actions/core'
import { WorkloadAccount } from './workloadaccounts'
import { capitaliseFirstLetter } from './helpers'

export const IdentityCenterAssignments = (
  file_path: string
): IdentityCenterAssignmentsAction => {
  let fileParsed: Document.Parsed

  try {
    fileParsed = parseDocument(readFileSync(file_path, 'utf8'))
  } catch (error: unknown) {
    throw new Error(`Error reading assignments from file '${file_path}'`)
  }

  const identityCenterAssignments: YAMLSeq<YAMLMap> = fileParsed.getIn(
      ["identityCenter", "identityCenterAssignments"]
  ) as YAMLSeq<YAMLMap>
  if (!identityCenterAssignments) {
    throw new Error(
      `Error parsing assignments from file '${file_path}', section is null or undefined`
    )
  }

  core.info(
    `${identityCenterAssignments.items?.length} assignments loaded from file '${file_path}'`
  )

  const addAssignment = (
    customerId: string,
    accounts: WorkloadAccount[]
  ): void => {
    const assignment = new IdentityCenterAssignment(
      customerId,
      'PowerAccessUser',
      accounts
    )

    identityCenterAssignments.items.push(assignment)
    identityCenterAssignments.flow = false
  }

  const writeAssignments = (): void => {
    try {
      core.info(
        `${identityCenterAssignments.items?.length} assignments written to file '${file_path}'`
      )
      writeFileSync(file_path, fileParsed.toString(), 'utf8')
    } catch (error: unknown) {
      throw new Error(`Error writing assignments to file '${file_path}'`)
    }
  }

  return {
    addAssignments(customer_id: string, accounts: WorkloadAccount[]) {
      addAssignment(customer_id, accounts)
      writeAssignments()
    }
  }
}

export type IdentityCenterAssignmentsAction = {
  addAssignments(customer_id: string, accounts: WorkloadAccount[]): void
}

export class IdentityCenterAssignment extends YAMLMap<
  string,
  string | Principal[] | DeploymentTarget
> {
  constructor(
    name: string,
    permissionSetName: string,
    accounts: WorkloadAccount[]
  ) {
    super()
    this.set('name', IdentityCenterAssignment.getName(name))
    this.set('permissionSetName', permissionSetName)
    this.set('principals', [
      new Principal(
        IdentityCenterAssignment.getGroupName(name, permissionSetName)
      )
    ])
    this.set(
      'deploymentTargets',
      new DeploymentTarget(accounts.map(account => account.getName()))
    )
  }

  private static getName = (customerId: string): string => {
    return `${capitaliseFirstLetter(customerId)}Assignment`
  }

  private static getGroupName = (
    customerId: string,
    permissionSetName: string
  ): string => {
    return `Foundry${permissionSetName}${capitaliseFirstLetter(customerId)}`
  }
}

class Principal {
  type: string
  name: string

  constructor(name: string) {
    this.type = 'GROUP'
    this.name = name
  }
}

class DeploymentTarget {
  accounts: string[]

  constructor(accounts: string[]) {
    this.accounts = accounts
  }
}
