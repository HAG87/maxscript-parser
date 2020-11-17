const mxLexer = require('./mooTokenize.js');
const mxLexer2 = require('./mooTokenize-formatter.js');

function TokenizeSource(source, filter) {
    if (typeof filter === Array) {
        mxLexer.next = (next => () => {
            let tok;
            // IGNORING COMMENTS....
            while ((tok = next.call(mxLexer)) && (filter.includes)) /* empty statement */;
            return tok;
        })(mxLexer.next);
    }
    //if (!source) {return null;}
    // feed the tokenizer
    mxLexer.reset(source);

    let token;
    let toks = [];

    while ((token = mxLexer.next())) {
        // if ( token.type != "comment_BLK" && token.type != "comment_SL" ) { toks.push(token); }
        //TODO: Catch tokenizer errors.
        toks.push(token);
    }
    // console.log(toks);
    return toks;
}

function TokenizeSourceFormat(source, filter) {
    if (typeof filter === Array) {
        mxLexer2.next = (next => () => {
            let tok;
            // IGNORING COMMENTS....
            while ((tok = next.call(mxLexer2)) && (filter.includes)) /* empty statement */;
            return tok;
        })(mxLexer2.next);
    }
    //if (!source) {return null;}
    // feed the tokenizer
    mxLexer2.reset(source);

    let token;
    let toks = [];

    while ((token = mxLexer2.next())) {
        // if ( token.type != "comment_BLK" && token.type != "comment_SL" ) { toks.push(token); }
        //TODO: Catch tokenizer errors.
        toks.push(token);
    }
    // console.log(toks);
    return toks;
}

module.exports = {TokenizeSource, TokenizeSourceFormat};