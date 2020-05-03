#THE BIG ISSUE HERE IS THATMXS WORKS BY EXPRESSION PRECEDENCE,
#IT COULD DISCARD WHITESPACE AND LINEBREAKS ALTOGHETHER
#AND THIS IS NOT DETERMINANT TO MARK STATEMENTS ENDS
@{%
	const mxLexer = require('./mooTokenize.js');
    // utilities
    const flatten = arr => arr !== null ? [].concat(...arr).filter(e => e != null ) : null;
    const merge = (a, b) => a !== null && b != null ? [].concat(a, ...b).filter(e => e != null ) : null;
    const filterNull = (arr) => arr !== null ? arr.filter(e => e != null ) : null;
    // parser configuration
    //let out_logic_expr = false;
    //let out_simple_expr = false;
%}
# USING MOO LEXER
@lexer mxLexer
#===============================================================
# this has problems with iterations
# {% d => ({})%}
#---------------------------------------------------------------
# ENTRY POINT
Main -> _ _EXPR _ {% d => d[1] %}
#---------------------------------------------------------------
# Expressions main recursion
    _EXPR -> expr (EOL expr):*    {% d => merge(...d) %}
#---------------------------------------------------------------
# EXPRESSIONS - RECURSION!
    expr_seq ->
        LPAREN
            _expr_seq
        RPAREN
        {% d => d[1] %}
        | "(" _ ")"
        {% d => null %}

    _expr_seq -> expr  (EOL expr):* {% d => merge(...d) %}

            #| expr {% id %}
            #|_expr_seq EOL expr {% d => ( [].concat(d[0], d[2]) )%}
#---------------------------------------------------------------
# EXPRESSIONS LIST --- OK
    expr
        -> simple_expr    {% id %}
        | variable_decl   {% id %}
        | assignment      {% id %}
        | if_expr         {% id %}
        | while_loop      {% id %}
        | do_loop         {% id %}
        | for_loop        {% id %}
        | loop_exit       {% id %}
        | case_expr       {% id %}
        | struct_def      {% id %}
        | try_expr        {% id %}
        | function_def    {% id %}
        | function_return {% id %}
        | context_expr    {% id %}
        | set_context     {% id %}
        | utility_def     {% id %}
        | rollout_def     {% id %}
        | tool_def        {% id %}
        | rcmenu_def      {% id %}
        | macroscript_def {% id %}
        | plugin_def      {% id %}
        | change_handler  {% id %}
    #---------------------------------------------------------------
    simple_expr
        -> operand     {% id %}
        | math_expr    {% id %}
        | compare_expr {% id %}
        | logical_expr {% id %}
        | fn_call      {% id %}
        #| expr_seq #RECURSION!
#===============================================================
# DEFINITIONS
#===============================================================
# RC MENU DEFINITION - OK
    rcmenu_def
        -> (%kw_rcmenu __) var_name _
            LPAREN
                    rcmenu_clauses:?
            RPAREN
        {% d => ({
            'type': 'entity.rcmenu',
            'name': d[1],
            'body': d[4]
        })%}
    #---------------------------------------------------------------
    # REPLACE WHIS WITH EBNF CAPTURE GROUP
    rcmenu_clauses
        -> rcmenu_clause {% id %}
        | rcmenu_clauses EOL rcmenu_clause {% d => [].concat(d[0], d[2]) %}

    rcmenu_clause
        -> variable_decl {% id %}
        | function_def   {% id %}
        | struct_def     {% id %}
        | event_handler  {% id %}
        | rcmenu_submenu {% id %}
        | rcmenu_sep     {% id %}
        | rcmenu_item    {% id %}
    #---------------------------------------------------------------
    #TODO: FINISH PARAMS
    rcmenu_submenu
        -> (%kw_submenu _) string (_ "filter:" _ function_def):? _
            LPAREN
                rcmenu_clauses:?
            RPAREN
    {% d => ({
        'type': 'rcmenu.submenu',
        'label': d[1],
        'filter': d[2],
        'body': d[5]
    })%}
    #---------------------------------------------------------------
    rcmenu_sep -> (%kw_separator __) var_name (_ "filter:" _ function_def):?
    {% d => ({
        'type': 'rcmenu.separator',
        'label': d[1],
        'filter': d[2],
    })%}
    rcmenu_item -> (%kw_menuitem __) var_name _ string (_ parameter):*
    {% d => ({
        'type': 'rcmenu.menuitem',
        'name': d[1],
        'label': d[3],
        'params':flatten(d[4]),
    })%}
