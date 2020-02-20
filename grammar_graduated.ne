# MISSING UNARY MINUS!
# block-expressions!!!
# PARENSSS
# ( <expr> { (; | <eol>) <expr> } )
#===============================================================
SCRIPT -> _ item_group _ {% (d) => d[1] %}

#rollout roll_caca "rollout caca" width:50 height:30 ()

#SCRIPT -> _ _expr _ {% (d) => d[1] %}

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
#===============================================================
# EXPRESSION SEQUENCES
EXPR ->  _ _expr   #{% (d) => d[1] %}
| EXPR EOL _expr

expr_seq ->  _ simple_expr   #{% (d) => d[1] %}
| expr_seq EOL simple_expr
#===============================================================
# DEFINITIONS
#===============================================================
# UTILITY DEFINITION
# PLUGIN DEFINITION
# RC MENU DEFINITION
# TOOL - MOUSE TOOL DEFINITION
#===============================================================
# ROLLOUT DEFINITION
rollout_def -> "rollout" __ varName _ string   rollout_params
(_	LPAREN)
      rollout_clause
(_	RPAREN)
# {% (d) => ({rollout:d[2]})%}

rollout_params -> _ param {% d => d[1] %}
				| rollout_params __ param


rollout_clause ->
				  DECLARATIONS  {% id %}
				| rollout_item  {% id %}
				| event_handler {% id %}
				| fn_def        {% id %}
				| struct_def    {% id %}
#                | mousetool     {% id %}
#                | item_group    {% id %}


#
item_group -> "group" _ string
(_	LPAREN)
         ( _ rollout_item ):*
(_	RPAREN)
{% d => ({group:d[2]})%}
# group_items ->
#			rollout_item
#			| group_items _ rollout_item

rollout_item ->
			  item_type __ varName              {% (d) => ({[d[0]]:d[2]})%}
			| item_type __ varName _ (string | varName)     {% (d) => ({[d[0]]:d[2], text:d[4][0]})%}
			| item_type __ varName ( _ param):+
			| item_type __ varName _ (string | varName) _ param_wrapper {% (d) => ({[d[0]]:d[2], text:d[4][0], params:d[6]})%}

param_wrapper -> param  {% id %}
				| param_wrapper _ param
					{% (d) => {
						var arr = d.flat(2);
						arr = filterNull(arr)
						return arr;
					} %}

item_type ->
	  "angle"        | "bitmap"        | "button"       | "checkbox"       | "checkbutton"  | "colorPicker" | "combobox"
	| "curvecontrol" | "dotnetcontrol" | "dropdownList" | "edittext"       | "groupBox"     | "hyperLink"   | "imgTag"
	| "label"        | "listbox"       | "mapbutton"    | "materialbutton" | "multilistbox" | "pickbutton"  | "popUpMenu"
	| "progressbar"  | "radiobuttons"  | "slider"       | "spinner"        | "SubRollout"   | "timer"
#===============================================================
# MAX COMMAND
#===============================================================
# MACROSCRIPT DEFINITION
macroscript_def ->
"macroscript" __ varName __ (mc_param):+
(_	LPAREN)
       mc_expr
(_	RPAREN)

mc_param -> varName _S ":" _ (string | resource | bool | array) {% (d) => ({param:d[0], value:d[4][0]}) %}

mc_expr -> #  _ null {% (d) => null %}
		     _ event_handler  {% id %}
		   | expr_seq {% id %}
#===============================================================
#STRUCTURE DEFINITION
struct_def ->
("struct" __) varName
(_	LPAREN)
		struct_members
(_	RPAREN)

 {% (d) => {
 	return {
 		type:'struct',
 		name:d[1],
		members:d[3]
 	};
 }%}

struct_members ->
			      member (comma member):*
				{% (d) => {
					var arr = d.flat(2);
					arr = filterNull(arr)
					return arr;
				} %}

#				  member 				  {% id %}
#				| struct_members comma  member #{% flatten %}

member -> decl          {% id %}
		| fn_def        {% id %}
		| event_handler {% id %}
#===============================================================
#FUNCTION DEFINITION
#function body can be a scope, or a oneliner. THIS HAS TODO WITH HOW MXS INTERPRETS BREAKS, THIS NEEDS TO BE ADDRESSED
fn_def ->
("mapped" __ ):? ("function" | "fn" ) __ varName fn_arg:* fn_param:* _ "=" fn_expr

{% (d) => {
	return {
		type: 'function',
		name:d[3],
		args:(d[4].length >= 1 ? d[4] : null),
		params:(d[5].length >= 1 ? d[5] : null),
		body:d[8]
	};
} %}

fn_expr ->  EXPR
		  | fn_return

