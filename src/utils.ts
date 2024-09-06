import fs from 'fs';
import path from 'path';

export const JsonFileWrite = (file:  string, source: string) =>
{
	fs.writeFileSync(file, JSON.stringify(source, null, 2));
};
export const FileWrite = (file: string, source: string) =>
{
	fs.writeFileSync(file, source);
};
export function readDirR(dir: string): string[] {
    return fs.statSync(dir).isDirectory()
        ? Array.prototype.concat(...fs.readdirSync(dir).map(f => readDirR(path.join(dir, f))))
        : [dir];
}
export function prefixPath(fp: string, ext = ['ms', 'mcr'], prefix = 'min_') {
	const file = path.basename(fp);
	const dir = path.dirname(fp);
	const ex = path.extname(fp);
	if (ext.includes(ex)) {
		return path.join(dir, prefix + file);
	}
	return;
}