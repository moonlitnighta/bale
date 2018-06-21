/**
* @file 根据不同类型文件进行不同的解析操作 调用不同的loader
**/

const path = require('path');
const resolve = require('./resolve.js');
const parseJavascript = require('./writeJavascript/loader.js');
const parseCss = require('./writeCss/loader.js');
const defaultLoader = require('./defaultLoader.js');
const parseSass = require('./writeCss/parseSass.js');
const parseLess = require('./writeCss/parseLess.js');
const parseImages = require('./writeImage/parseImages.js');

/**
* 储存内置核心loader
**/
let coreLoad = function (opt){
	return [
		{
			test:/\.js$/,
			loader: async function (module , options){
				let m = parseJavascript(options , module);
				return m;
			},
			options:opt
		},
		{
			test:/\.(css|scss|less)$/,
			loader: async function (module , options){
				let m = await parseSass(options , module);
					m = await parseLess(options , module);
					m = await parseCss(options , module);
				return m;
			},
			options:opt
		},
		{
			test:/\.(jpe?g|png|gif|svg|webp)$/,
			loader: async function (module , options){
				let m = await parseImages(options , module);
					m = defaultLoader(options , module);
				return m;
			},
			options:opt
		}
	];
}

/**
* 根据文件后缀查询是否配置loader
* @param { object } options 解析对象
* @param { string } suffix 文件后缀
**/
function matchLoader(options , suffix){
	let optLoaders = options.loaders;
	let loaders = {};
	//检查自定义loader
	for(let i = 0; i < optLoaders.length; i ++){
		if(optLoaders[i].test.test(suffix)){
			loaders.custom = optLoaders[i];
			break;
		}
	}

	//检查内置loader
	for(let i = 0; i < coreLoad.length; i ++){
		if(coreLoad[i].test.test(suffix)){
			loaders.default = coreLoad[i];
			break;
		}
	}

	return loaders;
}

/**
* 整理自定义loader的顺序并与内置liader合并
* @param { object } customLoaders 自定义loader
* @param { object } defaultLoader 内置默认loader
**/
function mergeLoader(customLoaders , defaultLoader){
	let beforeLoaders = [] , afterLoaders = [];
	for(let i = 0; i < customLoaders.length; i ++){
		customLoaders[i].process == 'after' ?
		afterLoaders.push(customLoaders[i]) :
		beforeLoaders.push(customLoaders[i]) ;
	}
	return ([]).concat(beforeLoaders , defaultLoader , afterLoaders);
}

/**
* 执行匹配的自定义loader
* @param { object } options 解析对象
* @param { object } module 当前模块
* @param { object } loaders 匹配的loader
**/
async function runLoaders(options , module , loaders){
	
	//获取自定义loader
	let customLoaders = loaders.custom.use;
	//获取内置loader
	let defaultLoader = loaders.default;

	//如果配置的loaders为对象则变换为数组
	if(Object.prototype.toString.call(customLoaders) == '[object Object]'){
		customLoaders = [customLoaders];
	}

	//将内置和自定义loader合并
	let _loaders = mergeLoader(customLoaders , defaultLoader || []);

	//执行所有loader
	for(let i = 0; i <_loaders.length; i ++){
		module = await _loaders[i].loader(module , _loaders[i].options);
	}

	return module;
}

/**
* 模块判断及检查对于loader
* @param { object } options 解析对象
* @param { object } module 当前模块
* @param { string } filePath 当前模块的引用path
**/
function verificationModule(options , module , filePath){
	//检查是否有自定义loader
	let loaders = matchLoader(options , module.suffix);
	if(loaders.custom || loaders.default){
		return loaders;
	} else {
		if(options.otherFile == 'prevent'){
			global._bale_.error({
				message:'缺少loader！:' + filePath,
				exit:true
			})
		} else {
			return {};
		}
	}
}

/**
* 检查module的合法性
* @param { object } module 模块
**/
function verifyModule(module){
	let meg = '';
	if(!module.source || !Buffer.isBuffer(module.source)){
		meg = 'module.source为必须的，并且为Buffer类型';
	};
	if(!module.filePath){
		meg = 'module.filePath为必须的';
	}
	if(!module.suffix){
		meg = 'module.suffix为必须的';
	}
	if(!module.parentModule || Object.prototype.toString.call(module.parentModule) != '[object Object]'){
		meg = 'module.parentModule为必须的, 并且为object类型';
	}

	if(meg){
		global._bale_.error({
			message:meg,
			exit:true
		});
	} else {
		return module;
	}
}

/**
* 根据不同类型文件进行不同的解析操作
* @param { object } depTree 依赖树
* @param { object } options 解析对象
* @param { object } parentModule 当前模块的父模块
* @param { string } filePath 需要解析的文件的引用path
**/
async function loader(depTree , options , parentModule , filePath){

	//根据配置生成内置loader
	coreLoad = typeof coreLoad == 'function' ? coreLoad(options) : coreLoad;
	
	let module = null , type = Object.prototype.toString.call(filePath);

	//根据filePath获取并创建模块
	if(type == '[object String]'){
		module = await resolve(depTree , options , path.dirname(parentModule.filePath) , filePath);
	} else if (type == '[object Object]'){
		module = verifyModule(filePath);
	} else {
		global._bale_.error({
			message:'无法处理 : ' + filePath + 'path不是有效的path或module',
			exit:true
		})
	}

	//排除在本次构建过程中已处理过的模块
	if(depTree.modules[module.filePath]){
		module = depTree.modules[module.filePath];
		module.parentModule[parentModule.filePath] = parentModule;
		return module;
	}
	//当前模块上保存其父模块 （引入当前模块的模块）
	module.parentModule[parentModule.filePath] = parentModule;

	//检查模块及loader
	let loaders = verificationModule(options , module , filePath);

	//运行loader
	if(loaders.custom || loaders.default){
		if(loaders.custom){
			module = await runLoaders(options , module , loaders);
		} else {
			module = await loaders.default.loader(module , loaders.default.options);
		}
	} else {
		if(options.otherFile == 'adopt'){
			//启用默认处理loader
			module.generate = true;
			module = defaultLoader(options , module);
		}
	}

	//将模块添加到树
	module = depTree.addModule(module);
	
	//如果包含其他依赖则立即解析依赖
	for(let l = 0; l < module.depends.import.length; l ++){

		//如果当前依赖的body(依赖的模块的本身，表示这个模块已经生成但还未解析) 不为空，则将body传入loaders
		let m = module.depends.import[l].body || module.depends.import[l].module;
		module.depends.import[l].body = await loader(
			depTree , 
			options , 
			module , 
			m
		);
	}

	return module;
}

/**
* 方法暴露
**/
module.exports = loader;