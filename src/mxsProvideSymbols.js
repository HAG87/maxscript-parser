"use strict";
const traverse = require('ast-monkey-traverse');
// const objectPath = require("object-path");
//-----------------------------------------------------------------------------------
const { range } = require('./astUtils.js');
//-----------------------------------------------------------------------------------
function errSymbolInformation(value, loc) {
	this.message = `Unexpected token: ${value}`;
	// this.tag = value;
	this.source = 'MaxScript';
	this.code = 'ERR_TOKEN';
	this.range = loc;
	this.severity = 1;
}
//-----------------------------------------------------------------------------------
/*
If traverse() is currently traversing a plain object, going each key/value pair, key will be the object's current key and val will be the value.
If traverse() is currently traversing an array, going through all elements, a key will be the current element and val will be null.

innerObj keys
{
	// integer. Zero is the root, topmost level. Every level deeper increments depth by 1.
	depth:
	// string.
	// The path to the current value.
	// The path uses exactly the same notation as the popular object-path package.
	// For example, a.1.b would be: CST object's key a > value is an array,
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
//-----------------------------------------------------------------------------------
//DECLARATIONS
//-----------------------------------------------------------------------------------
/**
 * collect Nodes visiting the Tree
 * collects all node types in the filter.
 * I'm retrieving only the paths, because will need to get the parents location later.
 * @param {any} CST Abstract Syntax tree source
 * @param {object} filter Object with keys:[] to be collected.
 */
function collectStatementsFromCST(CST, filter = 'id') {
	let statements = [];
	//let result = objFromKeys(filter, []);
	//traverse the CST
	traverse(CST, (key1, val1, innerObj) => {
		const current = val1 != null ? val1 : key1;
		if (key1 === filter) statements.push(innerObj.path);
		return current;
	});
	return statements;
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

	traverse(CST, (key1, val1, innerObj, stop) => {
		const current = val1 != null ? val1 : key1;
		if (key1 === 'type' && val1 === 'error') errTokens.push(innerObj.parent);
		return current;
	});
	// return if no errors
	if (errTokens.length === 0) { return; }

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
	collectErrors,
};