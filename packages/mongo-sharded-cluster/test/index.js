// mongo test suite updated to support MongoDb v3.0 and newer
// mongo-sharded-cluster has breaking changes. Now requires mongodb v3 and newer

var MongoShardedCluster = require('../lib/index.js');
var mongo = require("mocha-mongo")("mongodb://localhost/easy-shard");
var drop = mongo.drop();
var assert = require('assert');

describe("MongoShardedCluster", function() {
  describe("_lookupDbSize", function() {
    it("should look the db and store dbsize", drop(function(db, done) {
      var es = new MongoShardedCluster();
      var shardInfo = {dbase: db, size: null};

      db.collection('abc').insert({aa: 10}, function(err) {
        assert.ifError(err);
        es._lookupDbSize(shardInfo, function(err) {
          assert.ifError(err);
          assert.equal(shardInfo.size > 0, true);
          done();
        });
      });
    }));
  })

// Updated addShard for mongodb v3.0
  describe("startDbSizeLookup", function() {
    it("should lookup db size", drop(function(db, done) {
      var es = new MongoShardedCluster();
      es.addShard("s1", {}, db);
      es.addShard("s2", {}, db);

      db.collection('abc').insert({aa: 10}, function(err) {
        assert.ifError(err);
        es.startDbSizeLookup();
        setTimeout(function() {
          assert.equal(es._shardMap["s1"].size > 0, true);
          assert.equal(es._shardMap["s2"].size > 0, true);
          es.stop();
          done();
        }, 200);
      });
    }));

// Updated addShard for mongodb 3.0
    it("should poll for the dbsize continously", function(done) {
      var es = new MongoShardedCluster({lookupInterval: 100});
      es.addShard("s1", {}, {});
      var count = 0;
      es._lookupDbSize = function(shardInfo, done) {
        count++;
        done();
      };
      es.startDbSizeLookup();

      setTimeout(function() {
        assert.equal(count, 5);
        done();
        es.stop();
      }, 450);
    });

    it("should fire the callback only once", function(done) {
      var es = new MongoShardedCluster({lookupInterval: 100});
      es.addShard("s1", {});
      es._lookupDbSize = function(shardInfo, done) {
        done();
      };

      var count = 0;
      es.startDbSizeLookup(function() {
        count++;
      });

      setTimeout(function() {
        assert.equal(count, 1);
        done();
        es.stop();
      }, 450);
    });
  })

  describe("getConnection", function() {
    it("should give the registerded connection", function(done) {
      var es = new MongoShardedCluster();
      var conn = {};
      es.addShard("s1", conn);
      var c = es.getConnection("s1");
      assert.equal(c, conn);
      done();
    });

    it("should throw an error when there is no shard", function(done) {
      var es = new MongoShardedCluster();
      try{
        es.getConnection("s1");
      } catch(ex) {
        done();
      }
    });
  });

  describe("pickShard", function() {
    it("should pick the minimum sized shard", function(done) {
      var es = new MongoShardedCluster();
      es._started = true;
      es._shardMap["s1"] = {name: "s1", size: 10};
      es._shardMap["s2"] = {name: "s2", size: 1};
      es._shardMap["s3"] = {name: "s3", size: 100};

      var shardName = es.pickShard();
      assert.equal(shardName, "s2");
      done();
    });

    it("should throw an error, if not started", function(done) {
      var es = new MongoShardedCluster();
      try {
        es.pickShard();
      } catch(ex) {
        done();
      }
    });
  });

  describe("initFromEnv", function() {
    it("should init from the give env vars", function(done) {
      process.env["MONGO_SHARD_URL_one"] = "mongodb://localhost/easy-shard";
      process.env["MONGO_SHARD_URL_two"] = "mongodb://localhost/easy-shard";

      MongoShardedCluster.initFromEnv(function(err, cluster) {
        assert.ifError(err);
        assert.ok(cluster.getConnection("one"));
        assert.ok(cluster.getConnection("two"));

        delete process.env["MONGO_SHARD_URL_one"];
        delete process.env["MONGO_SHARD_URL_two"];
        done();
      });
    });
  });

// Add Cleanup Activity - not currently serviceable
//
//  describe("cleanup the network", function() {
//    it("close the mongodb connection", function(done) {
//      mongo.drop();
//      mongo.close();
//      done();
//    });
//  });

});

// The test suite remains hung since there is an active mongodb tcp connection.
