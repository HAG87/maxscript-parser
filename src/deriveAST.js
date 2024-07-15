/**
 * Check if value is node
 * @param {any} node CST node
 */
function isNode(node)
{
	return (typeof node === 'object' && node != undefined);
}
/**
 * filter nodes by type property
 * @param {any} node CST node
 */
function getNodeType(node)
{
	return ('type' in node) ? node.type : undefined;
}
/**
 * Apply node transform to PARENT KEY!
 */
function editNode(callback, node, parent, key, level, index)
{
	let res = callback(node, parent, key, level, index);
	// apply indentation to hig-level rules
	// if (isNode(res) && 'indent' in res) { res.indent = level; }
	index != null ? parent[key][index] = res : parent[key] = res;
}
/*
function removeNode(node, parent, key, index) {
	if (key in parent) {
		index != null ? parent[key].splice(index, 1) : delete parent[key]
	}
}
*/


let startRange = (line, col) =>
({
	start: {
		line: line,
		character: col
	},
	end: {
		line: line,
		character: col
	}
});


function derive(tree)
{
	function _visit(node, parent, key, level, index)
	{
		const keys = Object.keys(node);
		for (let i = 0; i < keys.length; i++) {
			let key = keys[i];
			// for (const key in node) {
			const child = node[key];
			if (Array.isArray(child)) {
				for (let j = 0; j < child.length; j++) {
					if (isNode(child[j])) {
						_visit(child[j], node, key, level + 1, j);
					}
				}
			}
			else if (isNode(child)) {
				_visit(child, node, key, level + 1, null);
			}
		}

		if (getNodeType(node) && parent) {
			if ('range' in node) {
				if ('range' in parent) {
					// console.log(`${JSON.stringify(node.range)} >> ${JSON.stringify(parent.range)}`);
					if (node.range !== undefined && parent.range !== undefined) {
						if (parent.range.start.line < node.range.start.line) parent.range.end.line = node.range.start.line;
						if (parent.range.start.character < node.range.start.character) parent.range.end.character = node.range.start.character;

						if (parent.range.end.line < node.range.end.line) parent.range.end.line = node.range.end.line;
						if (parent.range.end.character < node.range.end.character) parent.range.end.character = node.range.end.character;
					}
				} else {
					parent.range = node.range;
				}
			} else if ('line' in node) {
				parent.range = startRange(node.line, node.col);
				// console.log(`${node.line} : ${node.col}`);
			}
		}

		index != null ? parent[key][index] = node : parent[key] = node;
	}
	_visit(tree, tree, null, 0, null);
}

module.exports = { derive };
