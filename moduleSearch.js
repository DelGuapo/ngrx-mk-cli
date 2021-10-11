
var findNodeModules = require('find-node-modules');
const fs = require('fs');

const FindTargetModules = function (path, target = '') {
    ignoredDirs = ['.git', 'dist', 'environments', 'node_modules', '.vscode', '.vs'];
    const rsp = fs.readdirSync(path, { withFileTypes: true })
        .filter(dirent => {
            return dirent.isDirectory() || dirent.name.toLowerCase() == target.toLowerCase();
        })
        .filter(f => ignoredDirs.indexOf(f.name) == -1)
        .reduce((p, c) => {
            if (c.name == target) {
                p.push(path + c.name);
            } else {
                p = p.concat([...FindTargetModules(path + c.name + '\\', target)])
            }
            return p

        }, [])
    return rsp;
}

const ExtractProjectPath = function (angularJsonPath, projectName) {
    if (!fs.existsSync(angularJsonPath)) {
        console.log(`Cannot fing angular.json file`)
        process.exit(1)
    }
    jsonContent = fs.readFileSync(angularJsonPath, 'utf8');
    cfg = JSON.parse(jsonContent);
    return cfg['projects'][projectName]['sourceRoot'].replace(/\//g, "\\");
}

const ExtractFromNgPackage = function (ngPackagePath, projectName) {
    if (!fs.existsSync(ngPackagePath)) {
        console.log(`Cannot fing ng-package.json file`)
        process.exit(1)
    }
    jsonContent = fs.readFileSync(ngPackagePath, 'utf8');
    cfg = JSON.parse(jsonContent);
    entryFile = cfg['lib']['entryFile'].replace(/\//g, "\\");
    return TrimDotSlash(entryFile);
}

const ExtractFromPublicApi = function (publicApi, projectName) {
    if (!fs.existsSync(publicApi)) {
        console.log(`Cannot fing ng-package.json file`)
        process.exit(1)
    }
    const str = fs.readFileSync(publicApi, 'utf8');
    regexp = /^(?=.*\bexport\b)(?=.*\bmodule\b).*$/gm
    mtch = regexp.exec(str);
    if (mtch.length == 0) {
        return '';
    }
    if (mtch.lengh > 1) {
        // console.log(`Multiple modules exported from public-api. Please include --module={angular module name} in your arguments`);
        // process.exit(1)
        return '';
    }
    const modExport = mtch[0];
    regexp = /(["'])(?:(?=(\\?))\2.)*?\1/gm;
    mtch = regexp.exec(modExport);
    if (mtch.length == 0) {
        return '';
    }
    if (mtch.lengh > 1) {
        // console.log(`Multiple modules exported from public-api. Please include --module={angular module name} in your arguments`);
        // process.exit(1)
        return '';
    }

    modPath = mtch[0].replace(/'/g, '"').replace(/"/g, '').replace(/\//g, "\\");
    return TrimDotSlash(modPath)
}

const TrimDotSlash = function (str) {
    tmp = str.split('');
    if (tmp.length > 2 && tmp[0] == '.' && tmp[1] == '\\') {
        tmp.shift();
        tmp.shift();
        return tmp.join('');
    }
    return str;
}

const ParseModule = function (projectPath) {
    if (!fs.existsSync(projectPath)) {
        console.log(`File does not exist [${projectPath}]`)
        process.exit(1)
    }
    moduleContent = fs.readFileSync(projectPath, 'utf8');

    return moduleContent;
}



const FindModule = function (target, project = undefined) {
    const trg = target.split(".").filter(chk => chk.toLowerCase() != 'ts').join(".") + '.ts'
    const modules = findNodeModules()
        .reduce((p, c) => {
            dir = c.replace('node_modules', '')
            if (dir == '') {
                return p;
            }
            if (project !== undefined && project != "") {
                const projectPath = ExtractProjectPath(dir + 'angular.json', project);
                const projPath = dir + projectPath;
                var modPath = projPath + "\\" + trg;
                if (fs.existsSync(modPath)) {
                    return [modPath]
                }
                const pkgPath = projPath + "\\ng-package.json";
                if (fs.existsSync(pkgPath)) {
                    var publicApiPath = ExtractFromNgPackage(pkgPath);
                    var publicApiTs = projPath + '\\' + publicApiPath;
                    
                    if (fs.existsSync(publicApiTs)) {
                        var modExport = ExtractFromPublicApi(publicApiTs);
                        
                        modPathArr = publicApiTs.split('\\');
                        modPathArr.pop();
                        modPath = modPathArr.join('\\') + "\\" + modExport + '.ts';
                    }
                }
                if (fs.existsSync(modPath)) {
                    return [modPath]
                }
                return FindTargetModules(dir + projectPath + "\\", trg);
            }
            dirs = FindTargetModules(dir, trg)
            return [...dirs]

        }, [])

    if (modules.length == 0) {
        console.log(`Could not find module [${target}]`)
        process.exit(1)
    }
    if (modules.length > 1) {
        console.log(`Multiple modules of [${target}] were identified.  If this is a /project module, please use "--project={projectName}" as identified in your angular.json file `)
        process.exit(1)
    }
    return modules[0];
}


module.exports = {
    FindModule: FindModule,
    FindTargetModules: FindTargetModules,
    ParseModule: ParseModule
};