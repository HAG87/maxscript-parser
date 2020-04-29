# ( <expr> { (; | <eol>) <expr> } )
#
#Its hard to say where or where not some block can be defined. The grammar is too ambiguous
# more work on EXPRESSIONS CONTEXT is Needed >>> Should review the HELP
#
#===============================================================
#TODO: ITERATOR
SCRIPT -> _ _EXPR_ _ {% d => d[1] %}

#===============================================================
# EXPRESIONS END WITH LINE BREAK, CONTEXT END; OR LOWER PRECEDENTE EXPRESSION.... EXPRESSION BLOCK!!!
# check what to move--- and how to simplify EXPR


_EXPR_ -> __EXPR__ {% id %} | _EXPR_ EOL __EXPR__ {% d => [].concat(d[0], d[2]) %}

__EXPR__ -> EXPR  {% id %} | _EXPR {% id %}

#_EXPR ->
#		 simple_expr {% id %}
#		#| struct_def {% id %}
#		#| rollout_def {% id %}
#		#| mousetool_def {% id %}
#		#| rcmenu_def {% id %}
#		| utility_def {% id %}
#		| macroscript_def {% id %}
#		| plugin_def {% id %}


_EXPR ->  utility_def {% id %}
		| macroscript_def {% id %}
		| plugin_def {% id %}

		_E -> EXPR | _E EOL EXPR
#---------------------------------------------------------------
 EXPR ->  simple_expr {% id %}
#===============================================================
expr_block -> LPAREN expr_seq RPAREN {% d => d[1] %}

expr_seq -> simple_expr
			| expr_seq EOL simple_expr {% d => [].concat(d[0], d[2]) %}

simple_expr -> build_blocks {% id %}
			# | expr_block #{% id %}

build_blocks ->
				OPERAND         {% id %} #OK
				| DECLARATIONS  {% id %} #OK
				| assignment    {% id %} #OK
				| fn_call       {% id %} #OK
				| math_expr     {% id %} #OK
				| conversion    {% id %} #OK
				| compare_expr  {% id %} #OK
				| logical_expr  {% id %} #OK
				| if_expr       {% id %} #OK
				| for_loop		{% id %} #OK
			    #| loop_exit     {% id %}
			    #| loop_continue {% id %}
				| case_expr     {% id %} #OK
				| while_loop    {% id %} #OK
				| do_loop       {% id %} #OK
				| try_expr      {% id %} #OK
				#| try_throw     {% id %}
				| context_expr  {% id %}
				| fn_def        {% id %}
				| fn_return     {% id %}
				# DEFINITIONS THAT SHOULDNT BE HERE BUT I DONT KNOW WHAT TO DO WITH THEM...
				| struct_def {% id %}
				| rollout_def {% id %}
				| mousetool_def {% id %}
				| rcmenu_def {% id %}
#| expr_block
#---------------------------------------------------------------
# this aren't context free expressions, are included here in order to be part of an expression for now, but it needs a better workaround
# this can be replaced as a fn_call with a keyword
loop_exit -> "exit" (__ "with" __ OPERAND):?
# replace this with a keyword, it will be recognized as a identifier
loop_continue -> "continue"
#---------------------------------------------------------------
fn_return -> "return" _S OPERAND
#---------------------------------------------------------------
try_throw -> "throw" _S OPERAND
#===============================================================
# WARNING: OPERAND HAS CIRCULAR RECURSION
OPERAND ->	  factor		{% id %}
			| property		{% id %}
			| index			{% id %}
			| expr_block
#===============================================================
#DEFINITIONS
#===============================================================
#STRUCTURE DEFINITION
#---------------------------------------------------------------
struct_def ->
("struct" __ ) varName _
LPAREN
		struct_members
RPAREN
 {% d => ({
 	struct: {
 		name:d[1],
		members:d[4]
 	}
 })%}

