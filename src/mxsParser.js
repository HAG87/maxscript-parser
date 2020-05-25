"use strict";
const crypto = require('crypto');
//-----------------------------------------------------------------------------------
const nearley = require('nearley');
const grammar = require('./grammar.js');
const mxLexer = require('./mooTokenize.js');
//-----------------------------------------------------------------------------------
class mxsParseSource {
	constructor(source) {
		this._declareParser();
		this.__source = source;
		this.hash = mxsParseSource.HashSource(this.__source);
		this.ParseSource();
	}
	/** Declare a new parser isntance */
	_declareParser() {
		this.parserInstance = new nearley.Parser(
			nearley.Grammar.fromCompiled(grammar),
			{
				keepHistory: true,
				// lexer: mxLexer
			});
		// this.parserInstance.feed('');
		this.__parserState = this.parserInstance.save();
	}
	/** get the source Stream */
	get source() { return this.__source; }
	/**	Set new source, and re-parse */
	set source(newSource) {
		this.__source = newSource;
		// this._declareParser();
		// this.__sourceStream = newSource;
		this.reset();
		this.hash = mxsParseSource.HashSource(this.__source);
		this.ParseSource();
		// this.__parsedAST = this.ParseSource();
	}
	/** Get the parsed AST, if any */
	get parsedAST() { return this.parserInstance.results[0]; }
	/** Reset the parser * */
	reset () { this._declareParser(); }
	/**
	 * Tokenize mxs string
	 * @param {moo.lexer} lexer
	 * @param {string} source
	 */
	TokenizeSource(filter) {

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
		mxLexer.reset(this.__source);

		let token;
		let toks = [];

		while ((token = mxLexer.next())) {
			// if ( token.type != "comment_BLK" && token.type != "comment_SL" ) { toks.push(token); }
			//TODO: Catch tokenizer errors.
			toks.push(token);
		}
		return toks;
	}
	/**
	 *
	 * @param {String} source String to parse
	 * @param {nearley.parser} parserInstance Instance of initialized parser
	 * @param {Integer} tree Index of the parsed tree I want in return, results are multiple when the parser finds and ambiguity
	 */
	ParseSource() {
		// Set a clean state
		// this.parserInstance.feed('');
		// this.__parserState = this.parserInstance.save();

		try {
			this.parserInstance.feed(this.__source);
		} catch (err) {
			console.log('-->error REPARSE');

			// this.next = this.__source;

			this.__setStore();
			this.parserInstance.restore(this.__parserState);
			this.__parseWhitErrors();
			return;
			// throw err;
		}
		this.__parserState = this.parserInstance.save();
		// return;
	}
	/** feed Stream to active parser */
	feed(str) {
		this.__parserState = this.parserInstance.save();
		try {
			this.parserInstance.feed(str);
		} catch (err) {
			err.alternatives = this._PossibleTokens();
			this.parserInstance.restore(this.__parserState);

			throw err;
		}
	}

	__setStore() {
		this.next = this.__source;
		this.remain = '';
		this.badTokens = [];
		this.errorReport = [];
		this.Offset = 0;
	}
	__parseWhitErrors() {
		// console.log('--------------------------------re-feed--------------------------------');
		try {
			this.parserInstance.feed(this.next);
			// this.__parserState = this.parserInstance.save();
			this.next = this.remain;
		} catch (err) {
			// console.log('-->error TOKEN: ' + err.token.text);
			let errToken =  err.token;
			let currPos = errToken.offset;
			let nextPos = errToken.offset + (errToken.text.length || 0);

			// NEXt token
			// let nextToken =  this.parserInstance.lexer.next();
			// let nextPos = nextToken.offset;
			// let nextPos = nextToken ? nextToken.offset : errToken.offset + (errToken.text.length || 0);

			// token Offset from the text start
			this.Offset = this.__source.length - this.next.length + currPos;

			// Collect bad tokens
			err.token.offset = this.Offset;
			delete err.token.line;
			delete err.token.col;
			this.badTokens.push(err.token);
			this.errorReport.push({token:err.token, expected:this._PossibleTokens()});

			// Restore the parser to previous state
			this.parserInstance.restore(this.__parserState);
			// if (!nextToken) {
			if (!this.parserInstance.lexer.next()) {
				// console.log('EOF');
				// restore last valid parser state
				this.parserInstance.restore(this.__parserState);

				console.log(this.parserInstance.results[0]);

				if (this.parserInstance.results[0]) {
					let newErr = new Error('Parser finished with errors');
						newErr.name = 'ERR_RECOVER';
						newErr.badTokens = this.badTokens;
						newErr.details = this.errorReport;
					throw newErr;
				} else {
					console.log('unrecoverable error');
					err.name = 'ERR_FATAL';
					throw err
				}
			}
			// console.log('Pos till start:' + this.Offset);
			// console.log('current length: '+this.next.length +' || '+this.__source.length);
			// console.log('current off: '+currPos);
			// console.log(this.next[currPos] +' || '+ this.next[nextPos]);
			// REMAINING text
			this.remain = this.next.slice(nextPos);
			// Re-parse the valid lines
			this.next = this.next.slice(0,currPos);
			// Restore the parser to previous state
			// this.parserInstance.restore(this.__parserState);
		}
		// if (this.counter <= 1) {console.log('force exit'); return;}
		// this.next = this.remain;
		this.__parserState = this.parserInstance.save();
		this.__parseWhitErrors();
	}
	/**
	 * List of possible tokens to overcome the error
	 */
	_PossibleTokens() {
		var possibleTokens = [];
		var lastColumnIndex = this.parserInstance.table.length - 2;
		var lastColumn = this.parserInstance.table[lastColumnIndex];
		var expectantStates = lastColumn.states
			.filter(function (state) {
				var nextSymbol = state.rule.symbols[state.dot];
				return nextSymbol && typeof nextSymbol !== "string";
			});
		// Display a "state stack" for each expectant state
		// - which shows you how this state came to be, step by step.
		// If there is more than one derivation, we only display the first one.
		var stateStacks = expectantStates
			.map(function (state) {
				return this.parserInstance.buildFirstStateStack(state, []);
			}, this);
		// Display each state that is expecting a terminal symbol next.
		stateStacks.forEach(function (stateStack) {
			var state = stateStack[0];
			var nextSymbol = state.rule.symbols[state.dot];

			possibleTokens.push(nextSymbol);
		}, this);
		return possibleTokens;
	}
	/** MD5 hash */
	static HashSource(source) {
		return crypto.createHash('md5').update(source).digest('hex');
	}
}
//-----------------------------------------------------------------------------------
module.exports = mxsParseSource;