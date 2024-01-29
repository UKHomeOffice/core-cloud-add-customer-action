import { Document, parseDocument, YAMLMap, YAMLSeq } from 'yaml'
import { readFileSync } from 'fs'
import * as core from '@actions/core'

export const IdentityCenterAssignment = (
  file_path: string
): IdentityCentreAssignmentsAction => {
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
}

export type IdentityCentreAssignmentsAction = void
