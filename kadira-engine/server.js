// Original code was written for connect-2 and node <= 4.x
// Upgrade to node >= 8 and connect-3.
// The (connect-2.util()) middlewares are now performed by separate means
// with separate npm packages. "app.use()" is still available for connect-3.

// THIS CODE FOR http APPLICATION

var connect = require ('connect');
var http = require ('http');

// connect initialize app.stack [] for http service handlers
// app.use(<path>,<handler>) supplies the service handlers

var app = connect();

// The deprecated 'connect' v2 util middlewares have been removed in v3.
// There are equivalent middleware modules in the npm library that can be used.
//
// connect 3.x no longer supports util connect.query()
// app.use(connect.query());
//
// connect 3.x no longer supports util connect.json()
// this should now be linked to body-parser.json
// app.use(connect.json({limit: '5mb'}));

// Parse all JSON body text to req.body // Using a replacement for connect.json
   app.use(require('body-parser').json({limit: '5mb'}));

// DIAGNOSTIC
//app.use(appRequestLog('After body-parser.json'));

if(process.env.FORWARD_URL) {
  console.log('>>> ', process.env.FORWARD_URL);
  var forwarder = require('./lib/middlewares/forward');
  app.use(forwarder(process.env.FORWARD_URL));
}

// add connect-ntp middleware, for the legacy support
// this does not works everywhere because, this doesn't
// works well with firewalls since this uses TCP over HTTP

// NO LONGER SUPPORTING connect-ntp (Oregpn State Police)
// app.use(require('connect-ntp')());

// new ntp middleware, simple sends the timestamp to the client
// this works well with firewalls, this is plain old HTTP

app.use(require('./lib/middlewares/simplentp')());
app.use(require('./lib/middlewares/cors-options'));

var port = process.env.PORT || 11011;
console.info('starting apm-engine on port', port);
http.createServer(app).listen(port);

// THIS CODE FOR MONGODB BACKEND

var MongoClient = require('mongodb').MongoClient;
var MongoCluster = require('mongo-sharded-cluster');
var mongoOptions = { 
//    'lookupInterval': 1000 * 30, // default lookup interval of 30 seconds - shard cluster
      'useNewUrlParser': true      // ensure URL encoding of problematic symbols
    };

var DBS = {};

// Environment Variables:
// MONGO_URL=$APP_MONGO_URL
// MONGO_SHARD_URL_one=$DATA_MONGO_UR

MongoCluster.initFromEnv(mongoOptions, function(err, cluster) {
  console.log('DDONE')

// console.log('DIAGNOSTIC - analyze MongoCluster');
// analyzeObject(cluster);
// for(ey in cluster._shardMap){
// console.log('DIAGNOSTIC - shard map (' + key + ')');
// analyzeObject(cluster._shardMap[key]);
// };

  if(err) {
    console.error('Error connecting to the Mongo Metrics Cluster');
    throw err;
  } else {

    DBS.metricsCluster = cluster;
    MongoClient.connect(process.env.MONGO_URL
      , mongoOptions
      , afterMongoURLConnected);
  }
});

function afterMongoURLConnected(err, client) {
  if (err) {
    throw err;
  } else {

//SJH - get the application database handle from the mongodb connection
//  mongodb v2.x returns a combined client+db handle from MongoClient.connect(url);
//  mongodb v3.0 returns a client handle from MongoClient.connect(url) with cached default database name.
//  mongodb v3.0 returns a handle to the default database when invoking client.db().
//  mongodb v3.0 can return a handle to other named databases using client.db("dbname").
//  DBS.app = db;

//DIAGNOSTIC
//console.log('DIAGNOSTIC afterMongoURLConnected - succesfully entered.');

    DBS.client = client;      // the MongoDb v3 connection can close with DBS.client.close()
    DBS.app = client.db();    // get the MongoDb database handle to default database.

    // parse JSON data sent using XDR with has data type set to text/plain
    // do this before appinfo otherwise required data may not be available
    app.use('/errors', require('./lib/middlewares/plaintext-body'));

    // extract appId and appSecret. Used by ratelimit.
    app.use(require('./lib/middlewares/appinfo'));

    // rate limit all requests from this point
    // limit => 15 req/s, traces => 100 traces/request
    // Note: Drops all requests without an appId.
    app.use(require('./lib/middlewares/ratelimit')({
      limit: 15,
      resetInterval: 1000,
      limitTotalTraces: 100
    }));

    // error manager handles errors sent from client (GET and POST)
    // all requests sent to /errors are considered as client side errors
    // it should be used before using the authentication middleware

    var stateManager = require('./lib/stateManager');

// DIAGNOSTIC
//app.use(appRequestLog('After lib/stateManager'));

    var errorManager = require('./lib/middlewares/error-manager');
    app.use('/errors', errorManager(DBS.app, DBS.metricsCluster));

// DIAGNOSTIC
//app.use(appRequestLog('After middlewares/error-manager'));


    // authenticare middleware
    // ping middleware must be used after the authentication middleware
    app.use(require('./lib/middlewares/authenticate')(DBS.app));

// DIAGNOSTIC
//app.use(appRequestLog('After middlewares/authenticate'));

    app.use(require('./lib/middlewares/ping')());

// DIAGNOSTIC
//app.use(appRequestLog('After middlewares/ping'));

    // LIBRATO interface is lib/middleware/logger
    // app.use(require('./lib/middlewares/logger')());

    app.use('/jobs', require('./lib/middlewares/jobs')(DBS.app));

// DIAGNOSTIC
//app.use(appRequestLog('Before lib/controller'));

    require('./lib/controller')(app, DBS.app, DBS.metricsCluster);  // this is dispatch for all metrics

// DIAGNOSTIC
//app.use(appRequestLog('After lib/controller'));

// The ('.lib/controller') middlewares may not return next:
// See the connect and http app.use(path, function) to add a service function to the web service stack.
// Web service modules fingerprint are: function(req, res, next);
// Web service handlers are processed from top of stack upto the next module that does not call next()

// Since (.lib/controller) does not call next(), the error middleware may not be serviced.

// This (/lib/middlewares/onerror) is intended to be a catch-all error handler
// It has a fingerprint of: function(err, req, res, next) and returns http to requester
// without calling next.

    // error middleware
    app.use(require('./lib/middlewares/onerror')());
  }
}

//----------------------------------------------------
// helper functions

function analyzeObject(obj){
  for (var tag in obj){
    console.log('object tag = ' + tag + ', typeof = ' + typeof obj[tag]);
  }
}

function appRequestLog(identifier) {
  return function (req, res, next){
    console.log('\nApplication Request Log for: ' + identifier);
    console.log('-- Analyze the Request');
    console.log('-- method = ' + req.method);
    console.log('-- url = ' + req.url);
//    console.log('-- parsed url = ' + JSON.stringify(req._parsedUrl, null, 2));
    console.log('-- headers = ' + JSON.stringify(req.headers, null, 2));
    console.log('-- Request APP = ' + typeof req.app);
    if (typeof req.app == 'object')
      console.log('-- APP Content: ' + JSON.stringify(req.app, null, 2));
    console.log('-- Request Body typeOf = ' + typeof req.body);
    if (typeof req.body == 'object')
      console.log('-- Request Body = ' + JSON.stringify(req.body, null, 2));
    next();
  }
}

