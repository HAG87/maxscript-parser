# this has problems with iterations
# parens are really poor and bad implemented
# {% d => ({})%}
#---------------------------------------------------------------
Main -> _ _EXPR _ {% d => d[1] %}
#---------------------------------------------------------------
_EXPR ->
  _EXPR EOL expr {% d => ([].concat(d[0], d[2])) %}
| expr {% id %}

#---------------------------------------------------------------
expr ->
  simple_expr   {% id %}
| variable_decl {% id %}
| assignment    {% id %}
| if_expr       {% id %}
| while_loop    {% id %}
| do_loop       {% id %}
| for_loop      {% id %}
| loop_exit     {% id %}
| case_expr     {% id %}
| struct_def    {% id %}
| try_expr      {% id %}
| function_def    {% id %}
| function_return {% id %}
| context_expr
| set_context
#| max_command
| utility_def
| rollout_def
| tool_def
| rcmenu_def
| macroscript_def
| plugin_def
#| expr_seq
#===============================================================
EOL ->  _ ( newline | ";" ) _ {% d => null %}
#===============================================================
#RECURSION!
expr_seq ->
LPAREN
    _expr_seq
RPAREN
{% d => d[1] %}

_expr_seq ->  expr | _expr_seq EOL expr {% d => [].concat(d[0], d[2]) %}

#---------------------------------------------------------------
simple_expr ->
operand        {% id %}
| math_expr    {% id %}
| compare_expr {% id %}
| logical_expr {% id %}
| fn_call      {% id %}
#| expr_seq #RECURSION!
#===============================================================
# MACROSCRIPT --- OK ?
macroscript_def ->
("macroscript" __) var_name  ( _ macro_script_param):* _
LPAREN
    # macro_script_clauses:*
	macro_script_body:?
RPAREN
{% d => ({
	'macroscript':{
		'name':d[1],
		'params':d[2],
		'body':d[5]
	}
})%}

macro_script_param ->
var_name ( _ ":" _) operand
{% d => ({...d[1], 'value':d[3]})%}

macro_script_body ->
  macro_script_clauses {% id %}
| macro_script_body EOL macro_script_clauses {% d => [].concat(d[0], d[2]) %}

macro_script_clauses ->
  expr {% id %}
| event_handler {% id %}
#expr_seq
#---------------------------------------------------------------
# MATH EXPRESION needs to drop operand results..
math_expr ->
math_operand _ mathSym _ math_operand {% d => ({'expr':d[2][0], 'operand_A':d[0], 'operand_B':d[4]})%}
| math_expr _ mathSym _ math_operand  {% d => ({'expr':d[2][0], 'operand_A':d[0], 'operand_B':d[4]})%}
| math_operand __ "as" __ var_name    {% d => ({'expr':d[2][0], 'operand_A':d[0], 'operand_B':d[4]})%}
| math_expr __ "as" __ var_name    {% d => ({'expr':d[2], 'operand_A':d[0], 'operand_B':d[4]})%}
#	math_expr -> sum
#	#{% (d, l, reject) => (
#	#	Array.isArray(d[0]) && d[0].length > 1 ? d[0] : reject
#	#)%}
#	sum -> sum _ ("+"|"-") _ product    {% d => ({'expr':d[2][0], 'operand_A':d[0], 'operand_B':d[4]})%}
#		 | product {% id %}
#
#	product -> product _ ("*"|"/") _ exp  {% d => ({'expr':d[2][0], 'operand_A':d[0], 'operand_B':d[4]})%}
#			 | exp                        {% id %}
#
#	# this is right associative!
#	exp -> math_operand _ "^" _ exp  {% d => ({'expr':d[2][0], 'operand_A':d[0], 'operand_B':d[4]})%}
#		| math_operand               {% id %}

