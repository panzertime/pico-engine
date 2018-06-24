var _ = require("lodash");
var tcpp = require("tcp-ping");
var Discover = require("../../node-discover");


// find ip taken from https://gist.github.com/szalishchuk/9054346
var address // Local ip address that we're trying to calculate
    , os = require("os") // Provides a few basic operating-system related utility functions (built-in)
    ,
    ifaces = os.networkInterfaces(); // Network interfaces
function getIp(ifaces) {
    for (var dev in ifaces) { // Iterate over interfaces ...
        var iface = ifaces[dev].filter(function(details) { // ... and find the one that matches the criteria
            return details.family === "IPv4" && details.internal === false;
        });
        if (iface.length > 0) address = iface[0].address;
    }
    return address;
}


var config = {
    startOnCreation: false,
    helloInterval  : 500, // How often to broadcast a hello packet in milliseconds
    checkInterval  : 2000, // How often to to check for missing nodes in milliseconds
    nodeTimeout    : 3000, // Consider a node dead if not seen in this many milliseconds
    masterTimeout  : 6000, // Consider a master node dead if not seen in this many milliseconds
    mastersRequired: 1, // The count of master processes that should always be available
    //weight: Math.random(), // A number used to determine the preference for a specific process to become master. Higher numbers win.

    //address: '0.0.0.0', // Address to bind to
    port: 8183, // Port on which to bind and communicate with other node-discovery processes
    //broadcast: '255.255.255.255', // Broadcast address if using broadcast
    //multicast: null, // Multicast address if using multicast (don't use multicast, use broadcast)
    //mulitcastTTL: 1, // Multicast TTL for when using multicast

    //algorithm: 'aes256', // Encryption algorithm for packet broadcasting (must have key to enable)
    //key: null, // Encryption key if your broadcast packets should be encrypted (null means no encryption)

    //ignore: "self", // Which packets to ignore: 'self' means ignore packets from this instance, 'process' means ignore packets from this process
    //ignoreDataErrors: true // whether to ignore data errors including parse errors
};

var event = {
    eid: "12345",
    domain: "discover",
};
var observers = [];
var resources = {};


var d, getNodes = function() { return [];};

d = Discover(config);
//var port = core.port || "8080";
d.advertise({
    name: "PicoEngine",
    resources: resources//,
    //_host: "http://" + getIp(ifaces) + ":" + port //core.host
});

getNodes = function() {
    var nodes = [];
    d.eachNode(function(node) {
        nodes.push(node);
    });
    return nodes;
};

module.exports =  {
    module: {
        alive: {
            type: "function",
            args: ["ip","port"],
            fn  : function( args, callback) {
                tcpp.probe(args.ip, args.port, function(err, available) { callback(null, available); });
            },
        },
        ip: {
            type: "function",
            args: [],
            fn  : function( args, callback) {
                callback(null, getIp(ifaces));
            },
        },
        engines: {
            type: "function",
            args: [],
            fn  : function( args, callback) {
                callback(null, getNodes());
            },
        },
        resources: {
            type: "function",
            args: [],
            fn  : function( args, callback) {
                callback(null,resources);
            },
        },
        observers: {
            type: "function",
            args: [],
            fn  : function( args, callback) {
                callback(null,observers);
            },
        },
        startService: {
            type: "action",
            args: [],
            fn  : function( args, callback) {
                callback(null,d.start());
            },
        },
        stopService: {
            type: "action",
            args: [],
            fn  : function( args, callback) {
                callback(null,d.stop());
            },
        },
        addResource: {
            type: "action",
            args: ["key", "value"],
            fn  : function( args, callback) {
                resources[args.key] = args.value; // TODO, needs to check input ...
                callback(null,resources);
            },
        },
        removeResource: {
            type: "action",
            args: ["key"],
            fn  : function( args, callback) {
                delete resources[args.key];
                callback(null,resources);
            },
        },
        addObserver:{
            type: "action",
            args: ["did"],
            fn  : function( args, callback) {
                var index = _.findIndex(observers, function(Item) { return Item === args.did; });
                if (index < 0) { observers.push(args.did); }
                callback(null,observers);
            },
        },
        removeObserver: {
            type: "action",
            args: ["did"],
            fn  : function( args, callback) {
                var index = _.findIndex(observers, function(Item) { return Item === args.did; });
                if (index > -1) { observers.splice(index, 1); }
                callback(null,observers);
            },
        },
    },
    start : function(core){
        d.start();
        console.log("discovery service started.\n Advertising...");
        d.on("added", function(obj) {
            obj.discoverId = obj.id;
            for (var i = 0; i < observers.length; i++) {
                event.eci = observers[i];
                event.type = "engine_found";
                event.attrs = obj;
                core.signalEvent(event, function(err, response) { /*if(err) return errResp(res, err); */ });
            }
        });

        d.on("removed", function(obj) {
            for (var i = 0; i < observers.length; i++) {
                event.eci = observers[i];
                event.type = "engine_lost";
                event.attrs = obj;
                core.signalEvent(event, function(err, response) { /*if(err) return errResp(res, err); */ });
            }
        });

    }
};