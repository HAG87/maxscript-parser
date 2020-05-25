#THE BIG ISSUE HERE IS THATMXS WORKS BY EXPRESSION PRECEDENCE,
#IT COULD DISCARD WHITESPACE AND LINEBREAKS ALTOGHETHER
#AND THIS IS NOT DETERMINANT TO MARK STATEMENTS ENDS
@{%
	const mxLexer = require('./mooTokenize.js');
    // utilities
    const flatten = arr => arr !== null ? [].concat(...arr).filter(e => e != null ) : null;
    const merge = (a, b) => a !== null && b != null ? [].concat(a, ...b).filter(e => e != null ) : null;
    const filterNull = (arr) => arr !== null ? arr.filter(e => e != null ) : null;

    const tokenType = (t, newytpe) => {t.type = newytpe; return t};

    const convertToken = (token, newytpe) => {
        let node = {...token};
            node.type = newtype;
        return node;
    };

    const getLoc = (start, end) =>
        {
            if (!start) {return null;}

            let startOffset;
            let endOffset;

            if (start.loc) {
                startOffset = start.loc.start;
            } else {
                startOffset = start.offset;
            }

            if (!end) {
                if (!start.loc) {
                    endOffset = start.text != null ? start.offset + (start.text.length - 1): null;
                } else {
                    endOffset = start.loc.end
                }
            } else {
                if (end.loc) {
                    endOffset = end.loc.end
                } else {
                    endOffset = end.text != null ? end.offset + (end.text.length - 1) : null;
                }
            };

            return ({start: startOffset, end: endOffset});
        };
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

    _expr_seq -> expr  (EOL expr):*
    {% d => ({
        type: 'BlockStatement',
        body: merge(...d)}
    ) %}

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
        # | %error {% id %}
    #---------------------------------------------------------------
    simple_expr
        -> operand     {% id %}
        | math_expr    {% id %}
        | compare_expr {% id %}
        | logical_expr {% id %}
        | fn_call      {% id %}
        # | %error {% id %}
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
            type: 'EntityRcmenu',
            id:   d[1],
            body: d[4]
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
        type:   'EntityRcmenu_submenu',
        label:  d[1],
        filter: d[2],
        body:   d[5]
    })%}
    #---------------------------------------------------------------
    rcmenu_sep -> (%kw_separator __) var_name (_ "filter:" _ function_def):?
    {% d => ({
        type:   'EntityRcmenu_separator',
        label:  d[1],
        filter: d[2],
    })%}
    rcmenu_item -> (%kw_menuitem __) var_name _ string (_ parameter):*
    {% d => ({
        type:   'EntityRcmenu_menuitem',
        id:     d[1],
        label:  d[3],
        params: flatten(d[4]),
    })%}
#---------------------------------------------------------------
# PLUGIN DEFINITION --- SHOULD AVOID LEFT RECURSION
    plugin_def
        -> (%kw_plugin __) var_name __ var_name  (_ parameter):* _
            LPAREN
                plugin_clauses
            RPAREN
            {% d => ({
                type:       'EntityPlugin',
                superclass: d[1],
                class:      d[2],
                params:     flatten(d[4]),
                body:       d[7]
            })%}

    plugin_clauses
        -> null
        | plugin_clause {% id %}
        | plugin_clauses EOL plugin_clause {% d => [].concat(d[0], d[2]) %}

    plugin_clause
        -> variable_decl    {% id %}
        | function_def      {% id %}
        | struct_def        {% id %}
        | tool_def          {% id %}
        | rollout_def       {% id %}
        | event_handler     {% id %}
        | plugin_parameter  {% id %}
    #---------------------------------------------------------------
    plugin_parameter
        -> (%kw_parameters __) var_name (__ parameter):* _
            LPAREN
                param_clauses
            RPAREN
            {% d => ({
                type:   'EntityPlugin_params',
                id:     d[1],
                params: flatten(d[2]),
                body:   d[5]
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
            type:   'PluginParam',
            id:     d[0],
            params: flatten(d[1])
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
                type:   'EntityTool',
                id:     d[1],
                params: flatten(d[2]),
                body:   merge(d[5], d[6]),
                loc:    getLoc(d[0][0], d[7])
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
                type:   'EntityUtility',
                id:     d[1],
                title:  d[3],
                params: flatten(d[4]),
                body:   merge(d[7], d[8]),
                loc:    getLoc(d[0][0], d[9])
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
                type:   'EntityRollout',
                id:     d[1],
                title:  d[3],
                params: flatten(d[4]),
                body:   merge(d[7], d[8]),
                loc:    getLoc(d[0][0], d[9])
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
                type: 'EntityRolloutGroup',
                id:   d[1],
                body: merge(d[4], d[5]),
                loc:getLoc(d[0][0], d[6])
            })%}
    #---------------------------------------------------------------
    rollout_item
        -> item_type __ var_name (_ string ):? ( _ parameter):*
            {% d => ({
                type:   'EntityRolloutControl',
                class:  d[0],
                id:     d[2],
                text:   filterNull(d[3]),
                params: flatten(d[4])
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
                type:   'EntityMacroscript',
                id:     d[1],
                params: d[3],
                body:   merge(...d[5]),
                loc:    getLoc(d[0][0], d[6])
            })%}

    macro_script_param
        -> param_name _ ( operand | resource)
            {% d => ({
                ...d[0],
                value: d[2]
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
                type: 'Struct',
                id:   d[1],
                body: [...d[4], d[5]],
                loc:  getLoc(d[0][0], d[6])
            })%}
    # TODO: FINISH LOCATION
    struct_members
        -> struct_member (_ "," _) {% d => d[0]%}
        | struct_mod _             {% d => d[0]%}
    # TODO: FINISH LOCATION
    struct_mod -> %kw_scope {% d => ({scope: d[0].value, loc:getLoc(d[0])})%}

    #---------------------------------------------------------------
    struct_member
        -> decl          {% id %}
        | function_def   {% id %}
        | event_handler  {% id %}
