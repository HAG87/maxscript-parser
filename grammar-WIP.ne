# this has problems with iterations
# parens are really poor and bad implemented
Main -> expr
#---------------------------------------------------------------
expr ->
#   simple_expr
# | variable_decl
# | assignment
# | if_expr
# | while_loop
# | do_loop
# | for_loop
# | loop_exit
# | case_expr
# | struct_def
# | try_expr
# | function_def
# | function_return
# | context_expr
# | max_command
# | utility_def
# | rollout_def
# | tool_def
# | rcmenu_def
# | macroscript_def
#| plugin_def
#---------------------------------------------------------------
# variable_decl ->
# ( "local" | "global" ) __ decl (_ "," _ decl):*
# ( "persistent" __ "global" ) __ decl (_ "," _ decl):*

# variable_decl ->
# ( %kw_local | %kw_global ) __ decl (_ "," _ decl):*
# ( %kw_persistent __ %kw_global ) __ decl (_ "," _ decl):*

# decl -> var_name ( _ "=" _ expr):?
#---------------------------------------------------------------
# assignment ->
# destination _ assignSym _ expr

# assignSym -> ("="|"+="|"-="|"*="|"/=")
#---------------------------------------------------------------
# destination ->
# var_name
# | property
# | index
#---------------------------------------------------------------
# if_expr ->
# "if" _ expr "then" expr ( _ "else" _ expr)
# | "if" _ expr _ "do" _ expr
#---------------------------------------------------------------
# while_loop -> "while" _ expr _ "do" _ expr
#---------------------------------------------------------------
# do_loop -> "do" _ expr _ "while" _ expr
#---------------------------------------------------------------
# for_loop ->
# "for" var_name ( __ "in" | _ "=" ) _ source _ ( "do" | "collect") _ expr

# source ->
# expr _ "to" _ expr _ ("by" _ expr _):? ("while" _ expr _):? ("where" _ expr _):?
# | expr _ ("where"_ expr _):?
#---------------------------------------------------------------
# loop orphans
# loop_exit -> %kw_exit ( __ %kw_with _ expr ):?
# loop_continue -> %kw_continue
#---------------------------------------------------------------
# case_expr ->
# %kw_case ( _ expr _ | __ ) %kw_of
# LPAREN
#   (case_item):*
# RPAREN
# # update this with my implementation
# case_item ->
#   factor _    ":" _ expr
# | "default" _ ":" _ expr
#---------------------------------------------------------------
# struct_def ->
# $kw_struct __ var_name _
# LPAREN
#     member
#     ("," _ member _ ):*
# RPAREN

# member ->
# var_name ( _ "=" _ expr):? # name and optional initial value
# | function_def
# | event_def
#---------------------------------------------------------------
# try_expr -> "try" _ expr _ "catch" _ expr
#---------------------------------------------------------------
# function_def ->
# (%kw_mapped __):? %kw_function __ var_name _ ( arg _ ):* "=" _ expr

# arg -> var_name
# | var_name ":" (_ operand):?

# # orphan thing
# function_return -> %kw_return _ expr
#---------------------------------------------------------------
# context_expr ->
# context _ ( "," _ context _ ):* expr
# | set_context

# context ->
# %kw_with __ %kw_animate _ logical_expr
# | %kw_at __ ("level" | "time") __ operand
# | %kw_in __ operand
# | %kw_in __ %kw_coordsys (__ %kw_local | _ operand)
# | %kw_about ( __ %kw_coordsys | _ operand)
# | %kw_with __ (%kw_undo | %kw_redraw) _ expr_seq # logical_expr # this is too old, needs to be updated

# # orphan thing
# set_context -> "set" _ context
#===============================================================
#utility_def ->
#---------------------------------------------------------------

#---------------------------------------------------------------
#rcmenu_def ->
local <decl> { , <decl> }
function_def
struct_def
rcmenu_item
rcmenu_handler
#---------------------------------------------------------------
# macroscript_def ->
# %kw_macroscript __ var_name _ string _ ( var_name ":" _ operand _ ):*
# LPAREN
#     expr_seq
# RPAREN
#---------------------------------------------------------------
#mousetool_def
#---------------------------------------------------------------
#plugin_def ->
<plugin_def> -> "plugin" <var_name> <var_name> { <var_name>:<operand> }
( { <plugin_clause> }+ )

plugin_clause ->
  variable_decl  {% id %}