#	math_expr ->
#	  math_operand _ "-" _ math_operand
#	| math_operand _ "+" _ math_operand
#	| math_operand _ "/" _ math_operand
#	| math_operand _ "*" _ math_operand
#	| math_operand _ "^" _ math_operand
#	| math_operand __ "as" __ var_name

# fix this with the old method
math_operand ->
operand   {% id %}
| fn_call {% id %}
#| math_expr #recursion!

mathSym -> ("+"|"-"|"*"|"/"|"^") {% id %}
#---------------------------------------------------------------
# DEFINITIONS
# RC MENU DEFINITION - OK
#---------------------------------------------------------------
rcmenu_def -> ("rcmenu" __) var_name _
LPAREN
        rcmenu_clauses
RPAREN
{% d => ({
	'rcmenu':{
		'name':d[1],
		'body':d[4]
	}
})%}
#---------------------------------------------------------------
rcmenu_clauses -> rcmenu_clause {% id %}
       			| rcmenu_clauses EOL rcmenu_clause {% d => [].concat(d[0], d[2]) %}

rcmenu_clause ->  variable_decl  {% id %}
    	    	| function_def  {% id %}
				| struct_def    {% id %}
                | event_handler {% id %}
				| rcmenu_submenu {% id %}
				| rcmenu_sep     {% id %}
				| rcmenu_item   {% id %}
#---------------------------------------------------------------
#TODO: FINISH PARAMS
rcmenu_submenu -> ("submenu" _) string (_ "filter:" _ function_def):? _
LPAREN
	rcmenu_clauses
RPAREN
{% d => ({
	'rcsubmenu':{
		'label':d[1],
		'filter':d[2],
		'body':d[5]
	}
})%}
#---------------------------------------------------------------
rcmenu_sep -> ("separator" __) var_name (_ "filter:" _ function_def):?
{% d => ({
	'separator':{
		'label':d[1],
		'filter':d[2],
	}
})%}
rcmenu_item -> ("menuitem" __) var_name _ string (_ param_wrapper):?
{% d => ({
	'menuitem':{
		'name':d[1],
		'label':d[3],
		'params':d[4],
	}
})%}
#---------------------------------------------------------------
# PLUGIN DEFINITION
plugin_def ->
("plugin" __) var_name __ var_name  (__ param_wrapper):? _
LPAREN
   plugin_clauses:?
RPAREN
{% d => ({
	plugin:{
		'superclass':d[1],
		'class':d[2],
		'params':(d[4] != null ? d[4][1] : null),
		'body':d[7]
	}
})%}

plugin_clauses -> plugin_clause {% id %}
				| plugin_clauses EOL plugin_clause {% d => [].concat(d[0], d[2]) %}

plugin_clause ->
  variable_decl  {% id %}
| function_def   {% id %}
| struct_def     {% id %}
| plugin_parameter     {% id %}
| tool_def       {% id %}
| rollout_def    {% id %}
| event_handler  {% id %}
#---------------------------------------------------------------
plugin_parameter ->
("parameters" __) var_name (__ param_wrapper):? _
LPAREN
 	   param_clauses:?
RPAREN
{% d => ({
	'plugin_params':{
		'name':d[1],
		'params':(d[2] != null ? d[2][1] : null),
		'body':d[5]
	}
})%}

param_clauses -> param_clause {% id %}
				| param_clauses __ param_clause {% d => [].concat(d[0], d[2]) %}

param_clause -> param_defs      {% id %}
                | event_handler {% id %}

param_defs -> var_name (__ param_wrapper):?
{% d => ({
	'plugin_param':{
		'name':d[0],
		'params':(d[1] != null ? d[1][1] : null)
	}
})%}
#---------------------------------------------------------------
# TOOL - MOUSE TOOL DEFINITION - OK
#---------------------------------------------------------------
tool_def ->
("tool" __) var_name (_ param_wrapper):? _
LPAREN
        tool_clauses:?
RPAREN
{% d => ({
	'tool':{
		'name':d[1],
		'params':(d[2] != null ? d[2][1] : null),
		'body':d[5]
	}
})%}

