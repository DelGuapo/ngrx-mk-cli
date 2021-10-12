const fs = require('fs');
const find = require('./find');
const DIR_CHAR = '\\';
const STATE_DIR = "state";
const STATE_TS = "app.store.ts";
const MOD_EFFECTS = "REDUX_APP_EFFECTS"
const PARENT_APP_STORE = "APP_STORE"
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

const getNgModuleConfig = function (str) {
    const regex = new RegExp(/(?<=\@NgModule\()(.*?)(?=\))/, 'sg');
    const match = str.match(regex)
    if (!match || match.length > 1) {
        throwExc("Could not parse @NgModule tag");
    }
    return match[0];
}

const insertNgModuleImport = function (newImportArray, modContent) {
    const regexImports = new RegExp(/(imports:\s\[(.*?)\])/, 'sg');
    const match = modContent.match(regexImports)
    if (!match || match.length > 1) {
        throwExc("Could not parse @NgModule.imports");
    }
    importContent = match[0];
    whiteSpace = "\n\t";
    try {
        const regWhite = new RegExp(/\[\s+(?=[^\s\\])/, 'sg')
        const whiteGroups = importContent.match(regWhite);
        whiteSpace = whiteGroups[0];
        whiteSpace = whiteSpace.replace('[', '');
    } catch (err) {
    }
    regexImpItems = new RegExp(/(?<=\[).+?(?=\])/, 'sg')
    importItems = importContent.match(regexImpItems);
    importArr = importItems[0].split(',').concat(newImportArray.map(imp => whiteSpace + imp))
    return modContent.replace(regexImports, "imports:[" + importArr.join(",") + "]");
}

const WriteFile = function (filePath, content) {
    try {
        fs.writeFileSync(filePath, content)
        console.log("Created file " + filePath);
    } catch (err) {
        throwExc("Could not create file " + filePath);
    }
}

const seedEffectsIntoAngularMod = function (mod) {
    txt = readAngularModuleContent(mod);
    return txt.replace('@NgModule', MOD_REF_POINT + "LogEffects]; \n\n@NgModule")
}

const findRefPointRegex = function(str){
    regex = new RegExp(/(?<=REDUX_APP_EFFECTS).*$/,"s");
    return str.match(regex)
}

const findFirstOccuranceInSquareBrackets = function(str){
    regex = new RegExp(/(?<=\[).+?(?=\])/,"s");
    return str.match(regex)[0]
}

const listSuffInSquareBrackets = function(str){
    regex = new RegExp(/(?<=\[).+?(?=\])/,"sg");
    return str.match(regex);
}

const listEffectModules = function(modContent){
    str = findRefPointRegex(modContent)[0];
    effc =  findFirstOccuranceInSquareBrackets(str);
    return effc.split(",");
}

const appendEffectIntoAngularMod = function (newEffect,modContent) {
    effects = listEffectModules(modContent);
    effects.push(newEffect);
    oldRefMatch = findRefPointRegex(modContent);
    regEffects = new RegExp(/(?<=\[).+?(?=\])/,"s");
    newRef = oldRefMatch[0].replace(regEffects,effects.join(','));
    newMod = modContent.substring(0,oldRefMatch.index) + newRef
    console.log(newMod);
    return newMod;
}


const prependRefTag = function (strArray, modContent) {
    return strArray.reduce((p, c) => {
        p = p.replace(MOD_REF_POINT, c + '\n' + MOD_REF_POINT)
        return p;
    }, modContent);
}

const createDirs = function (dirs) {
    dirs.map(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
    })

}

const InitStore = function (mod, proj = undefined) {
    mod = GetPaths(mod, proj);
    modContent = seedEffectsIntoAngularMod(mod);
    modContent = prependRefTag([
        "import { StoreModule } from '@ngrx/store';",
        "import { EffectsModule } from '@ngrx/effects';",
        "import { StoreDevtoolsModule } from '@ngrx/store-devtools';",
        "/* " + WELCOME_MESSAGE + " */",
        buildImportStoreStatement("LogEffects", "", popTs(STATE_TS), "."),
        "",
        "const isLocalHost = window.location.href.indexOf('localhost') > -1;",
    ], modContent);

    modContent = insertNgModuleImport([
        "StoreModule.forRoot({})",
        "EffectsModule.forRoot(" + MOD_EFFECTS + ")",
        "StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: isLocalHost})"
    ], modContent);
    createDirs(mod.NGRX_ROOT)
    WriteFile(mod.ANGULAR_MODULE,modContent);
    
    const newFiles = [
        mod.PARENT_NGRX_MODULE
    ]
    // console.log(newDirectories, newFiles, modPrepends, modImportStatements);
}

const buildImportStoreStatement = function (modName, storeName, fileName, relativeDir) {
    return (storeName == "") ?
        "import { " + modName + " } from '" + relativeDir + "/" + STATE_DIR + "/" + fileName + "';" :
        "import { " + modName + " } from '" + relativeDir + "/" + STATE_DIR + "/" + storeName + "/" + fileName + "';";
}

const AddStore = function () {

}
const AddAction = function () {

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

