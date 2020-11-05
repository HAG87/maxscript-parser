const mxsTokenizer = require('./mxsTokenize.js');
const { TextEdit, Range, Position } = require('vscode-languageserver');

/**
 * filter nodes by type property
 * @param {any} node CST node
 */
function getNodeType(node) {
    return ('type' in node) ? node.type : undefined;
}
function checkNodeType(node, type) {
    return getNodeType(node) === type;
}

function _EditText(line, col, length, newText) {
    return {
        range: Range.create(Position.create(line, col), Position.create(line, col + length)),
        newText: newText
    };
}

function mxsSimpleTextEditFormatter(src) {
    var tokenizedSource = mxsTokenizer.TokenizeSource(src);
    var indentation = 0;
    var edits = [];

    const filterCurrent = ['newline', 'delimiter'];
    const filterAhead = ['newline', 'delimiter', 'sep', 'param'];

    const IndentTokens = ['lparen', 'arraydef', 'lbracket', 'lbrace', 'bitarraydef'];
    const UnIndentTokens = ['rparen', 'rbracket', 'rbrace'];

    // CAREFUL!! DO NOT OVERLAP EDITS!!!

    // loop
    for (let i = 0; i < tokenizedSource.length; i++) {
        // current token
        let ctok = tokenizedSource[i];
        // next token
        let ntok = tokenizedSource[i + 1];
        // exit if no next token
        if (ntok === undefined) { break; }
        // console.log(ctok);
        // indentation
        if (IndentTokens.includes(ctok.type)) { indentation++; }
        if (UnIndentTokens.includes(ntok.type)) { indentation--; }
        // console.log(indentation);
        // edit whitespace
        if (ctok.type === 'ws') {
            // more than one space, fix this
            // need to add a check for invalid whitespaces
            if (!/^[\u0020\u2002\u2003]$/mg.test(ctok.toString())) {
                edits.push(
                    _EditText(ctok.line, ctok.col, ctok.value.length - 1, ' ')
                );
            }
            continue;
        }

        // skip token (non newline) if next is whitespace
        if (ctok.type !== 'newline' && ntok.type === 'ws') { continue; }

        // skip tokens where whitespace btw doesn't apply
        if (!filterCurrent.includes(ctok.type) && !filterAhead.includes(ntok.type)) {
            // deal with missing whitespaces
            edits.push(
                _EditText(ctok.line, ctok.col, ctok.value.length - 1, ctok + ' ')
            );
            continue;
        }

        // deal with new lines and indentation
        if (ctok.type === 'newline') {
        // console.log(ctok.type);
        // console.log('newline ' + indentation);
            edits.push(
                _EditText(ctok.line, ctok.col, ctok.value.length - 1, '\n' + '\t'.repeat(indentation))
            );
        }
    }

    // add whitespaces
    // skip if next token is whitespace

    // indentation & new lines

    return edits;
}

function mxsSimpleFormatter(src) {
    var _tokenizedSource = mxsTokenizer.TokenizeSource(src);
    // var Readable = require('stream').Readable
    // var out = new Readable();
    // out._read = () => {}; // redundant?
    var indentation = 0
    var out = '';

    // filter out whitespace
    var tokenizedSource = _tokenizedSource.filter(x => x.type !== 'ws');

    const filterCurrent = ['newline', 'delimiter'];
    const filterAhead = ['newline', 'delimiter', 'sep', 'param'];

    const checkNL = (token) => {
        if (token.type === 'newline') {
            return '\n' + '\t'.repeat(indentation);
        } else {
            return token;
        }
    };

    for (let i = 0; i < tokenizedSource.length; i++) {

        let ctok = tokenizedSource[i];
        let ntok = tokenizedSource[i + 1];

        if (ntok === undefined) {
            out += ctok;
            // out.push(ctok);
            //EOL
            // out.push(null);
            break;
        }

        // this will only work with balanced pairs
        if (ctok.type === 'lparen' || ctok.type === 'arraydef') {
            indentation++
        }
        if (ntok.type === 'rparen') {
            indentation--
        }

        // skip tokens...
        let addSpace = ntok === undefined || filterCurrent.includes(ctok.type) || filterAhead.includes(ntok.type);
        // avoid inserting space after newline

        out += addSpace ? checkNL(ctok) : checkNL(ctok) + ' ';
        // out.push(addSpace ? checkNL(ctok) : checkNL(ctok) + ' ');
    }
    return out;
}
module.exports = { mxsSimpleFormatter, mxsSimpleTextEditFormatter }