tool_clauses -> tool_clause {% id %}
				| tool_clauses EOL tool_clause {% d => [].concat(d[0], d[2]) %}

tool_clause ->
  variable_decl {% id %}
| function_def  {% id %}
| struct_def    {% id %}
| event_handler {% id %}
#---------------------------------------------------------------
# UTILITY DEFINITION -- OK
utility_def ->
("utility" __) var_name _ string (_ param_wrapper):? _
LPAREN
	  utility_clauses:?
RPAREN
{% d => ({
	'utility':{
		'name':d[1],
		'title':d[3],
		'params':(d[4] != null ? d[4][1] : null),
		'body':d[7]
	}
})%}
utility_clauses -> utility_clause {% id %}
				| utility_clauses EOL utility_clause {% d => [].concat(d[0], d[2]) %}

utility_clause ->
			  rollout_clause  {% id %}
			| rollout_def     {% id %}
#---------------------------------------------------------------
# ROLLOUT DEFINITION --- OK
rollout_def ->
("rollout" __) var_name _ string (_ param_wrapper):? _
LPAREN
	  rollout_clauses:?
RPAREN
{% d => ({
	'rollout':{
		'name':d[1],
		'title':d[3],
		'params':(d[4] != null ? d[4][1] : null),
		'body':d[7]
	}
})%}
#---------------------------------------------------------------
rollout_clauses -> rollout_clause {% id %}
				| rollout_clauses EOL rollout_clause {% d => [].concat(d[0], d[2]) %}
rollout_clause ->
  variable_decl {% id %}
| function_def  {% id %}
| struct_def    {% id %}
| item_group    {% id %}
| rollout_item  {% id %}
| event_handler {% id %}
| tool_def      {% id %}
#---------------------------------------------------------------
item_group -> ("group" __) string _
LPAREN
   group_items
RPAREN
{% d => ({
	'group':{
		'name':d[1],
		'body':d[4]
	}
 })%}
group_items -> rollout_item {% id %}
			  | group_items EOL rollout_item {% d => [].concat(d[0], d[2]) %}
#---------------------------------------------------------------
rollout_item ->

item_type __ var_name (_ string ):? ( _ param_wrapper):?
{% d => ({
	'control':{
		'type':d[0],
		'name':d[2],
		'text':(d[3] != null ? d[3][1] : null),
		'params':(d[4] != null ? d[4][1] : null)
	}
})%}
#---------------------------------------------------------------
param_wrapper -> param_arg {% id %}
				| param_wrapper __ param_arg {% d => [].concat(d[0], d[2]) %}
#---------------------------------------------------------------
item_type ->
"angle"        | "bitmap"        | "button"       | "checkbox"       | "checkbutton"  | "colorPicker" | "combobox"
| "curvecontrol" | "dotnetcontrol" | "dropdownList" | "edittext"       | "groupbox"     | "hyperLink"   | "imgTag"
| "label"        | "listbox"       | "mapbutton"    | "materialbutton" | "multilistbox" | "pickbutton"  | "popUpMenu"
| "progressbar"  | "radiobuttons"  | "slider"       | "spinner"        | "SubRollout"   | "timer"
# item_type -> %kw_uicontrols
#---------------------------------------------------------------
# STRUCT DEFINITION
struct_def ->
("struct" __ ) var_name _
LPAREN
	struct_members:*
	struct_member
RPAREN
{% d => ({
	'struct': {
		...d[1],
		'members':[...d[4], d[5]]
		}
})%}

struct_members ->
  struct_member (_ "," _) {% d => d[0]%}
| struct_mod _          {% d => d[0]%}

struct_mod ->
  "private" {% d => ({'scope':d[0]})%}
| "public"  {% d => ({'scope':d[0]})%}
#---------------------------------------------------------------
struct_member -> decl    {% id %}
		| function_def   {% id %}
		| event_handler  {% id %}
