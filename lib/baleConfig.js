/**
* @file 程序运行时用到的工具集合
**/

let _bale_ = global._bale_ = {
	options:null,
	depTree : {
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
	},
	createdModule : function (params){
		let module = {};

		//模块源内容 必须buf
		module.source = params.source;
		//导入的文件名（编译之前的文件名）
		module.fileName = params.fileName;
		//导出的文件名 (如果该模块需要生成单独文件则默认用此名字)
		module.outputName = params.outputName;
		//模块的绝对路径 或这个模块不变的唯一标识
		module.filePath = params.filePath;
		//模块文件后缀 (导出时会用此后缀生成文件)
		module.suffix = params.suffix;
		//模块依赖关系
		module.depends = {
			import : params.import || [],
			export : params.export || []
		};
		//引入当前模块的模块
		module.parentModule = params.parentModule || {};
		//模块是否按源类型导出
		module.generate = params.generate || false;
		//如果合并到输出文件中 该项表示合并的内容 如果为空则 利用 source.toString() 进行合并
		module.code = params.code;
		//其他参数 bale本身不会访问这些参数，仅第三方loader或plugin自己管理
		module.customize = {};

		return module;
	},
	error : function (options){

		//抛出错误
		throw new Error(options.message);

		//是否结束进程
		options.exit && process.exit();
	}
}
module.exports = _bale_;