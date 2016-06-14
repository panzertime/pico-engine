@{%

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

%}

main -> _ ruleset _ {% getN(1) %}
    | expression {% id %}

ruleset -> "ruleset" __ symbol _ "{" _ (rule _):* loc_close_curly {%
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
%}

rule -> "rule" __ symbol _ "{" _ rule_body _ loc_close_curly {%
  function(data, loc){
    var ast = data[6] || {};
    ast.type = 'rule';
    ast.loc = {start: loc, end: last(data)};
    ast.name = data[2];
    return ast;
  }
%}

rule_body ->
    _ {% noop %}
    | select_when {%
  function(data, loc){
    return {
      select: data[0]
    };
  }
%}
    | select_when __ event_action {%
  function(data, loc){
    return {
      select: data[0],
      actions: [data[2]]
    };
  }
%}


select_when ->
    "select" __ "when" __ event_exprs {%
  function(data, loc){
    return {
      type: 'select_when',
      loc: {start: loc, end: data[4].loc.end},
      event_expressions: data[4]
    };
  }
%}

event_exprs ->
    event_expression {% id %}
    | "(" _ event_exprs _ ")" {% getN(2) %}
    | event_exprs __ "or" __ event_exprs {% infixEventOp('or') %}
    | event_exprs __ "and" __ event_exprs {% infixEventOp('and') %}

event_expression ->
  event_domain __ event_type {%
  function(data, loc){
    return {
      type: 'event_expression',
      loc: {start: loc, end: data[2].loc.end},
      event_domain: data[0],
      event_type: data[2]
    };
  }
%}

event_domain ->
    symbol {% id %}

event_type ->
    symbol {% id %}

event_action ->
    "send_directive" _ function_call_args _ with_expression:? {%
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
%}

function_call_args ->
    "(" _ expression_list _ ")" {% getN(2) %}

with_expression ->
    "with" __ symbol_value_pairs {%
  function(data, loc){
    var pairs = data[2];
    var last_pair = last(pairs);
    return {
      loc: {start: loc, end: (last_pair ? last_pair[1].loc.end : 0)},
      type: 'with_expression',
      pairs: pairs
    };
  }
%}

symbol_value_pairs ->
    symbol_value_pair {% function(d){return [d[0]]} %}
    | symbol_value_pairs __ "and" __ symbol_value_pair {% function(d){return d[0].concat([d[4]])} %}

symbol_value_pair ->
    symbol _ "=" _ expression {%
  function(data, loc){
    return [data[0], data[4]];
  }
%}

################################################################################
# Expressions

expression -> exp_or {% id %}
 
exp_or -> exp_and {% id %}
    | exp_or _ "||" _ exp_and {% infixOp %}
 
exp_and -> exp_comp {% id %}
    | exp_and _ "&&" _ exp_comp {% infixOp %}

exp_comp -> exp_sum {% id %}
    | exp_comp _ "<"    _ exp_sum {% infixOp %}
    | exp_comp _ ">"    _ exp_sum {% infixOp %}
    | exp_comp _ "<="   _ exp_sum {% infixOp %}
    | exp_comp _ ">="   _ exp_sum {% infixOp %}
    | exp_comp _ "=="   _ exp_sum {% infixOp %}
    | exp_comp _ "!="   _ exp_sum {% infixOp %}
    | exp_comp _ "eq"   _ exp_sum {% infixOp %}
    | exp_comp _ "neq"  _ exp_sum {% infixOp %}
    | exp_comp _ "like" _ exp_sum {% infixOp %}
    | exp_comp _ "><"   _ exp_sum {% infixOp %}
    | exp_comp _ "<=>"  _ exp_sum {% infixOp %}
    | exp_comp _ "cmp"  _ exp_sum {% infixOp %}

exp_sum -> exp_product {% id %}
    | exp_sum _ "+" _ exp_product {% infixOp %}
    | exp_sum _ "-" _ exp_product {% infixOp %}

exp_product -> expression_atom {% id %}
    | exp_product _ "*" _ expression_atom {% infixOp %}
    | exp_product _ "/" _ expression_atom {% infixOp %}
    | exp_product _ "%" _ expression_atom {% infixOp %}

expression_atom ->
      string {% id %}
    | number {% id %}
    | boolean {% id %}
    | symbol {% id %}
    | array {% id %}
    | object {% id %}
    | regex {% id %}
    | double_quote {% id %}
    | call_expression {% id %}
    | "(" _ expression _ ")" {% getN(2) %}

expression_list ->
    _ {% function(d){return []} %}
    | expression {% function(d){return [d[0]]} %}
    | expression_list _ "," _ expression {% function(d){return d[0].concat([d[4]])} %}

