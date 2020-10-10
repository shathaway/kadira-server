// mongo-sharded-cluster
// Now has breaking changes to support mongodb v3.0 and newer
// The shard map now has conn (the client handle) and dbase (the database descriptor)
//
// significant change: Now handles options object.
// MongoShardedCluster.initFromEnv(<options>.<callback>)
// The <callback> is in the form of function(error,cluster)
// where previous library could not pass the <options>
//
// Upgrade from mongodb@2.x to mongodb@3.0 requires that addShard
// should be modified to save the Db handle instead of the Client handle.
// mongodb@2.x returned a Db handle for the MongoClient.connect(url).
// mongodb@3.x returns a client handle for MongoClient.connect(url) with a default database reference.
//
//
//  self._shardMap[name] = {
//    conn: conn,   // mongodb v3 - client handle - mongodb v2 - combined client + database
//    dbase: dbase, // mongodb v3 - database handle
//    size: null,
//    name: name
//  };
//

var async = require('async');
var _ = require('underscore');
var MongoClient = require('mongodb').MongoClient;

module.exports = MongoShardedCluster = function(options) {
  options = options || {};
  this._lookupInterval = options.lookupInterval || 1000 * 30; //30 secs
  
  this._shardMap = {};
  this._stopped = false;
  this._started = false;
  this._lookupDbSize = this._lookupDbSize.bind(this);
};

// mongodb v3 separates connection and database handles

MongoShardedCluster.prototype.addShard = function(name, conn, dbase) {
  var self = this;

  if(self._shardMap[name]) {
    throw new Error("Shard exists: " + name);
  }
  self._shardMap[name] = {
    conn: conn,
    dbase: dbase,
    size: null,
    name: name
  }
};

MongoShardedCluster.prototype.getDatabase = function(name) {
  var shardInfo = this._shardMap[name];
  if(!shardInfo) {
    throw new Error("Shard does not exists: " + name);
  }

  return shardInfo.dbase;
};

MongoShardedCluster.prototype.getConnection = function(name) {
  var shardInfo = this._shardMap[name];
  if(!shardInfo) {
    throw new Error("Shard does not exists: " + name);
  }

  return shardInfo.conn;
};

MongoShardedCluster.prototype.pickShard = function() {
  if(!this._started || this._stopped) {
    throw new Error("Dbsize lookup is not running yet!");
  }

  var lowestSizedShard = null;
  _.each(this._shardMap, function(shardInfo) {
    if(!lowestSizedShard) {
      lowestSizedShard = shardInfo;
      return;
    }

    if(lowestSizedShard.size > shardInfo.size) {
      lowestSizedShard = shardInfo;
    }
  });

  return lowestSizedShard.name;
};

MongoShardedCluster.prototype.startDbSizeLookup = function(callback) {
  callback = _.once(callback || function() {});
  var self = this;
  if(self._started) {
    throw new Error("Already started");
  }
  self._started = true;

  function startLookup() {
    if(self._stopped) {
      return;
    }

    var shardInfoList = _.values(self._shardMap);
    var startTime = Date.now();
    async.each(shardInfoList, self._lookupDbSize, function(err) {
      if(err) {
        console.warn("WARN - failed dbsize lookup:", err.message);
      }
      var timeTaken = Date.now() - startTime;
      var intervalTime = self._lookupInterval - timeTaken;
      intervalTime = (intervalTime < 0)? 0 : intervalTime;

      // we don't wanna send the error since it has no meaning here
      callback();
      setTimeout(startLookup, intervalTime);
    });
  }

  startLookup();
};

// mongodb v3 separates connection and database handles

MongoShardedCluster.prototype._lookupDbSize = function(shardInfo, done) {
  var self = this;
  shardInfo.dbase.command({dbStats: 1, scale: 1}, function(err, stat) {
    if(stat) {
      shardInfo.size = stat.dataSize + stat.indexSize;
    }
  
    done(err);
  });
};

MongoShardedCluster.prototype.stop = function() {
  this._stopped = true;
};

MongoShardedCluster.initFromEnv = function(options, callback) {
  var opts = {};
  if ('object' == typeof options) {
    opts = options;
  } else {
    callback = options;
  }

  var mongoCluster = new MongoShardedCluster(opts);
  var envKeys = _.keys(process.env);

  async.each(envKeys, function(key, done) {
    var regExp = /^MONGO_SHARD_URL_(.*)/;
    var matched = key.match(regExp);
    if(matched) {
      var shardName = matched[1];
      var mongoUrl = process.env[key];
      MongoClient.connect(mongoUrl, opts, function(err, conn) {
        if(conn) {
// mongodb v2
//          mongoCluster.addShard(shardName, conn);
// mongodb v3
//          mongoCluster.addShard(shardName, client, dbase);
// combined fix - this assumes that mongoUrl supplies a default database name.
          var client = conn;
          var dbase = client.db()
          mongoCluster.addShard(shardName, client, dbase);
        }
        done(err);
      });
    } else {
      done();
    }
  }, function(err) {
    if(err) {
      callback(err);
      return;
    }

    var shards = _.keys(mongoCluster._shardMap).join(", ");
    console.log("Initialized Mongo Sharded Cluster for shards:", shards);
    callback(null, mongoCluster);
  });
};
