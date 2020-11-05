/**
 * Check if value is node
 * @param {any} node CST node
 */
function isNode(node) {
	return (typeof node === 'object' && node != undefined);
}
/**
 * filter nodes by type property
 * @param {any} node CST node
 */
function getNodeType(node) {
	return ('type' in node) ? node.type : undefined;
}

function itemsCheck(val) {
	if (Array.isArray(val) && val.length > 1) {
		return true;
	}
	return false;
}
//-----------------------------------------------------------------------------------
/**
 * Visit and reduce CST to compact code
 * @param {any} node CST node
 * @param {any} callbackMap Patterns function
 */
function visit(node, callbackMap) {

	function _visit(node, parent, key, level, index) {
		const nodeType = getNodeType(node);

		// get the node keys
		const keys = Object.keys(node);
		// loop through the keys
		for (let i = 0; i < keys.length; i++) {
			// child is the value of each key
			let key = keys[i];
			const child = node[key];
			// could be an array of nodes or just an object
			if (Array.isArray(child)) {
				for (let j = 0; j < child.length; j++) {
					if (isNode(child[j])) {
						_visit(child[j], node, key, level + 1, j)
					}
				}
			}
			else if (isNode(child)) {
				_visit(child, node, key, level + 1, null);
			}
		}

		if (nodeType in callbackMap) {

			callbackMap[nodeType](node, parent, key, level, index);
			// console.log(node.type +' :: ' + parent.type + ' [' + index + ']');
			// console.log(parent[key]);
		} else {
			// valid nodes but missing from rules...
			// console.log(node);

			// index != null ? parent[key][index] = node.text : parent[key] = node.text;
		}
	}
	_visit(node, null, null, 0, null);
	console.log(node[0]);
}
//-----------------------------------------------------------------------------------
function removeNode(node, parent, key, index) {
	if (key in parent) {
		index != null ? parent[key].splice(index, 1) : delete parent[key]
	}
}
//-----------------------------------------------------------------------------------

var wrap = function (func) {
	return function () {
		var args = [...arguments].splice(0);
		return func.apply(this, args);
	};
};


function nodeText(node, parent, key, level, index) {
	index != null ? parent[key][index] = node.text : parent[key] = node.text;
}
function nodeValue(node, parent, key, level, index) {
	index != null ? parent[key][index] = node.value : parent[key] = node.value;
}