#===============================================================
# EVENT HANDLER --- OK
# TODO: FINISH LOCATION
    # check for "the other" event handlers...?
    event_handler
        -> (%kw_on __) event_args __ (%kw_do | %kw_return) _ expr
            {% d => ({
                type:     'Event',
                args:     d[1],
                modifier: d[3],
                body:     d[5]
            }) %}

    event_args
        -> var_name
            {% d => ({event: d[0]}) %}
        | var_name __ var_name
            {% d => ({target: d[0], event: d[2]}) %}
        | var_name __ var_name ( __ var_name):+
            {% d => ({
                target: d[0],
                event: d[2],
                args: flatten(d[3])}
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
# TODO: FINISH LOCATION
    function_def
        -> function_decl __ var_name (_ var_name):*  (_ arg):* (_ "=" _) expr
            {% d => ({
                ...d[0],
                id:     d[2],
                args:   flatten(d[3]),
                params: flatten(d[4]),
                body:   d[6],
            })%}

    function_decl -> (%kw_mapped __):?  %kw_function
        {% d => ({
            type:   'Function',
            mapped: (d[0] != null),
            loc: (getLoc(d[0] != null ? d[0][0] : d[1]))
        })%}

    arg
        -> parameter  {% id %}
        | param_name  {% id %}

    function_return -> %kw_return _ expr:?
        {% d => ({
            type: 'FunctionReturn',
            body: d[2]
        })%}
#===============================================================
# CONTEXT EXPRESSION -- UNFINISHED
# TODO: FINISH LOCATION
# TODO: FINISH
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
                type:  'CaseStatement',
                test:  d[1],
                cases: merge(d[5], d[6]),
                loc:   getLoc(d[0][0], d[7])
            })%}

    case_src -> expr _  {% d => d[0]%} | __ {% id %}

    case_item
        -> factor (":" _) expr
            {% d => ({case: d[0], body: d[2] })%}
        | param_name _ expr
            # WORKAROUND FOR THE TOKENIZATION
            {% d => ({case: d[0], body: d[2] })%}
#---------------------------------------------------------------
# FOR EXPRESSION --- OK
# TODO: FINISH LOCATION
    for_loop
        -> (%kw_for __) var_name _S (for_to | for_in) (_ (%kw_do | %kw_collect) _) expr
            {% d => ({
                type: 'ForStatement',
                init:  d[1],
                ...d[3],
                action: [d[4][1]],
                body:   d[5]
            })%}

    for_to
        -> ("=" _S) expr (_ %kw_to _S) expr
                ((_ %kw_by _S) expr):?
                ((_ %kw_while _S) expr):?
                ((_ %kw_where _S) expr):?
        {% d => ({
            iteration: 'ordinal',
            value:     d[1],
            to:        d[3],
            by:        filterNull(d[4]),
            while:     filterNull(d[5]),
            where:     filterNull(d[6])
        })%}
    for_in
        -> (%kw_in _S) expr ((_ %kw_where _S) expr):?
            {% d => ({
                iteration: 'cardinal',
                value:     d[1],
                where:     filterNull(d[2])
            })%}
