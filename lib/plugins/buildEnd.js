/**
* @file 构建结束
**/
module.exports = function (time){
	let chunks = this.depTree.chunks;

	//计算隐藏模块
	let modules = this.depTree.modules , h = 0 , s = 0;
	for(let k in modules){
		if(modules[k].type == 'hidden'){
			h ++;
		} else if(modules[k].type == 'project'){
			s ++;
		}
	}

	let buildSize = this.buildSize > 1000 ? (this.buildSize / 1000) + ' KB' : this.buildSize + ' Bytes';
	console.log(
		'\nBuild completed！\n' +
		'Total modules: ' + chunks + '\n' +
		'Hidden modules: ' + h + '\n' +
		'Project modules: ' + s + '\n' +
		'Build size: ' + buildSize + '\n' + 
		'Time： ' + time + 'ms\n'
	);

	this.next();
}