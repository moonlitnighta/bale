/**
* @file 将sass解析为css
**/
const sass = require("node-sass");

/**
* 调用node-scss解析为css
* @param { object } options 解析对象
* @param { string } code 解析的源码
* @param { object } module 需要解析的模块
**/
function transformScss(options , code , module){
	let opt = options.internalLoaders.nodeSass;
	return new Promise((resolve , reject)=>{
		sass.render({
			data:code,
			includePaths:opt.includePaths,
			indentedSyntax:opt.indentedSyntax,
			importer:opt.importer
		}, (err , result)=>{
			if(err){
				global._bale_.error({
					message:'Error:' + module.filePath + err.formatted + '\n' + err.message,
					exit:false
				})
				reject(code);
			} else {
				resolve(result.css.toString());
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
	if(module.suffix == '.scss'){
		let code = module.source.toString();

		//转css
		code = await transformScss(options , code , module);
		module.source = Buffer.from(code);
	}
		
	return module;
}