//import * as fs from 'fs';
// import nearley from 'nearley';
// import mxLexer from './mooTokenize.js';
// import * as grammar from './grammar.js';

const fs = require('fs');
const fsi = require('mz/fs');
//-----------------------------------------------------------------------------------
const nearley = require('nearley');
const grammar = require('./grammar.js');
const mxLexer = require('./mooTokenize.js')
//-----------------------------------------------------------------------------------
const {
	find,
	get,
	set,
	drop,
	info,
	del,
	arrayFirstOnly,
	traverse,
} = require('ast-monkey');
const traverse2 = require('ast-monkey-traverse-with-lookahead');
const { pathNext, pathPrev, pathUp } = require('ast-monkey-util');
const objectPath = require("object-path");
//-----------------------------------------------------------------------------------
const { parser } = require('./mxsParser.js');
const mxParser = require('./mxsParser.js');
//-----------------------------------------------------------------------------------
const JsonFileWrite = (file, source) =>
{
	fs.writeFileAsync(file, JSON.stringify(source, null, "    "),
	err => {
		if (err)
			console.error(err);
		return;
	});
};
//-----------------------------------------------------------------------------------
/**
 * vscode.SymbolInformation equivalent
 */
class vscodeSymbolInformation {
	constructor(name, kind, container, loc) {
		this.name = name;
		this.kind = kind;
		if (container != null) this.containerName = container;
		this.location = loc;
	}
};
//-----------------------------------------------------------------------------------
/**
 * Maps values from type > vcode kind enumeration
 */
const SymbolKind = {
	'EntityRcmenu': 18,
	'EntityRcmenu_submenu': 8,
	'EntityRcmenu_separator': 18,
	'EntityRcmenu_menuitem': 8,
	'EntityPlugin': 18,
	'EntityPlugin_params': 18,
	'PluginParam': 8,
	'EntityTool': 18,
	'EntityUtility': 18,
	'EntityRollout': 18,
	'EntityRolloutGroup': 18,
	'EntityRolloutControl': 8,
	'EntityMacroscript': 18,
	'Struct': 22,
	'Event': 23,
	'Function': 5,
	'AssignmentExpression': 12,
	'CallExpression': 5,
	'ParameterAssignment': 12,
	'AccessorProperty': 6,
	'AccessorIndex': 6,
	'Literal': 13,
	'Identifier': 12,
	'VariableDeclaration': 12,
	'Include': 1,
};
//-----------------------------------------------------------------------------------
/**
 * Types: Block statements
 */
const blockStatements = [
	'Struct',
	'Function',
	'EntityMacroscript',
	'EntityRollout',
	'EntityRolloutControl',
	'EntityUtility',
	'EntityTool',
	'EntityPlugin',
	'EntityRcmenu',

	'VariableDeclaration',
];
/**
 * Types: Expression, one-line statements only
 */
const plainScript = [];
/**
 * Implementations, references..
 */
const usageExpressions = [
	'Itentifier',
	'CallExpression',
];
//const statements = [];
//const calls = [];
//-----------------------------------------------------------------------------------
/**
 * Retrieve an object-path notation pruning n branches/leafs
 * Partially extracted from ast-monkey-util
 * @param {string} path The path of the current node/key
 * @param {int} level Level to retrieve
 */
function parentPath (path, level = 1) {
	if (typeof path === "string") {
		// AST must have at least two dots:
		if (!path.includes(".") || !path.slice(path.indexOf(".") + 1).includes(".")) {
			// zero is the root level's first element
			return "0";
		};
		return (
			path.split('.').slice(0, -level).join('.')
		);
	}
};
//-----------------------------------------------------------------------------------
/**
 * Looks for a key in the inmediate parent, going up the tree, returns the value of the first match, if any.
 * @param {object} ast The AST
 * @param {string} path The path of the current node/leaf
 */
const findParentName = (ast, path, key = 'id.value.value') =>
{
	// this is faster than using ats-money find method
	let roots = path.split('.');
	let i = roots.length;
	do {
		let thePath = roots.slice(0, i).join('.').concat('.', key);
		let theNode =  objectPath.get(ast, thePath);

		if (theNode != null) return theNode;

		i = i - 1;
	} while (i > 0);
};
//-----------------------------------------------------------------------------------
/**
 * Functions for getting the range of a statement. Grouped in a static class for coherency
 */
