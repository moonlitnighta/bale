/**
* @file 拼接所有的模块 并合并到模板
**/

const fs = require('fs');
const path = require('path');
const template = fs.readFileSync(path.join(__dirname, 'template.js')).toString();

/**
* 将所有需要拼接到output.js的模块的引用path 替换为module的id
* @param { object } module 模块
**/
function replacePath(code , module){
	let depends = module.depends.import;
	for(let i = 0; i < depends.length; i ++){
		let moduleName = depends[i].module;

		code = code.split('__bale_require__("' + moduleName + '")')
				   .join('__bale_require__("' + depends[i].body.id + '")');

		if(depends[i].type == 'Url'){
			code = code.split(depends[i].body.outputName)
					   .join('"+__bale_require__("' + depends[i].body.id + '")+"');
		}
		
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
* 方法暴露
* @param { object } depTree 依赖树表
* @param { object } options 构建对象
**/
module.exports = async function (depTree , options){

	let chunks = {
		chunks:''
	}

	//遍历模块
	//将所有需要拼接的模块源码组装替换
	for(let k in depTree.modules){

		//将需要按源输出的模块添加到root输出列表
		if(depTree.modules[k].generate){
			_bale_.root.push(depTree.modules[k]);
		}

		//将需要合并的模块的源码处理
		if(depTree.modules[k].merge){
			depTree.modules[k].code = spliceChunk(options , depTree.modules[k]);
		}
	}
	

	//触发模块源码修改完毕事件
	await _bale_.emit('sourceAssemblyEnd');

	//遍历模块遍历模块 模块的源码拼接
	for(let k in depTree.modules){
		if(depTree.modules[k].merge){
			chunks.chunks += depTree.modules[k].code;
		}
	}

	//触发模块源码拼接完毕事件
	await _bale_.emit('sourceSpliceEnd');

	//将拼接好的内容组装为output 并添加到root以备输出为文件
	let	output = template.replace('__entry_bale_id__' , depTree.main.id);
		output = output.split('__bale_chunks__');
		output = output[0] + chunks.chunks + output[1];

	_bale_.chunks.push(_bale_.createdModule({
		source:output,
		fileName:options.entry,
		outputName:options.output.fileName,
		filePath:null,
		suffix:'.js',
		generate:true
	}));
}