fn_arg -> __ varName {% d => d[1] %}
fn_param -> __ param {% d => d[1] %}
#---------------------------------------------------------------
fn_return -> "return" __ _expr _
#===============================================================
# EVENT HANDLER
event_handler ->"on" __ event_args __ ("do" | "return") __ EXPR {% (d) => ({event_args:d[2], event_body:d[6]}) %}

event_args ->
			varName {% (d) => ({event_name:d[0]}) %}
			| varName __ varName {% (d) => ({event_target:d[0], event_name:d[2]}) %}
			| varName __ varName __ varName {% (d) => ({event_target:d[0], event_name:d[2], event_arg:d[4]}) %}
#===============================================================
#EXPRESSIONS
#===============================================================
# IF EXPRESSION
if_expr ->
	 	  "if" EXPR "then" EXPR 			{% d => ({if:d[1], then:d[3]}) %}
		| "if" EXPR "then" EXPR "else" EXPR {% d => ({if:d[1], then:d[3], else:d[5]}) %}
        | "if" EXPR "do" EXPR 				{% d => ({if:d[1], do:d[3]}) %}
#---------------------------------------------------------------
# CASE EXPRESSION
case_expr -> "case" (EXPR):? "of" _ LPAREN case_col RPAREN

case_col -> case_item
		  | case_col EOL case_item

case_item -> factor _S ":" EXPR {% d => ({[d[0]]:d[3]}) %}
#===============================================================
# WHILE LOOP
#---------------------------------------------------------------
while_loop -> "while" EXPR "do" loop_expr
#---------------------------------------------------------------
# DO LOOP
do_loop -> "do" EXPR "while" loop_expr
#---------------------------------------------------------------
# FOR LOOP
# for i=1 to col.count | by -1 | where condition | (do | collect)
# for i in col | where condition | (do | collect)

for_loop ->
"for" __ arr_source  ("do" | "collect") loop_expr {% d => [d[0], d[2], d[3][0], d[4]] %}

arr_source ->
              arr_var __ arr_trgt arr_cond:?           {% d => [d[0], d[2], d[3]] %}
			| arr_var __ arr_trgt arr_step arr_cond:?  {% d => [d[0], d[2], d[3], d[4]] %}
			| varName __ arr_src  arr_cond:?           {% d => [d[0], d[2], d[3]] %}

arr_var ->   varName _S "=" _ simple_expr {% d => ({[d[0]]:d[4]}) %}
arr_cond ->  "where" EXPR {% d => ({[d[0]]:d[1]}) %}
arr_step ->  "by" EXPR    {% d => ({[d[0]]:d[1]}) %}
arr_trgt ->  "to" EXPR    {% d => ({[d[0]]:d[1]}) %}
arr_src ->   "in" EXPR    {% d => ({[d[0]]:d[1]}) %}
#---------------------------------------------------------------
loop_expr -> EXPR
			| loop_continue
			| loop_exit
#---------------------------------------------------------------
loop_exit -> _ "exit" _ ("with" EXPR):?
loop_continue -> _ "continue" _
#===============================================================
# ERROR CHECK STATEMENT
try_expr -> "try" EXPR "catch" ( EXPR | void_parens)
#===============================================================
# CONTEXT EXPRESSION
context_expr -> context (_S "," _ context):* __ EXPR

context ->
			("at" | "set") __ "level" __ OPERAND
			# this will have conflicts with for loop
			| ("set"  __ ):? "in" __ OPERAND
#			| ("at" | "set") __ "time" __ time
			# this will have conflicts with for loop
			| ("in" __ | "set" __ ):? "coordsys" __ ("local" | "world" | "parent" | OPERAND)
			| ("set"  __ ):? "about" __ ("pivot" | "selection" | "coordsys" | OPERAND)
			| ("with" __ | "set" __  ):? context_keywords1 __ (logical_expr | bool)
			| ("with" __ | "set" __  ):? context_keywords2 __ def_actions


context_keywords1 -> "animate"
				  | "undo"
				  | "redraw"
				  | "quiet"
				  | "printAllElements"
				  | "MXSCallstackCaptureEnabled"
				  | "dontRepeatMessages"
				  | "macroRecorderEmitterEnabled"

context_keywords2 -> "defaultAction"

def_actions -> "#logmsg" | "#logToFile" | "#abort"
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

# EXPRESIONS END WITH LINE BREAK, CONTEXT END; OR LOWER PRECEDENTE EXPRESSION.... EXPRESSION BLOCK!!!

# EXPR ->  _ _expr _  {% (d) => d[1] %}


_expr ->
		 simple_expr {% id %} #-----
		| fn_def
		| struct_def
		#| utility_def
		#| rollout_def
		#| tool_def
		#| rcmenu_def
		| macroscript_def
		#| plugin_def
		#| max_command
