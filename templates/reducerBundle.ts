/* {EFFECT_PREFIX}{ACTION_NAME} - REDUCERS GENERATED BY NGRX-HELPER */
on({ACTION_PREFIX}{ACTION_NAME}Trigger, (state, { input }) => {
    return {...state,loading:true }
}),
on({ACTION_PREFIX}{ACTION_NAME}Response, (state, { output }) => {
    return {...state,loading:false }
})