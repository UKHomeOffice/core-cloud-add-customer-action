
type ActionInputKey = 'github_token' | 'file_path' | 'customer_id' | 'spoc_email' | 'environments';

export enum DeploymentEnvironment { dev = 'dev' , test = 'test' , prod = 'prod', };

export type ActionInputParam = {
    name: ActionInputKey,
    options: { required: boolean },
    default?: string
}

export class WorkloadAccount {
    name: string;
    description: string;
    email: string;
    organizationalUnit: string;

    constructor(name : string, description: string, email: string, orgUnit: string) {
        this.name = name;
        this.description = description;
        this.email = email;
        this.organizationalUnit = orgUnit;
    }

}

export type AccountDoc = {
    workloadAccounts:  WorkloadAccount[]
}

export type ActionInput = Record<ActionInputKey, string>
