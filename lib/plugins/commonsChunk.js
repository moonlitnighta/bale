/**
* @file 解析文件编译对象vendor字段 将依赖打包为独立文件
**/
const resolve = require('../resolve.js');
const path = require('path');
const fs = require('fs');
const template = fs.readFileSync(path.join(__dirname, '../output/commonTemp.js')).toString();

function getTemp(depid , id){
	return '"' + id + '": (function ( module , exports , __bale_require__){\n'
		+ '__bale_require__("'+depid+'")(module , exports , __bale_require__ , "'+id+'")' +
	'\n}),\n';
}

/**
* 生成对接的module
* @param { object } module m块
**/
function spliceCode(module){
	return '"' + module.id + '": (function ( module , exports , __bale_require__){\n'
		+ module.code +
	'\n}),\n';
}

/**
* 方法暴露
**/
module.exports = async function (){

	let depTree = this.depTree , options = this.options;
	let vendor = options.output.vendor , paths = [] , modules = [] , chunks = '';

	//检查参数是否有
	if(!vendor || (vendor && vendor.vendors.length == 0)){
		this.next();
		return;
	}

	//查找配置的所有vendors的绝对路径
	for(let i = 0 ; i < vendor.vendors.length; i ++){
		let m = await resolve(options , options.context , vendor.vendors[i]);
		paths.push(m.filePath);
	}

	//遍历依赖树找到对应的模块
	if(paths.length){
		paths.forEach(function (item){
			for(let k in depTree.modules){
				if(item == k){
					modules.push(depTree.modules[k]);
				}
			}
		})
	}

	if(modules.length){

		//生成对接的module
		let suffix = path.extname(vendor.name);
		let name = vendor.name.replace(suffix , '');
		let module = this.createdModule({
			source: Buffer.from('module.exports = ' + name + ';'),
			fileName:vendor.name,
			outputName:vendor.name,
			filePath:new Date().getTime() + Math.random().toString(16).substr(3),
			suffix:suffix,
			code:'module.exports = ' + name + ';',
			type:'hidden'
		});

		//将模块添加到树
		module = depTree.addModule(module);
		module.code = spliceCode(module);

		//修改所有需要提取的module
		modules.forEach(function (m){

			//将module原来的代码拼接
			chunks += m.code;

			//改变module源码
			m.code = getTemp(module.id , m.id);

			//添加拼接模块的依赖
			m.depends.import.push({
				module:vendor.name,
				body:module,
				type:'Require'
			})
		});

		let code = template.replace('__name__' , name);
			code = code.split('__bale_chunks__');
			code = code[0] + chunks + code[1];

		//将拼接好的chunk添加到root以备单独输出
		this.chunks.push(this.createdModule({
			source:code,
			fileName:vendor.name,
			outputName:vendor.name,
			filePath:null,
			suffix:suffix
		}))
	}

	this.next();
}