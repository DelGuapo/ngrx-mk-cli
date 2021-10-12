const { Console } = require('console');
const fs = require('fs');
const find = require('./find');
const templateBuild = require('./reduxTemplate');
const DIR_CHAR = '\\';
const STATE_DIR = "state";
const STATE_TS = "app.store.ts";
const MOD_EFFECTS = "REDUX_APP_EFFECTS";
const PARENT_APP_STORE = "APP_STORE";
const parentAppStore = "appStore";
const parentStoreRoot = "app";
const MOD_REF_POINT = "const " + MOD_EFFECTS + " = [";
const WELCOME_MESSAGE = "HELLO WORLD FROM REDUX HELPER";

const upperFirstChar = function (str) {
    if (str == '') {
        return '';
    }
    var arr = str.toLowerCase().split('');
    var firstC = arr.shift().toUpperCase();
    return firstC + arr.join('')
}

const cleanStoreName = function (name) {
    return name.toLowerCase().replace('store', '');
}

const NameFile = function (name, prefix, postfix, cammelCase) {
    if (nm == '') {
        console.log(`Mising Name`)
        process.exit(1)
    }
    if (!cammelCase) {
        return upperFirstChar(prefix) + upperFirstChar(name) + upperFirstChar(postfix);
    }

    if (prefix == "") {
        return upperFirstChar(name) + upperFirstChar(postfix);
    }

    return upperFirstChar(prefix) + upperFirstChar(name) + upperFirstChar(postfix);
}

const jsonContent = function (path, projName) {
    jsn = fs.readFileSync(path, 'utf8');
    return JSON.parse(jsn);
}

