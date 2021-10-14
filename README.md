# ngrx-cli
1. Clone the repo in your `/projects` folder
    - `git clone https://github.com/DelGuapo/ngrx-mk-cli.git`
1. Install dependencies
    - `cd /ngrx-mk-cli`
    - `npm i`
1. Initialize your app to use NGRX.
    - `node ngrx-cli.js init --project <<project-name>>`
1. Add a store
    - `node ngrx-cli.js init --project <<project-name>> --name <<store-name>>`
1. Add an action into your store
   - `node ngrx-cli.js addAction --project <<project-name>> --name <<action-name>> --store <<store-name>>`    