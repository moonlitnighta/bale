/**
* @file 解析文件 处理依赖 组成依赖树表
**/
const loaders = require('./loaders.js');

/**
* 方法暴露
* @param { object } options 解析对象
**/
module.exports = async function (options){

	let depTree = _bale_.depTree;

	//主入口文件开始解析
	let rootModule = {
		filePath:options.entryPath
	}

	depTree.main = await loaders(depTree , options , rootModule , options.entry);

	//依赖解析完毕 返回
	return depTree;
}