"use strict";
const traverse = require('ast-monkey-traverse');
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