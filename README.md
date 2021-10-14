# ngrx-cli
1. Clone the repo in your `/projects` folder
    - `git clone https://github.com/DelGuapo/ngrx-mk-cli.git`
1. Install dependencies
    - `cd /ngrx-mk-cli`
    - `npm i`
1. Initialize your app to use NGRX.
    - `node ngrx-cli.js init --project <<project-name>>`
1. Add a store
    - `node ngrx-cli.js addStore --project <<project-name>> --name <<store-name>>`
1. Add an action into your store
   - `node ngrx-cli.js addAction --project <<project-name>> --name <<action-name>> --store <<store-name>>`    

# Example
```
node ngrx-cli.js init --project <<project-name>>
node ngrx-cli.js addStore --project <<project-name>> --name kitchen
node ngrx-cli.js addAction --project <<project-name>> --name prepare --store
node ngrx-cli.js addAction --project <<project-name>> --name eat --store
node ngrx-cli.js addAction --project <<project-name>> --name cleanup --store
```