#===============================================================
# EVENT HANDLER
# check for "the other" event handlers...
#---------------------------------------------------------------
event_handler ->
("on" __) event_args (__ ("do" | "return") __) expr
{% d => ({
	'event':{
		'args':d[1],
		'expr':d[3]
	}
}) %}

event_args ->
			var_name {% d => ({'name':d[0]}) %}
			| var_name __ var_name {% d => ({'target':d[0], 'name':d[2]}) %}
			| var_name __ var_name __ var_name {% d => ({'target':d[0], 'name':d[2], 'args':d[4]}) %}

#---------------------------------------------------------------
# FUNCTION DEFINITION --- OK
function_def ->
("mapped" __):?  (("function"|"fn") __ ) var_name (__ arg):* (_ "=" _) expr
{% d => ({
	'fn':{
		'mapped':(d[0] === null ? false : true),
		...d[2],
		'args':(d[3].map(x => x[1])),
		'expr':d[5]
	}}
)%}

arg -> var_name {% id %}
| var_name (_ ":") (_ operand):?
{% d =>({
	'name':d[0],
	'operand': (d[2] != null ? d[2][1] : null),
})%}

# orphan thing
function_return -> "return" (__ expr):? #{% d => ({'return':d[]})%}
{% d => ({
	'call':{
		'operand':d[0],
		'parameters': (d[1] != null ? d[1][1] : null)
	}
})%}
#===============================================================
# CONTEXT EXPRESSION -- UNFINISHED

 set_context -> "set" _ context
#---------------------------------------------------------------
 context_expr ->
 context _ ( "," _ context _ ):* expr

 context ->
   "at" __ ("level" | "time") __ operand
 | "in" __ operand
 | ("in" __):? "coordsys" (__ "local" | _ operand)
 | "about" (__ "coordsys" | _ operand)
 | ("with" __):? ("undo" | "redraw" | "quiet" | "animate" | "MXSCallstackCaptureEnabled" ) _ logical_expr
 | "with" __ "defaultAction" ("#logmsg"|"#logToFile"|"#abort")

#---------------------------------------------------------------
# CASE EXPRESSION --- OK
case_expr ->
("case" __)  ( expr __ ):? "of" _
 LPAREN
	 case_col
 RPAREN
 {% d => ({
 	'case':{
 		'expr':(d[1] != null ? d[1][0] : null),
 		'cases':d[5]
 	}
 })%}
case_col ->
case_item {% id %}
| case_col EOL case_item {% d => [].concat(d[0], d[2]) %}

case_item -> factor (_S ":" _) expr
{% d => ({
	'case':d[0],
	'expr':d[2]
})%}

# case_item ->
#   factor _    ":" _ expr
# | "default" _ ":" _ expr
#---------------------------------------------------------------
# FOR EXPRESION --- OK
for_loop ->
("for" _) var_name (( __ "in" | _ "=" ) _) source (_ "do" _) expr
{% d => ({
	'for':(
		{...d[1], ...d[3]}
	),
	'do':d[5]
})%}
| ("for" _) var_name (( __ "in" | _ "=" ) _) source (_ "collect" _) expr
{% d => ({
	'for':(
		{...d[1], ...d[3]}
	),
	'collect':d[5]
})%}

