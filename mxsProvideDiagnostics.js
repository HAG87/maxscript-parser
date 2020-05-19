const tokenTypes = {
    'ws':             'White space',
    'newline':        'New Line',
    'comment_BLK':    'Block comment',
    'comment_SL':     'Single line comment',
    'kw_exit':        '<exit> keyword',
    'kw_return':      '<return> keyword',
    'kw_set':         '<set> keyword',
    'kw_when':        '<when> keyword',
    'kw_local':       '<local> keyword',
    'kw_global':      '<global> keyword',
    'kw_persistent':  '<persistent global> keyword',
    'kw_if':          '<if> keyword',
    'kw_while':       '<while> keyword',
    'kw_do':          '<do> keyword',
    'kw_for':         '<for> keyword',
    'kw_case':        '<case> keyword',
    'kw_struct':      '<struct> keyword',
    'kw_try':         '<try> keyword',
    'kw_at':          '<at> keyword',
    'kw_in':          '<in> keyword',
    'kw_about':       '<about> keyword',
    'kw_with':        '<with> keyword',
    'kw_utility':     '<utility> declaration',
    'kw_rollout':     '<rollout> declaration',
    'kw_tool':        '<tool> declaration',
    'kw_rcmenu':      '<rcmenu> declaration',
    'kw_macroscript': '<macroscript> declaration',
    'kw_plugin':      '<plugin> declaration',
    'kw_not':         '<not> keyword',
    'kw_mapped':      '<mapped> keyword',
    'string':         'String literal',
    'path':           'pathName literal',
    'name':           'name literal',
    'arraydef':       'Array definition',
    'bitarraydef':    'BitArray definition',
    'time':           'Time literal',
    'kw_null':        'Undefined value',
    'identity':       'Identifier',
    'global_typed':   '::global reference',
    'kw_function':    'Function declaration',
    'kw_coordsys':    '<coordsys> keyword',
    'kw_context':     'Context statement',
    'kw_undo':        '<undo> keyword',
    'posint':         'Number literal <integer>',
    'negint':         'Number literal <-integer>',
    'number':         'Number literal <float>',
    'hex':            'Hex literal',
    'kw_bool':        'Boolean value <false|off>',
    'kw_on':          'Boolean value <true|on>',
    'lparen':         'Left paren <(>',
    'kw_uicontrols':  'UI control',
    'kw_objectset':   '<objectset> keyword',
    'kw_time':        '<time> keyword',
    'kw_group':       '<group> keyword'
}

// PROVIDE DIAGNOSTICS
function basicDiagnostics(token) {
	// message
	console.log(`Unexpected <${token.value}> at position: ${token.offset}`);
	// vscode diagnostics

}
function correctionList(tokenList) {
	// get a list of the types
	let unique_list =  [...new Set((tokenList).filter(item => item.type).map(item => item.type))];
	let list = Array.from(unique_list);

	let tokenDesc = list.map(item => tokenTypes[item]);
	// map the types to description...
	let str = 'It was expected one of the following:\n - ' + tokenDesc.join('\n - ');
	return str;
}

module.exports = {basicDiagnostics, correctionList}