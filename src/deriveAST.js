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

/*
{
    start: startOffset,
    end: endOffset
}
*/

function derive(tree) {
	function _visit(node, parent, key, level, index) {
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
		let res;
		if (getNodeType(node) && parent) {
			// if ('indent' in node) { node.indent = level; }
			// res = node.toString;
            console.log(JSON.stringify(parent));
            // console.log(node);
            if ('line' in node || 'col' in node) {
                // set in parent ??
                // will this work? need to check if the pos is deeper, bc I dont know hot to pass only de deeper child...
                // console.log(node.line);
            }
            // console.log(parent);
		} else {
			res = node;
		}
		index != null ? parent[key][index] = res : parent[key] = res;
	}
	_visit(tree, tree, null, 0, null);
}

module.exports = { derive };
