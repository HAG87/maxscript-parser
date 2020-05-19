"use strict";
const crypto = require('crypto');
//-----------------------------------------------------------------------------------
const nearley = require('nearley');
const grammar = require('./grammar.js');
const mxLexer = require('./mooTokenize.js')
//-----------------------------------------------------------------------------------
class mxsParseSource {
    constructor (source) {
        this.__source = source;
		this.parsedAST = this.ParseSource();
		this.SourceHash = mxsParseSource.HashSource(source);
    };

    parserInstance = new nearley.Parser(
        nearley.Grammar.fromCompiled(grammar),
        {
            keepHistory: true,
            lexer: mxLexer
	});

	get source() {
		return this.__source;
	};

	set source(newSource) {
		this.__source = newSource;
		this.parsedAST = this.ParseSource();
	}
    /**
     * Tokenize mxs string
     * @param {moo.lexer} lexer
     * @param {string} source
     */
    TokenizeSource() {
        //if (!source) {return null;}
        try {
            // feed the tokenizer
            mxLexer.reset(this.__source);

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
    };
	/**
	 *
	 * @param {String} source String to parse
	 * @param {nearley.parser} parserInstance Instance of initialized parser
	 * @param {Integer} tree Index of the parsed tree I want in return, results are multiple when the parser finds and ambiguity
	 */
	ParseSource(tree = 0) {

        try {
            // feed the parser
            this.parserInstance.feed(this.__source);

            /*// TODO: implement parser re-feed after error.
            I could replace the offending token with possible alternatives until the parser takes in.
            This could provide wrong results, so I must mark as invalid this branch/leaf
            let savedParse;
            //savedParse = parser.save()
            //*/
            // Resolve. the ATS
            return (this.parserInstance.results[tree]);

        } catch (err) {
            // offending token is err.token
            // Reject. This returns the offending token and a list of possible solutions
            // offset is useless bc indicates the token index, not the char in source. token.offset is what I want
            //TODO: Implement some error skip. I could save the parser change the offending token for one of the spected,
            // and try muy luck parsing the rest. OR parse all again changing that token in the input stream.
            err.alternatives = this._PossibleTokens(err.token, this.parserInstance);
            throw err;
        }
    };
    _PossibleTokens(token) {
        var possibleTokens = [];
        //var lines = [];
        //var tokenDisplay = (token.type ? token.type + " token: " : "") + JSON.stringify(token.value !== undefined ? token.value : token);
        //lines.push(this.lexer.formatError(token, "Syntax error"));
        //lines.push('Unexpected ' + tokenDisplay + '. Instead, I was expecting to see one of the following:\n');
        var lastColumnIndex = this.parserInstance.table.length - 2;
        var lastColumn = this.parserInstance.table[lastColumnIndex];
        var expectantStates = lastColumn.states
            .filter(function(state) {
                var nextSymbol = state.rule.symbols[state.dot];
                return nextSymbol && typeof nextSymbol !== "string";
            });

        // Display a "state stack" for each expectant state
        // - which shows you how this state came to be, step by step.
        // If there is more than one derivation, we only display the first one.
        var stateStacks = expectantStates
            .map(function(state) {
                return this.parserInstance.buildFirstStateStack(state, []);
            }, this);
        // Display each state that is expecting a terminal symbol next.
        stateStacks.forEach(function(stateStack) {
            var state = stateStack[0];
            var nextSymbol = state.rule.symbols[state.dot];

            possibleTokens.push(nextSymbol);
            //var symbolDisplay = this.getSymbolDisplay(nextSymbol);
            //lines.push('A ' + symbolDisplay + ' based on:');
            //this.displayStateStack(stateStack, lines);
        }, this);
        //lines.push("");
        //return lines.join("\n");
        return possibleTokens;
    };
	static HashSource(source) {
		return crypto.createHash('md5').update(source).digest('hex');
	}

}
//-----------------------------------------------------------------------------------
module.exports = mxsParseSource;