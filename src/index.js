
const fs = require('fs');
const path = require('path');
//-----------------------------------------------------------------------------------
const {mxsParseSource} = require('./mxsParser.js');

const {TokenizeSource, TokenizeSourceFormat} = require('./mxsTokenize');

const { FileWrite, JsonFileWrite, readDirR, prefixPath } = require('./utils.js');
//-----------------------------------------------------------------------------------
// const traverse2 = require('ast-monkey-traverse');
//-----------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------
const perf = require('execution-time')();
const chalk = require('chalk');
//-----------------------------------------------------------------------------------
// At beginning of your code
perf.start();
//-----------------------------------------------------------------------------------
// PROVIDE SYMBOLS
//-----------------------------------------------------------------------------------
let examples = {
	1: './examples/example-1.ms',
	2: './examples/example-2.ms',
	3: './examples/example-3.ms',
	4: './examples/example-4.ms',
	5: './examples/example-5.ms',
	6: './examples/example-6.ms',
	7: './examples/example-7.ms',
	8: './examples/example-8.ms',
	9: './examples/example-9.ms',
	10: './examples/example-10.ms',
	11: './examples/example-11.ms',
	12: './examples/example-12.ms',
	13: './examples/example-13.ms',
	14: './examples/example-14.ms',
	15: './examples/example-15.ms',
	16: './examples/example-16.ms',
	17: './examples/example-17.ms',
	18: './examples/example-18.ms',
	19: './examples/example-19.ms',
	20: './examples/example-20.ms',
	21: './examples/example-21.ms',
}
//-----------------------------------------------------------------------------------
const source = (input_file) => (fs.readFileSync(input_file, 'utf8')).toString();
//-----------------------------------------------------------------------------------
async function Main(src) {
	try {
		let parser = new mxsParseSource(source(src));
		// parser.parseWithErrors();
		var cst = parser.parsedCST;
		JsonFileWrite('test/CST.json', cst);
		// terminate the workers...
		return cst;
	} catch (err) {
		// console.log(err.message);
		throw err;
	} finally {
		// ...
	}
}
Main(examples[19]);
// console.log(TokenizeSource(source(examples[1])));
//-----------------------------------------------------------------------------------
//	PRETTY PRINT - COMPRESS CODE
//-----------------------------------------------------------------------------------
/*
let toks = TokenizeSourceFormat(source(examples[2]));
JsonFileWrite('test/TOKENS.json', toks);
*/
// TEST
/*
Main(examples[14])
	// .then(result => console.log(result))
	.then(result => {

		JsonFileWrite('test/CST.json', result);
		function min() {
			options.indent = '';
			options.linebreak = ';';
			options.spacer = '';
			options.codeblock.newlineAllways = false;
			options.codeblock.newlineAtParens = false;
			options.codeblock.spaced = false;
			options.elements.useLineBreaks = false;
			options.statements.optionalWhitespace = true;			
		}
		// min();
		let reflow = mxsReflow(result);
		FileWrite('test/REFLOW.ms', reflow);

		console.log('done with the parser')
	;})
	.catch(error => {FileWrite('test/error.txt', error.message); console.log(error);});
// */
//-----------------------------------------------------------------------------------
// SIMPLE CODE FORMATTER: CONTEXT UNAWARE
//-----------------------------------------------------------------------------------
/*
const {mxsSimpleFormatter, mxsSimpleTextEditFormatter} = require('./mxsFormatter.js')
// let res = mxsSimpleFormatter(source(examples[2]));
let res = mxsSimpleTextEditFormatter(source(examples[2]));
FileWrite('formatted.json', JSON.stringify(res, null, 4));
*/
//-----------------------------------------------------------------------------------
// TOKENIZED FORMATTER
//-----------------------------------------------------------------------------------
/*
let toks = TokenizeSourceFormat(source(examples[2]));
JsonFileWrite('test/indented-tokens.json', toks);
let res = '';
for (const t of toks) {
	res += t.toString();
}
FileWrite('test/FORMATTED.ms', res);
*/
//-----------------------------------------------------------------------------------
// At end of your code
const results = perf.stop();
console.log('----------------------');
console.log(results.time);  // in milliseconds