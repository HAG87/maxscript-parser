// moo tokenizer
import moo from 'moo';
//-----------------------------------------------------------------------------------
// CASE INSENSITIVE FOR KEYWORKDS
export const caseInsensitiveKeywords =
	(map: { [k: string]: string | string[] }): (text:string) => string =>
	{
		const transform: moo.TypeMapper = moo.keywords(map);

		return (text: string): string => transform(text.toLowerCase());
	};