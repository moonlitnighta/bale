/**
* @file 将less解析为css
**/
const less = require('less');

/**
* 调用less解析
* @param { object } options 解析对象
* @param { object } module 需要解析的模块
* @param { string } code 需要解析的源码
**/
function transformLess(options , module , code){
	return new Promise(function (resolve , reject){
		less.render(code , {
			paths: options.internalLoaders.less.paths,
			compress: options.internalLoaders.less.compress,
	 		filename: module.fileName
	 	} ,function (e, output) {
		  	if(e){
		  		resolve(code);
		  	} else {
		  		resolve(output.css);
		  	}
		});
	})
}

/**
* 方法暴露
* @param { object } options 解析对象
* @param { object } module 需要解析的模块
**/
 module.exports = async function (options , module){
 	if(module.suffix == '.less'){
 		let code = module.source.toString();

	 	code = await transformLess(options , module , code);

	 	module.source = Buffer.from(code);
 	}
	 	
 	return module;
 }