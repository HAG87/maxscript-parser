@{%
		var appendItem = function (a, b) { return function (d) { return d[a].concat([d[b]]); } };
		var appendItemChar = function (a, b) { return function (d) { return d[a].concat(d[b]); } };

		var flattenItem = function (a) { return function (d) { return d[a].flat(); } };

		const flatten = arr => [].concat(...arr);

		const merge = function (d) {
			var arr = [].concat(...d);
			return arr.join('');
		};

		//var flatten = function (d) { return d.flat(); };

		var empty = function (d) { return []; };
		var emptyStr = function (d) { return ""; };
%}