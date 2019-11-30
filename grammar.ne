program -> ( expr ):+

expr ->
      _ simple_expr     _
    | _ variable_decls  _
    | _ assignment      _
    | _ if_expr         _
    | _ case_expr       _
    | _ while_loop      _
    | _ do_loop         _
    | _ for_loop        _
    | _ loop_exit       _
    | _ try_expr        _
    | _ context_expr    _
    | _ struct_def      _
    | _ function_def    _
    | _ function_return _
    | _ utility_def     _
    | _ rollout_def     _
    | _ tool_def        _
    | _ rcmenu_def      _
    | _ macroscript_def _
    | _ plugin_def      _
    | _ max_command     _


# NEED TO MANAGE OPERATORS
# NEED TO MANAGE KEYWORDS
# NEED TO MANAGE BRACKETS
# NEED TO MANAGE WHITESPACE --> Moo can sol witespace and brackets balancing
# THIS IS TEMPORARY

_open -> _ "(" _
close_ -> _ ")" _


variable_decls -> ( "local" | "persistent" _ "global" ) decl ( "," decl ):?

decl -> var_name _ ("=" _ expr):?  # name and optional initial value

var_name ->  (alphanumeric | "_" ):?
            | "'" any_char_except_quote "'"

assignment ->
      destination _ "=" _ expr
    | destination _ "+=" _ expr
    | destination _ "-=" _ expr
    | destination _ "*=" _ expr
    | destination _ "/=" _ expr
    | destination _ "->" _ var_name
    | property
    | index

if_expr -> "if" expr "then" expr ( "else" expr ):?
        | "if" expr "do" expr

# loops needs a better definition of loop-exit and loop-continue
while_loop -> "while" expr "do" expr

do_loop -> "do" expr "while" expr

for_loop -> "for" name ( "in" | "=" ) source ("do" | "collect") expr

source -> expr "to" expr ("by" expr):? ("where" expr):?
        | expr ("where" expr):?

# loop-exit ->"exit" ("with" expr):?
# loop-continue -> "continue"

# ATENTION! BRACKETS MANDATORY
case_expr -> "case" (expr):? "of" _open (case_item):+ close_

case_item -> (factor | "default") _ ":" expr

try_expr -> "try" expr "catch" expr


struct_def -> "struct" _open
                        _
                        member ("," _ member):*
                        _
                        _close

member -> name _ ("=" _ expr):? # name and optional initial value
        | function_def


# REPLACE WITH NEATLEU @builtin
_ -> [\s]:*     {% function(d) {return null } %}