#---------------------------------------------------------------
# PLUGIN DEFINITION --- SHOULD AVOID LEFT RECURSION
    plugin_def
        -> (%kw_plugin __) var_name __ var_name  (_ parameter):* _
            LPAREN
                plugin_clauses
            RPAREN
            {% d => ({
                'type': 'entity.plugin',
                'superclass': d[1],
                'class': d[2],
                'params':flatten(d[4]),
                'body': d[7]
            })%}

    plugin_clauses
        -> null
        | plugin_clause {% id %}
        | plugin_clauses EOL plugin_clause {% d => [].concat(d[0], d[2]) %}

    plugin_clause
        -> variable_decl  {% id %}
        | function_def   {% id %}
        | struct_def     {% id %}
        | tool_def       {% id %}
        | rollout_def    {% id %}
        | event_handler  {% id %}
        | plugin_parameter     {% id %}
    #---------------------------------------------------------------
    plugin_parameter
        -> (%kw_parameters __) var_name (__ parameter):* _
            LPAREN
                param_clauses
            RPAREN
            {% d => ({
                'type': 'entity.plugin.params',
                'name': d[1],
                'params':flatten(d[2]),
                'body': d[5]
            })%}

    param_clauses ->
          null
        | param_clause {% id %}
        | param_clauses __ param_clause {% d => [].concat(d[0], d[2]) %}

    param_clause
        -> param_defs   {% id %}
        | event_handler {% id %}

    param_defs -> var_name (__ parameter):*
    {% d => ({
        'plugin_param':{
            'id': d[0],
            'params': flatten(d[1])
        }
    })%}
#---------------------------------------------------------------
# TOOL - MOUSE TOOL DEFINITION - OK
    tool_def
        -> (%kw_tool __) var_name (_ parameter):* _
            LPAREN
                tool_clause
                ( EOL tool_clause):*
            RPAREN
            {% d => ({
                'type': 'entity.tool',
                'name': d[1],
                'params': flatten(d[2]),
                'body': merge(d[5], d[6]),
            })%}

    tool_clause
        -> variable_decl {% id %}
        | function_def   {% id %}
        | struct_def     {% id %}
        | event_handler  {% id %}
#---------------------------------------------------------------
# UTILITY DEFINITION -- OK
    utility_def
        -> (%kw_utility __) var_name _ string (_ parameter):* _
            LPAREN
                utility_clause
                (EOL utility_clause):*
            RPAREN
            {% d => ({
                'type': 'entity.utility',
                'name': d[1],
                'title': d[3],
                'params': flatten(d[4]),
                'body': merge(d[7], d[8]),
            })%}

    utility_clause
        -> rollout_clause  {% id %}
        | rollout_def      {% id %}
#---------------------------------------------------------------
# ROLLOUT DEFINITION --- OK
    rollout_def
        -> (%kw_rollout  __) var_name _ string (_ parameter):* _
            LPAREN
                rollout_clause
                (EOL rollout_clause):*
            RPAREN
            {% d => ({
                'type': 'entity.rollout',
                'name': d[1],
                'title': d[3],
                'params':flatten(d[4]),
                'body': merge(d[7], d[8]),
            })%}
    #---------------------------------------------------------------
    rollout_clause
        -> variable_decl {% id %}
        | function_def   {% id %}
        | struct_def     {% id %}
        | item_group     {% id %}
        | rollout_item   {% id %}
        | event_handler  {% id %}
        | tool_def       {% id %}
        | rollout_def    {% id %}
    #---------------------------------------------------------------
    item_group
        -> (%kw_group _) string _
            LPAREN
                rollout_item
                (EOL rollout_item):*
            RPAREN
            {% d => ({
                'type': 'rollout.group',
                'name': d[1],
                'body': merge(d[4], d[5]),
            })%}
    #---------------------------------------------------------------
    rollout_item
        -> item_type __ var_name (_ string ):? ( _ parameter):*
            {% d => ({
                'type': ('rollout.control.').concat(d[0]),
                'name': d[2],
                'text': filterNull(d[3]),
                'params': flatten(d[4])
            })%}

    item_type -> %kw_uicontrols