# iterate...
struct_members -> member {% id %}
| struct_members _ "," _ member {% d => [].concat(d[0], d[4]) %}
#			      member (comma member):*
#				{% d => {
#					var arr = d.flat(2);
#					arr = filterNull(arr)
#					return arr;
#				} %}
#---------------------------------------------------------------
member -> decl          {% id %}
		| fn_def        {% id %}
		| event_handler {% id %}
#===============================================================
# EVENT HANDLER
# check for "the other" event handlers...
#---------------------------------------------------------------
event_handler ->
"on" __ event_args __ ("do" | "return") __ EXPR
{% d => ({
	event:{
		args:d[2],
		expr:d[6]
	}
}) %}

event_args ->
			varName {% d => ({name:d[0]}) %}
			| varName __ varName {% d => ({target:d[0], name:d[2]}) %}
			| varName __ varName __ varName {% d => ({target:d[0], name:d[2], args:d[4]}) %}
#===============================================================
# PLUGIN DEFINITION - OK
#---------------------------------------------------------------
plugin_def ->
"plugin" __ varName __ varName __ param_wrapper _
LPAREN
   plugin_clauses:?
RPAREN
{% d => ({
	plugin:{
		superclass:d[2],
		class:d[4],
		params:d[6],
		body:d[9]
	}
})%}
#---------------------------------------------------------------
plugin_clauses -> plugin_clause {% id %}
				| plugin_clauses EOL plugin_clause {% d => [].concat(d[0], d[2]) %}

plugin_clause ->  DECLARATIONS  {% id %}
                | fn_def        {% id %}
                | struct_def    {% id %}
                | mousetool_def {% id %}
                | rollout_def   {% id %}
                | plugin_parameter {% id %}
                | event_handler    {% id %}
#---------------------------------------------------------------
plugin_parameter -> "parameters" __ varName __ param_wrapper _
LPAREN
 	   param_clauses:?
RPAREN
{% d => ({plugin_params:{name:d[2], params:d[4], body:d[7]}})%}
param_clauses -> param_clause {% id %}
				| param_clauses __ param_clause {% d => [].concat(d[0], d[2]) %}

param_clause -> param_defs      {% id %}
                | event_handler {% id %}

param_defs -> varName __ param_wrapper
{% d => ({plugin_param:{name:d[0], params:d[2]}})%}
#===============================================================
# MACROSCRIPT DEFINITION
#---------------------------------------------------------------
macroscript_def ->
"macroscript" __ varName __ mc_params _
LPAREN
       mc_clauses:?
RPAREN
{% d => ({
	macroscript:{
		name:d[2],
		params:d[4],
		body:d[7]
	}
})%}
#---------------------------------------------------------------
mc_params -> mc_param {% id %} | mc_params __ mc_param {% d => [].concat(d[0], d[2]) %}
mc_param -> varName _S ":" _ (string | resource | bool | array)
{% d => ({
	param:d[0],
	value:d[4][0]
})%}
#---------------------------------------------------------------
mc_clauses -> mc_expr {% id %} | mc_clauses EOL mc_expr {% d => [].concat(d[0], d[2]) %}
mc_expr -> EXPR {% id %}
		  | event_handler  {% id %}
#===============================================================
# ROLLOUT DEFINITION - OK
#---------------------------------------------------------------
rollout_def ->
"rollout" __ varName _ string (__ param_wrapper ):? _
LPAREN
	  rollout_clauses
RPAREN
{% d => ({
	rollout:{
		name:d[2],
		title:d[4],
		params:(d[5] != null ? d[5][1] : null),
		body:d[8]
	}
})%}
#---------------------------------------------------------------
rollout_clauses -> rollout_clause {% id %}
				| rollout_clauses EOL rollout_clause {% d => [].concat(d[0], d[2]) %}
rollout_clause ->
				EXPR            {% id %}
			   # DECLARATIONS  {% id %}
				| rollout_item  {% id %}
				| event_handler {% id %}
			   #| fn_def        {% id %}
				| struct_def    {% id %}
                | mousetool_def {% id %}
                | item_group    {% id %}
#---------------------------------------------------------------
item_group -> "group" __ string _
LPAREN
   group_items
