import { ActionInput, ActionInputParam, DeploymentEnvironment } from './types'
import * as core from '@actions/core'

export const getActionInputs = (variables: ActionInputParam[]): ActionInput => {
  return variables.reduce((obj, variable) => {
    let value: string | undefined = core.getInput(
      variable.name,
      variable.options
    )
    if (!value) {
      if (Object.hasOwn(variable, 'default')) {
        value = variable.default
      }
    }
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

  const environmentArray: DeploymentEnvironment[] = []

  for (const environmentString of environmentStrings) {
    const environmentEnumValue: DeploymentEnvironment | undefined =
      DeploymentEnvironment[
        environmentString.toLowerCase() as keyof typeof DeploymentEnvironment
      ]

    if (environmentEnumValue !== undefined) {
      environmentArray.push(environmentEnumValue)
    } else {
      core.warning(`Invalid environment string: ${environmentString}`)
    }
  }

  return environmentArray
}

export const toSentenceCase = (input: string): string => {
  if (!input) {
    return input // Return unchanged if input is empty or null
  }

  const firstLetter = input.charAt(0).toUpperCase()
  const restOfString = input.slice(1).toLowerCase()

  return firstLetter + restOfString
}
