import { ActionInput, ActionInputParam, DeploymentEnvironment } from './types'
import * as core from '@actions/core'

export const getActionInputs = (): ActionInput => {
  const variables: ActionInputParam[] = [
    { name: 'file_path', options: { required: true } },
    { name: 'customer_id', options: { required: true } },
    { name: 'spoc_email', options: { required: true } },
    { name: 'organisational_units', options: { required: true } }
  ]

  return variables.reduce((obj, variable) => {
    const value: string | undefined = core.getInput(
      variable.name,
      variable.options
    )
    return Object.assign(obj, { [variable.name]: value })
  }, {}) as ActionInput
}

export const getOrganisationalUnits = (
  labels: string
): DeploymentEnvironment[] => {
  if (labels === undefined || labels === '') {
    return []
  }

  const environmentStrings = labels.split(',')

  const environmentSet = new Set<DeploymentEnvironment>()

  for (const environmentString of environmentStrings) {
    const environmentEnumValue: DeploymentEnvironment | undefined =
      DeploymentEnvironment[
        environmentString.toLowerCase() as keyof typeof DeploymentEnvironment
      ]

    if (environmentEnumValue !== undefined) {
      environmentSet.add(environmentEnumValue)
    } else {
      core.warning(`Invalid environment string: ${environmentString}`)
    }
  }

  return [...environmentSet]
}

export const toSentenceCase = (input: string): string => {
  if (!input) {
    return input // Return unchanged if input is empty or null
  }

  const firstLetter = input.charAt(0).toUpperCase()
  const restOfString = input.slice(1).toLowerCase()

  return firstLetter + restOfString
}