RPAREN
{% d => ({
	group:{
		name:d[2],
		body:d[5]
	}
 })%}
group_items -> rollout_item {% id %}
			  | group_items EOL rollout_item {% d => [].concat(d[0], d[2]) %}
#---------------------------------------------------------------
rollout_item ->
	item_type __ varName
	{% d => ({
		control:{
			type:d[0],
			name:d[2]
		}
	})%}
	| item_type __ varName ( _ string | __ varName)
	{% d => ({
		control:{
			type:d[0],
			name:d[2],
			text:(d[3])
		}
	})%}
	| item_type __ varName  __ param_wrapper
	{% d => ({
		control:{
			type:d[0],
			name:d[2],
			params:d[4]
		}
	})%}
	| item_type __ varName ( _ string | __ varName ) __ param_wrapper
	{% d => ({
		control:{
			type:d[0],
			name:d[2],
			text:(d[3]),
			params:d[5]
		}
	})%}
#---------------------------------------------------------------
param_wrapper -> param {% id %}
				| param_wrapper __ param {% d => [].concat(d[0], d[2]) %}
#---------------------------------------------------------------
# change with kw-ui
item_type ->
	  "angle"        | "bitmap"        | "button"       | "checkbox"       | "checkbutton"  | "colorPicker" | "combobox"
	| "curvecontrol" | "dotnetcontrol" | "dropdownList" | "edittext"       | "groupBox"     | "hyperLink"   | "imgTag"
	| "label"        | "listbox"       | "mapbutton"    | "materialbutton" | "multilistbox" | "pickbutton"  | "popUpMenu"
	| "progressbar"  | "radiobuttons"  | "slider"       | "spinner"        | "SubRollout"   | "timer"
#---------------------------------------------------------------
# TOOL - MOUSE TOOL DEFINITION - OK
#---------------------------------------------------------------
mousetool_def ->
"tool" __ varName _ string _ param_wrapper _
LPAREN
        tool_clauses
RPAREN
{% d => ({
	tool:{
		name:d[2],
		title:d[4],
		params:d[5],
		body:(d[9])
	}
})%}

tool_clauses -> tool_clause {% id %}
				| tool_clauses EOL tool_clause {% d => [].concat(d[0], d[2]) %}

tool_clause ->  DECLARATIONS  {% id %}
              | fn_def        {% id %}
              | struct_def    {% id %}
              | event_handler {% id %}
#---------------------------------------------------------------
# RC MENU DEFINITION - OK
#---------------------------------------------------------------
rcmenu_def -> "rcmenu" __ varName _
LPAREN
        rcmenu_clauses
RPAREN
{% d => ({
	rcmenu:{
		name:d[2],
		body:d[5]
	}
})%}
#---------------------------------------------------------------
rcmenu_clauses -> rcmenu_clause {% id %}
       			| rcmenu_clauses EOL rcmenu_clause {% d => [].concat(d[0], d[2]) %}

rcmenu_clause ->  DECLARATIONS  {% id %}
    	    	| fn_def        {% id %}
				| struct_def    {% id %}
                | event_handler {% id %}
				| rcmenu_submenu {% id %}
				| rcmenu_sep     {% id %}
				| rcmenu_item   {% id %}
#---------------------------------------------------------------
#TODO: FINISH PARAMS
rcmenu_submenu -> "subMenu" _ string ( _ "filter:" _ fn_def ):? _
LPAREN
	rcmenu_clauses
RPAREN
{% d => ({
	rcsubmenu:{
		label:d[2],
		filter:d[3],
		body:d[6]
	}
})%}
#---------------------------------------------------------------
rcmenu_sep -> "separator" __ varName ( _ "filter:" _ fn_def):?
{% d => ({
	separator:{
		label:d[2],
		filter:d[3],
	}
})%}
rcmenu_item -> "menuItem" __ varName _ string ( _ param_wrapper ):?
{% d => ({
	menuitem:{
		name:d[2],
		label:d[4],
		params:d[5],
	}
})%}
#---------------------------------------------------------------
# UTILITY DEFINITION
#TODO: UNTESTED
#---------------------------------------------------------------
utility_def ->
"utility" __ varName _ string (_ param_wrapper ):? _
LPAREN
       utility_clauses
