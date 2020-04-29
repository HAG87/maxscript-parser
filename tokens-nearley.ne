
#===============================================================
# TOKENS
#===============================================================
# IDENTIFIERS- OK
var_name -> iden {% d =>({id:d[0]}) %}
		  | "&" iden {% d =>({id:d[1]}) %}
iden -> alphanum {% dropKeyword %}
#---------------------------------------------------------------
path_name -> "$" alphanum | "$"
#---------------------------------------------------------------
# path -> %kw_objectset:? ("/"):? (levels):? level_name
#---------------------------------------------------------------
# levels -> level | levels "/" level
# level -> level_name
# level_name -> %path
#---------------------------------------------------------------
#names
name_value -> "#" alphanum {% d => ({nameLiteral:(d[0] + d[1])}) %}
#Resources
resource -> "~" _string "~" {% d => ({'resourceID':d[1]}) %}
#pathname
path_name -> "$" alphanum {% d => d.join('') %}
#---------------------------------------------------------------
#Strings
string -> "\"" _string "\"" {% d => ({'string':d[1]}) %}
		| "@" string        {% d => ({'literal':d[1]}) %}

_string ->
	null {% d => "" %}
	| _string _stringchar {% d => d[0] + d[1] %}

_stringchar ->
	[^\\"] {% id %}
	| "\\" [^] {% function(d) {return JSON.parse("\"" + d[0] + d[1] + "\""); } %}
#--------------------------------------------------------------
# Time
#--------------------------------------------------------------
# Numbers
number -> _number {% d => ({number:d[0]}) %}
_number ->
	_int      {% id %}
	| _float  {% id %}
	| _double {% id %}
#---------------------------------------------------------------
_double -> _float "d" _int {% function(d) {return d[0] + d[1] + d[2]; }%}
#---------------------------------------------------------------
_float -> _int "." _posint {% function(d) {return d[0] + d[1] + d[2]; }%}
#---------------------------------------------------------------
_int -> _posint {% id %}
	#| "-" _posint {% function(d) {return d[0] + d[1]; }%}

_posint ->
	[0-9] {% id %}
	| _posint [0-9] {% function(d) {return d[0] + d[1]} %}

#---------------------------------------------------------------
bool -> ("true" | "on") {% d => true %}
		| ("false" | "off") {% d => false %}
#---------------------------------------------------------------
void ->
	     "undefined"  {% d => ({value:d[0]}) %}
	   | "unsupplied" {% d => ({value:d[0]}) %}
	   | "ok"         {% d => ({value:d[0]}) %}
#===============================================================
#BASIC TOKENS
alphanum -> _alphanum {% testAlphanum %}
_alphanum -> anchar:+ {% merge %}
#===============================================================
#PARENS WITH WHITESPACE
LPAREN ->  "(" _  {% d => null %}
RPAREN ->  _ ")"  {% d => null %}
#---------------------------------------------------------------
EOL -> _S (newline|";"):+ _S
#---------------------------------------------------------------
#Whitespace or not alphanum for the next chracter...
#Whitespace line continuations
# Whitespace
blank -> (_ newline):+ {% d => null %}

# one or more whitespace
_S_ -> (wschar | _CONT_):+     {% d => null %}
# zero or any withespace
_S -> (wschar | _CONT_):+ | null      {% d => null %}
# USE THIS FOR NON MANDATORY WHITESPACE
# zero or any withespace with NL
_ -> wsnlchar:+ | null     {% d => null %}
# USE THIS FOR MANDATORY WHITESPACE
# one or more whitespace with NL
# THIS COULD BE WRONG
__ -> ( wsnlchar | _CONT_ ):+    {% d => null %}
# LINE CONTINUATOR
_CONT_ -> _S "\\" _S newline {% d => null %}
# WHITESPACES THAT CAN BRE DROPPED IN STATEMENT WHEN:
#alpha / nonalpha
#nonalpha / alpha
#nonalpha / nonalpha
#===============================================================
anchar -> [A-Za-z_0-9]
digit -> [0-9]
wsnlchar -> [ \t\v\f\r\n] {% id %}
wschar -> [ \t\v\f]       {% id %}
newline -> [\n\r]         {% id %}
#===============================================================
@{%
	var keywords = [
	"about"    , "and"    , "animate"     , "as"         , "at"          , "by"     , "case"   ,  "catch" , "collect" , "continue" ,
	"coordsys" , "do"     , "dontcollect" , "else"       , "exit"        , "fn"     , "fn"     , "for"    , "from"    , "function" ,
	"global"   , "if"     , "in"          , "local"      , "macroscript" , "mapped" , "max"    , "not"    , "of"      , "off"      ,
	"ok"       , "on"     , "or"          , "parameters" , "persistent"  , "plugin" , "rcmenu" , "return" , "rollout" ,
	"set"      , "struct" , "then"        , "throw"      , "to"          , "tool"   , "try"    , "undo"   , "utility" ,
	"when"     , "where"  , "while"       , "with"       , "unsupplied"  , "undefined",
	"true"     , "false"  ,
	"angle",        "bitmap",        "button",       "checkbox",       "checkbutton",    "colorPicker", "combobox",
    "curvecontrol", "dotnetcontrol", "dropdownList", "edittext",       "groupBox",       "hyperLink",   "imgTag",
    "label",        "listbox",       "mapbutton",    "materialbutton", "multilistbox",   "pickbutton",  "popUpMenu",
    "progressbar",  "radiobuttons",  "slider",       "spinner",        "SubRollout",     "timer"

	]

	const dropKeyword = (d, l, r) => (keywords.includes(d[0]) ? r : d[0]);

	const flatten = arr => [].concat(...arr);

	const filterNull = arr => arr.filter(e => e != null );

	const merge = function (d) {
		var arr = [].concat(...d);
		return arr.join('');
	};

	const testAlphanum = function (d, l, reject) {
		var re = new RegExp("^\\d+$");

		// var str = merge(d);

		if (re.test(d[0])) {
            return reject;
        } else {
            return d[0];
        }
	};

	function dropNull(d) {
		// This doesn't work well, map doesn't change the array dimension.... I need to delete the null items. better use filter or something
		var arr = d.map( e => {

			//e.filter(e => e != null );

			if (Array.isArray(e)) {
				return filterNull(e);
			} else {
				return e;
			};

		});

		return arr;
	};

%}