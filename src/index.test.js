var _ = require('lodash');
var λ = require('contra');
var test = require('tape');
var mkTestPicoEngine = require('./mkTestPicoEngine');

var omitMeta = function(resp){
  return _.map(resp.directives, function(d){
    return _.omit(d, 'meta');
  });
};


test('PicoEngine - hello_world ruleset', function(t){
  var pe = mkTestPicoEngine();

  λ.series({
    npico: λ.curry(pe.db.newPico, {}),
    chan0: λ.curry(pe.db.newChannel, {pico_id: 'id0', name: 'one', type: 't'}),
    rid1x: λ.curry(pe.db.addRuleset, {pico_id: 'id0', rid: 'rid1x0'}),

    hello_event: λ.curry(pe.signalEvent, {
      eci: 'id1',
      eid: '1234',
      domain: 'echo',
      type: 'hello',
      attrs: {}
    }),
    hello_query: λ.curry(pe.callFunction, {
      eci: 'id1',
      rid: 'rid1x0',
      fn_name: 'hello',
      args: {obj: 'Bob'}
    })

  }, function(err, data){
    if(err) return t.end(err);

    t.deepEquals(data.hello_event, {
      directives: [
        {
          name: 'say',
          options: {
            something: 'Hello World'
          },
          meta: {
            eid: '1234',
            rid: 'rid1x0',
            rule_name: 'hello_world',
            txn_id: 'TODO'
          }
        }
      ]
    });
    t.deepEquals(data.hello_query, 'Hello Bob');

    t.end();
  });
});

test('PicoEngine - store_name ruleset', function(t){
  var pe = mkTestPicoEngine();

  λ.series({
    pico0: λ.curry(pe.db.newPico, {}),
    chan1: λ.curry(pe.db.newChannel, {pico_id: 'id0', name: 'one', type: 't'}),
    rid_0: λ.curry(pe.db.addRuleset, {pico_id: 'id0', rid: 'rid2x0'}),

    pico2: λ.curry(pe.db.newPico, {}),
    chan3: λ.curry(pe.db.newChannel, {pico_id: 'id2', name: 'three', type: 't'}),
    rid_1: λ.curry(pe.db.addRuleset, {pico_id: 'id2', rid: 'rid2x0'}),

    store_bob0: λ.curry(pe.signalEvent, {
      eci: 'id1',
      eid: '1234',
      domain: 'store',
      type: 'name',
      attrs: {name: 'bob'}
    }),

    query0: λ.curry(pe.callFunction, {
      eci: 'id1',
      rid: 'rid2x0',
      fn_name: 'getName',
      args: {}
    }),

    store_bob1: λ.curry(pe.signalEvent, {
      eci: 'id1',
      eid: '12345',
      domain: 'store',
      type: 'name',
      attrs: {name: 'jim'}
    }),

    query1: λ.curry(pe.callFunction, {
      eci: 'id1',
      rid: 'rid2x0',
      fn_name: 'getName',
      args: {}
    }),
    query2: λ.curry(pe.callFunction, {
      eci: 'id1',
      rid: 'rid2x0',
      fn_name: 'getName',
      args: {}
    }),

    store_appvar0: λ.curry(pe.signalEvent, {
      eci: 'id1',
      eid: '123456',
      domain: 'store',
      type: 'appvar',
      attrs: {appvar: 'global thing'}
    }),
    query3: λ.curry(pe.callFunction, {
      eci: 'id1',
      rid: 'rid2x0',
      fn_name: 'getAppVar',
      args: {}
    }),
    query4: λ.curry(pe.callFunction, {
      eci: 'id3',
      rid: 'rid2x0',
      fn_name: 'getAppVar',
      args: {}
    })

  }, function(err, data){
    if(err) return t.end(err);

    t.deepEquals(omitMeta(data.store_bob0), [
        {name: 'store_name', options: {name: 'bob'}}
    ]);

    t.deepEquals(data.query0, 'bob');

    t.deepEquals(omitMeta(data.store_bob1), [
      {name: 'store_name', options: {name: 'jim'}}
    ]);

    t.deepEquals(data.query1, 'jim');
    t.deepEquals(data.query2, 'jim');

    t.deepEquals(omitMeta(data.store_appvar0), [
      {name: 'store_appvar', options: {name: 'global thing'}}
    ]);
    t.deepEquals(data.query3, 'global thing');
    t.deepEquals(data.query4, 'global thing');

    t.end();
  });
});

test('PicoEngine - raw ruleset', function(t){
  var pe = mkTestPicoEngine();

  λ.series({
    pico: λ.curry(pe.db.newPico, {}),
    chan: λ.curry(pe.db.newChannel, {pico_id: 'id0', name: 'one', type: 't'}),
    rid3: λ.curry(pe.db.addRuleset, {pico_id: 'id0', rid: 'rid3x0'}),

    signal: λ.curry(pe.callFunction, {
      eci: 'id1',
      rid: 'rid3x0',
      fn_name: 'sayRawHello',
      args: {}
    })

  }, function(err, data){
    if(err) return t.end(err);

    t.ok(_.isFunction(data.signal));

    data.signal({
      end: function(txt){
        t.equals(txt, 'raw hello!');
        t.end();
      }
    });
  });
});

test('PicoEngine - event_ops ruleset', function(t){
  var pe = mkTestPicoEngine();

  λ.series({
    pico: λ.curry(pe.db.newPico, {}),
    chan: λ.curry(pe.db.newChannel, {pico_id: 'id0', name: 'one', type: 't'}),
    rid4: λ.curry(pe.db.addRuleset, {pico_id: 'id0', rid: 'rid4x0'}),

    bind: λ.curry(pe.signalEvent, {
      eci: 'id1',
      eid: '1234',
      domain: 'event_ops',
      type: 'bind',
      attrs: {name: 'blah?'}
    })

  }, function(err, data){
    if(err) return t.end(err);

    t.deepEquals(omitMeta(data.bind), [
      {name: 'bound', options: {name: 'blah?'}}
    ]);

    t.end();
  });
});
