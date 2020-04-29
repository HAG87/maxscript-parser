const caseCOnd = {
  'kw-case': 'case',
  'kw-of': 'of'
}
const ifCond = {
  'kw-if': 'if',
  'kw-then': 'do',
  'kw-then': 'then',
  'kw-else': 'else'
}
const forLoop = {
  'kw-for': 'for',
  'kw-to': 'to',
  'kw-in': 'in',
  'kw-by': 'by',
  'kw-where': 'where',
  'kw-do': 'do',
  'kw-collect': 'collect'
}
const tryCond = {
  'kw-try': 'try',
  'kw-catch': 'catch',
  'kw-throw': 'throw'
}
const blockDefs = {
  'kw-macroscript': 'macroscript',
  'kw-plugin': 'plugin',
  'kw-rollout': 'rollout',
  'kw-rcmenu': 'rcmenu',
  'kw-set': 'set',
  'kw-params': 'parameters',
  'kw-mousetool': 'tool',
  'kw-utility': 'utility'
}
const UIcontrols = [
  'angle', 'bitmap', 'button',
  'checkbox', 'checkbutton', 'colorpicker',
  'combobox', 'curvecontrol', 'dropdownlist',
  'edittext', 'groupBox', 'hyperLink',
  'imgTag', 'label', 'listbox',
  'mapbutton', 'materialbutton', 'multilistbox',
  'pickbutton', 'popUpMenu', 'progressbar',
  'radiobuttons', 'slider', 'spinner',
  'SubRollout', 'timer'
]
const kwContext = [
  "animate",
  "undo",
  "redraw",
  "quiet",
  "printAllElements",
  "MXSCallstackCaptureEnabled",
  "dontRepeatMessages",
  "macroRecorderEmitterEnabled"
]
var kwObjectSet = [
  'objects', 'geometry', 'lights', 'cameras', 'helpers',
  'shapes', 'systems', 'spacewarps', 'selection'
]

const keywordsDB = {
  'kw_about': 'about',
  'kw_as': 'as',
  'kw_at': 'at',
  'kw_bool': ['true', 'false', 'on', 'off'],
  'kw_by': 'by',
  'kw_case': 'case',
  'kw_catch': 'catch',
  'kw_collect': 'collect',
  'kw_compare': ['and', 'or'],
  'kw_not': 'not',
  'kw_context': kwContext,
  'kw_return': 'return',
  'kw_continue': 'continue',
  'kw_exit': 'exit',
  'kw_dontcollect': 'dontcollect',
  'kw_coordsys': 'coordsys',
  'kw_defaultAction': 'defaultAction',
  'kw_do': 'do',
  'kw_else': 'else',
  'kw_for': 'for',
  'kw_function': ['function', 'fn'],
  'kw_global': 'global',
  'kw_group': 'group',
  'kw_if': 'if',
  'kw_in': 'in',
  'kw_level': 'level',
  'kw_local': 'local',
  'kw_macroscript': 'macroscript',
  'kw_mapped': 'mapped',
  'kw_max': 'max',
  'kw_tool': 'tool',
  'kw_null': ['undefined', 'unsupplied', 'ok', 'silentValue'],
  'kw_of': 'of',
  'kw_from': 'from',
  'kw_params': 'parameters',
  'kw_persistent': 'persistent',
  'kw_plugin': 'plugin',
  'kw_rcsep': 'separator',
  'kw_rcitem': 'menuitem',
  'kw_rcsub': 'submenu',
  'kw_rcmenu': 'rcmenu',
  'kw_redraw': 'redraw',
  'kw_rollout': 'rollout',
  'kw_set': 'set',
  'kw_struct': 'struct',
  'kw_then': 'then',
  'kw_throw': 'throw',
  'kw_time': 'time',
  'kw_to': 'to',
  'kw_try': 'try',
  'kw_uicontrols': UIcontrols,
  'kw_objectset': kwObjectSet,
  'kw_utility': 'utility',
  'kw_when': 'when',
  'kw_where': 'where',
  'kw_while': 'while',
  'kw_with': 'with',
}
// OPERATORS
const compareOp = ['==', '!=', '>', '<', '>=', '<=']
const mathOp = ['+', '-', '*', '/', '^']