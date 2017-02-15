
$.fn.extend({ 
	Has:function(key, f) {
		if(f) {
			try {
				console.log(key + ":" + typeof this.data(key) != "undefined", 
					$.trim(this.data(key)).length > 0, 
					this.data(key) !== null);
				console.log(this.data());
			}catch(e) {
				console.error(key + " 'Has' error:" + e);
			}
		}
		return(typeof this.data(key) != "undefined" && 
			this.data(key).length > 0 && 
			this.data(key) !== null);
	},
	Switch:function(class1, class2) {
		if(this.hasClass(class1)) {
			this.removeClass(class1);
			this.addClass(class2);
		}else if(this.hasClass(class2)){
			this.addClass(class1);
			this.removeClass(class2);
		}else {
			console.warn("Switch: There are no " + class1 + " and " + class2);
			return false;
		}
		return this;
	},
	Get:function(attr) {
		var ary = [];
		this.each(function() {
			ary.push($(this).attr(attr));
		});
		return ary;
	},
	disableSelection:function() {
		return this
		.attr('unselectable', 'on')
		.css('user-select', 'none')
		.on('selectstart', false);
	},
	To:function(opt, callback) {
		var $t = this;
		var posAry = ["absolute", "relative", "fixed", "inherit"];
		var x,y;
		var t = Has(opt.time) ? opt.time : 500;
		if(Has(opt.obj)) {
			var obj = opt.obj;
			switch (opt.position) {
				case 'left':
				x = obj.offset().left - $t.outerWidth();
				y = obj.offset().top;
				break;
				case 'top':
				x = obj.offset().left + ($t.outerWidth() - obj.outerWidth()) / 2;
				y = obj.offset().top + $t.outerHeight();
				break;
				case 'bottom':
				x = obj.offset().left + ($t.outerWidth() - obj.outerWidth()) / 2;
				y = obj.offset().top - obj.outerHeight() - $t.outerHeight();
				break;
				default:
				x = obj.offset().left + obj.outerWidth();
				y = obj.offset().top;
			}
		}else {
			x = Has(opt.x) ? opt.x : 0;
			y = Has(opt.y) ? opt.y : 0;
		}
		if(posAry.indexOf(this.css("position")) < 0) {
			var pos = Has(opt.pos) ? opt.pos : "absolute";
			$t.css("position", pos);
		}
		$t.animate({"left": x, "top": y}, t, callback);
		return $t;
	},
	FullHtml:function() {
		// return this.clone().wrap("<p>").parent().html();
		return this[0].outerHTML;
	},
	getObjsText:function(child) {
		var ary = [];
		child = child || "";
		this.each(function(e) {
			if(child === "") {
				ary.push($.trim($(this).text()));
			}else {
				ary.push($.trim($(this).find(child).text()));
			}
		});
		return ary;
	},
	getObjsVal: function(child) {
		var ary = [];
		child = child || "";
		this.each(function(e) {
			if(child === "") {
				ary.push($.trim($(this).val()));
			}else {
				ary.push($.trim($(this).find(child).val()));
			}
		});
	},
	setCursorPosition : function(pos) {
		this.each(function(index, elem) {
			if (elem.setSelectionRange) {
				elem.setSelectionRange(pos, pos);
			} else if (elem.createTextRange) {
				var range = elem.createTextRange();
				range.collapse(true);
				range.moveEnd('character', pos);
				range.moveStart('character', pos);
				range.select();
			}
		});
		return this;
	},
	IndexOf : function(e) {
		this.each(function(i, v) {
			if(v == e) {
				return i;
			}
		});
	},
	leftPad : function(e, ch) {
		if (!ch && ch !== 0) ch = ' ';
		ch = ch + '';
		var str = this.text();
		var pad = '';
		var len = 0;
		if(typeof e == "number") {
			//fill up with e character
			len = e -= str.length;
		}else if(typeof e == "string") {
			if(e == "width") {
				//fill up the width limit object
				var fw = this.width();
				var w = this.css({display: "block", float: "left", visibility: "hidden"}).width();
				this.removeAttr("style");
				console.log(fw-w, ch.width(this.css("font")));
				len = Math.floor((fw - w) / ch.width(this.css("font")));
			}
		}
		// console.log(len);
		if(len <= 0) return this;
		while (true) {
			if (len & 1) pad += ch;
			len >>= 1;
			if (len) ch += ch;
			else break;
		}
		// console.log(pad + str);
		this.text(pad + str);
		return this;
	},
});

$.extend(
	$.expr[":"],{
		longText : function(obj) {
			var t = $(obj);
			// console.log(t[0].offsetWidth, t[0].scrollWidth);
			return t[0].offsetWidth < t[0].scrollWidth;
		},
		scrollY : function(obj) {
			return $(obj).get(0) ? $(obj).get(0).scrollHeight > $(obj).innerHeight() + 5 : false;
		}
	}
);


