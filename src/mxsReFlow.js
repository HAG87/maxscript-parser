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

function isArray(val) {
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
	// console.dir(node[0], { depth: null });
}
//-----------------------------------------------------------------------------------
function removeNode(node, parent, key, index) {
	if (key in parent) {
		index != null ? parent[key].splice(index, 1) : delete parent[key]
	}
}
function editNode(callback, node, parent, key, level, index) {
	let res = callback(node, parent, key, level, index);
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

// join elems with WS, one line:
class statement {
	constructor(...args) {
		this.type = 'statement';
		this.value = [...args];
	}

	get toString() {
		return this.value.filter(e => e != null).join(SPACER);
	}

	add(...value) {
		this.value.push(...value);
	}
}
// join elemns with NL.. block of code
//block
class codeblock {
	constructor(...args) {
		this.type = 'codeblock';
		this.value = [...args];
	}

	get toString() {
		return this.value.filter(e => e != null).join(LINEBRK);
	}

	add(...value) {
		this.value.push(...value);
	}
}
// join elems with ',' list of items
//list
class elements {
	constructor(...args) {
		this.type = 'elements';
		this.value = [...args];
	}

	get toString() {
		return this.value.filter(e => e != null).join(',' + SPACER);
	}

	add(...value) {
		this.value.push(...value);
	}
}
// expressions
class expr {
	constructor(...args) {
		this.type = 'expr';
		this.value = [...args];
	}

	get toString() {
		return this.value.filter(e => e != null).join('');
	}

	add(...value) {
		this.value.push(...value);
	}
}
//-----------------------------------------------------------------------------------
const INDENT = '\t';
const SPACER = ' ';
const LINEBRK = '\n';
//-----------------------------------------------------------------------------------
let tokensValue = {
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
	kw_compare(node) { return node.text; },
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
};
let visitorPatterns = {
	// TOKENS
	...tokensValue,
	// LITERALS
	Literal(node) { return node.value; },
	Identifier(node) { return node.value; },
	// Literal   : wrap(nodeValue),
	// Identifier: wrap(nodeValue),

	/*
	BitRange(node) {
		let res = `${node.start}..${node.end}`;
		return res;
	},
	*/
	//-------------------------------------------------------------------------------------------

	// DECLARATION
	Declaration(node) {
		let res;
		// console.dir(parent, {depth: null});
		if (node.value) {
			res = new statement(node.id, '=');

			if (isArray(node.value)) {
				res.add(
					new codeblock(node.value)
				);
			} else {
				res.add(node.value);
			}
		} else {
			res = new statement(node.id);
		}
		// console.log(res.toString);

		// console.log('---');

		return res;
	},
	// /*
	// Types
	ObjectArray(node) {
		// console.log(node);
		let res;

		res = new statement('#(');

		
		if (isArray(node.elements)) {
			// console.log('elems');
			
			let elems = new elements();
			
			node.elements.forEach(
				e => {
					// console.log(e);
					if (isArray(e)) {
						elems.add(
							new codeblock(...e)
						);
					} else {
						elems.add( e );
					}
				});
				// console.log(elems);
				res.add(elems);
			/*
			res = ['#(',
				node.elements.join(',' + SPACER),
				')'
			].join('');
			*/
		} else {
			res.add(node.elements);
		}

		res.add(')');

		// console.log(res);
		return res;
	},
	/*
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
	*/
	ObjectPoint4(node) {
		let res = new statement(
			'[',
			new elements(...node.elements),
			']'
		)
		return res;
	},
	ObjectPoint3(node) {
		let res = new statement(
			'[',
			new elements(...node.elements),
			']'
		)
		// console.dir(res, {depth: null});
		return res;
	},
	ObjectPoint2(node) {
		let res = new statement(
			'[',
			new elements(...node.elements),
			']'
		)
		return res;
	},
	// Accesors
	AccessorIndex(node) {
		let res = new expr(
			node.operand,
			'[',
			node.index,
			']'
		);
		// console.dir(res, {depth: null});
		
		return res;
	},
	/*
	AccessorProperty(node) {
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
		let res = `${node.operand}.${node.property}`;

		return res;
	},

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
	*/
	AssignmentExpression(node) {
		let res = new statement(
			node.operand,
			node.operator,
			node.value
		);

		return res;
	},
/*

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
			.join(SPACER);
		//.concat(LINEBRK, node.body);
		res = [res].concat(node.body);
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
	VariableDeclaration(node) {
		let res;
		let scope = node.modifier != null ? `${node.modifier}${SPACER}${node.scope} ` : `${node.scope} `;

		if (isArray(node.decls)) {

			node.decls.forEach(e => {
				if (isArray(e)) {
					e[e.length-1] +=  ',' + SPACER
				} else {
					e += ',' + SPACER
				}
			});
			res = [
				scope,
				node.decls
			];

		} else {
			res = scope + node.decls;
		}

		return res;
	},
	// SIMPLE EXPRESSIONS - OK
	MathExpression(node) {
		let res = [
			node.left || null,
			node.operator,
			node.right
		].filter(e => e != null)
			.join(SPACER);

		return [res];
	},
	*/
	LogicalExpression(node) {
		let res =  new statement(
			node.left,
			node.operator,
			node.right
		);
		return res;
	},
	UnaryExpression(node) {
		let res = new statement(
			node.operator,
			node.right
		);
		return res;
	},
	
	// STATEMENTS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
	BlockStatement(node) {
		let res;

		if (isArray(node.body)) {
			res = new codeblock(
				'(',
				// ...node.body.flat(),	//.map(x => '\t' + x),
				...node.body, //.flat(),	//.map(x => '\t' + x),
				')'
			);
		} else {

			// res = `(${SPACER}${node.body}${SPACER})`;
			res = new statement(
				'(',
				node.body,
				')'
			)
		}
		console.dir(res, {depth: null});
		// console.log(node.body.map(x => '\t' + x));
		// console.log('-------------------');
		return res;
	},
	/*
	IfStatement(node) {

		if (!Array.isArray(node.consequent)) { node.consequent = [node.consequent] }

		let res = [
			`if ${node.test} ${node.operator || 'then'}`,
			node.consequent
		];

		if (node.alternate) {

			if (!Array.isArray(node.alternate)) { node.alternate = [node.alternate] }

			let alt = [
				'else',
				node.alternate
			];
			res = res.concat(alt);
		}
		// res = res.join(LINEBRK);
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
			node.body,
			')'
		];//.join(LINEBRK);
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
	//*/
};
//-----------------------------------------------------------------------------------
function mxsMinify(cst) {
	return visit(cst, visitorPatterns);
}
module.exports = { mxsMinify, visit, visitorPatterns };