#---------------------------------------------------------------
# MACROSCRIPT --- SHOULD AVOID LEFT RECURSION ?
    macroscript_def
        -> (%kw_macroscript __) var_name (_ macro_script_param):* _
            LPAREN
                ( macro_script_clauses
                    ( EOL macro_script_clauses):* ):?
                # macro_script_body
            RPAREN
            {% d => ({
                'type': 'entity.macroscript',
                'name': d[1],
                'params': d[3],
                'body': d[5]
            })%}

    macro_script_param
    -> param_name _ ( operand | resource)
        {% d => ({
            ...d[0],
            'value': d[2]
        })%}

    macro_script_body
        -> null
        | macro_script_clauses
        | macro_script_body EOL macro_script_clauses {% d => [].concat(d[0], d[2]) %}

    macro_script_clauses
        -> expr         {% id %}
        | event_handler {% id %}
#---------------------------------------------------------------
# STRUCT DEFINITION --- OK
    struct_def
        -> (%kw_struct __ ) var_name _
            LPAREN
                struct_members:*
                struct_member
            RPAREN
            {% d => ({
                'type': 'entity.struct',
                'name': d[1],
                'members':[...d[4], d[5]],
            })%}

    struct_members
        -> struct_member (_ "," _) {% d => d[0]%}
        | struct_mod _             {% d => d[0]%}

    struct_mod -> %kw_scope {% d => ({'scope': d[0]})%}

    #---------------------------------------------------------------
    struct_member
            -> decl          {% id %}
            | function_def   {% id %}
            | event_handler  {% id %}
#===============================================================
# EVENT HANDLER --- OK
    # check for "the other" event handlers...?
    event_handler
        -> (%kw_on __) event_args __ (%kw_do | %kw_return) _ expr
            {% d => ({
                'type': 'block.event',
                'args': d[1],
                'modifier': d[3],
                'expr': d[5]
            }) %}

    event_args
        -> var_name
            {% d => ({'event': d[0]}) %}
        | var_name __ var_name
            {% d => ({'target': d[0], 'event': d[2]}) %}
        | var_name __ var_name ( __ var_name):+
            {% d => ({
                'target': d[0],
                'event': d[2],
                'args': flatten(d[3])}
            )%}

# CHANGE HANDLER -- UNFINISHED
    change_handler
        -> %kw_when __ var_name __ (var_name | path_name) __ var_name __
          (parameter _ | parameter _ parameter _):? (var_name __):?
          %kw_do _ expr

        | %kw_when __ (var_name | path_name) __ var_name __
          (parameter _ | parameter _ parameter _):? (var_name _):?
          %kw_do _ expr

#---------------------------------------------------------------
# FUNCTION DEFINITION --- OK
    function_def
        -> (%kw_mapped __):?  (%kw_function __ ) var_name (_ var_name):*  (_ arg):* (_ "=" _) expr
            {% d => ({
                'type': 'entity.function',
                'mapped': (d[0] === null),
                'identifier': d[2],
                'args': flatten(d[3]),
                'params': flatten(d[4]),
                'expr': d[6],
            })%}


    arg
        -> parameter  {% id %}
        | param_name  {% id %}

    function_return -> %kw_return _ expr:?
        {% d => ({
            'type': 'function.return',
            'expr': d[2]
        })%}
