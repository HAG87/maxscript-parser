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

	kw_about(node) { return node.text; },
	kw_as(node) { return node.text; },
	kw_at(node) { return node.text; },
	kw_bool(node) { return node.text; },
	kw_by(node) { return node.text; },
	kw_case(node) { return node.text; },
	kw_catch(node) { return node.text; },
	kw_collect(node) { return node.text; },
	kw_compare(node) { return node.text; },
	kw_context(node) { return node.text; },
	kw_coordsys(node) { return node.text; },
	kw_defaultAction(node) { return node.text; },
	kw_do(node) { return node.text; },
	kw_else(node) { return node.text; },
	kw_exit(node) { return node.text; },
	kw_for(node) { return node.text; },
	kw_from(node) { return node.text; },
	kw_function(node) { return node.text; },
	kw_global(node) { return node.text; },
	kw_group(node) { return node.text; },
	kw_if(node) { return node.text; },
	kw_in(node) { return node.text; },
	kw_level(node) { return node.text; },
	kw_local(node) { return node.text; },
	kw_macroscript(node) { return node.text; },
	kw_mapped(node) { return node.text; },
	kw_menuitem(node) { return node.text; },
	kw_not(node) { return node.text; },
	kw_null(node) { return node.text; },
	kw_objectset(node) { return node.text; },
	kw_of(node) { return node.text; },
	kw_on(node) { return node.text; },
	kw_parameters(node) { return node.text; },
	kw_persistent(node) { return node.text; },
	kw_plugin(node) { return node.text; },
	kw_rcmenu(node) { return node.text; },
	kw_return(node) { return node.text; },
	kw_rollout(node) { return node.text; },
	kw_scope(node) { return node.text; },
	kw_separator(node) { return node.text; },
	kw_set(node) { return node.text; },
	kw_struct(node) { return node.text; },
	kw_submenu(node) { return node.text; },
	kw_then(node) { return node.text; },
	kw_time(node) { return node.text; },
	kw_to(node) { return node.text; },
	kw_tool(node) { return node.text; },
	kw_try(node) { return node.text; },
	kw_uicontrols(node) { return node.text; },
	kw_undo(node) { return node.text; },
	kw_utility(node) { return node.text; },
	kw_when(node) { return node.text; },
	kw_where(node) { return node.text; },
	kw_while(node) { return node.text; },
	kw_with(node) { return node.text; },

	error(node) { return node.text; },
};

