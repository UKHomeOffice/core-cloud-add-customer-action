import * as core from '@actions/core'
import { getActionInputs } from "./helpers";
import { ActionInput, DeploymentEnvironment, WorkloadAccount } from "./types";
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
  for(const deployEnv of environments(inputs.environments)) {

    const envName = deployEnv.toString();

    const custName =  inputs.customer_id + envName

    const description = `The ${inputs.customer_id} ${envName} Account`;

    const emailSplit = inputs.spoc_email.split("@");
    const email = `${emailSplit[0]}+${custName}${emailSplit[1]}`;


    const workloadAccount = new WorkloadAccount(custName, description, email, deployEnv.toString());


  }




  // Write the file
}

const environments = (labels: string) : DeploymentEnvironment[] => {
  if (labels === undefined || labels === "") {
    return [];
  }

  const environmentStrings = labels.split(",");

  const environmentArray: DeploymentEnvironment[] = [];

  for (const environmentString of environmentStrings) {
    const environmentEnumValue: DeploymentEnvironment | undefined = DeploymentEnvironment[environmentString as keyof typeof DeploymentEnvironment];

    if (environmentEnumValue !== undefined) {
      environmentArray.push(environmentEnumValue);
    } else {
      core.warning(`Invalid color string: ${environmentString}`);
    }
  }

  return environmentArray;
}
