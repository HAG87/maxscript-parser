// import * as fs from 'fs';
// import nearley from 'nearley';
// import mxLexer from './mooTokenize.js';
// import * as grammar from './grammar.js';

const fs = require('fs');
const nearley = require('nearley');
const grammar = require('./grammar.js');
const mxLexer = require('./mooTokenize.js')
//-----------------------------------------------------------------------------------
/* NOTES
  - use identifier to feed symbolprovider
  - use nearley for outliner and lint
  - use all tokens for uglyfier.. or parser result??
*/
//-----------------------------------------------------------------------------------
var exampletext = (fs.readFileSync('examples/ds/reflectCore.ms')).toString();
//-----------------------------------------------------------------------------------
/*
  mxLexer.next = (next => () => {
    let tok;
    // IGNORING COMMENTS....
    while ((tok = next.call(mxLexer)) && (tok.type === "comment_BLK" || tok.type === "comment_SL") ) { }
    return tok;
  })(mxLexer.next);
  //*/

  // should implement some async functions to call the tokenizer-parser...

 function dumpTokens(lexer) {
  lexer.reset(exampletext);
  let token;
  let toks = [];

  while (token = mxLexer.next()) {
    toks.push(token)
    // if ( token.type != "comment_BLK" && token.type != "comment_SL" ) { toks.push(token); }
  }

  fs.writeFile('./dump.json', JSON.stringify(toks, null, " "), err => {
    if (err)
      console.error(err);
    return;
  });
}
//-----------------------------------------------------------------------------------
 function main(content,tree) {
  // Create a Parser object from our grammar.
  const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
  // Parse something!
  try {
    parser.feed(content);
    console.log('PARSER TREES: ' + parser.results.length.toString() );
    const ast = parser.results[tree];
    // write the parse tree to a file
    fs.writeFile(('./ast').concat( tree.toString(),'.json'), JSON.stringify(ast, null, " "), err => {
      if (err)
        console.error(err);
      return;
    });

    console.log('Parse Tree sucess\n');

  } catch (e) {
    // need a way to re-feed the parser from the error....
    console.log("Error at character " + e.offset);

    fs.writeFile('./error.txt', e.message, err => {
      if (err)
        console.error(err);
      return;
    });
    // console.log(e.message);
  }
}

 dumpTokens(mxLexer);


 main(exampletext, 0);


//-----------------------------------------------------------------------------------
console.log('TERMINATED!!!\n');