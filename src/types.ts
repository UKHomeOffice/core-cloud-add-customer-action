type ActionInputKey =
  | 'accounts_file_path'
  | 'customer_id'
  | 'spoc_email'
  | 'organisational_units'

export type ActionInputParam = {
  name: ActionInputKey
  options: { required: boolean }
}

export type ActionInput = Record<ActionInputKey, string>

export enum DeploymentEnvironment {
  dev = 'Dev',
  test = 'Test',
  prod = 'Prod'
}
