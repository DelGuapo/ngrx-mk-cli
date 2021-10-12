const yargs = require('yargs');
const rdx = require('./reduxHelper');
const find = require('./find');
const argv = yargs
    .command('initStore', 'Initializes a store module within an angular module', {
        initStore: {
            description: 'Initializes a store module within an angular module',
            type: 'number',
        }
    })
    .option('project', {
        alias: 'prj',
        description: 'Defines which project to search.  Only applicable to angular project scaffolding.',
        type: 'string'
    })
    .option('module', {
        alias: 'ng',
        description: 'Add Effects Module to Angular Module',
        type: 'string',
        default: 'app.module'
    })
    .command('addStore', 'Builds a store and injects into your existing parent store module', {
        addStore: {
            description: 'Builds a store and injects into your existing parent store module',
            type: 'number',
            requiresArg: ['store', 'parent']
        }
    })
    .option('actions', {
        alias: 'ac',
        description: 'Add Actions Class',
        type: 'boolean',
        default: true
    })
    .option('effects', {
        alias: 'ef',
        description: 'Add Effects Class',
        type: 'boolean',
        default: true
    })
    .option('reducers', {
        alias: 'rd',
        description: 'Add Reducers Class',
        type: 'boolean',
        default: true
    })
    .option('selectors', {
        alias: 'sl',
        description: 'Add Selectors Class',
        type: 'boolean',
        default: true
    })
    .option('service', {
        alias: 'sv',
        description: 'Add Service Class',
        type: 'boolean',
        default: true
    })
    .option('actionPrefix', {
        alias: 'apx',
        description: 'Prefix of Action',
        type: 'string',
        default: "action"
    })
    .option('effectPrefix', {
        alias: 'epx',
        description: 'Prefix of effect',
        type: 'string',
        default: "upon"
    })
    .option('selectorPrefix', {
        alias: 'spx',
        description: 'Prefix of selector',
        type: 'string',
        default: "sel"
    })
    .command('addAction', 'IN PROGRESS!!! Injects an action into the provided store module', {
        addAction: {
            description: 'IN PROGRESS!!! Injects an action into the provided store module',
            type: 'number',
        }
    })
    // .option('store', {
    //     alias: 'st',
    //     description: 'Name of Store to add action',
    //     type: 'string',
    //     requiresArg: true,
    // })
    .option('name', {
        alias: 'n',
        description: 'Name of action',
        type: 'string',
        requiresArg: true,
    })
    // .option('effects', {
    //     alias: 'ef',
    //     description: 'Add Action in Effects Class',
    //     type: 'boolean',
    //     default: true
    // })
    // .option('reducers', {
    //     alias: 'rd',
    //     description: 'Add Reducers Class',
    //     type: 'boolean',
    //     default: true
    // })
    .help()
    .alias('help', 'h')
    .argv;

const cmd = argv['_'];

const isEmpty = function (str) {
    console.log(str);
    return str == undefined || str == '' || str == null;
}

const PREFIXES = {
    'ACTION':argv.apx || '',
    'EFFECT':argv.epx || '',
    'SELECTOR':argv.spx || '',
}

if (isEmpty(argv.module)) {
    console.log(`Please specify angular module with -=module or -ng`)
    process.exit(1)
}

if (cmd.length == 0) {
    console.log(`Please specify command`)
    process.exit(1)
}

if (cmd.includes('test')){
    console.log("=============[ TEST ]===============");
    
    // rdx.Test(argv.name, PREFIXES, argv.module, argv.prj);
}

if (cmd.includes('initStore')) {
    console.log("=============[ INITIALIZE STORE ]===============");
    rdx.InitStore(argv.module, argv.prj);
}

if (cmd.includes('addStore')) {
    console.log("=============[ ADD STORE ]===============");
    rdx.AddStore(argv.name, PREFIXES, argv.module, argv.prj);
}

if (cmd.includes('addAction')) {
    console.log("IN PROGRESS");
    // console.log(argv)
}