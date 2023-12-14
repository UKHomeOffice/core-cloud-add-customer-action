import * as core from '@actions/core'
import { getActionInputs } from "./helpers";
import { ActionInput, WorkloadAccount } from "./types";
import { loadWorkloadAccounts } from "./parser";

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  // Get the GH token and version file path
  const inputs: ActionInput = getActionInputs([
    //TODO: this shouldn't be needed as the PR will be created in the workflow
    { name: 'github_token', options: { required: true } },
    { name: 'file_path', options: { required: true } },
    { name: 'customer_id', options: { required: true } },
    { name: 'spoc_email', options: { required: true } },
    { name: 'environments', options: { required: true } },
  ]);

  let workloadAccounts: WorkloadAccount[] = [];
  try {
    workloadAccounts = loadWorkloadAccounts(inputs.file_path);
  } catch (error: any) {
    // This error is thrown if the file does not exist.
    core.setFailed(`Error loading workload accounts from file '${inputs.file_path}'`);
  }
  core.info(`${workloadAccounts.length} workload accounts loaded from file '${inputs.file_path}'`);

  // for each environment

  // Add a node  - create a unique name as customer_id + environment

  // add a description "The" + customer_id + environment + "Account"
  // add a unique email address
  // split on @ and append '+' + customer_id + environment tolowercase
  // Add the environment


  // Write the file
}
