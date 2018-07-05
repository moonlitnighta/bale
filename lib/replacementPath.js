/**
* @file 在所有依赖构建完毕后，将需要按源单独输出的模块的引用路径替换
**/


/**
* 方法暴露
* @param { object } depTree 依赖树
**/
module.exports = function (depTree){
	let modules = depTree.modules
	for(let k in modules){
		let m = modules[k];
		if(m.generate){
			for(let key in m.parentModule){
				let parentModule = m.parentModule[key];
				let source = parentModule.source.toString();
				let code = parentModule.code;

				parentModule.depends.import.forEach((item)=>{
					if(item.body.filePath == m.filePath){
						let rexg = "__BALE_REQUIRE__" + item.module + "__BALE_REQUIRE__";
						source = source.split(rexg).join(m.outputName);
						code && (code = code.split(rexg).join(m.outputName));
					}
				});
				parentModule.source = Buffer.from(source);
				parentModule.code = code;
			}
		}
	}
	return depTree;
}	