const ReducerResponse = function () {
    template = `
    on(%ACTION_PREFIX%%ACTION_NAME%Response, (state, { output }) => {
        return {...state,loading:false }
    }),`
    return template;
}

const ReducerTrigger = function () {
    template = `
    on(%ACTION_PREFIX%%ACTION_NAME%Trigger, (state, { input }) => {
        return {...state,loading:true }
    }),`
    return template;
}

const ActionResponse = function () {
    template = `
export const %ACTION_PREFIX%%ACTION_NAME%Response = createAction('[%store%] %ACTION_NAME%Response',
    props<{ output: any }>()
)`
    return template;
}

const ActionTrigger = function () {
    template = `
export const %ACTION_PREFIX%%ACTION_NAME%Trigger = createAction('[%store%] %ACTION_NAME%Trigger',
    props<{ input: any }>()
);`
    return template;
}

const NewActionsFile = function () {
    const template = "import { createAction, props } from '@ngrx/store';\n\n/* Add new actions to your store in this file*/";
    const trigg = ActionTrigger().replace(new RegExp(/\%ACTION_NAME%/, 'g'), 'Demo')
    const rsp = ActionResponse().replace(new RegExp(/\%ACTION_NAME%/, 'g'), 'Demo')

    return template + trigg + rsp;
}

