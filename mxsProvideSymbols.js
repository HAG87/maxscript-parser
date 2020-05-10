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
const { parentPath } = require('./astUtils.js')
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
module.exports = {
    range,
    collectStatementsFromAST,
    collectSymbols,
}