RPAREN
{% d => ({
	utility:{
		name:d[2],
		title:d[4],
		params:(d[5] != null ? d[5][1] : null),
		body:(d[8])
	}
})%}
utility_clauses -> utility_clause {% id %}
				| utility_clauses EOL utility_clause {% d => [].concat(d[0], d[2]) %}

utility_clause ->
			  rollout_clause  {% id %}
			| rollout_def     {% id %}
#---------------------------------------------------------------

#===============================================================
#FUNCTION DEFINITION - OK
#TODO FIX OUTPUT
#---------------------------------------------------------------
fn_def ->
("mapped" __ ):? ("function" | "fn" ) __ varName fn_arg:* fn_param:* _ "=" _ fn_expr
{% d => ({
	fn:{
		name:d[3],
		args:(d[4].length >= 1 ? d[4] : null),
		params:(d[5].length >= 1 ? d[5] : null),
		body:d[9]
	}
	})%}
fn_arg -> __ varName {% d => d[1] %}
fn_param -> __ param {% d => d[1] %}
#---------------------------------------------------------------
fn_expr ->  EXPR {% id %}
#===============================================================
#EXPRESSIONS
#===============================================================
# IF EXPRESSION - OK
#---------------------------------------------------------------
if_expr ->
     "if" __ EXPR __ ("do"|"then") __ EXPR
	 {% d => ({
		if:{
			condition:d[2],
			expr:d[6]
		}
	}) %}
	| "if" __ EXPR __ "then" __ EXPR __ "else" __ EXPR
	{% d => ({
		if:{
			condition:d[2],
			expr:d[6],
			else:d[10]
		}
	})%}
#---------------------------------------------------------------
# CASE EXPRESION - OK
#---------------------------------------------------------------
case_expr ->
			"case" __ (OPERAND):? __ "of" _
			LPAREN
				case_col
			RPAREN
{% d =>({
	case:{
		expr:(d[2] != null ? d[2][0] : null),
		cases:d[7]
	}
})%}
case_col -> case_item {% id %}
		  | case_col EOL case_item {% d => [].concat(d[0], d[2]) %}

case_item -> factor _S ":" _ EXPR
{% d => ({
	state:d[0],
	expr:d[4]
}) %}
#---------------------------------------------------------------
# FOR LOOP - OK
#---------------------------------------------------------------
for_loop ->
"for" __ arr_source __ ("do" | "collect") __ loop_expr #{% d => [d[0], d[2], d[3][0], d[4]] %}
{% d => ({
	for:{
		sequence:d[2],
		expr:d[6]
	}
})%}
arr_source ->
	varName _S "=" _S OPERAND _S "to" _S OPERAND
	( _S "by" _S OPERAND):?
	( _S "while" _S OPERAND):?
	( _S "where" _S OPERAND):?
{% d => ({
		index:d[0],
		value:d[4],
		to:d[8],
		by:(d[9] != null ? d[9][3] : null),
		while:(d[10] != null ? d[10][3] : null),
		where:(d[11] != null ? d[11][3] : null)
	})
%}
| varName _S "in" _S OPERAND
	( _S "while" _S OPERAND):?
	( _S "where" _S OPERAND):?
{% d => ({
		index:d[0],
		value:d[4],
		while:(d[5] != null ? d[5][3] : null),
		where:(d[6] != null ? d[6][3] : null)
	})
%}
#---------------------------------------------------------------
loop_expr -> EXPR {% id %}
#---------------------------------------------------------------
# WHILE LOOP - OK
#---------------------------------------------------------------
while_loop -> "while" __ EXPR __ "do" __ EXPR
{% d => ({
	while:{
		expr:d[2],
		do:d[6]
	}
})%}
#---------------------------------------------------------------
# DO LOOP - OK
#---------------------------------------------------------------
do_loop -> "do" __ EXPR __ "while" __ EXPR
{% d => ({
	do:{
		expr:d[2],
		while:d[6]
	}
})%}
#---------------------------------------------------------------
# ERROR CHECK STATEMENT - OK
#---------------------------------------------------------------
try_expr -> "try" __ EXPR __ "catch" __ ( EXPR | void_parens )
{% d =>({
	try:{
		expr:d[2],
		catch:d[6]
	}
})%}
#---------------------------------------------------------------
# CONTEXT EXPRESSION - OK
#---------------------------------------------------------------
context_expr -> context_seq __ EXPR
{% d =>({
context:{
	con:(d[0]),
	expr:d[2]
}
})%}
context_seq -> context {% id %}
				| context_seq (_S "," _) context {% d => [].concat(d[0], d[2]) %}
