/**
* @file 解析图片资源 jpg|png|gif|svg
**/
const fs = require('fs');
const path = require('path');

/**
* 方法暴露
* @param { object } options 解析对象
* @param { object } module 需要解析的模块
**/
module.exports = async function (options , module){
	let	fileInform;
	try {
		let suffix = path.extname(module.filePath);
		let s = suffix.indexOf('?') > -1 ? suffix.split('?')[0] : suffix;

		let _filePath = module.filePath.replace(suffix , s);

		fileInform = fs.statSync(_filePath);
	} catch (err){
		global._bale_.error({
			message:'无法获取文件信息：' + module.filePath,
			exit:true
		})
	}
		
	//将图片转base64
	if((fileInform.size / 1000) <= options.internalLoaders.image.limit){
		module.generate = false;
		module.source = 'data:image/' + module.suffix.slice(1) + ';base64,' + module.source.toString('base64');
	} else {
		module.generate = true;
	}
	return module;
}