// moo tokenizer
// const moo = require('moo-ignore');
const moo = require('moo');
const { keywordsTypeDB } = require('./keywordsDB');
//-----------------------------------------------------------------------------------
// CASE INSENSITIVE FOR KEYWORKDS
const caseInsensitiveKeywords = map => {
	const transform = moo.keywords(map);
	return text => transform(text.toLowerCase());
};
//-----------------------------------------------------------------------------------
// Moo Lexer
module.exports = {
	// Comments
	comment_SL: /--.*$/,
	comment_BLK: { match: /\/\*(?:.|[\n\r])*?\*\//, lineBreaks: true, },

	// strings
	string: [
		{ match: /@"(?:\\"|[^"])*?(?:"|\\")/, lineBreaks: true },
		{ match: /"(?:\\["\\rntsx]|[^"])*?"/, lineBreaks: true },
		// { match: /"""[^]*?"""/, lineBreaks: true, value: x => x.slice(3, -3)},
	],

	// Strings ~RESOURCE~
	locale: /~[A-Za-z0-9_]+~/,

	// whitespace -  also matches line continuations
	ws: [
		{ match: /\\(?:[ \t]*[;\r\n]+)/, lineBreaks: true },
		/[ \t]+/
	],

	// newline: { match: /(?:[\r\n]|[\\]\s*[\r\n])+/, lineBreaks: true },
	newline: { match: /(?:[;\r\n]+)/, lineBreaks: true },

	// path_name $mounstrosity*/_? /\$(?:(?:[A-Za-z0-9_*?\/]|\.{3}|\\\\)+|'(?:[^'\n\r])+')?/
	path: [
		{ match: /[$]['](?:[^'])+[']/, lineBreaks: true },
		/[$](?:[A-Za-z0-9_*?/]|\.{3}|\\[\\/"'])+/,
		'$'
	],

	// Identifiers
	identity: [
		/['](?:\\['\\rn]|[^'\\\n])*?[']/,
		/::[A-Za-z_\u00C0-\u00FF][A-Za-z0-9_\u00C0-\u00FF]*/,
		{
			match: /[&]?[A-Za-z_\u00C0-\u00FF][A-Za-z0-9_\u00C0-\u00FF]*/,
			// match: /[&]?[A-Za-z_\u00C0-\u00FF][A-Za-z0-9_\u00C0-\u00FF]*(?![:.])/,
			type: caseInsensitiveKeywords(keywordsTypeDB)
		},
	],

	// #name literals
	name: [
		/#[A-Za-z0-9_]+/,
		/#['][A-Za-z0-9_]+[']/
	],

	// Symbols
	amp:   '?',
	sharp: '#',

	// Parens	
	lparen:   '(',
	rparen:   ')',
	lbracket: '[',
	rbracket: ']',
	lbrace:   '{',
	rbrace:   '}',

	// Operators.
	comparison: ['==', '!=', '>', '<', '>=', '<='],
	assign: ['=', '+=', '-=', '*=', '/='],
	math: ['+', '-', '*', '/', '^'],

	// Time format
	time: [
		/(?:(?:[0-9]+[.])?[0-9]+[mMsSfFtT])+/,
		/(?:(?:[0-9]+[.])[0-9]*[mMsSfFtT])+/,
		/[0-9]+[:][0-9]+[.][0-9]*/
	],

	// Delimiters
	bitrange:  '..',
	delimiter: '.',
	sep:       ',',
	param:     ':',

	// Number formats
	number: [
		/0[xX][0-9a-fA-F]+/,
		/(?:[0-9]*)[.](?:[0-9]+(?:[eEdD][+-]?[0-9]+)?)/, // 123.123d-6
		/(?:[0-9]+\.(?!\.))/, // 123.
		/[0-9]+(?:[lLpP]|[eEdD][+-]?[0-9]+)?/, // 456 | 123e-5 | integers
		/(?:(?<!\.)\.[0-9]+(?:[eEdD][+-]?[0-9]+)?)/ // -.789e-9
	],

	// COMPLETE WITH UNWANTED CHARS HERE THAT CAN BREAK THE TOKENIZER
	// This contains the rest of the stack in case of error.
	// fatalError: moo.error
	error: [
		{ match: /[¿¡!`´]/, error: true },
		// { match: /[/?\\]{2,}/ },
		{ match: /.+/}, //match any character left
	]
};