// Transformation rules.
let visitorPatterns = {
	// TOKENS
	...tokensValue,
	// LITERALS
	Literal(node) { return node.value; },
	Identifier(node) { return node.value; },
	// Literal   : wrap(nodeValue),
	// Identifier: wrap(nodeValue),

	Parameter(node) {
		return new expr(node.value, ':');
	},
	BitRange(node) {
		return new expr(node.start, '..', node.end);
	},
	//-------------------------------------------------------------------------------------------
	// DECLARATION
	Declaration(node) {
		let res;
		// console.dir(parent, {depth: null});
		res = new statement(node.id);

		if (node.value) {
			// console.log(node.value);

			res.add(node.operator, ...toArray(node.value));
			// if (isArrayUsed(node.value)) {
			// }
		}
		console.log(res);

		return res;
	},
	// /*
	// Types
	ObjectArray(node) {
		let res = new statement('#(');

		if (isArrayUsed(node.elements)) {
			// console.log('elems');

			let elems = new elements();
			node.elements.forEach(
				e => {
					// jsut to be safe, it should be reduced by now...
					if (isArrayUsed(e)) {
						elems.add(
							new codeblock(...e)
						);
					} else {
						elems.add(e);
					}
				});
			res.add(elems);
		} else {
			res.add(node.elements);
		}
		res.add(')');

		return res;
	},
	ObjectBitArray(node) {
		let res = new statement('#{');

		if (isArrayUsed(node.elements)) {
			let elems = new elements();
			node.elements.forEach(
				e => {
					// jsut to be safe, it should be reduced by now...
					if (isArrayUsed(e)) {
						elems.add(
							new codeblock(...e)
						);
					} else {
						elems.add(e);
					}
				});
			res.add(elems);
		} else {
			res.add(node.elements);
		}
		res.add('}');

		return res;
	},
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
		return res;
	},
	AccessorProperty(node) {
		let res = new expr(
			node.operand,
			'.',
			node.property
		);
		return res;
	},
	// Call
	CallExpression(node) {
		let args = Array.isArray(node.args) ? node.args : [node.args];
		let res = new statement(
			node.calle,
			...args
		);
		// console.dir(res, { depth: null });
		return res;
	},
	// Assign
	ParameterAssignment(node) {
		// let res = `${node.param}: ${node.value || SPACER}`
		let res = new statement(
			node.param,
			node.value,
		);
		// console.dir(res, { depth: null });
		return res;
	},
	AssignmentExpression(node) {
		let res = new statement(
			node.operand,
			node.operator,
			node.value
		);
		return res;
	},
	// Functions
	Function(node) {
		let stat = new statement(
			node.mapped || null,
			node.keyword,
			node.id,
			...toArray(node.args),
			...toArray(node.params),
			'='
		);
		let res = new codeblock(
			stat,
			node.body
		);
		return res;
	},
	FunctionReturn(node) {
		let res = new statement(
			'return',
			node.body || ';'
		);
		return res;
	},
	// Declarations
	VariableDeclaration(node) {
		let decls;
		if (isArrayUsed(node.decls)) {
			if (node.decls.length > 1) {
				decls = new elements(...node.decls);
				decls.listed = true;
			} else {
				decls = node.decls
			}
		} else {
			decls = [node.decls]
		}

		let res = new statement(
			node.modifier,
			node.scope,
			...decls
		);
		// console.dir(res, { depth: null });
		return res;
	},
	// SIMPLE EXPRESSIONS - OK
	// TODO: This will need and exeption for --
	MathExpression(node) {
		let res = new statement(
			node.left,
			node.operator,
			node.right
		);
		// console.dir(res, { depth: null });
		return res;
	},
	LogicalExpression(node) {
		let res = new statement(
			node.left,
			node.operator,
			node.right
		);
		return res;
	},
	// TODO: This will need and exeption for --
	UnaryExpression(node) {
		let res = new expr(
			node.operator,
			node.right
		);
		return res;
	},
	// STATEMENTS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
	BlockStatement(node) {
		let res = new codeblock(
			'(',
			...toArray(node.body), //.flat(),	//.map(x => '\t' + x),
			')'
		);
		/*
		if (isArrayUsed(node.body)) {
			res = new codeblock(
				'(',
				...toArray(node.body),
				')'
			);
		} else {
			res = new statement(
				'(',
				node.body,
				')'
			);
		}
		*/
		// console.dir(res, {depth: null});
		// console.log(node.body.map(x => '\t' + x));
		// console.log('-------------------');
		return res;
	},
	IfStatement(node) {
		let res = new statement(
			'if',
			node.test,
			node.operator,
			node.consequent
		);
		if (node.alternate) {
			res.add(
				'else',
				node.alternate
			);
		}
		return res;
	},
	TryStatement(node) {
		let test = new statement(
			'try',
			node.body
		);
		let catcher = new statement(
			'catch',
			node.finalizer
		);
		let res = new codeblock(
			test,
			catcher
		);
		return res;
	},
	DoWhileStatement(node) {
		// let res = new codeblock(
		let stat = new statement(
			'do',
			node.body,
		);
		let test = new statement(
			'while',
			node.test
		);
		let res = new codebloc(
			stat,
			test,
		);
		return res;
	},
	WhileStatement(node) {
		// let stat = new statement(
		let res = new statement(
			'while',
			node.test,
			'do',
			node.body
		);
		/* let res = new codeblock(
			stat,
			node.body,
		); */
		return res;
	},
	ForStatement(node) {
		// let stat = new statement(
		let res = new statement(
			'for',
			node.variable,
			node.iteration,
			node.value,
			...toArray(node.sequence.value),
			node.action,
			node.body
		);
		/* let res = new codeblock(
			stat,
			node.body
		); */
		return res;
	},
	ForLoopSequence(node) {
		let _to = isArrayUsed(node.to) ? ['to', node.to] : null;
		let _by = isArrayUsed(node.by) ? ['by', node.by] : null;
		let _while = isArrayUsed(node.while) ? ['while', node.while] : null;
		let _where = isArrayUsed(node.where) ? ['where', node.where] : null;

		let stats = [].join(_to, _by, _while, _where).filter(e => e != null);

		let res = new statement(
			...stats
		);

		return res;
	},
	LoopExit(node) {
		let res = new statement('exit');
		if (node.body) {
			res.add(
				'with',
				node.body
			);
		} else {
			res.add(';')
		}
		return res;
	},
	CaseStatement(node) {
		let stat  = new statement(
			'case',
			node.test,
			'of'
		);
		let res = new codeblock(
			stat,
			'(',
			...toArray(node.cases),
			')'
		);
		return res;
	},
	CaseClause(node) {
		//let spacer = /\d$/mi.test(node.case) ? SPACER : '';
		//let short = /\n/mi.test(node.body) ? LINEBRK : ' ';
		// let res = `${node.case}${spacer}:${short}${node.body}`;
		let res = new statement(
			node.case,
			':',
			node.body
		);
		// console.dir(res, { depth: null });
		return res;
	},
	// context expressions
	ContextStatement(node) {
		let res = new statement(
			node.context,
			node.body
		);
		return res;
	},
	ContextExpression(node) {
		let res = new statement(
			node.prefix,
			node.context,
			...toArray(node.args)
		);
		return res;
	},
	// Struct >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
	Struct(node) {
		let stat = new statement(
			'struct',
			node.id
		);
		let res = new codeblock(stat, '(');
		if (isArrayUsed(node.body)) {
			// handle struct members...
			let stack;
			//let temp;
			node.body.forEach( e => {
				// test for structScope
				if (typeof e === 'string' && /(?:private|public)$/mi.test(e)) {
					res.add(e);
					if (stack) {
						res.add(stack);
						stack = undefined;
					}
				} else {
					if (!stack) {
						stack = new elements(e);
						stack.list = true;
					} else {
						stack.add(e);
					}
				}
			});
		} else {
			res.add(node.body);
		}
		res.add(')');

		// console.dir(res, { depth: null });

		/*
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
		*/
		return res;
	},
	StructScope(node) { return node.value; },
	// StructScope: wrap(nodeValue);
	//-------------------------------------------------------------------------
	// Plugin
	EntityPlugin(node) {
		let stat = new statement(
			'plugin',
			node.superclass,
			node.class,
			...toArray(node.params)
		)
		let res = new codeblock(
			stat,
			'(',
			node.body,
			')'
		)
		return res;
	},
	EntityPlugin_params(node) {
		let stat = new statement(
			'parameters',
			node.id,
			...toArray(node.params)
		);
		let res = new codeblock(
			stat,
			'(',
			node.body,
			')'
		);
		return res;
	},
	PluginParam(node) {
		let res = new statement(
			node.id,
			...toArray(node.params)
		);
		return res;
	},
	// Tool
	EntityTool(node) {
		let decl = new statement(
			'tool',
			node.id,
			...toArray(node.params)
		);
		let res = new codeblock(
			decl,
			'(',
			node.body,
			')'
		);
		return res;
	},
	// MacroScript
	EntityMacroscript(node) {
		let decl = new statement(
			'macroScript',
			node.id,
			node.title,
		);
		let res = new codeblock(
			decl,
			...toArray(node.params),
			'(',
			node.body,
			')'
		);
		// console.dir(res, { depth: null });
		return res;
	},
	// Utility - Rollout
	EntityUtility(node) {
		let decl = new statement(
			'utility',
			node.id,
			node.title,
			...toArray(node.params)
		);
		let res = new codeblock(
			decl,
			'(',
			node.body,
			')'
		);
		return res;
	},
	EntityRollout(node) {
		let decl = new statement(
			'rollout',
			node.id,
			node.title,
			...toArray(node.params)
		);
		let res = new codeblock(
			decl,
			'(',
			node.body,
			')'
		);
		// console.dir(res, { depth: null });
		return res;
	},
	EntityRolloutGroup(node) {
		let res = new codeblock(
			new statement('group', node.id),
			'(',
			node.body,
			')'
		);
		// console.dir(res, {depth: null});
		return res;
	},
	EntityRolloutControl(node) {
		let res = new statement(
			node.class,
			node.id,
			node.text,
			...toArray(node.params)
		);
		// console.dir(res, {depth: null});
		return res;
	},
	// rcMenu
	EntityRcmenu(node) {
		let res = new codeblock(
			new statement('rcmenu', node.id),
			'(',
			node.body,
			')'
		);
		return res;
	},
	EntityRcmenu_submenu(node) {
		let stat = new statement(
			'subMenu',
			node.label,
			...toArray(node.params)
		);
		let res = new codeblock(
			stat,
			'(',
			node.body, //TODO: this should be spreaded in all rules
			')'
		);
		return res;
	},
	EntityRcmenu_menuitem(node) {
		let res = new statement(
			'menuItem',
			node.id,
			node.label,
			...toArray(node.params)
		);
		return res;
	},
	EntityRcmenu_separator(node) {
		let res = new statement(
			'separator',
			node.id,
			...toArray(node.params)
		);
		return res;
	},
	// Event
	Event(node) {
		let stat = new statement(
			'on',
			...toArray(node.args),
			node.modifier
		);
		let res = new codeblock(
			stat,
			node.body
		);
		// console.dir(res, {depth: null});
		return res;
	},
	EventArgs(node) {
		let res = new statement(
			node.target,
			node.event,
			...toArray(node.args)
		);
		return res;
	},
	WhenStatement(node) {
		let stat = new statement(
			'when',
			...node.args.flat(),
			'do'
		);
		let res = new codeblock(
			stat,
			node.body
		);
		return res;
	},
};
//-----------------------------------------------------------------------------------
function mxsMinify(cst) {
	return visit(cst, visitorPatterns);
}
module.exports = { mxsMinify, visit, visitorPatterns };
