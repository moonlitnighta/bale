/**
* @file 拼接所有的模块 并合并到模板
**/

const fs = require('fs');
const path = require('path');
const UglifyJS = require('uglify-js');
const template = fs.readFileSync(path.join(__dirname, 'template.js')).toString();

//记录以及拼接到output的模块
let isOut = [];
let chunks = '';

/**
* 将需要按源输出的文件 输出
* @param { object } module 模块
* @param { object } options 构建对象
**/
function writeFile(options , module){
	fs.writeFile(path.join(options.outputContext , module.outputName), module.source , function (err) {
        if (err) { 
            throw err;
        }
    });
}
/**
* 将所有需要拼接到output.js的模块的引用path 替换为module的id
* @param { object } module 模块
**/
function replacePath(code , module){
	let depends = module.depends.import;
	for(let i = 0; i < depends.length; i ++){
		let moduleName = depends[i].module;
		code = code.replace(
			'__bale_require__("' + moduleName + '")' , 
			'__bale_require__("' + depends[i].body.id + '")'
		);
		code = code.replace(
			'__BALE_REQUIRE__' + moduleName + '__BALE_REQUIRE__' , 
			'"+__bale_require__("' + depends[i].body.id + '")+"'
		)
	}
	return code;
}

/**
* 返回单个chunk的拼接后代码
* @param { object } module 模块
* @param { object } options 构建对象
**/
function spliceChunk(options , module){
	let code = module.code || module.source.toString();
		code = replacePath(code , module);
	return '"' + module.id + '": (function ( module , exports , __bale_require__){\n'
		+ code +
	'\n}),\n';
}

/**
* 根据root.mian入口开始拼接output
* @param { object } main 入口模块
* @param { object } options 构建对象
**/
function spliceChunks(options , module){
	if(isOut.indexOf(module.id) < 0){
		chunks += spliceChunk(options , module);
		isOut.push(module.id);

		//如果当前模块设置按源输出则输出 否则跳过
		if(module.generate){
			writeFile(options , module);
		}

		//检索依赖
		let depends = module.depends.import;
		depends.forEach(function (m){
			spliceChunks(options , m.body , chunks);
		});
	}
}

/**
* 方法暴露
* @param { object } depTree 依赖树表
* @param { object } options 构建对象
**/
module.exports = function (depTree , options){
	let root = {};

	//遍历模块 拼接到output
	let main = spliceChunks(options , depTree.root.main);
		main = template.replace('/entry-bale-id/' , depTree.root.main.id).replace('/bale-chunks/' , chunks);

	//是否压缩代码
	if(options.internalLoaders.uglifyJs){
		main = UglifyJS.minify(main).code;
	}

	//将所有输出代码文件添加到 root
	root.main = main;

	return root;
}