#---------------------------------------------------------------
# LOOP EXIT EXPRESSION --- OK
# TODO: FINISH LOCATION
    loop_exit
        -> %kw_exit
            {% d => ({
                type : 'LoopExit',
                loc:   getLoc(d[0])
            })%}
        | %kw_exit (__ %kw_with _) expr
            {% d => ({
                type : 'LoopExit',
                with:  d[2],
                loc:   getLoc(d[0])
            })%}
#---------------------------------------------------------------
# DO LOOP --- OK
# TODO: FINISH LOCATION
    do_loop -> (%kw_do __) expr (__ %kw_while __) expr
        {% d => ({
            type: 'DoWhileStatement',
            body: d[1],
            test: d[3]
        })%}
#---------------------------------------------------------------
# WHILE LOOP --- OK
# TODO: FINISH LOCATION
    while_loop -> (%kw_while __) expr (__ %kw_do __) expr
        {% d => ({
            type: 'WhileStatement',
            test: d[1],
            body: d[3]
        })%}
#---------------------------------------------------------------
# IF EXPRESSION --- OK
# TODO: FINISH LOCATION
    if_expr
        -> (%kw_if _) expr (_ ( %kw_do | %kw_then ) _) expr
            {% d => ({
                type:       'IfStatement',
                consequent: d[1],
                alternate:  d[3]
            })%}
        | (%kw_if _) expr (_ %kw_then _) expr (_ %kw_else _) expr
            {% d => ({
                type:       'IfStatement',
                test:       d[1],
                consequent: d[3],
                alternate:  d[5]
            })%}
#---------------------------------------------------------------
# TRY EXPRESSION -- OK
# TODO: FINISH LOCATION
    try_expr -> (%kw_try _) expr (_ %kw_catch _) expr
    {% d => ({
        type:      'TryStatement',
        block:     d[1],
        finalizer: d[3]
    })%}
    kw_try -> %kw_try _ {% d => d[0] %}
#---------------------------------------------------------------
# VARIABLE DECLARATION --- OK
# TODO: FINISH LOCATION
    variable_decl
        -> kw_decl _ decl ( (_S "," _) decl ):*
            {% d => ({
                type: 'VariableDeclaration',
                ...d[0],
                decls:  merge(d[2], d[3]),
            })%}

    kw_decl
        -> %kw_local {% d => ({scope: d[0].value, loc:getLoc(d[0])}) %}
        | %kw_global {% d => ({scope: d[0].value, loc:getLoc(d[0])}) %}
        | %kw_persistent __ %kw_global {% d => ({scope: 'persistent global', loc:getLoc(d[0], d[2])})%}

    # Direct assignment on declaration
    # TODO: LOCATION
    decl
        -> var_name                {% d => ({type:'Declaration', id:d[0]}) %}
        | var_name (_S "=" _) expr {% d => ({type:'Declaration', id:d[0], value: d[2]}) %} #{% d => ({...d[0], ...{value: d[2]}})%}
#---------------------------------------------------------------
#ASSIGNEMENT --- OK
    assignment
    -> destination (_S assignSym _) expr
        {% d => ({
            type:     'AssignmentExpression',
            operator: d[1][1],
            operand:  d[0],
            value:    d[2]
        })%}

    #assignSym -> ("="|"+="|"-="|"*="|"/=")
    assignSym -> %assign

    destination
        -> var_name {% id %}
        | property  {% id %}
        | index     {% id %}
#---------------------------------------------------------------
# MATH EXPRESSION ---  PARTIAL OPERATOR PRECEDENCE....
# includes "as" operator, for simplicity
    math_expr
        -> math_operand _S mathSym _ math_operand
        {% d => ({
            type:     'MathExpression',
            operator: d[2],
            left:     d[0],
            right:    d[4]
        })%}
        | math_expr    _S mathSym _ math_operand
        {% d => ({
            type:     'MathExpression',
            operator: d[2],
            left:     d[0],
            right:    d[4]
        })%}
        | math_operand _S %kw_as _ var_name
        {% d => ({
            type:     'MathExpression',
            operator: d[2],
            left:     d[0],
            right:    d[4]
        })%}
        | math_expr _S    %kw_as _ var_name
        {% d => ({
            type:     'MathExpression',
            operator: d[2],
            left:     d[0],
            right:    d[4]}
        )%}

    mathSym -> %math

    # THIS ___needs to drop operand results..
    #    math_expr -> sum
    #    {% (d, l, reject) => (
    #        Array.isArray(d[0]) && d[0].length > 1 ? d[0] : reject
    #    )%}
    #    sum -> sum _ ("+"|"-") __ product      {% d => [(d[0][0]), (d[2][0]), d[4] ]%}
    #        | product
    #    product -> product _ ("*"|"/") _ exp  {% d => [d[0], (d[2][0]), d[4] ]%}
    #        | exp                             {% id %}
    #    # this is right associative!
    #    exp -> math_operand _ "^" _ exp  {% d => [d[0], d[2], d[4] ]%}
    #        | math_operand               {% id %}

    math_operand
        -> operand   {% id %}
        | fn_call {% id %}
        #| conversion {% id %}
        #| math_expr #recursion!
