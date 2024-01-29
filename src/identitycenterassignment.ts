import { Document, parseDocument, YAMLMap, YAMLSeq } from 'yaml'
import { readFileSync, writeFileSync } from 'fs'
import * as core from '@actions/core'
import { WorkloadAccount } from './workloadaccounts'

export const IdentityCenterAssignments = (
  file_path: string
): IdentityCenterAssignmentsAction => {
  let fileParsed: Document.Parsed

  try {
    fileParsed = parseDocument(readFileSync(file_path, 'utf8'))
  } catch (error: unknown) {
    throw new Error(`Error reading assignments from file '${file_path}'`)
  }

  const identityCenterAssignments: YAMLSeq<YAMLMap> = fileParsed.get(
    'identityCenterAssignments'
  ) as YAMLSeq<YAMLMap>
  if (!identityCenterAssignments) {
    throw new Error(
      `Error parsing assignments from file '${file_path}', section is null or undefined`
    )
  }

  core.info(
    `${identityCenterAssignments.items?.length} assignments loaded from file '${file_path}'`
  )

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
      writeAssignments()
    }
  }
}

export type IdentityCenterAssignmentsAction = {
  addAssignments(customer_id: string, accounts: WorkloadAccount[]): void
}
