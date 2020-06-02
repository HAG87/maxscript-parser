const fs = require('fs');
const fsi = require('mz/fs');
const chalk = require('chalk');
//-----------------------------------------------------------------------------------
const mxsParseSource = require('./mxsParser.js');
const { FileWrite, JsonFileWrite } = require('./utils.js');
//-----------------------------------------------------------------------------------
const { collectStatementsFromCST, collectSymbols, collectErrors } = require('./mxsProvideSymbols.js');
const { parsingErrorMessage } = require('./mxsProvideDiagnostics.js');
//-----------------------------------------------------------------------------------
// const { find, get, set, drop, info, del, arrayFirstOnly, traverse, } = require('ast-monkey');
// const { pathNext, pathPrev, pathUp } = require('ast-monkey-util');
const traverse2 = require('ast-monkey-traverse-with-lookahead');
const objectPath = require("object-path");
//-----------------------------------------------------------------------------------
const { parentPath, findParentName } = require('./astUtils.js');
const mxLexer = require('./mooTokenize.js');
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
// PROVIDE SYMBOLS
//-----------------------------------------------------------------------------------
let examples = [
	// 'examples/example-0.ms',
	'examples/example-1.ms',
	'examples/example-2.mcr',
	'examples/example-3_1.ms',
	'examples/example-3.ms',
	'examples/corelib.ms',
	'examples/HAG_vertexScrambler.mcr',
	'examples/HAG_faceSelID.mcr',
	'examples/HAG_gamma_adjustment.ms',
	'examples/HAG_ViewPortCompositionGuides.mcr',
	'examples/HAG_ArchScaler.mcr'
];
//-----------------------------------------------------------------------------------

let CST = [];
function Main(src) {
	const source = (input_file) => (fsi.readFileSync(input_file, 'utf8')).toString();
	var msxParser = new mxsParseSource();
	msxParser.source = source(src);

	// console.log(msxParser.TokenizeSource());
	CST = msxParser.parsedCST;

	// console.log(CST);
	JsonFileWrite('test/CST.json', CST);
	// let CSTstatements = collectStatementsFromCST( msxParser.parsedCST);
	// let vscodeSymbols = collectSymbols( msxParser.parsedCST, CSTstatements);
	// let failedTopkens = collectErrors(msxParser.parsedCST);

}
// /*
try { 
	Main(examples[3])
	// examples.forEach(x => Main(x));
} catch (e) {
	// console.log(e.message);
	console.log(e.token);
	FileWrite('test/error.txt', e.message);
	// console.log(e.tokens);
	// console.log(e.details.expected);
}
// */
//-----------------------------------------------------------------------------------
function compress(source) {

}
// compress();

