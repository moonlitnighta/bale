/**
* @file 解析文件 处理依赖 组成依赖树表
**/
const loaders = require('./loaders.js');

/**
* 方法暴露
* @param { object } options 解析对象
**/
module.exports = async function (options){

	let depTree = {
		//主入口
		main:null,
		//所有模块
		modules:{},
		//模块总数
		chunks:0,
		//所有模块的绝对路径
		moduleKeys:[],
		addModule:function (module){

			//查找是否纯在相同的module 如果相同则覆盖 （通过module的绝对路径匹配）
			if(this.modules[module.filePath]){
				module.id = this.modules[module.filePath].id;
				this.modules[module.filePath] = module;
			} else {
				//给模块分配id 并添加到树
				module.id = 'MODULE' + this.chunks;
				this.modules[ module.filePath ] = module;
				this.moduleKeys.push(module.filePath);
				this.chunks ++;
			}
			
			return module;
		}
	}

	//主入口文件开始解析
	let rootModule = {
		filePath:options.entryPath
	}

	depTree.main = await loaders(depTree , options , rootModule , options.entry);

	//依赖解析完毕 返回
	return depTree;
}