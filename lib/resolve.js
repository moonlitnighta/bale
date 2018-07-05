/**
* @file 查找文件路径 返回文件内容
**/

const path = require('path');
const fs = require('fs');
const nodeLibsBrowser = require("node-libs-browser");

/**
* 根据文件创建module
* @param { path } filePath 当前读取的文件路径
**/
function createdModule(filePath , moduleType , url){

	//读取模块内容
	let source;
	try {
		source = fs.readFileSync(filePath);
	} catch (err){
		throw new Error('ERROR: 无法找到模块! ' + filePath)
	}

	let module = _bale_.createdModule({
		source:source,
		fileName:path.basename(filePath),
		filePath:url,
		suffix:path.extname(filePath),
		type:moduleType
	});

	return module;
}

/**
* 判断路径是否存在
* @param { string - path } filePath 当前读取的文件路径
**/
function isPath(filePath){
	return new Promise (resolve => {
		fs.stat(filePath , function (err , stats){
			resolve(stats && stats.isFile() ? filePath : false);
		})
	})
}

/**
* 补全后缀(.js) 在当前context下查找
* @param { string } moduleName 当前读取的模块名
**/
async function resolvePath(filePath){
	filePath = await isPath(filePath + '.js');
	if(filePath){
		return filePath;
	}
	return false;
}

/**
* 根据模块名查找模块
* @param { object } options 解析对象
* @param { string - path } context 文件查找上下文目录
* @param { string - moduleName } moduleName 当前查找的文件
**/
async function findPath(options , context , moduleName){
	let filePath = false;

	//将context分割成单独目录循环查找
	let tables = context.split('/');
	let _context = context , package = null;
	let packagePath = './node_modules/' + moduleName + '/package.json';

	for(let i = tables.length; i --;){
		if(tables[i]){
			try {
				//根据path尝试读取package文件
				package = require(path.join(_context , packagePath));
			} catch (err){ }

			if(package && (package.main || package.module)){
				filePath = path.join(
					_context , 
					'./node_modules/' + moduleName , 
					package.module || package.main
				);
				break;
			} else {
				_context = _context.replace(tables[i] , '');
			}
		}
	}

	if(filePath && options.resolve.minimal){
		let _minPath = await resolvePath(filePath.replace('.js' , '.min'));
		filePath = _minPath || filePath;
	}
	return filePath
}

/**
* 根据普通路径查找文件
* @param { string - path } context 查找上下文
* @param { string - path } filePath 当前查找的文件
**/
async function againstFind(context , filePath){
	let _path;
	let suffix = path.extname(filePath);
	let s = suffix.indexOf('?') > -1 ? suffix.split('?')[0] : suffix;
	if(s == ''){
		filePath = filePath + '.js';
	} else {
		filePath = filePath.replace(suffix , s);
	}
		
	let tables = context.split('/');
	let _context = context;
	for(let i = tables.length; i --;){
		_path = await isPath(path.resolve(_context , filePath)) ||
				await isPath(path.resolve(_context , 'node_modules/' + filePath));
		if(_path){
			return _path.replace(s , suffix);
		} else {
			_context = _context.replace(tables[i] , '');
		}
	}

	return false;
}	

/**
* 方法暴露
* @param { object } options 解析对象
* @param { object } parentModule 当前查找模块的父模块
* @param { string - path } filePath 当前查找的文件
**/
module.exports = async function (options , context , filePath , parentModule){
	let _filePath , moduleType = '';

	//当前模块是否为node内置模块
	if(nodeLibsBrowser[filePath]){
		_filePath = nodeLibsBrowser[filePath];
		moduleType = 'nodeGasket';
	} else {
		//判断是普通路径 还是 模块名
		if(filePath.indexOf('/') > -1 || path.extname(filePath).length > 1){
			_filePath = await againstFind(context , filePath);
		} else {

			//如果是模块名则当做js文件处理
			//先补全后缀(.js) 在当前context下查找，否则往上递归node_modules里查找package的main字段
			_filePath = await resolvePath(path.resolve(context , filePath));

			if(!_filePath){
				_filePath = await findPath(options , context , filePath);
			}	
		}
		if(parentModule && parentModule.filePath.indexOf('type=nodeGasket') > -1){
			moduleType = 'nodeGasket';
		}
	}

	if(_filePath){
		
		//获取文件后缀
		let url = _filePath;
		let suffix = path.extname(_filePath);
		let s = suffix.indexOf('?') > -1 ? suffix.split('?')[0] : suffix;

		//如果没有后缀自动补全
		if(s == ''){
			_filePath = _filePath + '.js';
		} else {
			_filePath = _filePath.replace(suffix , s);
		}

		//读取文件 创建module
		let type = moduleType == 'nodeGasket' ? 'hidden' : 'project';
		let module = createdModule(_filePath , type , url);
			module.filePath += moduleType == 'nodeGasket' ? '?type=nodeGasket' : ''; 

		return module;
		
	} else {
		throw new Error('ERROR: 无法找到模块! ' + filePath);
		process.exit();
	}
}