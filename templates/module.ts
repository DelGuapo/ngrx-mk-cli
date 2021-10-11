import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import * as {STORE_NAME}Reducer from './{storeName}.reducers';

@NgModule({
    imports: [
        StoreModule.forFeature('{storeName}', {STORE_NAME}Reducer.reducer)
    ]
})
export class {STORE_NAME}ReducerModule { }