source ->
expr (__ "to" __) expr ((__ "by" __) expr):? ((__ "while" __) expr):? ((__ "where" __) expr):?
{% d => ({
	'value': d[0],
	'to': d[2],
	'by': (d[3] != null ? d[3][1] : null),
	'while': (d[4] != null ? d[4][1] : null),
	'where': (d[5] != null ? d[5][1] : null),
})%}
| expr ((__ "where" __) expr):?
{% d => ({
	'value': d[0],
	'where': (d[2] != null ? d[2][1] : null)
})%}
#---------------------------------------------------------------
# LOOP EXIT EXPRESION --- OK -- IMPLEMENTED AS A FN CALL
loop_exit -> "exit"
| "exit" (__ "with" _) expr
{% d => ({
	'call':{
		'operand':d[0],
		'parameters':({
			'call':{
				'operand':'with',
				'parameters':d[2]
			}
		})
	}}
)%}
#---------------------------------------------------------------
# DO LOOP --- OK
do_loop -> ("do" __) expr (__ "while" __) expr
{% d => ({
	'do':d[1],
	'while':d[3]
})%}
#---------------------------------------------------------------
# WHILE LOOP --- OK
while_loop -> ("while" __) expr (__ "do" __) expr
{% d => ({
	'while':d[1],
	'do':d[3]
})%}
#---------------------------------------------------------------
# IF EXPRESION --- OK
if_expr ->
("if" _) expr (_ ("do" | "then") _) expr
{% d => ({
	'if':d[1],
	'then':d[3]
})%}
| ("if" _) expr (_ "then" _) expr (_ "else" _) expr
{% d => ({
	'if':d[1],
	'then':d[3],
	'else':d[5]
})%}
#---------------------------------------------------------------
# TRY EXPRESION -- OK
try_expr -> ("try" _) expr (_ "catch" _) expr
{% d =>({
	'expr':{
		'try':d[1],
		'catch':d[3]
	}
})%}
#---------------------------------------------------------------
# VARIABLE DECLARATION --- OK
variable_decl ->
( "local" | "global" ) __ decl ( (_ "," _) decl ):*
{% d => {
	var i = d[0];
	var v = d[2];

	if (d[3].length > 0) {
		let arr = d[3].map( x => {return x[1]});
		return ({[i]:arr});
	} else {
		return ({[i]:v})
	};
}%}
| ( "persistent" __ "global" ) __ decl ( (_ "," _) decl ):*
{% d => {
	var i = (d[0][0] + " " + d[0][2]);
	var v = d[2];

	if (d[3].length > 0) {
		let arr = d[3].map( x => {return x[1]});
		return ({[i]:arr});
	} else {
		return ({[i]:v})
	};
}%}

# ( %kw_local | %kw_global ) __ decl ( (_ "," _) decl ):*
# ( %kw_persistent __ %kw_global ) __ decl ( (_ "," _) decl ):*

decl -> var_name {% id %}
		| var_name (_ "=" _) expr
		{% d => ({...d[0], ...{'value': d[2]}})%}
#---------------------------------------------------------------
#ASSIGNEMENT --- OK
assignment ->
destination (_ assignSym _) expr
{% d => ({
	'operator':d[0],
	'assign':d[2]
})%}
assignSym -> ("="|"+="|"-="|"*="|"/=")

destination -> var_name {% id %}
| property {% id %}
| index    {% id %}
#---------------------------------------------------------------

#---------------------------------------------------------------
# LOGIC EXPRESION - this probably wont work
logical_expr ->
  logical_operand __ ("or"|"and") __  (not_operand | logical_operand)
{% d => ({
	'operand_A':d[0],
	'operator': d[2],
	'operand_B':d[4]
}) %}
| logical_expr __ ("or"|"and") __  (not_operand | logical_operand)
{% d => ({
	'operand_A1':d[0],
	'operator': d[2],
	'operand_B1':d[4]
}) %}
#| logical_operand _ "and" _ logical_operand
| not_operand {% id %}

not_operand -> "not" __ logical_operand {% d => ({'not':d[2]}) %}

logical_operand -> operand {% id %}
| compare_expr {% id %}
| fn_call      {% id %}
#| logical_expr #recursion!
#---------------------------------------------------------------
# COMPARE EXPRESION -- OK
compare_expr -> compare_operand _ compareSym _ compare_operand
{% d => ({
	'operand_A':d[0],
	'operator': d[2],
	'operand_B':d[4]
}) %}
compare_operand -> math_expr {% id %}
| operand {% id %}
| fn_call {% id %}

