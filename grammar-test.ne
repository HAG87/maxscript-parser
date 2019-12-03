@{%
var appendItem = function (a, b) { return function (d) { return d[a].concat([d[b]]); } };
var appendItemChar = function (a, b) { return function (d) { return d[a].concat(d[b]); } };

var flattenItem = function (a) { return function (d) { return d[a].flat(); } };


var flatten = function (d) { return d.flat(); }

var empty = function (d) { return []; };
var emptyStr = function (d) { return ""; };
%}



MAIN -> _br Block _br # {% function(d) { return d[1];} %}


# Recurse: consume everything
Block -> _block               {% id %}
		| Block blank _block #{% flatten %}

#__block -> _ _block {% function(d) {return d[1]} %} #| blank __block | __block blank



# Recurse: consume everything in one line
_block -> ANY {% id %}
		| _block __ ANY {% flatten %}



# For testing purposes
ANY -> char   {% id %}


# Building blocks


#Basic types
char -> ([^ \t\n\r]):+ {% function(d) {return d[0].join('')} %}


# Whitespace
blank -> (newline _):+ {% function(d) {return null} %}
_mbr -> _ | mbr
_br -> _ | br

br -> newline:* {% function(d) {return null} %}
mbr -> newline:+ {% function(d) {return null} %}


_ -> wschar:* {% function(d) {return null} %}
__ -> wschar:+ {% function(d) {return null} %}


wschar -> [ \t\v\f] {% id %}
newline -> [\r\n] {% id %}