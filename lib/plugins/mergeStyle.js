/**
* @file 将css文件合并 默认合并所有单独的css文件
**/
const path = require("path");

/**
* 检查该css模块是否依赖其他css
* @param { object } module 当前模块
**/
function findDep(module){
	let dep = module.depends.import;
	for(let i = 0; i < dep.length; i ++){
		if(dep[i].type == 'import'){
			return false
		}
	}
	return true;
}

/**
* 方法暴露
**/
module.exports = function (){
	let depTree = this.depTree;
	let modules = depTree.modules;
	let options = this.options.internalPlugin.mergeStyle;
	let code = '';

	//没有配置该项直接返回
	if(!options){
		this.next();
		return;
	}

	//遍历查找样式模块
	for(let k in modules){
		let module = modules[k];

		//是否在配置项目类型中
		let s = path.extname(module.filePath);
		if(options.extensions.indexOf(s) > -1 && findDep(module)){

			//将模块源码合并到code
			let source = module.source.toString();
			code += source;

			//遍历该模块的父模块（引用该模块的模块）
			//将所有引用删除
			for(let key in module.parentModule){
				let parentModule = module.parentModule[key];
				let parentSource = parentModule.source.toString();
				let parentCode = parentModule.code;

				parentModule.depends.import.forEach((item)=>{
					if(item.body.filePath == module.filePath){
						let rexg = new RegExp('__bale_require__\\("'+item.module+'"\\)(\\s*)(;?)',"g");
						parentSource = parentSource.replace(rexg , '');
						rexg.lastIndex = 0;
						parentCode && (parentCode = parentCode.replace(rexg , ''));
					}
				});
				parentModule.source = Buffer.from(parentSource);
				parentModule.code = parentCode;
			}

			//将模块设置不合并且不输出
			module.merge = module.generate = false;
		}
	}

	//创建输出模块
	if(code){
		let module = this.createdModule({
			source: Buffer.from(code),
			fileName:options.name,
			outputName:options.name,
			filePath:new Date().getTime() + Math.random().toString(16).substr(3),
			suffix:'.css'
		});
		this.chunks.push(module);
	}

	this.next();
}