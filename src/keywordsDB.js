/**	
 * DB for tokenizer keywords
 */
const keywordsDB = {
	'keyword': [
		'about',
		'and',
		'angle',
		'animate',
		'as',
		'at',
		'attributes',
		'bitmap',
		'button',
		'by',
		'cameras',
		'case',
		'catch',
		'checkbox',
		'checkbutton',
		'collect',
		'colorpicker',
		'combobox',
		'continue',
		'coordsys',
		'curvecontrol',
		'defaultaction',
		'do',
		'dontcollect',
		'dontrepeatmessages',
		'dotnetcontrol',
		'dropdownlist',
		'edittext',
		'else',
		'exit',
		'false',
		'for',
		'from',
		'function', 'fn',
		'geometry',
		'global',
		'group',
		'groupbox',
		'helpers',
		'hyperlink',
		'if',
		'imgtag',
		'in',
		'label',
		'level',
		'lights',
		'listbox',
		'local',
		'macrorecorderemitterenabled',
		'macroscript',
		'mapbutton',
		'mapped',
		'materialbutton',
		'max',
		'menuitem',
		'multilistbox',
		'mxscallstackcaptureenabled',
		'not',
		'objects',
		'of',
		'off',
		'ok',
		'on',
		'or',
		'parameters',
		'persistent',
		'pickbutton',
		'plugin',
		'popupmenu',
		'printallelements',
		'private',
		'progressbar',
		'public',
		'quiet',
		'radiobuttons',
		'rcmenu',
		'redraw',
		'return',
		'rollout',
		'selection',
		'separator',
		'set',
		'shapes',
		'silentvalue',
		'slider',
		'spacewarps',
		'spinner',
		'struct',
		'submenu',
		'subrollout',
		'systems',
		'then',
		'throw',
		'time',
		'timer',
		'to',
		'tool',
		'true',
		'try',
		'undefined',
		'undo',
		'unsupplied',
		'utility',
		'when',
		'where',
		'while',
		'with'
	]
};

const UIcontrols = [
	'angle',
	'bitmap',
	'button',
	'checkbox',
	'checkbutton',
	'colorpicker',
	'combobox',
	'curvecontrol',
	'dotnetcontrol',
	'dropdownlist',
	'edittext',
	'groupbox',
	'hyperlink',
	'imgtag',
	'label',
	'listbox',
	'mapbutton',
	'materialbutton',
	'multilistbox',
	'pickbutton',
	'popupmenu',
	'progressbar',
	'radiobuttons',
	'slider',
	'spinner',
	'subrollout',
	'timer'
];
const kwContext = [
	'dontrepeatmessages',
	'macrorecorderemitterenabled',
	'mxscallstackcaptureenabled',
	'printallelements',
	'quiet',
	'redraw'
];
/*
const kwObjectSet = [
	'cameras',
	'geometry',
	'helpers',
	'lights',
	'objects',
	'selection',
	'shapes',
	'spacewarps',
	'systems'
];
*/
const keywordsTypeDB = {
	'kw_about'        : 'about',
	'kw_as'           : 'as',
	'kw_at'           : 'at',
	'kw_attributes'   : 'attributes',
	'kw_bool'         : ['true', 'false', 'off'],
	'kw_by'           : 'by',
	'kw_case'         : 'case',
	'kw_catch'        : 'catch',
	'kw_collect'      : 'collect',
	'kw_compare'      : ['and', 'or'],
	'kw_context'      : kwContext,
	'kw_animate'      :	'animate',
	'kw_coordsys'     : 'coordsys',
	'kw_defaultAction': 'defaultaction',
	'kw_do'           : 'do',
	'kw_else'         : 'else',
	'kw_exit'         : 'exit',
	'kw_for'          : 'for',
	// 'kw_from'         : 'from',
	'kw_function'     : ['function', 'fn'],
	'kw_global'       : 'global',
	'kw_group'        : 'group',
	'kw_if'           : 'if',
	'kw_in'           : 'in',
	'kw_level'        : 'level',
	'kw_local'        : 'local',
	'kw_macroscript'  : 'macroscript',
	'kw_mapped'       : 'mapped',
	'kw_menuitem'     : 'menuitem',
	'kw_not'          : 'not',
	'kw_null'         : ['undefined', 'unsupplied', 'ok', 'silentvalue'],
	// 'kw_objectset'    : kwObjectSet,
	'kw_of'           : 'of',
	'kw_on'           : 'on',
	'kw_parameters'   : 'parameters',
	'kw_persistent'   : 'persistent',
	'kw_plugin'       : 'plugin',
	'kw_rcmenu'       : 'rcmenu',
	'kw_return'       : 'return',
	'kw_rollout'      : 'rollout',
	'kw_scope'        : ['private', 'public'],
	'kw_separator'    : 'separator',
	'kw_set'          : 'set',
	'kw_struct'       : 'struct',
	'kw_submenu'      : 'submenu',
	'kw_then'         : 'then',
	'kw_time'         : 'time',
	'kw_to'           : 'to',
	'kw_tool'         : 'tool',
	'kw_try'          : 'try',
	'kw_uicontrols'   : UIcontrols,
	'kw_undo'         : 'undo',
	'kw_utility'      : 'utility',
	'kw_when'         : 'when',
	'kw_where'        : 'where',
	'kw_while'        : 'while',
	'kw_with'         : 'with',
	// 'kw_continue':    'continue',
	// 'kw_dontcollect': 'dontcollect',
	// 'kw_max':         'max',
	// 'kw_redraw':      'redraw',
	// 'kw_throw':       'throw',
};

module.exports = { keywordsDB, keywordsTypeDB };