/**
 * Retrieve an object-path notation pruning n branches/leafs
 * Partially extracted from ast-monkey-util
 * @param {string} path The path of the current node/key
 * @param {int} level Level to retrieve
 */
function parentPath(path, level = 1) {
	if (typeof path === "string") {
		// AST must have at least two dots:
		if (!path.includes(".") || !path.slice(path.indexOf(".") + 1).includes(".")) {
			// zero is the root level's first element
			return "0";
		}
		return (
			path.split('.').slice(0, -level).join('.')
		);
	}
}
//-----------------------------------------------------------------------------------
module.exports = {
	parentPath,
}