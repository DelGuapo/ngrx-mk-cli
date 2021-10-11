const yargs = require('yargs');
const rdx = require('./reduxHelper');
const argv = yargs
    .command('initStore', 'Initializes a store module within an angular module', {
        initStore: {
            description: 'Initializes a store module within an angular module',
            type: 'number',
        }
    })
    .command('addStore', 'Builds a store and injects into your existing parent store module', {
        addStore: {
            description: 'Builds a store and injects into your existing parent store module',
            type: 'number',
            requiresArg: ['store', 'parent']
        }
    })
    .command('addAction', 'Injects an action into the provided store module', {
        addAction: {
            description: 'Injects an action into the provided store module',
            type: 'number',
        }
    })
    .option('store', {
        alias: 's',
        description: 'Name of action|store',
        type: 'string',
        requiresArg: true,
    })
    .option('parentStore', {
        alias: 'ps',
        description: 'Name of parent store',
        type: 'string',
        default: 'app'
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
    .option('module', {
        alias: 'mod',
        description: 'Add Effects Module to Angular Module',
        type: 'string',
        default: 'app.module'
    })
    .option('actionPrefix', {
        alias: 'apx',
        description: 'Prefix of Action',
        type: 'string',
        default: "axn"
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
    }).option('project', {
        alias: 'prj',
        description: 'Defines which project to search.  Only applicable to angular project scaffolding.',
        type: 'string'
    })
    .help()
    .alias('help', 'h')
    .argv;

const cmd = argv['_'];

if (cmd.length == 0) {
    console.log(`Please specify command`)
    process.exit(1)
}

if (cmd.includes('initStore')) {
    console.log("=============[ INITIALIZE STORE ]===============");
    if (argv.mod == undefined || argv.module == ''){
        console.log(`Please specify angular module with -angularModule or --ng`)
        process.exit(1)
    }
    console.log(argv)
    rdx.InitStore(argv.mod,argv.prj);
}

if (cmd.includes('addStore')) {
    console.log("=============[ ADD STORE ]===============");
    console.log(argv)
}

if (cmd.includes('addAction')) {
    console.log("=============[ ADD ACTION ]===============");
    console.log(argv)
}