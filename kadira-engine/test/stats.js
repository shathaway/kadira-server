var assert = require('assert');
var mongo = require('mocha-mongo')('mongodb://localhost/testapm');
var exec = require('child_process').exec;
var util = require('util');
var _ = require('underscore');

// DO NOt INCLUDE mapReduceProfileConfig IN THIS SET OF COLLECTIONS
// THE mapReduceProfileConfig may be required for the exec spawned mapreduce process.
// Support for the mapreduce testing is copied from (packag_dir)/kadira-rma/ into test/rma/

var clean = mongo.cleanCollections([ 'prodStats', 'rawMethodsMetrics', 'methodsMetrics', 'rawPubMetrics', 'pubMetrics', 'systemMetrics', 'rawSystemMetrics', 'rawErrorMetrics', 'errorMetrics' ]);

suite('usage stats', function () {
  test('one-app-one-record', clean( function (db, done) {
    var date = new Date();

    var metrics = [
      {appId: 'test-app', startTime: date, subShard: 102, count: 3, errors: 1, wait: 10}
    ];

    insertRawMetrics(metrics, db, function () {
      runMapReduce(db, afterMapReduce);
    });

    function afterMapReduce() {
      db.collection('prodStats').findOne({}, function (err, doc) {
        assert.equal(doc.count, 1);
        done();
      });
    }
  }));

  test('one-app-two-records', clean( function (db, done) {
    var date = new Date();

    var metrics = [
      {appId: 'test-app', startTime: date, subShard: 102, count: 3, errors: 1, wait: 10},
      {appId: 'test-app', startTime: date, subShard: 103, count: 3, errors: 1, wait: 10}
    ];

    insertRawMetrics(metrics, db, function () {
      runMapReduce(db, afterMapReduce);
    });

    function afterMapReduce() {
      db.collection('prodStats').findOne({}, function (err, doc) {
        assert.equal(doc.count, 2);
        done();
      });
    }
  }));

  test('two-apps-two-records', clean( function (db, done) {
    var date = new Date();

    var metrics = [
      {appId: 'test-app-1', startTime: date, subShard: 102, count: 3, errors: 1, wait: 10},
      {appId: 'test-app-2', startTime: date, subShard: 103, count: 3, errors: 1, wait: 10}
    ];

    insertRawMetrics(metrics, db, function () {
      runMapReduce(db, afterMapReduce);
    });

    function afterMapReduce() {
      db.collection('prodStats').findOne({appId: 'test-app-1'}, function (err, doc) {
        assert.equal(doc.count, 1);
        db.collection('prodStats').findOne({appId: 'test-app-2'}, function (err, doc) {
          assert.equal(doc.count, 1);
          done();
        });
      });
    }
  }));

  test('multiple-apps-multiple-records', clean( function (db, done) {
    var date = new Date();

    var metrics = [
      {appId: 'test-app-1', startTime: date, subShard: 102, count: 3, errors: 1, wait: 10},
      {appId: 'test-app-1', startTime: date, subShard: 102, count: 3, errors: 1, wait: 10},
      {appId: 'test-app-1', startTime: date, subShard: 102, count: 3, errors: 1, wait: 10},
      {appId: 'test-app-2', startTime: date, subShard: 103, count: 3, errors: 1, wait: 10},
      {appId: 'test-app-2', startTime: date, subShard: 103, count: 3, errors: 1, wait: 10},
      {appId: 'test-app-2', startTime: date, subShard: 103, count: 3, errors: 1, wait: 10},
      {appId: 'test-app-2', startTime: date, subShard: 103, count: 3, errors: 1, wait: 10},
      {appId: 'test-app-3', startTime: date, subShard: 103, count: 3, errors: 1, wait: 10},
      {appId: 'test-app-3', startTime: date, subShard: 103, count: 3, errors: 1, wait: 10},
      {appId: 'test-app-3', startTime: date, subShard: 103, count: 3, errors: 1, wait: 10},
      {appId: 'test-app-3', startTime: date, subShard: 103, count: 3, errors: 1, wait: 10},
      {appId: 'test-app-3', startTime: date, subShard: 103, count: 3, errors: 1, wait: 10},
      {appId: 'test-app-3', startTime: date, subShard: 103, count: 3, errors: 1, wait: 10},
      {appId: 'test-app-3', startTime: date, subShard: 103, count: 3, errors: 1, wait: 10},
      {appId: 'test-app-3', startTime: date, subShard: 103, count: 3, errors: 1, wait: 10}
    ];

    insertRawMetrics(metrics, db, function () {
      runMapReduce(db, afterMapReduce);
    });

    function afterMapReduce() {
      db.collection('prodStats').findOne({appId: 'test-app-1'}, function (err, doc) {
        assert.equal(doc.count, 3);
        db.collection('prodStats').findOne({appId: 'test-app-2'}, function (err, doc) {
          assert.equal(doc.count, 4);
          db.collection('prodStats').findOne({appId: 'test-app-3'}, function (err, doc) {
            assert.equal(doc.count, 8);
            done();
          });
        });
      });
    }
  }));

  test('multiple-apps-multiple-records-multiple-collections', clean( function (db, done) {
    var date = new Date();

    var metrics = [
      {appId: 'test-app-1', startTime: date, subShard: 102, count: 3, errors: 1, wait: 10},
      {appId: 'test-app-1', startTime: date, subShard: 102, count: 3, errors: 1, wait: 10},
      {appId: 'test-app-1', startTime: date, subShard: 102, count: 3, errors: 1, wait: 10},
      {appId: 'test-app-2', startTime: date, subShard: 103, count: 3, errors: 1, wait: 10},
      {appId: 'test-app-2', startTime: date, subShard: 103, count: 3, errors: 1, wait: 10},
      {appId: 'test-app-2', startTime: date, subShard: 103, count: 3, errors: 1, wait: 10},
      {appId: 'test-app-2', startTime: date, subShard: 103, count: 3, errors: 1, wait: 10},
      {appId: 'test-app-3', startTime: date, subShard: 103, count: 3, errors: 1, wait: 10},
      {appId: 'test-app-3', startTime: date, subShard: 103, count: 3, errors: 1, wait: 10},
      {appId: 'test-app-3', startTime: date, subShard: 103, count: 3, errors: 1, wait: 10},
      {appId: 'test-app-3', startTime: date, subShard: 103, count: 3, errors: 1, wait: 10},
      {appId: 'test-app-3', startTime: date, subShard: 103, count: 3, errors: 1, wait: 10},
      {appId: 'test-app-3', startTime: date, subShard: 103, count: 3, errors: 1, wait: 10},
      {appId: 'test-app-3', startTime: date, subShard: 103, count: 3, errors: 1, wait: 10},
      {appId: 'test-app-3', startTime: date, subShard: 103, count: 3, errors: 1, wait: 10}
    ];

    insertRawMetrics(metrics, db, function () {
      runMapReduce(db, function () {
        insertRawMetrics(metrics, db, 'rawSystemMetrics', function () {
          runMapReduce(db, afterMapReduce, '1min', 'system');
        });
      });
    });


    function afterMapReduce() {
      db.collection('prodStats').findOne({appId: 'test-app-1', metric: 'methodsMetrics'}, function (err, doc) {
        assert.equal(doc.count, 3);
        db.collection('prodStats').findOne({appId: 'test-app-2', metric: 'methodsMetrics'}, function (err, doc) {
          assert.equal(doc.count, 4);
          db.collection('prodStats').findOne({appId: 'test-app-3', metric: 'methodsMetrics'}, function (err, doc) {
            assert.equal(doc.count, 8);
            db.collection('prodStats').findOne({appId: 'test-app-1', metric: 'systemMetrics'}, function (err, doc) {
              assert.equal(doc.count, 3);
              db.collection('prodStats').findOne({appId: 'test-app-2', metric: 'systemMetrics'}, function (err, doc) {
                assert.equal(doc.count, 4);
                db.collection('prodStats').findOne({appId: 'test-app-3', metric: 'systemMetrics'}, function (err, doc) {
                  assert.equal(doc.count, 8);
                  done();
                });
              });
            });
          });
        });
      });
    }
  }));

  test('multiple-apps-multiple-records-multiple-collections-multiple-profiles', clean( function (db, done) {
    var date = new Date();

    var metrics = [
      {appId: 'test-app-1', startTime: date, subShard: 102, count: 3, errors: 1, wait: 10},
      {appId: 'test-app-1', startTime: date, subShard: 102, count: 3, errors: 1, wait: 10},
      {appId: 'test-app-1', startTime: date, subShard: 102, count: 3, errors: 1, wait: 10},
      {appId: 'test-app-2', startTime: date, subShard: 103, count: 3, errors: 1, wait: 10},
      {appId: 'test-app-2', startTime: date, subShard: 103, count: 3, errors: 1, wait: 10},
      {appId: 'test-app-2', startTime: date, subShard: 103, count: 3, errors: 1, wait: 10},
      {appId: 'test-app-2', startTime: date, subShard: 103, count: 3, errors: 1, wait: 10},
      {appId: 'test-app-3', startTime: date, subShard: 103, count: 3, errors: 1, wait: 10},
      {appId: 'test-app-3', startTime: date, subShard: 103, count: 3, errors: 1, wait: 10},
      {appId: 'test-app-3', startTime: date, subShard: 103, count: 3, errors: 1, wait: 10},
      {appId: 'test-app-3', startTime: date, subShard: 103, count: 3, errors: 1, wait: 10},
      {appId: 'test-app-3', startTime: date, subShard: 103, count: 3, errors: 1, wait: 10},
      {appId: 'test-app-3', startTime: date, subShard: 103, count: 3, errors: 1, wait: 10},
      {appId: 'test-app-3', startTime: date, subShard: 103, count: 3, errors: 1, wait: 10},
      {appId: 'test-app-3', startTime: date, subShard: 103, count: 3, errors: 1, wait: 10}
    ];

    insertRawMetrics(metrics, db, function () {
      runMapReduce(db, function () {
        runMapReduce(db, function () {
          insertRawMetrics(metrics, db, 'rawSystemMetrics', function () {
            runMapReduce(db, function () {
              runMapReduce(db, afterMapReduce, '30min', 'system');
            }, '1min', 'system');
          });
        }, '30min');
      });
    });


    function afterMapReduce() {
      db.collection('prodStats').findOne({appId: 'test-app-1', metric: 'methodsMetrics', res: '1min'}, function (err, doc) {
        assert.equal(doc.count, 3);
        db.collection('prodStats').findOne({appId: 'test-app-2', metric: 'methodsMetrics', res: '1min'}, function (err, doc) {
          assert.equal(doc.count, 4);
          db.collection('prodStats').findOne({appId: 'test-app-3', metric: 'methodsMetrics', res: '1min'}, function (err, doc) {
            assert.equal(doc.count, 8);
            db.collection('prodStats').findOne({appId: 'test-app-1', metric: 'methodsMetrics', res: '30min'}, function (err, doc) {
              assert.equal(doc.count, 1);
              db.collection('prodStats').findOne({appId: 'test-app-2', metric: 'methodsMetrics', res: '30min'}, function (err, doc) {
                assert.equal(doc.count, 1);
                db.collection('prodStats').findOne({appId: 'test-app-3', metric: 'methodsMetrics', res: '30min'}, function (err, doc) {
                  assert.equal(doc.count, 1);
                  db.collection('prodStats').findOne({appId: 'test-app-1', metric: 'systemMetrics', res: '1min'}, function (err, doc) {
                    assert.equal(doc.count, 3);
                    db.collection('prodStats').findOne({appId: 'test-app-2', metric: 'systemMetrics', res: '1min'}, function (err, doc) {
                      assert.equal(doc.count, 4);
                      db.collection('prodStats').findOne({appId: 'test-app-3', metric: 'systemMetrics', res: '1min'}, function (err, doc) {
                        assert.equal(doc.count, 8);
                        db.collection('prodStats').findOne({appId: 'test-app-1', metric: 'systemMetrics', res: '30min'}, function (err, doc) {
                          assert.equal(doc.count, 1);
                          db.collection('prodStats').findOne({appId: 'test-app-2', metric: 'systemMetrics', res: '30min'}, function (err, doc) {
                            assert.equal(doc.count, 1);
                            db.collection('prodStats').findOne({appId: 'test-app-3', metric: 'systemMetrics', res: '30min'}, function (err, doc) {
                              assert.equal(doc.count, 1);
                              done();
                            });
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    }
  }));

  test('close mocha-mongo connection', clean(function(db, done) {
    db.close();  // Just close the mongodb connection through the mocha-mongo handle.
    done();
  }));

});


function insertRawMetrics(data, db, collName, callback) {
  if (typeof collName === 'function') {
    callback = collName;
    collName = 'rawMethodsMetrics';
  }

  var insertableData = [];
  for (var i = 0; i < data.length; i++) {
    data[i].appId = data[i].appId || 'the-app-id';
    data[i].host = data[i].host || 'the-host';
    data[i].name = data[i].name || 'methodName';
    insertableData.push({value: data[i]});
  }
  db.collection(collName).insertMany(insertableData, function (err, result) {
    callback();
  });
}

//--------- Helper Functions --------

function runMapReduce(db, callback, profileName, providerName) {
  profileName = profileName || '1min';
  providerName = providerName || 'methods';

  var command = util.format(
    'ONLY_ONCE=1 MONGO_SHARD=one MONGO_URL=mongodb://localhost/%s PROFILE=%s PROVIDER=%s ./start.sh',
    db.databaseName,
    profileName,
    providerName
  );

  exec(command, {cwd: './test/rma/'}, function (err, stdout, stderr) {
    if (err) {
      console.log('-----------------------STDOUT-----------------');
      console.log(stdout);
      console.log('-----------------------STDERR-----------------');
      console.log(stderr);
      console.log('ERROR to be thrown: ' + err);
      throw err;
    }
    // console.log(stdout, stderr);
    callback();
  });
}
