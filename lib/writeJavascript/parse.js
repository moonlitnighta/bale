/**
* @file 分析文件依赖并收集
**/

const esprima = require('esprima');
const estraverse = require('estraverse');

const globalVariable = [
	'global',
	'process',
	'__filename',
	'__dirname',
	'Buffer',
	'setImmediate'
]

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
* @param { object } node 当前语法节点
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
* 链接作用域
* @param { object } parent 父级作用域
* @param { object } scope 当前作用域
**/
function linkScope(parent , scope){
	for(let k in parent){
		if(k != 'c'){
			if(parent[k] === false){
				scope[k] = false;
			};
		}
	}
	parent.c.push(scope);
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

	//作用域链
	let scopes = [{
		c:[]
	}]
	let vars = {};
	//遍历语法书
	estraverse.traverse(ast , {
		enter : function (node , parent){

			//当进入某个函数则记录它的作用域
			if( node.type == 'BlockStatement' && 
				node.body && 
				(parent.type == 'FunctionDeclaration' || parent.type == 'FunctionExpression')
			){
				if(parent.scope){
					scopes.push(parent.scope);
				} else {
					let s = {c:[]};
					linkScope(scopes[scopes.length - 1] , s);
					scopes.push(s);

					//表示当前函数的作用域已记录
					parent.scope = s;
				}
			}

			//获取当前所在的作用域
			let currentScope = scopes[scopes.length - 1];

			//查找变量
			if(globalVariable.indexOf(node.name) > -1){

				//变量定义
				if( 
					(parent.type == 'VariableDeclarator' && parent.id.name == node.name) || 
					(parent.type == 'FunctionDeclaration' && parent.id.name == node.name)
				){
					currentScope[node.name] = false;
				} else {
					if(parent.type == 'FunctionDeclaration' || parent.type == 'FunctionExpression'){
						if(parent.scope){
							parent.scope[node.name] = false;
						} else {
							let s = {c:[]};
							linkScope(currentScope , s);
							s[node.name] = false;
							//表示当前函数的作用域已记录
							parent.scope = s;
						}
					} else {
						if(	
							parent.type != 'MemberExpression' ||
							(parent.type == 'MemberExpression' && parent.object.name == node.name)
						){
							currentScope[node.name] = currentScope[node.name] === false ? 
												  false : 
												  (vars[node.name] = true);
						}
					}
				}
			}
			
			//导入 import || require
			let dep = parseCommonjs(node , parent) || parseImport(node , parent);
			if(dep){
				depends.import.push(dep);
			} else {
				dep = parseExport(node , parent);
				dep && depends.export.push(dep);
			}
		},
		leave : function (node , parent){
			//离开某个函数则删除对于的作用域
			if(node.type == 'BlockStatement' && node.body && 
				(parent.type == 'FunctionDeclaration' || parent.type == 'FunctionExpression')){
				scopes.pop();
			}
		}
	});

	return vars;
}		