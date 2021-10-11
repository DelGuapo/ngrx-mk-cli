import { Injectable } from '@angular/core';
import { Actions, createEffect } from '@ngrx/effects';
import { tap } from 'rxjs/operators';

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
}