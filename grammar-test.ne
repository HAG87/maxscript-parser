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

#===============================================================
MAIN -> # var_name {% id %}
# _ (main_expr) _
#| LPAREN (main_expr) RPAREN
 (
	#Block
	_expr
#	  struct_def
	#| utility_def
#	 | fn_def

#	 | rollout_def

#	 | typed_var_decl
#	 | if_expr
#	 | try_expr
#	 | while_loop
#	 | do_loop
#	 | for_loop

) #_


#{% function(d) {return d[1]} %}
#===============================================================
# EXPRESSIONS -- NEEDS ITERATOR
#===============================================================

# main_expr ->
#	  struct_def
#	 | fn_def
#	 | rollout_def
	#| utility_def

#===============================================================
# STATEMENTS
#===============================================================
#IF EXPRESSION
if_expr ->
		  "if" expr "then" expr ( "else" expr ):?
        | "if" expr "do" expr

# ERROR CHECK STATEMENT
# try_expr -> "try" expr "catch" ( expr | void_parens)

# loops needs a better definition of loop-exit and loop-continue
# WHILE LOOP
while_loop -> "while" simple_expr "do" loop_expr

# DO LOOP
do_loop -> "do" simple_expr "while" loop_expr

# FOR LOOP
# for i=1 to col.count | by -1 | where condition | (do | collect)
# for i in col | where condition | (do | collect)

for_loop -> "for" __ arr_source _ ("where" simple_expr ):? ("do" | "collect") loop_expr

arr_source ->
			var_name _ "=" simple_expr "to" simple_expr ("by" simple_expr):?
			| var_name __ "in" simple_expr
#===============================================================
# NEED TO COMBINE THE WORK ON BLOCK WITH EXPR
#===============================================================
# DEFINITIONS
#struct (member, (member):*)
#(mapped):? __ (function 1 fn) __ var_name __ (arg _):* "=" expr
#===============================================================
#STRUCTURE DEFINITION
struct_def ->
"struct" __ var_name
LPAREN
	members
RPAREN

members -> member {% id %}
		 | members _S comma _ member {% flatten %}

member -> var_name ( _ "=" expr):?
		| fn_def
		| event_handler

#===============================================================
#FUNCTION DEFINITION
# MISSING EXPR
fn_def ->
("mapped" __ ):? ("function" | "fn" ) __ var_name ( __ args):? ( __ opt_args):? _ "=" expr
#===============================================================
# UTILITY DEFINITION
utility_def ->
"utility" __ var_name _ string _ (opt_args):?
LPAREN
	utility_clauses
RPAREN

utility_clauses -> rollout_clauses {% id %}
#===============================================================
# ROLLOUT DEFINITION
rollout_def ->
				"rollout" _ var_name _ string _ (opt_args):?
				LPAREN
					   (rollout_clauses):?
				RPAREN


rollout_clauses -> rollout_clause
				  | rollout_clauses rollout_clause


rollout_clause -> var_name

               # | typed_var_decl EOL
                #| fn_def
                #| struct_def

                #| mousetool

               # | item_group
                #| rollout_item EOL
               # | event_handler
item_group ->
			"group" _ string
			LPAREN
					(rollout_item _ ):*
			RPAREN

rollout_item -> rollout_item_type __ var_name _ (string):? _ (opt_args):?

# REPLACE WITH KEYWORDS
rollout_item_type ->
        "angle" | "bitmap" | "button" | "checkbox" | "checkbutton" | "colorPicker" | "combobox" |
        "curvecontrol" | "dotnetcontrol" | "dropdownList" | "edittext" | "groupBox" | "hyperLink" |
        "imgTag" | "label" | "listbox" | "mapbutton" | "materialbutton" | "multilistbox" | "pickbutton" |
        "popUpMenu" | "progressbar" | "radiobuttons" | "slider" | "spinner" | "SubRollout" | "timer"
#===============================================================
# RC MENU DEFINITION
#===============================================================
# MOUSE TOOL DEFINITION
#===============================================================
# TOOL DEFINITION
#===============================================================
# MACROSCRIPT DEFINITION

#===============================================================
#PLUGIN DEFINITION
#===============================================================

#===============================================================
# DECLARATIONS ARGUMENTS
args ->
		var_name
		| args __ var_name

opt_args ->
		opt_arg
		| opt_args __ opt_arg

opt_arg -> var_name _S ":" _S (operand):?
#===============================================================
#HANDLERS
event_handler ->
				"on" __ event_action __ "do" expr
				| "on" __ event_target __ event_action __ (event_args):* "do" expr

event_action -> var_name
event_target -> var_name
event_args   -> var_name
#===============================================================
# SIMPLE EXPRESSIONS

