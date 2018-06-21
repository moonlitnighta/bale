/**
* @file 主程序文件
**/

const fs = require('fs');
const buildDependTree = require('./buildDependTree.js');
const outputChunks = require('./output/outputChunks.js');
const write = require('./write.js');

module.exports = async function (options){
	global.times = new Date().getTime();
	
	//处理文件依赖并构建依赖树
	let depTree = await buildDependTree(options);

	//根据依赖树拼接模块生成输出文件
	let root = outputChunks(depTree , options);

	//写入文件
	let res = await write(options , depTree , root);
	if(res){
		 console.log(new Date().getTime() - times);
         console.log('构建完成');
	}
}