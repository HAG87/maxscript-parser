# MISSING UNARY MINUS!
#===============================================================
SCRIPT -> _ for_loop _ {% (d) => d[1] %}

#SCRIPT -> simple_expr

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



# FOR LOOP
# for i=1 to col.count | by -1 | where condition | (do | collect)
# for i in col | where condition | (do | collect)

for_loop -> "for" __ arr_source #_ #("where" EXPR ):? ("do" | "collect") #loop_expr

arr_source ->
			varName _S "=" _ simple_expr _ "to" EXPR #("by" EXPR):?
			| varName _S "=" _ simple_expr _ "to" EXPR "by" EXPR
#			| varName __ "in" EXPR


#---------------------------------------------------------------
loop_expr -> EXPR
			| loop_continue
			| loop_exit
#---------------------------------------------------------------
loop_exit -> _ "exit" _ ("with" EXPR):?
loop_continue -> _ "continue" _





#===============================================================
# WHILE LOOP
#---------------------------------------------------------------
while_loop -> "while" EXPR "do" loop_expr
#---------------------------------------------------------------
# DO LOOP
do_loop -> "do" EXPR "while" loop_expr
#---------------------------------------------------------------

#===============================================================
# ERROR CHECK STATEMENT
try_expr -> "try" EXPR "catch" ( EXPR | void_parens)
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

# EXPRESIONS END WITH LINE BREAK, CONTEXT END; OR LOWER PRECEDENTE EXPRESSION....
EXPR ->  _ _expr _  {% (d) => d[1] %}

_expr ->
		DECLARATIONS  {% id %} #OK
		| assignment  {% id %} #OK
		| simple_expr {% id %} #-----

		#| if_expr
		| while_loop
		| do_loop
#		| for_loop

		#| case_expr
		#| struct_def
		| try_expr

		#| function_def
		#| function_return
		#| context_expr
		#| max_command
		#| utility_def
		#| rollout_def
		#| tool_def
		#| rcmenu_def
		#| macroscript_def
		#| plugin_def
#---------------------------------------------------------------
#===============================================================

#===============================================================
simple_expr ->
				OPERAND         {% id %}
				| fn_call       {% id %}
				| math_expr     {% id %}
				| compare_expr  {% id %}
				| logical_expr  {% id %}

				#<expr_seq>

#<expr_seq> ::= ( <expr> { ( ; | <eol>) <expr> } )
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
OPERAND ->	  factor		{% id %}
			| property		{% id %}
			| index			{% id %}
#===============================================================
# FUNCTION CALL
# up to an end of line or lower precedence token

fn_call -> OPERAND "(" _ ")"			{% (d) => ({call:d[0]}) %}
         | OPERAND (__ parameter):+ 	{% (d) => ({call:d[0], params:( dropNull(d[1]) ) }) %}


parameter -> OPERAND 	{% id %}
            |param 		{% id %}
#===============================================================
# PROPERTIES
property -> OPERAND "." varName {% (d) => ({property:{parent:d[0], name:d[2]} }) %}
#===============================================================
# PARAMS
param -> varName _S ":" _ ( OPERAND ):? {% (d) => ({param:d[0], value:d[4]}) %}
#===============================================================
# INDEX
index -> OPERAND "[" _ EXPR _ "]"
#===============================================================
#FACTOR -- THIS ARE THE BASIC VALUES - TOKENS

factor ->
		varName         {% id %}
		| number        {% id %}
		| string        {% id %}
		| box2          {% id %}
		| point3        {% id %}
		| point2        {% id %}
		| name_value    {% id %}
		| bool          {% id %}
		| void          {% id %}
		| array         {% id %}
		| bitarray      {% id %}
#<path_name>
#<var_name>




#- <expr> -- unary minus
#<expr_seq>
#? -- last Listener result
#===============================================================
# MATH EXPRESSIONS
math_expr -> sum 				 			{% (d, l, reject) => Array.isArray(d[0]) && d[0].length > 1 ? d[0] : reject %}

sum -> sum _ ("+"|"-") _ product 			{% (d) => [(d[0][0]), (d[2][0]), d[4] ]%}
	 | product #{% id %}

product -> product _ ("*"|"/") _ exp 		{% (d) => [d[0], (d[2][0]), d[4] ]%}
		 | exp {% id %}

# this is right associative!
exp -> conversion _ "^" _ exp 				{% (d) => [d[0], d[2], d[4] ]%}
	| conversion {% id %}

conversion -> math_operand __ "as" __ class {% (d) => [d[0], d[2], d[4] ]%}
			| math_operand {% id %}
#math_expr ->
#        	  math_operand _ "+" _ math_operand
#        	| math_operand _ "-" _ math_operand
#        	| math_operand _ "*" _ math_operand
#        	| math_operand _ "/" _ math_operand
#        	| math_operand _ "^" _ math_operand
#			| math_operand _ "as" _ class {% dropNull %}
#---------------------------------------------------------------
math_operand ->
			   OPERAND   {% id %}
			 | fn_call {% id %}
			#| math_expr
#---------------------------------------------------------------
class -> varName
#===============================================================
# LOGIC EXPRESSIONS
logical_expr -> _logical_expr

_logical_expr ->
 logical_operand __ ("or" | "and") __ ("not" __):? logical_operand
{% function(d) {
	return {expr:'logic',
			left:d[0],
			type:(d[4] != null ? d[2][0] + ' ' + d[4][0] : d[2][0]),
			right:d[5]};
	}
%}
| _logical_expr __ ("or" | "and") __ ("not" __):? logical_operand
{% function(d) {
	return {
		expr:'logic',
		left:d[0],
		type:(d[4] != null ? d[2][0] + ' ' + d[4][0] : d[2][0]),
		right:d[5]};
	}
%}
| "not" __ logical_operand
{% function(d) {
	return {expr:'logic',
			type:'negation',
			right:d[2]};
	}
%}
#---------------------------------------------------------------
# logical_expr -> _logical_expr #{% (d, l, reject) => Array.isArray(d[0]) ? d : reject  %}

