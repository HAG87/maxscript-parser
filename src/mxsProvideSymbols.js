"use strict";
const traverse2 = require('ast-monkey-traverse-with-lookahead');
const objectPath = require("object-path");
//-----------------------------------------------------------------------------------
const { parentPath, findParentName } = require('./astUtils.js');
//-----------------------------------------------------------------------------------
/**
 * To vscode.SymbolInformation mapping later
 */
function vscodeSymbolInformation (name, kind, container, loc)  {
	this.name = name;
	this.kind = kind;
	this.containerName = container != undefined ? container : ' ';
	this.location = loc;
}

function errSymbolInformation (value, loc) {
	this.message = `Unexpected token: ${value}`;
	// this.tag = value;
	this.source = 'MaxScript';
	this.code = 'ERR_TOKEN';
	this.range = loc;
	this.severity = 1;
}
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
	'Function': 11,
	'AssignmentExpression': 5,
	'CallExpression': 5,
	'ParameterAssignment': 6,
	'AccessorProperty': 6,
	'AccessorIndex':6,
	'Literal': 13,
	'Identifier': 6,
	'VariableDeclaration': 12,
	'Declaration': 12,
	'Include': 1,
};
//-----------------------------------------------------------------------------------
/**
 * Functions for getting the range of a statement. Grouped in a static class for coherency
 */
class range {
	static getRange(start, end) {
		return {
			start: start,
			end: end
		};
	}
	static fromStartEndOffsets (startOff, endOff, value1) {
		return {
			start: startOff,
			end: (endOff + value1.length)
		};
	}
	static fromOffset (offset, value) {
		return {
			start: offset,
			end: (offset + value.length)
		};
	}
	// Get the range of the statement from the offset of the first and last child of the node
	static fromChilds (node) {
		let paths = [];
		// traverse the node to collect first and last child offset
		traverse2(node, (key1, val1, innerObj, stop) => {
			const current = val1 != null ? val1 : key1;
			if (key1 === "offset") {
				paths.push(parentPath(innerObj.path));
			}
			return current;
		});
		// Childs
		let start = objectPath.get(node, paths[0]).offset;
		let last = objectPath.get(node, paths[paths.length - 1]);

		return this.fromStartEndOffsets(start, last.offset, last.text);
	}
}
//-----------------------------------------------------------------------------------
//DECLARATIONS
//-----------------------------------------------------------------------------------
/**
 * collect Nodes visiting the Tree
 * collects all node types in the filter.
 * I'm retrieving only the paths, because will need to get the parents location later.
 * I will not be using this for now, since vscode only cares about definitions, I can later reference-search that definition
 *
 * @param {any} CST Abstract Syntax tree source
 * @param {object} filter Object with keys:[] to be collected.
 */
function collectStatementsFromCST(CST, filter = 'id') {
	let statements = [];
	//let result = objFromKeys(filter, []);
	//traverse the CST
	traverse2(CST, (key1, val1, innerObj) => {
		const current = val1 != null ? val1 : key1;
		if (key1 === filter) statements.push(innerObj.path);
		return current;
	});
	return statements;
}
//-----------------------------------------------------------------------------------
//TODO: Collect identifiers and calls to find references to functions, structs... decl, so on...
// establish a declaration and usage points
// get declarations in statements, set parent>child>child order, set a declaration póint and implementation points for symbol defintions, and goto

/**
 * For each element of a object-path collection, return a valid {name|parent|kind|location} node
 * @param {object} CST the CST
 * @param {string[]} paths Collection of object-paths
 */
function collectSymbols(CST, paths) {
	let theSymbols = [];
	paths.forEach(path => {
		// each path represent a key in the node, I need to get the path of the node
		let currentNode = objectPath.get(CST, parentPath(path));
		// console.log(currentNode);
		// since Im searching the tree for the id key, it should exist. more complex search will need to check for valid keys
		let theSymbol = new vscodeSymbolInformation();
		// each id has a type and a value, this one is the token object, so is id.value.value
		let name = currentNode.id.value.value;
		theSymbol.name = name !== '' ? name : '[unnamed]';
		// parent name is needed to provide vscode with the tree structure
		// parent will not be an object, if the node is in a parent key or array, so i need the parent of the parent.. and so on..
		theSymbol.containerName = findParentName(CST, parentPath(path, 2)) || '';
		// Location
		// if loc.end is undefined, i will need to traverse the node anyways, so...
		theSymbol.location = currentNode.loc || range.fromChilds(currentNode);
		// Kind
		theSymbol.kind = SymbolKind[currentNode.type];
		// parents... ? no need, they will be in the collection anyways
		// let result = new vscodeSymbolInformation(name, kind, containerName, loc);
		// theSymbols.push(result);
		theSymbols.push(theSymbol);
	});
	return theSymbols;
}
//-----------------------------------------------------------------------------------
// INVALID TOKENS
/**
 * Return errorSymbol from invalid tokens
 * @param {object} CST the CST
 */
function collectErrors(CST) {

	let theSymbols = [];
	let errTokens = [];

	traverse2(CST, (key1, val1, innerObj, stop) => {
		const current = val1 != null ? val1 : key1;
		if (key1 === 'type' && val1 === 'error') errTokens.push(innerObj.parent);
		return current;
	});
	// return if no errors
	if (errTokens.length === 0) { return;}

	theSymbols = errTokens.map(node => {
		return new errSymbolInformation(node.text, range.fromOffset(node.offset, node.text));
	});
	return theSymbols;
}
//-----------------------------------------------------------------------------------
// TODO: IMPLEMENTATIONS
//-----------------------------------------------------------------------------------
module.exports = {
	range,
	collectStatementsFromCST,
	collectSymbols,
	collectErrors,
};