#===============================================================
# CONTEXT EXPRESSION -- UNFINISHED
    set_context -> %kw_set _ context
    #---------------------------------------------------------------
    context_expr -> context (_S "," _ context ):* _ expr

    context
        -> %kw_at __ (%kw_level | %kw_time) __ operand
        | %kw_in __ operand
        | (%kw_in __):? %kw_coordsys (__ %kw_local | __ operand)
        | %kw_about (__ %kw_coordsys | __ operand)
        | (%kw_with __):? %kw_context __ (logical_expr | bool)
        | %kw_with __ %kw_defaultAction __ ("#logmsg"|"#logToFile"|"#abort")
        | (%kw_with __):? %kw_undo ( _ string _ | __ param_name _ expr _ | __ var_name _):? ( _ logical_expr | __ bool)
        #  | (%kw_with __):? %kw_context _ logical_expr

#---------------------------------------------------------------
# CASE EXPRESSION --- OK
    case_expr
        -> (%kw_case _)  case_src %kw_of _
            LPAREN
                case_item
                (EOL case_item):*
                # EOL:?
            RPAREN
            {% d => ({
                'type': 'expression.case',
                'expr': d[1],
                'cases':  merge(d[5], d[6]),
            })%}

    case_src -> expr _  {% d => d[0]%} | __ {% id %}

    # case_col ->
    #   case_item {% id %}
    #   | case_col EOL case_item {% d => [].concat(d[0], d[2]) %}

    case_item
        -> factor (":" _) expr
            {% d => ({'case': d[0], 'expr': d[2] })%}
        | param_name _ expr # WORKAROUND FOR THE TOKENIZATION
            {% d => ({'case': d[0], 'expr': d[2] })%}
#---------------------------------------------------------------
# FOR EXPRESSION --- OK
    for_loop
        -> (%kw_for __) var_name _S source (_ (%kw_do | %kw_collect) _) expr
            {% d => ({
                'type': 'expression.loop.for',
                'index': d[1],
                ...d[3],
                [d[4][1]]: d[5]
            })%}

    source
        -> ("=" _S) expr (_ %kw_to _S) expr
                    ((_ %kw_by _S) expr):?
                    ((_ %kw_while _S) expr):?
                    ((_ %kw_where _S) expr):?
            {% d => ({
                'iteration': 'ordinal',
                'value': d[1],
                'to': d[3],
                'by':    filterNull(d[4]),
                'while': filterNull(d[5]),
                'where': filterNull(d[6])
            })%}
        | (%kw_in _S) expr ((_ %kw_where _S) expr):?
            {% d => ({
                'iteration': 'cardinal',
                'value': d[1],
                'where': filterNull(d[2])
            })%}
#---------------------------------------------------------------
# LOOP EXIT EXPRESSION --- OK
    loop_exit
        -> %kw_exit
            {% d => ({ 'type' : 'loop.exit' })%}
        | %kw_exit (__ %kw_with _) expr
            {% d => ({
                'type' : 'expression.loop.exit',
                'with': d[2]
            })%}
#---------------------------------------------------------------
# DO LOOP --- OK
    do_loop -> (%kw_do __) expr (__ %kw_while __) expr
        {% d => ({
            'type': 'expression.loop.do',
            'do': d[1],
            'while': d[3]
        })%}
#---------------------------------------------------------------
# WHILE LOOP --- OK
    while_loop -> (%kw_while __) expr (__ %kw_do __) expr
        {% d => ({
            'type': 'expression.loop.while',
            'while': d[1],
            'do': d[3]
        })%}
#---------------------------------------------------------------
# IF EXPRESSION --- OK
    if_expr
        -> (%kw_if _) expr (_ ( %kw_do | %kw_then ) _) expr
            {% d => ({
                'type': 'expression.if',
                'condition': d[1],
                'then': d[3]
            })%}
        | (%kw_if _) expr (_ %kw_then _) expr (_ %kw_else _) expr
            {% d => ({
                'type': 'expression.if',
                'condition': d[1],
                'then': d[3],
                'else': d[5]
            })%}
#---------------------------------------------------------------
# TRY EXPRESSION -- OK
    try_expr -> (%kw_try _) expr (_ %kw_catch _) expr
    {% d =>({
        'type': 'expression.try',
        'try': d[1],
        'catch': d[3]
    })%}
