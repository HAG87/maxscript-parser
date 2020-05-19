const fs = require('fs');
const fsi = require('mz/fs');
//-----------------------------------------------------------------------------------
const mxsParseSource = require('./mxsParser.js');
const { collectStatementsFromAST, collectSymbols } = require('./mxsProvideSymbols.js');
const {basicDiagnostics, correctionList} = require('./mxsProvideDiagnostics.js');
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
/* NOTES
	- use identifier to feed symbolprovider
	- use nearley for outliner and lint
	- use all tokens for uglyfier.. or parser result??

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
 /*
async function Main(source) {
	//await mxParser.ParseSource(source, parser, 0)
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
// PROVIDE SYMBOLS
//-----------------------------------------------------------------------------------
var input_file = 'examples/example-3.ms';
const source = (fsi.readFileSync(input_file, 'utf8')).toString();
// /*
try {
	let msxParser = new mxsParseSource(source);
	let AST = msxParser.parsedAST;
	//Main(source).then( result => {AST = result; });
	let ASTstatements = collectStatementsFromAST(AST);
	let vscodeSymbols = collectSymbols(AST, ASTstatements);

	console.log(vscodeSymbols);
} catch (e) {
	// ERROR PARSING INPUT, PROVIDE DIAGNOSTICS
	basicDiagnostics(e.token);
	let alt = correctionList(e.alternatives);

	console.log(alt);
}
// */
//-----------------------------------------------------------------------------------

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



//-----------------------------------------------------------------------------------
//console.log('TERMINATED!!!\n');
