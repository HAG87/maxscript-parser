@{%
var appendItem = function (a, b) { return function (d) { return d[a].concat([d[b]]); } };
var appendItemChar = function (a, b) { return function (d) { return d[a].concat(d[b]); } };

var flattenItem = function (a) { return function (d) { return d[a].flat(); } };


var flatten = function (d) { return d.flat(); }

var empty = function (d) { return []; };
var emptyStr = function (d) { return ""; };
%}


MAIN -> _br Block _br # {% function(d) { return d[1];} %}


Block -> _block               {% id %}
		| Block blank _block #{% flatten %}

#__block -> _ _block {% function(d) {return d[1]} %} #| blank __block | __block blank


_block -> ANY {% id %}
		| _block __ ANY {% flatten %}

# For testing purposes
ANY -> char   {% id %}



blank -> (newline _):+ {% function(d) {return null} %}


#Basic types
char -> ([^ \t\n\r]):+ {% function(d) {return d[0].join('')} %}


# Whitespace
_mbr -> _ | mbr
_br -> _ | br

br -> newline:* {% function(d) {return null} %}

mbr -> newline:+ {% function(d) {return null} %}


_ -> wschar:* {% function(d) {return null} %}
__ -> wschar:+ {% function(d) {return null} %}


wschar -> [ \t\v\f] {% id %}
newline -> [\r\n] {% id %}

	# Primitives
# ==========

# Numbers

Number -> _number {% function(d) {return {'literal': parseFloat(d[0])}} %}

_posint ->
	[0-9] {% id %}
	| _posint [0-9] {% function(d) {return d[0] + d[1]} %}

_int ->
	"-" _posint {% function(d) {return d[0] + d[1]; }%}
	| _posint {% id %}

_float ->
	_int {% id %}
	| _int "." _posint {% function(d) {return d[0] + d[1] + d[2]; }%}

_number ->
	_float {% id %}
	| _float "e" _int {% function(d){return d[0] + d[1] + d[2]; } %}


#Strings

String -> "\"" _string "\"" {% function(d) {return {'literal':d[1]}; } %}

_string ->
	null {% function() {return ""; } %}
	| _string _stringchar {% function(d) {return d[0] + d[1];} %}

_stringchar ->
	[^\\"] {% id %}
	| "\\" [^] {% function(d) {return JSON.parse("\"" + d[0] + d[1] + "\""); } %}

# Whitespace
_ -> wschar:* {% function(d) {return null} %}

__ -> wschar:+ {% function(d) {return null} %}

br -> wschar:* {% function(d) {return null} %}
	| newline:* {% function(d) {return null} %}

mbr -> wschar:+ {% function(d) {return null} %}
	| newline:+ {% function(d) {return null} %}

wschar -> [ \t\v\f] {% id %}
newline -> [\r\n] {% id %}