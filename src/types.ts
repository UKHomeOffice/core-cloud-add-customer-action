type ActionInputKey = 'github_token' | 'file_path' | 'customer_id' | 'spoc_email' | 'environments';

export type ActionInputParam = {
    name: ActionInputKey,
    options: { required: boolean },
    default?: string
}

export type WorkloadAccount = {
    name: string,
    description: string,
    email: string,
    organizationalUnit: string,
}

export type AccountDoc = {
    workloadAccounts:  WorkloadAccount[]
}

export type ActionInput = Record<ActionInputKey, string>