# TODO: clean up the output
context ->
			("at" | "set") __ "level" __ OPERAND
			| ("set"  __ ):? "in" __ OPERAND
			| ("at" | "set") __ "time" __ time
			| (("in"|"set") __ ):? "coordsys" __ ("local" | OPERAND)
			| ("set"  __ ):? "about" __ ("coordsys" | OPERAND)
			| (("with"|"set") __ ):? context_keywords1 __ (logical_expr | bool)
			| (("with"|"set") __ ):? context_keywords2 __ def_actions

# replace with keywords
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
# FUNCTION CALL - OK
#---------------------------------------------------------------
fn_call -> call void_parens			{% d => ({call:d[0]}) %}
         | call (__ parameter):+
{% d => ({
	call:d[0],
	params:(Array.from(d[1], x => x[1]))
})%}
call -> varName | property

parameter -> OPERAND  {% id %}
            | param   {% id %}
#===============================================================
#DECLARATIONS - OK
# "local" _ decl ("," _ decl _):*
#---------------------------------------------------------------
DECLARATIONS -> typed_var_decl
				| expl_gl

expl_gl -> "::" decl 										{% d => ({decl:{type:'global-typed', id:d[1].decl.id}}) %}

typed_var_decl ->
				"local" __ var_decl 							{% d => ({decl:{type:'local', id:d[2].decl.id}}) %}
				| ("persistent" __ ):? "global" __ var_decl	{% d => ({decl:{type:'global', id:d[3].decl.id}}) %}

var_decl ->  decl											{% id %}
		   | var_decl _S "," _ decl 						{% d => ([].concat(d[0], d[4])) %}

decl -> varName			        							{% d => ( {decl:d[0]} ) %}
      | varName _S "=" _ EXPR     							{% d => ( {decl:d[0], exp:d[4]} ) %}
#===============================================================
#ASSIGNMENT - OK
#---------------------------------------------------------------
assignment -> destination _ assignOp  _ EXPR
{% d => ({
	assign:{
		dest:d[0],
		operator:d[2],
		value:d[4]
	}
}) %}

destination  ->
      varName  {% id %}
    | property {% id %}
    | index    {% id %}

assignOp -> ("="|"+="|"-="|"*="|"/=") {% id %}
#===============================================================
# PARAMS - OK
#---------------------------------------------------------------
param -> varName _S ":" ( _ OPERAND ):?
{% d => ({
	param:d[0],
	value:(d[3] != null ? d[3][1] : null)
}) %}
#param ->
#		  varName _S ":" {% d => ({param:d[0]}) %}
#		| varName _S ":" _ OPERAND {% d => ({param:d[0], value:d[4]}) %}
#===============================================================
# PROPERTIES - OK
 #---------------------------------------------------------------
