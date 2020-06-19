
const fs = require('fs');
const path = require('path');
//-----------------------------------------------------------------------------------
const mxsParseSource = require('./mxsParser.js');
const { FileWrite, JsonFileWrite, readDirR } = require('./utils.js');
//-----------------------------------------------------------------------------------
// const { find, get, set, drop, info, del, arrayFirstOnly, traverse, } = require('ast-monkey');
// const { pathNext, pathPrev, pathUp } = require('ast-monkey-util');
// const traverse2 = require('ast-monkey-traverse-with-lookahead');
// const objectPath = require("object-path");
//-----------------------------------------------------------------------------------
const mxLexer = require('./mooTokenize.js');
const {TokenizeSource} = require('./mxsTokenize.js')
const { visit, visitorPatterns } = require("./mxsCompactCode");
//-----------------------------------------------------------------------------------
const perf = require('execution-time')();
const chalk = require('chalk');
//-----------------------------------------------------------------------------------
// At beginning of your code
perf.start();
//-----------------------------------------------------------------------------------
// PROVIDE SYMBOLS
//-----------------------------------------------------------------------------------
let examples = {
	1:  'examples/example-1.ms',
	2:  'examples/example-2.ms',
	3:  'examples/example-3.ms',
	4:  'examples/example-4.ms',
	5:  'examples/example-5.ms',
	6:  'examples/example-6.ms',
	7:  'examples/example-7.ms',
	8:  'examples/example-8.ms',
}
//-----------------------------------------------------------------------------------
const source = (input_file) => (fs.readFileSync(input_file, 'utf8')).toString();
//-----------------------------------------------------------------------------------
function Main(src) {
	// JsonFileWrite('test/_tokens.json',TokenizeSource(source(src)));
	try {
		// TokenizeSource(source(src));
		var mxsParser = new mxsParseSource(source(src));
		// mxsParser.__parseWithErrors();
		JsonFileWrite('test/CST.json', mxsParser.parsedCST);
		return mxsParser.parsedCST;
	} catch (err) {
		console.log(err);
		FileWrite('test/error.txt', err.message);
		throw err;
	}
}
//-----------------------------------------------------------------------------------
// COMPRESS CODE
//-----------------------------------------------------------------------------------
function minify(source) {
	try {
		return visit(source, visitorPatterns);
	} catch (err) {
		console.log(err.message);
		throw err;
	}
}
//-----------------------------------------------------------------------------------
function transfPath(fp) {
	let file = path.basename(fp);
	let dir = path.dirname(fp);
	let ex = path.extname(fp);
	if (ex === '.ms' | ex === '.mcr') {
		let nf = path.join(dir, 'min_' + file);
		return nf;
	}
	return;
}
//-----------------------------------------------------------------------------------
function parseAndMinify (fPath) {
	let min = minify(Main(fPath));
	let fp = transfPath(fPath);
	if (fp) {
		FileWrite(fp, min);
		console.log('Success');
	}
}
//-----------------------------------------------------------------------------------
function collectStatements(node) {
	return _visit(node, null, null, 0, 0);
	function _visit(node, parent, key, level = 0) {
		let childStack = [];
		// get the node keys
		const keys = Object.keys(node);
		// loop through the keys
		for (let i = 0; i < keys.length; i++) {
			// child is the value of each key
			let key = keys[i];
			const child = node[key];
			// could be an array of nodes or just an object
			if (Array.isArray(child)) {
				// value is an array, visit each item
				for (let j = 0; j < child.length; j++) {
					// visit each node in the array
					if (isNode(child[j])) {
						let res = _visit(child[j], node, key, level + 1)
						// if (res) childStack = childStack.concat(res);
						if (res) childStack.push(res);
					}
				}
			} else if (isNode(child)) {
				let res = _visit(child, node, key, level + 1);
				if (res) childStack.push(res);
			} else {				
				// keys that contains values...
			}
		}
		// if (isNode(node) && childStack.length > 0) {
		// }
		if ('id' in node ) {
			return {node: node.type, childs: childStack};
		} else {
			if (childStack.length > 0) return childStack;
			else return;
		}
	}
}
//-----------------------------------------------------------------------------------
// parseAndMinify('examples/modules/maptoolsCore.ms');
// parseAndMinify('examples/common/corelib.ms');
// let CST = Main('examples/common/corelib.ms');
// let CST = Main(examples[2]);

/**
 * Check if value is node
 * @param {any} node CST node
 */
