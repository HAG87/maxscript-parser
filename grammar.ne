# @{%
#
# const moo = require('moo')
#
# let lexer = moo.compile({
#     space: {match: /\s+/, lineBreaks: true},
#     number: /-?(?:[0-9]|[1-9][0-9]+)(?:\.[0-9]+)?(?:[eE][-+]?[0-9]+)?\b/,
#     string: /"(?:\\["bfnrt\/\\]|\\u[a-fA-F0-9]{4}|[^"\\])*"/,
#     '{': '{',
#     '}': '}',
#     '[': '[',
#     ']': ']',
#     ',': ',',
#     ':': ':',
#     true: 'true',
#     false: 'false',
#     null: 'null',
# })
#
# %}

# REPLACE SIMILAR STRUCTURES WITH MACROS
# ADD BOOLEANS

Main -> ( expr ):+

expr ->
      _ simple_expr     _
    | _ variable_decls  _
    | _ assignment      _
#     | _ if_expr         _
    | _ case_expr       _
#     | _ while_loop      _
#     | _ do_loop         _
#     | _ for_loop        _
    | _ loop_exit       _
#     | _ try_expr        _
    | _ context_expr    _
#     | _ struct_def      _
#     | _ function_def    _
    | _ function_return _
    | _ utility_def     _
#     | _ rollout_def     _
    | _ tool_def        _
    | _ rcmenu_def      _
    | _ macroscript_def _
    | _ plugin_def      _
    | _ max_command     _


#===============================================================
# variable_decls -> ( "local" | ("persistent"):? _ "global" ) decl ( "," decl ):?
# decl -> var_name _ ("=" _ expr):?  # name and optional initial value
# var_name ->  (alphanumeric | "_" ):?
#             | "'" any_char_except_quote "'"
#===============================================================
assignment ->
      destination _ "=" _ expr
    | destination _ "+=" _ expr
    | destination _ "-=" _ expr
    | destination _ "*=" _ expr
    | destination _ "/=" _ expr
    | destination _ "->" _ var_name
    | property
    | index
#===============================================================
# if_expr -> "if" expr "then" expr ( "else" expr ):?
#         | "if" expr "do" expr
#===============================================================
# loops needs a better definition of loop-exit and loop-continue

# while_loop -> "while" expr "do" expr

# do_loop -> "do" expr "while" expr

# for_loop -> "for" name ( "in" | "=" ) source ("do" | "collect") expr

# source -> expr "to" expr ("by" expr):? ("where" expr):?
#         | expr ("where" expr):?

# loop-exit ->"exit" ("with" expr):?
# loop-continue -> "continue"
#===============================================================
# ATENTION! BRACKETS MANDATORY

# PROGRAN FLOW CONTROL
case_expr -> "case" (expr):? "of" _OPEN (case_item):+ close_

case_item -> (factor | "default") _ ":" expr
#===============================================================
# ERROR CHECK STATEMENT
# try_expr -> "try" expr "catch" expr
#===============================================================
# STRUCTURE DEFINITION
# struct_def ->
# "struct"
# _OPEN
#         member ("," _ member _):*
# _CLOSE

# member -> name _ ("=" _ expr):? # name and optional initial value
        # | function_def
#===============================================================
# FUNCTION DEFINITION
# function_def -> ("mapped"):? _ ( "function" | "fn" ) _ var_name _ (arg _):* "=" expr

# arg -> var_name
#         | var_name _ ":" _ (operand):?

function_return -> "return" expr
#===============================================================
# CONTEXT EXPRESSION
context_expr -> context ("," context ):? expr

# check if <logical_expr> has the on-off definition
context ->
             ("with"):? _ "animate" _ logical_expr
            | "at"       _ "level"   _ operand
            | "at"       _ "time"    _ operand
            | "in"       _ operand
            | ("in"):?   _ "coordsys" _ ("local" | "world" | "parent" | operand)
            | "about"    _ ("pivot" | "selection" | "coordsys" | operand)
            | ("with"):? _ "undo" _ logical_expr
# MISSING
            | "with" "redraw" logical_expr

set_context -> "set" context
#===============================================================
# UTILITY DEFINITION
# utility_def ->
# "utility" _ var_name _ string _ (var_name _ ":" _ operand _):*
# _OPEN
#         (utility_clause _ ):+
# _CLOSE

#THIS HAS AN ORPHAN <rollout> rule
# utility_clause -> rollout_clause #| rollout
#===============================================================
# ROLLOUT DEFINITION
# rollout_def ->
# "rollout" _ var_name _ string _ (var_name _ ":" _ operand _):*
# _OPEN
#         (rollout_clause _):+
# _CLOSE

#ROLLOUT CLAUSE
# CHECK THE DECL THING
# rollout_clause ->
#                   "local" _ decl ("," _ decl _):*
#                 | function_def    _
#                 | struct_def      _
#                 | mousetool       _
#                 | item_group      _
#                 | rollout_item    _
#                 | rollout_handler _

# item_group ->
# "group" _ string
# _OPEN
#         (rollout_item _ ):*
# _CLOSE

#rollout_item -> item_type _ var_name _ (string):? _ (var_name _ ":" _ operand _):*

#rollout_handler -> "on" _ var_name _ var_name _ (var_name _):* "do" expr

