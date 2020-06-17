
const fs = require('fs');
const path = require('path');
//-----------------------------------------------------------------------------------
const mxsParseSource = require('./mxsParser.js');
const { FileWrite, JsonFileWrite, readDirR } = require('./utils.js');
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
	// JsonFileWrite('test/_tokens.json',TokenizeSource(source(src)));
	try {
		var mxsParser = new mxsParseSource(source(src));
		// mxsParser.__parseWithErrors();
		JsonFileWrite('test/CST.json', mxsParser.parsedCST);
		return mxsParser.parsedCST;
	} catch (err) {
		// console.log(err);
		// FileWrite('test/error.txt', err.message);
		throw err;
	}
}
//-----------------------------------------------------------------------------------
// COMPRESS CODE
//-----------------------------------------------------------------------------------
function minify(source) {
	try {
		return visit(source, visitorPatterns);
	} catch (err) {
		console.log(err.message);
		throw err;
	}
}
//-----------------------------------------------------------------------------------
function transfPath(fp) {
	let file = path.basename(fp);
	let dir = path.dirname(fp);
	let ex = path.extname(fp);
	if (ex === '.ms' | ex === '.mcr') {
		let nf = path.join(dir, 'min_' + file);
		return nf;
	}
	return;
}
//-----------------------------------------------------------------------------------
function parseAndMinify (fPath) {
	let min = minify(Main(fPath));
	let fp = transfPath(fPath);
	if (fp) {
		FileWrite(fp, min);
		console.log('Success');
	}
}
//-----------------------------------------------------------------------------------
// parseAndMinify('/modules/refGuidesCfg.ms');
let CST = Main(examples[1]);
// let CST = Main('examples/refGuidesObject.ms');
/*
let scripts = readDirR('examples');
scripts.forEach((fp, i) => {

	let file = path.basename(fp);
	let dir = path.dirname(fp);
	let ex = path.extname(fp);
	if (ex === '.ms' | ex === '.mcr') {
	// if (ex === '.ms' ) {
		if (!(/^min_/gmi.test(file))) {
			console.log(i + ': ' + file);
			
			let nf = path.join(dir, 'min', 'min_' + file);

			let CST = Main(fp);

			let COMPRESS = minify(CST);
			FileWrite(nf, COMPRESS);

			console.log('---------------');
		}
	}
});
// */
//-----------------------------------------------------------------------------------
// CODE MINIFIER TEST
// let CST = Main('examples/example-1.ms');
// let COMPRESS = minify(CST);
// FileWrite('test/compress.ms', COMPRESS);
//-----------------------------------------------------------------------------------
// At end of your code
const results = perf.stop();
console.log(results.time);  // in milliseconds