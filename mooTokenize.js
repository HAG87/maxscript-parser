// moo tokenizer
//import moo from 'moo';
const moo = require('moo')
//-----------------------------------------------------------------------------------
// CASE INSENSITIVE FOR KEYWORKDS
const caseInsensitiveKeywords = map => {
  const transform = moo.keywords(map)
  return text => transform(text.toLowerCase())
}
//-----------------------------------------------------------------------------------
// KEYWORDS
const UIcontrols = [
  'angle',        'bitmap',         'button',
  'checkbox',     'checkbutton',    'colorpicker',
  'combobox',     'curvecontrol',   'dropdownlist',
  'edittext',     'groupBox',       'hyperLink',
  'imgTag',       'label',          'listbox',
  'mapbutton',    'materialbutton', 'multilistbox',
  'pickbutton',   'popUpMenu',      'progressbar',
  'radiobuttons', 'slider',         'spinner',
  'SubRollout',   'timer'
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
  'kw_about':       'about',
  'kw_as':          'as',
  'kw_at':          'at',
  'kw_bool':        ['true', 'false', 'on', 'off'],
  'kw_by':          'by',
  'kw_case':        'case',
  'kw_catch':       'catch',
  'kw_collect':     'collect',
  'kw_compare':     ['and', 'or'],
  'kw_not':         'not',
  'kw_context':     kwContext,
  'kw_return':      'return',
  'kw_continue':    'continue',
  'kw_exit':        'exit',
  'kw_dontcollect': 'dontcollect',
  'kw_coordsys':    'coordsys',
  'kw_defaultAction': 'defaultAction',
  'kw_do':          'do',
  'kw_else':        'else',
  'kw_for':         'for',
  'kw_function':    ['function', 'fn'],
  'kw_global':      'global',
  'kw_group':       'group',
  'kw_if':          'if',
  'kw_in':          'in',
  'kw_level':       'level',
  'kw_local':       'local',
  'kw_macroscript': 'macroscript',
  'kw_mapped':      'mapped',
  'kw_max':         'max',
  'kw_tool':        'tool',
  'kw_null':        ['undefined', 'unsupplied', 'ok', 'silentValue'],
  'kw_of':          'of',
  'kw_from':        'from',
  'kw_params':      'parameters',
  'kw_persistent':  'persistent',
  'kw_plugin':      'plugin',
  'kw_rcsep':       'separator',
  'kw_rcitem':      'menuitem',
  'kw_rcsub':       'submenu',
  'kw_rcmenu':      'rcmenu',
  'kw_redraw':      'redraw',
  'kw_rollout':     'rollout',
  'kw_set':         'set',
  'kw_struct':      'struct',
  'kw_then':        'then',
  'kw_throw':       'throw',
  'kw_time':        'time',
  'kw_to':          'to',
  'kw_try':         'try',
  'kw_uicontrols':  UIcontrols,
  'kw_objectset':   kwObjectSet,
  'kw_utility':     'utility',
  'kw_when':        'when',
  'kw_where':       'where',
  'kw_while':       'while',
  'kw_with':        'with',
}
//-----------------------------------------------------------------------------------

/*
const LETTER_REGEXP = /[a-zA-Z]/;
const isCharLetter = (char) => LETTER_REGEXP.test(char);

function textToCaseInsensitiveRegex(text) {
  const regexSource = text.split('').map((char) => {
    if (isCharLetter(char)) {
      return `[${char.toLowerCase()}${char.toUpperCase()}]`;
    }

    return char;
  });

  return new RegExp(regexSource.join(''));
};

// Use a helper
// ABS: textToCaseInsensitiveRegex('ABS')
//*/

/*
void
array #()
bitarray #{}
declarations
*/
// In order to be able to use rules like this, first I need to change All the src src to Lowers..and exclude strings...?
// OR use the "helper"
// {type:'declaration', match: /\blocal\b/},
// {type:'declaration', match: /\bglobal\b/},
// {type:'declaration', match: /\bpersistent\b(?:[ \t]+global\b)/},

