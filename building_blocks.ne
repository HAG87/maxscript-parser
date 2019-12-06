@{%
	const flatten = arr => [].concat(...arr);

	const merge = function (d) {
		var arr = [].concat(...d);
		return arr.join('');
	};

	const testAlphanum = function (d, l, reject) {
		var re = new RegExp("^\\d+$");

		// var str = merge(d);

		if (re.test(d[0])) {
            return reject;
        } else {
            return d[0];
        }
	};

%}
#===============================================================
SCRIPT -> _ fn_call _ {% (d) => d[1] %}
#<parens> ::= <matched>
#          | <matched> <parens>

#<matched> ::= ()
#           | ( <parens> )

#parens -> matched _
#          | matched _ parens  {% id %}

#matched ->
#			"()"
#		   | varName
#           | "(" parens ")"

# SPACE OR EOL
#_EOL -> wsnlchar:+
#		| newline:+
#		| _EOL ";" #| _EOL
#===============================================================
#ASSIGNMENT
#===============================================================
assignment ->
      destination _ assignOp  _ EXPR {% (d) => ({op:d[2], dest:d[0], expr:d[4]}) %}

destination  ->
      varName  {% id %}
    | property {% id %}
    | index    {% id %}

assignOp ->
	  "="  {% (d) => 'assign' %}
    | "+=" {% (d) => 'increment' %}
    | "-=" {% (d) => 'decrement' %}
    | "*=" {% (d) => 'product' %}
    | "/=" {% (d) => 'division' %}
#===============================================================
#EXPRESSIONS
#===============================================================
#---------------------------------------------------------------

#---------------------------------------------------------------
EXPR ->  _ _expr _ {% (d) => d[1] %}

_expr ->
		DECLARATIONS  {% id %} #OK
		| assignment  {% id %} #OK
		| simple_expr {% id %} #OK
#---------------------------------------------------------------
simple_expr ->
OPERAND
#===============================================================
#DECLARATIONS
#===============================================================
DECLARATIONS ->
				typed_var_decl
				| expl_gl
#				| decl

typed_var_decl ->
				"local" _ var_decl 							{% (d) => ({'local':d[2]}) %}
				| ("persistent" __ ):? "global" _ var_decl	{% (d) => ({'global':d[2]}) %}

expl_gl -> "::" decl 										{% (d) => ({'global':d[1]}) %}

var_decl ->  decl											{% id %}
		   | var_decl _S "," _ decl 						{% (d) => ([].concat(d[0], d[4])) %}

decl -> varName			        							{% (d) => ( {decl:d[0]} ) %}
      | varName _S "=" _ EXPR   							{% (d) => ( {decl:d[0], exp:d[4]} ) %}

#===============================================================
OPERAND ->
factor
| property
| index
#===============================================================
# FUNCTION CALL
# up to an end of line or lower precedence token

fn_call -> OPERAND "(" _ ")"
       #  | OPERAND _ (parameter _):*

parameter -> OPERAND
            |param
#===============================================================
# PROPERTIES
property -> OPERAND "." varName {% (d) => ( {property:{parent:d[0], name:d[2]} } ) %}
#===============================================================
# PARAMS
param -> varName _S ":" _ ( OPERAND):? {% (d) => ( {param:d[0], value:d[4]} ) %}
#===============================================================
# INDEX
index -> OPERAND "[" _ EXPR _ "]"
#===============================================================
#FACTOR -- THIS ARE THE BASIC VALUES - TOKENS
factor ->
		varName {% id %}
		| number
		| string
		| box2
		| point3
		| point2
#===============================================================
# MATH EXPRESSIONS
#math -> sum
#sum -> sum ("+"|"-") product | product
#product -> product ("*"|"/") exp | exp
#exp -> number "^" exp | number # this is right associative!
#===============================================================
#ARRAY
#===============================================================
# TYPES
box2 -> "[" EXPR "," EXPR "," EXPR "," EXPR "]"
#---------------------------------------------------------------
point3 -> "[" EXPR "," EXPR "," EXPR "]"
{% (d) => (	{type: 'Point3', x:d[1], y:d[3], z:d[5]}) %}
#---------------------------------------------------------------
point2 -> "[" EXPR "," EXPR "]"
{% (d) => (	{type: 'Point2', x:d[1], y:d[3]}) %}
#===============================================================
# TOKENS
#===============================================================
varName -> alphanum {% id %}
#===============================================================
#Strings
string -> "\"" _string "\"" {% function(d) {return {'literal':d[1]}; } %}

_string ->
	null {% function() {return ""; } %}
	| _string _stringchar {% function(d) {return d[0] + d[1];} %}

_stringchar ->
	[^\\"] {% id %}
	| "\\" [^] {% function(d) {return JSON.parse("\"" + d[0] + d[1] + "\""); } %}
#---------------------------------------------------------------
# Numbers
#---------------------------------------------------------------
# 1.0d0 --returns 1.0d0
# 0.5 as Double --returns0.5d0
# 2.0d5--returns 2000000.0d0
# 1.2d-3 --returns 0.0012d0
#---------------------------------------------------------------
number -> _number {% (d) => ({'literal':d[0]}) %}
_number ->
	_int {% id %}
	| _float {% id %}
	| _double {% id %}
#---------------------------------------------------------------
_double -> _float "d" _int {% function(d) {return d[0] + d[1] + d[2]; }%}
#---------------------------------------------------------------
_float -> _int "." _posint {% function(d) {return d[0] + d[1] + d[2]; }%}
#---------------------------------------------------------------
_int ->
	"-" _posint {% function(d) {return d[0] + d[1]; }%}
	| _posint {% id %}

_posint ->
	[0-9] {% id %}
	| _posint [0-9] {% function(d) {return d[0] + d[1]} %}
#---------------------------------------------------------------
alphanum -> _alphanum {% testAlphanum %}
_alphanum -> anchar:+ {% merge %}
#===============================================================
LPAREN ->  "(" {% (d) => null %}
RPAREN ->  ")"  {% (d) => null %}
#===============================================================
anchar -> [A-Za-z_0-9]
digit -> [0-9]
wsnlchar -> [ \t\v\f\r\n] {% id %}
wschar -> [ \t\v\f]       {% id %}
newline -> [\r\n]         {% id %}
#===============================================================
#SYNTAX
EOL -> _ ( mbr | ";") _ {% (d) => null %}

# Whitespace
blank -> (newline _):+ {% (d) => null %}

_mbr -> null | _  mbr _
_br -> null | _  br _

br -> newline:*  {% (d) => null %}
mbr -> newline:+ {% (d) => null %}


_S -> wschar:*      {% (d) => null %}
_ -> wsnlchar:*     {% (d) => null %}
__ -> wsnlchar:+    {% (d) => null %}
___ -> (wsnlchar:+ | ___ ";" ) {% (d) => null %}