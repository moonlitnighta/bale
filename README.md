# bale
<div>N年前编写的一个简单的前端模块化打包工具，主要用于我自己打包一些小项目</div>
当时webpack刚出现时所提倡的一切皆模块的思想让我突然对前端模块化有了更深的理解，二来也想提升自己，所以按照webpack皆模块的思想和自己的思路编写了一个工具
<br />
<div>1、支持 common 及 es module</div>
<div>2、其中内置了 sass less image vue 等loader</div>
<div>3、内置了 js css 文件合并 、uglifyJs 、image转base64 、 babel、html模板等功能</div>
<div>ps:这不是完整的项目，因为只是自己平时用下，所以仅在macos测试使用</div>
<br />
<br />
运行示例
    
    git clone https://github.com/moonlitnighta/bale.git
    cd bale
    npm i
    npm run build
    ./dist/*
  
```javascript
module.exports = {
	entry:'./test/main.js',
	output: 
	{
		path:'',
		fileName:'',

		//将某些js文件打包到一起并生成一个文件
		vendor:{
			//生成的文件名称
			name:'',
			//哪些需要打包
			vendors:[]
		}
	},
	//其他了类型文件（没有找到loader的类型文件）如何处理 （adopt | 跳过  prevent | 终止）
	otherFile:'adopt',

	//内置loader的配置
	internalLoaders:{
		babel:{},
		uglifyJs:{},
		vue:{},
		cssnano:{}
	},
	resolve:{
		//当读取第三方库的时候是否尝试读取其压缩版文件	
		minimal:true
	},

	//内置plugin 配置
	internalPlugin:{

		//合并样式文件
		mergeStyle:{
			extensions:['.css' , '.scss'],
			name:''
		},

		//.html 文件模板配置
		htmlTemplate:{
			template:'test/index.html',
			chunks:'',
			chunksSortMode:'',
			inject:'',
			meta:{charset:"utf-8"}
		}
	},
	loaders:[
		{
			test:/\.(ttf|svg)$/,
			use:[
				{
					//loader主体 如果是同步直接 return 异步则返回promise
					loader:function (module , options){
						
						return module;
					} , 
					//传递给loader的参数
					options:{} , 
					//在内置loader之前还是之后调用 before | after 默认之前
					process:'before'
				}
			]
		}
	],
	events:{
		//开始构建
		'start':function (){
			this.next();
		},
		//单个模块解析结束 （所有 loader 之后）
		'singleModule':function (module){
			this.next();
		},
		//全部模块构建结束 （所有 loader 之后）
		'dependencyBuildEnd': [
			function (){
				this.next();
			},
			function (){
				this.next();
			}
		],
		//所有需要拼接的模块源码组装完毕
		'sourceAssemblyEnd':function (){
			this.next();
		},
		//所有源码拼接完毕
		//所有模块的组装后的源码拼接到一起
		'sourceSpliceEnd':function (){
			this.next();
		},
		//开始输出文件
		'startWrite':function (){
			this.next();
		},
		//当输出某个文件后
		'writeSingleFile':function (file){
			//file
			this.next();
		},
		//文件输出完毕
		'writeEnd':function (){
			this.next();
		},
		//构建完毕
		'end':function (time){
			this.next();
		}
	}
}
```
