import { Injectable } from '@angular/core';
import { of, zip } from 'rxjs';
import { switchMap, catchError, mergeMap, withLatestFrom, concatMap } from 'rxjs/operators';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { {STORE_NAME}Service } from './{storeName}.service';
import {
    ACTION_PREFIX}DemoTrigger,
    {ACTION_PREFIX}DemoResponse
} from './{storeName}.actions';
import { {PARENT_STORE}Store } from '../{parentStore}.models';

@Injectable()
export class {STORE_NAME}StoreEffects {
    constructor(
        private actions$: Actions<Action>,
        private store: Store<{PARENT_STORE}Store>,
        private {storeName}Service: {STORE_NAME}Service,
    ) { }
    {EFFECT_BUNDLE}
}