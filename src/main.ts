import { getActionInputs, getOrganisationalUnits } from './helpers'
import { ActionInput } from './types'
import { loadAccounts } from './parser'
import * as core from '@actions/core'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const inputs: ActionInput = getActionInputs([
      { name: 'file_path', options: { required: true } },
      { name: 'customer_id', options: { required: true } },
      { name: 'spoc_email', options: { required: true } },
      { name: 'organisational_units', options: { required: true } }
    ])

    const accountDoc = loadAccounts(inputs.file_path)

    for (const orgUnitName of getOrganisationalUnits(
      inputs.organisational_units
    )) {
      accountDoc.addWorkloadAccount(
        inputs.customer_id,
        inputs.spoc_email,
        orgUnitName
      )
    }

    accountDoc.writeAccounts()
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}