// try {mxLexer.reset('(local bits = #{1..2})');} catch (e) {console.log(e.message);}
// let tok; while ((tok = mxLexer.next())) { console.log(tok); }
//-----------------------------------------------------------------------------------
let tokensValue = {
	global_typed: (node) => node.text,
	hex: (node) => node.text,
	identity: (node) => node.text,
	locale: (node) => node.text,
	name: (node) => node.text,
	number: (node) => node.text,
	path: (node) => node.text,
	string: (node) => node.text,
	time: (node) => node.text,
	typed_iden: (node) => node.text,

	property: (node) => node.value,
	params: (node) => node.value,

	math: (node) => node.value,
	assign: (node) => node.value,
	comparison: (node) => node.value,

	keyword: (node) => node.text,
	kw_bool: (node) => node.text,
	kw_on: (node) => node.text,
	kw_return: (node) => node.text,
	kw_exit: (node) => node.text,

	kw_scope: (node) => node.text,
	kw_uicontrols: (node) => node.text,
	kw_group: (node) => node.text,
	kw_objectset: (node) => node.text,
	kw_context: (node) => node.text,
	kw_function: (node) => node.text,

	kw_time: (node) => node.text,
	kw_tool: (node) => node.text,
	kw_utility: (node) => node.text,
	kw_rollout: (node) => node.text,
	kw_level: (node) => node.text,
	kw_global: (node) => node.text,
	kw_local: (node) => node.text,

	kw_do: (node) => node.text,
	kw_then: (node) => node.text,
	// Error tokens
	error: (node) => node.text,
}
//-----------------------------------------------------------------------------------
function visit(node, callbackMap) {
	return _visit(node, null, null, 0, 0);

	function _visit(node, parent, key, level = 0) {
		// console.log(' '.repeat(level)+'{');

		// if (!("type" in node)) { return; }
		// level += 1; 
		const nodeType = getNodeType(node);

		// console.log('NODETYPE: '+node.type);

		// TODO: do something with this node


		// if ('type' in node && 'text' in node) {
		// console.log(' '.repeat(level)+node.type+' : '+node.text);
		// }

		let stack = {};
		// get the node keys
		const keys = Object.keys(node);
		// console.log(keys);
		// loop through the keys
		for (let i = 0; i < keys.length; i++) {
			// child is the value of each key
			let key = keys[i];
			const child = node[key];
			// console.log('-----child: '+keys[i]);
			// console.log(CST[keys[i]]);
			// could be an array of nodes or just an object
			if (Array.isArray(child)) {
				// value is an array, visit each item
				let collection = [];
				for (let j = 0; j < child.length; j++) {
					if (isNode(child[j])) {
						collection.push(_visit(child[j], node, key, level + 1));
					} else {
						empty();
					}
				}
				stack[key] = collection;
				// console.log(key); console.log(stack);

				// stack.push( {[key]: collection} );
				// console.log('------');
			} else if (isNode(child)) {
				// value is an object, visit it
				// console.log('T-KEY: ' + key);

				// stack[key] =
				// stack.push( { [key]: _visit(child, node, key, level + 1) } );
				stack[key] = _visit(child, node, key, level + 1);

				// console.log(key); console.log(stack);


			} else if (child === String || child === Number) {
				// eslint-disable-next-line no-empty
				//...
			}
		}

		let res;
		if (nodeType && nodeType in callbackMap) {
			// console.log('NODETYPE: '+node.type);
			// console.log('STACK: ');
			// console.log(stack);
			res = callbackMap[nodeType](node, parent, key, level, stack);
			// console.log(key +': '+ res);
			// console.log(res);

		} else if (nodeType) {
			res = node;
			// console.log(' '.repeat(level)+'NODETYPE: '+node.type);

		} else if (Array.isArray(node)) {
			// console.log('NODE IS ARRAY');
			res = keys.map(x => stack[x]).join(';');

		}
		//--------------------------------
		// console.log('\x1b[31m%s\x1b[0m', res);
		console.log(chalk.inverse(res));
		return res;
		// console.log(' '.repeat(level)+'}');
		// return callbackMap;
	}

	function empty(node) {
		return '';
		// console.log('[ '+node+' ]');
	}

}

