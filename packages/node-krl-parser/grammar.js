// Generated automatically by nearley
// http://github.com/Hardmath123/nearley
(function () {
function id(x) {return x[0]; }


var last = function(arr){
  return arr[arr.length - 1];
};

var flatten = function(toFlatten){
  var isArray = Object.prototype.toString.call(toFlatten) === '[object Array]';

  if (isArray && toFlatten.length > 0) {
    var head = toFlatten[0];
    var tail = toFlatten.slice(1);

    return flatten(head).concat(flatten(tail));
  } else {
    return [].concat(toFlatten);
  }
};

var reserved_symbols = {
  "true": true,
  "false": true
};

////////////////////////////////////////////////////////////////////////////////
// ast functions
var noop = function(){};
var noopStr = function(){return ""};
var idAll = function(d){return flatten(d).join('')};
var idEndLoc = function(data, loc){return loc + flatten(data).join('').length};

var getN = function(n){
  return function(data){
    return data[n];
  };
};

var infixEventOp = function(op){
  return function(data, loc){
    return {
      type: 'event_op',
      loc: {start: data[0].loc.start, end: data[4].loc.end},
      op: op,
      args: [],
      expressions: [data[0], data[4]]
    };
  };
};

var booleanAST = function(value){
  return function(data, loc){
    var src = data[0];
    return {
      loc: {start: loc, end: loc + src.length},
      type: 'boolean',
      value: value
    };
  };
};

var infixOp = function(data, start){
  return {
    loc: {start: start, end: data[4].loc.end},
    type: 'infix',
    op: data[2],
    left: data[0],
    right: data[4]
  };
};

var grammar = {
    ParserRules: [
    {"name": "main", "symbols": ["_", "ruleset", "_"], "postprocess": getN(1)},
    {"name": "main", "symbols": ["expression"], "postprocess": id},
    {"name": "ruleset$string$1", "symbols": [{"literal":"r"}, {"literal":"u"}, {"literal":"l"}, {"literal":"e"}, {"literal":"s"}, {"literal":"e"}, {"literal":"t"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "ruleset$ebnf$1", "symbols": []},
    {"name": "ruleset$ebnf$1$subexpression$1", "symbols": ["rule", "_"]},
    {"name": "ruleset$ebnf$1", "symbols": ["ruleset$ebnf$1$subexpression$1", "ruleset$ebnf$1"], "postprocess": function arrconcat(d) {return [d[0]].concat(d[1]);}},
    {"name": "ruleset", "symbols": ["ruleset$string$1", "__", "symbol", "_", {"literal":"{"}, "_", "ruleset$ebnf$1", "loc_close_curly"], "postprocess": 
        function(data, loc){
          return {
            type: 'ruleset',
            loc: {start: loc, end: last(data)},
        
            name: data[2],
            rules: data[6].map(function(pair){
              return pair[0];
            })
          };
        }
        },
    {"name": "rule$string$1", "symbols": [{"literal":"r"}, {"literal":"u"}, {"literal":"l"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "rule", "symbols": ["rule$string$1", "__", "symbol", "_", {"literal":"{"}, "_", "rule_body", "_", "loc_close_curly"], "postprocess": 
        function(data, loc){
          var ast = data[6] || {};
          ast.type = 'rule';
          ast.loc = {start: loc, end: last(data)};
          ast.name = data[2];
          return ast;
        }
        },
    {"name": "rule_body", "symbols": ["_"], "postprocess": noop},
    {"name": "rule_body", "symbols": ["select_when"], "postprocess": 
        function(data, loc){
          return {
            select: data[0]
          };
        }
        },
    {"name": "rule_body", "symbols": ["select_when", "__", "event_action"], "postprocess": 
        function(data, loc){
          return {
            select: data[0],
            actions: [data[2]]
          };
        }
        },
    {"name": "select_when$string$1", "symbols": [{"literal":"s"}, {"literal":"e"}, {"literal":"l"}, {"literal":"e"}, {"literal":"c"}, {"literal":"t"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "select_when$string$2", "symbols": [{"literal":"w"}, {"literal":"h"}, {"literal":"e"}, {"literal":"n"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "select_when", "symbols": ["select_when$string$1", "__", "select_when$string$2", "__", "event_exprs"], "postprocess": 
        function(data, loc){
          return {
            type: 'select_when',
            loc: {start: loc, end: data[4].loc.end},
            event_expressions: data[4]
          };
        }
        },
    {"name": "event_exprs", "symbols": ["event_expression"], "postprocess": id},
    {"name": "event_exprs", "symbols": [{"literal":"("}, "_", "event_exprs", "_", {"literal":")"}], "postprocess": getN(2)},
    {"name": "event_exprs$string$1", "symbols": [{"literal":"o"}, {"literal":"r"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "event_exprs", "symbols": ["event_exprs", "__", "event_exprs$string$1", "__", "event_exprs"], "postprocess": infixEventOp('or')},
    {"name": "event_exprs$string$2", "symbols": [{"literal":"a"}, {"literal":"n"}, {"literal":"d"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "event_exprs", "symbols": ["event_exprs", "__", "event_exprs$string$2", "__", "event_exprs"], "postprocess": infixEventOp('and')},
    {"name": "event_expression", "symbols": ["event_domain", "__", "event_type"], "postprocess": 
        function(data, loc){
          return {
            type: 'event_expression',
            loc: {start: loc, end: data[2].loc.end},
            event_domain: data[0],
            event_type: data[2]
          };
        }
        },
    {"name": "event_domain", "symbols": ["symbol"], "postprocess": id},
    {"name": "event_type", "symbols": ["symbol"], "postprocess": id},
    {"name": "event_action$string$1", "symbols": [{"literal":"s"}, {"literal":"e"}, {"literal":"n"}, {"literal":"d"}, {"literal":"_"}, {"literal":"d"}, {"literal":"i"}, {"literal":"r"}, {"literal":"e"}, {"literal":"c"}, {"literal":"t"}, {"literal":"i"}, {"literal":"v"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "event_action$ebnf$1", "symbols": ["with_expression"], "postprocess": id},
    {"name": "event_action$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "event_action", "symbols": ["event_action$string$1", "_", "function_call_args", "_", "event_action$ebnf$1"], "postprocess": 
        function(data, loc){
          var ast = {
            type: 'send_directive',
            loc: {
              start: loc,
              end: data[4]
                ? data[4].loc.end
                : (last(data[2]) ? last(data[2]).loc.end : 0)
            },
            args: data[2]
          };
          if(data[4]){
            ast.with = data[4];
          }
          return ast;
        }
        },
    {"name": "function_call_args", "symbols": [{"literal":"("}, "_", "expression_list", "_", {"literal":")"}], "postprocess": getN(2)},
    {"name": "with_expression$string$1", "symbols": [{"literal":"w"}, {"literal":"i"}, {"literal":"t"}, {"literal":"h"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "with_expression", "symbols": ["with_expression$string$1", "__", "symbol_value_pairs"], "postprocess": 
        function(data, loc){
          var pairs = data[2];
          var last_pair = last(pairs);
          return {
            loc: {start: loc, end: (last_pair ? last_pair[1].loc.end : 0)},
            type: 'with_expression',
            pairs: pairs
          };
        }
        },
    {"name": "symbol_value_pairs", "symbols": ["symbol_value_pair"], "postprocess": function(d){return [d[0]]}},
    {"name": "symbol_value_pairs$string$1", "symbols": [{"literal":"a"}, {"literal":"n"}, {"literal":"d"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "symbol_value_pairs", "symbols": ["symbol_value_pairs", "__", "symbol_value_pairs$string$1", "__", "symbol_value_pair"], "postprocess": function(d){return d[0].concat([d[4]])}},
    {"name": "symbol_value_pair", "symbols": ["symbol", "_", {"literal":"="}, "_", "expression"], "postprocess": 
        function(data, loc){
          return [data[0], data[4]];
        }
        },
    {"name": "expression", "symbols": ["exp_or"], "postprocess": id},
    {"name": "exp_or", "symbols": ["exp_and"], "postprocess": id},
    {"name": "exp_or$string$1", "symbols": [{"literal":"|"}, {"literal":"|"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "exp_or", "symbols": ["exp_or", "_", "exp_or$string$1", "_", "exp_and"], "postprocess": infixOp},
    {"name": "exp_and", "symbols": ["exp_comp"], "postprocess": id},
    {"name": "exp_and$string$1", "symbols": [{"literal":"&"}, {"literal":"&"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "exp_and", "symbols": ["exp_and", "_", "exp_and$string$1", "_", "exp_comp"], "postprocess": infixOp},
    {"name": "exp_comp", "symbols": ["exp_sum"], "postprocess": id},
    {"name": "exp_comp", "symbols": ["exp_comp", "_", {"literal":"<"}, "_", "exp_sum"], "postprocess": infixOp},
    {"name": "exp_comp", "symbols": ["exp_comp", "_", {"literal":">"}, "_", "exp_sum"], "postprocess": infixOp},
    {"name": "exp_comp$string$1", "symbols": [{"literal":"<"}, {"literal":"="}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "exp_comp", "symbols": ["exp_comp", "_", "exp_comp$string$1", "_", "exp_sum"], "postprocess": infixOp},
    {"name": "exp_comp$string$2", "symbols": [{"literal":">"}, {"literal":"="}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "exp_comp", "symbols": ["exp_comp", "_", "exp_comp$string$2", "_", "exp_sum"], "postprocess": infixOp},
    {"name": "exp_comp$string$3", "symbols": [{"literal":"="}, {"literal":"="}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "exp_comp", "symbols": ["exp_comp", "_", "exp_comp$string$3", "_", "exp_sum"], "postprocess": infixOp},
    {"name": "exp_comp$string$4", "symbols": [{"literal":"!"}, {"literal":"="}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "exp_comp", "symbols": ["exp_comp", "_", "exp_comp$string$4", "_", "exp_sum"], "postprocess": infixOp},
    {"name": "exp_comp$string$5", "symbols": [{"literal":"e"}, {"literal":"q"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "exp_comp", "symbols": ["exp_comp", "_", "exp_comp$string$5", "_", "exp_sum"], "postprocess": infixOp},
    {"name": "exp_comp$string$6", "symbols": [{"literal":"n"}, {"literal":"e"}, {"literal":"q"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "exp_comp", "symbols": ["exp_comp", "_", "exp_comp$string$6", "_", "exp_sum"], "postprocess": infixOp},
    {"name": "exp_comp$string$7", "symbols": [{"literal":"l"}, {"literal":"i"}, {"literal":"k"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "exp_comp", "symbols": ["exp_comp", "_", "exp_comp$string$7", "_", "exp_sum"], "postprocess": infixOp},
    {"name": "exp_comp$string$8", "symbols": [{"literal":">"}, {"literal":"<"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "exp_comp", "symbols": ["exp_comp", "_", "exp_comp$string$8", "_", "exp_sum"], "postprocess": infixOp},
    {"name": "exp_comp$string$9", "symbols": [{"literal":"<"}, {"literal":"="}, {"literal":">"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "exp_comp", "symbols": ["exp_comp", "_", "exp_comp$string$9", "_", "exp_sum"], "postprocess": infixOp},
    {"name": "exp_comp$string$10", "symbols": [{"literal":"c"}, {"literal":"m"}, {"literal":"p"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "exp_comp", "symbols": ["exp_comp", "_", "exp_comp$string$10", "_", "exp_sum"], "postprocess": infixOp},
    {"name": "exp_sum", "symbols": ["exp_product"], "postprocess": id},
    {"name": "exp_sum", "symbols": ["exp_sum", "_", {"literal":"+"}, "_", "exp_product"], "postprocess": infixOp},
    {"name": "exp_sum", "symbols": ["exp_sum", "_", {"literal":"-"}, "_", "exp_product"], "postprocess": infixOp},
    {"name": "exp_product", "symbols": ["expression_atom"], "postprocess": id},
    {"name": "exp_product", "symbols": ["exp_product", "_", {"literal":"*"}, "_", "expression_atom"], "postprocess": infixOp},
    {"name": "exp_product", "symbols": ["exp_product", "_", {"literal":"/"}, "_", "expression_atom"], "postprocess": infixOp},
    {"name": "exp_product", "symbols": ["exp_product", "_", {"literal":"%"}, "_", "expression_atom"], "postprocess": infixOp},
    {"name": "expression_atom", "symbols": ["string"], "postprocess": id},
    {"name": "expression_atom", "symbols": ["number"], "postprocess": id},
    {"name": "expression_atom", "symbols": ["boolean"], "postprocess": id},
    {"name": "expression_atom", "symbols": ["symbol"], "postprocess": id},
    {"name": "expression_atom", "symbols": ["array"], "postprocess": id},
    {"name": "expression_atom", "symbols": ["object"], "postprocess": id},
    {"name": "expression_atom", "symbols": ["regex"], "postprocess": id},
    {"name": "expression_atom", "symbols": ["double_quote"], "postprocess": id},
    {"name": "expression_atom", "symbols": ["call_expression"], "postprocess": id},
    {"name": "expression_atom", "symbols": [{"literal":"("}, "_", "expression", "_", {"literal":")"}], "postprocess": getN(2)},
    {"name": "expression_list", "symbols": ["_"], "postprocess": function(d){return []}},
    {"name": "expression_list", "symbols": ["expression"], "postprocess": function(d){return [d[0]]}},
    {"name": "expression_list", "symbols": ["expression_list", "_", {"literal":","}, "_", "expression"], "postprocess": function(d){return d[0].concat([d[4]])}},
    {"name": "call_expression", "symbols": ["symbol", "_", {"literal":"("}, "_", "expression_list", "_", "loc_close_paren"], "postprocess": 
        function(data, start){
          return {
            loc: {start: start, end: data[6]},
            type: 'call-expression',
            callee: data[0],
            args: data[4]
          };
        }
        },
    {"name": "array", "symbols": [{"literal":"["}, "_", "expression_list", "_", "loc_close_square"], "postprocess": 
        function(data, loc){
          return {
            type: 'array',
            loc: {start: loc, end: data[4]},
            value: data[2]
          };
        }
        },
    {"name": "object", "symbols": [{"literal":"{"}, "_", "_object_kv_pairs", "_", "loc_close_curly"], "postprocess": 
        function(data, loc){
          return {
            loc: {start: loc, end: data[4]},
            type: 'object',
            value: data[2]
          };
        }
        },
    {"name": "_object_kv_pairs", "symbols": ["_"], "postprocess": function(d){return []}},
    {"name": "_object_kv_pairs", "symbols": ["_object_kv_pair"], "postprocess": id},
    {"name": "_object_kv_pairs", "symbols": ["_object_kv_pairs", "_", {"literal":","}, "_", "_object_kv_pair"], "postprocess": function(d){return d[0].concat(d[4])}},
    {"name": "_object_kv_pair", "symbols": ["string", "_", {"literal":":"}, "_", "expression"], "postprocess": function(d){return [[d[0], d[4]]]}},
    {"name": "symbol$ebnf$1", "symbols": []},
    {"name": "symbol$ebnf$1", "symbols": [/[a-zA-Z0-9_$]/, "symbol$ebnf$1"], "postprocess": function arrconcat(d) {return [d[0]].concat(d[1]);}},
    {"name": "symbol", "symbols": [/[a-zA-Z_$]/, "symbol$ebnf$1"], "postprocess": 
        function(data, loc, reject){
          var src = flatten(data).join('');
          if(reserved_symbols.hasOwnProperty(src)){
            return reject;
          }
          return {
            type: 'symbol',
            loc: {start: loc, end: loc + src.length},
            value: src
          };
        }
        },
    {"name": "boolean$string$1", "symbols": [{"literal":"t"}, {"literal":"r"}, {"literal":"u"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "boolean", "symbols": ["boolean$string$1"], "postprocess": booleanAST(true )},
    {"name": "boolean$string$2", "symbols": [{"literal":"f"}, {"literal":"a"}, {"literal":"l"}, {"literal":"s"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "boolean", "symbols": ["boolean$string$2"], "postprocess": booleanAST(false)},
    {"name": "number", "symbols": ["_number"], "postprocess": 
        function(data, loc){
          var src = flatten(data).join('');
          return {
            loc: {start: loc, end: loc + src.length},
            type: 'number',
            value: parseFloat(src) || 0// or 0 to avoid NaN
          };
        }
        },
    {"name": "_number", "symbols": ["_float"]},
    {"name": "_number", "symbols": [{"literal":"+"}, "_float"]},
    {"name": "_number", "symbols": [{"literal":"-"}, "_float"]},
    {"name": "_float", "symbols": ["_int"]},
    {"name": "_float", "symbols": [{"literal":"."}, "_int"]},
    {"name": "_float", "symbols": ["_int", {"literal":"."}, "_int"]},
    {"name": "_int$ebnf$1", "symbols": [/[0-9]/]},
    {"name": "_int$ebnf$1", "symbols": [/[0-9]/, "_int$ebnf$1"], "postprocess": function arrconcat(d) {return [d[0]].concat(d[1]);}},
    {"name": "_int", "symbols": ["_int$ebnf$1"], "postprocess": idAll},
    {"name": "regex$string$1", "symbols": [{"literal":"r"}, {"literal":"e"}, {"literal":"#"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "regex", "symbols": ["regex$string$1", "_regex_pattern", {"literal":"#"}, "_regex_modifiers"], "postprocess": 
        function(data, loc){
          var pattern = data[1];
          var modifiers = data[3][0];
          return {
            loc: {start: loc, end: data[3][1]},
            type: 'regex',
            value: new RegExp(pattern, modifiers)
          };
        }
        },
    {"name": "_regex_pattern", "symbols": [], "postprocess": noopStr},
    {"name": "_regex_pattern", "symbols": ["_regex_pattern", "_regex_pattern_char"], "postprocess": function(d){return d[0] + d[1]}},
    {"name": "_regex_pattern_char", "symbols": [/[^\\#]/], "postprocess": id},
    {"name": "_regex_pattern_char", "symbols": [{"literal":"\\"}, /[^]/], "postprocess": function(d){return d[1] === '#' ? '#' : '\\\\'}},
    {"name": "_regex_modifiers", "symbols": ["_regex_modifiers_chars"], "postprocess": 
        function(data, loc){
          var src = flatten(data).join('');
          return [src, loc + src.length];
        }
        },
    {"name": "_regex_modifiers_chars", "symbols": [], "postprocess": noopStr},
    {"name": "_regex_modifiers_chars", "symbols": [{"literal":"i"}]},
    {"name": "_regex_modifiers_chars", "symbols": [{"literal":"g"}]},
    {"name": "_regex_modifiers_chars$string$1", "symbols": [{"literal":"i"}, {"literal":"g"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "_regex_modifiers_chars", "symbols": ["_regex_modifiers_chars$string$1"]},
    {"name": "_regex_modifiers_chars$string$2", "symbols": [{"literal":"g"}, {"literal":"i"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "_regex_modifiers_chars", "symbols": ["_regex_modifiers_chars$string$2"]},
    {"name": "double_quote$string$1", "symbols": [{"literal":"<"}, {"literal":"<"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "double_quote", "symbols": ["double_quote$string$1", "_double_quote_body", "loc_close_double_quote"], "postprocess": 
        function(data, loc){
          return {
            loc: {start: loc - 2, end: data[2]},
            type: 'double_quote',
            value: data[1]
          };
        }
        },
    {"name": "_double_quote_body", "symbols": ["_double_quote_string_node"], "postprocess": function(d){return [d[0]]}},
    {"name": "_double_quote_body", "symbols": ["_double_quote_body", "_beesting", "_double_quote_string_node"], "postprocess": function(d){return d[0].concat([d[1], d[2]])}},
    {"name": "_beesting$string$1", "symbols": [{"literal":"#"}, {"literal":"{"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "_beesting", "symbols": ["_beesting$string$1", "_", "expression", "_", {"literal":"}"}], "postprocess": getN(2)},
    {"name": "_double_quote_string_node", "symbols": ["_double_quote_string"], "postprocess": 
        function(data, loc){
          var src = data[0];
          return {
            loc: {start: loc, end: loc + src.length},
            type: 'string',
            value: src
          };
        }
        },
    {"name": "_double_quote_string", "symbols": [], "postprocess": noopStr},
    {"name": "_double_quote_string", "symbols": ["_double_quote_string", "_double_quote_char"], "postprocess": function(d){return d[0] + d[1]}},
    {"name": "_double_quote_char", "symbols": [/[^>#]/], "postprocess": id},
    {"name": "_double_quote_char", "symbols": [{"literal":"#"}, /[^{]/], "postprocess": idAll},
    {"name": "_double_quote_char", "symbols": [{"literal":">"}, /[^>]/], "postprocess": idAll},
    {"name": "string", "symbols": [{"literal":"\""}, "_string", {"literal":"\""}], "postprocess": 
        function(data, loc){
          var src = data[1];
          return {
            loc: {start: loc - 1, end: loc + src.length + 1},
            type: 'string',
            value: src
          };
        }
        },
    {"name": "_string", "symbols": [], "postprocess": noopStr},
    {"name": "_string", "symbols": ["_string", "_stringchar"], "postprocess": function(d){return d[0] + d[1]}},
    {"name": "_stringchar", "symbols": [/[^\\"]/], "postprocess": id},
    {"name": "_stringchar", "symbols": [{"literal":"\\"}, /[^]/], "postprocess": function(d){return JSON.parse('"' + d[0] + d[1] + '"')}},
    {"name": "loc_close_curly", "symbols": [{"literal":"}"}], "postprocess": idEndLoc},
    {"name": "loc_close_square", "symbols": [{"literal":"]"}], "postprocess": idEndLoc},
    {"name": "loc_close_paren", "symbols": [{"literal":")"}], "postprocess": idEndLoc},
    {"name": "loc_close_double_quote$string$1", "symbols": [{"literal":">"}, {"literal":">"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "loc_close_double_quote", "symbols": ["loc_close_double_quote$string$1"], "postprocess": idEndLoc},
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": [/[\s]/, "_$ebnf$1"], "postprocess": function arrconcat(d) {return [d[0]].concat(d[1]);}},
    {"name": "_", "symbols": ["_$ebnf$1"], "postprocess": noop},
    {"name": "__$ebnf$1", "symbols": [/[\s]/]},
    {"name": "__$ebnf$1", "symbols": [/[\s]/, "__$ebnf$1"], "postprocess": function arrconcat(d) {return [d[0]].concat(d[1]);}},
    {"name": "__", "symbols": ["__$ebnf$1"], "postprocess": noop}
]
  , ParserStart: "main"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();