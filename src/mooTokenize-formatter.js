/**	
 * Simplified tokenizer for code formatting
 */
// import { keywords, compile } from 'moo';
//-----------------------------------------------------------------------------------
// CASE INSENSITIVE FOR KEYWORKDS
const caseInsensitiveKeywords = map => {
	const transform = keywords(map);
	return text => transform(text.toLowerCase());
};
//-----------------------------------------------------------------------------------
// KEYWORDS
const { keywords, compile, error } = require('moo');
const IndentationLexer = require('moo-indentation-lexer')
const { keywordsDB } = require('./keywordsDB');
const mxsAPI = require('./mxsAPI');
//-----------------------------------------------------------------------------------
// Moo Lexer
var mooLexer = compile({
	// Comments
	comment_SL: /--.*$/,
	comment_BLK: { match: /\/\*(?:.|[\n\r])*?\*\//, lineBreaks: true, },
	string: [
		{ match: /@"(?:\\"|[^"])*?(?:"|\\")/, lineBreaks: true },
		{ match: /"(?:\\["\\rntsx]|[^"])*?"/, lineBreaks: true },
	],
	// whitespace -  also matches line continuations
	WS: { match: /(?:[ \t]+|(?:[\\][ \t\r\n]+))/, lineBreaks: true },
	NL: { match: /(?:[\r\n]+)/, lineBreaks: true },

	// Identities
	param: /[A-Za-z_\p{L}][A-Za-z0-9_\p{L}]*:/,

	identity: [
		/\$'(?:[^'\n\r])*'/,
		/\$(?:[A-Za-z0-9_*?\/]|\.{3}|\\\\)*/,
		/'(?:\\['\\rn]|[^'\\\n])*?'/,
		/#[A-Za-z0-9_]+\b/,
		/#'[A-Za-z0-9_]+'/,
		/~[A-Za-z0-9_]+~/,
		/::[A-Za-z_\p{L}][A-Za-z0-9_\p{L}]*/,
		{
			match: /[&]?[A-Za-z_\p{L}][A-Za-z0-9_\p{L}]*(?![:])/,
			type: caseInsensitiveKeywords(keywordsDB)
		}
	],

	time: [
		/(?:[-]?(?:[0-9]+\.)?[0-9]+[msft])+/,
		/(?:[-]?(?:[0-9]+\.)[0-9]*[msft])+/,
		/[0-9]+[:][0-9]+\.[0-9]*/
	],
	// Parens
	arraydef: /#[ \t]*\(/,
	bitarraydef: /#[ \t]*\{/,
	emptyparens: /\([\s\t]*\)/,
	lparen: '(',
	rparen: ')',
	emptybracket: /\[[\s\t]*\]/,
	lbracket: '[',
	rbracket: ']',
	lbrace: '{',
	rbrace: '}',
	// Values

	bitrange: '..',
	number: [
		/0[xX][0-9a-fA-F]+/,
		/(?:[-]?[0-9]*)[.](?:[0-9]+(?:[eEdD][+-]?[0-9]+)?)/,
		/(?:[-]?[0-9]+\.(?!\.))/,
		/[-]?[0-9]+(?:[LP]|[eEdD][+-]?[0-9]+)?/,
		/(?:(?<!\.)[-]?\.[0-9]+(?:[eEdD][+-]?[0-9]+)?)/
	],
	// unaryminus: {match: /(?<=[^\w)-])-(?![-])/},
	// Operators
	unaryminus: [
		// preceded by WS and suceeded by non WS
		/(?<=[\s\t\n\r])[-](?![\s\t])/,
		// preceded by an operator and WS
		/(?<=['+', '-', '*', '/', '^', '==', '!=', '>', '<', '>=', '<=', '=', '+=', '-=', '*=', '/='][\s\t]*)[-]/
	],
	operator: ['+', '-', '*', '/', '^', '==', '!=', '>', '<', '>=', '<=', '=', '+=', '-=', '*=', '/='],

	// Delimiters
	delimiter: '.',
	sep: ',',
	statement: ';',
	// This contains the rest of the stack in case of error.
	error: [
		{ match: /[¿¡!`´]/, error: true },
		/[/?\\]{2,}/
	],
	// fatalError: moo.error
});
//-----------------------------------------------------------------------------------
// /*
const mxLexer2 = new IndentationLexer({
	lexer: mooLexer,
	indentationType: 'WS',
	newlineType: 'NL',
	commentType: ['comment_SL', 'comment_BLK'],
	indentName: 'indent',
	dedentName: 'dedent',
	// enclosingPunctuations: { '[': ']', '<': '>' },   // defaults {}, () and []
	enclosingPunctuations: { '(': ')', '[': ']' }
	// separators: [',']  // defaults to , : ;
})
// */
const simpleLexer = compile({
	commentSL: { match: /--.*$/, lineBreaks: false, },
	commentBLK: { match: /\/\*(?:.|[\n\r])*?\*\//, lineBreaks: true },
	string: [
		{ match: /"(?:\\["\\rntsx]|[^"])*?"/, lineBreaks: true },
		{ match: /@"(?:\\"|[^"])*?(?:"|\\")/, lineBreaks: true },
	],
	// path: /\$(?:(?:[A-Za-z0-9_*?\/]|\.{3}|\\\\)+|'(?:[^'\n\r])+')?/,
	// parameter: { match: /[A-Za-z_\p{L}][A-Za-z0-9_\p{L}]*(?=[ \t]*[:])/ },
	// parameter: /[A-Za-z_\p{L}][A-Za-z0-9_\p{L}]+:/,
	// property: { match: /\.[A-Za-z_\p{L}][A-Za-z0-9_\p{L}]*/ },
	// locale: { match: /~[A-Za-z0-9_]+~/ },
	name: [
		{ match: /#[A-Za-z0-9_]+\b/ },
		{ match: /#'[A-Za-z0-9_]+'/ }
	],
	identity: [
		{ match: /\$'(?:[^'\n\r])*'/ },
		{ match: /\$(?:[A-Za-z0-9_*?\/]|\.{3}|\\\\)*/ },
		{ match: /'(?:\\['\\rn]|[^'\\\n])*'/ },
		{ match: /~[A-Za-z0-9_]+~/ },
		{ match: /::[A-Za-z_\p{L}][A-Za-z0-9_\p{L}]*/ },
		{
			match: /[&]?[A-Za-z_\p{L}][A-Za-z0-9_\p{L}]*/,
			type: caseInsensitiveKeywords(mxsAPI)
		}
	],
	unindexed: [
		{
			match: /(?:[^\"A-Za-z_\p{L}\s\t\r\n])+/,
			lineBreaks: true
		}
	],
	ws: {
		match: /[\s\t\r\n]+/,
		lineBreaks: true
	},
	fatalError: error

});
module.exports = simpleLexer;
// module.exports = mooLexer;