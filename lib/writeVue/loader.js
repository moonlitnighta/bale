/**
* @file 解析vue文件
**/
const vueUtils = require('@vue/component-compiler-utils');
const compiler = require('vue-template-compiler');
const path = require('path');
const esprima = require('esprima');
const estraverse = require('estraverse');

/**
* 检查当前模块的导出模式 （common | esm）
* @param { string } code 需要解析的源码
**/
function parseExport(code){
	let ast = esprima.parse(code , {sourceType:"module"});
	let res = 'module.exports =';
	estraverse.traverse(ast , {
		enter: function (node , parent){
			if(node.type == 'ExportNamedDeclaration'){
				res = 'export';
			} else if(node.type == 'ExportDefaultDeclaration'){
				res = 'export default';
			}
		}
	});
	return res
}

/**
* 将vue文件拆分为 js  css  temp
* @param { object } options 解析对象
* @param { object } module 需要解析的模块
**/
function parseVue(options , module){
	let descriptor = vueUtils.parse({
		source:module.source.toString(),
		filename:module.fileName,
		compiler:compiler,
		compilerParseOptions:{ pad: 'line' },
		sourceRoot:path.dirname(path.relative(options.context, module.filePath)),
		needMap:false
	});
	
	if(!descriptor.template && !descriptor.script && descriptor.styles.length == 0){
		return module;
	}
	descriptor.template = descriptor.template || {content:''};
	descriptor.script = descriptor.script || {content:''};
	return descriptor;
}

/**
* 为需要添加样式作用域的样式添加作用域
* @param { object } module 需要解析的模块
* @param { object } options 解析配置
**/
function addScoped(module , options){
	let res = vueUtils.compileStyle({
	    source:module.source.toString(),
	    filename: module.filePath,
	    id: options.id,
	    map: null,
	    scoped: true,
	    trim: true
	});

	if(res.errors.length){
		this.error({
			message:res.errors[0].name + ':' +res.errors[0].reason + ' ' + module.filePath + '\nline:' + res.errors[0].line, 
			exit:true
		})
	} else {
		module.source = Buffer.from(res.code);
	}
	return module;
}

/**
* 将模板的style当做单独模块输出
* @param { object } styles vue文件解析出来的styles 
* @param { object } module 需要解析的模块
**/
function createdStyleModule(styles , module){
	let styleModules = {
		modules:[],
		imports:[],
		scopeId:null
	};

	styles.forEach((item , i)=>{

		//是否为组件样式设置作用域
		if(item.attrs.scoped && !styleModules.scopeId){
			styleModules.scopeId = 'data-v-' + (Math.random() + Math.random()).toString(32).substr(5);
		}
		let m = this.createdModule({
			source:Buffer.from(item.content),
			fileName:module.fileName + '?vue&type=css&css='+i,
			filePath:module.filePath + '?vue&type=css&css='+i,
			suffix:'.' + (item.attrs.lang || 'css')
		});
		//m.customize.type == 'vue-style';
		if(item.attrs.scoped){
			if(m.suffix == '.css'){
				m = addScoped.call(this , m , {
					id:styleModules.scopeId
				});
			} else {
				m.customize.vue_scopeId = styleModules.scopeId;
			}
		}

		styleModules.modules.push(m);
		styleModules.imports.push('__bale_require__("'+ m.fileName +'")');
	})

	return styleModules;
}

/**
* 方法暴露
* @param { object } options 解析对象
* @param { object } module 需要解析的模块
**/
module.exports = function (options , module){

	if(module.suffix != '.vue'){
		if(module.customize.vue_scopeId){
			return addScoped.call(this , module , {
				id:module.customize.vue_scopeId
			});
		} else {
			return module;
		}
	}

	let opt = options.internalLoaders.vue;
	let isProduction = process.env.NODE_ENV === 'production';
	
	//解析.vue文件中的各个模块 （js html css）
	let descriptor = parseVue(options , module);

	//将模板的style当做单独模块输出
	let styleModules = createdStyleModule.call(this , descriptor.styles , module);

	//将temp转渲染函数
	let compiled = vueUtils.compileTemplate({
		source:descriptor.template.content,
		filename:module.filePath,
		compiler:compiler,
		compilerOptions:{ comments:undefined , scopeId:styleModules.scopeId },
		transpileOptions:opt.transpileOptions,
		transformAssetUrls:opt.transformAssetUrls,
		isProduction:isProduction,
		isFunctional:false,
		optimizeSSR:false
	})

	//检查当前vue模块导出模式
	let mode = parseExport(descriptor.script.content);

	//将模板的js 部分单独当做模块导出
	let mainModule = this.createdModule({
		source:Buffer.from(descriptor.script.content),
		fileName:module.fileName + '?vue&type=javascript',
		filePath:module.filePath + '?vue&type=javascript',
		suffix:'.js'
	})

	//将解析好的渲染函数当做单独模块导出
	let compiledModule = this.createdModule({
		source:Buffer.from(
			compiled.code + '\nmodule.exports = {render:render , staticRenderFns:staticRenderFns}\n'
		),
		fileName:module.fileName + '?vue&type=template',
		filePath:module.filePath + '?vue&type=template',
		suffix:'.js'
	})
	
	//将当前模块的源替换
	module.code = styleModules.imports.join('\n') + '\n' +
		'var compiled = __bale_require__("'+ compiledModule.fileName +'")\n' +
		'var main = __bale_require__("'+mainModule.fileName+'")' + 
		(mode == 'export default' ? '.default' : '') + '\n' +
		(mode == 'export default' ? 'exports.default' : 'module.exports') +
		' = Object.assign(compiled , main , {_scopeId:"'+styleModules.scopeId+'",__file:"'+path.dirname(path.relative(options.context, module.filePath))+'",_compiled:true})\n' +
		'module.exports.__esModule = ' + (mode == 'export default' || mode == 'export');

	//设置模块的依赖关系
	let deps = [compiledModule , mainModule].concat(styleModules.modules);
	deps.forEach(function (item , i){
		module.depends.import.push({
			module:item.fileName,
			body:item,
			type:'Require'
		})
	});

	return module;
}