//-----------------------------------------------------------------------------------
let INDENT = '-';
let SPACER = ' ';
let LINEBRK = '\n';
//-----------------------------------------------------------------------------------
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
/**
 * Apply node transform to PARENT KEY!
 */
function editNode(callback, node, parent, key, level, index) {
	let res = callback(node, parent, key, level, index);
	// console.dir(res, {depth: null});
	index != null ? parent[key][index] = res : parent[key] = res;
}

function removeNode(node, parent, key, index) {
	if (key in parent) {
		index != null ? parent[key].splice(index, 1) : delete parent[key]
	}
}
//-----------------------------------------------------------------------------------
/**
 * Visit and derive CST to a recoverable code map
 * @param {any} node CST node
 * @param {any} callbackMap Patterns function
 */
function derive(node, callbackMap) {

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
			if (parent) {
				editNode.call(this, callbackMap[nodeType], node, parent, key, level, index);
			} else {
				// console.log(node);
			}
		} else {
			// valid nodes but missing from rules...
		}
	}
	_visit(node, null, null, 0, null);
	// return node;
	// console.dir(node, { depth: null });
}

/**
 * Visit and derive Code from a recoverable code map
 * @param {any} tree CodeMap node
 */
function reduce(tree) {
	function _visit(node, parent, key, level, index) {

		// if (key === 'value') {level++;}

		const keys = Object.keys(node);
		for (let i = 0; i < keys.length; i++) {
			let key = keys[i];
			// console.log(key);
			// for (const key in node) {
			const child = node[key];
			if (Array.isArray(child)) {
				// level++;
				for (let j = 0; j < child.length; j++) {
					if (isNode(child[j])) {
						_visit(child[j], node, key, level + 1, j)
					}
				}
			}
			else if (isNode(child)) {
				// level++;

				_visit(child, node, key, level, null);
			}
		}
		// level++;
		// if (key === 'value') {level++;}

		// TODO: INDENTATION...
		if (node.type && parent) {
			if (node.type === 'codeblock') {
				node.indent = level;
			}
			// INDENT = '-'.repeat(level);

			index != null ? parent[key][index] = node.toString : parent[key] = node.toString;
			/*
			if (parent) {
				if (index != null) {
					parent[key][index] = node.toString;
				} else {
					parent[key] = node.toString;
				}
			} else {
				// console.log(node.toString);
			}*/
		}
	}
	_visit(tree, null, null, 0, null)
}
//-----------------------------------------------------------------------------------
// utility functions
const isArrayUsed = val => Array.isArray(val) && val.length;
const toArray = val => Array.isArray(val) ? val : [val];
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
function wrapInParens(node, key) {
	return [
		'(',
		...toArray(node[key]),
		')'
	];
}
*/
//-----------------------------------------------------------------------------------
// Objects to construct the codeMap...EXPTESSION | STATEMENT | ELEMENTS | CODEBLOCK
// join elems with WS, one line:
class statement {
	constructor(...args) {
		this.type = 'statement';
		this.value = [];
		this.add(...args);
	}

	get toString() {
		if (SPACER !== '') {
			return this.value.filter(e => e != null).join(SPACER);
		} else {
			let w = /\w$/im;
			let s = /\W$/im;
			let m = /-$/im;

			let res = this.value.filter(e => e != null).reduce((acc, curr) => {
				let sep = '';
				if (
					// alpha - alpha
					w.test(acc) && w.test(curr)
					// minus - minus
					|| m.test(acc) && m.test(curr)
					// alpha - minus
					|| w.test(acc) && m.test(curr)
					// minus - alpha
					// || m.test(acc) && w.test(curr)
				) { sep = ' '; }
				return (acc + sep + curr);
			}, '');
			return res;
		}
	}

	add(...value) {
		this.value = this.value.concat(...value.filter(e => e != null));
	}
}
// join elemns with NL.. block of code
//block
class codeblock {
	constructor(...args) {
		this.type = 'codeblock';
		this.value = [];
		this.add(...args);
		this.indent = 0;
	}

