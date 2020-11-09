
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
		// JsonFileWrite('test/CST.json', mxsParser.parsedCST);
		return mxsParser.parsedCST;
	} catch (err) {
		console.log(err);
		// FileWrite('test/error.txt', err.message);
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
let CST = Main(examples[1]);
let COMPRESS = minify(CST);

// FileWrite('test/compress.ms', COMPRESS);
// */
//-----------------------------------------------------------------------------------
const isNode = node => (typeof node === 'object' && node != null);
const getNodeType = node => ('type' in node) ? node.type : undefined;
function removeNode(node, parent, key, index) {
	if (index == null) {
		delete parent[key];
	} else {
		parent[key].splice(index, 1);
	}
}
//-----------------------------------------------------------------------------------
function collectStatementsR(node, keyFilter = 'id') {
	let stack = {
		type: 'main',
		id: null,
		loc: null,
		children: []
	};
	function _visit(node, parent, key, index) {
		let _node;
		if (keyFilter in node) {
			// deal with siblings....
			_node = {
				type: node.type,
				[keyFilter]: node[keyFilter],
				loc: node.loc || null,
				children: []
			};
			parent.children.push(_node);
		} else {
			_node = parent
		}
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
					if (isNode(child[j])) {
						_visit(child[j], _node, key, j)
					}
				}
			} else if (isNode(child)) {
				_visit(child, _node, key, null);
			}
		}
	}
	_visit(node, stack, null, 0);
	return stack;
}
//-----------------------------------------------------------------------------------
let SymbolKindMatch = {
	'EntityRcmenu'          : 19,
	'EntityRcmenu_submenu'  : 9,
	'EntityRcmenu_separator': 19,
	'EntityRcmenu_menuitem' : 9,
	'EntityPlugin'          : 19,
	'EntityPlugin_params'   : 19,
	'PluginParam'           : 9,
	'EntityTool'            : 19,
	'EntityUtility'         : 19,
	'EntityRollout'         : 19,
	'EntityRolloutGroup'    : 19,
	'EntityRolloutControl'  : 9,
	'EntityMacroscript'     : 19,
	'Struct'                : 23,
	'Event'                 : 24,
	'Function'              : 12,
	'AssignmentExpression'  : 6,
	'CallExpression'        : 6,
	'ParameterAssignment'   : 7,
	'AccessorProperty'      : 7,
	'AccessorIndex'         : 7,
	'Literal'               : 14,
	'Identifier'            : 7,
	'VariableDeclaration'   : 13,
	'Declaration'           : 13,
	'Include'               : 2,
};

function mapKind(type) {
	return SymbolKindMatch[type];
	//...
}

function getDocumentPositions(node) {
	return null;
	//...
}

function visitor(ast, callback) {

	function _visit(node, parent, key, index) {

		if ('id' in node) {
			let loc = getDocumentPositions(node);
			let _node = {
				name: node.id.value.toString(),
				detail: node.type,
				kind: mapKind(node.type),
				range: loc,
				selectionRange: loc,
				children: node.children
			};

			if (index != null) {
				parent[key][index] = _node;
			} else {
				parent[key] = _node;
			}
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
	_visit(ast, null, null, 0);

	console.dir(ast, {depth: null});
}
/*
let CST = Main(examples[2]);
let res = collectStatementsR(CST);
let docSymbols;
let res2 = visitor(res.children, docSymbols);
*/
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
// console.log(results.time);  // in milliseconds