# item_type ->
#         "angle" | "bitmap" | "button" | "checkbox" | "checkbutton" | "colorPicker" | "combobox" |
#         "curvecontrol" | "dotnetcontrol" | "dropdownList" | "edittext" | "groupBox" | "hyperLink" |
#         "imgTag" | "label" | "listbox" | "mapbutton" | "materialbutton" | "multilistbox" | "pickbutton" |
#         "popUpMenu" | "progressbar" | "radiobuttons" | "slider" | "spinner" | "SubRollout" | "timer"
#===============================================================
# RC MENU
rcmenu_def ->
"rcmenu" _ var_name _
_OPEN
        (rcmenu_clause _):+
_CLOSE

rcmenu_clause -> "local" _ decl ("," _ decl _):*
                | function_def
                | struct_def
                | rcmenu_item
                | rcmenu_handler

rcmenu_handler -> "on" var_name var_name "do" expr

rcmenu_item -> rcmenu_item_type var_name string (var_name _ ":" _ operand _):*

rcmenu_item_type-> "menuitem"
                 | "separator"
                 | "submenu"
#===============================================================
# MACROSCRIPT DEFINITION
macroscript_def ->
"macroscript" _ var_name _ string _ (var_name _ ":" _ operand _):*
_OPEN
        expr_seq
_CLOSE
#===============================================================
# MOUSETOOL DEFINITION
mousetool_def -> "tool" var_name _ (var_name _ ":" _ operand _):*
_OPEN
        (tool_clause _):+
_CLOSE


tool_clause -> "local" _ decl ("," _ decl _):*
              | function_def
              | struct_def
              | tool_handler

tool_handler ->  "on" _ var_name _ var_name _ (var_name _ ):* "do" expr
#===============================================================
# PLUGIN DEFINITION ----- MISSING
<plugin_def> -> plugin <var_name> <var_name> { <var_name>:<operand> } ( { <plugin_clause> }+ )

<plugin_clause> -> local <decl> { , <decl> }
<function_def>
<struct_def>
<parameters>
<mousetool_def>
<rollout_def>
<plugin_handler>

<parameters> -> parameters <var_name> { <var_name>:<operand> } ( { <param_clause> }+ )

<param_clause> -> { <param_defs> }+
{ <param_handler> }

<param_defs> -> <var_name> { <var_name>:<operand> }

<param_handler> -> on <var_name> <var_name> { <var_name> } do <expr>

<plugin_handler> -> on <var_name> do <expr>
#===============================================================

# EXPRESSIONS
simple_expr ->
                operand
              | math_expr
              | compare_expr
              | logical_expr
              | function_call
              | expr_seq

math_expr ->
              math_operand "+" math_operand # standard arithmetic addition
            | math_operand "-" math_operand # standard arithmetic subtraction
            | math_operand "*" math_operand # standard arithmetic multiplication
            | math_operand "/" math_operand # standard arithmetic division
            | math_operand "^" math_operand # exponential, raise to the power
            | math_operand "as" class # conversion between types

math_operand ->
                 operand
               | function_call
               | math_expr

logical_expr ->
               logical_operand "or" logical_operand
              |logical_operand "and" logical_operand
              |"not" logical_operand

logical_operand ->
                    operand
                  | compare_expr
                  | function_call
                  | logical_expr

compare_expr ->
                 compare_operand "==" compare_operand # equal
               | compare_operand "!=" compare_operand # not equal
               | compare_operand ">"  compare_operand # greater than
               | compare_operand "<"  compare_operand # less than
               | compare_operand ">=" compare_operand # greater than or equal
               | compare_operand "<=" compare_operand # less than or equal

compare_operand -> math_expr
               | operand
               | function_call


# FUNCTION CALL
function_call -> operand "(" _ ")"
                | operand _ (parameter _):* # up to an end of line or lower precedence token

# PARAMETERS
parameter -> operand
            |name _ ":" _ operand

# DEFINITION OF OPERAND
operand ->  factor
          | property
          | index

# PROPERTIES
property -> operand "." var_name # properties and indexes left associate

#INDEX ACCESS
index -> operand "[" expr "]"
#===============================================================

factor ->
      number
    | string
    | path_name
    | var_name
    | "#" var_name
    | array
    | bitarray
    | point3
    | point2
    | "true"
    | "false"
    | "on"
    | "off"
    | "ok"
    | "undefined"
    | "unsupplied"
    # | "-"expr # unary minus THIS WILL NOT WORK!
   # | expr_seq # expresion sequence, this needs to be addressed
    | "?" # last Listener result

#===============================================================
# this will not work
expr_seq -> ( expr ( ( ";" | EOL):? expr ):* ):?
#===============================================================
# VALUES
# point2 -> "[" expr "," expr "]"

# point3 -> "[" expr "," expr "," expr "]"

# box2 -> "[" expr "," expr "," expr "," expr "]"


array -> "#(" _ ")"
        | "#(" expr ( "," expr ):* ")"

#===============================================================
# TOKENS -- REPLACE WITH MOOO
# string -> "\"" (any_char_except_quote | "\\\"" | "\n" | "\r" | "\t" | "\*" | "\?" | "\\" | "\%" | "\x" (hex_digit):+):* "\""


# pair -> key _ ":" _ value {% function(d) { return [d[0], d[4]]; } %}

#key -> string {% id %}

#_ -> null | %space {% function(d) { return null; } %}

# _OPEN -> "(" _
# CLOSE_ -> _ ")"


# REPLACE WITH NEATLEY @builtin
# _ -> [\s]:*  |  (newline):+  {% function(d) {return null } %}

# newline -> ([\r\n] | [\r] | [\n]:+):* {% function(d) {return null } %}

# EOL -> null | %EOL {% function(d) { return null; } %}