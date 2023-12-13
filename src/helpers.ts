import {
    ActionInput,
    ActionInputParam
} from './types';
import * as core from '@actions/core';

export const getActionInputs = (variables: Array<ActionInputParam>): ActionInput => {
    return <ActionInput>variables.reduce((obj, variable) => {
        let value: string | undefined = core.getInput(variable.name, variable.options);
        if (!value) {
            if (Object.hasOwn(variable, 'default')) {
                value = variable.default;
            }
        }
        return Object.assign(obj, { [variable.name]: value } );
    }, {});
};