| function_def   {% id %}
| struct_def     {% id %}
| parameters     {% id %}
| mousetool_def  {% id %}
| rollout_def    {% id %}
| plugin_handler {% id %}

<parameters> -> "parameters" <var_name> { <var_name>:<operand> } ( { <param_clause> }+ )

<param_clause> -> { <param_defs> }+
{ <param_handler> }

<param_defs> -> <var_name> { <var_name>":"<operand> }

<param_handler> -> "on" <var_name> <var_name> { <var_name> } "do" <expr>

<plugin_handler> -> "on" <var_name> "do" <expr>

#===============================================================
simple_expr ->
operand
| math_expr
| compare_expr
| logical_expr
| fn_call
| expr_seq #RECURSION!
#---------------------------------------------------------------
math_expr ->
math_operand _ mathSym _ math_operand
| math_operand _ "as" _ var_name
# fix this with the old method
math_operand ->
operand
| fn_call
| math_expr #recursion!

mathSym -> ("+"|"-"|"*"|"/"|"^") {% id %}
#---------------------------------------------------------------
# logical_expr ->
#   logical_operand _ "or" _  logical_operand
# | logical_operand _ "and" _ logical_operand
# | "not" _ logical_operand #this probably dont work

# logical_operand ->
# operand
# | compare_expr
# | fn_call
# | logical_expr #recursion!
#---------------------------------------------------------------
# compare_expr -> compare_operand _ compareSym _ compare_operand

# compare_operand ->
# math_expr
# | operand
# | fn_call

# compareSym -> ("=="|"!="|">" |"<" |">="|"<=") {% id %}
#---------------------------------------------------------------
# fn_call ->
# operand "()"
# | operand ( _ parameter):+
# up to an end of line or lower precedence token
#---------------------------------------------------------------
# parameter ->
# operand
# | var_name _ ":" _ operand
#---------------------------------------------------------------
# operand ->
# factor
# | property
# | index
#---------------------------------------------------------------
# property -> operand "." var_name
#---------------------------------------------------------------
# index -> operand "[" _ expr _ "]"
#---------------------------------------------------------------
# factor ->
# string
# | path_name
# | var_name
# | name_value
# | array
# #| bitarray
# | point3
# | point2
# | bool
# | void
# | "-" expr #unary minus
# | expr_seq
# | "?" # last listener result
#===============================================================
# #RECURSION!
# expr_seq ->
# RPAREN
#     _expr_seq
# LPAREN
# #RECURSION!
# _expr_seq -> expr
#             | _expr_seq EOL expr
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
# point4 -> "[" _ expr _ "," _ expr _ "," _ expr _ "," _ expr _ "]"
# point3 -> "[" _ expr _ "," _ expr _ "," _ expr _ "]"
# point2 -> "[" _ expr _ "," _ expr _ "]"
#---------------------------------------------------------------
#array -- SIMPLIFY
# array -> "#(" _ ")" | "#(" _ expr _ ("," _ expr):* ")"
#---------------------------------------------------------------
#bitarray -- COMPLETE
#---------------------------------------------------------------
# path_name -> "$" alphanum | "$"
#---------------------------------------------------------------
# path -> objectset:? ("/"):? (levels):? level_name
#---------------------------------------------------------------
# levels -> level | _ "/" _ levels
# level -> level_name
# level_name # incomplete
#---------------------------------------------------------------


#===============================================================
# TOKENS
#===============================================================
# IDENTIFIERS- OK
var_name -> iden {% d =>({id:d[0]}) %}
		  | "&" iden {% d =>({id:d[1]}) %}
iden -> alphanum {% dropKeyword %}
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
_int ->
	"-" _posint {% function(d) {return d[0] + d[1]; }%}
	| _posint {% id %}

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
RPAREN ->  _ ")"  {% d => null %}
#---------------------------------------------------------------
EOL -> _S (newline|";"):+ _S
#---------------------------------------------------------------
#Whitespace or not alphanum for the next chracter...
#Whitespace line continuations
# Whitespace
blank -> (_ newline):+ {% d => null %}

# one or more whitespace
_S_ -> (wschar | _CONT_):+     {% d => null %}
# zero or any withespace
_S -> (wschar | _CONT_):+ | null      {% d => null %}
# USE THIS FOR NON MANDATORY WHITESPACE
# zero or any withespace with NL
_ -> wsnlchar:+ | null     {% d => null %}
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