/**
* @file 写入文件
**/
const fs = require('fs');
const path = require('path');
const UglifyJS = require('uglify-js');

function fsExistsSync(path) {
    try{
        fs.accessSync(path,fs.F_OK);
    }catch(e){
        return false;
    }
    return true;
}

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
**/
module.exports = async function (options , depTree){

	//文件夹不存在则创建
	if(!fsExistsSync(options.output.context)){
		await fs.mkdir(options.output.context);
	}

	//触发开始输出事件
	await _bale_.emit('startWrite');
	
	let root = _bale_.root.concat(_bale_.chunks);
	//遍历root 输出已合并好的文件
	for(let k = 0;  k < root.length; k ++){

		let source = root[k].source;

		//是否压缩代码
		if(root[k].suffix == '.js' && options.internalLoaders.uglifyJs){
			if(Buffer.isBuffer(source)){
				source = source.toString();
			}
			source = UglifyJS.minify(source).code;
		}
		let res = await writeFile(
			path.join(options.output.context , root[k].outputName),
			source
		)

		//触发单个文件输出事件
		await _bale_.emit('writeSingleFile' , {
			file:root[k],
			url:path.join(options.output.context , root[k].outputName)
		});
	}

	//文件输出完毕
	await _bale_.emit('writeEnd');
	
	return true;
}