const NewParentAppStoreFile = function () {
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
const ResponseEffectChain = function () {
    return `%ACTION_PREFIX%%ACTION_NAME%Response({ output: rsp })`
}

const EffectChain = function (effectChainFunction) {
    template =
        `   %EFFECT_PREFIX%%ACTION_NAME%$ = createEffect(() =>
        this.actions$.pipe(
            ofType(%ACTION_PREFIX%%ACTION_NAME%Trigger),
            switchMap(action => {
                const req$ = this.%store%Service.%ACTION_NAME%$(action.input);
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
/* this file will contain any models associated with your %STORE_NAME%.  Add new models below */
export interface %STORE_NAME% {
    loading: boolean;
    %storeName%: any;
}`
    return template;
}

const NewSelectorsFile = function () {
    const template = `
import { createSelector, createFeatureSelector } from '@ngrx/store';
import { %PARENT_APP_STORE% } from '../%parentStoreRoot%.store';
import {
    %STORE_NAME%
} from './%store%.models';

export const %storeName% = createFeatureSelector<%PARENT_APP_STORE%, %STORE_NAME%>('%store%');

export const %SELECTOR_PREFIX%Loading = createSelector(
    %storeName%,
    (store: %STORE_NAME%) => store.loading
)
export const %SELECTOR_PREFIX%%STORE_UPPER% = createSelector(
    %storeName%,
    (store: %STORE_NAME%) => {
        console.log("NGRX - SELECTOR: your %SELECTOR_PREFIX%%STORE_UPPER% returns a stream of the most recent value in your store");
        return store.%store%;
    })
`
    return template;
}

const NewReducerModuleFile = function () {
    const template = `
import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import * as %STORE_NAME%Reducer from './%store%.reducers';

@NgModule({
    imports: [
        StoreModule.forFeature('%storeName%', %STORE_NAME%Reducer.reducer)
    ]
})
export class %STORE_NAME%Module { }`
    return template;
}

const NewEffectFile = function () {
    template = `
import { Injectable } from '@angular/core';
import { of, zip } from 'rxjs';
import { switchMap, catchError, mergeMap, withLatestFrom, concatMap } from 'rxjs/operators';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { %STORE_UPPER%Service } from './%store%.service';
import {
    %ACTION_PREFIX%DemoTrigger,
    %ACTION_PREFIX%DemoResponse
} from './%store%.actions';
import { %PARENT_APP_STORE%, NoAction } from '../%parentStoreRoot%.store';

@Injectable()
export class %STORE_NAME%Effects {
    constructor(
        private actions$: Actions<Action>,
        private store: Store<%PARENT_APP_STORE%>,
        private %store%Service: %STORE_UPPER%Service,
    ) { }
    

    %EFFECT_PREFIX%Demo$ = createEffect(() =>
        this.actions$.pipe(
            ofType(%ACTION_PREFIX%DemoTrigger),
            switchMap(action => {
                console.log("NGRX - EFFECT: upon invoking [%ACTION_PREFIX%DemoTrigger], n chain of effects is followed.  The effect must be an observable.");
                const req$ = this.%store%Service.Demo$(action.input);
                return zip(of(action), req$)
            }),
            switchMap(([action, rsp]) => {
                console.log("NGRX - EFFECT: The response to the %store%Service.Demo$ function has been received. In this example, [%ACTION_PREFIX%DemoTrigger] invokes [%ACTION_PREFIX%DemoResponse].  You can add other actions in this response array to trigger multiple actions.  If you don't need a response, use NoAction()");
                return [%ACTION_PREFIX%DemoResponse({ output: rsp }),NoAction()]
                // return [NoAction()]   /* <<=== this is used if you do not require any response actions to be invoked. */
            }),
            catchError((err, cought) => {
                console.error(err);
                return cought;
            })
        )
    )
}`
    return template;
}

const NewServiceFile = function () {
    template = `
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable()
export class %STORE_UPPER%Service {
    constructor(
        private http: HttpClient
    ) {}
    Demo$(val: string):Observable<any>{
        console.log("NGRX - SERVICE: the Demo$ function simulates an HTTP request by piping a 3 second delay");
        return of("HELLO WORLD: [" + val + "], FROM YOUR %STORE_UPPER%Service, the demo function")
            .pipe(delay(3000));
    }
}
`
    return template;
}
const NewServiceFunction = function () {
    template = `
%ACTION_NAME%$(val: string):Observable<any>{
    return of("HELLO WORLD: [" + val + "], FROM YOUR NEW %ACTION_NAME%$ SERVICE");
}
`
    return template
}

const ImportActionsStatement = function () {
    template = `import { %ACTION_PREFIX%%ACTION_NAME%Trigger, %ACTION_PREFIX%%ACTION_NAME%Response } from './%store%.actions';\n`
    return template;
}


const NewReducerFile = function () {
    template = `
import { createReducer, on, Action } from '@ngrx/store';
import {
    %ACTION_PREFIX%DemoTrigger,
    %ACTION_PREFIX%DemoResponse
} from './%store%.actions';

import {
    %STORE_NAME%
} from './%store%.models';

const initial%STORE_UPPER%State: %STORE_NAME% = {
    loading: false,
    %store%: undefined
}

export const %STORE_NAME%Reducer = createReducer(
    initial%STORE_UPPER%State,
    on(%ACTION_PREFIX%DemoTrigger, (state, { input }) => {
        console.log("NGRX - REDUCER: Your app state is immutible, and can only be changed within your reducer.  The %ACTION_PREFIX%DemoTrigger changes the app-state here");
        return { ...state, loading: true, %store%: undefined }
    }),
    on(%ACTION_PREFIX%DemoResponse, (state, { output }) => {
        console.log("NGRX - REDUCER: Your app state is immutible, and can only be changed within your reducer.  The %ACTION_PREFIX%DemoResponse changes the app-state here");
        return { ...state, loading: false, %store%: output }
    })
);

export function reducer(state: %STORE_NAME% | undefined, action: Action) {
    return %STORE_NAME%Reducer(state, action);
}
`
    return template;
}

const HowToUseNewStoreTemplate = function () {
    template = `
+++++++++++++[    IN YOUR COMPONENT CLASS   ]++++++++++++++
import { Store, select } from '@ngrx/store';
import { %PARENT_APP_STORE% } from './state/app.store';
import { %SELECTOR_PREFIX%%STORE_UPPER%, %SELECTOR_PREFIX%Loading } from './state/%store%/%store%.selectors'
import { %ACTION_PREFIX%DemoTrigger } from './state/%store%/%store%.actions';

demoSelector$: Observable<any>;
loading$: Observable<boolean>;
constructor(..., 
    private store: Store<%PARENT_APP_STORE%>
) {
    this.demoSelector$ = store.pipe(select(%SELECTOR_PREFIX%%STORE_UPPER%));
    this.loading$ = store.pipe(select(%SELECTOR_PREFIX%Loading)); 
}
triggerYourEffect(){
    this.store.dispatch(%ACTION_PREFIX%DemoTrigger({ input: "Your Input Value" }));
}


+++++++++++++[    IN YOUR COMPONENT HTML   ]++++++++++++++

<button (click)="triggerYourEffect()">TRIGGER YOUR ACTION <span *ngIf="loading$ | async">Loding. . . </span></button>

<h6>Your Content will show below asynchronously</h6>
<code *ngIf="demoSelector$ | async as yourContent"> {{yourContent}}</code>
    
`
    return template;
}

const HowToUseNewActionTemplate = function () {
    template = `
+++++++++++++[    IN YOUR COMPONENT CLASS   ]++++++++++++++
import { Store, select } from '@ngrx/store';
import { %PARENT_APP_STORE% } from './state/app.store';
import { %ACTION_PREFIX%%ACTION_NAME%Trigger } from './state/%store%/%store%.actions';



constructor(..., private store: Store<%PARENT_APP_STORE%>) {
}
triggerYourEffect(){
    this.store.dispatch(%ACTION_PREFIX%%ACTION_NAME%Trigger({ input: "Your Input Value" }));
}


+++++++++++++[    IN YOUR COMPONENT HTML   ]++++++++++++++

<button (click)="triggerYourEffect()">TRIGGER YOUR ACTION </button>
   
`
    return template;
}


module.exports = {
    ActionResponse: ActionResponse,
    ActionTrigger: ActionTrigger,
    EffectChain: EffectChain,
    ResponseEffectChain: ResponseEffectChain,
    NoActionEffectChain: NoActionEffectChain,
    ReducerResponse: ReducerResponse,
    ReducerTrigger: ReducerTrigger,
    NewActionsFile: NewActionsFile,
    NewModelsFile: NewModelsFile,
    NewParentAppStoreFile: NewParentAppStoreFile,
    NewEffectFile: NewEffectFile,
    NewReducerModuleFile: NewReducerModuleFile,
    NewSelectorsFile: NewSelectorsFile,
    NewServiceFile: NewServiceFile,
    NewReducerFile: NewReducerFile,
    ImportActionsStatement: ImportActionsStatement,
    NewServiceFunction: NewServiceFunction,
    HowToUseNewStoreTemplate: HowToUseNewStoreTemplate,
    HowToUseNewActionTemplate: HowToUseNewActionTemplate
};