const readAngularModuleContent = function (mod) {
    return fs.readFileSync(mod.ANGULAR_MODULE, 'utf8');
}
const insertNewSubStore = function (newStoreName, parentStoreContent) {
    const storeMatch = /APP_STORE\s?\{/s.exec(parentStoreContent)
    if (storeMatch == null) {
        throwExc("Could not parse Parent Store");
    }
    importContent = storeMatch;
    importIdxBegin = storeMatch.index;
    importIdxEnd = parentStoreContent.indexOf('{',importIdxBegin) + 1;
    whiteSpace = "\n\t";
    newStuff = whiteSpace + newStoreName + ',' + '\n'
    const preNewStuff = parentStoreContent.substring(0,importIdxBegin);
    const postNewStuff = parentStoreContent.substring(importIdxEnd + 1);
    const importPhrase = parentStoreContent.substring(importIdxBegin,importIdxEnd)
    return preNewStuff + importPhrase +  newStuff + postNewStuff;
}

const insertNgModuleImport = function (newImportArray, modContent) {
    const importMatch = /(imports:\s?\[(.*?)\])/s.exec(modContent)
    if (importMatch == null) {
        throwExc("Could not parse @NgModule.imports");
    }
    importContent = importMatch;
    importIdxBegin = importMatch.index;
    importIdxEnd = modContent.indexOf('[',importIdxBegin) + 1;
    whiteSpace = "\n\t";
    try {
        const regWhite = new RegExp(/\[\s+(?=[^\s\\])/, 'sg')
        const whiteGroups = importContent[0].match(regWhite);
        whiteSpace = whiteGroups[0];
        whiteSpace = whiteSpace.replace('[', '');
    } catch (err) {
    }
    newStuff = newImportArray.map(imp => whiteSpace + imp).join(",") + ','
    const preNewStuff = modContent.substring(0,importIdxBegin);
    const postNewStuff = modContent.substring(importIdxEnd + 1);
    const importPhrase = modContent.substring(importIdxBegin,importIdxEnd)
    return preNewStuff + importPhrase +  newStuff + postNewStuff;
}

const insertNgModuleProvider = function (newImportArray, modContent) {
    const importMatch = /(providers:\s?\[(.*?)\])/s.exec(modContent)
    if (importMatch == null) {
        throwExc("Could not parse @NgModule.providers");
    }
    importContent = importMatch;
    importIdxBegin = importMatch.index;
    importIdxEnd = modContent.indexOf('[',importIdxBegin) + 1;
    whiteSpace = "\n\t";
    try {
        const regWhite = new RegExp(/\[\s+(?=[^\s\\])/, 'sg')
        const whiteGroups = importContent[0].match(regWhite);
        whiteSpace = whiteGroups[0];
        whiteSpace = whiteSpace.replace('[', '');
    } catch (err) {
    }
    newStuff = newImportArray.map(imp => whiteSpace + imp).join(",") + ','
    const preNewStuff = modContent.substring(0,importIdxBegin);
    const postNewStuff = modContent.substring(importIdxEnd + 1);
    const importPhrase = modContent.substring(importIdxBegin,importIdxEnd)
    return preNewStuff + importPhrase +  newStuff + postNewStuff;
}

const WriteFile = function (filePath, content) {
    try {
        fs.writeFileSync(filePath, content)
        console.log("Created file " + filePath);
    } catch (err) {
        console.log(err);
        throwExc("Could not create file " + filePath);
    }
}

const seedEffectsIntoAngularMod = function (str) {
    return str.replace('@NgModule', MOD_REF_POINT + "LogEffects]; \n\n@NgModule")
}

const findRefPointRegex = function (str) {
    regex = new RegExp(/(?<=REDUX_APP_EFFECTS).*$/, "s");
    return str.match(regex)
}

const findFirstOccuranceInSquareBrackets = function (str) {
    regex = new RegExp(/(?<=\[).+?(?=\])/, "s");
    return str.match(regex)[0]
}


const listEffectMods = function (modContent) {
    refPoint = findRefPointRegex(modContent);
    if (refPoint == null || refPoint.length == 0) {
        return []
    }
    effc = findFirstOccuranceInSquareBrackets(refPoint[0]);
    return effc.split(",");
}
const ListEffectsInModule = function (modName, proj = undefined) {
    modContent = FetchAngModContent(modName, proj);
    return listEffectMods(modContent);
}

const appendEffectIntoAngularMod = function (newEffect, modContent) {
    effects = listEffectMods(modContent);
    effects.push(newEffect);
    oldRefMatch = findRefPointRegex(modContent);
    regEffects = new RegExp(/(?<=\[).+?(?=\])/, "s");
    newRef = oldRefMatch[0].replace(regEffects, effects.join(','));
    newMod = modContent.substring(0, oldRefMatch.index) + newRef
    return newMod;
}


const prependRefTag = function (strArray, modContent) {
    return strArray.reduce((p, c) => {
        p = p.replace(MOD_REF_POINT, c + '\n' + MOD_REF_POINT)
        return p;
    }, modContent);
}

const createDir = function (dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
}

const FetchAngModContent = function (modName, proj = undefined) {
    mod = GetPaths(modName, proj);
    modContent = readAngularModuleContent(mod);
    return modContent
}

const FetchStoreContent = function (modName, proj = undefined) {
    mod = GetPaths(modName, proj);
    return fs.readFileSync(mod.PARENT_NGRX_MODULE, 'utf8');
}

const InitStore = function (modName, proj = undefined) {
    mod = GetPaths(modName, proj);
    createDir(mod.NGRX_ROOT)
    WriteFile(mod.PARENT_NGRX_MODULE,
        templateBuild.NewParentAppStoreFile()
            .replace(new RegExp(/\%PARENT_APP_STORE%/, 'g'), PARENT_APP_STORE)
    );
    modContent = FetchAngModContent(modName, proj);
    existingExports = listEffectMods(modContent);
    if (existingExports.length > 0) {
        console.log("Angular Module Already Initialized");
        return;
    }
    /* START TO MODIFY app.Module.ts */
    console.log("======== SEEDING EFFECTS INTO ANGULAR MODULE ===============");
    modContent = seedEffectsIntoAngularMod(modContent);

    console.log("======== PREPENDING DEPENDENCIES ===============");
    modContent = prependRefTag([
        "import { StoreModule } from '@ngrx/store';",
        "import { EffectsModule } from '@ngrx/effects';",
        "import { StoreDevtoolsModule } from '@ngrx/store-devtools';",
        "/* " + WELCOME_MESSAGE + " */",
        "const isLocalHost = window.location.href.indexOf('localhost') > -1;",
        buildImportStoreStatement("LogEffects", "", popTs(STATE_TS), "."),
        ,
    ], modContent);

    console.log("======== MODIFYING ANGULAR IMPORTS ===============");
    modContent = insertNgModuleImport([
        "StoreModule.forRoot({})",
        "EffectsModule.forRoot(" + MOD_EFFECTS + ")",
        "StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: isLocalHost})"
    ], modContent);

    console.log("======== SAVING TO FILE ===============");
    WriteFile(mod.ANGULAR_MODULE, modContent);
    return 0;
}

const buildImportStoreStatement = function (modName, storeName, fileName, relativeDir) {
    return (storeName == "") ?
        "import { " + modName + " } from '" + relativeDir + "/" + STATE_DIR + "/" + fileName + "';" :
        "import { " + modName + " } from '" + relativeDir + "/" + STATE_DIR + "/" + storeName + "/" + fileName + "';";
}

const AddStore = function (name, prefixObj, modName, proj = undefined) {
    const rootName = cleanStoreName(name);
    const rootNameUpper = upperFirstChar(rootName);
    storeName = rootName + 'Store';
    STORE_NAME = upperFirstChar(rootName) + 'Store';
    mod = GetPaths(modName, proj);
    STORE_DIR = mod.NGRX_ROOT + DIR_CHAR + rootName;

    modContent = FetchAngModContent(modName, proj);
    storeContent = FetchStoreContent(modName,proj);
    storeContent = insertNewSubStore(`${rootName}:${STORE_NAME}`,storeContent)
    storeContent = `import { ${STORE_NAME} } from './${rootName}/${rootName}.models';` + storeContent;

    existingExports = listEffectMods(modContent);
    if (existingExports.length == 0) {
        console.log("Store not yet initialized.  Run initStore command.");
        return 1;
    }
    if (existingExports.indexOf(`${STORE_NAME}Effects`) > -1) {
        console.log(`The ${rootName} cannot be added; There is already a ${STORE_NAME}Effects imported into your angular module.  Aborting`);
        return 1;
    }

    /* make new files */
    createDir(STORE_DIR);

    /* EFFECTS */
    WriteFile(STORE_DIR + DIR_CHAR + rootName + ".effects.ts",
        templateBuild.NewEffectFile()
            .replace(new RegExp(/\%PARENT_APP_STORE%/, 'g'), PARENT_APP_STORE)
            .replace(new RegExp(/\%STORE_NAME%/, 'g'), STORE_NAME)
            .replace(new RegExp(/\%storeName%/, 'g'), storeName)
            .replace(new RegExp(/\%store%/, 'g'), rootName)
            .replace(new RegExp(/\%EFFECT_PREFIX%/, 'g'), prefixObj.EFFECT)
            .replace(new RegExp(/\%ACTION_PREFIX%/, 'g'), prefixObj.ACTION)
            .replace(new RegExp(/\%parentStoreRoot%/, 'g'), parentStoreRoot)
            .replace(new RegExp(/\%STORE_UPPER%/, 'g'), rootNameUpper)
    );

    /* MODELS */
    WriteFile(STORE_DIR + DIR_CHAR + rootName + ".models.ts",
        templateBuild.NewModelsFile()
            .replace(new RegExp(/\%STORE_NAME%/, 'g'), STORE_NAME)
            .replace(new RegExp(/\%storeName%/, 'g'), rootName)
    );

    /* SERVICE */
    WriteFile(STORE_DIR + DIR_CHAR + rootName + ".service.ts",
        templateBuild.NewServiceFile()
            .replace(new RegExp(/\%STORE_UPPER%/, 'g'), rootNameUpper)
    );

    /* ACTIONS */
    WriteFile(STORE_DIR + DIR_CHAR + rootName + ".actions.ts",
        templateBuild.NewActionsFile()
            .replace(new RegExp(/\%ACTION_PREFIX%/, 'g'), prefixObj.ACTION)
            .replace(new RegExp(/\%STORE_UPPER%/, 'g'), rootNameUpper)
    );

    /* MODULE */
    WriteFile(STORE_DIR + DIR_CHAR + rootName + ".module.ts",
        templateBuild.NewReducerModuleFile()
            .replace(new RegExp(/\%STORE_NAME%/, 'g'), STORE_NAME)
            .replace(new RegExp(/\%storeName%/, 'g'), rootName)
            .replace(new RegExp(/\%store%/, 'g'), rootName)
    );

    /* REDUCER */
    WriteFile(STORE_DIR + DIR_CHAR + rootName + ".reducers.ts",
        templateBuild.NewReducerFile()
            // .replace(new RegExp(/\%PARENT_APP_STORE%/, 'g'), PARENT_APP_STORE)
            .replace(new RegExp(/\%STORE_NAME%/, 'g'), STORE_NAME)
            .replace(new RegExp(/\%storeName%/, 'g'), storeName)
            .replace(new RegExp(/\%store%/, 'g'), rootName)
            // .replace(new RegExp(/\%EFFECT_PREFIX%/, 'g'), prefixObj.EFFECT)
            .replace(new RegExp(/\%ACTION_PREFIX%/, 'g'), prefixObj.ACTION)
            // .replace(new RegExp(/\%parentStoreRoot%/, 'g'), parentStoreRoot)
            .replace(new RegExp(/\%STORE_UPPER%/, 'g'), rootNameUpper)
    );

    /* SELECTORS */
    WriteFile(STORE_DIR + DIR_CHAR + rootName + ".selectors.ts",
        templateBuild.NewSelectorsFile()
            .replace(new RegExp(/\%PARENT_APP_STORE%/, 'g'), PARENT_APP_STORE)
            .replace(new RegExp(/\%STORE_NAME%/, 'g'), STORE_NAME)
            .replace(new RegExp(/\%storeName%/, 'g'), storeName)
            .replace(new RegExp(/\%store%/, 'g'), rootName)
            .replace(new RegExp(/\%SELECTOR_PREFIX%/, 'g'), prefixObj.SELECTOR)
            .replace(new RegExp(/\%parentStoreRoot%/, 'g'), parentStoreRoot)
            .replace(new RegExp(/\%STORE_UPPER%/, 'g'), rootNameUpper)
    );


    /* START TO MODIFY app.Module.ts */
    // console.log("======== SEEDING EFFECTS INTO ANGULAR MODULE ===============");
    modContent = appendEffectIntoAngularMod(STORE_NAME + 'Effects', modContent);

    // console.log("======== PREPENDING DEPENDENCIES ===============");

    modContent = prependRefTag([
        `import { ${rootNameUpper}Service } from './state/${rootName}/${rootName}.service';`,
        `import { ${STORE_NAME}Module } from './state/${rootName}/${rootName}.module';`,
        `import { ${STORE_NAME}Effects } from './state/${rootName}/${rootName}.effects';`
    ], modContent);

    // console.log("======== MODIFYING ANGULAR IMPORTS ===============");
    modContent = insertNgModuleImport([
        `${STORE_NAME}Module`,
    ], modContent);
    modContent = insertNgModuleProvider([
        `${rootNameUpper}Service`,
    ],modContent);
    // console.log("======== SAVING TO FILE ===============");
    WriteFile(mod.ANGULAR_MODULE, modContent);
    WriteFile(mod.PARENT_NGRX_MODULE,storeContent);

    const howTo = templateBuild.HowToUseTemplate()
        .replace(new RegExp(/\%PARENT_APP_STORE%/, 'g'), PARENT_APP_STORE)
        .replace(new RegExp(/\%STORE_NAME%/, 'g'), STORE_NAME)
        .replace(new RegExp(/\%storeName%/, 'g'), storeName)
        .replace(new RegExp(/\%store%/, 'g'), rootName)
        .replace(new RegExp(/\%SELECTOR_PREFIX%/, 'g'), prefixObj.SELECTOR)
        .replace(new RegExp(/\%parentStoreRoot%/, 'g'), parentStoreRoot)
        .replace(new RegExp(/\%STORE_UPPER%/, 'g'), rootNameUpper)
        .replace(new RegExp(/\%ACTION_PREFIX%/, 'g'), prefixObj.ACTION)
    console.log(howTo)
    return 0;
}

const throwExc = function (msg) {
    console.error(msg);
    process.exit(1)
}
const GetPaths = function (mod, proj) {
    const angMod = find.AngularModule(mod, proj);
    const root = angMod.split(DIR_CHAR).slice(0, -1);
    const stateFolder = root.join(DIR_CHAR) + DIR_CHAR + STATE_DIR;
    return {
        "PARENT_NGRX_MODULE": stateFolder + DIR_CHAR + parentStoreRoot + ".store.ts",
        "ANGULAR_MODULE": angMod,
        "NGRX_ROOT": stateFolder,
    }
}
const popTs = function (modName) {
    const trgArr = modName.split(".");
    trgArr.pop();
    return trgArr.join(".");
}
const Test = function (storeName, modName, proj = undefined) {
    console.log(storeName, modName, proj);
    // t = AddStore(storeName,modName,proj);
    // t = ListEffectsInModule(modName,proj);
    // console.log(t);
}

module.exports = {
    NameFile: NameFile,
    InitStore: InitStore,
    AddStore: AddStore,
    GetPaths: GetPaths,
    ListEffectsInModule: ListEffectsInModule,
    Test: AddStore,
};



