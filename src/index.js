
const fs = require('fs');
const path = require('path');
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
const {TokenizeSource} = require('./mxsTokenize.js')
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
	JsonFileWrite('test/_tokens.json',TokenizeSource(source(src)));
	try {
		var mxsParser = new mxsParseSource(source(src));
		// mxsParser.__parseWithErrors();
		// JsonFileWrite('test/CST.json', mxsParser.parsedCST);
		return mxsParser.parsedCST;
	} catch (e) {
		console.log(e);
		// FileWrite('test/error.txt', e.message);
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
		throw err;
	}
}
let CST = Main(examples[5]);
// let CST = Main('examples/common/corelib.ms');
/*
const directoryPath = 'examples';
fs.readdir(directoryPath, function (err, files) {
    //handling error
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    }
    //listing all files using forEach
    files.forEach(function (file) {
		// Do whatever you want to do with the file
		let f = path.join(directoryPath, file);
		console.log(file);
		Main(f);

    });
});
// */
//-----------------------------------------------------------------------------------
// CODE MINIFIER TEST
// let COMPRESS = compress(CST);
// FileWrite('test/compress.ms', COMPRESS);
//-----------------------------------------------------------------------------------
// At end of your code
const results = perf.stop();
console.log(results.time);  // in milliseconds