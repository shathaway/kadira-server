var assert = require('assert');
var mongo = require('mocha-mongo')("mongodb://localhost/testapm");
var stateManager = require('../lib/stateManager');

var clean = mongo.cleanCollections(['apps']);

suite("StateManager", function() {
  suite('.setState', function() {
    test('set initialDataReceived', clean(function(db, done) {
      var appsCollection = db.collection('apps');

      appsCollection.insertOne({_id: 'appOne'}, function(err, apps) {
        assert.ifError(err);
        // NOTE: apps[0] is undefined - insertOne returns the information in apps.ops
        stateManager.setState(db, apps.ops[0], 'initialDataReceived', checkForinitialDataReceived);
      });

      function checkForinitialDataReceived(err) {
        assert.ifError(err);
        appsCollection.findOne({_id: 'appOne'}, function(err, app) {
          assert.ifError(err);
          assert.ok(app.initialDataReceived <= Date.now());
          done();
        });
      }
    }));

    test('do not set initialDataReceived multiple times', function(done) {
      var db = {
        collection: function() {
          return {
            update: function() {
              throw new Error("does not expect to update the collection");
            }
          };
        }
      };

      var app = {_id: "appOne", initialDataReceived: true};
      stateManager.setState(db, app, 'initialDataReceived', done);
    });

    test('close mocha-mongo connection', clean(function(db, done) {
//    Just close the mongodb connection through the mocha-mongo handle.
      db.close();
      done();
    }));

  });
});

function analyzeObject(obj){
  for (var tag in obj){
    console.log('object tag = ' + tag + ', typeof = ' + typeof obj[tag]);
  }
}

