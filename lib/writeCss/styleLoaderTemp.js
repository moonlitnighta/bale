module.exports = function (code){
	var head = document.head || document.getElementsByTagName('head')[0] || (function (){
		var el = document.createElement('HEAD');
		document.childNodes[1].insertBefore(el , document.body);
		return el;
	})();

	var style = document.createElement('STYLE');
	style.innerHTML = code;
	head.appendChild(style);
};