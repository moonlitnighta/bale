/**
* @file 处理js 类型的文件的源码
**/
const parse = require('./parse.js');
const babel = require('./babel.js');
const writeSource = require('./writeSource.js');

/**
* 方法暴露
* @param { object } options 解析对象
* @param { object } module 需要解析的模块
**/
module.exports = function (options , module){

	//将模块源转代码字符串
	let code = module.source.toString();

	//调用babel
	code = babel(options , module , code);

	//分析模块依赖
	parse(code , module);

	//替换导入导出规范
	code = writeSource(options , module , code);
	
	//将code字符串重新转化buf 传给下一个loader
	module.source = Buffer.from(code);

	return module;
}