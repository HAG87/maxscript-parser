@{%
	const mxLexer = require('./mooTokenize.js');
    // Utilities
    // WARN! THIS COULD NOT BE COMPATIBLE!!
    const empty = '';

    const flatten = arr => arr != null ? arr.flat().filter(e => e != null) : [];
    
    const collectSub = (arr, index) => arr !== null ? arr.map(e => e[index]) : [];

    const filterNull = arr => arr !== null ? arr.filter(e => e != null) : [];

    const tokenType = (t, newytpe) => {t.type = newytpe; return t;}

    const merge = (a, b) => {
        if (a != null && b != null) {
            return ([].concat(a, ...b).filter(e => e != null));
        } else if (a !== null) {
            return (Array.isArray(a) ? a.filter(e => e != null) : [a]);
        } else return null;
    }

    const convertToken = (token, newytpe) => {
        let node = {...token};
            node.type = newtype;
        return node;
    }

    const getLoc = (start, end) => {
        if (!start) {return null;}

        let startOffset = start.loc ? start.loc.start : start.offset;
        let endOffset;

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
    }
    // parser configuration
    //let capture_ws = false;
    //let capture_comments = false;
%}
# USING MOO LEXER
@lexer mxLexer
#===============================================================
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
                {% d => ({
            type: 'BlockStatement',
            body: []
        })%}

    _expr_seq -> expr  (EOL expr):*
        {% d => ({
            type: 'BlockStatement',
            body: merge(...d)
        })%}
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
        | fn_return       {% id %}
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
        -> (%kw_submenu _) string (_ parameter):? _
            LPAREN
                rcmenu_clauses:?
            RPAREN
    {% d => ({
        type:   'EntityRcmenu_submenu',
        label:  d[1],
        params: flatten(d[2]),
        body:   d[5]
    })%}
    #---------------------------------------------------------------
    rcmenu_sep -> (%kw_separator __) var_name (_ rcmenu_param):?
    {% d => ({
        type:   'EntityRcmenu_separator',
        id:     d[1],
        params: flatten(d[2]),
    })%}
    rcmenu_item -> (%kw_menuitem __) var_name _ string (_ rcmenu_param):*
    {% d => ({
        type:   'EntityRcmenu_menuitem',
        id:     d[1],
        label:  d[3],
        params: flatten(d[4]),
    })%}
    rcmenu_param -> param_name _ (operand | function_def)
        {% d => ({
            type: 'ParameterAssignment',
            param: d[0],
            value: d[2],
            //loc: d[0].loc
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
                class:      d[3],
                params:     flatten(d[4]),
                body:       d[7]
            })%}

    plugin_clauses
        -> plugin_clause
                (EOL plugin_clause):*
            {% d => merge(d[0], d[1]) %}
    #plugin_clauses
    #    -> null
    #    | plugin_clause {% id %}
    #    | plugin_clauses EOL plugin_clause {% d => [].concat(d[0], d[2]) %}

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
        -> (%kw_parameters __) var_name (_ parameter):* _
            LPAREN
                param_clauses
            RPAREN
            {% d => ({
                type:   'EntityPlugin_params',
                id:     d[1],
                params: flatten(d[2]),
                body:   d[5]
            })%}

    param_clauses
        -> null
         | param_clause {% id %}
         | param_clauses EOL param_clause {% d => [].concat(d[0], d[2]) %}

    param_clause
        -> param_defs   {% id %}
        | event_handler {% id %}

    param_defs -> var_name (_ parameter):*
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
    # rollout_clauses
    #    -> LPAREN _rollout_clause RPAREN {% d => d[1] %}
    #     | "(" _ ")" {% d => null %}

    # _rollout_clause -> rollout_clause  (EOL rollout_clause):*
    #     {% d => ({
    #         type: 'BlockStatement',
    #         body: merge(...d)
    #     })%}
    
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
                text:   (d[3] != null ? d[3][1] : null),
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
            RPAREN
            {% d => ({
                type:   'EntityMacroscript',
                id:     d[1],
                params: flatten(d[2]),
                body:   merge(...d[5]),
                loc:    getLoc(d[0][0], d[6])
            })%}

    macro_script_param
        -> param_name _ ( operand | resource)
            {% d => ({
                type: 'ParameterAssignment',
                param: d[0],
                value: d[2][0]
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
    # TODO: FINISH LOCATION # check for "the other" event handlers...?
    event_handler
        -> (%kw_on __) event_args __ event_action _ expr
            {% d => ({
                type:     'Event',
                args:     d[1],
                modifier: d[3],
                body:     d[5]
            }) %}
    
    event_action -> %kw_do {% id %} | %kw_return {% id %}
    
    event_args
        -> var_name
            {% d => ({type: 'EventArgs', event: d[0]}) %}
        | var_name __ var_name
            {% d => ({type: 'EventArgs', target: d[0], event: d[2]}) %}
        | var_name __ var_name ( __ var_name):+
            {% d => ({
                type: 'EventArgs',
                target: d[0],
                event: d[2],
                args: flatten(d[3])}
            )%}

# CHANGE HANDLER -- UNFINISHED

#   when <attribute> <objects> change[s] [ id:<name> ] \ 
#   [handleAt: #redrawViews|#timeChange] \ 
#   [ <object_parameter> ] do <expr>
#   when <objects> deleted [ id:<name> ] \ 
#   [handleAt:#redrawViews|#timeChange] \
#   [ <object_parameter> ] do <expr> 

    change_handler
        -> %kw_when __ var_name __ operand __ var_name __
          (when_param _ | when_param _ when_param _):? (var_name __):?
          %kw_do _ expr
        {% d=> ({
            type:'WhenStatement',
            args: filterNull( [].concat(d[2],d[4],d[6],d[8],d[9]) ),
            body:d[12],
            loc:getLoc(d[0])
        })%}
        | %kw_when __ operand __ var_name __
          (when_param _ | when_param _ when_param _):? (var_name _):?
          %kw_do _ expr
        {% d=> ({
            type:'WhenStatement',
            args:filterNull( [].concat(d[2],d[4],d[6],d[7]) ),
            body:d[10],
            loc:getLoc(d[0])
        })%}

    when_param -> param_name _ name_value
        {% d => ({
            type: 'ParameterAssignment',
            param: d[0],
            value: d[2],
        })%}
#---------------------------------------------------------------
# FUNCTION DEFINITION --- OK
    function_def
        -> function_decl __ var_name (_ var_name):+ (_ fn_params):+ (_ "=" _) expr
            {% d => ({
                ...d[0],
                id:     d[2],
                args:   (d[3].map(x => x[1])),
                params: (d[4].map(x => x[1])),
                body:   d[6],

            })%}
         | function_decl __ var_name (_ var_name):+ (_ "=" _) expr
            {% d => ({
                ...d[0],
                id:     d[2],
                args:   (d[3].map(x => x[1])),
                params: [],
                body:   d[5],
            })%}
         | function_decl __ var_name (_ fn_params):+ (_ "=" _) expr
            {% d => ({
                ...d[0],
                id:     d[2],
                args:   [],
                params: (d[3].map(x => x[1])),
                body:   d[5],
            })%}
         | function_decl __ var_name (_ "=" _) expr
            {% d => ({
                ...d[0],
                id:     d[2],
                args:   [],
                params: [],
                body:   d[4],
            })%}
    
    function_decl -> (%kw_mapped __):?  %kw_function
        {% d => ({
            type:   'Function',
            mapped: (d[0] != null),
            keyword: d[1],
            loc: (getLoc(d[0] != null ? d[0][0] : d[1]))
        })%}

    fn_params
        -> parameter  {% id %}
        | param_name  {% id %}
#---------------------------------------------------------------
# FUNCTION RETURN
    fn_return -> %kw_return _ expr:?
        {% d => ({
            type: 'FunctionReturn',
            body: d[2]
        })%}
#===============================================================
# CONTEXT EXPRESSION -- TODO: FINISH LOCATION
    set_context -> %kw_set _ context
    #---------------------------------------------------------------
    context_expr -> context ( (_S "," _) context ):* _ expr
        {% d => ({
            type: 'ContextStatement',
            context: merge(d[0], collectSub(d[1], 1)),
            body: d[3]
        })%}

    context
        -> %kw_at __ (%kw_level | %kw_time) __ (operand)
            {% d => ({
                type: 'ContextExpression',
                prefix : empty,
                context: d[0],
                args: d[2].concat(d[4])
            })%}
        | %kw_in __ (operand)
            {% d => ({
                type: 'ContextExpression',
                prefix : empty,
                context: d[0],
                args: d[2]
            })%}
        | (%kw_in __):? %kw_coordsys __ (%kw_local | operand)
            {% d => ({
                type: 'ContextExpression',
                prefix : (d[0] != null ? d[0][0] : empty),
                context: d[1],
                args: d[3]
            })%}
        | %kw_about __ (%kw_coordsys | operand)
            {% d => ({
                type: 'ContextExpression',
                prefix : empty,
                context: d[0],
                args: d[2]
            })%}
        | (%kw_with __):? %kw_context __ (logical_expr | bool)
            {% d => ({
                type: 'ContextExpression',
                prefix : (d[0] != null ? d[0][0] : empty),
                context: d[1],
                args: d[3]
            })%}
        | %kw_with __ %kw_defaultAction __ ("#logmsg"|"#logtofile"|"#abort")
            {% d => ({
                type: 'ContextExpression',
                prefix : d[0],
                context: d[2],
                args: d[4]
            })%}
        | (%kw_with __):? %kw_undo __ ( undo_label __ ):? (logical_expr | bool)
            {% d => ({
                type: 'ContextExpression',
                prefix : (d[0] != null ? d[0][0] : empty),
                context: d[1],
                args: (filterNull(d[3])).concat(d[4])
               //     (d[3] != null ? d[3][0] : null),
                //    d[4]
                //]
            })%}
       
        undo_label -> string {% id %} | parameter {% id %} | var_name {% id %}
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

    case_src -> expr _  {% d => d[0] %} | __ {% id %}

    case_item
        -> (factor | %params) (":" _) expr
        {% d => ({type:'CaseClause', case: d[0], body: d[2] })%}
#---------------------------------------------------------------
# FOR EXPRESSION --- OK # TODO: FINISH LOCATION
    for_loop
        -> (%kw_for __) var_name _S for_iterator _S expr ( _ for_sequence ):? _ for_action _ expr
            {% d => ({
                type:     'ForStatement',
                variable:  d[1],
                iteration: d[3],
                value:     d[5],
                sequence: filterNull(d[6]),
                action:    d[8],
                body:      d[10]
            })%}

    for_sequence
        -> for_to (_ for_by):? (_ for_while):? (_ for_where):?
        {% d => ({
            type: 'ForLoopSequence',
            to: d[0],
            by: filterNull(d[1]),
            while: filterNull(d[2]),
            where: filterNull(d[3])
        })%}
        | (for_while _):? for_where
        {% d => ({
           to: {},
           by: {},
           while: filterNull(d[0]),
           where: d[1]
       })%}

    for_iterator -> "=" {% id %} | %kw_in {% id %}
    
    for_to    -> (%kw_to _S)    expr {% d => d[1] %}
    for_by    -> (%kw_by _S)    expr {% d => d[1] %}
    for_where -> (%kw_where _S) expr {% d => d[1] %}
    for_while -> (%kw_while _S) expr {% d => d[1] %}

    for_action -> %kw_do {% id %} | %kw_collect {% id %}
#---------------------------------------------------------------
# LOOP EXIT EXPRESSION --- OK
    loop_exit
        -> %kw_exit {% id %}
        | %kw_exit (__ %kw_with _) expr
            {% d => ({
                type : 'LoopExit',
                body:  d[2]
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
    if_expr
        -> (%kw_if _) expr _ if_action _ expr
            {% d => ({
                type:       'IfStatement',
                test:       d[1],
                operator:   d[3],
                consequent: d[5]
            })%}
        | (%kw_if _) expr (_ %kw_then _) expr (_ %kw_else _) expr
            {% d => ({
                type:       'IfStatement',
                test:       d[1],
                consequent: d[3],
                alternate:  d[5]
            })%}
    if_action
        -> %kw_do  {% id %}
        | %kw_then {% id %}
#---------------------------------------------------------------
# TRY EXPRESSION -- OK # TODO: FINISH LOCATION
    try_expr -> (%kw_try _) expr (_ %kw_catch _) expr
    {% d => ({
        type:      'TryStatement',
        block:     d[1],
        finalizer: d[3]
    })%}
    kw_try -> %kw_try _ {% d => d[0] %}
#---------------------------------------------------------------
# VARIABLE DECLARATION --- OK
    variable_decl
        -> kw_decl _ decl_args
            {% d => ({
                type: 'VariableDeclaration',
                ...d[0],
                decls: d[2]
            })%}

    kw_decl
        -> %kw_local {% d => ({scope: d[0].value, loc:getLoc(d[0])}) %}
        | %kw_global {% d => ({scope: d[0].value, loc:getLoc(d[0])}) %}
        | %kw_persistent __ %kw_global {% d => ({scope: 'persistent global', loc:getLoc(d[0], d[2])})%}
    # Direct assignment on declaration
    # TODO: LOCATION
    decl_args
        -> decl
        | decl ( (_S "," _) decl ):+ {% d =>{ return merge(d[0], collectSub(d[1], 1)); }%}
    decl
        -> var_name                {% d => ({type:'Declaration', id:d[0]}) %}
        | var_name (_S "=" _) expr {% d => ({type:'Declaration', id:d[0], value: d[2]}) %}
#---------------------------------------------------------------
#ASSIGNEMENT --- OK
    assignment
    -> destination (_S %assign _) expr
        {% d => ({
            type:     'AssignmentExpression',
            operator: d[1][1],
            operand:  d[0],
            value:    d[2]
        })%}
    #assignSym -> ("="|"+="|"-="|"*="|"/=")
    destination
        -> var_name {% id %}
        | property  {% id %}
        | index     {% id %}
        | path_name {% id %}

#---------------------------------------------------------------
# MATH EXPRESSION ---  PARTIAL OPERATOR PRECEDENCE....
    # includes "as" operator, for simplicity
    math_expr
        -> math_operand _S  %math _ (math_operand | math_unary)
        {% d => ({
            type:     'MathExpression',
            operator: d[2],
            left:     d[0],
            right:    d[4][0]
        })%}
        | math_expr    _S  %math _ (math_operand | math_unary)
        {% d => ({
            type:     'MathExpression',
            operator: d[2],
            left:     d[0],
            right:    d[4][0]
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
            right:    d[4]
        } )%}
        | math_unary {% id %}

    math_unary -> "-" math_operand
        {% d => ({
            type: 'UnaryExpression',
            operator: d[0],
            right:    d[1]
        }) %}

    math_operand
        -> operand   {% id %}
        | fn_call    {% id %}
        #| conversion {% id %}
        #| math_expr #recursion!

    # mathSym -> %math {% id %}
#---------------------------------------------------------------
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
#---------------------------------------------------------------
# CONVERSION - DISABLED
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
            right:    d[4][0]
        }) %}
        | logical_expr _S %kw_compare _  (not_operand | logical_operand)
        {% d => ({
            type :    'LogicalExpression',
            operator: d[2],
            left:     d[0],
            right:    d[4][0]
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
#---------------------------------------------------------------
# COMPARE EXPRESSION --- OK
    compare_expr
        -> compare_operand _S %comparison _ compare_operand
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
    # compareSym -> ("=="|"!="|">" |"<" |">="|"<=") {% id %}
#---------------------------------------------------------------
# FUNCTION CALL --- OK
    fn_call
        -> operand _S call_params
        {% d => ({
            type:  'CallExpression',
            calle: d[0],
            args:  d[2]
        })%}
    # up to an end of line or lower precedence token?
    call_params
        -> fn_call_args #{% id %}
         | call_params _S fn_call_args {% d => [].concat(d[0], d[2]) %}

    fn_call_args -> operand {% id %} | parameter {% id %}
#---------------------------------------------------------------
# PARAMETER CALL --- OK
    parameter -> param_name _ operand
        {% d => ({
            type: 'ParameterAssignment',
            param: d[0],
            value: d[2],
            //loc: d[0].loc
        })%}
    param_name -> %params _S ":" {% d => d[0] %}
#---------------------------------------------------------------
# OPERANDS --- OK
    operand
        -> factor     {% id %}
        | property    {% id %}
        | index       {% id %}
#---------------------------------------------------------------
# ACCESSOR - PROPERTY --- OK #TODO: Avoid capturing operand?
    property -> operand %delimiter var_name
        {% d => ({
            type:     'AccessorProperty',
            operand:  d[0],
            property: d[2],
            loc:      getLoc(d[0], d[1])
        })%}
#---------------------------------------------------------------
# ACCESSOR - INDEX --- #TODO: Avoid capturing operand?
    index -> operand _ p_start expr p_end
        {% d => ({
            type:    'AccessorIndex',
            operand: d[0],
            index:   d[3],
            loc:     getLoc(d[0], d[4])
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
        | point4     {% id %}
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
        # | "-" expr   {% d => ({type: 'UnaryExpression', operator: d[0], operand: d[1], }) %} #{% d => ({type: 'UnaryExpression', operand: d[1], loc: getLoc(d[0])}) %}
        #last listener result
        | expr_seq   {% id %} # HERE IS WHERE THE ITERATION HAPPENS
        | %error     {% id %}
        | "?" {% d => ({type: 'Keyword', value: d[0]}) %} #{% d => ({type: 'Keyword', value: d[0].value, loc: getLoc(d[0])}) %}
# RESERVED KEYWORDS
    kw_reserved
        -> %kw_uicontrols  {% id %}
        | %kw_objectset    {% id %}
        | %kw_time         {% id %}
        | %kw_group        {% id %}
        # | %kw_return
        # | %kw_throw
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
            elements: [].concat(d[1], d[3], d[5], d[7]),
            loc: getLoc(d[0], d[8])
        }) %}
    point3
        -> p_start expr (_S "," _) expr (_S "," _) expr p_end
        {% d => ({
            type: 'ObjectPoint3',
            elements: [].concat(d[1], d[3], d[5]),
            loc: getLoc(d[0], d[6])
        }) %}
    point2
        -> p_start expr (_S "," _) expr p_end
        {% d => ({
            type: 'ObjectPoint2',
            elements: [].concat(d[1], d[3]),
            loc: getLoc(d[0], d[4])
        }) %}

    p_start -> "[" _  {% d => d[0]%}
    p_end   -> _ "]" {% d => d[1]%}
#===============================================================
# ARRAY --- OK
    array
        -> %arraydef _ %rparen
            {% d => ({
                type:      'ObjectArray',
                elements:  [],
                loc:       getLoc(d[0], d[2])
            }) %}
        | (%arraydef _) array_expr (_ %rparen)
            {% d => ({
                type:     'ObjectArray',
                elements: d[1],
                loc:      getLoc(d[0][0], d[2][1])
            }) %}

        array_expr
        -> expr {% id %}
         | array_expr (_ "," _) expr {% d => [].concat(d[0], d[2]) %}
#---------------------------------------------------------------
# BITARRAY --- OK
    bitarray
    -> %bitarraydef _ %rbrace
        {% d => ({
            type:     'ObjectBitArray',
            elements: [],
            loc:      getLoc(d[0], d[2])
        }) %}
    | ( %bitarraydef _) bitarray_expr (_ %rbrace)
        {% d => ({
            type:     'ObjectBitArray',
            elements: d[1],
            loc:      getLoc(d[0][0], d[2][1])
        }) %}

    bitarray_expr
    -> bitarray_item {% id %}
    | bitarray_expr (_ "," _) bitarray_item {% d => [].concat(d[0], d[2]) %}

    # TODO: Fix groups
    bitarray_item
        -> expr {% id %}
        |  expr (_S %bitrange _) expr {% d => ({type: 'BitRange', start: d[0], end: d[2]}) %}
#===============================================================
# TOKENS
#===============================================================
    # time
    time -> %time
        {% d => ({ type: 'Literal', value: d[0] }) %}
    # Bool
    bool
        -> %kw_bool
        {% d => ({ type: 'Literal', value: d[0] }) %}
        | %kw_on
        {% d => ({ type: 'Literal', value: d[0] }) %}
    # Void values
    void -> %kw_null
        {% d => ({ type: 'Literal', value: d[0] }) %}
    #---------------------------------------------------------------
    # Numbers
    number -> number_types
        {% d => ({ type: 'Literal', value: d[0] }) %}
    number_types
        -> %number  {% id %}
         | %hex     {% id %}
    # string
    string -> %string
        {% d => ({ type: 'Literal', value: d[0] }) %}
    # names
    name_value -> %name
        {% d => ({ type: 'Literal', value: d[0] }) %}
    #Resources
    resource -> %locale
        {% d => ({ type: 'Literal', value: d[0] }) %}
#===============================================================
# VARNAME --- IDENTIFIERS --- OK
    # some keywords can be var_name too...
    var_name -> var_type
        {% d => ({ type: 'Identifier', value: d[0] }) %}
    var_type
        -> %identity     {% id %}
         | %global_typed  {% id %}
         | kw_reserved    {% id %}
        #  | %kw_objectset {% id %}
#===============================================================
# PATH NAME
    # pathname cheat
    # path_name -> "$" | "$" alphanum {% d => d.join('') %}
    #---------------------------------------------------------------
    # THIS JUST CAPTURES ALL THE LEVEL PATH IN ONE TOKEN....
    path_name -> %path
        {% d => ({ type: 'Identifier', value: d[0] }) %}
    #---------------------------------------------------------------
    # path -> (%kw_objectset):? ("/"):? (levels):? level_name
    # levels -> level | levels "/" level
    # level -> level_name {% id %}
    # level_name -> # MISSING
#===============================================================
#PARENS
    LPAREN ->  %lparen _    {% d => d[0] %}
    RPAREN ->  ___ %rparen  {% d => d[1] %}
    # voidparens -> %lparen  %rparen    #{% d => d[0] %} #{% d => ({type:'Empty'}) %}
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
    _S_ -> ws {% d => null %} | _S_ ws  {% d => null %}
    # zero or any withespace
    _S -> null | _S ws  {% d => null %}
    # one or more whitespace with NL
    __ -> ws {% d => null %} | __ junk {% d => null %}
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