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

    const accounts = WorkloadAccounts(
      inputs.folder_path,
      inputs.organisational_units
    ).addAccounts(inputs.customer_id, inputs.spoc_email)

    if (accounts.length === 0) {
      core.setFailed('No workload accounts added')
      return
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}
