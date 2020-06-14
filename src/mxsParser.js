"use strict";
const crypto = require('crypto');
const process = require('process');
//-----------------------------------------------------------------------------------
const nearley = require('nearley');
const grammar = require('./grammar.js');
const mxLexer = require('./mooTokenize.js');
const { FileWrite, JsonFileWrite } = require('./utils.js');
const { resolve } = require('path');

//-----------------------------------------------------------------------------------
function replaceWithWS(str) {
	let ref = [...str];
	return ref.reduce((acc,next) => { return acc + ' ';}, '');
}

class mxsParseSource {
	constructor(source) {
		this._declareParser();
		this.__source = source || '';
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
	}
	/** get the source Stream */
	get source() { return this.__source; }
	/**	Set new source, and re-parse */
	set source(newSource) {
		this.__source = newSource;
		this.hash = mxsParseSource.HashSource(this.__source);
		this.reset();
		this.ParseSource();
	}
	/** Get the parsed CST, if any */
	get parsedCST() {
		return this.__parsedCST || this.parserInstance.results[0];
		// return this.parserInstance.results[0];
	}
	/** Reset the parser * */
	reset() { this._declareParser(); }
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
	/** feed Stream to active parser */
	feed(str) {
		try {
			this.parserInstance.feed(str);
		} catch (err) {
			err.details = [{ token: err.token, expected: this._PossibleTokens() }];
			this.parserInstance.restore(this.__parserState);
			throw err;
		}
		this.__parserState = this.parserInstance.save();
		this.__parsedCST = this.parserInstance.results[0];
	}
	/**
	 *
	 * @param {String} source String to parse
	 * @param {nearley.parser} parserInstance Instance of initialized parser
	 * @param {Integer} tree Index of the parsed tree I want in return, results are multiple when the parser finds and ambiguity
	 */
	ParseSource() {
		// Set a clean state
		// /*
		try {
			this.parserInstance.feed(this.__source);
			this.__parserState = this.parserInstance.save();
			console.log('PARSE TREES: '+ this.parserInstance.results.length);
			this.__parsedCST = this.parserInstance.results[0];
		} catch (err) {
			// this.parserInstance.restore(this.__parserState);
			// this.reset();
			this.__parseWithErrors();
			// throw err;
			/*
			.then((response) => {
				console.log('ERROR CHECK FINISHED');
				// console.log(response);
				// throw response;
				// return Promise.reject(response);
				return response;

			});
			*/
		}
	}
	/**
	 * Parser with error recovery
	 */
	__parseWithErrors() {
		// regen the parser
		this.reset();
		// COULD BE A WAY TO FEED TOKENS TO THE PARSER?
		console.log('PARSE ERRORS')
		let src = this.TokenizeSource();
		// let state;
		let state = this.parserInstance.save();
		let badTokens = [];
		let errorReport = [];

		let next = 0;
		let total = src.length - 1;

		let report = () => {
			// console.log('PARSE TREES: ' + this.parserInstance.results.length);
			let newErr = new Error('Parser failed.');
			if (this.parserInstance.results[0]) {
				// newErr.name = 'ERR_RECOVER';
				newErr.recoverable = true;
			} else {
				// newErr.name = 'ERR_FATAL';
				newErr.message +=  ' Unrecoverable errors.';
				newErr.recoverable = false;
			}
			newErr.tokens = badTokens;
			newErr.details = errorReport;
			return newErr;
		}
		// for (var next = 0; next < total; next++) {
		while(next <= total) {
			try {
				// process.stdout.write(src[next].text);
				this.parserInstance.feed(src[next].toString());
			} catch (err) {
				// catch non parsing related errors.
				if (!err.token) { throw err; }
				// console.log(err.token);
				badTokens.push(src[next]);
				errorReport.push({token:src[next], alternatives: this.PossibleTokens() });
				// /*
				let filler = replaceWithWS(err.token.text);
				err.token.text = filler;
				err.token.value = filler;
				err.token.type = "ws";
				src.splice(next, 1, err.token);
				// src[next] = err.token;
				next--;
				// */
				this.parserInstance.restore(state);
			}
			next++;
			state = this.parserInstance.save();
		}
		report();
		// */
		/*
		let promise = new Promise((resolve, reject) => {
			let parsings = (src, next, total) => {
				// console.log(badTokens);
				try {
					this.parserInstance.feed(src[next].text);
				} catch (err) {
					// catch non parsing related errors.
					if (!err.token) { reject(err); }
					if (!err.token) { throw err; }

					badTokens.push({...src[next]});
					errorReport.push({token:{...src[next]}, alternatives: this._PossibleTokens() });

					let filler = replaceWithWS(err.token.text);
					err.token.text = filler;
					err.token.value = filler;
					err.token.type = "ws";

					// src.splice(next, 1, err.token);
					src[next] = err.token;

					next -= 1;
					this.parserInstance.restore(state);
				}
				state = this.parserInstance.save();

				if (next === total) {
					resolve(report());
				} else {
					setImmediate( () => parsings(src, next + 1, total));
					// return  parsings(src, next + 1, total);
				}
			};
			parsings(src, 0, total);
		});
		return new Promise((resolve, reject) =>{
			promise.then((response) => {
				// console.log(response);
				resolve(response);
			}, (error) => {
				reject(error);
			})
		});
		// */
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