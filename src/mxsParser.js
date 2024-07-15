"use strict";
const crypto = require('crypto');
// const process = require('process');
//-----------------------------------------------------------------------------------
const nearley = require('nearley');
const grammar = require('./grammar.js');
const mxLexer = require('./mooTokenize.js');
// const { FileWrite, JsonFileWrite } = require('./utils.js');
// const { resolve } = require('path');
//-----------------------------------------------------------------------------------
function replaceWithWS(str) {
	let ref = [...str];
	return ref.reduce((acc, next) => { return acc + ' '; }, '');
}

/**
 * Tokenize mxs string
 */
function tokenizeSource(source, filter) {
	if (!source) { return; }

	if (typeof filter === Array) {
		mxLexer.next = (next => () => {
			let tok;
			// IGNORE TOKEN TYPE IN FILTER....
			while ((tok = next.call(mxLexer)) && (filter.includes)) /* empty statement */;
			// if ( token.type != "comment_BLK" && token.type != "comment_SL" ) { toks.push(token); }
			return tok;
		})(mxLexer.next);
	}
	// feed the tokenizer
	mxLexer.reset(source);

	let token;
	let toks = [];

	// read tokens
	while ((token = mxLexer.next())) {
		toks.push(token);
	}
	// return JSON.stringify(toks);
	return toks;
}

/** Declare a new parser isntance */
function declareParser() {
	return new nearley.Parser(
		nearley.Grammar.fromCompiled(grammar),
		{
			keepHistory: true,
			// lexer: mxLexer
		});
}

/**
 * List of possible tokens to overcome the error
 */
function PossibleTokens(parserInstance) {
	var possibleTokens = [];
	var lastColumnIndex = parserInstance.table.length - 2;
	var lastColumn = parserInstance.table[lastColumnIndex];
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
			return parserInstance.buildFirstStateStack(state, []);
		}, this);
	// Display each state that is expecting a terminal symbol next.
	stateStacks.forEach(function (stateStack) {
		var state = stateStack[0];
		var nextSymbol = state.rule.symbols[state.dot];

		possibleTokens.push(nextSymbol);
	}, this);
	return possibleTokens;
}

class mxsParseSource {
	constructor(source) {
		this._declareParser();
		this.__source = source || '';
		this.ParseSource();
	}
	/** Declare a new parser instance */
	_declareParser() { this.parserInstance = declareParser(); }
	/** get the source Stream */
	get source() { return this.__source; }
	/**	Set new source, and re-parse */
	set source(newSource) {
		this.__source = newSource;
		this._declareParser();
		this.ParseSource();
	}
	/** Get the parsed CST, if any */
	get parsedCST() { return this.__parsedCST || this.parserInstance.results[0] || []; }
	/** Tokenize mxs string */
	TokenizeSource(filter) { return tokenizeSource(this.__source, filter); }

	/**
	 *
	 * @param {String} source String to parse
	 * @param {nearley.parser} parserInstance Instance of initialized parser
	 * @param {Integer} tree Index of the parsed tree I want in return, results are multiple when the parser finds and ambiguity
	 */
	ParseSource() {
		this.__parserState = this.parserInstance.save();
		try {
			/*
			let srcSplit = this.__source.split(/(?:[^\\][\s\t]*)(?=\n)/g);
			for (const line of srcSplit) {
				console.log(line);
				this.parserInstance.feed(line);
				console.log(process.memoryUsage().heapUsed + '  ' + process.memoryUsage().heapTotal);
				// console.log(process.memoryUsage().heapTotal);
				// process.memoryUsage().heapUsed
			}
			*/
			this.parserInstance.feed(this.__source);
			// console.log('PARSE TREES: ' + this.parserInstance.results.length);
			this.__parsedCST = this.parserInstance ? this.parserInstance.results[0] || [] : [];
		} catch (err) {
			console.log('--ERROR--');
			throw err;
			// console.log(err);

			// this.parserInstance.restore(this.__parserState);
			// let newErr = this.parseWithErrors();
			// throw newErr;
		}
	}
	/** Parser with error recovery */
	parseWithErrors() {
		// regen the parser
		this._declareParser()
		// COULD BE A WAY TO FEED TOKENS TO THE PARSER?
		// console.log('PARSE ERRORS')
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
				newErr.message += ' Unrecoverable errors.';
				newErr.recoverable = false;
			}
			newErr.tokens = badTokens;
			newErr.details = errorReport;
			return newErr;
		}
		// for (var next = 0; next < total; next++) {
		while (next <= total) {
			try {
				this.parserInstance.feed(src[next].value);
				state = this.parserInstance.save();
				// console.log(src[next].value);
			} catch (err) {
				// return;
				// /*
				// catch non parsing related errors.
				if (!err.token) { throw err; }
				// console.log(err.token);
				badTokens.push(src[next]);
				// FEATURE DISBLED 
				// errorReport.push({ token: src[next], alternatives: PossibleTokens() });

				let filler = replaceWithWS(err.token.text);
				err.token.text = filler;
				err.token.value = filler;
				err.token.type = "ws";
				// src.splice(next, 1, err.token);
				src[next] = err.token;
				next--;

				this.parserInstance.restore(state);
				// */
			}
			next++;			
		}

		this.__parsedCST = this.parserInstance.results[0] || [];
		report();
	}
}
//-----------------------------------------------------------------------------------
module.exports = { mxsParseSource, tokenizeSource, declareParser };