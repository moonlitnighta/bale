#!/usr/bin/env node  

require('../lib/baleConfig.js');
const path = require('path');
const bale = require('../lib/bale.js');

let args = require('optimist').argv;

//编译对象 (总参数)
let options = {} 

//储存配置文件的配置
let config = null;

//获取bale执行的所在目录 的 绝对路径
let balePath = options.balePath = process.cwd();

//---------------------------------------------处理配置文件的参数---------------------------------------------//
if(args.config){

	//获取配置文件内容
	config = require(mergePath(balePath , args.config));

	//如果配置文件内容为空 || 配置文件输出不为对象 则终止
	if(!config || Object.prototype.toString.call(config) != '[object Object]'){
		global._bale_.error({
			message:'Error: 配置文件错误' + args.config,
			exit:true
		})
	}

	//配置文件所在的目录 的 绝对路径
	config.configPath = mergePath(balePath , args.config);

	//根据配置的入口参数 获取 入口文件的绝对路径
	config.entryPath = mergePath(path.dirname(config.configPath) , config.entry);
	//根据配置的出口参数 获取 出口文件的绝对路径
	config.outputPath = mergePath(path.dirname(config.configPath) , config.output);
	//根据入口配置获取入口文件的上下文目录
	config.entryContext = path.dirname(config.configPath);
	//........

	//和命令行参数合并
	args = Object.assign(args , config);
	options.config = true;
}

//------------------------------------------根据命令行参数及配置文件生成编译对象-----------------------------------------//
//入口文件
options.entry = args.entry;
options.entryPath = args.entryPath || mergePath(balePath , args.entry);
options.entryContext = args.entryContext || balePath;

//出口
options.output = args.output;
options.outputPath = args.outputPath || mergePath(balePath , args.output);
options.outputContext = path.dirname(options.outputPath);

//编译上下文目录
options.context = path.dirname(options.entryPath);

//默认会被发现的文件
options.extensions = args.extensions || ['.js','.css'];

//处理文件类型之外的文件如何处理 默认处理？默认拦截
options.otherFile = args.otherFile || 'prevent';

//解析规则
options.resolve = args.resolve || {};
options.resolve.minimal = options.resolve.minimal || false;

//loaders
options.loaders = args.loaders || [];

//内置loaders
options.internalLoaders = args.internalLoaders || {};

//如果配置babel 则.ast选项强制为false presets 默认为es2015;
if(options.internalLoaders.babel){
	if(Object.prototype.toString.call(options.internalLoaders.babel) != '[object Object]'){
		options.internalLoaders.babel = {};
	}
	options.internalLoaders.babel.options = options.internalLoaders.babel.options || {};

	//强制选项
	options.internalLoaders.babel.options.ast = false;
	//默认选项
	options.internalLoaders.babel.options.presets = options.internalLoaders.babel.options.presets || 'es2015';
	options.internalLoaders.babel.options.babelrc = !!options.internalLoaders.babel.options.babelrc;
	options.internalLoaders.babel.options.comments = !!options.internalLoaders.babel.options.comments;
	options.internalLoaders.babel.options.compact = !!options.internalLoaders.babel.options.compact;
}

//cssnano 压缩css 选项
options.internalLoaders.cssnano = options.internalLoaders.cssnano || {};

//js压缩选项
if(options.internalLoaders.uglifyJs){
	if(Object.prototype.toString.call(options.internalLoaders.uglifyJs) != '[object Object]'){
		options.internalLoaders.uglifyJs = {};
	}
}

//sass转换选项
options.internalLoaders.nodeSass = options.internalLoaders.nodeSass || {};
options.internalLoaders.nodeSass.includePaths = options.internalLoaders.nodeSass.includePaths || [];
options.internalLoaders.nodeSass.includePaths.push(options.context)
options.internalLoaders.nodeSass.indentedSyntax = !!options.internalLoaders.nodeSass.indentedSyntax

//less转换选项
options.internalLoaders.less = options.internalLoaders.less || {};
options.internalLoaders.less.paths = options.internalLoaders.less.paths || [];
options.internalLoaders.less.paths.push(options.context);
options.internalLoaders.less.compress = !!options.internalLoaders.less.compress;

//图片转换选项
options.internalLoaders.image = options.internalLoaders.image || {};
options.internalLoaders.image.limit = options.internalLoaders.image.limit && 
								      options.internalLoaders.image.limit < 50 ? 
								      options.internalLoaders.image.limit : 25;

//------------------------------------------根据命令行参数及配置文件生成编译对象-----------------------------------------//

//没有入口 出口 配置直接退出
if(!args.entry || typeof args.entry != 'string' || !args.output || typeof args.output != 'string'){
	global._bale_.error({
		message:"入口出口参数错误",
		exit:true
	})
}

//调用bale构建
bale(options);

//-------------------------------------------------//
//合并路径
function mergePath(publicPath , _path){
	try {
		return path.isAbsolute(_path) ? _path : path.resolve(publicPath , _path);
	} catch (err){
		global._bale_.error({
			message:'Error: 参数错误' + err,
			exit:true
		})
	}
}