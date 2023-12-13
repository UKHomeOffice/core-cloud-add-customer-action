type ActionInputKey = 'github_token' | 'file_path' | 'customer_id' | 'spoc_email' | 'environments';

export type ActionInputParam = {
    name: ActionInputKey,
    options: { required: boolean },
    default?: string
}

export type AccountDoc = {
    charts: { [key: string]: { service : string } }
}

export type ActionInput = Record<ActionInputKey, string>
