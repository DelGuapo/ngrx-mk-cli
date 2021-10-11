import { createSelector, createFeatureSelector } from '@ngrx/store';

export const {storeName}Store = createFeatureSelector<{PARENT_STORE}, {STORE_NAME}>('{storeName}');

export const SelectStoreLoading = createSelector(
    {storeName}Store,
    (store: {STORE_NAME}Store) => store.loading
)