Array.prototype.last = function(replace) {
	if(typeof replace == "undefined") {
		return this[this.length-1];
	}else {
		this[this.length - 1] = replace;
		return this;
	}
};
Array.prototype.removeNoneLetter = function(ary) {
	// console.log(this, this.length);
	var reAry = [];
	for (var a = 0, L = this.length; a < L; a++) {
		var V = this[a];
		// console.log(V);
		if(typeof V == "undefined") {
			continue;
		}
		var A = V.split("");
		var i = 0;
		var v;
		if(typeof ary != "undefined") {
			for (i = 0, l = A.length; i < l; i++) {
				v = A[i];
				if(ary.indexOf(v) >= 0) {
					delete A[i];
				}
			}
		}else {
			for (i = 0, l = A.length; i < l; i++) {
				v = A[i];
				if(v.charCodeAt() >= 97 && v.charCodeAt() <= 122 || 
					(v.charCodeAt() >= 65 && v.charCodeAt() <= 90)) continue;

					delete A[i];
			}
		}
		reAry.push(A.join(""));
	}
	return reAry;
};
Array.prototype.toLowerCase = function() {
	var reAry = [];
	for (var i = 0, l = this.length; i < l; i++) {
		var v = this[i];
		reAry.push(v.toLowerCase());
	}
	return reAry;
};
Array.prototype.pushUnfind = function(e) {
	if(typeof e == "object") {
		for(var i in e) {
			if(this.indexOf(e[i]) < 0) {
				this.push(e[i]);
			}
		}
	}else if(typeof e == "string") {
		if(this.indexOf(e) < 0) {
			this.push(e);
		}
	}
	return this;
};
String.prototype.width = function(font) {
	var f = font || '12px arial',
	o = $('<div>' + this + '</div>')
	.css({
		'position': 'absolute', 
		'float': 'left', 
		'white-space': 'nowrap', 
		'visibility': 'hidden', 
		'font': f})
	.appendTo($('body')),
	w = o.width();

	o.remove();

	return w;
};
String.prototype.removeNoneLetter = function(ary) {
	var A = this.split("");
	var i = 0;
	var v;
	if(typeof ary != "undefined") {
		for (i = 0, l = A.length; i < l; i++) {
			v = A[i];
			if(ary.indexOf(v) >= 0) {
				delete A[i];
			}
		}
	}else {
		for (i = 0, l = A.length; i < l; i++) {
			v = A[i];
			if(v.charCodeAt() >= 97 && v.charCodeAt() <= 122 || 
				(v.charCodeAt() >= 65 && v.charCodeAt() <= 90)) 
				continue;

			delete A[i];
		}
	}
	return A.join("");
};
String.prototype.last = function() {
	return this.substr(-1, 1);
};
String.prototype.removeElement = function(ele) {
	var wrap = $("<div>" + this + "</div>");
	wrap.find(ele).remove();
	return wrap.html();
};
String.prototype.toUbi = function() {
	var ubiMap = {
		"key": "K",
		"wsound": "P",
		"sentences": "S",
		"sentence": "S",
		"hint": "H",
		"note": "N",
		"sup": "M",
		"supplemental": "M",
		"translate": "T"
	};
	return typeof ubiMap[String(this)] == "undefined" ? String(this) : ubiMap[String(this)];
};
String.prototype.Escape = function() {
	var entityMap = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		'"': '&quot;',
		"'": '&#39;',
		"/": '&#x2F;',
	};
	return String(this).replace(/[&<>"'\/]/g, function (s) {
		return entityMap[s];
	});
};
String.prototype.lines = function() { return this.split(/\r*\n/); };
String.prototype.lineCount = function() { return this.lines().length; };
// String.prototype.IndexOf = function(str) {
// 	var ary = [];
// 	while(String(this).indexOf(str, ary[ary.length - 1] + 1) >= 0) {
// 		console.log(String(this).indexOf(str, ary[ary.length - 1] + 1), ary[ary.length - 1]);
// 		ary.push(String(this).indexOf(str, ary[ary.length - 1] + 1));
// 	}
// 	return ary;
// }
function Has(key, f) {
	if(f) {
		console.log(typeof key != "undefined", key !== null);
	}
	return (typeof key != "undefined" && key !== null);
}
function Random(begin, end) {
	return Math.floor(Math.random() * (end - begin) + begin);
}
function Middle(lowest, target, highest) {
	return target > highest ? highest : target < lowest ? lowest : target;
}
function keyChar( e ) {
	var code = e.which || e.KeyCode;
	var ch;
	var codeArray = {
		37:"ArrowLeft",
		38:"ArrowUp",
		39:"ArrowRight",
		40:"ArrowDown",
		192:"Tiled",//前導鍵（波浪符）
		27:"Esc",
		9:"Tab",
		20:"Caps",
		16:"Shift",
		17:"Ctrl",
		18:"Alt",
		91:"Command_Left",
		93:"Command_Right",
		13:"Enter",
		188:"LessThan",
		190:"GreaterThan",
		191:"Slash",
		222:"Apostrophe",//單引號
		220:"Backslash",
		189:"HyphenMinus",//減號
		186:"Semicolon",//分號
		219:"{",
		221:"}",
		187:"Eqal",
		8:"Backspace",//almost can't use
		32:" "
	};

	if ( typeof e == "string" ) {
		ch = e;
	}else if(code >= 16 && code <= 18){
		return codeArray[code];
	} else if(!e.altKey && !e.ctrlKey && !e.shiftKey){
		if((code >= 97 && code <= 122) || (code >= 48 && code <= 57)) {
			ch = String.fromCharCode(code);
		}else if(code >= 65 && code <= 90){
			ch = String.fromCharCode(parseInt(code) + 32);
		}else {
			return codeArray[code];
		}
	}else if(e.altKey) {

	}else if(e.ctrlKey) {

	}else if(e.shiftKey) {
		if(code >= 65 && code <= 90) {
			ch = String.fromCharCode(code);
		}else if(code >= 97 && code <= 122) {
			ch = String.fromCharCode(code - 32);
		}
	}

	//- debug_var('ch.length', ch.length);
	//- debug_var('ch', ch);
	if (typeof ch == "string") {
		return ch;
	}
	return null;
}
function naturalCompare(a, b) {
	var ax = [], bx = [];

	a.replace(/(\d+)|(\D+)/g, function(_, $1, $2) { ax.push([$1 || Infinity, $2 || ""]); });
	b.replace(/(\d+)|(\D+)/g, function(_, $1, $2) { bx.push([$1 || Infinity, $2 || ""]); });

	while(ax.length && bx.length) {
		var an = ax.shift();
		var bn = bx.shift();
		var nn = (an[0] - bn[0]) || an[1].localeCompare(bn[1]);
		if(nn) return nn;
	}

	return ax.length - bx.length;
}
function GA(ary, key, def) {
	def = typeof def == "undefined" ? "" : def;
	if(typeof ary == "undefined") {
		return def;
	}
	if(typeof ary[key] != "undefined" && ary[key] !== null) {
		return ary[key];
	}else {
		return def;
	}
}

