@{%
	const mxLexer = require('./mooTokenize.js')
%}
# USING MOO LEXER
@lexer mxLexer
main -> cont:+

cont -> _ | number

_ -> %ws {% d => null %}
#===============================================================
#TOKENS
#===============================================================
number -> %posint | %negint | %number