// Updated by SJH 
// Replacing old apm-app-id and apm-app-secret
// With newer kadira-app-id and kadira-app-secret
// Replace connect.json with bodyParser.json
//
var assert = require('assert');
var connect = require('connect');  //@2.x.x should update to @3.0.0
var http = require('http');
var request = require('request');  //@2.82.0 deprecated still usable?
var controller = require('../lib/controller');
var bodyParser = require('body-parser'); // parser library usefule for connect v3.x

suite('controller',function(){
  test('method parser',function(done){
    var timestamp = Date.now();
    var timestamp2 = Date.now();
    var received = 0;
    var appId = "xxxxxx";
    var dbMock = {
      collection:function(collectionName) {
        return {
          insert: function() {
            received ++;
          }
        }
      }
    };

    var mongoCluster = {
      getConnection: function (shard) {
        assert.equal(shard, "one");
        return dbMock;
      }
    };

    var app = createMockApp();

    controller(app, null, mongoCluster);

    var server = http.createServer(app).listen(8967, function() {
      timestamp = Date.now();
      var postData = {
        host: "the-host",
        "appId": "the-app-id", //this is set by the auth middleware
        pubMetrics: [
          {
            startTime: timestamp,
            endTime: timestamp2,
            pubs: {
              postsList: {
                subs: 233,
                unsubs: 343,
                resTime: 34,
                networkImpact: 345,
                dataFetched: 34,
                count: 45,
                lifeTime: 4
              }
            }
          }
        ]
      };

//    var req = request.post({url:'http://localhost:8967',json:postData,headers:{'apm-app-id':appId,'apm-app-secret':'xxxx'}},function(err, res , body) {
      var req = request.post({
          url:'http://localhost:8967',
          json:postData,
          headers:{'kadira-app-id':appId,'kadira-app-secret':'xxxx'}
          },
        function(err, res , body) {
        assert.equal(received, 1);
        assert.equal(res.statusCode,200);
// close the test server
        server.close();
        done();
      });
    });
  });
});

function createMockApp(){
  var app = connect();
//  app.use(connect.json());
  app.use(bodyParser.json());
  app.use(function(req, res ,next){
//  if (req.headers['apm-app-id'] && req.headers['apm-app-secret']) {
    if (req.headers['kadira-app-id'] && req.headers['kadira-app-secret']) {
      req.body.app = req.app = {plan: 'free', shard: 'one'};
//    req.appId = req.headers['apm-app-id'];
      req.appId = req.headers['kadira-app-id'];
      next();
    } else {
      res.writeHead(401, {
        'Content-Type': 'text/plain'
      });
      res.end();
    }
  });

  return app;
}