#---------------------------------------------------------------
# VARIABLE DECLARATION --- OK
    variable_decl
        -> ( %kw_local | %kw_global ) _ decl ( (_S "," _) decl ):*
            {% d => ({
                'type': 'variable.declaration',
                'scope': d[0],
                'values': (
                    d[3] != null ? [].concat(d[2], d[3].map( x => x[1])) : d[2]
                    )
            })%}
        | ( %kw_persistent __ %kw_global ) _ decl ( (_S "," _) decl ):*
            {% d => ({
                'type': 'variable.declaration',
                'scope': 'persistent global',
                'values': merge(d[2], d[3])
            })%}

    # Direct assignment on declaration
    decl    -> var_name {% id %}
            | var_name (_S "=" _) expr
            {% d => ({...d[0], ...{'value': d[2]}})%}
#---------------------------------------------------------------
#ASSIGNEMENT --- OK
    assignment
    -> destination (_S assignSym _) expr
        {% d => ({
            'type': 'variable.assign',
            'operand': d[0],
            'assign': d[1][1],
            'value': d[2]
        })%}

    #assignSym -> ("="|"+="|"-="|"*="|"/=")
    assignSym -> %assign

    destination
    -> var_name {% id %}
    | property  {% id %}
    | index     {% id %}
#---------------------------------------------------------------
# MATH EXPRESSION ---  PARTIAL OPERATOR PRECEDENCE....
    math_expr
        -> math_operand _S mathSym _ math_operand
            {% d => ({'type': 'expression.math','operator': d[2], 'operand_A': d[0], 'operand_B': d[4]})%}
        | math_expr    _S mathSym _ math_operand
            {% d => ({'type': 'expression.math','operator': d[2], 'operand_A': d[0], 'operand_B': d[4]})%}
        | math_operand _S %kw_as _ var_name
            {% d => ({'type': 'expression.math','operator': d[2], 'operand_A': d[0], 'operand_B': d[4]})%}
        | math_expr _S    %kw_as _ var_name
            {% d => ({'type': 'expression.math','operator': d[2], 'operand_A': d[0], 'operand_B': d[4]})%}

    mathSym -> %math
    # mathSym -> ("+"|"-"|"*"|"/"|"^") {% id %}

    # THIS ___needs to drop operand results..
    #    math_expr -> sum
    #    {% (d, l, reject) => (
    #        Array.isArray(d[0]) && d[0].length > 1 ? d[0] : reject
    #    )%}
    #    sum -> sum _ ("+"|"-") __ product      {% d => [(d[0][0]), (d[2][0]), d[4] ]%}
    #        | product
    #
    #    product -> product _ ("*"|"/") _ exp  {% d => [d[0], (d[2][0]), d[4] ]%}
    #        | exp                             {% id %}
    #
    #    # this is right associative!
    #    exp -> math_operand _ "^" _ exp  {% d => [d[0], d[2], d[4] ]%}
    #        | math_operand               {% id %}
    #

    math_operand
        -> operand   {% id %}
        | fn_call {% id %}
        #| conversion {% id %}
        #| math_expr #recursion!
#---------------------------------------------------------------
# CONVERSION
    conversion -> operand _S %kw_as _ var_name
    {% d => ({
        'type': 'expression.convert',
        'operand': d[0],
        'class': d[4]
    })%}
#---------------------------------------------------------------
# LOGIC EXPRESSION --- this probably wont work
    logical_expr
        -> logical_operand _S %kw_compare _  (not_operand | logical_operand)
        {% d => ({
            'type' : 'expression.logic',
            'operator': d[2],
            'operand_A': d[0],
            'operand_B': d[4]
        }) %}
        | logical_expr _S %kw_compare _  (not_operand | logical_operand)
        {% d => ({
            'type' : 'expression.logic',
            'operator': d[2],
            'operand_A1': d[0],
            'operand_B1': d[4]
        }) %}
        | not_operand {% id %}

        not_operand -> %kw_not _ logical_operand
            {% d => ({
            'type' : 'expression.negation',
            'operator': d[0],
            'operand_B1': d[2]
        }) %}

    logical_operand
        -> operand     {% id %}
        | compare_expr {% id %}
        | fn_call      {% id %}
        #| logical_expr #recursion!
