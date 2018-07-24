var test = require("tape");
var PicoQueue = require("./PicoQueue");

function nextTick(){
    return new Promise(function(resolve){
        process.nextTick(resolve);
    });
}

test("PicoQueue", function(t){

    var log = [];

    var pq = PicoQueue(async function(picoId, type, data){
        log.push("working_0 [" + picoId + "] " + data);
        await nextTick();
        log.push("working_1 [" + picoId + "] " + data);
        await nextTick();
        log.push("working_2 [" + picoId + "] " + data);
    });

    var enqueue = function(picoId, data, done){
        log.push("enqueue [" + picoId + "] " + data);
        pq.enqueue(picoId, "test", data, function(){
            log.push("done [" + picoId + "] " + data);
            if(done){
                done();
            }
        });
    };


    enqueue("A", 0);
    enqueue("A", 1);
    enqueue("B", 0);
    enqueue("A", 2, function(){
        t.deepEquals(log, [
            "enqueue [A] 0",
            "enqueue [A] 1",
            "enqueue [B] 0",
            "enqueue [A] 2",
            "working_0 [A] 0",
            "working_0 [B] 0",//different picos can be concurrent
            "working_1 [A] 0",
            "working_1 [B] 0",
            "working_2 [A] 0",//Now pico A finished work on event 0
            "working_2 [B] 0",
            "done [A] 0",
            "working_0 [A] 1",//Now pico A can start on event 1
            "done [B] 0",
            "working_1 [A] 1",
            "working_2 [A] 1",
            "done [A] 1",
            "working_0 [A] 2",
            "working_1 [A] 2",
            "working_2 [A] 2",
            "done [A] 2"
        ]);
        t.end();
    });
});

test("PicoQueue - error", function(t){
    var pq = PicoQueue(async function(picoId, type, data){
        await nextTick();
        if(data === "foobar"){
            throw new Error(data);
        }
        return data;
    });
    t.plan(6);
    pq.enqueue("A", "test", "baz", function(err, data){
        t.equals(err, null);
        t.equals(data, "baz");
    });
    pq.enqueue("A", "test", "foobar", function(err, data){
        t.equals(err + "", "Error: foobar");
        t.equals(data, void 0);
    });
    pq.enqueue("A", "test", "qux", function(err, data){
        t.equals(err, null);
        t.equals(data, "qux");
    });
});
