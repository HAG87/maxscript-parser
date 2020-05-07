const nearley = require('nearley');
const grammar = require('./grammar.js');
const mxLexer = require('./mooTokenize.js')
//-----------------------------------------------------------------------------------
// Create a Parser object from our grammar.
var parser = new nearley.Parser(
    nearley.Grammar.fromCompiled(grammar),
    {
        keepHistory: true,
        lexer: mxLexer
    });
//-----------------------------------------------------------------------------------
/**
 * Tokenize mxs string
 * @param {moo.lexer} lexer
 * @param {string} source
 */
function TokenizeSource(lexer = mxLexer, source) {
    //if (!source) {return null;}
    try {
        // feed the tokenizer
        lexer.reset(source);

        let token;
        let toks = [];

        while (token = mxLexer.next()) {
            // if ( token.type != "comment_BLK" && token.type != "comment_SL" ) { toks.push(token); }
            //TODO: Catch tokenizer errors.
            toks.push(token)
        }
        return toks;
    } catch (err) {
        // just rethrow...
        throw err
    }
}
//-----------------------------------------------------------------------------------
/**
 *
 * @param {String} source String to parse
 * @param {nearley.parser} parserInstance Instance of initialized parser
 * @param {Integer} tree Index of the parsed tree I want in return, results are multiple when the parser finds and ambiguity
 */
async function ParseSource(source, parserInstance = parser, tree = 0) {

    try {
        // feed the parser
        parserInstance.feed(source);

        /*// TODO: implement parser re-feed after error.
        I could replace the offending token with possible alternatives until the parser takes in.
        This could provide wrong results, so I must mark as invalid this branch/leaf
        let savedParse;
        //savedParse = parser.save()
        //*/
        // Resolve. the ATS
        return (parserInstance.results[tree]);
    } catch (err) {
        // offending token is err.token
        // This returns the offending token and a list of possible solutions
        let errCatch = PossibleTokens(err.token, parserInstance);
        // Reject. the error is the offending token plus possible tokens
        throw errCatch;
    }
}
//-----------------------------------------------------------------------------------
module.exports = {
    parser,
    TokenizeSource,
    ParseSource,
}