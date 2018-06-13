/**
* @file 根据配置文件将源码转babel
**/
const babel = require("babel-core");

/**
* 方法暴露
* @param { object } options 解析对象
* @param { object } module 操作模块
* @param { code } source 源代码
**/
module.exports = function (options , module , code){

	//判断是否配置babel选项
	if(options.internalLoaders.babel){
		code = babel.transform(code , options.internalLoaders.babel.options).code;
	}

	return code;
}