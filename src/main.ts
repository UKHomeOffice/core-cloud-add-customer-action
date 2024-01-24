import { getActionInputs } from './helpers'
import { ActionInput } from './types'
import * as core from '@actions/core'
import { WorkloadAccounts } from './workloadaccounts'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const inputs: ActionInput = getActionInputs()

    WorkloadAccounts(inputs.file_path, inputs.organisational_units).addAccounts(
      inputs.customer_id,
      inputs.spoc_email
    )
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}
