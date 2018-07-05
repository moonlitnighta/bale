/**
* @file 解析文件 处理依赖 组成依赖树表
**/
const loaders = require('./loaders.js');
const replacementPath = require('./replacementPath.js');

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

	//将需要输出的文件的引用替换为输出后的名字
	depTree = replacementPath(depTree);

	//调用构建完成事件
	await _bale_.emit('dependencyBuildEnd');

	//依赖解析完毕 返回
	return depTree;
}