property -> OPERAND "." varName {% d => ({property:{parent:d[0], name:d[2]} }) %}
#===============================================================
# INDEX - OK
#---------------------------------------------------------------
index -> OPERAND "[" _ OPERAND _ "]" {% d => ({access:{parent:d[0], index:d[3]}})%}
#===============================================================
#CONVERSION - OK
#---------------------------------------------------------------
conversion -> OPERAND _S_ "as" _S_ class
{%
d => ({
	convert:{
		value:d[0],
		class:d[4]
	}
})
%}
#===============================================================
# MATH EXPRESSIONS - OK
#---------------------------------------------------------------
math_expr -> sum
{%
	(d, l, reject) => Array.isArray(d[0]) && d[0].length > 1 ? d[0] : reject
%}
sum -> sum _ ("+"|"-") __ product      {% d => [(d[0][0]), (d[2][0]), d[4] ]%}
	 | product

product -> product _ ("*"|"/") _ exp  {% d => [d[0], (d[2][0]), d[4] ]%}
		 | exp                        {% id %}

# this is right associative!
exp -> math_operand _ "^" _ exp  {% d => [d[0], d[2], d[4] ]%}
	| math_operand               {% id %}
#---------------------------------------------------------------
math_operand -> OPERAND   {% id %}
class -> varName          {% id %}
#===============================================================
# COMPARE EXPRESION - OK
#---------------------------------------------------------------
compare_expr -> compare_op _ compareSym _ compare_op
{%
d => ({
	comparision:{
		left:d[0],
		operator:d[2]
		,right:d[4]
	}
})
%}
compareSym -> ("=="|"!="|">" |"<" |">="|"<=") {% id %}
compare_op -> OPERAND {% id %}
#===============================================================
# LOGIC EXPRESSIONS
#---------------------------------------------------------------
logical_expr ->
 logical_operand __ ("or" | "and") __ logical_operand
{% d => ({
	logic:{
			left:d[0],
			operator:d[2][0],
			right:d[4]
	}
})
%}
| logical_expr __ ("or" | "and") __ logical_operand
{% d => ({
	logic:{
			left:d[0],
			operator:d[2][0],
			right:d[4]
	}
})
%}
#---------------------------------------------------------------
logical_operand -> OPERAND      {% id %}
				| "not" __ OPERAND
				{% d => ({not:d[2]}) %}
#===============================================================
#FACTOR - OK
#---------------------------------------------------------------
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
	    | path_name

# IMPLEMENT THIS
#-  <expr> -- unary minus
#? -- last Listener result
#===============================================================
# TYPES
#===============================================================
#ARRAY - OK
#---------------------------------------------------------------
array -> "#(" _ array_expr _ ")" {%d =>({array:d[2]})%}

array_expr -> OPERAND {% id %}
 			 |array_expr _S "," _ OPERAND {% d => ([].concat(d[0], d[4])) %}
#---------------------------------------------------------------
#BIT ARRAY - TODO
bitarray -> "#{" _ "}"				{% d => ({ bitarray:("#{" + d[1] + "}") }) %}
		  | "#{" bitarray_inner "}" {% d => ({ bitarray:("#{" + d[1] + "}") }) %}

bitarray_inner -> (bitarray_expr | _S "," _ bitarray_expr):+ {% d => merge(d[0]) %}

bitarray_expr -> _posint {% id %}
| _posint  ".."  _posint {% d => d.join('') %}
#===============================================================
box2 -> "[" OPERAND "," OPERAND "," OPERAND "," OPERAND "]"
#---------------------------------------------------------------
path_name -> "$" alphanum {% d => d.join('') %}
#---------------------------------------------------------------
point3 -> "[" OPERAND "," OPERAND "," OPERAND "]"
{% d => (	{type: 'Point3', x:d[1], y:d[3], z:d[5]}) %}
#---------------------------------------------------------------
point2 -> "[" OPERAND "," OPERAND "]"
{% d => (	{type: 'Point2', x:d[1], y:d[3]}) %}

#===============================================================
# TOKENS
#===============================================================
# IDENTIFIERS- OK
varName -> iden {% d =>({id:d[0]}) %}
		  | "&" iden {% d =>({id:d[1]}) %}
iden -> alphanum {% dropKeyword %}
#===============================================================
#Resources
resource -> "~" _string "~" {% d => ({'resourceID':d[1]}) %}
#Strings
string -> "\"" _string "\"" {% d => ({'string':d[1]}) %}
		| "@" string        {% d => ({'literal':d[1]}) %}

