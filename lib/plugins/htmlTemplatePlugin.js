/**
* @file 生成html文件的插件
**/
const path = require('path');
const fs = require('fs');
var htmlparser = require("htmlparser2");

let template =  '<!DOCTYPE html>' +
				'<html>' +
					'<head>' +
						'<title></title>' +
					'</head>' +
					'<body>' +
					'</body>' +
				'</html>';

/**
* 创建节点
* @param { string } name 节点名称
* @param { string } type 节点类型
**/
function createdNode(name , attribs){
	return {
		attribs:attribs || {},
		children:[],
		name:name,
		type:'tag'
	}
}

/**
* 节点树种返回节点 （没有则添加节点再返回）
* @param { string } name 节点名称
* @param { object } dom 节点树
* @param { function } cb 回调
**/
function getNode(name , dom , cb){
	let document = htmlparser.DomUtils;
	let node = document.getElementsByTagName(name , dom)[0];
	if(node){
		return node;
	} else {
		return cb(name , dom);
	}
}

/**
* 检查当前html模板文件是否合法（必须包含DOCTYPE && html）
* @param { object } dom 节点树
**/
function verifyHtml(dom){
	let html = false;
	let doctype = false;
	dom.forEach((node)=>{
		if(node.name == '!doctype' && node.type == 'directive'){
			doctype = true;
		} else if(node.name == 'html' && node.type == 'tag'){
			html = true;
		}
	})

	return html && doctype;
}

/**
* 处理需要引入的chunks的引入顺序
* @param { object } chunks 
* @param { string } inject 配置的容器位置 
**/
function chunksSort(chunks , chunksName , inject){
	let _chunks = [];
	chunksName.forEach((name)=>{
		chunks.forEach((m)=>{
			if(m.outputName == name || m.outputName == name.name){
				if(m.suffix == '.css' || m.suffix == '.js'){
					let _inject = m.suffix == '.css' ? 'head' : inject;
					_chunks.push({
						module:m,
						inject:name.inject || _inject
					});
				};
			}
		})
	});
	return _chunks;
}

/**
* 方法暴露
**/
module.exports = function (){
	let options = this.options.internalPlugin.htmlTemplate;
	if(!options){
		this.next();
		return;
	}

	let chunks = options.chunks;
	let modules = this.chunks;
	let imports = [];

	//如果配置模板则获取模板
	if(options.template){
		template = fs.readFileSync(path.resolve(this.options.context , options.template))
					 .toString();
	}

	//解析html
	var handler = new htmlparser.DomHandler((error, dom)=>{
		if( error || !verifyHtml(dom)){
			this.error({
				message:'Error: ' + options.template + '解析错误',
				exit:false
			})
			this.next();
			return;
		}

		let document = htmlparser.DomUtils;
		let html = document.getElementsByTagName("html" , dom)[0];

		let body =  getNode('body' , dom , function (name , dom){
			document.appendChild(html , createdNode('body'));
			return getNode(name , dom);
		});

		let head = getNode('head' , dom , function (name , dom){
			document.prepend(body , createdNode('head'));
			return getNode(name , dom);
		});

		//设置meta标签
		if(options.meta && Object.prototype.toString.call(options.meta) == '[object Object]'){
			let prv = head.children[0];
			if(prv){
				document.prepend(prv , createdNode('meta' , options.meta));
			} else {
				document.appendChild(head , createdNode('meta' , options.meta));
			}
		}

		//设置title标签
		let title = getNode('title' , dom , function (name , dom){
			document.appendChild(head , createdNode('title'));
			return getNode(name , dom);
		});
		if(title.children.length == 0){
			document.appendChild(title , {
				data:options.title,
				type:'text',
				parent:title
			});
		}
	    
	    //处理css js 的引入
	    if(typeof options.chunksSortMode == 'function'){
	    	imports = options.chunksSortMode(modules);
	    } else {
	    	if(Object.prototype.toString.call(chunks) == '[object Array]'){
		    	imports = chunksSort(modules , chunks , options.inject);
		    } else if(chunks == 'all'){
		    	modules.forEach((m)=>{
		    		imports.push({
		    			module: m,
		    			inject: m.suffix == '.css' ? 'head' : options.inject
		    		})
		    	})
		    }
	    }
		    
	    if(chunks == 'all' || Object.prototype.toString.call(chunks) == '[object Array]'){
			imports.forEach((item)=>{
				if(item.module.suffix == '.css'){
					document.appendChild(
						item.inject == 'body' ? body : head , 
						createdNode('link' , {
							rel:'stylesheet',
							href:'./' + item.module.outputName
						})
					);
				} else if (item.module.suffix == '.js'){
					document.appendChild(
						item.inject == 'head' ? head : body , 
						createdNode('script' , {
							type:"text/javascript",
							src:'./' + item.module.outputName
						})
					);
				}
			});
	    }

	    this.chunks.push(this.createdModule({
			source:htmlparser.DomUtils.getInnerHTML({ children: dom }),
			fileName:options.filename,
			outputName:options.filename,
			filePath:null,
			suffix:'.html',
			generate:true
		}))

	    this.next();
	});
	var parser = new htmlparser.Parser(handler);
	parser.write(template);
	parser.end();
}