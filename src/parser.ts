import {AccountDoc, WorkloadAccount} from "./types";
import {parse, stringify} from "yaml";
import {readFileSync, writeFileSync} from "fs";
import * as core from "@actions/core";

export const loadAccounts = (filePath: string): AccountDoc =>
{
    let accounts:AccountDoc;
    try {
        accounts = parse(readFileSync(filePath, 'utf8'));
    } catch (error: any) {
        throw new Error(`Error reading workload accounts from file '${filePath}'`);
    }
    if (accounts === null || accounts === undefined) {
        throw new Error(`Error parsing workload accounts from file '${filePath}', accounts section is null or undefined`);
    }
    core.info(`${accounts?.workloadAccounts?.length} workload accounts loaded from file '${filePath}'`);
    return accounts
}

export const writeAccounts = (filePath: string, accountDoc:AccountDoc) : void =>
{
    try {
        core.info(`${accountDoc?.workloadAccounts?.length} workload accounts written to file '${filePath}'`);
        writeFileSync(filePath, stringify(accountDoc), 'utf8')
    } catch (error: any) {
    throw new Error(`Error writing workload accounts to file '${filePath}'`);
}


}
