module.exports = StateManager = {};

StateManager.setState = function(db, app, state, callback) {
  var appsCollection = db.collection('apps');

// DIAGNOSTIC
//console.log('DIAGNOSTIC - StateManager entered');

  if(app && !app[state]) {
    var appId = app._id;
    var updateFields = {};
    updateFields[state] = Date.now();  // this is an integer value instead of IDODate()

//  Unlike other dates in the kadira APM system, the StateManager does not set ISODate()
//
//  mongodb v3.0 deprecated .update() - try using .updateOne() or .updateMany()
//  Try to revert back to update - test fails using newer .updateOne() or .updateMany()
//  Leave deprecated - otherwise mocha regression tests fail.
//
//  The 'apps' collection may have multiple records per appId. One entry per shard/subshard pair.
//  We should possibly use updateMany replacement.

    appsCollection.update({_id: appId}, {$set: updateFields}, afterUpdated);
  } else {

// DIAGNOSTIC
//console.log('No App State (' + state + ') update required');

    if(callback) callback();
  }

  function afterUpdated(err) {
    if(err) {
      //todo: do the error handling and re-try logic
      console.error('error on setting ' + state +' for app:', {appId: appId, error: err.message});
    }

    if(callback) callback(err);
  }
};
