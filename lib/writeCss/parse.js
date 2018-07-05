/**
* @file 分析css类型文件依赖
**/
const postcss = require("postcss");

/**
* 过滤路径
* @param { string } url 路径
**/
function filterUrl(url){
	url = url.replace(/('|")/,'');
	return /^(http|https)/.test(url) || 
			  /^\s*data:([a-z]+\/[a-z0-9-+.]+(;[a-z-]+=[a-z0-9-]+)?)?(;base64)?,([a-z0-9!$&',()*+;=\-._~:@\/?%\s]*?)\s*$/i.test(url);
}

/**
* 提取css属性url中的参数
* @param { string } code 解析对象
**/
function parseUrl(code){
	let rexg = /url\((.*?)\)/g;
	let strs = code.match(rexg);
	let res = [];

	if(strs){
		strs.forEach(function (item){
			rexg.lastIndex = 0;
			let url = rexg.exec(item)[1];
			url && !filterUrl(url) && res.push(url.replace(/'|"/g,''));
		})
	}

	return res;
}

/**
* 方法暴露
* @param { string } code 解析的代码
* @param { object } module 需要解析的模块
**/
module.exports = function (code , module){

	let depends = module.depends;

	//将源码转ast
	const ast = postcss.parse(code);

	//提取外部样式 仅支持 @import
	ast.walkAtRules(/^import$/i, function(rule) {
		if(rule.name == 'import'){

			//提取路径
			let path;
			try {
				path = rule.params.replace(/(url\(|\)|'|"|\s)/g,'');
			} catch (err){
				global._bale_.error({
					message:'无法提取模块' + module.filePath + ':' + rule.source.start.line + '行',
					exit:true
				})
			}
			
			depends.import.push({
				module:path,
				type:'Import'
			});
		}

		rule.remove();
	});

	//提取其他引用资源
	ast.walkDecls(function (rule){
		if(rule.value.indexOf('url') > -1){

			//解析url中间的参数
			let urls = parseUrl(rule.value);

			urls.forEach(function (url){
				rule.value = rule.value.replace(url , '__BALE_REQUIRE__' + url + '__BALE_REQUIRE__');
				depends.import.push({
					module:url,
					type:'Url'
				});
			})
		}
	});
	
	return ast.toString();
}