compareSym -> ("=="|"!="|">" |"<" |">="|"<=") {% id %}
#---------------------------------------------------------------
# FUNCTION CALL --- OK
fn_call ->
operand "()"
{% d => ({
	'call':{
		'operand':d[0],
		'parameters':(d[1])
	}
})%}
| operand _S_ call_params
{% d => ({
	'call':{
		'operand':d[0],
		'parameters':(d[2])
	}
})%}

#| operand ( __ parameter):+
#| operand ( _ parameter):+

call_params -> parameter  {% id %}
|parameter _S_ call_params {% d => ([].concat(d[0], d[2])) %}
# up to an end of line or lower precedence token
#---------------------------------------------------------------
parameter ->
  operand   {% id %}
| param_arg {% id %}

param_arg -> var_name (_ ":" _) operand
{% d =>({
	'name':d[0],
	'operand':d[2]
})%}
#{% d => ({...d[1], 'value':d[3]})%}
#---------------------------------------------------------------
# OPERANDS
operand ->
factor     {% id %}
| property {% id %}
| index    {% id %}
#---------------------------------------------------------------
# ACCESSOR - PROPERTY --- OK
property -> operand "." var_name
{% d => ({
	'operand': d[0],
	'property':d[2]
})%}
#---------------------------------------------------------------
# ACCESSOR - INDEX --- OK
index -> operand ("[" _) expr (_ "]")
{% d => ({
	'operand': d[0],
	'index':d[2]
})%}
#---------------------------------------------------------------
# FACTORS --- OK?
factor ->
number       {% id %}
| string     {% id %}
| path_name  {% id %}
| var_name   {% id %}
| name_value {% id %}
| array      {% id %}
| bitarray   {% id %}
| point3     {% id %}
| point2     {% id %}
| bool       {% id %}
#| %kw_objectset {% id %}
| void       {% id %}

| "-" expr   {% d => ({'invert': d[1]}) %} #unary minus

| expr_seq   {% id %}
| "?" # last listener result
#===============================================================
# TOKENS
#===============================================================
# var_name -> %identity {% id %}
#===============================================================
# Numbers
# number ->
# 		  %posint   {% d => ({'number': d[0]}) %}
# 		| %negint   {% d => ({'number': d[0]}) %}
# 		| %number   {% d => ({'number': d[0]}) %}
#         | %hex      {% d => ({'number': d[0]}) %}

# _posint -> %posint
#---------------------------------------------------------------
# string -> %string
# names
# name_value -> %name {% d => ({nameLiteral:(d[0] + d[1])}) %}
# time
# time -> %time
# Bool
# bool -> %kw_bool
# Void values
# void -> %kw_null
#---------------------------------------------------------------
point4 -> ("[" _) expr (_ "," _) expr (_ "," _) expr (_ "," _) expr (_ "]")
{% d => ({
	'point4':{
		x:d[1], y:d[3], z:d[5], w:d[7]
	}
}) %}
point3 -> ("[" _) expr (_ "," _) expr (_ "," _) expr (_ "]")
{% d => ({
	'Point3':{
		x:d[1], y:d[3], z:d[5]
	}
}) %}
point2 -> ("[" _) expr (_ "," _) expr (_ "]")
{% d => ({
	'Point2':{
		x:d[1], y:d[3]
	}
}) %}
#---------------------------------------------------------------
#array --- OK
array ->
"#(" _ ")"                    {% d => ({'array':d[1]}) %}
| ("#(" _) array_expr (_ ")") {% d => ({'array':d[1]}) %}

array_expr -> expr {% id %}
 			 |array_expr (_ "," _) expr {% d => ([].concat(d[0], d[4])) %}
#---------------------------------------------------------------
#bitarray --- OK
bitarray ->
( "#{" _S) bitarray_inner:* (_S "}")
{% d => ({ 'bitarray':d[1]}) %}

bitarray_inner -> bitarray_expr {% id %}
| bitarray_inner (_ "," _) bitarray_expr {% d => [].concat(d[0], d[2]) %}