class range {
	static getRange (start, end) {
		return {
			start: start,
			end: end
		}
	};
	static FromStartEndOffsets = (startOff, endOff, value1) =>
	{
		return {
			start: startOff,
			end: endOff + (value1.length - 1)
		}
	};
	static FromOffset = (offset, value) =>
	{
		return {
			start: offset,
			end: (offset + (value.length - 1))
		}
	};
	// Get the range of the statement from the offset of the first and last child of the node
	static FromChilds = (node) =>
	{
		let paths = [];
		// traverse the node to collect first and last child offset
		traverse2(node, (key1, val1, innerObj, stop) =>
		{
			const current = val1 != null ? val1 : key1;
			if ( key1 === "offset" ) {
				paths.push( parentPath(innerObj.path) );
			}
			return current;
		});
		// Childs
		let start = objectPath.get(node, paths[0]).offset;
		let last = objectPath.get(node, paths[paths.length - 1]);

		return range.FromStartEndOffsets(start, last.offset, last.text);
	};
};
//-----------------------------------------------------------------------------------
/**
 * For each element of a object-path collection, return a valid {name|parent|kind|location} node
 * @param {object} AST the AST
 * @param {string[]} paths Collection of object-paths
 */
function collectSymbols (AST, paths)
{
	let theSymbols = [];
	paths.forEach(path => {
		// each path represent a key in the node, I need to get the path of the node
		let currentNode = objectPath.get(AST,parentPath(path))
		// Location
		// if loc.end is undefined, i will need to traverse the node anyways, so...
		let loc = currentNode.loc || range.FromChilds(currentNode);
		// each id has a type and a value, this one is the token object, so is id.value.value
		let name = currentNode.id.value.value
		// parent name is needed to provide vscode with the tree structure
		// parent will not be an object, if the node is in a parent key or array, so i need the parent of the parent.. and so on..
		let containerName = findParentName(AST, parentPath(path, 2));
		//console.log ( name+' | '+parentPath(path)+' >> '+parentPath(path, 3));
		// Kind
		let kind = SymbolKind[currentNode.type];
		//console.log( name +' >> '+ containerName);
		// parents... ? no need, they will be in the collection anyways
		let result = new vscodeSymbolInformation(name, kind, containerName, loc);

		theSymbols.push(result);
		//console.log(JSON.stringify(result,null,2));
		//return result;
	});
	return theSymbols;
};
//-----------------------------------------------------------------------------------
function collectStatementsFromAST(AST)
{
	//store the nodes
	let statements = [];
	//let calls = [];
	//traverse the AST
	traverse2(AST, (key1, val1, innerObj, stop) => {

		const current = val1 != null ? val1 : key1;

		if (!val1) {
			// going through an array, what to do here??
		} else {
			// going through a key/value pair. what to do if value is an array?
			//gathered.push(key1);
			// collects all node types in the filter.
			// I'm retrieving only the paths, because will need to get the parents location later.
			// if ( key1 === "type" && (blockStatements.includes(val1)) ) statements.push(innerObj.path);
			// I will not be using this for now, since vscode only cares about definitions, I can later reference-search that definition
			// if ( key1 === "type" && (usageExpressions.includes(val1)) ) calls.push(innerObj.path);
			if ( key1 === "id" ) statements.push(innerObj.path);
		}
		return current;
	});
	return statements;
};
//-----------------------------------------------------------------------------------
/* NOTES
	- use identifier to feed symbolprovider
	- use nearley for outliner and lint
	- use all tokens for uglyfier.. or parser result??
	- maybe I can use the traverse on function to find the offset of the last char?
	ImplementationProvider
	The implementation provider interface defines the contract between extensions and the go to implementation feature.
	Definition
The definition of a symbol represented as one or many locations. For most programming languages there is only one location at which a symbol is defined.

Definition: Location | Location[]

DefinitionLink
Information about where a symbol is defined.

Provides additional metadata over normal location definitions, including the range of the defining symbol

DefinitionLink: LocationLink

DefinitionProvider
The definition provider interface defines the contract between extensions and the go to definition and peek definition features.

METHODS
provideDefinition(document: TextDocument, position: Position, token: CancellationToken): ProviderResult<Definition | DefinitionLink[]>

TypeDefinitionProvider
The type definition provider defines the contract between extensions and the go to type definition feature.

ReferenceProvider
The reference provider interface defines the contract between extensions and the find references-feature.

*/

//-----------------------------------------------------------------------------------
// /*
async function Main(source) {
	await mxParser.ParseSource(source, parser, 0)
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

//-----------------------------------------------------------------------------------
// TRAVERSE THE ATS
//-----------------------------------------------------------------------------------
var input_file = 'examples/example-3.ms';
// var input_file = 'ast.json';

const source = (fsi.readFileSync(input_file, 'utf8')).toString();

// let AST = mxParser.ParseSource(source, mxParser.parser, 0)
var AST;
Main(source).then( result => {AST = result});

console.log(AST);
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
		// For example, a.1.b would be: AST object's key a > value is an array,
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


let ASTstatements = collectStatementsFromAST(AST);
let vscodeSymbols = collectSymbols(AST, ASTstatements);

console.log(vscodeSymbols);
// */

//-----------------------------------------------------------------------------------
//console.log('TERMINATED!!!\n');