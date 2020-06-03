const fs = require('fs');

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
module.exports = {FileWrite, JsonFileWrite};