function isNode(node) {
	return (typeof node === 'object' && node != undefined);
}
/**
 * filter nodes by type property
 * @param {any} node CST node
 */
function getNodeType(node) {
	return ('type' in node) ? node.type : undefined;
}

function visitor(node, callback) {
	_visit(node, null, null, 0)
	function _visit(node, parent, key, level = 0) {
		if ('id' in node ) {	
			// console.log (node.type);
			callback(node, parent, level);
		}
		// get the node keys
		const keys = Object.keys(node);
		// loop through the keys
		for (let i = 0; i < keys.length; i++) {
			// child is the value of each key
			let key = keys[i];
			const child = node[key];
			// could be an array of nodes or just an object
			if (Array.isArray(child)) {
				// value is an array, visit each item
				for (let j = 0; j < child.length; j++) {
					// visit each node in the array
					if (isNode(child[j])) {
						 _visit(child[j], node, key, level + 1)
					}
				}
			} else if (isNode(child)) {
				_visit(child, node, key, level + 1);
			} else {				
				// keys that contains values...
			}
		}
	}
}
//-----------------------------------------------------------------------------------
const nearley = require('nearley');
const grammar = require('./grammar.js');
// this could work combined in a comparator of current document, ot checking if the passed document is still open...
function parseSourceAsync(source) {
	// function parser() {
		return new Promise((resolve, reject) => {
			// setTimeout(() => resolve('donewithit'), 0)
			// /*
			// delay execution
			setTimeout( () => {
				// check here if the editor document is valid.
				console.log("parser called");
				let mxsParser = new nearley.Parser(
					nearley.Grammar.fromCompiled(grammar),
					{
						keepHistory: true,
						// lexer: mxLexer
					});
				try {
					mxsParser.feed(source);
					console.log("parser done");

					resolve(mxsParser.results[0]);
				} catch (err) {
					// add here call to the errorParser()
					reject(err);
				}
			},1500);
			// */
		});
	// }
	/*
	let p = Promise.race([
		parser(),
		new Promise((resolve, reject) => {
			setTimeout(() => reject(new Error('request timeout')), 100)
		})
	]);
	return new Promise((resolve, reject) => {
		parser().then( response => {
			resolve(response);
		}, err => {
			reject(err);
		});
	});
	*/
}
/*
parseSourceAsync(source('examples/common/corelib.ms')).then((result) => {
	console.log("parser finished");
	console.log(result);
}, (err) => {
	// console.log('errors');
	console.log(err);
})
// */
//-----------------------------------------------------------------------------------
const cluster = require('cluster');
const http = require('http');
let workers = [];
const numCPUs = require('os').cpus().length; //number of CPUS

if (cluster.isMaster) {
	// Fork workers.
	for (var i = 0; i < numCPUs; i++) {
	  cluster.fork();    //creating child process
	}
  
	//on exit of cluster
	cluster.on('exit', (worker, code, signal) => {
		if (signal) {
		  console.log(`worker was killed by signal: ${signal}`);
		} else if (code !== 0) {
		  console.log(`worker exited with error code: ${code}`);
		} else {
		  console.log('worker success!');
		}
	});
  } else {
	  console.log('Message from worker!');
	// Workers can share any TCP connection
	// In this case it is an HTTP server
	// http.createServer((req, res) => {
	//   res.writeHead(200);
	//   res.end('hello world\n');
	// }).listen(3000);
  }

//-----------------------------------------------------------------------------------

// let CST = Main('examples/refGuidesObject.ms');
/*
let scripts = readDirR('examples');
scripts.forEach((fp, i) => {

	let file = path.basename(fp);
	let dir = path.dirname(fp);
	let ex = path.extname(fp);
	if (ex === '.ms' | ex === '.mcr') {
	// if (ex === '.ms' ) {
		if (!(/^min_/gmi.test(file))) {
			console.log(i + ': ' + file);
			
			let nf = path.join(dir, 'min', 'min_' + file);

			let CST = Main(fp);

			let COMPRESS = minify(CST);
			FileWrite(nf, COMPRESS);

			console.log('---------------');
		}
	}
});
// */
//-----------------------------------------------------------------------------------
// CODE MINIFIER TEST
// let CST = Main('examples/example-1.ms');
// let COMPRESS = minify(CST);
// FileWrite('test/compress.ms', COMPRESS);
//-----------------------------------------------------------------------------------
// At end of your code
const results = perf.stop();
console.log(results.time);  // in milliseconds