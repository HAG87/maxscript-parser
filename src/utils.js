const fs = require('fs');
const path = require('path');

const JsonFileWrite = (file, source) =>
{
	fs.writeFileSync(file, JSON.stringify(source, null, 2),
	err => {
		if (err)
			console.error(err);
		return;
	});
};
const FileWrite = (file, source) =>
{
	fs.writeFileSync(file, source,
	err => {
		if (err)
			console.error(err);
		return;
	});
};
function readDirR(dir) {
    return fs.statSync(dir).isDirectory()
        ? Array.prototype.concat(...fs.readdirSync(dir).map(f => readDirR(path.join(dir, f))))
        : [dir];
}
function prefixPath(fp, ext = ['ms', 'mcr'], prefix = 'min_') {
	let file = path.basename(fp);
	let dir = path.dirname(fp);
	let ex = path.extname(fp);
	if (ext.includes(ex)) {
		let nf = path.join(dir, prefix + file);
		return nf;
	}
	return;
}
exports.prefixPath = prefixPath;

module.exports = {FileWrite, JsonFileWrite, readDirR, prefixPath};