#---------------------------------------------------------------
# COMPARE EXPRESSION --- OK
    compare_expr -> compare_operand _S compareSym _ compare_operand
    {% d => ({
        'type': 'expression.compare',
        'operator': d[2],
        'operand_A': d[0],
        'operand_B': d[4]
    }) %}
    compare_operand
    -> math_expr {% id %}
    | operand    {% id %}
    | fn_call    {% id %}

    compareSym -> %comparison
    # compareSym -> ("=="|"!="|">" |"<" |">="|"<=") {% id %}
#---------------------------------------------------------------
# FUNCTION CALL --- OK
    fn_call
        -> operand voidparens
            {% d => ({
                'type': 'method.call',
                'identifier': d[0],
                'parameters': d[1]
            })%}
        | operand _S call_params
            {% d => ({
                'type': 'method.call',
                'identifier': d[0],
                'parameters': d[2]
            })%}

    call_params
        -> fn_call_args  {% id %}
        | call_params _S fn_call_args {% d => [].concat(d[0], d[2]) %}
        # up to an end of line or lower precedence token

    fn_call_args -> operand | parameter
#---------------------------------------------------------------
# PARAMETER CALL --- OK
    parameter -> param_name _ operand
        {% d =>({
            'type': 'value.parameter',
            ...d[0],
            'value': d[2]
        })%}
    param_name -> %params {% d => ({ 'parameter': d[0] })%}
#---------------------------------------------------------------
# OPERANDS --- OK
    operand
        -> factor     {% id %}
        | property    {% id %}
        | index       {% id %}
#---------------------------------------------------------------
# ACCESSOR - PROPERTY --- OK
    property -> operand %property
        {% d => ({
            'type': 'accessor.property',
            'operand': d[0],
            'property': d[2]
        })%}
#---------------------------------------------------------------
# ACCESSOR - INDEX --- OK
    index -> operand _ ("[" _) expr (_ "]")
        {% d => ({
            'type': 'accessor.index',
            'operand': d[0],
            'index': d[3]
        })%}
#---------------------------------------------------------------
# FACTORS --- OK?
    factor
        -> number    {% id %}
        | string     {% id %}
        | path_name  {% id %}
        | var_name   {% id %}
        | name_value {% id %}
        | array      {% id %}
        | bitarray   {% id %}
        | point3     {% id %}
        | point2     {% id %}
        | time       {% id %}
        | bool       {% id %}
        | void       {% id %}
        # additonal rules: workarounds.
        # | kw_reserved {% id %}
        # MAGIC TRICK: for expressions like catch ()
        # | %voidparens {% id %}
        #| %parens {% id %}
        #unary minus
        | "-" expr   {% d => ({'type': 'unary_minus', 'operand': d[1]}) %}
        #last listener result
        | "?" {% d => ({'type': 'keyword.listener', 'token': d[0]}) %}
        | expr_seq   {% id %} # HERE IS WHERE THE ITERATION HAPPENS

# RESERVED KEYWORDS
    kw_reserved
        -> %kw_uicontrols
        | %kw_objectset
        # | %kw_return
        # | %kw_throw
        | %kw_time
        | %kw_group
        # | %kw_continue
        # | %kw_collect
        # | %kw_rollout
#===============================================================
# VALUES
#===============================================================
# POINT4
    point4 -> ("[" _) expr (_S "," _) expr (_S "," _) expr (_S "," _) expr (_S "]")
    {% d => ({
        'type': 'value.point4',
            x: d[1],
            y: d[3],
            z: d[5],
            w: d[7]
    }) %}
# POINT3
    point3 -> ("[" _) expr (_S "," _) expr (_S "," _) expr (_S "]")
    {% d => ({
        'type': 'value.point3',
            x: d[1],
            y: d[3],
            z: d[5]
    }) %}
# POINT2
    point2 -> ("[" _) expr (_S "," _) expr (_S "]")
    {% d => ({
        'type': 'value.point2',
            x: d[1],
            y: d[3]
    }) %}
