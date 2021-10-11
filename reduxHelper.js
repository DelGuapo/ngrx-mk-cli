
const modSearch = require('./moduleSearch');
const fs = require('fs');
const find = require('./find');
const DIR_CHAR = '\\';
const STATE_DIR = "state";
const STATE_TS = "app.store.ts";
const MOD_EFFECTS = "APP_EFFECTS"


const upperFirstChar = function (str) {
    if (str == '') {
        return '';
    }
    var arr = str.toLowerCase().split('');
    var firstC = arr.shift().toUpperCase();
    return firstC + arr.join('')
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

const InitStore = function (mod, proj = undefined) {
    mod = GetPaths(mod, proj);
    const ngModContent = fs.readFileSync(mod.ANGULAR_MODULE, 'utf8');
    // console.log(ngModContent.replace('@NgModule', 'const APP_EFFECTS = [LogEffects]\n\n@NgModule'));
    const modPrepends = [
        "import { StoreModule } from '@ngrx/store';",
        "import { EffectsModule } from '@ngrx/effects';",
        "import { StoreDevtoolsModule } from '@ngrx/store-devtools';",
        "\n\n",
        "const isLocalHost = window.location.href.indexOf('localhost') > -1;",
        buildImportStatement("LogEffects", "", popTs(STATE_TS), "."),
        "const " + MOD_EFFECTS + " = [LogEffects];"
    ]
    const modImportStatements = [
        "StoreModule.forRoot({})",
        "EffectsModule.forRoot(" + MOD_EFFECTS + ")",
        "StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: isLocalHost}),"
    ]
    const newDirectories = [
        mod.NGRX_ROOT
    ]
    const newFiles = [
        mod.PARENT_NGRX_MODULE
    ]
    console.log(newDirectories, newFiles, modPrepends, modImportStatements);
}

const buildImportStatement = function (modName, storeName, fileName, relativeDir) {
    return (storeName == "") ?
        "import { " + modName + " } from '" + relativeDir + "/" + STATE_DIR + "/" + fileName + "';" :
        "import { " + modName + " } from '" + relativeDir + "/" + STATE_DIR + "/" + storeName + "/" + fileName + "';";
}


const AddStore = function () {
    var module = modSearch.FindModule('app.module', 'agg-portal');
    var modContent = modSearch.ParseModule(module);
}
const AddAction = function () {
    var module = modSearch.FindModule('app.module', 'agg-portal');
    var modContent = modSearch.ParseModule(module);
}
const FindTemplate = function (templateType) {
    switch (templateType) {
        case "ACTION_BUNDLE": jsonContent = fs.readFileSync(angularJsonPath, 'utf8'); break;
        case "ACTIONS": break;
        case "EFFECT_BUNDLE": break;
        case "EFFECTS": break;
        case "MODELS": break;
        case "STORE_MODULE": break;
        case "REDUCER": break;
        case "REDUCER_BUNDLE": break;
        case "SELECTORS": break;
        case "SERVICE": break;
        case "SERVICE_BUNDLE": break;
    }
}
const ReplaceTemplateVars = function (templateType) {
    fPath = FindTemplate(templateType);
    fileContent = fs.readFileSync(fPath, 'utf8');
    return fileContent;
}
const ParseTemplate = function (templateType) {
    fPath = FindTemplate(templateType);
    fileContent = fs.readFileSync(fPath, 'utf8');
    return ReplaceTemplateVars(fileContent);
}
const ExtractProjectPath = function (projectName) {
    jsonContent = fs.readFileSync(angularJsonPath, 'utf8');
    cfg = JSON.parse(jsonContent);
    return cfg['projects'][projectName]['sourceRoot'].replace(/\//g, "\\");
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
        "PARENT_NGRX_MODULE": stateFolder + DIR_CHAR + STATE_TS,
        "ANGULAR_MODULE": angMod,
        "NGRX_ROOT": stateFolder,
    }
}
const popTs = function (modName) {
    const trgArr = modName.split(".");
    trgArr.pop();
    return trgArr.join(".");
}

module.exports = {
    NameFile: NameFile,
    InitStore: InitStore,
    AddStore: InitStore,
    AddAction: AddAction,
    GetPaths: GetPaths
};

