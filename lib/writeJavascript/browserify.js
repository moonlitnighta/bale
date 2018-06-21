/**
* @file 第三方依赖均通过browserify解析
**/
const nodeLibsBrowser = require("node-libs-browser");
const globalVariable = {
	'global':'typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {}',
	'process':'__bale_require__("process")',
	'__filename':'"/index.js"',
	'__dirname':'"/"',
	'Buffer':'__bale_require__("Buffer")',
	'setImmediate':'__bale_require__("timers").setImmediate'
}

/**
* 方法暴露
* @param { object } vars node变量
* @param { string } code 解析源码
* @param { object } module 需要解析的模块
**/
module.exports = function (code , vars , module){

	let params = ['exports'] , args = [];

	for(let k in vars){
		args.push(k);
		params.push(globalVariable[k]);

		if(k == 'process' || k == 'Buffer' || k == 'setImmediate'){
			let _k = k == 'Buffer' ? 'buffer' : k == 'setImmediate' ? 'timers' : k;
			let path = nodeLibsBrowser[_k];
			if(path){
				module.depends.import.push({
					module:_k,
					type:'Require'
				})
			}
		}
	}

	if(args.length){
		code = '(function ('+args.join(',')+'){'
					+ '\n' + code + '\n' +
				'}).call('+params.join(',')+')'
	}

	return code;
}