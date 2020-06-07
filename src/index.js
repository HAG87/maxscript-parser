
const fs = require('fs');
//-----------------------------------------------------------------------------------
const mxsParseSource = require('./mxsParser.js');
const { FileWrite, JsonFileWrite } = require('./utils.js');
//-----------------------------------------------------------------------------------
// const { find, get, set, drop, info, del, arrayFirstOnly, traverse, } = require('ast-monkey');
// const { pathNext, pathPrev, pathUp } = require('ast-monkey-util');
// const traverse2 = require('ast-monkey-traverse-with-lookahead');
// const objectPath = require("object-path");
//-----------------------------------------------------------------------------------
const mxLexer = require('./mooTokenize.js');
const { visit, visitorPatterns } = require("./mxsCompactCode");
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
	1:  'examples/example-1.ms',
	2:  'examples/example-2.ms',
	3:  'examples/example-3.ms',
	4:  'examples/example-4.ms',
	5:  'examples/example-5.ms',
	6:  'examples/example-6.ms',
	7:  'examples/example-7.ms',
	8:  'examples/example-8.ms',
}
//-----------------------------------------------------------------------------------
const source = (input_file) => (fs.readFileSync(input_file, 'utf8')).toString();
//-----------------------------------------------------------------------------------
function Main(src) {
	try {
		var msxParser = new mxsParseSource();
		msxParser.source = source(src);
		JsonFileWrite('test/CST.json', msxParser.parsedCST);
		JsonFileWrite('test/TOKENS.json', msxParser.TokenizeSource());
		// let failedTopkens = collectErrors(msxParser.parsedCST);
		return msxParser.parsedCST;
	} catch (e) {
		console.log(e.token);
		try {
			let toks = msxParser.TokenizeSource();
			JsonFileWrite('test/TOKENS.json', toks);
		} catch (err2) {
			console.log(err2.message);
		}
		FileWrite('test/error.txt', e.message);
	}
}
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
let CST = Main('examples/dstlbx_run.ms');
// let COMPRESS = compress(CST); FileWrite('test/compress.ms', COMPRESS);
//-----------------------------------------------------------------------------------
// At end of your code
const results = perf.stop();
console.log(results.time);  // in milliseconds