/**
* @file 程序运行时用到的工具集合
**/

let _bale_ = global._bale_ = {
	error : function (options){

		//抛出错误
		throw new Error(options.message);

		//是否结束进程
		options.exit && process.exit();
	}
}
module.exports = _bale_;