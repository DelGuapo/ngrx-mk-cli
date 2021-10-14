# ngrx-cli
## Clone the repo in your `/projects` folder
`git clone https://github.com/DelGuapo/ngrx-mk-cli.git`
## Install dependencies
`cd /ngrx-mk-cli`
`npm i`
## Initialize your app to use NGRX 
`node ngrx-cli.js init --project <<project-name>>`
- This creates your `state/` folder and registers your store in your @angular module
```
app.module.ts
        .
        ├── state/
        │   ├── app.store.ts
```
## Add a store
`node ngrx-cli.js addStore --project <<project-name>> --name <<store-name>>`
- This creates a new directory containing redecurs, effects, selectors, models, etc...
- Each file contains a peice of your new store with *Demo* functions
```
app.module.ts
        .
        ├── state/
        │   ├── app.store.ts
        │   ├── new/
        │   │   ├── new.actions.ts      <<== Contains DemoTrigger, DemoResponse actions
        │   │   ├── new.effects.ts      <<== Contains UponDemo$ chained effect
        │   │   ├── new.module.ts       <<== Exports module to be used in your angular module
        │   │   ├── new.reducers.ts     <<== contains onDemoTrigger, onDemoResponse reducers
        │   │   ├── new.selectors.ts    <<== contains selectLoading$, selectNew selectors
        │   │   ├── new.service.ts      <<== contains a sample service call with pipe-delay
        │   ├── otherStore/
        │   ├── anotherStore/
```
- The cli also returns sample code of how to use your new *ActionDemoTrigger*, and *SelectLoading* selector
## Add an action into your store
`node ngrx-cli.js addAction --project <<project-name>> --name <<action-name>> --store <<store-name>>`    
- This creates new hooks into the store you provided
```
app.module.ts
        .
        ├── state/
        │   ├── app.store.ts
        │   ├── existing/
        │   │   ├── existing.actions.ts      <<== Adds new ActionTrigger, ActionResponse
        │   │   ├── existing.effects.ts      <<== Adds new UponAction$ chained effect
        │   │   ├── existing.module.ts       
        │   │   ├── existing.reducers.ts     <<== Adds new onActionTrigger, onActionResponse
        │   │   ├── existing.selectors.ts    
        │   │   ├── existing.service.ts      <<== Adds new Action function observable
        │   ├── otherStore/
        │   ├── anotherStore/
```

## Output Sample
```
/* THANKS FOR USING THIS CLI.  HERE IS SOME SAMPLE CODE FOR YOUR NEW STORE */
import { Store, select } from '@ngrx/store';
import { APP_STORE } from './state/app.store';
import { selKitchen, selLoading } from './state/kitchen/kitchen.selectors'
import { ActionDemoTrigger } from './state/kitchen/kitchen.actions';
import { Observable } from 'rxjs';

demoSelector$: Observable<any>;
loading$: Observable<boolean>;
constructor(private store: Store<APP_STORE>) {
    this.demoSelector$ = store.pipe(select(selKitchen));
    this.loading$ = store.pipe(select(selLoading));
}
triggerYourEffect(){
    this.store.dispatch(ActionDemoTrigger({ input: "Your Input Value" }));
}

+++++++++++++[    IN YOUR COMPONENT HTML   ]++++++++++++++

<button (click)="triggerYourEffect()">
    TRIGGER YOUR ACTION 
    <span *ngIf="loading$ | async">Loding. . .</span>
</button>

<h6>Your Content will show below asynchronously</h6>
<code *ngIf="demoSelector$ | async as yourContent"> {{yourContent}}</code>`
```