/**
* @file 处理css类型的文件的源码 查找文件依赖 将依赖打上特定标识 并且最后将源码转为js 可执行代码
**/
const fs = require('fs');
const path = require('path');
const parse = require('./parse.js');
const transformJavascript = require('./transformJavascript.js');
const styleTemp = fs.readFileSync(path.join(__dirname, 'styleLoaderTemp.js'));
/**
* 单独创建 动态插入css的模块 所有css将通过此模块插入到页面
**/
let loaderCss = null;
function loaderCssModule(){
	if(!loaderCss){
		loaderCss = this.createdModule({
			source:styleTemp,
			filePath:path.join(__dirname, 'styleLoaderTemp.js'),
			suffix:'.js',

		});
	}

	return loaderCss;
}

/**
* 方法暴露
* @param { object } options 解析对象
* @param { object } module 需要解析的模块
**/

module.exports = async function (options , module){

	//将模块源转代码字符串
	let code = module.source.toString();

	//分析依赖
	code = parse(code , module);

	//压缩css 并转为js可执行代码
	code = await transformJavascript(options , code , module);

	//将code字符串重新转化buf 传给下一个loader
	module.source = Buffer.from(code);

	module.depends.import.push({module:'css-loader-module' , body:loaderCss || loaderCssModule.call(this)});

	return module;
}