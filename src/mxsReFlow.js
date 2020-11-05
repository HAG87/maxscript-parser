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
			editNode.call(this, callbackMap[nodeType], node, parent, key, level, index);

			// callbackMap[nodeType](node)			
			// index != null ? parent[key][index] = res : parent[key] = res;
		} else {
			// valid nodes but missing from rules...
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
function editNode(callback, node, parent, key, level, index) {
	let res = callback(node);
	index != null ? parent[key][index] = res : parent[key] = res;
}
//-----------------------------------------------------------------------------------
/*
var wrap = function (func) {
	return function () {
		var args = [...arguments].splice(0);
		return func.apply(this, args);
	};
};
function nodeText(node) {
	index != null ? parent[key][index] = node.text : parent[key] = node.text;
}
function nodeValue(node) {
	index != null ? parent[key][index] = node.value : parent[key] = node.value;
}
*/

//-----------------------------------------------------------------------------------
const INDENT = '\t';
const SPACER = ' ';
const LINEBRK = '\n';
//-----------------------------------------------------------------------------------
let tokensValue = {
	// /*
	global_typed(node) { return node.text; },
	hex(node) { return node.text; },
	identity(node) { return node.text; },
	locale(node) { return node.text; },
	name(node) { return node.text; },
	number(node) { return node.text; },
	path(node) { return node.text; },
	string(node) { return node.text; },
	time(node) { return node.text; },
	typed_iden(node) { return node.text; },
	property(node) { return node.value; },
	params(node) { return node.value; },
	math(node) { return node.value; },
	assign(node) { return node.value; },
	comparison(node) { return node.value; },
	keyword(node) { return node.text; },
	kw_as(node) { return node.text; },
	kw_bool(node) { return node.text; },
	kw_on(node) { return node.text; },
	kw_return(node) { return node.text; },
	kw_exit(node) { return node.text; },
	kw_scope(node) { return node.text; },
	kw_uicontrols(node) { return node.text; },
	kw_group(node) { return node.text; },
	kw_objectset(node) { return node.text; },
	kw_context(node) { return node.text; },
	kw_function(node) { return node.text; },
	kw_time(node) { return node.text; },
	kw_tool(node) { return node.text; },
	kw_utility(node) { return node.text; },
	kw_rollout(node) { return node.text; },
	kw_level(node) { return node.text; },
	kw_global(node) { return node.text; },
	kw_local(node) { return node.text; },
	kw_do(node) { return node.text; },
	kw_then(node) { return node.text; },
	error(node) { return node.text; },
	// */

	/*
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
	Literal(node) { return node.value; },
	Identifier(node) { return node.value; },
	// Literal   : wrap(nodeValue),
	// Identifier: wrap(nodeValue),

	BitRange(node) {
		let res = `${node.start}..${node.end}`;
		return res;
	},
	//-------------------------------------------------------------------------------------------

	// DECLARATION
	Declaration(node) {
		let res;

		if (itemsCheck(node.value)) {
			let head = [
				node.id,
				'=',
				node.value
			].join(SPACER);

			res = [
				head,
				...node.value,	//.map(x => INDENT + x)
			].join(LINEBRK);
		} else {
			res = [
				node.id,
				'=',
				node.value
			].join(SPACER);
		}

		return res;
	},
	// /*
	// Types
	ObjectArray(node) {
		let res;
		if (Array.isArray(node.elements) && node.elements.length > 1) {
			res = ['#(',
				node.elements.join(',' + SPACER),
				')'
			].join('');
		} else {
			res = `#(${node.elements})`;
		}

		return res;
	},
	ObjectBitArray(node) {
		let res;
		if (Array.isArray(node.elements) && node.elements.length > 1) {
			res = ['#{',
				node.elements.join(',' + SPACER),
				'}'
			].join('');
		}
		else {
			res = `#{${node.elements}}`;
		}

		return res;
	},
	ObjectPoint4(node) {
		let res = [
			'[',
			node.elements.join(',' + SPACER),
			']'
		].join('');

		return res;
	},
	ObjectPoint3(node) {
		let res = [
			'[',
			node.elements.join(',' + SPACER),
			']'
		].join('');

		return res;
	},
	ObjectPoint2(node) {
		let res = [
			'[',
			node.elements.join(',' + SPACER),
			']'
		].join('');

		return res;
	},
	// Accesors
	AccessorIndex(node) {
		let res = `${node.operand}[${node.index}]`;

		return res;
	},
	// */
	AccessorProperty(node) {
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

		return res;
	},
	// /*

	// Call
	CallExpression(node) {

		if (!Array.isArray(node.args)) { node.args = [node.args] }

		let res = [
			node.calle,
			...node.args
		].join(SPACER);

		return res;
	},
	// Assign
	ParameterAssignment(node) {
		let res = `${node.param}: ${node.value || SPACER}`

		return res;
	},
	AssignmentExpression(node) {
		let res = [
			node.operand,
			node.operator,
			node.value
		].join(SPACER);

		return res;
	},


	// Functions
	Function(node) {

		let args = node.args.join(SPACER);
		let params = ('params' in node) ? node.params.join(SPACER) : '';

		let res = [
			node.mapped || null,
			node.keyword,
			node.id,
			args,
			params,
			'='
		].filter(e => e != null)
			.join(SPACER)
			.concat(LINEBRK, node.body);

		return res;
	},
	FunctionReturn(node) {
		let res = [
			'return',
			node.body || ';'
		].join(SPACER);

		return res;
	},
	// Declarations
	// */
	VariableDeclaration(node) {
		let res;
		let scope = node.modifier != null ? `${node.modifier}${SPACER}${node.scope} ` : `${node.scope} `;

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

		return res;
	},
	// /*

	// SIMPLE EXPRESSIONS - OK
	MathExpression(node) {
		let res = [
			node.left || null,
			node.operator,
			node.right
		].filter(e => e != null)
			.join(SPACER);

		return res;
	},
	LogicalExpression(node) {
		let res = [
			node.left,
			node.operator,
			node.right
		].filter(e => e != null)
			.join(SPACER);

		return res;
	},
	UnaryExpression(node) {
		let res = [
			node.operator,
			node.right
		].join(SPACER);

		return res;
	},

	// STATEMENTS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
	// */
	BlockStatement(node) {
		let res;
		if (itemsCheck(node.body)) {
			res = [
				'(',
				...node.body.flat(),	//.map(x => '\t' + x),
				')'
			].join(LINEBRK);
		} else {
			res = `(${node.body})`;

		}
		// console.log(res);
		// console.log(node.body.map(x => '\t' + x));
		// console.log('-------------------');
		return res;
	},
	// /*
	IfStatement(node) {

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
		res = res.join(LINEBRK);
		// console.log(res);

		return res;
	},
	TryStatement(node) {
		let res = [
			'try',
			node.block,
			'catch',
			node.finalizer
		].join(LINEBRK);

		return res;
	},
	DoWhileStatement(node) {

		let res = [
			'do',
			node.body,
			'while',
			node.test
		].join(LINEBRK);

		return res;
	},
	WhileStatement(node) {
		let res = [
			'while',
			node.test,
			'do',
			// node.body,
		].join(SPACER)
			.concat(LINEBRK, node.body);

		return res;
	},
	ForStatement(node) {
		let res = [
			'for',
			node.variable,
			node.iteration,
			node.value,
			node.sequence,
			node.action
		].join(SPACER)
			.concat(LINEBRK, node.body);

		return res;
	},
	ForLoopSequence(node) {
		let res = [
			_to = (node.to.length > 0) ? `to ${node.to}` : null,
			_by = (node.by.length > 0) ? `by ${node.by}` : null,
			_while = (node.while.length > 0) ? `while ${node.while}` : null,
			_where = (node.where.length > 0) ? `where ${node.where}` : null
		].filter(e => e != null)
			.join(SPACER);

		return res;
	},
	LoopExit(node) {
		let res = `exit${SPACER}with${SPACER}${node.body}`;

		return res;
	},
	CaseStatement(node) {
		res = [
			`case ${node.test} of`,
			'(',
			...node.cases,
			')'
		].join(LINEBRK);

		return res;
	},
	CaseClause(node) {
		let spacer = /\d$/mi.test(node.case) ? SPACER : '';
		let short = /\n/mi.test(node.body) ? LINEBRK : ' ';

		let res = `${node.case}${spacer}:${short}${node.body}`;

		return res;
	},
	// context expressions
	ContextStatement(node) {
		let res = [
			node.context,
			node.body
		].join(LINEBRK);

		return res;
	},
	ContextExpression(node) {
		let res = [
			node.prefix !== '' ? node.prefix : null,
			node.context,
			...node.args
		].filter(e => e != null)
			.join(SPACER);

		return res;
	},
	// /*
	// Struct
	Struct(node) {
		// console.log(node);
		// /*
		let body;
		if (Array.isArray(node.body)) {
			body =
				node.body.reduce((acc, curr, index, src) => {
					if (index < src.length - 1) {
						let sep = /(?:private|public)$/mi.test(curr) ? LINEBRK : ',' + LINEBRK;
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
		].join(LINEBRK);

		return res;
	},
	StructScope(node) { return node.value; },
	// StructScope: wrap(nodeValue);
	// Plugin
	EntityPlugin(node) {
		let body = exprTerm(node.body);
		let res = [
			`plugin ${node.superclass} ${node.class}`,
			...node.params.flat(),
			'(',
			body,
			')'
		].join(LINEBRK);

		return res;
	},
	EntityPlugin_params(node) {
		let res = [
			`parameters ${node.id}`,
			...node.params.flat(),
			'(',
			...node.body.flat(),
			')'].join(LINEBRK);

		return res;
	},
	PluginParam(node) {
		let res = [
			node.id,
			...node.params.flat()
		].join(SPACER);

		return res;
	},
	// Tool
	EntityTool(node) {

		let res = [
			'tool ${node.id}',
			...node.params,
			'(',
			...node.body.flat(),
			')'
		].join(LINEBRK);

		return res;
	},
	// MacroScript
	EntityMacroscript(node) {
		// console.log(node.body);
		// console.log(parent[key]);
		let res = [
			`macroScript ${node.id}`,
			...node.params,
			'(',
			...node.body.flat(),
			')'
		].join(LINEBRK);
		return res;
	},
	// rcMenu
	EntityRcmenu(node) {
		res = [
			`rcmenu ${node.id}`,
			'(',
			...node.body.flat(),
			')'
		].join(LINEBRK);

		return res;
	},
	EntityRcmenu_submenu(node) {
		let res = [
			`subMenu ${node.label} ${node.params}`,
			'(',
			...node.body,
			')'
		].join(LINEBRK);

		return res;
	},
	EntityRcmenu_menuitem(node) {
		let res = [
			'menuItem',
			node.id,
			node.label,
			...node.params
		].join(SPACER);

		return res;
	},
	EntityRcmenu_separator(node) {
		let res = [
			'separator',
			node.id,
			...node.params
		].join(SPACER);
		return res;
	},
	// Utility - Rollout
	EntityUtility(node) {
		let res = [
			`utility ${node.id} ${node.title}`,
			...node.params,
			'(',
			...node.body,
			')'
		].join(LINEBRK);
		return res;
	},
	EntityRollout(node) {
		let res = [
			`rollout ${node.id} ${node.title}`,
			...node.params,
			'(',
			...node.body.flat(),
			')'
		].join(LINEBRK);
		return res;
	},
	EntityRolloutGroup(node) {
		let res = [
			`group${SPACER}${node.id}`,
			'(',
			...node.body,
			')'
		].join(LINEBRK);
		return res;
	},
	EntityRolloutControl(node) {
		let res = [
			node.class,
			node.id,
			node.text,
			...node.params
		].join(SPACER);
		return res;
	},
	// Event
	Event(node) {
		let res = [
			`on ${node.args || ''} ${node.modifier || ''}`,
			'(',
			node.body,
			')'
		].join(LINEBRK);
		// `on ${node.args || ''} ${node.modifier || ''}\n${node.body}`

		return res;
	},
	EventArgs(node) {
		let res = [
			node.target || null,
			node.event || null,
			node.args || null
		].filter(x => x != null)
			.join(SPACER);

		return res;
	},
	WhenStatement(node) {
		let res = [
			'when',
			...node.args.flat(),
			'do'
		].join(SPACER)
			.concat(LINEBRK, node.body)

		return res;
	},
};
//-----------------------------------------------------------------------------------
function mxsMinify(cst) {
	return visit(cst, visitorPatterns);
}
module.exports = { mxsMinify, visit, visitorPatterns };