	get toString() {
		if (this.value.length > 3 || this.value[1].includes('\n')) {
			// console.log(this.value);
			// console.log(this.value.join(LINEBRK));
			// console.log('--------');
			/*
			// let first = this.value.shift();
			let last = this.value.pop();
			let str = this.value.join(LINEBRK + INDENT.repeat(this.indent));
			// return [].concat(first, str, last).join(LINEBRK + INDENT.repeat(this.indent > 0 ? this.indent-1 : 0));
			return [].concat(str, last).join(LINEBRK);// + INDENT.repeat(this.indent >= 1 ? this.indent-1 : this.indent));
			// */
			// return this.value.join(LINEBRK + INDENT.repeat(this.indent));
			return this.value.join(LINEBRK);
		} else {
			return this.value.filter(e => e != null).join('');
		}
	}

	add(...value) {
		if (value[0] != null) {
			this.value = this.value.concat(...value.filter(e => e != null));
		}
	}
}

class codeGroup {
	constructor(...args) {
		this.type = 'codeblock';
		this.value = [];
		this.add(...args);
		this.indent = 0;
	}

	get toString() {
		console.log(this.value);
		if (this.value.length > 2 || (this.value.length > 2 && this.value[2].includes('\n'))) {
			// /*
			// let first = this.value.shift();
			// let last = this.value.pop();
			let str = this.value.join(LINEBRK + INDENT.repeat(this.indent));
			return [].concat('(', str, ')').join(LINEBRK);
			// return str.concat(LINEBRK, '-'.repeat(this.indent > 0 ? this.indent-1 : 0), last);
			// */
			// return this.value.filter(e => e != null).join(LINEBRK + INDENT.repeat(this.indent));
			// return this.value.filter(e => e != null).join(LINEBRK);
		} else {
			return '(' + this.value.join('') + '~';
		}
	}

	add(...value) {
		if (value[0] != null) {
			this.value = this.value.concat(...value.filter(e => e != null));
		}
	}
}

//list
// join elems with ',' list of items
class elements {
	constructor(...args) {
		this.listed = false
		this.type = 'elements';
		this.value = [];
		this.add(...args);
	}

	get toString() {
		if (this.listed && LINEBRK !== ';') {
			return this.value.filter(e => e != null).join(',' + LINEBRK);
		} else {
			return this.value.filter(e => e != null).join(',' + SPACER);
		}
	}

	add(...value) {
		if (value[0] != null) {
			this.value = this.value.concat(...value.filter(e => e != null));
		}
	}
}
// expressions
class expr {
	constructor(...args) {
		this.type = 'expr';
		this.value = [];
		this.add(...args);
	}

	get toString() {
		return this.value.filter(e => e != null).join('');
	}

