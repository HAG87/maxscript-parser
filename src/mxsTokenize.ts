const mxLexer = require('./backend/mooTokenize.js');
import { mxsFormatterLexer } from './backend/mooTokenize-formatter';

export function TokenizeSource(source: string, filter?: string[])
{
    const lexer = mxLexer()
    if (filter) {
        lexer.next = (next => () =>
        {
            let tok;
            // IGNORING COMMENTS....
            while ((tok = next.call(lexer)) && (filter.includes)) /* empty statement */;
            return tok;
        })(lexer.next);
    }
    //if (!source) {return null;}
    // feed the tokenizer
    lexer.reset(source);

    let token;
    let toks = [];

    while ((token = lexer.next())) {
        // if ( token.type != "comment_BLK" && token.type != "comment_SL" ) { toks.push(token); }
        //TODO: Catch tokenizer errors.
        toks.push(token);
    }
    // console.log(toks);
    return toks;
}

export function TokenizeSourceFormat(source: string, filter?: string[])
{
    const lexer = mxsFormatterLexer()
    if (filter) {
        lexer.next = (next => () =>
        {
            let tok;
            // IGNORING COMMENTS....
            while ((tok = next.call(mxsFormatterLexer)) && (filter.includes)) /* empty statement */;
            return tok;
        })(lexer.next);
    }
    //if (!source) {return null;}
    // feed the tokenizer
    lexer.reset(source);

    let token;
    let toks = [];

    while ((token = lexer.next())) {
        // if ( token.type != "comment_BLK" && token.type != "comment_SL" ) { toks.push(token); }
        //TODO: Catch tokenizer errors.
        toks.push(token);
    }
    // console.log(toks);
    return toks;
}