/**
* @file _bale_主体
**/

const events = require('events');

//记录正在执行的事件
let eventArr = [];

let _bale_ = global._bale_ = {
	options:null,

	//所有需要输出的文件模块
	root:[],
	//需要输出的chunks
	chunks:[],
	//build后文件总大小
	buildSize:0,
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
			// import : {
			// 	type : Import | Require | Url | __bale_require__ 
			// 	module: 当前依赖被引入时的path
			// 	range: 依赖出现的位置
			// 	body: 依赖的模块本体
			// }

		//引入当前模块的模块
		module.parentModule = params.parentModule || {};
		//模块是否按源类型导出
		module.generate = params.generate || false;
		//是否合并到输出文件
		module.merge = params.merge === false ? false : true;
		//模块类型 非本地项目本身的模块 或 动态生成模块 或 隐藏模块 (hidden | project)
		module.type = params.type;
		//如果合并到输出文件中 该项表示合并的内容 如果为空则 利用 source.toString() 进行合并
		module.code = params.code;
		//其他参数 bale本身不会访问这些参数，仅第三方loader或plugin自己管理
		module.customize = {};

		return module;
	},
	event : new events.EventEmitter(),
	emit : function(event , params) {
		return new Promise(resolve => {
			if(!this.options.events[event]){
				resolve(true);
			} else {
				let total = this.options.events[event].length;
				let num = 0;
				eventArr.push(()=>{
					num ++;
					if(num == total){
						resolve();
						eventArr.pop();
					}
				});

				this.event.emit(event , params);
			}
			
		})
	},
	next : function (){
		eventArr[eventArr.length - 1]();
	},
	error : function (options){

		//抛出错误
		throw new Error(options.message);

		//是否结束进程
		options.exit && process.exit();
	}
}
module.exports = _bale_;