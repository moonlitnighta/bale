/**
* @file 分析文件依赖并收集
**/

const esprima = require('esprima');
const estraverse = require('estraverse');

/**
* common js 规范查找 处理 require( xxx ) || require( 表达式 );
* @param { object } node 当前语法书节点
* @param { object } parent node的父节点
**/
function parseCommonjs(node , parent){
	if( node.name == 'require' &&
		node.type == 'Identifier' &&  
		parent.type == 'CallExpression' && 
		parent.arguments && 
		parent.arguments[0].value ){

		return {
			range:parent.range,
			type:'Require',
			module:parent.arguments[0].value
		}
	}
}
/**
* es6 import 规范查找 处理 import
* @param { object } node 当前语法书节点
* @param { object } parent node的父节点
**/
function parseImport(node , parent){
	let specifiers = [];
	if( node.type == 'ImportDeclaration'){

		if(node.specifiers.length){
			// 处理 import { x } || { x , y } 的情况
			node.specifiers.forEach((obj)=>{
				specifiers.push({
					local:obj.local.name,
					imported:obj.imported ? obj.imported.name : 'default'
				});
			});
		} else {
			// 处理 import 'css' 的情况
			specifiers.push({
				local:'',
				imported:''
			});
		}
		

		return {
			range:node.range,
			type:'Import',
			imports:specifiers,
			module:node.source.value
		}
	}
}
/**
* es6 import 规范查找 处理 export
* @param { object } node 当前语法书节点
* @param { object } parent node的父节点
**/
function parseExport(node , parent){
	let specifiers = [];
	if(node.type == 'ExportNamedDeclaration'){

		// 处理 export { a } || export { a , b }
		if(node.specifiers && node.specifiers.length){
			node.specifiers.forEach((obj)=>{
				specifiers.push({
					exported:obj.exported.name,
					local:obj.local.name
				});
			});

			return {
				range:node.range,
				type:'Export',	
				exports:specifiers
			}
		} 

		//export 后面跟变量申明情况 export var a = value || export var a , b;
		else if(node.declaration && node.declaration.type == 'VariableDeclaration'){
			node.declaration.declarations.forEach((obj , i)=>{
				if(obj.type == 'VariableDeclarator'){

					//第一个变量的范围始终是 export语句开始 到 var x结束
					let range = i ? obj.id.range : [
						node.range[0],
						obj.id.range[1]
					]
					specifiers.push({
						name:obj.id.name,
						range:range
					})
				}
			});

			return {
				range:node.range,
				type:'ExportVariable',
				exports:specifiers
			}
		}
	} else if(node.type == 'ExportDefaultDeclaration'){

		//默认导出
		return {
			range:[node.range[0] , node.declaration.range[0]],
			type:'Export',
			exports:[
				{
					exported:'default',
					local:''
				}
			]
		}
	}
}

/**
* 方法暴露
* @param { string } source 分析的文件源码
* @param { object } module 分析的模块
**/

module.exports = function (source , module){
	let depends = module.depends;

	//源码转ast
	let ast = esprima.parse(source , {range: true , sourceType:"module"});

	//遍历语法书
	estraverse.traverse(ast , {
		enter : function (node , parent){

			//导入 import || require
			let dep = parseCommonjs(node , parent) || parseImport(node , parent);
			if(dep){
				depends.import.push(dep);
			} else {
				dep = parseExport(node , parent);
				dep && depends.export.push(dep);
			}
		}
	});
}		