# _logical_expr -> _logical_expr __ ("or" | "and") __ negation {% function(d) {return {expr:'logic', left:d[0], type:d[2][0], right:d[4]};} %}
# | negation {% id %}

# negation ->
# "not" __ logical_operand {% (d) => [d[0], d[2] ]%}
# | logical_operand

logical_operand ->
                    OPERAND      {% id %}
                  | compare_expr {% id %}
                  | fn_call      {% id %}
#===============================================================
# COMPARE EXORESSIONS
compare_expr ->
                 compare_op _ "==" _ compare_op # equal
               | compare_op _ "!=" _ compare_op # not equal
               | compare_op _ ">"  _ compare_op # greater than
               | compare_op _ "<"  _ compare_op # less than
               | compare_op _ ">=" _ compare_op # greater than or equal
               | compare_op _ "<=" _ compare_op # less than or equal

compare_op ->
                 OPERAND
               | fn_call
			   | math_expr
#===============================================================
# KEYWORDS
keyword ->
"about"      | "and"    | "animate"     | "as"         | "at"          | "by"     | "case"   |  "catch" | "collect" | "continue"
| "coordsys" | "do"     | "dontcollect" | "else"       | "exit"        | "fn"     | "fn"     | "for"    | "from"    | "function"
| "global"   | "if"     | "in"          | "local"      | "macroscript" | "mapped" | "max"    | "not"    | "of"      | "off"
| "ok"       | "on"     | "or"          | "parameters" | "persistent"  | "plugin" | "rcmenu" | "return" | "rollout"
| "set"      | "struct" | "then"        | "throw"      | "to"          | "tool"   | "try"    | "undo"   | "utility"
| "when"     | "where"  | "while"       | "with"
#===============================================================
#ARRAY
array -> "#(" _ ")" 			{% d => "[]" %}
 		| "#(" array_expr ")"  #{% flatten %}

array_expr -> #EXPR ("," EXPR):*
 			  EXPR {% id %}
 			 |array_expr "," EXPR {% d => [d[0], d[2]] %}
#---------------------------------------------------------------
bitarray -> "#{" _ "}"				{% d => "#{}" %}
		  | "#{" bitarray_inner "}" {% (d) => ({ bitarray:("#{" + d[1] + "}") }) %}

bitarray_inner -> (bitarray_expr | _ "," _ bitarray_expr):+ {% d => merge(d[0]) %}

bitarray_expr -> _posint {% id %}
| _posint  ".."  _posint {% (d) => d.join('') %}
#===============================================================
# TYPES
box2 -> "[" EXPR "," EXPR "," EXPR "," EXPR "]"
#---------------------------------------------------------------
point3 -> "[" EXPR "," EXPR "," EXPR "]"
{% (d) => (	{type: 'Point3', x:d[1], y:d[3], z:d[5]}) %}
#---------------------------------------------------------------
point2 -> "[" EXPR "," EXPR "]"
{% (d) => (	{type: 'Point2', x:d[1], y:d[3]}) %}
#---------------------------------------------------------------
name_value -> "#" alphanum {% (d) => d[0] + d[1] %}
#---------------------------------------------------------------
bool -> ("true" | "on") {% (d) => true %}
		| ("false" | "off") {% (d) => false %}
#---------------------------------------------------------------
void ->
	     "undefined"  {% (d) => ({value:d[0]}) %}
	   | "unsupplied" {% (d) => ({value:d[0]}) %}
	   | "ok"         {% (d) => ({value:d[0]}) %}
#---------------------------------------------------------------
#---------------------------------------------------------------
#---------------------------------------------------------------

#===============================================================
# TOKENS
#===============================================================
varName -> alphanum {% dropKeyword %}
#===============================================================
#Strings
string -> "\"" _string "\"" {% (d) => ({'literal':d[1]}) %}

_string ->
	null {% (d) => "" %}
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
	_int      {% id %}
	| _float  {% id %}
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
LPAREN ->  "("  {% (d) => null %}
RPAREN ->  ")"  {% (d) => null %}
void_parens -> "(" _ ")"
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

#===============================================================
@{%

	var keywords = [
	"about"    , "and"    , "animate"     , "as"         , "at"          , "by"     , "case"   ,  "catch" , "collect" , "continue" ,
	"coordsys" , "do"     , "dontcollect" , "else"       , "exit"        , "fn"     , "fn"     , "for"    , "from"    , "function" ,
	"global"   , "if"     , "in"          , "local"      , "macroscript" , "mapped" , "max"    , "not"    , "of"      , "off"      ,
	"ok"       , "on"     , "or"          , "parameters" , "persistent"  , "plugin" , "rcmenu" , "return" , "rollout" ,
	"set"      , "struct" , "then"        , "throw"      , "to"          , "tool"   , "try"    , "undo"   , "utility" ,
	"when"     , "where"  , "while"       , "with"       , "unsupplied"  , "undefined"

	]

	const dropKeyword = (d, l, r) => (keywords.includes(d[0]) ? r : d[0]);

	const flatten = arr => [].concat(...arr);

	const filterNulll = arr => arr.filter(e => e != null );

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

	function dropNull(d) {

		var arr = d.map( e => {

			//e.filter(e => e != null );

			if (Array.isArray(e)) {
				return filterNulll(e);
			} else {
				return e;
			};

		});

		return arr;
	};

%}