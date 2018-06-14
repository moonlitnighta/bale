/**
* @file 将解析后的css转换为js可执行文件
**/
const fs = require('fs');
const path = require('path');
const postcss = require("postcss");
const cssnano = require("cssnano");
const styleTemp = fs.readFileSync(path.join(__dirname, 'styleLoaderTemp.js')).toString();

/**
* 压缩css
* @param { string } code 解析对象的源码
* @param { object } config 压缩配置
**/
function minimize(code , config){
	let pipeline = postcss();
	pipeline.use(cssnano(config));
	return pipeline.process(code , {from: undefined});
}

/**
* 将css组装为js可执行代码
* @param { string } code 解析对象的源码
* @param { array } depends 当前模块的依赖
**/
function transformJavascript(code , depends){
	code = code.replace(/\\/g,'\\\\').replace(/"/g,'\\"');

	let requireCss = '';
	for(let i = 0; i < depends.length; i ++){
		depends[i].type == 'import' && (requireCss += '__bale_require__("'+depends[i].module+'");\n');
	}
	return requireCss + '__bale_require__("css-loader-module")("'+ code +'");'
}

/**
* 方法暴露
* @param { object } options 解析对象
* @param { string } code 解析对象的源码
* @param { object } module 需要解析的模块
**/
module.exports = async function (options , code , module){

	//获取css 压缩配置
	let opt = options.internalLoaders.cssnano;
	let result = await minimize(code , opt);

	//组装成js可执行代码
	module.code = transformJavascript(result.content , module.depends.import);
	return result.content;
}