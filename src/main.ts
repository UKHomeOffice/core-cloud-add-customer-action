import { getActionInputs, getOrganisationalUnits } from "./helpers";
import { ActionInput, WorkloadAccount } from "./types";
import {loadAccounts, writeAccounts} from "./parser";
import * as core from "@actions/core";

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    // Get the GH token and version file path
    const inputs: ActionInput = getActionInputs([
      {name: 'file_path', options: {required: true}},
      {name: 'customer_id', options: {required: true}},
      {name: 'spoc_email', options: {required: true}},
      {name: 'organisational_units', options: {required: true}},
    ]);

    const accountDoc = loadAccounts(inputs.file_path)

    for (const orgUnitName of getOrganisationalUnits(inputs.organisational_units)) {
      accountDoc.workloadAccounts.push(new WorkloadAccount(
          WorkloadAccount.getCustomerName(inputs.customer_id, orgUnitName),
          WorkloadAccount.getDescription(inputs.customer_id, orgUnitName),
          WorkloadAccount.getEmail(inputs.spoc_email, inputs.customer_id, orgUnitName),
          orgUnitName));
    }

    writeAccounts(inputs.file_path, accountDoc);

  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}