//  /*
// TODO: COLLECT EXPRESSIONS ; IN ARRAY
let COMPRESS = visit(CST, {
	// TOKENS
	...tokensValue,

	// LITERALS
	Literal(node, parent, key, level, stack) {
		return stack.value;
	},
	Identifier(node, parent, key, level, stack) {
		// console.log(' '.repeat(level)+'IDEN: '+stack);
		// console.log(stack.value);
		return stack.value;
	},
	Declaration(node, parent, key, level, stack) {
		return stack.value ? `${stack.id}=${stack.value}` : stack.id;
	},
	BitRange(node, parent, key, level, stack) {
		return `${stack.start}..${stack.end}`;
	},
	// Types
	ObjectArray(node, parent, key, level, stack) {
		if (Array.isArray(stack.elements) && stack.elements.length > 1) {
			return `#(${stack.elements.join(',')})`;
		} else {
			return `#(${stack.elements})`;
		}
	},
	ObjectBitArray(node, parent, key, level, stack) {
		if (Array.isArray(stack.elements) && stack.elements.length > 1) {
			return `#{${stack.elements.join(',')}}`;
		} else {
			return `#{${stack.elements}}`;
		}
	},
	ObjectPoint4(node, parent, key, level, stack) { return `[${stack.elements.join(',')}]`; },
	ObjectPoint3(node, parent, key, level, stack) { return `[${stack.elements.join(',')}]`; },
	ObjectPoint2(node, parent, key, level, stack) { return `[${stack.elements.join(',')}]`; },
	// Accesors
	AccessorIndex(node, parent, key, level, stack) {
		return `${stack.operand}[${stack.index}]`;
	},
	AccessorProperty(node, parent, key, level, stack) {
		return `${stack.operand}.${stack.property}`;
	},
	// Call
	CallExpression(node, parent, key, level, stack) {
		let args = joinStr(stack.args);
		return `${stack.calle}${betweenWS(stack.calle, args)}${args}`;
	},
	// Assign
	ParameterAssignment(node, parent, key, level, stack) {
		return `${stack.param}:${stack.value}`;
	},
	AssignmentExpression(node, parent, key, level, stack) {
		return `${stack.operand}${stack.operator}${stack.value}`;
	},
	// STATEMENTS
	BlockStatement(node, parent, key, level, stack) {
		// CHECK SEMICOLONS AT END!!!
		return `(${stack.body.join(';')})`;
	},
	// Struct
	Struct(node, parent, key, level, stack) {
		return `struct ${stack.id}(${stack.body.join(',')})`;
	},
	// Functions
	Function(node, parent, key, level, stack) {
		let decl = `${node.mapped ? 'mapped ' : ''}${stack.keyword} ${stack.id}`;
		let args = ('args' in stack) ? ` ${joinStr(stack.args)}` : '';
		let params = ('params' in stack) ? ` ${joinStr(stack.params)}` : '';

		return (decl + args + params + '=' + betweenWS('=', stack.body) + stack.body);
	},
	FunctionReturn(node, parent, key, level, stack) {
		return `return${betweenWS('return', stack.body)}${stack.body}`
	},
	// Plugin
	EntityPlugin(node, parent, key, level, stack) {
		return `plugin ${stack.superclass} ${stack.class} ${joinStr(stack.params)}(${Array.isArray(stack.body) ? stack.body.join(';') : stack.body})`;
	},
	EntityPlugin_params(node, parent, key, level, stack) {
		return `parameters ${stack.id} ${joinStr(stack.params)}(${Array.isArray(stack.body) ? stack.body.join(';') : stack.body})`;
	},
	PluginParam(node, parent, key, level, stack) {
		return `${stack.id} ${joinStr(stack.params)}`;
	},
	// Tool
	EntityTool(node, parent, key, level, stack) {
		return `tool ${stack.id} ${joinStr(stack.params)}(${stack.body.join(';')})`;
	},
	// MacroScript
	EntityMacroscript(node, parent, key, level, stack) {
		return `macroScript ${stack.id} ${joinStr(stack.params)}(${stack.body.join(';')})`;
	},

	EntityRcmenu(node, parent, key, level, stack) {
		return `rcmenu ${stack.id}(${stack.body.join(';')})`;
	},
	EntityRcmenu_submenu(node, parent, key, level, stack) {
		return `subMenu${stack.label}${stack.params}(${stack.body.join(';')})`;
	},
	EntityRcmenu_menuitem(node, parent, key, level, stack) {
		return `menuItem ${stack.id}${stack.label}${joinStr(stack.params)}`;
	},
	EntityRcmenu_separator(node, parent, key, level, stack) {
		let params = joinStr(stack.params);
		return `separator ${stack.id}${betweenWS(stack.id, params)}${params}`;
	},
	// Utility - Rollout
	EntityUtility(node, parent, key, level, stack) {
		return `utility ${stack.id}${stack.title}${joinStr(stack.params)}(${stack.body.join(';')})`;
	},
	EntityRollout(node, parent, key, level, stack) {
		return `rollout ${stack.id}${stack.title}${joinStr(stack.params)}(${stack.body.join(';')})`;
	},
	EntityRolloutControl(node, parent, key, level, stack) {
		return `${stack.class} ${stack.id}${stack.text || ' '}${joinStr(stack.params)}`;
	},
	// Event
	Event(node, parent, key, level, stack) {
		return `on ${stack.args} ${stack.modifier}${betweenWS(stack.modifier, stack.body)}${stack.body}`;
	},
	EventArgs(node, parent, key, level, stack) {
		let args = [].concat((stack.target || ''), (stack.event || ''), (joinStr(stack.args))).filter(x => x.length > 0).join(' ');
		return args;
	},
	WhenStatement(node, parent, key, level, stack) {
		let args = joinStr(stack.args);
		console.log(`when ${args} do${betweenWS('do', stack.body)}${stack.body}`);
		return `when${betweenWS('when', args)}${args}${betweenWS(args, 'do')}do${betweenWS('do', stack.body)}${stack.body}`;
	},
	// Declarations
	VariableDeclaration(node, parent, key, level, stack) {
		return `${node.scope} ${stack.decls.join(',')}`;
	},
	// SIMPLE EXPRESSIONS
	MathExpression(node, parent, key, level, stack) { return binaryNode(stack); },
	LogicalExpression(node, parent, key, level, stack) { return binaryNode(stack); },
	UnaryExpression(node, parent, key, level, stack) {
		let ws = stack.right[0] !== '-' ? '' : ' ';
		return `-${ws}${stack.right}`;
	},
	IfStatement(node, parent, key, level, stack) {
		let test = mandatoryWS(stack.test);
		let operator = stack.operator && stack.operator === 'do' ? 'do' : 'then'
		let consequent;
		let res;
		if (stack.alternate) {
			consequent = mandatoryWS(stack.consequent);
			let alternate = mandatoryWS(stack.alternate, false);
			res = `if${test}${operator}${consequent}else${alternate}`;
		} else {
			consequent = mandatoryWS(stack.consequent, false);
			res = `if${test}${operator}${consequent}`;
		}
		return res;
	},
	LoopExit(node, parent, key, level, stack) {
		return `exit with${betweenWS('with', stack.body)}${stack.body}`;
	},
	TryStatement(node, parent, key, level, stack) {
		let block = mandatoryWS(stack.block);
		let finalizer = mandatoryWS(stack.finalizer, false);
		return `try${block}catch${finalizer}`
	},
	DoWhileStatement(node, parent, key, level, stack) {
		let body = mandatoryWS(stack.body);
		return `do${body}while${betweenWS('while', stack.test)}${stack.test}`;
	},
	WhileStatement(node, parent, key, level, stack) {
		let test = mandatoryWS(stack.test);
		return `while${test}do${betweenWS('do', stack.body)}${stack.body}`;
	},
	ForStatement(node, parent, key, level, stack) {
		let it = `for ${stack.variable}${betweenWS(stack.variable, stack.iteration)}${stack.iteration}`;
		let val = `${betweenWS(stack.iteration, stack.value)}${stack.value}`;
		let seq = mandatoryWS(stack.sequence);
		let act = `${betweenWS(seq, stack.action)}${stack.action}${betweenWS(stack.action, stack.body)}${stack.body}`;
		return (it + val + seq + act);
	},
	ForLoopSequence(node, parent, key, level, stack) {
		let _to = (stack.to !== undefined) ? `to${mandatoryWS(stack.to)}` : '';
		let _by = (stack.by !== undefined) ? `by${mandatoryWS(stack.by)}` : '';
		let _while = (stack.while !== undefined) ? `while${mandatoryWS(stack.while)}` : '';
		let _where = (stack.where !== undefined) ? `where${mandatoryWS(stack.where, false)}` : '';
		return (_to + _by + _while + _where);
	},
	CaseStatement(node, parent, key, level, stack) {
		return `case${mandatoryWS(stack.test)}of(${stack.cases.join(';')});`;
	},
	CaseClause(node, parent, key, level, stack) {
		return `${stack.case}:${stack.body}`;
	},
	// context expressions
	ContextStatement(node, parent, key, level, stack) {
		let contx = stack.context.join(',')
		return `${contx}${betweenWS(contx, stack.body)}${stack.body}`;
	},
	ContextExpression(node, parent, key, level, stack) {
		let prefix = stack.prefix || '';
		let context = stack.context;
		let args = joinStr(stack.args);
		// console.log(chalk.blue(`${prefix}${betweenWS(prefix, context)}${context}${betweenWS(context, args)}${args}`));
		return `${prefix}${betweenWS(prefix, context)}${context}${betweenWS(context, args)}${args}`;
	},
});


