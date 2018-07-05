/**
* @file 主程序文件
**/

const fs = require('fs');
const buildDependTree = require('./buildDependTree.js');
const outputChunks = require('./output/outputChunks.js');
const write = require('./write.js');

const commonsChunk = require('./plugins/commonsChunk.js');
const buildEnd = require('./plugins/buildEnd.js');
const outputInform = require('./plugins/outputInform.js');
const mergeStyle = require('./plugins/mergeStyle.js');
const htmlTemplatePlugin = require('./plugins/htmlTemplatePlugin.js');

function onEvent(options){
	let event = this.event , funs = options.events;

	//添加内置事件
	funs['sourceAssemblyEnd'] = funs['sourceAssemblyEnd'] || [];
	funs['singleModule'] = funs['singleModule'] || [];
	funs['end'] = funs['end'] || [];
	funs['writeSingleFile'] = funs['writeSingleFile'] || [];
	funs['dependencyBuildEnd'] = funs['dependencyBuildEnd'] || [];
	funs['startWrite'] = funs['startWrite'] || [];

	funs['sourceAssemblyEnd'].push(commonsChunk);
	funs['end'].push(buildEnd);
	funs['singleModule'].push(outputInform.outputModuleInform);
	funs['writeSingleFile'].push(outputInform.writeSingleFile);
	funs['dependencyBuildEnd'].push(mergeStyle);
	funs['startWrite'].push(htmlTemplatePlugin);

	for(let k in funs){
		funs[k].forEach(function (item){
			event.on(k , item.bind(_bale_));
		})
	}
}

module.exports = async function (options){
	let times = new Date().getTime();

	//注册事件
	onEvent.call(_bale_ , options);

	//触发开始构建事件
	await _bale_.emit('start');

	//处理文件依赖并构建依赖树
	let depTree = await buildDependTree(options);

	//根据依赖树拼接模块生成输出文件
	await outputChunks(depTree , options);

	//输出文件
	let res = await write(options , depTree);

	if(res){
         //触发构建结束事件
		await _bale_.emit('end' , new Date().getTime() - times);
	}
}