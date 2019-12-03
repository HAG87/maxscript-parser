variable_decl -> ("local" | "global" | "persistent" __ "global") __ decl _ ("," _ decl):*


decl -> var_name _
	| decl "=" _ expr



op_assign -> "=" | "-=" | "+=" | "*=" | "/=" | "->"

expr -> var_name

var_name -> "hola" #{% d => {return {var_name:d[0]}} %}
			| "chau" #{% d => {return {var_name:d[0]}} %}
			| "mijo" #{% d => {return {var_name:d[0]}} %}


@{%
var appendItem = function (a, b) { return function (d) { return d[a].concat([d[b]]); } };
var appendItemChar = function (a, b) { return function (d) { return d[a].concat(d[b]); } };

var flattenItem = function (a) { return function (d) { return d[a].flat(); } };

const flatten = arr => [].concat(...arr);

var merge = function (d) {
	var arr = [].concat(...d);
	return arr.join('');
};

%}

main -> (alphanum [\n]):+ {% merge %}

# [A-Za-z_0-9]:*
# [0-9]:*
#  [A-Za-z_]:+

#a -> (alpha | int):* alpha (alpha | int):*

alpha -> [A-Za-z_] #{% function(d) {return d[0].join('')} %}
int -> [0-9]       #{% function(d) {return d[0].join('')} %}


alphanum ->  [_a-zA-Z] [_a-zA-Z0-9-]:* {% d => d[0] + d[1].join('') %}

#| [a-zA-Z0-9_]:+ [A-Za-z_] {% merge %}
#| [A-Za-z_] [a-zA-Z0-9_]:+  {% merge %}

 #[a-zA-Z0-9_]:+ [A-Za-z_]  {% merge %}
  #[A-Za-z_] [a-zA-Z0-9_]:+  {% merge %}
  #| [0-9_]:* [A-Za-z_]:+ [0-9_]:* {% merge %}