#===============================================================
# ARRAY --- OK
    array
        -> %arraydef _ %rparen                    {% d => ({'type': 'value.array', 'value': d[1]}) %}
        | (%arraydef _) array_expr (_ %rparen)    {% d => ({'type': 'value.array', 'value': d[1]}) %}

        array_expr
        -> expr {% id %}
        | array_expr (_ "," _) expr {% d => [].concat(d[0], d[4]) %}
#---------------------------------------------------------------
# BITARRAY --- OK
    bitarray
    -> ( %bitarraydef _) bitarray_inner:* (_ %rbrace)
       {% d => ({'type': 'value.bitarray', 'value': d[1]}) %}

    bitarray_inner
    -> bitarray_expr {% id %}
    | bitarray_inner (_ "," _) bitarray_expr {% d => [].concat(d[0], d[2]) %}

    bitarray_expr
    -> expr {% id %}
    | expr  ".."  expr {% d => [].concat(...d) %}
#===============================================================
# TOKENS
#===============================================================
    # time
    time -> %time    {% d =>({'value.time': d[0]}) %}
    # Bool
    bool -> (%kw_bool | %kw_on ) {% d =>({'value.bool': d[0]}) %}
    # Void values
    void -> %kw_null {% d =>({'value.null': d[0]}) %}
    #---------------------------------------------------------------
    # Numbers
    number
        -> %posint  {% d => ({'type': 'value.number', 'value': d[0]}) %}
        | %negint   {% d => ({'type': 'value.number', 'value': d[0]}) %}
        | %number   {% d => ({'type': 'value.number', 'value': d[0]}) %}
        | %hex      {% d => ({'type': 'value.number', 'value': d[0]}) %}
        # _posint -> %posint
    # string
    string -> %string   {% d => ({'type': 'value.string', 'value': d[0]}) %}
    # names
    name_value -> %name {% d => ({'type': 'value.name', 'value': d[0]}) %}
    #Resources
    resource -> %locale {% d => ({'type': 'value.resource', 'value' : d[0]}) %}
#===============================================================
# VARNAME --- IDENTIFIERS --- OK
    # some keywords can be var_name too...
    var_name
        -> %identity    {% d =>({'type': 'identifier', 'value': d[0]}) %}
        | %global_typed {% d =>({'type': 'identifier', 'value': d[0]}) %}
        | kw_reserved   {% d =>({'type': 'identifier', 'value': d[0]}) %}
        #  | %kw_objectset {% id %}
#===============================================================
# PATH NAME
    # pathname cheat
    # path_name -> "$" | "$" alphanum {% d => d.join('') %}
    #---------------------------------------------------------------
    # THIS JUST CAPTURES ALL THE LEVEL PATH IN ONE TOKEN....
    path_name -> %path {% d => ({'type': 'identifier.path', 'value': d[0]}) %}
    #---------------------------------------------------------------
    # path -> (%kw_objectset):? ("/"):? (levels):? level_name
    # levels -> level | levels "/" level
    # level -> level_name {% id %}
    # level_name -> # MISSING
#===============================================================
#PARENS
    LPAREN ->  %lparen _    {% d => ({'type': 'paren.open', 'offset':d[0].offset}) %}
    RPAREN ->  ___ %rparen  {% d => ({'type': 'paren.close', 'offset':d[1].offset}) %}
    voidparens -> "()"      {% d => '( )' %}
#===============================================================
# WHITESPACE AND NEW LINES
#===============================================================
    EOL -> _eol:* ( %newline | %statement ) _S {% d => null %}

    _eol
    -> %ws
    | %statement
    | %newline
    | %comment_BLK
    | %comment_SL # %newline

    # one or more whitespace
    _S_ -> ws | _S_ ws  {% d => null %}
    # zero or any withespace
    _S -> null | _S ws  {% d => null %}
    # one or more whitespace with NL
    __ -> %ws | __ junk {% d => null %}
    # zero or any withespace with NL
    _ -> null | _ junk  {% d => null %}
    # this is for optional EOL
    ___ -> null | ___ (junk | %statement)  {% d => null %}

    ws -> %ws | %comment_BLK
    junk ->  %ws | %newline | %comment_BLK | %comment_SL
#---------------------------------------------------------------