bitarray_expr ->
 expr {% id %}
| expr  ".."  expr {% d => [].concat(...d) %}
#---------------------------------------------------------------
path_name -> "$" alphanum | "$"
#---------------------------------------------------------------
# path -> %kw_objectset:? ("/"):? (levels):? level_name
#---------------------------------------------------------------
# levels -> level | levels "/" level
# level -> level_name
# level_name -> %path
#---------------------------------------------------------------


#===============================================================
# TOKENS
#===============================================================
# IDENTIFIERS- OK
var_name -> iden {% d =>({id:d[0]}) %}
		  | "&" iden {% d =>({id:d[1]}) %}
iden -> alphanum {% dropKeyword %}
		| "selection"
#---------------------------------------------------------------
#names
name_value -> "#" alphanum {% d => ({nameLiteral:(d[0] + d[1])}) %}
#Resources
resource -> "~" _string "~" {% d => ({'resourceID':d[1]}) %}
#pathname
path_name -> "$" alphanum {% d => d.join('') %}
#---------------------------------------------------------------
#Strings
string -> "\"" _string "\"" {% d => ({'string':d[1]}) %}
		| "@" string        {% d => ({'literal':d[1]}) %}

_string ->
	null {% d => "" %}
	| _string _stringchar {% d => d[0] + d[1] %}

_stringchar ->
	[^\\"] {% id %}
	| "\\" [^] {% function(d) {return JSON.parse("\"" + d[0] + d[1] + "\""); } %}
#--------------------------------------------------------------
# Time
#--------------------------------------------------------------
# Numbers
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
_int -> _posint {% id %}
	#| "-" _posint {% function(d) {return d[0] + d[1]; }%}

_posint ->
	[0-9] {% id %}
	| _posint [0-9] {% function(d) {return d[0] + d[1]} %}

#---------------------------------------------------------------
bool -> ("true" | "on") {% d => true %}
		| ("false" | "off") {% d => false %}
#---------------------------------------------------------------
void ->
	     "undefined"  {% d => ({value:d[0]}) %}
	   | "unsupplied" {% d => ({value:d[0]}) %}
	   | "ok"         {% d => ({value:d[0]}) %}
#===============================================================
#BASIC TOKENS
alphanum -> _alphanum {% testAlphanum %}
_alphanum -> anchar:+ {% merge %}
#===============================================================
#PARENS WITH WHITESPACE
LPAREN ->  "(" _  {% d => null %}
RPAREN ->   _ ")"  {% d => null %}
#---------------------------------------------------------------

#---------------------------------------------------------------
#Whitespace or not alphanum for the next chracter...
#Whitespace line continuations
# Whitespace


# one or more whitespace
_S_ -> wschar  | _S_ wschar     {% d => null %}
# zero or any withespace
_S -> null  | _S wschar       {% d => null %}
# USE THIS FOR NON MANDATORY WHITESPACE
# zero or any withespace with NL
_ -> null  | _ wsnlchar   {% d => null %}
# USE THIS FOR MANDATORY WHITESPACE
# one or more whitespace with NL
# THIS COULD BE WRONG
__ -> wsnlchar | __ wsnlchar    {% d => null %}
# LINE CONTINUATOR
_CONT_ -> _S "\\" _S newline {% d => null %}
# WHITESPACES THAT CAN BRE DROPPED IN STATEMENT WHEN:
#alpha / nonalpha
#nonalpha / alpha
#nonalpha / nonalpha
#===============================================================
anchar -> [A-Za-z_0-9]
digit -> [0-9]
wsnlchar -> [ \t\v\f\r\n\\] {% id %}
wschar -> [ \t\v\f]        {% id %}
newline -> [\n\r]          {% id %}
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
    "progressbar",  "radiobuttons",  "slider",       "spinner",        "SubRollout",     "timer",
	"selection",

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