	add(...value) {
		this.value = this.value.concat(...value.filter(e => e != null));
	}
}
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
		res = new statement(node.id);
		return res;
	},
	// Types
	ObjectArray(node) {
		let res = new statement('#(');

		if (isArrayUsed(node.elements)) {
			// console.log('elems');

			let elems = new elements();
			node.elements.forEach(
				e => {
					// just to be safe, it should be reduced by now...
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
					// just to be safe, it should be reduced by now...
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
		return new statement(
			node.calle,
			...toArray(node.args)
		);
	},
	// Assign
	ParameterAssignment(node) {
		let res = new statement(
			node.param,
			node.value,
		);
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
			...toArray(node.body)
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
			...toArray(decls)
		);
		return res;
	},
	// SIMPLE EXPRESSIONS - OK
	// TODO: This will need and exeption for --
	MathExpression(node) {
		return new statement(
			node.left,
			node.operator,
			node.right
		);
	},
	LogicalExpression(node) {
		return new statement(
			node.left,
			node.operator,
			node.right
		);
	},
	// TODO: This will need and exeption for --
	UnaryExpression(node) {
		return new expr(
			node.operator,
			node.right
		);
	},
	// STATEMENTS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
	BlockStatement(node) {
		// /*
		let res = new codeblock(
			'(',
			...toArray(node.body),
			')'
		);
		// */
		// let res = new codeGroup(...toArray(node.body));
		return res;
	},
	IfStatement(node) {
		let res;
		let stat = new statement(
			'if',
			node.test,
			node.operator,
			// node.consequent
		);

		if (node.consequent.type === 'codeblock') {
			res = new codeblock(
				stat,
				node.consequent
			);
			if (node.alternate) {
				res.add(
					'else',
					node.alternate
				);
			}
		} else {
			stat.add(node.consequent);

			if (node.alternate) {
				if (node.alternate.type === 'codeblock') {
					stat.add('else');
					res = new codeblock(stat, node.alternate);
				} else {
					stat.add('else', node.alternate);
					res = stat;
				}
			} else {
				res = stat;
			}

		}
		return res;
	},
	TryStatement(node) {
		let test = new statement(
			'try',
			...toArray(node.body)
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
		let stat = new statement(
			'do',
			...toArray(node.body),
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
		let res = new statement(
			'while',
			node.test,
			'do',
			...toArray(node.body)
		);
		return res;
	},
	ForStatement(node) {
		let res;
		let stat = new statement(
			'for',
			node.variable,
			node.iteration,
			node.value,
			...toArray(node.sequence),
			node.action,
			// ...toArray(node.body)
		);
		if (node.body.type === 'codeblock') {
			res = new codeblock(stat, ...toArray(node.body));
		} else {
			stat.add(...toArray(node.body));
			res = stat;
		}
		return res;
	},
	ForLoopSequence(node) {
		let _to = node.to || isArrayUsed(node.to) ? ['to', ...toArray(node.to)] : null;
		let _by = node.by || isArrayUsed(node.by) ? ['by', ...toArray(node.by)] : null;
		let _while = node.while || isArrayUsed(node.while) ? ['while', ...toArray(node.while)] : null;
		let _where = node.where || isArrayUsed(node.where) ? ['where', ...toArray(node.where)] : null;

		let stats = [].concat(_to, _by, _while, _where).filter(e => e != null);
		
		return new statement( ...stats );
	},
	LoopExit(node) {
		let res = new statement('exit');
		if (node.body) {
			res.add(
				'with',
				...toArray(node.body)
			);
		} else {
			res.add(';')
		}
		return res;
	},
	CaseStatement(node) {
		let stat = new statement(
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
			...toArray(node.body)
		);
		return res;
	},
	// context expressions
	ContextStatement(node) {
		return new statement(
			node.context,
			node.body
		);
	},
	ContextExpression(node) {
		return new statement(
			node.prefix,
			node.context,
			...toArray(node.args)
		);
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
			node.body.forEach(e => {
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
			...toArray(node.body),
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
			...toArray(node.body),
			')'
		);
		return res;
	},
	PluginParam(node) {
		return new statement(
			node.id,
			...toArray(node.params)
		);
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
			...toArray(node.body),
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
			...toArray(node.body),
			')'
		);
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
			...toArray(node.body),
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
			...toArray(node.body),
			')'
		);
		return res;
	},
	EntityRolloutGroup(node) {
		return new codeblock(
			new statement('group', node.id),
			'(',
			...toArray(node.body),
			')'
		);
	},
	EntityRolloutControl(node) {
		return new statement(
			node.class,
			node.id,
			node.text,
			...toArray(node.params)
		);
	},
	// rcMenu
	EntityRcmenu(node) {
		return new codeblock(
			new statement('rcmenu', node.id),
			'(',
			...toArray(node.body),
			')'
		);
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
			...toArray(node.body),
			')'
		);
		return res;
	},
	EntityRcmenu_menuitem(node) {
		return new statement(
			'menuItem',
			node.id,
			node.label,
			...toArray(node.params)
		);
	},
	EntityRcmenu_separator(node) {
		return new statement(
			'separator',
			node.id,
			...toArray(node.params)
		);
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
		return res;
	},
	EventArgs(node) {
		return new statement(
			node.target,
			node.event,
			...toArray(node.args)
		);
	},
	WhenStatement(node) {
		let stat = new statement(
			'when',
			...node.args.flat(),
			'do'
		);
		let res = new codeblock(
			stat,
			...toArray(node.body)
		);
		return res;
	},
};
//-----------------------------------------------------------------------------------
function mxsReflow(cst) {
	// derive code tree
	derive(cst, visitorPatterns);
	// reduce the tree. use options
	reduce(cst);
	console.log(cst[0]);
	return cst[0];
}
module.exports = { mxsReflow, visit: derive, visitorPatterns };
