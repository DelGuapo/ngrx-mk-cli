const ReducerResponse = function () {
    template = `
on(%ACTION_PREFIX%%ACTION_NAME%Response, (state, { output }) => {
    return {...state,loading:false }
})`
    return template;
}

const ReducerTrigger = function () {
    template = `
on(%ACTION_PREFIX%%ACTION_NAME%Trigger, (state, { input }) => {
    return {...state,loading:true }
})`
    return template;
}



const ActionResponse = function () {
    template = `
export const %ACTION_PREFIX%%ACTION_NAME%Response = createAction('[%STORE_NAME%] %ACTION_PREFIX%%ACTION_NAME%Response',
    props<{ output: any }>()
)`
    return template;
}

const ActionTrigger = function () {
    template = `
export const %ACTION_PREFIX%%ACTION_NAME%Trigger = createAction('[%STORE_NAME%] %ACTION_PREFIX%%ACTION_NAME%Trigger',
    props<{ input: any }>()
);`
    return template;
}

const ActionFileHeader = function () {
    return "import { createAction, props } from '@ngrx/store';";
}

const ParentAppStoreFile = function () {
    template = `
import { createAction } from '@ngrx/store';
import { Injectable } from '@angular/core';
import { Actions, createEffect } from '@ngrx/effects';
import { tap } from 'rxjs/operators';

/* TO BE USED IF AN EFFECT HAS NO RESPONSE */
export const NoAction = createAction('[App] - No Action Taken');

/* THIS IS THE PARENT LEVEL STORE CONTAINING ALL OF YOUR CHILD STORES */
export interface %PARENT_APP_STORE% {
    
}

/* TO BE USED FOR LOGGING */
@Injectable()
export class LogEffects {
    constructor(
        private actions$: Actions
    ) { }
    logActions$ = createEffect(() =>
        this.actions$.pipe(
            tap(a => {
                if (window.location.href.indexOf('localhost') > -1) {
                    console.log(a);
                }
            })
        ), { dispatch: false }
    )
}`

    return template;
}

const NoActionEffectChain = function () {
    return 'NoAction()'
}
const ActionEffectChain = function () {
    return `%ACTION_PREFIX%%ACTION_NAME%Response({ output: rsp })`
}

const EffectChain = function (effectChainFunction) {
    template =
        `   %EFFECT_PREFIX%%ACTION_NAME%$ = createEffect(() =>
        this.actions$.pipe(
            ofType(%ACTION_PREFIX%%ACTION_NAME%Trigger),
            switchMap(action => {
                const req$ = this.%storeName%Service.%actionName%$(action.input);
                return zip(of(action), req$)
            }),
            switchMap(([action, rsp]) => [
                ` + effectChainFunction + `
            ]),
            catchError((err, cought) => {
                console.error(err);
                return cought;
            })
        )
    )`
    return template;
}

const NewModelsFile = function () {
    template = `
export interface %STORE_NAME%Store = {
    loading : boolean;
    %storeName% : any;
}`
    return template;
}

const NewSelectorsFile = function () {
    const template = `
import { createSelector, createFeatureSelector } from '@ngrx/store';

export const %storeName%Store = createFeatureSelector<%PARENT_STORE%, %STORE_NAME%>('%storeName%');

export const SelectStoreLoading = createSelector(
    %storeName%Store,
    (store: %STORE_NAME%Store) => store.loading
)
`
    return template;
}

const NewReducerModuleFile = function () {
    const template = `
import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import * as %STORE_NAME%Reducer from './%storeName%.reducers';

@NgModule({
    imports: [
        StoreModule.forFeature('%storeName%', %STORE_NAME%Reducer.reducer)
    ]
})
export class %STORE_NAME%ReducerModule { }`
    return template;
}

const NewEffectFile = function () {
    template = `
import { Injectable } from '@angular/core';
import { of, zip } from 'rxjs';
import { switchMap, catchError, mergeMap, withLatestFrom, concatMap } from 'rxjs/operators';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { %STORE_NAME%Service } from './%storeName%.service';
import {
    %ACTION_PREFIX%DemoTrigger,
    %ACTION_PREFIX%DemoResponse
} from './%storeName%.actions';
import { %PARENT_STORE%Store } from '../%parentStore%.models';

@Injectable()
export class %STORE_NAME%StoreEffects {
    constructor(
        private actions$: Actions<Action>,
        private store: Store<%PARENT_STORE%Store>,
        private %storeName%Service: %STORE_NAME%Service,
    ) { }
    
}`
    return template;
}

const NewServiceFile = function () {
    template = `
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable()
export class %STORE_NAME%Service {
    constructor(
        private http: HttpClient
    ) {}
    %actionName%$(val: string):Observable<any>{
        return of("HELLO WORLD: [" + val + "], FROM YOUR %STORE_NAME%Service, the %actionName% function");
    }
}
`
}

module.exports = {
    ActionResponse: ActionResponse,
    ActionFileHeader: ActionFileHeader,
    ParentAppStoreFile: ParentAppStoreFile,
    ActionTrigger: ActionTrigger,
    EffectChain: EffectChain,
    NewEffectFile: NewEffectFile,
    ActionEffectChain: ActionEffectChain,
    NoActionEffectChain: NoActionEffectChain,
    NewReducerModuleFile: NewReducerModuleFile,
    NewModelsFile: NewModelsFile,
    ReducerResponse: ReducerResponse,
    ReducerTrigger: ReducerTrigger,
    NewSelectorsFile: NewSelectorsFile,
    NewServiceFile: NewServiceFile
};