/**
* @file 写入文件
**/
const fs = require('fs');
const path = require('path');

/**
* 写入单个文件
* @param { string } fileName 写入名称
* @param { string } source 写入源码
**/
function writeFile(fileName , source){
	return new Promise(function (resolve){
		fs.writeFile(fileName, source , function (err) {
	        if (err) { 
	            throw err;
	        }
	        resolve(fileName);
	    });
	})
}

/**
* 方法暴露
* @param { object } options 构建对象
* @param { object } depTree 依赖树表
* @param { object } root 即将写入文件源码
**/
module.exports = async function (options , depTree , root){

	//遍历所有模块 将需要按源类型输出的模块输出成文件
	for(let k in depTree.modules){
		if(depTree.modules[k].generate){
			let res = await writeFile(
				path.join(options.output.context , depTree.modules[k].outputName),
				depTree.modules[k].source
			)
		}
	}

	//遍历root 输出已合并好的文件
	for(let k in root){
		let res = await writeFile(
			path.join(options.output.context , root[k].fileName),
			root[k].code
		)
	}

	return true;
}