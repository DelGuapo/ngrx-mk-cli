import { createReducer, on, Action } from '@ngrx/store';

import {
    {ACTION_PREFIX}DemoTrigger,
    {ACTION_PREFIX}DemoResponse
} from './{storeName}.actions';
import {  {storeName}Store } from './{storeName}.models';

const initial{STORE_NAME}State: {STORE_NAME}Store = {
    loading:undefined
}

export const {STORE_NAME}Reducer = createReducer(
    initial{STORE_NAME}State,
    {REDUCER_BUNDLE}
);

export function reducer(state: {STORE_NAME}Store | undefined, action: Action) {
    return {STORE_NAME}Reducer(state, action);
}