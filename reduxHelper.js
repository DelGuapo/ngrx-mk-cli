
const modSearch = require('./moduleSearch');
const fs = require('fs');

const upperFirstChar = function (str) {
    if (str == '') {
        return '';
    }
    var arr = str.toLowerCase().split('');
    var firstC = arr.shift().toUpperCase();
    return firstC + arr.join('')
}

/* cammelcase = NOT upper first char */
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

const InitStore = function (modName, projectName = undefined) {
    console.log("MOD NAME - " + modName,"PROJ NAME " +  projectName)
    var modulePath = modSearch.FindModule(modName, projectName);
    console.log(modulePath);
    var modContent = modSearch.ParseModule(modulePath);
    console.log(modContent);
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

module.exports = {
    NameFile: NameFile,
    InitStore: InitStore,
    AddStore: InitStore,
    AddAction: AddAction
};

