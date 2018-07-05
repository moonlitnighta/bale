/**
* @file 单个模块构建完成后输出其信息
**/
const path = require('path');
const fs = require('fs');
const colors = require('colors');

let moduleInformTitle = '\nAnalysis dependence\n'.green.bold;
module.exports.outputModuleInform = function (module){
	if(moduleInformTitle){
		console.log(moduleInformTitle);
		moduleInformTitle = null;
	} 
	if(module.type == 'project'){
		console.log(module.filePath);
	}
	this.next();
}

let fileInformTitle = '\nOutput file\n'.green.bold;
module.exports.writeSingleFile = function (file){
	if(fileInformTitle){
		console.log(fileInformTitle);
		fileInformTitle = null;
	} 

	let fileInform;

	try{
		fileInform = fs.statSync(file.url);
	} catch (err){
		this.error({
			message:'无法获取文件信息：' + file.url,
			exit:false
		});
	}
	
	let size = fileInform.size > 1000 ? fileInform.size / 1000 + ' kb' : fileInform.size + ' bytes';
	let inform = file.file.outputName.green.bold + ' ' + size;
	this.buildSize += fileInform.size;
	console.log(inform);

	this.next();
}