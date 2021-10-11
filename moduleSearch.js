var findNodeModules = require('find-node-modules');
const fs = require('fs');

const FindTargetModules = function (path, target) {
    ignoredDirs = ['.git', 'dist', 'environments', 'node_modules', '.vscode', '.vs'];
    return fs.readdirSync(path, { withFileTypes: true })
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
            if (project !== undefined) {
                const projectPath = ExtractProjectPath(dir + 'angular.json', project);
                const modPath = dir + projectPath + "\\" + trg;
                if (fs.existsSync(modPath)) {
                    return [modPath]
                } else {
                    return FindTargetModules(dir + projectPath + "\\", trg);
                }
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