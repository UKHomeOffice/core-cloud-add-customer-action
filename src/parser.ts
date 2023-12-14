import { AccountDoc, WorkloadAccount } from "./types";
import { parse } from "yaml";
import { readFileSync } from "fs";

export const loadWorkloadAccounts = (file_path: string): WorkloadAccount[] =>
{
    let accounts: AccountDoc = parse(readFileSync(file_path, 'utf8'));
    return accounts?.workloadAccounts ?? [];
}