#---------------------------------------------------------------
# CONVERSION
    conversion -> operand _S %kw_as _ var_name
    {% d => ({
        type:    'ConvertExpression',
        operand: d[0],
        class:   d[4]
    })%}
#---------------------------------------------------------------
# LOGIC EXPRESSION --- OK
    logical_expr
        -> logical_operand _S %kw_compare _  (not_operand | logical_operand)
        {% d => ({
            type :    'LogicalExpression',
            operator: d[2],
            left:     d[0],
            right:    d[4]
        }) %}
        | logical_expr _S %kw_compare _  (not_operand | logical_operand)
        {% d => ({
            type :    'LogicalExpression',
            operator: d[2],
            left:     d[0],
            right:    d[4]
        }) %}
        | not_operand {% id %}

        not_operand -> %kw_not _ logical_operand
            {% d => ({
            type :    'LogicalExpression',
            operator: d[0],
            right:    d[2]
        }) %}

    logical_operand
        -> operand     {% id %}
        | compare_expr {% id %}
        | fn_call      {% id %}
        #| logical_expr #recursion!
#---------------------------------------------------------------
# COMPARE EXPRESSION --- OK
    compare_expr
        -> compare_operand _S compareSym _ compare_operand
        {% d => ({
            type:     'LogicalExpression',
            operator: d[2],
            left:     d[0],
            right:    d[4]
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
                type:      'CallExpression',
                callee:    d[0],
                arguments: d[1]
            })%}
        | operand _S call_params
            {% d => ({
                type:      'CallExpression',
                calle:     d[0],
                arguments: d[2]
            })%}

    call_params
        -> fn_call_args  {% id %}
        | call_params _S fn_call_args {% d => [].concat(d[0], d[2]) %}
        # up to an end of line or lower precedence token

    fn_call_args -> operand | parameter
#---------------------------------------------------------------
# PARAMETER CALL --- OK
    parameter -> param_name _ operand
        {% d => ({
            type: 'ParameterAssignment',
            param: d[0], //id: d[0].id,
            value: d[2],
            //loc: d[0].loc
        })%}
    param_name -> %params #{% d => ({ type: 'Parameter', id: d[0].value, loc: getLoc(d[0]) })%}
#---------------------------------------------------------------
# OPERANDS --- OK
    operand
        -> factor     {% id %}
        | property    {% id %}
        | index       {% id %}
#---------------------------------------------------------------
# ACCESSOR - PROPERTY --- OK
#TODO: Avoid capturing operand
    property -> operand %property
        {% d => ({
            type: 'AccessorProperty',
            operand: d[0],
            property: d[1],   //property: d[1].value,
            //loc: getLoc(d[1])
        })%}
