# Test for balancing parentheses, brackets, square brackets and pairs of "<" ">"

#exp -> _ _exp _
#    | lparen exp rparen #exp #{% TRUE %}
#   	| _exp _ exp


_exp ->
#     null
	 var_name				 {% id %} #	{% (d) => d[1] %}
    | _exp _ var_name  {% (d) => d %}


#===============================================================
var_name -> alphanum {% id %}
#===============================================================
lparen ->  "(" #{% (d) => null %}

rparen ->  ")"  #{% (d) => null %}


# Basic types
alphanum -> [A-Za-z_0-9]:+
{%
    function(d,l, reject) {

		var arr = d[0].join('');

		var re = new RegExp("^\\d+$");

		//return re.test(arr);
		// return arr;

        if (re.test(arr)) {
            return reject;
        } else {
            return arr;
        }
    }
%}



#===============================================================
#SYNTAX
EOL -> _ ( mbr | ";") _ {% (d) => null %}

# Whitespace
blank -> (newline _):+ {% (d) => null %}

_mbr -> null | _  mbr _
_br -> null | _  br _

br -> newline:*  {% (d) => null %}
mbr -> newline:+ {% (d) => null %}


_S -> wschar:*      {% (d) => null %}

_ -> wsnlchar:*     {% (d) => null %}

__ -> wsnlchar:+    {% (d) => null %}

___ -> (wsnlchar:+ | ___ ";" ) {% (d) => null %}


wsnlchar -> [ \t\v\f\r\n] {% id %}
wschar -> [ \t\v\f]       {% id %}
newline -> [\r\n]         {% id %}
