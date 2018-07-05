/**
* @file 根据配置文件将源码转babel
**/
const path = require('path');
const babel = require("babel-core");

/**
* 方法暴露
* @param { object } options 解析对象
* @param { object } module 操作模块
* @param { code } source 源代码
**/
module.exports = function (options , module , code){
	let babelOpt = options.internalLoaders.babel;

	//判断是否配置babel选项
	if(babelOpt){
		if(
			babelOpt.exclude && 
			babelOpt.exclude.test(module.filePath)
		){
			return code;
		} else {
			code = babel.transform(code , babelOpt.options).code;
		}
	}

	return code;
}