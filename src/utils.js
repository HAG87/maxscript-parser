const fsi = require('mz/fs');

const JsonFileWrite = (file, source) =>
{
	fsi.writeFileSync(file, JSON.stringify(source, null, 2),
	err => {
		if (err)
			console.error(err);
		return;
	});
};
const FileWrite = (file, source) =>
{
	fsi.writeFileSync(file, source,
	err => {
		if (err)
			console.error(err);
		return;
	});
};
module.exports = {FileWrite, JsonFileWrite};