var tokenize = function(input, emit) {
    var lexer = mxLexer.reset(input);
    var lex = function() { return lexer.next(); }

    var tok = lex();
    var last;
    var peeked;

    function next() {
      if (peeked) {
        peeked = null;
        return peeked;
      }
      last = tok;
      tok = lex();
    }
    function peek() {
      return peeked = lex();
      // return peeked ? peeked : peeked = lex();
    }

    var stack = [];
    var currentIndent = 0;

    while (tok) {
      var indent = 0;
      var indentation = '';
      if (tok.type === 'ws' && (!last || last.type === 'newline' || last.type === 'NL')) {
        indentation = tok.value;
        indent = indentation.length;
        next();
      }
      if (tok.type === 'comment') {
        // TODO encoding declarations
        emit(tok);
        next();
        // assert tok.type === 'newline' ?
      }
      if (tok.type === 'newline') {
        tok.type = 'NL';
        emit(tok);
        next();
        continue;
      }

      var parenlev = 0;
      var isLine = true;
      while (tok && isLine) {
        switch (tok.type) {
          case 'ws':
            next();
            continue;
          case 'continuation':
            next();
            if (tok.type === 'newline') {
              next();
            }
            continue;
          case 'newline':
            if (parenlev) {
              // implicit line continuation
              tok.type = 'NL';
            } else {
              isLine = false;
            }
            emit(tok);
            next();
            break;
           /*
          case 'OP':
            if (/[([{]/.test(tok.value[0])) {
              parenlev++;
            } else if (/[)\]}]/.test(tok.value[0])) {
              parenlev = Math.max(0, parenlev - 1);
            }
          */
          case 'lparen': parenlev++;
          case 'rparen':  parenlev = Math.max(0, parenlev - 1);

            // fall-thru
          default:
            if (indent !== null) {
              // emit INDENT or DEDENT
              if (indent > currentIndent) {
                stack.push(currentIndent);
                currentIndent = indent;
                emit({ type: 'INDENT', value: indentation });
              } else {
                while (indent < currentIndent) {
                  currentIndent = stack.pop();
                  emit({ type: 'DEDENT', value: '' });
                }
                if (indent > currentIndent) {
                 // throw err('IndentationError', "unindent does not match any outer indentation level");
                }
              }
              indent = null;
            }
            emit(tok);
            next();
        }
      }
    }

    while (currentIndent) {
      currentIndent = stack.pop();
      emit({ type: 'DEDENT', value: '' });
    }
    emit({ type: 'ENDMARKER', value: '' });
  };
  function outputTokens(source) {
    var tokens = [];
    tokenize(source, function emit(token) {
      if (token.type != 'NL' && token.type != 'newline') {
        tokens.push(token.type + ' ' + JSON.stringify(token.value));
      }
    });
    return tokens;
  }

/*
//var arr = outputTokens(exampletext);

//console.log(arr.join('\n'));

 var file = fs.createWriteStream('dump.txt');
 file.on('error', function(err) { });

 arr.forEach(function(v) { file.write(v + '\n'); });

 file.end();
// */