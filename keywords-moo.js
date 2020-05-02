export const caseCOnd = {
  'kw-case': 'case',
  'kw-of':   'of'
}
export const ifCond = {
  'kw-if':   'if',
  'kw-then': 'do',
  'kw-then': 'then',
  'kw-else': 'else'
}
export const forLoop = {
  'kw-for':     'for',
  'kw-to':      'to',
  'kw-in':      'in',
  'kw-by':      'by',
  'kw-where':   'where',
  'kw-do':      'do',
  'kw-collect': 'collect'
}
export const tryCond = {
  'kw-try': 'try',
  'kw-catch': 'catch',
  'kw-throw': 'throw'
}
export const blockDefs = {
  'kw-macroscript': 'macroscript',
  'kw-plugin':      'plugin',
  'kw-rollout':     'rollout',
  'kw-rcmenu':      'rcmenu',
  'kw-set':         'set',
  'kw-params':      'parameters',
  'kw-mousetool':   'tool',
  'kw-utility':     'utility'
}
export const UIcontrols = [
  'angle',        'bitmap',         'button',
  'checkbox',     'checkbutton',    'colorpicker',
  'combobox',     'curvecontrol',   'dropdownlist',
  'edittext',     'groupBox',       'hyperLink',
  'imgTag',       'label',          'listbox',
  'mapbutton',    'materialbutton', 'multilistbox',
  'pickbutton',   'popUpMenu',      'progressbar',
  'radiobuttons', 'slider',         'spinner',
  'SubRollout',   'timer',          'dotnetcontrol',
]
export const kwContext = [
  "animate",
  "undo",
  "redraw",
  "quiet",
  "printAllElements",
  "MXSCallstackCaptureEnabled",
  "dontRepeatMessages",
  "macroRecorderEmitterEnabled"
]
export const  kwObjectSet = [
  'objects', 'geometry', 'lights', 'cameras', 'helpers',
  'shapes', 'systems', 'spacewarps', 'selection'
]
export const changeHandlers = [
  'topology',
  'geometry',
  'name',
  'names',
  'transform',
  'select',
  'parameters',
  'subanimstructure',
  'controller',
  'children',
]
export const changeHandlersType = ['change', 'changes', 'deleted']

export const keywordsDB = {
  'kw_about':       'about',
  'kw_as':          'as',
  'kw_at':          'at',
  'kw_bool':        ['true', 'false', 'off'],
  'kw_by':          'by',
  'kw_case':        'case',
  'kw_catch':       'catch',
  'kw_collect':     'collect',
  'kw_compare':     ['and', 'or'],
  'kw_context':     kwContext,
  'kw_coordsys':    'coordsys',
  'kw_defaultAction': 'defaultaction',
  'kw_do':          'do',
  'kw_dontcollect': 'dontcollect',
  'kw_else':        'else',
  'kw_exit':        'exit',
  'kw_for':         'for',
  'kw_from':        'from',
  'kw_function':    ['function', 'fn'],
  'kw_global':      'global',
  'kw_group':       'group',
  'kw_if':          'if',
  'kw_in':          'in',
  'kw_level':       'level',
  'kw_local':       'local',
  'kw_macroscript': 'macroscript',
  'kw_mapped':      'mapped',
  'kw_menuitem':    'menuitem',
  'kw_not':         'not',
  'kw_null':        ['undefined', 'unsupplied', 'ok', 'silentvalue'],
  'kw_objectset':   kwObjectSet,
  'kw_of':          'of',
  'kw_on':          'on',
  'kw_params':      'parameters',
  'kw_persistent':  'persistent',
  'kw_plugin':      'plugin',
  'kw_rcmenu':      'rcmenu',
  'kw_return':      'return',
  'kw_rollout':     'rollout',
  'kw_scope':       ['private', 'public'],
  'kw_separator':   'separator',
  'kw_set':         'set',
  'kw_struct':      'struct',
  'kw_submenu':     'submenu',
  'kw_then':        'then',
  'kw_time':        'time',
  'kw_to':          'to',
  'kw_tool':        'tool',
  'kw_try':         'try',
  'kw_uicontrols':  UIcontrols,
  'kw_undo':        'undo',
  'kw_utility':     'utility',
  'kw_when':        'when',
  'kw_where':       'where',
  'kw_while':       'while',
  'kw_with':        'with',
  // 'kw_max':         'max',
  // 'kw_throw':       'throw',
  //'kw_continue':    'continue',
  //'kw_redraw':      'redraw',
}
// OPERATORS
export const compareOp = ['==', '!=', '>', '<', '>=', '<=']
export const mathOp = ['+', '-', '*', '/', '^']