_string ->
	null {% d => "" %}
	| _string _stringchar {% d => d[0] + d[1] %}

_stringchar ->
	[^\\"] {% id %}
	| "\\" [^] {% function(d) {return JSON.parse("\"" + d[0] + d[1] + "\""); } %}
#---------------------------------------------------------------
# Numbers
#---------------------------------------------------------------
number -> _number {% d => ({number:d[0]}) %}
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
name_value -> "#" alphanum {% d => ({nameLiteral:(d[0] + d[1])}) %}
#---------------------------------------------------------------
# Time
#---------------------------------------------------------------
#MISSING!!!!
#---------------------------------------------------------------
# Bool
#---------------------------------------------------------------
bool -> ("true" | "on") {% d => true %}
		| ("false" | "off") {% d => false %}
#---------------------------------------------------------------
void ->
	     "undefined"  {% d => ({value:d[0]}) %}
	   | "unsupplied" {% d => ({value:d[0]}) %}
	   | "ok"         {% d => ({value:d[0]}) %}
#---------------------------------------------------------------
# Time
#INCOMPLETE
#---------------------------------------------------------------
#BASIC TOKENS
alphanum -> _alphanum {% testAlphanum %}
_alphanum -> anchar:+ {% merge %}
#===============================================================
#PARENS WITH WHITESPACE
LPAREN ->  "(" _  {% d => null %}
RPAREN ->  _ ")"  {% d => null %}
#===============================================================
void_parens -> "(" _ ")"

comma -> "," _ {% d => null %}


#===============================================================
#SYNTAX
#===============================================================
#TODO: EOL line continuations
# zero or more whitespace, with mandatory NL or statement separator

# EXCLUDE SEPARATOR FROM EOL
EOL -> _S (newline|";"):+ _S #_S (newline | ";"):+ _ {% d => null %}
#===============================================================

#Whitespace or not alphanum for the next chracter...
#Whitespace line continuations
# Whitespace
blank -> (_ newline):+ {% d => null %}

# one or more whitespace
_S_ -> (wschar | _CONT_):+     {% d => null %}
# zero or any withespace
_S -> (wschar | _CONT_):*      {% d => null %}
# USE THIS FOR NON MANDATORY WHITESPACE
# zero or any withespace with NL
_ -> wsnlchar:*     {% d => null %}
# USE THIS FOR MANDATORY WHITESPACE
# one or more whitespace with NL
# THIS COULD BE WRONG
__ -> ( wsnlchar | _CONT_ ):+    {% d => null %}
# LINE CONTINUATOR
_CONT_ -> _S "\\" _S newline {% d => null %}
# WHITESPACES THAT CAN BRE DROPPED IN STATEMENT WHEN:
#alpha / nonalpha
#nonalpha / alpha
#nonalpha / nonalpha
#===============================================================
anchar -> [A-Za-z_0-9]
digit -> [0-9]
wsnlchar -> [ \t\v\f\r\n] {% id %}
wschar -> [ \t\v\f]       {% id %}
newline -> [\n\r]         {% id %}
#===============================================================
@{%

	var keywords = [
	"about"    , "and"    , "animate"     , "as"         , "at"          , "by"     , "case"   ,  "catch" , "collect" , "continue" ,
	"coordsys" , "do"     , "dontcollect" , "else"       , "exit"        , "fn"     , "fn"     , "for"    , "from"    , "function" ,
	"global"   , "if"     , "in"          , "local"      , "macroscript" , "mapped" , "max"    , "not"    , "of"      , "off"      ,
	"ok"       , "on"     , "or"          , "parameters" , "persistent"  , "plugin" , "rcmenu" , "return" , "rollout" ,
	"set"      , "struct" , "then"        , "throw"      , "to"          , "tool"   , "try"    , "undo"   , "utility" ,
	"when"     , "where"  , "while"       , "with"       , "unsupplied"  , "undefined",
	"true"     , "false"  ,
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