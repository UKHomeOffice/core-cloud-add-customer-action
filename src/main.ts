import * as core from '@actions/core'
import * as fs from 'fs';
import { parse } from 'yaml'
import {getActionInputs} from "./helpers";
import {AccountDoc, ActionInput} from "./types";

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {

  // Get the GH token and version file path
  const inputs: ActionInput = getActionInputs([
    { name: 'github_token', options: { required: true } },
    { name: 'file_path', options: { required: true } },
    { name: 'customer_id', options: { required: true } },
    { name: 'spoc_email', options: { required: true } },
    { name: 'environments', options: { required: true } },
  ]);

  try {

  // load the file
    let accounts: AccountDoc = parse(fs.readFileSync(inputs.file_path, 'utf8'));

    // for each environment

      // Add a node  - create a unique name as customer_id + environment

      // add a description "The" + customer_id + environment + "Account"
        // add a unique email address
          // split on @ and append '+' + customer_id + environment tolowercase
      // Add the environment


    // Write the file
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
