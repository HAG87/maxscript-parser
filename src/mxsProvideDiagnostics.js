"use strict";
const {tokenDefinitions} = require('./tokenDictionary.js');
// PROVIDE DIAGNOSTICS
/**
 * Provide basic error message
 * @param {token} token Offending token, from error
 */
const basicDiagnostics = (token) => { return `Unexpected \\"${token.value}\\" at position: ${token.offset}`; };
/**
 * Provide a message that list possible solutions
 * @param {token[]} tokenList List of possible tokens
 */
const correctionList = (tokenList) => {
	// get a list of the types
	let unique_list = [...new Set((tokenList).filter(item => item.type).map(item => item.type))];
	let list = Array.from(unique_list);

	let tokenDesc = list.map(item => tokenDefinitions[item]);
	// map the types to description...
	let str = 'It was expected one of the following:\n - ' + tokenDesc.join('\n - ');
	return str;
};
// diagnostics generic message
function parsingErrorMessage(error) {
	return ([].concat(basicDiagnostics(error.token), correctionList(error.alternatives)).join('\n'));
}
// vscode diagnostics

module.exports = { parsingErrorMessage };