@{%
var appendItem = function (a, b) { return function (d) { return d[a].concat([d[b]]); } };
var appendItemChar = function (a, b) { return function (d) { return d[a].concat(d[b]); } };

var flattenItem = function (a) { return function (d) { return d[a].flat(); } };

const flatten = arr => [].concat(...arr);

var merge = function (d) {
	var arr = [].concat(...d);
	return arr.join('');
};

//var flatten = function (d) { return d.flat(); };

var empty = function (d) { return []; };
var emptyStr = function (d) { return ""; };
%}



MAIN ->
_br (
	#Block
	 struct_def
	#| fn_def
) _br

{% function(d) {return d[1]} %}

#===============================================================
# DEFINITIONS
#===============================================================
#struct (member, (member):*)

struct_def ->
"struct" __ var_name _
lparen
	members
rparen

members -> member {% id %}
		 | members ___ comma ___ member {% flatten %}

member -> var_name
		| fn_def


comma -> "," {% function(d) {return null} %}

#(mapped):? __ (function 1 fn) __ var_name __ (arg _):* "=" expr
fn_def -> ("mapped"):? __ ("function" | "fn" ) __ var_name "="


#===============================================================

#===============================================================
# member -> Block

# Recurse: consume everything
Block -> _block               {% id %}
		| Block blank _block #{% flatten %}

#__block -> _ _block {% function(d) {return d[1]} %} #| blank __block | __block blank



# Recurse: consume everything in one line
_block -> ANY {% id %}
		| _block __ ANY {% flatten %}



# For testing purposes
ANY -> _any   {% id %}
	  | alphanum
	  | int


# Building blocks

# variable_decls -> ( "local" | ("persistent"):? __ "global" ) decl ( "," decl ):?
#decl -> var_name _ ("=" _ expr):?  # name and optional initial value


var_name -> alphanum {% id %}
#Basic values
#Others
#Strings
#Numers


#Basic tokens
lparen -> ___ "(" ___ {% id %}
rparen -> ___ ")" ___ {% id %}



alphanum -> [0-9]:* [A-Za-z_]:+ [A-Za-z_0-9]:* {% merge %} #{% function(d) {return d.join('')} %}



alpha -> [A-Za-z_]:+ {% function(d) {return d[0].join('')} %}
int -> [0-9]:+       {% function(d) {return d[0].join('')} %}

_any -> [^ \t\n\r]:+ {% function(d) {return d[0].join('')} %}


# Whitespace
blank -> (newline _):+ {% function(d) {return null} %}

_mbr -> _ | mbr
_br -> _ | br

br -> newline:* {% function(d) {return null} %}
mbr -> newline:+ {% function(d) {return null} %}

_ -> wschar:* {% function(d) {return null} %}
__ -> wschar:+ {% function(d) {return null} %}

___ -> wsnlchar:* {% function(d) {return null} %}


wsnlchar -> [ \t\v\f\r\n] {% id %}
wschar -> [ \t\v\f] {% id %}
newline -> [\r\n] {% id %}
