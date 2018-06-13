/**
* @file 文件的默认处理loader 如果未配置自定义loader 则启用
**/

/**
* 方法暴露
* @param { object } options 解析对象
* @param { object } module 需要解析的模块
**/
module.exports = function (options , module){
	if(module.generate){

		//为输出文件生成一个文件名
		module.outputName = 'module_' + new Date().getTime() + Math.random().toString(16).substr(3) + module.suffix;
		module.code = 'module.exports = ' + '"'+ module.outputName +'";';
	} else {
		module.code = 'module.exports = ' + '"'+ module.source.toString() +'";';
	}
	return module;
}