function removeScript(s) {
	var div = document.createElement('div');
	div.innerHTML = s;
	var scripts = div.getElementsByTagName('script');
	var i = scripts.length;
	while (i--) {
		scripts[i].parentNode.removeChild(scripts[i]);
	}
	return div.innerHTML; 
}
function IndexOf(val, ary, f) {
	var re = -1;
	$.each(ary, function(i, v) {
		if(f) {
			console.log(v, val, v == val);
		}
		if(v == val) {
			re = i;
			return false;
		}
	});
	return re;
}

function getUrlVariables() {
	var obj = {};
	var url = window.location.href;
	var variables;
	if(url.indexOf("?") >= 0) {
		variables = url.split("?")[1];
		var ary = [];
		if(variables.indexOf("&") >= 0) {
			variables = variables.split("&");
			for (var i = 0, l = variables.length; i < l; i++) {
				var v = variables[i];
				// console.log(v);
				ary = v.split("=");
				// console.log(ary);
				obj[ary[0]] = ary[1];
			}
		}else {
			ary = variables.split("=");
			obj[ary[0]] = ary[1];
		}
	}else {
		return {};
	}
	return obj;
}
function setUrlVariables(obj) {
	var str = "";
	$.map(obj, function (element, index) {
		if(element !== "" && typeof element != "undefined") {
			str += index + "=" + element + "&";
		}
	});
	str = str.substr(0, str.length - 1);
	return str;
}

function storage(item, save) {
	if(typeof save == "undefined") {
		return JSON.parse(localStorage.getItem(item));
	}else {
		if(typeof save == "object" || save == "array") {
			save = JSON.stringify(save);
		}
		localStorage.setItem(item, save);
		return JSON.parse(localStorage.getItem(item));
	}
}
Object.defineProperty(Object.prototype, 'map', {
	// from http://stackoverflow.com/questions/14810506/map-function-for-objects-instead-of-arrays
	// Author: Alnitak, http://stackoverflow.com/users/6782/alnitak
	// editor: SheLoBDenI
	value: function(func, obj) {
		obj = obj || this;
		var $t = this, result = {};
		var f = false;
		Object.keys($t).forEach(function(k) {
			if(f) {
				f = false;
				console.log("obj:", obj);
				console.log("$t[k]:", $t[k]);
				console.log("k:", k);
				console.log("$t:", $t);
			}
			result[k] = func.call(obj, $t[k], k, $t); 
		});
		return result;
	}
});