# complete these

#expr_sequence -> expr | expr_sequence ___ expr

P ->
      LPAREN E RPAREN #{% TRUE %}

E ->
     null
	|alphanum
    | LPAREN E RPAREN E


#loop_expr -> expr
#			| loop_continue
#			| loop_exit

#fn_expr -> expr
#		  | fn_return


# Expression iterator
expr -> _expr
		| LPAREN _expr RPAREN
		| expr ___ _expr


_expr ->
#	  	null
		 _ context_free_expr _			#	{% ([fst, snd, trd]) => snd %}
		| _LPAREN
			_expr
		 _RPAREN
			_expr



_LPAREN -> _ "("  {% (d) => null %}

_RPAREN ->  ")" _ {% (d) => null %}


simple_expr ->
	_ dcl_expr _
	| LPAREN simple_expr RPAREN




context_free_expr ->

	  var_decl	          {% id %}
#	 | typed_var_decl
 #   | fn_def
#	 | if_expr
#	 | try_expr
#	 | while_loop
#	 | do_loop
#	 | for_loop

dcl_expr  ->
			#var_name
			var_decl

# MIXED CONTEXTUAL EXP
loop_exit -> _ "exit" _ ("with" expr):?
loop_continue -> _ "continue" _

fn_return -> _ "return" _expr


# OPERANDS -- REPLACE THIS
# operand ->
# 		var_name
# 		| string
# 		| int


#===============================================================
# member -> Block

# Recurse: consume everything
Block -> _block               {% id %}
		| Block blank _block #{% flatten %}

#__block -> _ _block {% function(d) {return d[1]} %} #| blank __block | __block blank



# Recurse: consume everything in one line
_block -> ANY {% id %}
		| _block __ ANY {% flatten %}




#===============================================================
# Building blocks
#===============================================================
# FIX THESE
# variable_decls -> ( "local" | ("persistent"):? __ "global" ) decl ( "," decl ):*

# typed_var_decl -> _ ( "local" | ("persistent" __ ):? "global" ) __ var_decl ___

# var_decl ->  decl						{% id %}
# 		   | var_decl _S comma _ decl

# decl -> var_name			{% (d) => ( {decl:d[0]} ) %}
#       | var_name _S "=" expr


# FUNCTION CALLS

# PROPERTIES
#===============================================================
# var_name -> alphanum {% id %}
#===============================================================

#===============================================================
#Basic values
#===============================================================
#Strings
# string -> "\"" _string "\"" {% function(d) {return {'literal':d[1]}; } %}

# _string ->
# 	null {% function() {return ""; } %}
# 	| _string _stringchar {% function(d) {return d[0] + d[1];} %}

# _stringchar ->
# 	[^\\"] {% id %}
# 	| "\\" [^] {% function(d) {return JSON.parse("\"" + d[0] + d[1] + "\""); } %}


# names -> "#" [A-Za-z_0-9]:+

#===============================================================
#Numers
#===============================================================
#Others
# DATAPAIR

# box2 -> "[" expr "," expr "," expr "," expr "]"
# point3 -> "[" expr "," expr "," expr "]"
# point2 -> "[" expr "," expr "]"
#===============================================================
# Collections
# INDEX ACCESS
# ARRAY
# DICTIONARY
#===============================================================
#Basic tokens
#===============================================================
# PARENS
void_parens -> _ "(" _ ")" _

LPAREN -> _ "(" _ {% (d) => null %}

RPAREN -> _ ")" _ {% (d) => null %}

__RPAREN -> _ ")" ___ {% (d) => null %}


LPAREN? -> null | _ "(" _ {% id %}
RPAREN? -> null | _ ")" _ {% id %}
#===============================================================
# SEP
comma -> "," {% (d) => null %}
#===============================================================
# For testing purposes
ANY -> _any   {% id %}
	  | alphanum
	  | int

# Basic types
alphanum -> [A-Za-z_0-9]:+
{%
    function(d,l, reject) {

		var arr = d[0].join('');

		var re = new RegExp("^\\d+$");

		//return re.test(arr);
		// return arr;

        if (re.test(arr)) {
            return reject;
        } else {
            return arr;
        }
    }
%}

alpha -> [A-Za-z_]:+ {% function(d) {return d[0].join('')} %}
int -> [0-9]:+       {% function(d) {return d[0].join('')} %}

_any -> [^ \t\n\r]:+ {% function(d) {return d[0].join('')} %}
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


wsnlchar -> [ \t\v\f\r\n] {% id %}
wschar -> [ \t\v\f]       {% id %}
newline -> [\r\n]         {% id %}
