/**
* @file 遍历替换各个文件的require import 及 export 等
**/

//储存各种不同类型的替换方法
let replaces = {};

/**
* 替换导入 import 替换为 __bale_require__
* @param { object } dep 导入的依赖模块
**/
replaces.replaceImport = function (dep){

	let code = '';
	dep.imports.forEach(function (variable){
		code += (variable.local ? 'var ' + variable.local + ' = ' : '')
				+ '__bale_require__("' + dep.module + '")'+
					(variable.imported ? '["'+variable.imported+'"]' : '')
				+';\n';
	});

	return code;
}

/**
* 替换导入 require 替换为 __bale_require__
* @param { object } dep 导入的依赖模块
**/
replaces.replaceRequire = function (dep){
	return '__bale_require__("' + dep.module + '")';
}

/**
* 替换导出 export 替换为 module.exports
* @param { object } dep 导入的依赖模块
**/
replaces.replaceExport = function (dep){
	let code = '';
	dep.exports.forEach(function (variable){
		code +=   'module.exports.' + variable.exported + ' = '+ variable.local 
			    + (variable.exported == 'default' ? '' : ';\n');
	});
	return code;
}

/**
* 替换导出 export 变量的情况 (export var a , b , c .....)
* @param { object } dep 导入的依赖模块
* @param { code } source 源代码
**/
replaces.replaceExportVariable = function (dep , source){
	
	let variables = dep.exports;
		variables.sort((a, b) => {
	        return b.range[0] - a.range[0];
	    });
	let result = [source.slice.apply(source , dep.range)];
	variables.forEach(function (variable){
		let remainSource = result.shift();
		let code = 'module.exports.'+variable.name;
		result.unshift(
			remainSource.substr(0, variable.range[0] - dep.range[0]),
			code,
            remainSource.substr(variable.range[1] - dep.range[0])
		)	
	});

	return result.join('');
}


/**
* 修改入口方式
* @param { object } module 当前操作的模块
**/
function writeEntry(module , source){

	//将导入导出合并
	let deps = module.depends.import.concat(module.depends.export);

	//按照依赖出现顺序排序
	deps.sort((a, b) => {
        return b.range[0] - a.range[0];
    });

    let result = [source];
	deps.forEach(function (dep){

		let remainSource = result.shift();
		let code = replaces['replace' + dep.type](dep , source);

		result.unshift(
			remainSource.substr(0, dep.range[0]),
            code,
            remainSource.substr(dep.range[1])
		);
	});

	return result.join('');
}


/**
* 方法暴露
* @param { object } module 当前处理的模块
* @param { object } options 编译对象
* @param { code } source 源代码
**/
module.exports = function (options , module , source){
	let code = writeEntry(module , source);
	if(module.__esModule){
		code = 'Object.defineProperty(exports, "__esModule", { value: true});\n' + code;
	}
	return code;
}