call_expression -> symbol _ "(" _ expression_list _ loc_close_paren {%
  function(data, start){
    return {
      loc: {start: start, end: data[6]},
      type: 'call-expression',
      callee: data[0],
      args: data[4]
    };
  }
%}

################################################################################
# Literal Datastructures

array -> "[" _ expression_list _ loc_close_square {%
  function(data, loc){
    return {
      type: 'array',
      loc: {start: loc, end: data[4]},
      value: data[2]
    };
  }
%}

object -> "{" _ _object_kv_pairs _ loc_close_curly {%
  function(data, loc){
    return {
      loc: {start: loc, end: data[4]},
      type: 'object',
      value: data[2]
    };
  }
%}

_object_kv_pairs ->
    _ {% function(d){return []} %}
    | _object_kv_pair {% id %}
    | _object_kv_pairs _ "," _ _object_kv_pair {% function(d){return d[0].concat(d[4])} %}

_object_kv_pair -> string _ ":" _ expression {% function(d){return [[d[0], d[4]]]} %}

################################################################################
# Literals

symbol -> [a-zA-Z_$] [a-zA-Z0-9_$]:* {%
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
%}

boolean -> "true"  {% booleanAST(true ) %}
         | "false" {% booleanAST(false) %}

number -> _number {%
  function(data, loc){
    var src = flatten(data).join('');
    return {
      loc: {start: loc, end: loc + src.length},
      type: 'number',
      value: parseFloat(src) || 0// or 0 to avoid NaN
    };
  }
%}

_number ->
    _float
    | "+" _float
    | "-" _float

_float ->
    _int
    | "." _int
    | _int "." _int

_int -> [0-9]:+ {% idAll %}

regex -> "re#" _regex_pattern "#" _regex_modifiers {%
  function(data, loc){
    var pattern = data[1];
    var modifiers = data[3][0];
    return {
      loc: {start: loc, end: data[3][1]},
      type: 'regex',
      value: new RegExp(pattern, modifiers)
    };
  }
%}

_regex_pattern ->
    null {% noopStr %}
    | _regex_pattern _regex_pattern_char {% function(d){return d[0] + d[1]} %}

_regex_pattern_char ->
  [^\\#] {% id %}
  | "\\" [^] {% function(d){return d[1] === '#' ? '#' : '\\\\'} %}

_regex_modifiers -> _regex_modifiers_chars {%
  function(data, loc){
    var src = flatten(data).join('');
    return [src, loc + src.length];
  }
%}

_regex_modifiers_chars -> null {% noopStr %}
    | "i" | "g" | "ig" | "gi"

double_quote -> "<<" _double_quote_body loc_close_double_quote {%
  function(data, loc){
    return {
      loc: {start: loc - 2, end: data[2]},
      type: 'double_quote',
      value: data[1]
    };
  }
%}

_double_quote_body ->
    _double_quote_string_node {% function(d){return [d[0]]} %}
    | _double_quote_body _beesting _double_quote_string_node {% function(d){return d[0].concat([d[1], d[2]])} %}

_beesting -> "#{" _ expression _ "}" {% getN(2) %}

_double_quote_string_node -> _double_quote_string {%
  function(data, loc){
    var src = data[0];
    return {
      loc: {start: loc, end: loc + src.length},
      type: 'string',
      value: src
    };
  }
%}

_double_quote_string ->
    null {% noopStr %}
    | _double_quote_string _double_quote_char {% function(d){return d[0] + d[1]} %}

_double_quote_char ->
    [^>#] {% id %}
    | "#" [^{] {% idAll %}
    | ">" [^>] {% idAll %}

string -> "\"" _string "\"" {%
  function(data, loc){
    var src = data[1];
    return {
      loc: {start: loc - 1, end: loc + src.length + 1},
      type: 'string',
      value: src
    };
  }
%}

_string ->
    null {% noopStr %}
    | _string _stringchar {% function(d){return d[0] + d[1]} %}

_stringchar ->
    [^\\"] {% id %}
    | "\\" [^] {% function(d){return JSON.parse('"' + d[0] + d[1] + '"')} %}

################################################################################
# Utils

# Chars that return their end location
loc_close_curly -> "}" {% idEndLoc %}
loc_close_square -> "]" {% idEndLoc %}
loc_close_paren -> ")" {% idEndLoc %}
loc_close_double_quote -> ">>" {% idEndLoc %}

# Whitespace
_  -> [\s]:* {% noop %}
__ -> [\s]:+ {% noop %}