//-----------------------------------------------------------------------------------
const INDENT = '\t';
const SPACE = ' ';
//-----------------------------------------------------------------------------------
let tokensValue = {
	/*
	global_typed(node, parent, key, level, index) { index != null ? parent[key][index] = node.text : parent[key] = node.text; },
	hex(node, parent, key, level, index) { index != null ? parent[key][index] = node.text : parent[key] = node.text; },

	identity(node, parent, key, level, index) { index != null ? parent[key][index] = node.text : parent[key] = node.text; },

	locale(node, parent, key, level, index) { index != null ? parent[key][index] = node.text : parent[key] = node.text; },
	name(node, parent, key, level, index) { index != null ? parent[key][index] = node.text : parent[key] = node.text; },
	number(node, parent, key, level, index) { index != null ? parent[key][index] = node.text : parent[key] = node.text; },
	path(node, parent, key, level, index) { index != null ? parent[key][index] = node.text : parent[key] = node.text; },
	string(node, parent, key, level, index) { index != null ? parent[key][index] = node.text : parent[key] = node.text; },
	time(node, parent, key, level, index) { index != null ? parent[key][index] = node.text : parent[key] = node.text; },
	typed_iden(node, parent, key, level, index) { index != null ? parent[key][index] = node.text : parent[key] = node.text; },

	property(node, parent, key, level, index) { index != null ? parent[key][index] = node.value : parent[key] = node.value; },
	params(node, parent, key, level, index) { index != null ? parent[key][index] = node.value : parent[key] = node.value; },
	math(node, parent, key, level, index) { index != null ? parent[key][index] = node.value : parent[key] = node.value; },
	assign(node, parent, key, level, index) { index != null ? parent[key][index] = node.value : parent[key] = node.value; },
	comparison(node, parent, key, level, index) { index != null ? parent[key][index] = node.value : parent[key] = node.value; },

	keyword(node, parent, key, level, index) { index != null ? parent[key][index] = node.text : parent[key] = node.text; },
	kw_as(node, parent, key, level, index) { index != null ? parent[key][index] = node.text : parent[key] = node.text; },
	kw_bool(node, parent, key, level, index) { index != null ? parent[key][index] = node.text : parent[key] = node.text; },
	kw_on(node, parent, key, level, index) { index != null ? parent[key][index] = node.text : parent[key] = node.text; },
	kw_return(node, parent, key, level, index) { index != null ? parent[key][index] = node.text : parent[key] = node.text; },
	kw_exit(node, parent, key, level, index) { index != null ? parent[key][index] = node.text : parent[key] = node.text; },
	kw_scope(node, parent, key, level, index) { index != null ? parent[key][index] = node.text : parent[key] = node.text; },
	kw_uicontrols(node, parent, key, level, index) { index != null ? parent[key][index] = node.text : parent[key] = node.text; },
	kw_group(node, parent, key, level, index) { index != null ? parent[key][index] = node.text : parent[key] = node.text; },
	kw_objectset(node, parent, key, level, index) { index != null ? parent[key][index] = node.text : parent[key] = node.text; },
	kw_context(node, parent, key, level, index) { index != null ? parent[key][index] = node.text : parent[key] = node.text; },
	kw_function(node, parent, key, level, index) { index != null ? parent[key][index] = node.text : parent[key] = node.text; },
	kw_time(node, parent, key, level, index) { index != null ? parent[key][index] = node.text : parent[key] = node.text; },
	kw_tool(node, parent, key, level, index) { index != null ? parent[key][index] = node.text : parent[key] = node.text; },
	kw_utility(node, parent, key, level, index) { index != null ? parent[key][index] = node.text : parent[key] = node.text; },
	kw_rollout(node, parent, key, level, index) { index != null ? parent[key][index] = node.text : parent[key] = node.text; },
	kw_level(node, parent, key, level, index) { index != null ? parent[key][index] = node.text : parent[key] = node.text; },
	kw_global(node, parent, key, level, index) { index != null ? parent[key][index] = node.text : parent[key] = node.text; },
	kw_local(node, parent, key, level, index) { index != null ? parent[key][index] = node.text : parent[key] = node.text; },
	kw_do(node, parent, key, level, index) { index != null ? parent[key][index] = node.text : parent[key] = node.text; },
	kw_then(node, parent, key, level, index) { index != null ? parent[key][index] = node.text : parent[key] = node.text; },
	error(node, parent, key, level, index) { index != null ? parent[key][index] = node.text : parent[key] = node.text; },
	// */

	// /*
	global_typed: wrap(nodeText),
	hex: wrap(nodeText),
	identity: wrap(nodeText),
	locale: wrap(nodeText),
	name: wrap(nodeText),
	number: wrap(nodeText),
	path: wrap(nodeText),
	string: wrap(nodeText),
	time: wrap(nodeText),
	typed_iden: wrap(nodeText),
	property: wrap(nodeValue),
	params: wrap(nodeValue),
	math: wrap(nodeValue),
	assign: wrap(nodeValue),
	comparison: wrap(nodeValue),

	keyword: wrap(nodeText),

	kw_as: wrap(nodeText),
	kw_bool: wrap(nodeText),
	kw_on: wrap(nodeText),
	kw_return: wrap(nodeText),
	kw_undo: wrap(nodeText),
	kw_exit: wrap(nodeText),
	kw_scope: wrap(nodeText),
	kw_uicontrols: wrap(nodeText),
	kw_group: wrap(nodeText),
	kw_objectset: wrap(nodeText),
	kw_not: wrap(nodeText),
	kw_context: wrap(nodeText),
	kw_function: wrap(nodeText),
	kw_time: wrap(nodeText),
	kw_tool: wrap(nodeText),
	kw_utility: wrap(nodeText),
	kw_rollout: wrap(nodeText),
	kw_level: wrap(nodeText),
	kw_global: wrap(nodeText),
	kw_local: wrap(nodeText),

	kw_do: wrap(nodeText),
	kw_then: wrap(nodeText),

	error: wrap(nodeText),
	// */

};
let visitorPatterns = {
	// TOKENS
	...tokensValue,
	// LITERALS
	Literal(node, parent, key, level, index) {
		index != null ? parent[key][index] = node.value : parent[key] = node.value;
	},
	Identifier(node, parent, key, level, index) {
		index != null ? parent[key][index] = node.value : parent[key] = node.value;
	},
	// Literal   : wrap(nodeValue),
	// Identifier: wrap(nodeValue),

	BitRange(node, parent, key, level, index) {
		let res = `${node.start}..${node.end}`;
		index != null ? parent[key][index] = res : parent[key] = res;
	},
	//-------------------------------------------------------------------------------------------

	// DECLARATION
	Declaration(node, parent, key, level, index) {
		let res;
		let head = `${node.id} =`;

		if (itemsCheck(node.value)) {
			res = [
				head,
				...node.value,	//.map(x => INDENT + x)
			].join('\n');
		} else {
			res = head + ' ' + node.value;
		}

		index != null ? parent[key][index] = res : parent[key] = res;
	},
	// /*
	// Types
	ObjectArray(node, parent, key, level, index) {
		let res;
		if (Array.isArray(node.elements) && node.elements.length > 1) {
			res = `#(${node.elements.join(', ')})`;
		} else {
			res = `#(${node.elements})`;
		}

		index != null ? parent[key][index] = res : parent[key] = res;
	},
	ObjectBitArray(node, parent, key, level, index) {
		let res;
		if (Array.isArray(node.elements) && node.elements.length > 1) {
			res = `#{${node.elements.join(', ')}}`;
		}
		else {
			res = `#{${node.elements}}`;
		}

		index != null ? parent[key][index] = res : parent[key] = res;
	},
	ObjectPoint4(node, parent, key, level, index) {
		let res = `[${node.elements.join(', ')}]`;

		index != null ? parent[key][index] = res : parent[key] = res;
	},
	ObjectPoint3(node, parent, key, level, index) {
		let res = `[${node.elements.join(', ')}]`;

		index != null ? parent[key][index] = res : parent[key] = res;
	},
	ObjectPoint2(node, parent, key, level, index) {
		let res = `[${node.elements.join(', ')}]`;

		index != null ? parent[key][index] = res : parent[key] = res;
	},


	// Accesors
	AccessorIndex(node, parent, key, level, index) {
		let res = `${node.operand}[${node.index}]`;

		index != null ? parent[key][index] = res : parent[key] = res;
	},
	// */
	AccessorProperty(node, parent, key, level, index) {
		/*
		let res;
		if (itemsCheck(node.operand)) {
			let last = node.operand.pop();
			// append to last item
			res = [
				...node.operand,
				`${last}.${node.property}`
			]
		} else {
			res = `${node.operand}.${node.property}`;
		}
		*/
		let res = `${node.operand}.${node.property}`;

		index != null ? parent[key][index] = res : parent[key] = res;
	},
	// /*

	// Call
	CallExpression(node, parent, key, level, index) {

		if (!Array.isArray(node.args)) { node.args = [node.args] }

		let res = [
			node.calle,
			...node.args
		].join(' ');

		index != null ? parent[key][index] = res : parent[key] = res;
	},
	// Assign
	ParameterAssignment(node, parent, key, level, index) {
		let res = `${node.param}: ${node.value || ' '}`

		index != null ? parent[key][index] = res : parent[key] = res;
	},
	AssignmentExpression(node, parent, key, level, index) {
		let res = `${node.operand} ${node.operator} ${node.value}`;

		index != null ? parent[key][index] = res : parent[key] = res;
	},


	// Functions
	Function(node, parent, key, level, index) {

		let decl = `${node.mapped ? 'mapped ' : ''}${node.keyword} ${node.id}`;
		let args = node.args.join(' ');
		let params = ('params' in node) ? node.params.join(' ') : '';

		let res = [decl, args, params, '='].join(' ').concat('\n', node.body);

		index != null ? parent[key][index] = res : parent[key] = res;
	},
	FunctionReturn(node, parent, key, level, index) {
		let res = `return ${node.body || ''}`;

		index != null ? parent[key][index] = res : parent[key] = res;
	},
	// Declarations
	// */
	VariableDeclaration(node, parent, key, level, index) {
		let res;
		let scope = node.modifier != null ? `${node.modifier} ${node.scope} ` : `${node.scope} `;

		if (itemsCheck(node.decls)) {
			let last = node.decls.pop();
			res = [
				scope,
				...node.decls.map(x => x + ','),
				last
			]
		} else {
			res = scope + node.decls;
		}

		index != null ? parent[key][index] = res : parent[key] = res;
	},
	// /*

	// SIMPLE EXPRESSIONS - OK
	MathExpression(node, parent, key, level, index) {
		let res = `${node.left || ''} ${node.operator} ${node.right || ''}`;

		index != null ? parent[key][index] = res : parent[key] = res;
	},
	LogicalExpression(node, parent, key, level, index) {
		let res = `${node.left} ${node.operator} ${node.right}`;

		index != null ? parent[key][index] = res : parent[key] = res;
	},
	UnaryExpression(node, parent, key, level, index) {
		let res = `${node.operator} ${node.right}`

		index != null ? parent[key][index] = res : parent[key] = res;
	},

	// STATEMENTS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
	// */
	BlockStatement(node, parent, key, level, index) {
		let res;
		if (itemsCheck(node.body)) {
			res = [
				'(',
				...node.body.flat().map(x => '\t' + x),
				')'
			].join('\n');
		} else {
			res = `(${node.body})`;

		}
		// console.log(res);
		// console.log(node.body.map(x => '\t' + x));
		// console.log('-------------------');
		index != null ? parent[key][index] = res : parent[key] = res;
	},
	// /*
	IfStatement(node, parent, key, level, index) {

		if (!Array.isArray(node.consequent)) { node.consequent = [node.consequent] }

		let res = [
			`if ${node.test} ${node.operator || 'then'}`,
			...node.consequent
		];

		if (node.alternate) {

			if (!Array.isArray(node.alternate)) { node.alternate = [node.alternate] }

			let alt = [
				'else',
				...node.alternate
			];
			res = res.concat(alt);
		}
		res = res.join('\n');
		// console.log(res);

		index != null ? parent[key][index] = res : parent[key] = res;
	},
	TryStatement(node, parent, key, level, index) {
		let res = [
			'try',
			node.block,
			'catch',
			node.finalizer
		].join('\n');

		index != null ? parent[key][index] = res : parent[key] = res;
	},
	DoWhileStatement(node, parent, key, level, index) {

		let res = [
			'do',
			node.body,
			'while',
			node.test
		].join('\n');

		index != null ? parent[key][index] = res : parent[key] = res;
	},
	WhileStatement(node, parent, key, level, index) {
		let res = [
			'while',
			node.test,
			'do',
			// node.body,
		].join(' ')
			.concat('\n', node.body);

		index != null ? parent[key][index] = res : parent[key] = res;
	},
	ForStatement(node, parent, key, level, index) {
		let res = [
			'for',
			node.variable,
			node.iteration,
			node.value,
			node.sequence,
			node.action
		].join(' ')
			.concat('\n', node.body);

		index != null ? parent[key][index] = res : parent[key] = res;
	},
	ForLoopSequence(node, parent, key, level, index) {
		let res = [
			_to = (node.to.length > 0) ? `to ${node.to}` : null,
			_by = (node.by.length > 0) ? `by ${node.by}` : null,
			_while = (node.while.length > 0) ? `while ${node.while}` : null,
			_where = (node.where.length > 0) ? `where ${node.where}` : null
		].filter(e => e != null)
			.join(' ');

		index != null ? parent[key][index] = res : parent[key] = res;
	},
	LoopExit(node, parent, key, level, index) {
		let res = `exit with\n${node.body}`;

		index != null ? parent[key][index] = res : parent[key] = res;
	},
	CaseStatement(node, parent, key, level, index) {
		res = [
			`case ${node.test} of`,
			'(',
			...node.cases,
			')'
		].join('\n');

		index != null ? parent[key][index] = res : parent[key] = res;
	},
	CaseClause(node, parent, key, level, index) {
		let spacer = /\d$/mi.test(node.case) ? ' ' : '';
		let short = /\n/mi.test(node.body) ? '\n' : ' ';

		let res = `${node.case}${spacer}:${short}${node.body}`;

		index != null ? parent[key][index] = res : parent[key] = res;
	},
	// context expressions
	ContextStatement(node, parent, key, level, index) {
		let res = `${node.context}\n${node.body}`

		index != null ? parent[key][index] = res : parent[key] = res;
	},
	ContextExpression(node, parent, key, level, index) {
		let res;
		if (node.prefix !== '') {
			res = [
				node.prefix,
				node.context,
				...node.args
			].join(' ');
		} else {
			res = [
				node.context,
				...node.args
			].join(' ');
		}

		index != null ? parent[key][index] = res : parent[key] = res;
	},
	// /*
	// Struct
	Struct(node, parent, key, level, index) {
		// console.log(node);
		// /*
		let body;
		if (Array.isArray(node.body)) {
			body =
				node.body.reduce((acc, curr, index, src) => {
					if (index < src.length - 1) {
						let sep = /(?:private|public)$/mi.test(curr) ? ';\n\t' : ',\n\t';
						return (acc + curr + sep);
					} else {
						return (acc + curr);
					}
				}, '');
		} else {
			body = node.body;
		}
		let res = [
			`struct ${node.id}`,
			'(',
			`${body}`,
			')'
		].join('\n');

		index != null ? parent[key][index] = node.value : parent[key] = node.value;
	},
	StructScope(node, parent, key, level, index) {

		index != null ? parent[key][index] = node.value : parent[key] = node.value;
	},
	// StructScope: wrap(nodeValue);
	// Plugin
	EntityPlugin(node, parent, key, level, index) {
		let body = exprTerm(node.body);
		let res = [
			`plugin ${node.superclass} ${node.class}`,
			...node.params.flat(),
			'(',
			body,
			')'
		].join('\n');

		index != null ? parent[key][index] = node.value : parent[key] = node.value;
	},
	EntityPlugin_params(node, parent, key, level, index) {
		let body = exprTerm(node.body);
		let res = [
			`parameters ${node.id}`,
			...node.params,
			'(',
			...node.body.flat(),
			')'].join('\n');
		
		index != null ? parent[key][index] = node.value : parent[key] = node.value;
	},
	PluginParam(node, parent, key, level, index) {
		let res = [
			node.id,
			...node.params.flat()
		].join(' ');
	
		index != null ? parent[key][index] = node.value : parent[key] = node.value;
	},
	// Tool
	EntityTool(node, parent, key, level, index) {

		let res = [
			'tool ${node.id}',
			...node.params,
			'(',
			...node.body.flat(),
			')'
		].join('\n');

		index != null ? parent[key][index] = res : parent[key] = res;
	},
	// MacroScript
	EntityMacroscript(node, parent, key, level, index) {
		// console.log(node.body);
		// console.log(parent[key]);
		let res = [
			`macroScript ${node.id}`,
			...node.params,
			'(',
			...node.body.flat(),
			')'
		].join('\n');
		index != null ? parent[key][index] = res : parent[key] = res;
	},
	// rcMenu
	EntityRcmenu(node, parent, key, level, index) {
		res = [
			`rcmenu ${node.id}`,
			'(',
			...node.body.flat(),
			')'
		].join('\n');

		index != null ? parent[key][index] = res : parent[key] = res;
	},
	EntityRcmenu_submenu(node, parent, key, level, index) {
		let res = [
			`subMenu ${node.label} ${node.params}`,
			'(',
			...node.body,
			')'
		].join('\n');

		index != null ? parent[key][index] = res : parent[key] = res;
	},
	EntityRcmenu_menuitem(node, parent, key, level, index) {
		let res = [
			'menuItem',
			node.id,
			node.label,
			...node.params
		].join(' ');

		index != null ? parent[key][index] = res : parent[key] = res;
	},
	EntityRcmenu_separator(node, parent, key, level, index) {
		let res = [
			'separator',
			node.id,
			...node.params
		].join(' ');
		index != null ? parent[key][index] = res : parent[key] = res;
	},
	// Utility - Rollout
	EntityUtility(node, parent, key, level, index) {
		let res = [
			`utility ${node.id} ${node.title}`,
			...node.params,
			'(',
			...node.body,
			')'
		].join('\n');
		index != null ? parent[key][index] = res : parent[key] = res;
	},
	EntityRollout(node, parent, key, level, index) {
		let res = [
			`rollout ${node.id} ${node.title}`,
			...node.params,
			'(',
			...node.body.flat(),
			')'
		].join('\n');
		index != null ? parent[key][index] = res : parent[key] = res;
	},
	EntityRolloutGroup(node, parent, key, level, index) {
		let res = [
			`group ${node.id}`,
			'(',
			...node.body,
			')'
		].join('\n');
		index != null ? parent[key][index] = res : parent[key] = res;
	},
	EntityRolloutControl(node, parent, key, level, index) {
		let res = [
			node.class,
			node.id,
			node.text,
			...node.params
		].join(' ');
		index != null ? parent[key][index] = res : parent[key] = res;
	},
	// Event
	Event(node, parent, key, level, index) {
		let res = `on ${node.args} ${node.modifier}\n${node.body})`

		index != null ? parent[key][index] = res : parent[key] = res;
	},
	EventArgs(node, parent, key, level, index) {
		let res = [
			node.target || null,
			node.event || null,
			node.args
		].filter(x => x != null)
			.join(' ');

		index != null ? parent[key][index] = res : parent[key] = res;
	},
	WhenStatement(node, parent, key, level, index) {
		let res = [
			'when',
			...node.args.flat(),
			'do'
		].join(' ')
			.concat('\n', node.body)

		index != null ? parent[key][index] = res : parent[key] = res;
	},
};
//-----------------------------------------------------------------------------------
function mxsMinify(cst) {
	return visit(cst, visitorPatterns);
}
module.exports = { mxsMinify, visit, visitorPatterns };