// console.log(COMPRESS);
FileWrite('test/compress.ms', COMPRESS);


//*/
// Basic expressions
function unary(right, op) {
	return `${op}${betweenWS(op, right)}${right}`;
}
function binary(left, right, op){
	return `${left}${betweenWS(left, op)}${op}${betweenWS(op, right)}${right}`;
}
function binaryNode(node) {
	let _left = node.left || '';
	let _right = node.right || '';
	let left = `${_left}${betweenWS(_left, node.operator)}`;
	let right = `${betweenWS(node.operator, _right)}${_right}`;
	return `${left}${node.operator}${right}`
}

function joinStr(arr) {
	// console.log(arr);
	// /*
	if (!arr || arr.length === 0) { return ''; }
	return arr.reduce((acc, curr) => {
		return acc + betweenWS(acc, curr) + curr;
	});
	// */
	// return arr;
}
function betweenWS(str1, str2) {
	if (str2 === undefined || str2 === '' || str1 === '') {
		return '';
	} else {
		return /[\w_-]$/gmi.test(str1) && /^[\w_-]/gmi.test(str2) ? ' ' : '';
	}
}
function mandatoryWS(str, end = true) {
	let _start = /^[\w_-]/gmi.test(str) ? ' ' : '';
	let _end = /[\w_-]$/gmi.test(str) && end ? ' ' : '';

	return `${_start}${str}${_end}`;
}

function isNode(node) {
	return (typeof node === 'object' && node != undefined);
}
function getNodeType(node) {
	return ('type' in node) ? node.type : undefined;
}
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