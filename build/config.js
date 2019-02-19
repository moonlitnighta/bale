const path = require('path');

module.exports = {
	//开发或生产模式
	mode:'development',//'production',
	extensions:['.js' , '.css' , '.scss' , '.ttf' , '.svg' , '.vue' , '.png'],
	entry:'./test/main.js',
	output: 
	{
		path:'./dist',
		fileName:'output.js',

		//将某些js文件打包到一起并生成一个文件
		vendor:{
			//生成的文件名称
			name:'vendor.js',
			//哪些需要打包
			vendors:['vue' , 'vue-router' , 'jquery']
		}
	},
	// devServer:{
	// 	staticPath:path.join(__dirname, '../static'),
	// 	port:8099,
	// 	indexFile:'index.html',
	// 	open:true
	// },
	//内置
	internalLoaders:{
		babel:{
			exclude:/(bower_components|node_modules)/,
			options:{
				presets:['latest']
			}
		},
		//uglifyJs:{},

		//扩展内置loader 的类型
		expansion:{
			'js':/\.jsx$/
		}
	},
	resolve:{
		minimal:false
	},
	internalPlugin:{
		mergeStyle:{
			extensions:['.css'],
			name:'style.css'
		},
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
						module.generate = true;
						module.outputName = 'module_' + new Date().getTime() + 
											Math.random().toString(16).substr(3) + module.suffix;
						module.code = 'module.exports = ' + '"'+ module.outputName +'";';
						return module;
					} , 
					//传递给loader的参数
					options:{} , 
					//在内置loader之前还是之后调用 before | after 默认之前
					process:'before'
				}
			]
		}
	]
}