#---------------------------------------------------------------
# ACCESSOR - INDEX --- OK
# TODO: avoid capturing operand
    index -> operand _ p_start expr p_end
        {% d => ({
            type:    'AccessorIndex',
            operand: d[0],
            index:   d[3],
            loc:     getLoc(d[2], d[4])
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
        | "-" expr   {% d => ({type: 'UnaryExpression', operand: d[1], }) %} #{% d => ({type: 'UnaryExpression', operand: d[1], loc: getLoc(d[0])}) %}
        #last listener result
        | "?" {% d => ({type: 'Keyword', value: d[0]}) %} #{% d => ({type: 'Keyword', value: d[0].value, loc: getLoc(d[0])}) %}
        | expr_seq   {% id %} # HERE IS WHERE THE ITERATION HAPPENS
        | %error {% id %}

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
# POINTS
    point4
        -> p_start expr (_S "," _) expr (_S "," _) expr (_S "," _) expr p_end
        {% d => ({
            type: 'ObjectPoint4',
                x: d[1], y: d[3], z: d[5], w: d[7],
                loc: getLoc(d[0], d[8])
        }) %}
    point3
        -> p_start expr (_S "," _) expr (_S "," _) expr p_end
        {% d => ({
            type: 'ObjectPoint3',
                x: d[1], y: d[3], z: d[5],
                loc: getLoc(d[0], d[6])
        }) %}
    point2
        -> p_start expr (_S "," _) expr p_end
        {% d => ({
            type: 'ObjectPoint2',
                x: d[1], y: d[3],
                loc: getLoc(d[0], d[4])
        }) %}

    p_start -> "[" _  {% d => d[0]%}
    p_end   -> _S "]" {% d => d[1]%}
#===============================================================
# ARRAY --- OK
    array
        -> %arraydef _ %rparen
            {% d => ({
                type:      'ObjectArray',
                elements:  d[1],
                loc:       getLoc(d[0], d[2])
            }) %}
        | (%arraydef _) array_expr (_ %rparen)
            {% d => ({
                type:     'ObjectArray',
                elements: d[1],
                loc:      getLoc(d[0], d[2])
            }) %}

        array_expr
        -> expr {% id %}
        | array_expr (_ "," _) expr {% d => [].concat(d[0], d[4]) %}
#---------------------------------------------------------------
# BITARRAY --- OK
    bitarray
    -> %bitarraydef _ %rbrace
        {% d => ({
            type:     'ObjectBitArray',
            elements: d[1],
            loc:      getLoc(d[0], d[2])
        }) %}
    | ( %bitarraydef _) bitarray_expr (_ %rbrace)
        {% d => ({
            type:     'ObjectBitArray',
            elements: d[1],
            loc:      getLoc(d[0], d[2])
        }) %}

    bitarray_expr
    -> bitarray_expr {% id %}
    | bitarray_expr (_ "," _) bitarray_expr {% d => [].concat(d[0], d[2]) %}

    # TODO: Fix groups
    bitarray_expr
    -> expr {% id %}
    | expr  ".."  expr {% d => [].concat(...d) %}
#===============================================================
# TOKENS
#===============================================================
    # time
    time -> %time
        {% d => ({
            type: 'Literal',
            value: d[0], //.value,
            //loc:getLoc(d[0])
        }) %}
    # Bool
    bool -> (%kw_bool | %kw_on )
        {% d => ({
            type: 'Literal',
            value: d[0], //.value,
            //loc:getLoc(d[0])
        }) %}
    # Void values
    void -> %kw_null
        {% d => ({
            type: 'Literal',
            value: d[0], //.value,
            //loc:getLoc(d[0])
        }) %}
    #---------------------------------------------------------------
    # Numbers
    number -> number_types
        {% d => ({
            type: 'Literal',
            value: d[0], //.value,
            //loc:getLoc(d[0])
        }) %}

    number_types
        -> %posint
        | %negint
        | %number
        | %hex
        # %posint
    # string
    string -> %string
        {% d => ({
            type: 'Literal',
            value: d[0], //.value,
            //loc:getLoc(d[0])
        }) %}
    # names
    name_value -> %name
        {% d => ({
            type: 'Literal',
            value: d[0], //.text,
            //loc:getLoc(d[0])
        }) %}
    #Resources
    resource -> %locale
        {% d => ({
            type: 'Literal',
            value: d[0], //.text,
            //loc:getLoc(d[0])
        }) %}
#===============================================================
# VARNAME --- IDENTIFIERS --- OK
    # some keywords can be var_name too...
    var_name -> var_type
    {% d => ({
        type: 'Identifier',
        value: d[0], //.value,
        //loc:getLoc(d[0])
    }) %}

    var_type
        -> %identity {% id %}
        | %global_typed
        | kw_reserved
        #  | %kw_objectset {% id %}
#===============================================================
# PATH NAME
    # pathname cheat
    # path_name -> "$" | "$" alphanum {% d => d.join('') %}
    #---------------------------------------------------------------
    # THIS JUST CAPTURES ALL THE LEVEL PATH IN ONE TOKEN....
    path_name -> %path
        {% d => ({
            type: 'Identifier',
            value: d[0], //.value,
            //loc:getLoc(d[0])
        }) %}
    #---------------------------------------------------------------
    # path -> (%kw_objectset):? ("/"):? (levels):? level_name
    # levels -> level | levels "/" level
    # level -> level_name {% id %}
    # level_name -> # MISSING
#===============================================================
#PARENS
    LPAREN ->  %lparen _    {% d => d[0] %}
    RPAREN ->  ___ %rparen  {% d => d[1] %}
    voidparens -> "()"      {% d => '( )' %}
#===============================================================
# WHITESPACE AND NEW LINES
# comments are skipped in the parse tree!
#===============================================================
    EOL -> _eol:* ( %newline | %statement ) _S {% d => null %}

    _eol
    -> %ws
    | %statement
    | %newline
    | %comment_BLK
    | %comment_SL

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
    junk
    ->  %ws
    | %newline
    | %comment_BLK
    | %comment_SL
#---------------------------------------------------------------