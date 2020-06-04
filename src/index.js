
const fs = require('fs');
//-----------------------------------------------------------------------------------
const mxsParseSource = require('./mxsParser.js');
const { FileWrite, JsonFileWrite } = require('./utils.js');
//-----------------------------------------------------------------------------------
const { collectStatementsFromCST, collectSymbols, collectErrors } = require('./mxsProvideSymbols.js');
const { parsingErrorMessage } = require('./mxsProvideDiagnostics.js');
//-----------------------------------------------------------------------------------
// const { find, get, set, drop, info, del, arrayFirstOnly, traverse, } = require('ast-monkey');
// const { pathNext, pathPrev, pathUp } = require('ast-monkey-util');
const traverse2 = require('ast-monkey-traverse-with-lookahead');
const objectPath = require("object-path");
//-----------------------------------------------------------------------------------
const { parentPath, findParentName } = require('./astUtils.js');
const mxLexer = require('./mooTokenize.js');
const { visit, visitorPatterns } = require("./mxsCompactCode");
//-----------------------------------------------------------------------------------
const perf = require('execution-time')();
const chalk = require('chalk');
//-----------------------------------------------------------------------------------
// At beginning of your code
perf.start();
//-----------------------------------------------------------------------------------
/*
	async function Main(source) {
		//await mxParser.ParseSource(source, parser, 0)
		.then
		( result =>
			{
				console.log('Parse Success!')
				// console.log(result)
				return result;
				// Provide:
				// Symbols
				// Outliner
				// Prettifier - uglyfier.
			}
		)
		.catch
		( error =>
			{
				console.log('Parse Failed!')
				// Provide diagnostics ...
				return error;
			}
		);

	}
	//Main();
// */
//-----------------------------------------------------------------------------------
// PROVIDE SYMBOLS
//-----------------------------------------------------------------------------------
let examples = {
	// 'examples/example-0.ms',
	1:  'examples/example-1.ms',
	2:  'examples/example-2.ms',
	3:  'examples/example-3.ms',
	4:  'examples/example-4.ms',
	5:  'examples/example-5.ms',
	6:  'examples/example-6.ms',
	7:  'examples/example-7.ms',
}
//-----------------------------------------------------------------------------------
let CST = [];
//-----------------------------------------------------------------------------------

function Main(src) {
	const source = (input_file) => (fs.readFileSync(input_file, 'utf8')).toString();
	var msxParser = new mxsParseSource();
	msxParser.source = source(src);
	// console.log(source(src));
	// console.log(msxParser.TokenizeSource());
	CST = msxParser.parsedCST;

	// console.log(CST);
	JsonFileWrite('test/CST.json', CST);
	// let CSTstatements = collectStatementsFromCST( msxParser.parsedCST);
	// let vscodeSymbols = collectSymbols( msxParser.parsedCST, CSTstatements);
	// let failedTopkens = collectErrors(msxParser.parsedCST);

}
// /*
try {
	Main(examples[2])
	// examples.forEach(x => Main(x));
} catch (e) {
	// console.log(e.message);
	console.log(e.token);
	FileWrite('test/error.txt', e.message);
	// console.log(e.tokens);
	// console.log(e.details.expected);
}
// */
//-----------------------------------------------------------------------------------
// COMPRESS CODE
//-----------------------------------------------------------------------------------
function compress(source) {
	try {
		return visit(source, visitorPatterns);
	} catch (err) {
		console.log(err.message);
	}
}
// let COMPRESS = compress(CST); FileWrite('test/compress.ms', COMPRESS);
//-----------------------------------------------------------------------------------
/*
If traverse2() is currently traversing a plain object, going each key/value pair, key will be the object's current key and val will be the value.
If traverse2() is currently traversing an array, going through all elements, a key will be the current element and val will be null.

innerObj keys
{
// integer. Zero is the root, topmost level. Every level deeper increments depth by 1.
depth:
// string.
// The path to the current value.
// The path uses exactly the same notation as the popular object-path package.
// For example, a.1.b would be: CST object's key a > value is an array,
// take 1st index (second element in a row, since indexes start from zero) > value is an object, take it's key b.
path:
// When you are very deep, this is the topmost parent's key.
topmostKey:
// Type of the parent of the current element being traversed.
// A whole parent (array or a plain object) which contains the current element. Its purpose is to allow you to query the siblings of the current element.
parent:
// String. Either array if parent is array or object if parent is a plain object (not the "object" type, which includes functions, arrays etc.).
parentType:
// Array. Zero or more arrays, each representing a set of callback call arguments that will be reported next.
next:

}
*/
//-----------------------------------------------------------------------------------
// At end of your code
const results = perf.stop();
console.log(results.time);  // in milliseconds