#===============================================================
simple_expr ->
				OPERAND         {% id %} #OK
				| DECLARATIONS  {% id %} #OK
				| assignment    {% id %} #OK
				| fn_call       {% id %}
				| math_expr     {% id %}
				| compare_expr  {% id %}
				| logical_expr  {% id %}
				| if_expr       {% id %}
				| case_expr     {% id %}
				| while_loop    {% id %}
				| do_loop       {% id %}
				| for_loop		{% id %}
				| try_expr      {% id %}
				| context_expr  {% id %}

				#<expr_seq>

#<expr_seq> ::= ( <expr> { ( ; | <eol>) <expr> } )
#===============================================================
#DECLARATIONS
# "local" _ decl ("," _ decl _):*
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
      | varName _S "=" EXPR     							{% (d) => ( {decl:d[0], exp:d[3]} ) %}
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
#varName _S ":" _ ( OPERAND ):? {% (d) => ({param:d[0], value:d[4]}) %}
param ->
		  varName _S ":" {% (d) => ({param:d[0]}) %}
		| varName _S ":" _ OPERAND {% (d) => ({param:d[0], value:d[4]}) %}
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
	  # | path_name





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
  "about"    | "and"    | "animate"     | "as"         | "at"          | "by"     | "case"   |  "catch" | "collect" | "continue"
| "coordsys" | "do"     | "dontcollect" | "else"       | "exit"        | "fn"     | "fn"     | "for"    | "from"    | "function"
| "global"   | "if"     | "in"          | "local"      | "macroscript" | "mapped" | "max"    | "not"    | "of"      | "off"
| "ok"       | "on"     | "or"          | "parameters" | "persistent"  | "plugin" | "rcmenu" | "return" | "rollout"
| "set"      | "struct" | "then"        | "throw"      | "to"          | "tool"   | "try"    | "undo"   | "utility"
| "when"     | "where"  | "while"       | "with"
| "angle"        | "bitmap"        | "button"       | "checkbox"       | "checkbutton"  | "colorPicker" | "combobox"
| "curvecontrol" | "dotnetcontrol" | "dropdownList" | "edittext"       | "groupBox"     | "hyperLink"   | "imgTag"
| "label"        | "listbox"       | "mapbutton"    | "materialbutton" | "multilistbox" | "pickbutton"  | "popUpMenu"
| "progressbar"  | "radiobuttons"  | "slider"       | "spinner"        | "SubRollout"   | "timer"
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
name_value -> "#" alphanum {% (d) => ({nameLiteral:(d[0] + d[1])}) %}
#---------------------------------------------------------------
bool -> ("true" | "on") {% (d) => true %}
		| ("false" | "off") {% (d) => false %}
#---------------------------------------------------------------
void ->
	     "undefined"  {% (d) => ({value:d[0]}) %}
	   | "unsupplied" {% (d) => ({value:d[0]}) %}
	   | "ok"         {% (d) => ({value:d[0]}) %}
#---------------------------------------------------------------
# Time
#---------------------------------------------------------------
# Paths
#===============================================================
# TOKENS
#===============================================================
varName -> alphanum {% dropKeyword %}
#===============================================================
#Resources
resource -> "~" _string "~" {% (d) => ({'resourceID':d[1]}) %}
#Strings
string -> "\"" _string "\"" {% (d) => ({'string':d[1]}) %}
		| "@" string        {% (d) => ({'literal':d[1]}) %}

_string ->
	null {% (d) => "" %}
	| _string _stringchar {% (d) => d[0] + d[1] %}

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

comma -> "," _ {% (d) => null %}
#===============================================================
anchar -> [A-Za-z_0-9]
digit -> [0-9]
wsnlchar -> [ \t\v\f\r\n] {% id %}
wschar -> [ \t\v\f]       {% id %}
newline -> [\r\n]         {% id %}
#===============================================================
#SYNTAX
EOL -> _S ( newline | (";"):+) _ {% (d) => null %}

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
	"when"     , "where"  , "while"       , "with"       , "unsupplied"  , "undefined",
	"true"     , "false",
	"angle",        "bitmap",        "button",       "checkbox",       "checkbutton",    "colorPicker", "combobox",
    "curvecontrol", "dotnetcontrol", "dropdownList", "edittext",       "groupBox",       "hyperLink",   "imgTag",
    "label",        "listbox",       "mapbutton",    "materialbutton", "multilistbox",   "pickbutton",  "popUpMenu",
    "progressbar",  "radiobuttons",  "slider",       "spinner",        "SubRollout",     "timer"

	]

	const dropKeyword = (d, l, r) => (keywords.includes(d[0]) ? r : d[0]);

	const flatten = arr => [].concat(...arr);

	const filterNull = arr => arr.filter(e => e != null );

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
		// This doesn't work well, map doesn't change the array dimension.... I need to delete the null items. better use filter or something
		var arr = d.map( e => {

			//e.filter(e => e != null );

			if (Array.isArray(e)) {
				return filterNull(e);
			} else {
				return e;
			};

		});

		return arr;
	};

%}