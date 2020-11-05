
const fs = require('fs');
const path = require('path');
//-----------------------------------------------------------------------------------
const mxsParseSource = require('./mxsParser.js');
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
}
//-----------------------------------------------------------------------------------
const source = (input_file) => (fs.readFileSync(input_file, 'utf8')).toString();
//-----------------------------------------------------------------------------------
function Main(src) {
	// JsonFileWrite('test/_tokens.json',TokenizeSource(source(src)));
	try {
		// TokenizeSource(source(src));
		var mxsParser = new mxsParseSource(source(src));
		// mxsParser.__parseWithErrors();
		JsonFileWrite('test/CST.json', mxsParser.parsedCST);
		return mxsParser.parsedCST;
	} catch (err) {
		console.log(err);
		FileWrite('test/error.txt', err.message);
		throw err;
	}
}
//-----------------------------------------------------------------------------------
// COMPRESS CODE
//-----------------------------------------------------------------------------------
const { visit, visitorPatterns } = require("./mxsReFlow");

function minify(source) {
	try {
		return visit(source, visitorPatterns);
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
// TEST
// /*
let CST = Main(examples[2]);
let COMPRESS = minify(CST);

// FileWrite('test/compress.ms', COMPRESS);
// */
//-----------------------------------------------------------------------------------
function collectStatementsR(node) {
	return _visit(node, null, null, 0, 0);
	function _visit(node, parent, key, level = 0) {
		let childStack = [];
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
				for (let j = 0; j < child.length; j++) {
					// visit each node in the array
					if (isNode(child[j])) {
						let res = _visit(child[j], node, key, level + 1)
						if (res) childStack = childStack.concat(res);
					}
				}
			} else if (isNode(child)) {
				let res = _visit(child, node, key, level + 1);
				if (res) childStack = childStack.concat(res);
			} else {
				// keys that contains values...
			}
		}
		// if (isNode(node) && childStack.length > 0) {
		// }
		if ('id' in node) {
			return { node: node, childs: childStack };
		} else {
			if (childStack.length > 0) {
				// console.log(childStack.length);
				return childStack
			}
			else return;
		}
	}
}
//-----------------------------------------------------------------------------------
const isNode = node => (typeof node === 'object' && node != null);
const getNodeType = node => ('type' in node) ? node.type : undefined;

function visitor(ast, callback) {

	function _visit(node, parent, key, index = 0) {
		if ('id' in node || 'type' in node) {
			console.log(node.type);
			const nodeType = getNodeType(node);
			// callback[nodeType](node, parent, index);
			callback(node, parent, index);
		}
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
				for (let j = 0; j < child.length; j++) {
					// visit each node in the array
					if (isNode(child[j])) {
						_visit(child[j], node, key, j)
					}
				}
			} else if (isNode(child)) {
				_visit(child, node, key);
			}
		}
	}
	_visit(ast, null, null, 0)
}

function transformStatements(nodes) {
	let _transformStatements = (node) => {
		let SymbolCollection = [];
		for (node of nodes) {

			let theSymbol = {
				name: node.node.id.value.toString(),
				childs: node.childs.length > 0 ? transformStatements(node.childs) : []
			}

			SymbolCollection.push(theSymbol);
		}
		return SymbolCollection;
	}
	return _transformStatements(node);
}
/*
let cst = Main(examples[2]);
visitor(cst,
	node => {
		console.log(JSON.stringify(node, null, 2));
	});
*/
//-----------------------------------------------------------------------------------

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
console.log(results.time);  // in milliseconds