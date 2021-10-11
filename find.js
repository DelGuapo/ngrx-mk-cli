var path = require('path');
var findup = require('findup-sync');
var merge = require('merge');
var fs = require('fs');
const dirChar = '\\';

const findObjects = function (searchPattern, cwd) {
	var options = {}
	if (typeof cwd === 'string') {
		options = {
			cwd: cwd,
		};
	}

	options = merge({
		cwd: process.cwd(), // The directory to start the search from
		searchFor: searchPattern, // I see no reason to change this
		relative: true // If false, returns absolute paths
	}, options);

	var modulesArray = [];
	var searchDir = options.cwd;
	var modulesDir;
	var duplicateFound = false;

	do {
		modulesDir = findup(options.searchFor, { cwd: searchDir });

		if (modulesDir !== null) {
			var foundModulesDir = formatPath(modulesDir, options);
			duplicateFound = (modulesArray.indexOf(foundModulesDir) > -1);
			if (!duplicateFound) {
				modulesArray.push(foundModulesDir);
				searchDir = path.join(modulesDir, '../../');
			}
		}
	} while (modulesDir && !duplicateFound);

	return modulesArray;
};

const findDown = function (path, target = '') {
	ignoredDirs = ['.git', '.bin', 'dist', 'environments', 'node_modules', '.vscode', '.vs'];
	const lastFile = path.split(dirChar).pop();
	if (ignoredDirs.indexOf(lastFile) > -1) {
		return [];
	}
	const rsp = fs.readdirSync(path, { withFileTypes: true })
		.filter(dirent => {
			return dirent.isDirectory() || dirent.name.toLowerCase() == target.toLowerCase();
		})
		.filter(f => ignoredDirs.indexOf(f.name) == -1)
		.reduce((p, c) => {
			if (c.name == target) {
				p.push(path + c.name);
			} else {
				p = p.concat([...findDown(path + c.name + dirChar, target)])
			}
			return p

		}, [])
	return rsp;
}

const FromRootDownwards = function (file) {
	nodeMods = NodeModules();
	return nodeMods.reduce((p, c) => {
		dir = c.replace('node_modules', '')
		if (dir == '') {
			return p;
		}
		dirs = findDown(dir, file);
		return [...dirs]
	}, []);
}
const NodeModules = function () {
	return findObjects('node_modules')
}

const AngularProjectFile = function (projName = undefined, moduleName = undefined) {
	const angJson = FromRootDownwards('angular.json');
	if (angJson.length == 0) {
		throwExc("Could not find angular.json file containing project [" + projName + "]");
	}
	if (angJson.length > 1) {
		throwExc("Multiple angular.json files found.  Cannot proceed yet... sugmit an enhancement");
	}
	/* extract project path from angular.json */
	angJsonPath = angJson[0];
	const angJsonContent = jsonContent(angJsonPath);
	const sourceRoot = angJsonContent['projects'][projName]['sourceRoot'].replace(/\//g, dirChar);

	/* find index.ts relative to project root */
	const sourceRootRelative = angJsonPath.replace('angular.json', sourceRoot);
	const sourceRootArray = sourceRootRelative.split(dirChar);
	sourceRootArray.pop();
	sourceRootProject = sourceRootArray.join(dirChar) + dirChar

	projModule = findDown(sourceRootProject,moduleName);

	if(projModule.length == 1){
		return projModule[0];
	}

	const src = findDown(sourceRootProject, 'index.ts');
	
	if (src.length != 1){
		throwExc("Multiple index.ts found in project path")
	}
	idxTs = src[0]
	expt = findModuleExports(idxTs,projName);
	if(expt == undefined || expt == ""){
		throwExc("Multiple index.ts found in project path")
	}
	modArray = idxTs.split(dirChar);
	modArray.pop();
	return modArray.join(dirChar) + dirChar + expt;
}

const AngularModule = function (modName, projectName = undefined) {
	const target = addTs(modName);
	if (projectName != undefined) {
		return AngularProjectFile(projectName,target);
	}
	
	const modFiles = FromRootDownwards(target)
	if (modFiles.length == 0) {
		throwExc("Could not find any modules containing name [" + modName + "]")
	}
	if (modFiles.length > 1) {
		throwExc("Multiple modules containing name [" + modName + "] found.  If this is a project file, use the -project or --prj parameter")
	}
	return modFiles[0];
}




module.exports = {
	Objects: findObjects,
	FromRootDownwards: FromRootDownwards,
	NodeModules: NodeModules,
	AngularProjectFile: AngularProjectFile,
	AngularModule: AngularModule,
}

/**
 * Internal function to return either a relative or an absolute path depending
 * on an option. Basically not very useful, could be inline.
 *
 * @param {string} modulesDir The absolute path
 * @param {object} options Options object containing relative boolean and cwd
 * @returns {string} Either an absolute path or a relative path
 * @private
 */
function formatPath(modulesDir, options) {
	if (options.relative) {
		return path.relative(options.cwd, modulesDir);
	} else {
		return modulesDir;
	}
}

const jsonContent = function (path, projName) {
	jsn = fs.readFileSync(path, 'utf8');
	return JSON.parse(jsn);
}

const addTs = function(modName){
	const target = modName.split(".").filter(chk => chk.toLowerCase() != 'ts').join(".") + '.ts'
	return target;
}
const popTs = function(modName){
	const trgArr = modName.split(".");
	trgArr.pop();
	return trgArr.join(".");
}

const findModuleExports = function (src, projName) {
	if (!fs.existsSync(src)) {
		console.log(`Cannot fing ng-package.json file`)
		process.exit(1)
	}

	const str = fs.readFileSync(src, 'utf8');
	regexp = /^(?=.*\bexport\b)(?=.*\bmodule\b).*$/gm
	const moduleExports = [...str.matchAll(regexp)];
	if (moduleExports.length == 0) {
		throwExc("No module exports found");
	}
	if (moduleExports.length > 1) {
		const mods = moduleExports.map(m=>{
			const p = extractPathFromExportStatement(m);
			return p.split(dirChar).pop();
		});
		console.log(mods);
		throwExc("Multiple module exports found in index.json.  Please use --mod or -module to specify module name");
	}

	modPath = extractPathFromExportStatement(moduleExports[0]);
    return TrimDotSlash(modPath)
}

const extractPathFromExportStatement = function(expPhrase){

	regexp = /(["'])(?:(?=(\\?))\2.)*?\1/gm;
	mtch = regexp.exec(expPhrase);
	if (mtch.length == 0) {
		return '';
	}
	if (mtch.lengh > 1) {
		// console.log(`Multiple modules exported from public-api. Please include --module={angular module name} in your arguments`);
		// process.exit(1)
		return '';
	}

	modPath = mtch[0].replace(/'/g, '"').replace(/"/g, '').replace(/\//g, dirChar);
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


const throwExc = function (msg) {
	console.error(msg);
	process.exit(1)
}
