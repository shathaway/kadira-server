// Updated for new version of mongo-sharded-cluster and mongodb-v3.x
// Now using metricsCluster.getDatabase instead of metricsCluster.getConnection

module.exports = function(collectionName, metricsCluster) {
  return function(app, data, callback) {
    var db = metricsCluster.getDatabase(app.shard);
    db.collection(collectionName).insert(data, function(err, result) {
      if (err) {
        //todo: do the error handling and re-try logic
        console.log('error when inserting to collection: ', collectionName,
          " - error: ", err.toString());
      }
      if(callback) callback(err);
    });
  }
};