// Moo Lexer
var mxLexer = moo.compile(
{
  comment: [
		  { match: /--.*?$/},
		  { match: /\/\*(?:.|[\n\r])*?\*\//, lineBreaks:true},
  ],

  string: [
    { match: /"""[^]*?"""/, lineBreaks: true, value: x => x.slice(3, -3)},
    { match: /"(?:\\["\\rn]|[^"\\])*?"/, value: x => x.slice(1, -1)},
    { match: /@"(?:\\["\\rn]|[^"\\])*?"/, value: x => x.slice(2, -1)},
  ],

  path: [
    {match: /[$](?:[a-zA-Z_\*\/\?\.]*)/},
    {match: /[$](?:['][^'\n\r]+?['])/},
   ],

  locale:    { match: /~[A-Za-z0-9_]+~/, value: x => x.slice(2, -1)},
  reference: { match: /\&/},
  // cont:     { match: /\\/},
  // ws:       { match: /[ \t]+/},
  // ws:       { match: /\s+/, lineBreaks:true },
  // o_ws: {match: /[\w][^a-zA-Z\d\s:]/, value: x => x.slice(1, -1)},
  ws: { match: /(?:[ \t]+|(?:[ \t]*?[\\][ \t\n\r]*)+?)/, lineBreaks:true},

  voidparens:   { match: /\(\)/},
  parens:   { match: /\([ \t\n\r]+\)/},

  arraydef: { match: /\#\(/},
  bitarraydef: {match: /\#\{/},

  lparen:   { match:'('},
  rparen:   { match:')'},

  lbracket: { match:'['},
  rbracket: { match:']'},
  lbrace:   { match:'{'},
  rbrace:   { match:'}'},

  time: [
    { match: /(?:(?:[0-9]+[.])*[0-9]+[msft])+/},
    { match: /[0-9]+[:][0-9]+[.][0-9]+/}
  ],
  // includes special alphanumeric chars
  identity: {
    match: /[&-]?[A-Za-z_\u00C0-\u00FF][A-Za-z0-9_\u00C0-\u00FF]*/,
    type: caseInsensitiveKeywords(keywordsDB)
  },
  typed_iden: {
    match: /'(?:\\['\\rn]|[^'\\\n])*?'/,
    value: x => x.slice(1, -1)
  },

  number: [
    { match: /(?:[-]?[0-9]*[.][0-9]+[eEdD][+-]?[0-9]+)/},
    { match: /(?:(?:[-]?[0-9]+)?\.[0-9]+)/},
    { match: /(?:[-]?[0-9]+\.(?:[0-9]+)?)/},
  ],
  negint: { match: /[-][0-9]+[LP]?/},
  posint: { match: /[0-9]+[LP]?/},

  hex: {match: /0[xX][0-9a-fA-F]+/},

  name:
  [
    { match: /#[A-Za-z0-9_]+/, value: x => x.slice(1, -1)},
    { match: /#'[A-Za-z0-9_]+'/, value: x => x.slice(2, -1)},
  ],

  //res: {match:/\?/},
  //sharp: {match: /#/},

  global_typed: { match:/::/},

  assign: [
    { match: '='  },
    { match: '+=' },
    { match: '-=' },
    { match: '*=' },
    { match: '/=' }
  ],
  comparison: [
    { match: '==' },
    { match: '!=' },
    { match: '>'  },
    { match: '<'  },
    { match: '>=' },
    { match: '<=' },
  ],
  math: [
    { match: '+' },
    { match: '-' },
    { match: '*' },
    { match: '/' },
    { match: '^' },
  ],
  // comparison: { match:compareOp},
  // math:       { match:mathOp},

  delimiter:  { match:/\./},
  sep:  { match: /\,/},


// (?:[^:]\s*)[:](?:\*s(?:[^:]|[:]{2}))
  param: {match: /\:{1}/},

  newline:      { match: /(?:\r|\r\n|\n)+/, lineBreaks: true },
  statement:    { match: /\;/},
  // [\$?`] COMPLETE WITH UNWANTED CHARS HERE THAT CAN BREAK THE TOKENIZER
  error:        { match: /[?¿¡!`]/, error: true},
});
//-----------------------------------------------------------------------------------
//export {mxLexer};
module.exports = mxLexer;











