
const fs = require('fs');
const path = require('path');
//-----------------------------------------------------------------------------------
const {mxsParseSource} = require('./mxsParser.js');

const tokenizer = require('./mxsTokenize');

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
}
//-----------------------------------------------------------------------------------
const source = (input_file) => (fs.readFileSync(input_file, 'utf8')).toString();
//-----------------------------------------------------------------------------------
async function Main(src) {
	try {
		let parser = new mxsParseSource(source(src));
		// parser.parseWithErrors();
		var cst = parser.parsedCST;
		// JsonFileWrite('test/CST.json', cst);
		// terminate the workers...
		return cst;
	} catch (err) {
		// console.log(err.message);
		throw err;
	} finally {
		// ...
	}
}
//-----------------------------------------------------------------------------------
// COMPRESS CODE
//-----------------------------------------------------------------------------------
const { mxsReflow, visit, visitorPatterns } = require("./mxsReFlow");
// const { visit, visitorPatterns } = require("./mxsCompactCode");

function minify(source) {
	try {
		return mxsReflow(source);
		// return visit(source, visitorPatterns);
	} catch (err) {
		console.log(err.message);
		throw err;
	}
}
function parseAndMinify(fPath) {
	let min = minify(Main(fPath));
	let fp = prefixPath(fPath);
	if (fp) {
		FileWrite(fp, min);
		console.log('Success');
	}
}
//-----------------------------------------------------------------------------------
// let toks = tokenizer.TokenizeSource(source(examples[2]));
// JsonFileWrite('test/TOKENS.json', toks);
// TEST
// /*
Main(examples[9])
	// .then(result => console.log(result))
	.then(result => {
		JsonFileWrite('test/CST.json', result);
		
		let reflow = mxsReflow(result);
		FileWrite('test/REFLOW.ms', reflow);

		console.log('done with the parser')
	;})
	.catch(error => {FileWrite('test/error.txt', error.message); console.log(error);});
// 
// JsonFileWrite('test/CST.json', CST);
// let COMPRESS = minify(CST);


// */
//-----------------------------------------------------------------------------------
// SIMPLE CODE FORMATTER: CONTEXT UNAWARE
/*
const {mxsSimpleFormatter, mxsSimpleTextEditFormatter} = require('./mxsFormatter.js')
// let res = mxsSimpleFormatter(source(examples[2]));
let res = mxsSimpleTextEditFormatter(source(examples[2]));
FileWrite('formatted.json', JSON.stringify(res, null, 4));
*/
//-----------------------------------------------------------------------------------
// At end of your code
const results = perf.stop();
console.log('----------------------');
console.log(results.time);  // in milliseconds