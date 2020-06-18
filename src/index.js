
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
// parseAndMinify('examples/modules/maptoolsCore.ms');
// parseAndMinify('examples/common/corelib.ms');
let CST = Main(examples[2]);

/**
 * Check if value is node
 * @param {any} node CST node
 */
function isNode(node) {
	return (typeof node === 'object' && node != undefined);
}
/**
 * filter nodes by type property
 * @param {any} node CST node
 */
function getNodeType(node) {
	return ('type' in node) ? node.type : undefined;
}

function visitor(node, callback) {
	let stack = [];
	// _visit(node, null, null, 0, stack );
	// _visit(node, null, null, 0, 0);
	_visit(node, null, null, 0)
	// console.log();
	function _visit(node, parent, key, level = 0) {

		if ('id' in node ) {	
			console.log (node.type);
		}

		// let childStack = [];
		// get the node keys
		const keys = Object.keys(node);
		// loop through the keys
		for (let i = 0; i < keys.length; i++) {
			// child is the value of each key
			let key = keys[i];
			const child = node[key];
			// could be an array of nodes or just an object
			if (Array.isArray(child)) {
				// value is an array, visit each item
				// let collection = [];

				for (let j = 0; j < child.length; j++) {
					// visit each node in the array
					if (isNode(child[j])) {
						 _visit(child[j], node, key, level + 1)
					}
				}
				// childStack = childStack.concat(collection);

			} else if (isNode(child)) {
				_visit(child, node, key, level + 1);
			} else {				
				// keys that contains values...
			}
		}
	}
}

let stack = [];

let lastIndex = 0;
let cstlevel = 0;

let statements = visitor(CST, (node, level) => {

	// console.log(lastIndex +' : '+ level);

	if (level > lastIndex) {
		// child -> increase level
		cstlevel++;

		// console.log('> ' + node.type);	

	} else if (level == lastIndex) {
		// sibling, push in the same level
		// console.log('= ' + node.type);		
	} else {
		// console.log('^ ' + node.type);
		cstlevel--;
		// parent  -> return a level
	}

	if (!stack[cstlevel]) {
		let newLevel = [node];
		stack.push(newLevel);
	} else {
		stack[cstlevel].push(node);
	}

	// console.log(stack[cstlevel]);
	console.log(cstlevel+ ' -> ' + node.type);
	lastIndex = level;
});
// console.log(statements);

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